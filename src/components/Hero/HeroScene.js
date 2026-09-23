import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * A persistent three.js scene for the smartphone hero.
 *
 * Responsibilities:
 *  - Own a single renderer / scene / camera / lights for the component lifetime.
 *  - Lazy-load GLB models and cache them; swap the active model with a crossfade.
 *  - Expose an imperative `applyState` so GSAP-driven scroll progress can position,
 *    rotate and scale the phone continuously.
 *  - Dispose all GPU resources on teardown to avoid memory leaks.
 *
 * The scene is intentionally framework-agnostic (no r3f/drei) so it can be reused
 * or extracted independently later.
 */

const BASE_CAM_Z = 6.2;

const SCREEN_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

const SCREEN_FRAGMENT_SHADER = `
  uniform sampler2D uCurrent;
  uniform sampler2D uNext;
  uniform float uProgress;
  uniform float uDirection;

  varying vec2 vUv;

  void main() {
    // Correct Object_7 UV orientation.
    // Keeps the uploaded banner horizontal and upright.
    vec2 uv = vec2(
      vUv.y,
      1.0 - vUv.x
    );

    float progress = clamp(uProgress, 0.0, 1.0);

    vec2 currentUv =
      uv - vec2(progress * uDirection, 0.0);

    vec2 nextUv =
      uv - vec2((progress - 1.0) * uDirection, 0.0);

    bool currentVisible =
      currentUv.x >= 0.0 &&
      currentUv.x <= 1.0;

    bool nextVisible =
      nextUv.x >= 0.0 &&
      nextUv.x <= 1.0;

    vec4 currentColor = vec4(0.0);
    vec4 nextColor = vec4(0.0);

    if (currentVisible) {
      currentColor =
        texture2D(uCurrent, currentUv);
    }

    if (nextVisible) {
      nextColor =
        texture2D(uNext, nextUv);
    }

    if (nextVisible) {
      gl_FragColor = nextColor;
    } else {
      gl_FragColor = currentColor;
    }
  }
`;

export class HeroScene {
  renderer;
  scene;
  camera;
  pmrem;
  envTexture = null;

  pivot; // holds the active model, receives scroll transforms
  loader;
  models = new Map();
  activeId = null;

  // --------------------------------------------------
  // iPAD SCREEN
  // --------------------------------------------------

  screenMesh = null;

  screenTextureLoader = new THREE.TextureLoader();
  screenMaterial = null;

  screenCurrentTexture = null;
  screenNextTexture = null;

  screenTextures = new Map();

  screenImages = [];

  screenUVNormalized = false;
  currentScreenIndex = 0;

  screenDragOffset = 0;

  screenDragTarget = 0;
  screenDragDisplayed = 0;

  screenDragDirection = 1;

  screenSlideAnimating = false;
  screenSlideAnimationStart = 0;
  screenSlideAnimationFrom = 0;
  screenSlideAnimationTo = 0;
  screenSlideAnimationDirection = 1;

  raf = 0;
  running = false;
  needsRender = true; // render-on-demand; flipped true while transitioning
  disposed = false;

  state = { posX: 0, posY: 0, rotY: 0, scale: 1, camZ: 0, rotZ: 0 };
  crossfade = {
    from: null,
    t: 0,
    active: false,
  };

  /** Optional diagnostic sink used to surface runtime status in the UI. */
  onDiag = undefined;

  width = 1;
  height = 1;

  responsiveScale = 1;
  responsiveCamOffset = 0;
  responsiveY = 0;

  setScreenImages(images = []) {
    const normalized = Array.from(
      new Set(
        images
          .map((image) => {
            if (typeof image === "string") {
              return image.trim();
            }

            return (
              image?.image_url ||
              image?.url ||
              image?.secure_url ||
              ""
            ).trim();
          })
          .filter(Boolean),
      ),
    );

    this.screenImages = normalized;
    this.screenSlideAnimating = false;
    this.screenDragOffset = 0;
    this.screenDragTarget = 0;
    this.screenDragDisplayed = 0;

    if (!this.screenImages.length) {
      this.currentScreenIndex = 0;
      this.screenCurrentTexture = null;
      this.screenNextTexture = null;

      if (this.screenMaterial) {
        this.screenMaterial.uniforms.uCurrent.value = null;
        this.screenMaterial.uniforms.uNext.value = null;
        this.screenMaterial.uniforms.uProgress.value = 0;
      }

      for (const texture of this.screenTextures.values()) {
        texture.dispose();
      }
      this.screenTextures.clear();

      this.needsRender = true;
      this.ensureRunning();
      return;
    }

    if (this.currentScreenIndex >= this.screenImages.length) {
      this.currentScreenIndex = 0;
    }

    for (const [url, texture] of this.screenTextures.entries()) {
      if (!this.screenImages.includes(url)) {
        texture.dispose();
        this.screenTextures.delete(url);
      }
    }

    if (this.screenMesh && this.screenMaterial) {
      void this.setScreenImage(this.currentScreenIndex);
    }

    this.needsRender = true;
    this.ensureRunning();
  }

  async setScreenImage(index) {
    if (!this.screenMesh) return;
    if (!this.screenImages.length) return;

    // Wrap around the dynamic banner list.

    // 0 <- 3 <- 2 <- 1 <- 0
    const normalizedIndex =
      ((index % this.screenImages.length) + this.screenImages.length) %
      this.screenImages.length;

    const src = this.screenImages[normalizedIndex];

    const nextIndex = (normalizedIndex + 1) % this.screenImages.length;

    const nextSrc = this.screenImages[nextIndex];

    // -----------------------------------------
    // NORMALIZE OBJECT_7 UVs ONCE
    // -----------------------------------------

    if (!this.screenUVNormalized) {
      const geometry = this.screenMesh.geometry;
      const uv = geometry.attributes.uv;

      if (uv) {
        let minU = Infinity;
        let maxU = -Infinity;
        let minV = Infinity;
        let maxV = -Infinity;

        for (let i = 0; i < uv.count; i++) {
          const u = uv.getX(i);
          const v = uv.getY(i);

          minU = Math.min(minU, u);
          maxU = Math.max(maxU, u);

          minV = Math.min(minV, v);
          maxV = Math.max(maxV, v);
        }

        const uvWidth = maxU - minU;
        const uvHeight = maxV - minV;

        if (uvWidth > 0 && uvHeight > 0) {
          for (let i = 0; i < uv.count; i++) {
            const u = uv.getX(i);
            const v = uv.getY(i);

            uv.setXY(i, (u - minU) / uvWidth, (v - minV) / uvHeight);
          }

          uv.needsUpdate = true;
        }
      }

      this.screenUVNormalized = true;
    }

    // -----------------------------------------
    // LOAD / CACHE TEXTURE
    // -----------------------------------------

    let texture = this.screenTextures.get(src);

    if (!texture) {
      texture = await this.screenTextureLoader.loadAsync(src);

      texture.colorSpace = THREE.SRGBColorSpace;

      texture.anisotropy = Math.min(
        8,
        this.renderer.capabilities.getMaxAnisotropy(),
      );

      texture.wrapS = THREE.ClampToEdgeWrapping;

      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Rotation is now handled inside the screen shader.
      texture.rotation = 0;

      texture.center.set(0.5, 0.5);

      texture.offset.set(0, 0);

      this.screenTextures.set(src, texture);
    }

    let nextTexture = this.screenTextures.get(nextSrc);

    if (!nextTexture) {
      nextTexture = await this.screenTextureLoader.loadAsync(nextSrc);

      nextTexture.colorSpace = THREE.SRGBColorSpace;

      nextTexture.anisotropy = Math.min(
        8,
        this.renderer.capabilities.getMaxAnisotropy(),
      );

      nextTexture.wrapS = THREE.ClampToEdgeWrapping;

      nextTexture.wrapT = THREE.ClampToEdgeWrapping;

      nextTexture.center.set(0.5, 0.5);
      nextTexture.rotation = 0;

      this.screenTextures.set(nextSrc, nextTexture);
    }

    // -----------------------------------------
    // APPLY
    // -----------------------------------------

    if (!this.screenMaterial) return;

    this.screenCurrentTexture = texture;
    this.screenNextTexture = nextTexture;

    this.screenMaterial.uniforms.uCurrent.value = this.screenCurrentTexture;

    this.screenMaterial.uniforms.uNext.value = this.screenNextTexture;

    this.screenMaterial.uniforms.uProgress.value = 0;

    this.screenMaterial.uniforms.uDirection.value = -1;

    this.currentScreenIndex = normalizedIndex;

    this.needsRender = true;
    this.ensureRunning();
  }

  getScreenSlideCount() {
    return this.screenImages.length;
  }

  getScreenSlideIndex() {
    return this.currentScreenIndex;
  }

  setScreenDrag(offset) {
    if (!this.screenMesh || !this.screenMaterial) return;
    if (!this.screenImages.length) return;
    if (this.screenImages.length < 2) return;
    if (this.screenSlideAnimating) return;

    const clamped = THREE.MathUtils.clamp(offset, -1, 1);

    this.screenDragOffset = clamped;
    this.screenDragTarget = clamped;

    if (clamped !== 0) {
      this.screenDragDirection = clamped < 0 ? 1 : -1;
    }

    this.screenMaterial.uniforms.uDirection.value = this.screenDragDirection;

    this.needsRender = true;
    this.ensureRunning();
  }

  async commitScreenSlide(direction) {
    if (!this.screenMesh || !this.screenMaterial) return;
    if (this.screenSlideAnimating) return;
    if (!this.screenImages.length) return;
    if (this.screenImages.length < 2) return;

    const count = this.screenImages.length;

    const nextIndex = (this.currentScreenIndex + direction + count) % count;

    const progress = Math.abs(this.screenDragDisplayed);

    this.screenSlideAnimating = true;

    this.screenSlideAnimationStart = performance.now();

    this.screenSlideAnimationFrom = progress;

    this.screenSlideAnimationTo = 1;

    this.screenSlideAnimationDirection = direction;

    const targetIndex = (this.currentScreenIndex + direction + count) % count;

    const targetSrc = this.screenImages[targetIndex];

    let targetTexture = this.screenTextures.get(targetSrc);

    if (!targetTexture) {
      targetTexture = await this.screenTextureLoader.loadAsync(targetSrc);

      targetTexture.colorSpace = THREE.SRGBColorSpace;

      targetTexture.anisotropy = Math.min(
        8,
        this.renderer.capabilities.getMaxAnisotropy(),
      );

      targetTexture.wrapS = THREE.ClampToEdgeWrapping;

      targetTexture.wrapT = THREE.ClampToEdgeWrapping;

      targetTexture.rotation = 0;

      this.screenTextures.set(targetSrc, targetTexture);
    }

    this.screenMaterial.uniforms.uNext.value = targetTexture;

    this.screenMaterial.uniforms.uDirection.value = direction;

    this.needsRender = true;
    this.ensureRunning();

    await new Promise((resolve) => {
      const check = () => {
        if (!this.screenSlideAnimating) {
          resolve();
          return;
        }

        requestAnimationFrame(check);
      };

      check();
    });

    this.currentScreenIndex = nextIndex;

    this.screenDragOffset = 0;
    this.screenDragTarget = 0;
    this.screenDragDisplayed = 0;

    await this.setScreenImage(nextIndex);
  }
  cancelScreenDrag() {
    if (!this.screenMesh || this.screenSlideAnimating) return;

    this.screenDragTarget = 0;

    this.needsRender = true;
    this.ensureRunning();
  }

  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = null; // let the CSS #322111 backdrop show through

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0.1, BASE_CAM_Z);
    this.camera.lookAt(0, 0, 0);

    // Subtle image-based lighting for realistic reflections without heavy assets.
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = new RoomEnvironment();
    this.envTexture = this.pmrem.fromScene(env, 0.04).texture;
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.45;

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    this.setupLights();

    this.loader = new GLTFLoader();
  }

  setupLights() {
    // --------------------------------------------------
    // SOFT AMBIENT
    // --------------------------------------------------

    const hemi = new THREE.HemisphereLight(0xfaf5f2, 0x2f2224, 0.28);

    this.scene.add(hemi);

    // --------------------------------------------------
    // LARGE SOFT KEY
    // --------------------------------------------------

    const key = new THREE.DirectionalLight(0xfaf5f2, 2.25);

    key.position.set(-4.5, 7.5, 5.5);

    key.castShadow = true;

    key.shadow.mapSize.set(2048, 2048);

    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 35;

    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -8;

    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.025;

    this.scene.add(key);

    // --------------------------------------------------
    // WARM FLOOR BOUNCE
    // --------------------------------------------------

    const fill = new THREE.DirectionalLight(0x66513d, 0.24);

    fill.position.set(4, 1.5, 4);

    this.scene.add(fill);

    // --------------------------------------------------
    // VERY SOFT BACK/RIM LIGHT
    // --------------------------------------------------

    const rim = new THREE.DirectionalLight(0xffffff, 0.5);

    rim.position.set(2, 2.5, -5);

    this.scene.add(rim);

    const screenLight = new THREE.RectAreaLight(0xfaf5f2, 2.5, 4.5, 2.5);

    screenLight.position.set(-2.5, 3.5, 4);

    screenLight.lookAt(0, 0, 0);

    this.scene.add(screenLight);
  }

  /** Prepare (lazy-load) a model by id/path without necessarily activating it. */
  preload(id, modelPath) {
    if (!modelPath) return Promise.resolve();
    if (this.models.has(id)) return Promise.resolve();

    const entry = { root: new THREE.Group(), loaded: false };
    this.models.set(id, entry);

    return new Promise((resolve) => {
      this.onDiag?.(`load-start ${id}`);
      // Fetch the GLB ourselves and hand the ArrayBuffer to GLTFLoader.parse.
      // This avoids GLTFLoader's internal FileLoader silently stalling under
      // some dev-server / bundler setups, and gives us real error surfaces.
      const url = new URL(modelPath, window.location.origin).href;
      this.onDiag?.(`fetch-begin ${id} ${url}`);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buffer) => {
          this.onDiag?.(`parse-start ${id} bytes=${buffer.byteLength}`);
          this.loader.parse(
            buffer,
            "",
            (gltf) => {
              this.onDiag?.(`load-cb ${id} disposed=${this.disposed}`);
              if (this.disposed) {
                resolve();
                return;
              }
              this.onModelLoaded(id, entry, gltf.scene);
              resolve();
            },
            (err) => {
              console.error("[HeroScene] parse failed", id, err);
              this.onDiag?.(
                `parse-error ${id}: ${err?.message ?? String(err)}`,
              );
              this.models.delete(id);
              resolve();
            },
          );
        })
        .catch((err) => {
          console.error("[HeroScene] fetch failed", id, err);
          this.onDiag?.(`fetch-error ${id}: ${err?.message ?? String(err)}`);
          this.models.delete(id);
          resolve();
        });
    });
  }

  /** Post-process a freshly parsed model group and attach it to its entry root. */
  onModelLoaded(id, entry, model) {
    const background = model.getObjectByName("Infinite_P");

    if (background?.parent) {
      background.parent.remove(background);
    }

    this.normalizeModel(model);

    model.traverse((o) => {
      const mesh = o;

      if (!mesh.isMesh) return;

      // --------------------------------------------------
      // MAIN iPAD BODY
      // --------------------------------------------------
      if (mesh.name === "Object_10") {
        const material = mesh.material;

        material.map = null;

        // Space Gray / dark aluminum
        material.color.set(0xf0ebe5);

        material.metalness = 0.85;
        material.roughness = 0.24;

        material.clearcoat = 0.18;
        material.clearcoatRoughness = 0.18;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // SCREEN
      // --------------------------------------------------
      else if (mesh.name === "Object_7") {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uCurrent: { value: null },
            uNext: { value: null },
            uProgress: { value: 0 },
            uDirection: { value: -1 },
          },

          vertexShader: SCREEN_VERTEX_SHADER,
          fragmentShader: SCREEN_FRAGMENT_SHADER,

          side: THREE.DoubleSide,
        });

        mesh.material = material;

        this.screenMaterial = material;
        this.screenMesh = mesh;

        void this.setScreenImage(0);
      }

      // --------------------------------------------------
      // APPLE LOGO
      // --------------------------------------------------
      else if (mesh.name === "Object_12") {
        const material = mesh.material;

        material.map = null;

        // Dark Apple logo
        material.color.set(0x494643);

        material.metalness = 0.7;
        material.roughness = 0.3;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // REAR CAMERA OUTER HOUSING
      // --------------------------------------------------
      else if (mesh.name === "Object_11") {
        const material = mesh.material;

        material.map = null;

        material.color.set(0x494643);

        material.metalness = 0.8;
        material.roughness = 0.25;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // REAR CAMERA INNER LENS / RING
      // --------------------------------------------------
      else if (mesh.name === "Object_9") {
        const material = mesh.material;

        material.map = null;

        material.color.set(0x000000);

        material.metalness = 0.89;
        material.roughness = 0.15;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // SMALL REAR SENSOR
      // --------------------------------------------------
      // SMALL REAR SENSOR
      else if (mesh.name === "Object_6") {
        const material = mesh.material;

        material.map = null;
        material.color.set(0x151515);

        material.metalness = 0.5;
        material.roughness = 0.25;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // THREE CONTACT DOTS
      // --------------------------------------------------
      // THREE CONTACT DOTS
      else if (mesh.name === "Object_5") {
        const material = mesh.material;

        material.map = null;
        material.color.set(0x8f8874);

        material.metalness = 0.85;
        material.roughness = 0.35;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }
      // --------------------------------------------------
      // REAR CAMERA LENS / GLASS
      // --------------------------------------------------
      else if (mesh.name === "Object_14") {
        const material = mesh.material;

        material.color.set(0x000000);

        material.metalness = 1;
        material.roughness = 0.15;

        // Subtle glass-like reflection
        material.clearcoat = 1;
        material.clearcoatRoughness = 0.75;

        material.transparent = false;
        material.opacity = 1;

        material.needsUpdate = true;
      }

      // --------------------------------------------------
      // OTHER STRUCTURAL PARTS
      // --------------------------------------------------
      else {
        const material = mesh.material;

        if (Array.isArray(material)) {
          material.forEach((mat) => {
            mat.needsUpdate = true;
          });
        } else if (material) {
          material.needsUpdate = true;
        }
      }
    });

    const dbg = new THREE.Box3().setFromObject(model);
    const dsize = new THREE.Vector3();
    dbg.getSize(dsize);

    console.info("[HeroScene] model loaded", id, "size=", dsize.toArray());

    this.onDiag?.(
      `loaded ${id} size=${dsize.x.toFixed(2)},${dsize.y.toFixed(2)},${dsize.z.toFixed(2)}`,
    );

    entry.root.add(model);
    entry.loaded = true;
    this.needsRender = true;
  }

  /** Center the model at origin and scale it to a consistent display height. */
  normalizeModel(model) {
    // Measure the model exactly as imported.
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();

    box.getSize(size);

    // Scale to a consistent display size.
    const targetHeight = 2.55;
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetHeight / maxDim;

    model.scale.setScalar(scale);

    // Center the actual geometry around the model origin.
    const center = new THREE.Vector3();
    box.getCenter(center);

    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }

  /**
   * Set the active model. Loads it first if needed (so there is no visible flash),
   * then crossfades from the previous model. Falls back gracefully if no GLB.
   */
  async setActiveModel(id, modelPath) {
    if (this.activeId === id) return;

    if (modelPath) {
      await this.preload(id, modelPath);
    }
    if (this.disposed) return;

    const next = this.models.get(id);
    const prevId = this.activeId;
    const prev = prevId ? this.models.get(prevId) : undefined;

    // If the next model has no GLB (placeholder), just detach current model.
    if (!next) {
      if (prev) this.pivot.remove(prev.root);
      this.activeId = id;
      this.needsRender = true;
      return;
    }

    // First model (no previous): show it solid immediately, no crossfade.
    if (!prev) {
      this.setGroupOpacity(next.root, 1);
      this.pivot.add(next.root);
      this.activeId = id;
      this.needsRender = true;
      this.ensureRunning();
      return;
    }

    // Attach next at 0 opacity, keep prev for crossfade.
    this.setGroupOpacity(next.root, 0);
    this.pivot.add(next.root);

    this.crossfade = {
      from: prev.root,
      t: 0,
      active: true,
    };
    this.activeId = id;
    this.needsRender = true;
    this.ensureRunning();
  }

  setGroupOpacity(group, opacity) {
    group.traverse((o) => {
      const mesh = o;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m) => {
          if (!m) return;
          m.transparent = opacity < 1;
          m.opacity = opacity;
          m.needsUpdate = true;
        });
      }
    });
  }

  stepCrossfade(delta) {
    if (!this.crossfade.active) return;
    this.crossfade.t = Math.min(1, this.crossfade.t + delta / 0.5); // ~0.5s
    const t = this.crossfade.t;
    const nextEntry = this.activeId
      ? this.models.get(this.activeId)
      : undefined;
    if (nextEntry) this.setGroupOpacity(nextEntry.root, t);
    if (this.crossfade.from) this.setGroupOpacity(this.crossfade.from, 1 - t);

    if (t >= 1) {
      if (this.crossfade.from) {
        this.pivot.remove(this.crossfade.from);
        this.setGroupOpacity(this.crossfade.from, 1); // reset for reuse
      }
      if (nextEntry) this.setGroupOpacity(nextEntry.root, 1);
      this.crossfade = { from: null, t: 0, active: false };
    }
    this.needsRender = true;
  }

  /** Apply scroll-driven scene state. Called from GSAP onUpdate. */
  applyState(state, spanX) {
    this.state = state;
    this.spanX = spanX;
    this.needsRender = true;
    this.ensureRunning();
  }

  spanX = 3;

  /** Free-spin idle rotation applied on top of scroll rotation when idle at center. */
  idleSpin = 0;

  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);

    // Responsive 3D layout
    if (this.width < 700) {
      this.responsiveScale = 0.7;
      this.responsiveCamOffset = 0.6;
      this.responsiveY = -0.18;
    } else if (this.width < 1000) {
      this.responsiveScale = 0.88;
      this.responsiveCamOffset = 0.35;
      this.responsiveY = 0;
    } else {
      this.responsiveScale = 1;
      this.responsiveCamOffset = 0;
      this.responsiveY = 0;
    }

    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.needsRender = true;
  }

  visible = true;

  ensureRunning() {
    if (!this.running && !this.disposed && this.visible) {
      this.running = true;
      this.lastTime = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  lastTime = 0;

  tick = (now) => {
    if (this.disposed) return;
    const delta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Apply current transform to the pivot.
    this.pivot.position.x = this.state.posX;
    this.pivot.position.y = this.state.posY + this.responsiveY;
    this.pivot.rotation.y = this.state.rotY;
    this.pivot.rotation.z = this.state.rotZ;
    this.pivot.scale.setScalar(this.state.scale * this.responsiveScale);

    this.camera.position.z =
      BASE_CAM_Z + this.state.camZ + this.responsiveCamOffset;

    this.stepCrossfade(delta);

    if (this.screenMaterial) {
      if (this.screenSlideAnimating) {
        const elapsed = performance.now() - this.screenSlideAnimationStart;

        const duration = 420;

        const progress = THREE.MathUtils.clamp(elapsed / duration, 0, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        this.screenDragDisplayed = THREE.MathUtils.lerp(
          this.screenSlideAnimationFrom,
          this.screenSlideAnimationTo,
          eased,
        );

        this.screenMaterial.uniforms.uProgress.value = Math.abs(
          this.screenDragDisplayed,
        );

        this.screenMaterial.uniforms.uDirection.value =
          this.screenSlideAnimationDirection;

        if (progress >= 1) {
          this.screenSlideAnimating = false;
          this.screenDragDisplayed = this.screenSlideAnimationTo;
        }
      } else {
        this.screenDragDisplayed = THREE.MathUtils.lerp(
          this.screenDragDisplayed,
          this.screenDragTarget,
          0.22,
        );

        this.screenMaterial.uniforms.uProgress.value = Math.abs(
          this.screenDragDisplayed,
        );

        this.screenMaterial.uniforms.uDirection.value =
          this.screenDragDirection;

        if (
          Math.abs(this.screenDragDisplayed - this.screenDragTarget) < 0.001
        ) {
          this.screenDragDisplayed = this.screenDragTarget;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);

    const screenAnimating =
      this.screenMaterial &&
      (this.screenSlideAnimating ||
        Math.abs(this.screenDragDisplayed - this.screenDragTarget) >= 0.001);

    const shouldContinue =
      this.visible &&
      (this.needsRender || this.crossfade.active || screenAnimating);

    this.needsRender = false;

    if (shouldContinue) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
    }
  };

  /** Pause/resume the render loop based on on-screen visibility (perf). */
  setVisible(visible) {
    if (this.visible === visible) return;
    this.visible = visible;
    if (visible) this.ensureRunning();
  }

  /** Force one render (used after resize or state change outside GSAP). */
  requestRender() {
    this.needsRender = true;
    this.ensureRunning();
  }

  dispose() {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.running = false;

    this.models.forEach((entry) => {
      entry.root.traverse((o) => {
        const mesh = o;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((m) => {
            if (!m) return;
            Object.values(m).forEach((val) => {
              if (val instanceof THREE.Texture) val.dispose();
            });
            m.dispose();
          });
        }
      });
    });
    this.models.clear();

    this.screenTextures.forEach((texture) => texture.dispose());
    this.screenTextures.clear();
    this.screenCurrentTexture = null;
    this.screenNextTexture = null;

    this.envTexture?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}

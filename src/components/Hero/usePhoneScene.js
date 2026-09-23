import { useEffect, useRef, useState } from 'react';
import { HeroScene } from './HeroScene';
import { computeSceneState } from './animations';

/**
 * Binds a persistent {@link HeroScene} to a canvas element and manages its full
 * lifecycle: creation, initial model load, resize observation, and disposal.
 *
 * Returns a stable ref object exposing imperative methods the parent can call
 * from GSAP callbacks and carousel handlers without triggering React re-renders.
 */

export function usePhoneScene(
  canvasRef,
  containerRef,
  screenImages = [],
) {
  const sceneRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [diag, setDiag] = useState('init');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      setDiag(
        `refs-null canvas=${!!canvas} container=${!!container}`,
      );
      return;
    }

    setDiag('effect-entered');

    let scene;

    try {
      scene = new HeroScene(canvas);
    } catch (e) {
      setDiag(
        `scene-ctor-error: ${e?.message ?? String(e)}`,
      );
      setReady(true);
      return;
    }

    scene.onDiag = (m) => setDiag(m);
    sceneRef.current = scene;

    // Give the scene the current Admin-managed Hero images immediately.
    scene.setScreenImages(screenImages);

    const initialSpanX =
      window.innerWidth < 768
        ? 1.2
        : window.innerWidth < 1200
          ? 2.4
          : 3.2;

    const applySize = () => {
      const rect = container.getBoundingClientRect();

      scene.resize(rect.width, rect.height);

      if (rect.width < 2 || rect.height < 2) {
        setDiag(
          `canvas-size ${Math.round(rect.width)}x${Math.round(rect.height)}`,
        );
      }

      // Re-assert the p=0 pose so the phone is visible immediately on any resize.
      scene.applyState(
        scene.state,
        initialSpanX,
      );
    };

    applySize();

    // Establish the initial p=0 pose right away (far-left, front-facing).
    scene.applyState(
      computeSceneState(0, initialSpanX),
      initialSpanX,
    );

    // Load the iPad model, then reveal and force a render.
    scene
      .setActiveModel(
        'ipad-air-5',
        '/models/ipad_air_5_free.glb',
      )
      .then(() => {
        scene.applyState(
          computeSceneState(0, initialSpanX),
          initialSpanX,
        );

        scene.requestRender();
        setReady(true);
      })
      .catch(() => setReady(true));

    const ro = new ResizeObserver(applySize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the Three.js scene synchronized when Admin banners finish loading.
  useEffect(() => {
    if (!sceneRef.current) return;

    sceneRef.current.setScreenImages(screenImages);
  }, [screenImages]);

  const apiRef = useRef({
    applyState: (state, spanX) =>
      sceneRef.current?.applyState(state, spanX),

    setScreenImage: async (index) => {
      await sceneRef.current?.setScreenImage(index);
    },

    setScreenDrag: (offset) =>
      sceneRef.current?.setScreenDrag(offset),

    commitScreenSlide: async (direction) => {
      await sceneRef.current?.commitScreenSlide(direction);
    },

    cancelScreenDrag: () =>
      sceneRef.current?.cancelScreenDrag(),

    getScreenSlideCount: () =>
      sceneRef.current?.getScreenSlideCount() ?? 0,

    getScreenSlideIndex: () =>
      sceneRef.current?.getScreenSlideIndex() ?? 0,

    ready: false,
    diag: 'init',
  });

  apiRef.current.ready = ready;
  apiRef.current.diag = diag;

  return apiRef.current;
}

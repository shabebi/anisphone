/**
 * Central choreography math for the hero.
 *
 * A single scroll progress value `p` in [0, 1] drives the entire transformation.
 * Both the 3D scene and the surrounding UI read from these helpers so the phone
 * movement, rotation, scale, camera and cards feel like ONE continuous motion
 * rather than independent animations.
 */

/** Premium, decisive ease-out (no bounce/elastic). Mirrors cubic-bezier(0.16,1,0.3,1). */
export const easeOutExpo = (t) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** Smooth, symmetric acceleration/deceleration. */
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Remap p from [inMin,inMax] to [0,1] then clamp. */
export const remap = (p, inMin, inMax) =>
  clamp01((p - inMin) / (inMax - inMin));

/**
 * Layout-aware left position: the phone starts toward the far left but must never
 * touch the edge. `spanX` is the half-width of usable horizontal world space.
 */
export function computeSceneState(p, spanX, viewportWidth) {
  const progress = clamp01(p);

  // Move from the left side toward the center,
  // but keep the movement subtle.
  const travel = easeInOutCubic(progress);

  const startX = -1.05;
  const endX = -0.39 * spanX;

  const posX = 0;

  // Back → side → front.
  // The iPad starts with its back facing the camera
  // and finishes with its screen facing the camera.
  const rotProgress = easeInOutCubic(
    remap(progress, 0.15, 0.78),
  );

  const rotY = (1 - rotProgress) * Math.PI;
  const rotZ = (rotProgress * -Math.PI) / 2;

  // Keep the iPad vertically stable.
  // We can fine-tune this later once the rotation is correct.
  const positionProgress = easeInOutCubic(
    remap(progress, 0.15, 0.78),
  );

  const posY = 0;

  // Small screens need a much gentler final zoom.
// Otherwise the iPad exceeds the viewport horizontally.
const isSmallScreen = viewportWidth <= 425;

const finalScale = isSmallScreen ? 1.13 : 1.2;

const scale = lerp(
  1,
  finalScale,
  easeInOutCubic(remap(progress, 0.55, 1)),
);

// Desktop gets the cinematic camera push.
// Mobile stays much closer to its original camera distance.
const finalCamZ = isSmallScreen ? -0.45 : -2;

const camZ = lerp(
  0,
  finalCamZ,
  easeInOutCubic(remap(progress, 0.55, 1)),
);

  return {
    posX,
    posY,
    rotY,
    rotZ,
    scale,
    camZ,
  };
}

/** Right-side editorial content: fully visible at start, gone by ~55%. */
export function heroContentOpacity(p) {
  return 1 - easeOutExpo(remap(p, 0.13, 0.53));
}

export function newContentOpacity(p) {
  return easeOutExpo(remap(p, 0.68, 0.9));
}
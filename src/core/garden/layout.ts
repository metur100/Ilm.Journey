import { GARDEN_SPOTS } from './elements';

/**
 * Pixel layout of the garden scene (pure, testable). The land art (`scene.garden-far/-mid/-lawn`, viewBox 400 × 300)
 * is anchored at a computed horizon instead of being cropped around its centre, so the lawn always fills the bottom
 * of the scene – on a 360 dp phone as on a tablet – and every ground spot lies on the grass, never in the sky.
 */

/** Geometry of the backdrop art in its own units. */
export const BACKDROP_ART = {
  w: 400,
  h: 300,
  /** Where the lawn begins (its top contour runs between 230 and 246). */
  horizon: 236,
  /** Crest of the far hills. */
  hillCrest: 150,
  /** Top of the minaret of the little masjid in the far layer – the highest piece of land art. */
  top: 108,
} as const;

/** Share of the scene height covered by the lawn (at least – wide scenes get a little more). */
export const GROUND_SHARE = 0.34;

/**
 * Where a land layer is drawn: at its natural aspect `w × h` (`BACKDROP_ART` × `scale`), then stretched horizontally
 * by `scaleX` around its centre (only the hills are ever stretched, and only on wide screens).
 */
export interface ArtPlacement {
  left: number;
  top: number;
  w: number;
  h: number;
  scaleX: number;
}

export interface GardenLayout {
  width: number;
  height: number;
  /** y where the lawn begins. Ground spots lie between it and the bottom edge. */
  horizon: number;
  /** Top of the open sky (below overlay controls). */
  skyTop: number;
  /** Lowest point of the sky area used for the sun and moon. */
  skyBottom: number;
  lawn: ArtPlacement;
  hills: ArtPlacement;
  /** Size unit of elements: the scene width, but never more than the height allows (tablets). */
  unit: number;
}

export function gardenLayout(width: number, height: number, topInset = 0): GardenLayout {
  const A = BACKDROP_ART;
  const below = A.h - A.horizon;
  // The lawn covers the full width and at least GROUND_SHARE of the height (cropped at the sides on narrow phones).
  const lawnScale = Math.max(width / A.w, (GROUND_SHARE * height) / below);
  const horizon = height - below * lawnScale;
  // Hills: natural width scale, but low enough that the masjid keeps a quarter of the sky free above it.
  const hillsScale = Math.max(0.01, Math.min(width / A.w, (horizon * 0.75) / (A.horizon - A.top)));
  const hillsScaleX = Math.max(width / A.w, hillsScale) / hillsScale;
  const place = (scale: number, scaleX: number): ArtPlacement => ({
    left: width / 2 - (A.w / 2) * scale,
    top: horizon - A.horizon * scale,
    w: A.w * scale,
    h: A.h * scale,
    scaleX,
  });
  const skyTop = Math.min(Math.max(0, topInset), horizon * 0.5);
  const crest = horizon - (A.horizon - A.hillCrest) * hillsScale;
  return {
    width,
    height,
    horizon,
    skyTop,
    skyBottom: Math.max(crest, skyTop + (horizon - skyTop) * 0.6),
    lawn: place(lawnScale, 1),
    hills: place(hillsScale, hillsScaleX),
    unit: Math.min(width, height * 1.2),
  };
}

/**
 * Pixel position of a spot: for ground spots the point where the element's feet stand (on the lawn), for sky spots
 * the centre of the flying element (between the top of the sky and the horizon).
 */
export function spotPoint(layout: GardenLayout, spot: number): { x: number; y: number } {
  const s = GARDEN_SPOTS[spot];
  if (!s) return { x: layout.width / 2, y: layout.height };
  const x = s.x * layout.width;
  if (s.kind === 'sky') return { x, y: layout.skyTop + s.d * (layout.horizon - layout.skyTop) };
  return { x, y: layout.horizon + s.d * (layout.height - layout.horizon) };
}

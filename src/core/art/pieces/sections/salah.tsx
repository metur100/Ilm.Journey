import { art, type ArtDef } from '../../kit';
import { FIG_H, FIG_W, PRAYER_POSITIONS, PrayerFigureArt, type FigureCues, type PrayerPosition, type PrayerVariant } from './salahFigure';

/** Section art (see docs/GAMES-V3.md). Owned by the salah section – add pieces here only. */

// ---------------------------------------------------------------------------------------------------------------
// Prayer figure (salah-prayers author) – every position of the faceless prayer figure on its mat, male and female
// (`salah.prayer-<position>` / `salah.prayer-<position>-female`), plus the sajda with its 7 points highlighted.
// The drawing and the poses live in ./salahFigure.tsx.

const prayerPiece = (position: PrayerPosition, variant: PrayerVariant, cues?: FigureCues): ArtDef =>
  art(FIG_W, FIG_H, (c) => <PrayerFigureArt c={c} position={position} variant={variant} cues={cues} />);

type PrayerArtKey =
  | `prayer-${PrayerPosition}`
  | `prayer-${PrayerPosition}-female`
  | 'prayer-sajda-points'
  | 'prayer-sajda-points-female'
  | 'prayer-qiyam-gaze'
  | 'prayer-qiyam-gaze-female';

const prayerFigure = {
  ...Object.fromEntries(PRAYER_POSITIONS.map((p) => [`prayer-${p}`, prayerPiece(p, 'male')])),
  ...Object.fromEntries(PRAYER_POSITIONS.map((p) => [`prayer-${p}-female`, prayerPiece(p, 'female')])),
  'prayer-sajda-points': prayerPiece('sajda', 'male', { points: true }),
  'prayer-sajda-points-female': prayerPiece('sajda', 'female', { points: true }),
  'prayer-qiyam-gaze': prayerPiece('qiyam', 'male', { gaze: true }),
  'prayer-qiyam-gaze-female': prayerPiece('qiyam', 'female', { gaze: true }),
} as Record<PrayerArtKey, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------

export const salah = {
  ...prayerFigure,
} satisfies Record<string, ArtDef>;

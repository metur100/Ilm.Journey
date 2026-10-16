import { G } from 'react-native-svg';

import { art, type ArtDef } from '../../kit';
import { sky } from '../sky';
import { FIG_H, FIG_W, PRAYER_POSITIONS, PrayerFigureArt, type FigureCues, type PrayerPosition, type PrayerVariant } from './salahFigure';
import { basics } from './salahBasics';

/** Section art (see docs/GAMES-V3.md). Owned by the salah section – add pieces here only. */

// ---------------------------------------------------------------------------------------------------------------
// Prayer figure (salah-prayers author) – every position of the faceless prayer figure on its mat, male and female
// (`salah.prayer-<position>` / `salah.prayer-<position>-female`), plus the sajda with its 7 points highlighted.
// The drawing and the poses live in ./salahFigure.tsx.

const prayerPiece = (position: PrayerPosition, variant: PrayerVariant, cues?: FigureCues): ArtDef =>
  art(FIG_W, FIG_H, (c) => <PrayerFigureArt c={c} position={position} variant={variant} cues={cues} />);

/** Game covers: the time-of-day sky with the figure on its mat. */
type CoverId = 'guide' | 'sabah' | 'podne' | 'ikindija' | 'aksam' | 'jacija' | 'vitr' | 'dzuma';
const COVERS: [CoverId, keyof typeof sky, PrayerPosition, PrayerVariant][] = [
  ['guide', 'morning', 'sajda', 'male'],
  ['sabah', 'dawn', 'takbir', 'male'],
  ['podne', 'noon', 'ruku', 'female'],
  ['ikindija', 'afternoon', 'folded', 'male'],
  ['aksam', 'sunset', 'sajda', 'female'],
  ['jacija', 'night', 'tashahhud', 'male'],
  ['vitr', 'night', 'takbir', 'female'],
  ['dzuma', 'noon', 'selam-right', 'male'],
];
const cover = (time: keyof typeof sky, position: PrayerPosition, variant: PrayerVariant): ArtDef =>
  art(400, 300, (c) => {
    const night = time === 'night' || time === 'dawn' || time === 'sunset';
    const fc = night ? { ...c, dark: true } : c;
    return (
      <>
        {sky[time].draw(c)}
        <G transform="translate(48 52) scale(1.32)">
          <PrayerFigureArt c={fc} position={position} variant={variant} cues={{ highlight: true }} />
        </G>
      </>
    );
  });

type PrayerArtKey =
  | `prayer-${PrayerPosition}`
  | `prayer-${PrayerPosition}-female`
  | 'prayer-sajda-points'
  | 'prayer-sajda-points-female'
  | 'prayer-qiyam-gaze'
  | 'prayer-qiyam-gaze-female'
  | `prayer-cover-${CoverId}`;

const prayerFigure = {
  ...Object.fromEntries(PRAYER_POSITIONS.map((p) => [`prayer-${p}`, prayerPiece(p, 'male')])),
  ...Object.fromEntries(PRAYER_POSITIONS.map((p) => [`prayer-${p}-female`, prayerPiece(p, 'female')])),
  'prayer-sajda-points': prayerPiece('sajda', 'male', { points: true }),
  'prayer-sajda-points-female': prayerPiece('sajda', 'female', { points: true }),
  'prayer-qiyam-gaze': prayerPiece('qiyam', 'male', { gaze: true }),
  'prayer-qiyam-gaze-female': prayerPiece('qiyam', 'female', { gaze: true }),
  ...Object.fromEntries(COVERS.map(([id, time, position, variant]) => [`prayer-cover-${id}`, cover(time, position, variant)])),
} as Record<PrayerArtKey, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------

export const salah = {
  ...prayerFigure,
  // Basics games (salah author): wudu, gusul, tejemmum, ezan, conditions, masjid … – drawn in ./salahBasics.tsx.
  ...basics,
} satisfies Record<string, ArtDef>;

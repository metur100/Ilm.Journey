import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, type KitItem, SequenceBoard, SortBins, type SortItem } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { HIJRI_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Moons of the Hijri Year: the 12 lunar months (Quran 9:36), counted from the Hijra (Bukhari 3934).
 *   L1 – path: the first six months in order (hints).
 *   L2 – path: the last six months, from Rajab to Dhu al-Hijja (no hints).
 *   L3 – sort: sacred months (Bukhari 3197), the month of fasting (Quran 2:185) and other months.
 */

export const MONTHS: { id: string; name: LocalizedText; arabic: string }[] = [
  { id: 'muharram', name: T('Muharram', 'Muharram', 'Muharrem'), arabic: 'محرّم' },
  { id: 'safar', name: T('Safar', 'Safar', 'Safer'), arabic: 'صفر' },
  { id: 'rabi1', name: T('Rabiʿ al-Awwal', 'Rabiʿ al-Awwal', 'Rebiul-evvel'), arabic: 'ربيع الأول' },
  { id: 'rabi2', name: T('Rabiʿ al-Akhir', 'Rabiʿ al-Achir', 'Rebiul-ahir'), arabic: 'ربيع الآخر' },
  { id: 'jumada1', name: T('Jumada al-Ula', 'Dschumada al-Ula', 'Džumadel-ula'), arabic: 'جمادى الأولى' },
  { id: 'jumada2', name: T('Jumada al-Akhira', 'Dschumada al-Achira', 'Džumadel-uhra'), arabic: 'جمادى الآخرة' },
  { id: 'rajab', name: T('Rajab', 'Radschab', 'Redžeb'), arabic: 'رجب' },
  { id: 'shaban', name: T('Shaʿban', 'Schaʿban', 'Šaban'), arabic: 'شعبان' },
  { id: 'ramadan', name: T('Ramadan', 'Ramadan', 'Ramazan'), arabic: 'رمضان' },
  { id: 'shawwal', name: T('Shawwal', 'Schawwal', 'Ševval'), arabic: 'شوال' },
  { id: 'dhulqada', name: T('Dhu al-Qaʿda', 'Dhu l-Qaʿda', 'Zul-ka’de'), arabic: 'ذو القعدة' },
  { id: 'dhulhijja', name: T('Dhu al-Hijja', 'Dhu l-Hiddscha', 'Zul-hidždže'), arabic: 'ذو الحجة' },
];
const SACRED = ['muharram', 'rajab', 'dhulqada', 'dhulhijja'];

const monthItem = (id: string): KitItem => {
  const m = MONTHS.find((x) => x.id === id)!;
  return { id: m.id, label: m.name, sub: m.arabic };
};

type Mode = 'first' | 'second' | 'sort';
export interface HijriConfig {
  mode: Mode;
}

const texts = {
  title: T('Moons of the Hijri Year', 'Monde des Hidschri-Jahres', 'Mjeseci hidžretske godine'),
  description: T(
    'The Hijri year has twelve lunar months and counts from the Hijra. Put the months in order and find the sacred ones.',
    'Das Hidschri-Jahr hat zwölf Mondmonate und zählt ab der Hidschra. Bring die Monate in die richtige Reihenfolge und finde die heiligen.',
    'Hidžretska godina ima dvanaest lunarnih mjeseci i broji se od Hidžre. Poredaj mjesece i pronađi svete.',
  ),
  howTo: T('Drag each month onto its moon along the path.', 'Zieh jeden Monat auf seinen Mond entlang des Weges.', 'Prevuci svaki mjesec na njegov mjesec na stazi.'),
  'play.first': T('The year begins with Muharram. Lay the first six months in order.', 'Das Jahr beginnt mit Muharram. Leg die ersten sechs Monate der Reihe nach.', 'Godina počinje muharremom. Poredaj prvih šest mjeseci.'),
  'play.second': T('Now the second half of the year, from Rajab on.', 'Jetzt die zweite Hälfte des Jahres, ab Radschab.', 'Sada druga polovina godine, od redžeba.'),
  'play.sort': T('Sacred month, month of fasting or another month?', 'Heiliger Monat, Fastenmonat oder ein anderer Monat?', 'Sveti mjesec, mjesec posta ili neki drugi mjesec?'),
  'bin.sacred': T('Sacred month', 'Heiliger Monat', 'Sveti mjesec'),
  'bin.fasting': T('Month of fasting', 'Fastenmonat', 'Mjesec posta'),
  'bin.other': T('Other month', 'Anderer Monat', 'Drugi mjesec'),
};

export function HijriCalendarGame(api: GameApi<HijriConfig>) {
  const { mode } = api.config;
  let board;
  if (mode === 'sort') {
    const items: SortItem[] = ['muharram', 'safar', 'rajab', 'ramadan', 'shawwal', 'dhulqada', 'dhulhijja', 'rabi1'].map((id) => ({
      ...monthItem(id),
      bin: SACRED.includes(id) ? 'sacred' : id === 'ramadan' ? 'fasting' : 'other',
    }));
    board = (
      <SortBins
        bins={[
          { id: 'sacred', label: api.t('bin.sacred'), art: 'history.moon-month' },
          { id: 'fasting', label: api.t('bin.fasting'), art: 'object.lantern-ramadan' },
          { id: 'other', label: api.t('bin.other'), art: 'kit.jar' },
        ]}
        items={items}
        hints={false}
        prompt={api.t('play.sort')}
        onDone={finishWith(api as GameApi<unknown>, items.length, (id) => (id === 'ramadan' ? F.ramadan.id : F.sacred.id))}
      />
    );
  } else {
    const ids = MONTHS.map((m) => m.id).slice(mode === 'first' ? 0 : 6, mode === 'first' ? 6 : 12);
    board = (
      <SequenceBoard
        variant="path"
        columns={2}
        endArt="history.moon-month"
        items={ids.map(monthItem)}
        hints={mode === 'first'}
        prompt={api.t(mode === 'first' ? 'play.first' : 'play.second')}
        onDone={finishWith(api as GameApi<unknown>, ids.length, () => (mode === 'first' ? F.twelve.id : F.fromHijra.id))}
      />
    );
  }
  return <GameBoard api={api as GameApi<unknown>}>{board}</GameBoard>;
}

export const hijriCalendarGame = historyGame<HijriConfig>({
  id: 'hijri-calendar',
  texts,
  coverArt: 'history.hijri-moons',
  hintArt: 'history.moon-month',
  component: HijriCalendarGame,
  levels: [
    { config: { mode: 'first' }, facts: [F.twelve, F.crescent] },
    { config: { mode: 'second' }, facts: [F.fromHijra, F.year1] },
    { config: { mode: 'sort' }, facts: [F.sacred, F.ramadan] },
  ],
  order: 30,
  teaches: ['learn:history-caliphs-4'],
});

export function registerHijriCalendarGame(): void {
  registerGame(hijriCalendarGame);
}

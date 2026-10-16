import { type GameApi, registerGame } from '@/core/games';
import { ConnectPairs, GameBoard, type KitItem, SequenceBoard, TimelineSlider } from '@/core/games/kit';

import { CALIPH_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * The Four Caliphs (content: history-caliphs).
 *   L1 – path: put the four caliphs on the stones from Madinah, in order (years shown, hints).
 *   L2 – timeline: place the year each caliph began to lead (632, 634, 644, 656).
 *   L3 – connect each caliph to what he is remembered for (no hints).
 */

const CALIPHS = [
  { id: 'abubakr', label: T('Abu Bakr', 'Abu Bakr', 'Ebu Bekr'), years: '632–634', start: '632', deed: T('Quran gathered in one collection', 'Koran in einer Sammlung', 'Kur’an sakupljen u jednu zbirku'), deedArt: 'history.suhuf' },
  { id: 'umar', label: T('Umar', 'Umar', 'Omer'), years: '634–644', start: '634', deed: T('Hijri calendar introduced', 'Hidschri-Kalender eingeführt', 'Uveden hidžretski kalendar'), deedArt: 'history.moon-month' },
  { id: 'uthman', label: T('Uthman', 'Uthman', 'Osman'), years: '644–656', start: '644', deed: T('Copies of the Quran sent out', 'Koranabschriften verschickt', 'Poslani prijepisi Kur’ana'), deedArt: 'history.mushaf' },
  { id: 'ali', label: T('Ali', 'Ali', 'Alija'), years: '656–661', start: '656', deed: T('Cousin of the Prophet ﷺ', 'Cousin des Propheten ﷺ', 'Poslanikov ﷺ amidžić'), deedArt: 'history.medallion' },
];

type Mode = 'path' | 'timeline' | 'connect';
export interface CaliphsConfig {
  mode: Mode;
  hints: boolean;
}

const texts = {
  title: T('The Four Caliphs', 'Die vier Kalifen', 'Četiri halife'),
  description: T(
    'Abu Bakr, Umar, Uthman and Ali led the Muslims after the Prophet ﷺ. Put them in order, find their years and what they are remembered for.',
    'Abu Bakr, Umar, Uthman und Ali führten die Muslime nach dem Propheten ﷺ. Bring sie in die richtige Reihenfolge, finde ihre Jahre und wofür man sich an sie erinnert.',
    'Ebu Bekr, Omer, Osman i Alija predvodili su muslimane nakon Poslanika ﷺ. Poredaj ih, pronađi njihove godine i ono po čemu ih pamtimo.',
  ),
  howTo: T('Drag each caliph to his place – first, second, third, fourth.', 'Zieh jeden Kalifen an seinen Platz – erster, zweiter, dritter, vierter.', 'Prevuci svakog halifu na njegovo mjesto – prvi, drugi, treći, četvrti.'),
  'play.path': T('Who led first? Put the caliphs on the path in order.', 'Wer führte zuerst? Leg die Kalifen der Reihe nach auf den Weg.', 'Ko je prvi predvodio? Poredaj halife na stazi.'),
  'play.timeline': T('Slide to the year this caliph began to lead, then place it.', 'Schieb zu dem Jahr, in dem dieser Kalif zu führen begann, und setz ihn dort ab.', 'Pomakni na godinu kada je ovaj halifa počeo predvoditi i postavi ga.'),
  'play.connect': T('Connect each caliph with what he is remembered for.', 'Verbinde jeden Kalifen mit dem, wofür man sich an ihn erinnert.', 'Spoji svakog halifu s onim po čemu ga pamtimo.'),
};

const missedFact = (mode: Mode) => (id: string) => {
  if (mode === 'connect') return F.remembered.id;
  if (mode === 'timeline') return id === 'abubakr' ? F.first.id : F.second.id;
  return F.order.id;
};

export function FourCaliphsGame(api: GameApi<CaliphsConfig>) {
  const { mode, hints } = api.config;
  const done = finishWith(api as GameApi<unknown>, CALIPHS.length, missedFact(mode));
  let board;
  if (mode === 'path') {
    const items: KitItem[] = CALIPHS.map((c) => ({ id: c.id, label: c.label, art: 'history.medallion', sub: c.years }));
    board = <SequenceBoard variant="path" columns={2} items={items} hints={hints} prompt={api.t('play.path')} onDone={done} />;
  } else if (mode === 'timeline') {
    board = (
      <TimelineSlider
        marks={['632', '634', '644', '656', '661'].map((y) => ({ id: y, label: y }))}
        events={CALIPHS.map((c) => ({ id: c.id, label: c.label, art: 'history.medallion', mark: c.start }))}
        hints={hints}
        prompt={api.t('play.timeline')}
        onDone={done}
      />
    );
  } else {
    board = (
      <ConnectPairs
        pairs={CALIPHS.map((c) => ({ id: c.id, left: { label: c.label, art: 'history.medallion' }, right: { label: c.deed, art: c.deedArt } }))}
        leftShare={0.42}
        hints={hints}
        prompt={api.t('play.connect')}
        onDone={done}
      />
    );
  }
  return <GameBoard api={api as GameApi<unknown>}>{board}</GameBoard>;
}

export const fourCaliphsGame = historyGame<CaliphsConfig>({
  id: 'four-caliphs',
  texts,
  coverArt: 'history.four-medallions',
  hintArt: 'history.medallion',
  component: FourCaliphsGame,
  levels: [
    { config: { mode: 'path', hints: true }, facts: [F.order] },
    { config: { mode: 'timeline', hints: false }, facts: [F.first, F.second] },
    { config: { mode: 'connect', hints: false }, facts: [F.remembered, F.care] },
  ],
  order: 10,
  teaches: ['learn:history-caliphs-1', 'learn:history-caliphs-2'],
});

export function registerFourCaliphsGame(): void {
  registerGame(fourCaliphsGame);
}

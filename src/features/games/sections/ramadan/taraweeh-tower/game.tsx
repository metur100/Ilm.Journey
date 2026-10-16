import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { PrayerTower, type TowerKind } from '../shared/engines/PrayerTower';
import { FACTS } from '../shared/facts';

/*
 * Taraweeh Tower: build the night prayer of Ramadan floor by floor (Hanafi practice per the ilmihal: 20 rakats, two by
 * two, a short rest after every four, then vitr; other communities pray 8 – the fact says so neutrally).
 * L1: stack the pairs of rakats – the rests appear by themselves, the counter helps.
 * L2: place the rests yourself after every four rakats. L3: no counter, no outlines – stop at 20 and crown it with vitr.
 */

export const TARAWEEH_ID = 'taraweeh-tower';

const i18n = defineNamespace(`game.${TARAWEEH_ID}`, {
  en: {
    title: 'Taraweeh Tower',
    description: 'Build the night prayer of Ramadan: two rakats at a time, a rest after every four – and vitr on top.',
    howTo: 'Drag a block onto the tower (or tap it). Two rakats side by side make one floor of four.',
    'play.pairs': 'Stack taraweeh two rakats at a time up to 20.',
    'play.rests': 'After every four rakats comes a short rest – place it yourself.',
    'play.vitr': 'Build all 20 rakats from memory, then crown the tower with vitr.',
    two: '2 rakats',
    rest: 'Rest',
    vitr: 'Vitr (3)',
    count: '{n} rakats',
    tower: 'The taraweeh tower',
    'wrong.needRest': 'Four rakats done – first a short rest.',
    'wrong.notRest': 'Not yet – the rest comes after every four rakats.',
    'wrong.vitrEarly': 'Vitr comes after all 20 rakats of taraweeh.',
    'wrong.needVitr': 'Taraweeh is complete with 20 rakats – now crown it with vitr.',
  },
  de: {
    title: 'Tarawih-Turm',
    description: 'Bau das Nachtgebet des Ramadan: je zwei Rakʿas, nach je vier eine Pause – und oben das Witr.',
    howTo: 'Zieh einen Block auf den Turm (oder tippe darauf). Zwei Rakʿas nebeneinander ergeben ein Stockwerk aus vier.',
    'play.pairs': 'Stapel das Tarawih je zwei Rakʿas bis 20.',
    'play.rests': 'Nach je vier Rakʿas kommt eine kurze Pause – setz sie selbst.',
    'play.vitr': 'Bau alle 20 Rakʿas aus dem Gedächtnis und kröne den Turm mit dem Witr.',
    two: '2 Rakʿas',
    rest: 'Pause',
    vitr: 'Witr (3)',
    count: '{n} Rakʿas',
    tower: 'Der Tarawih-Turm',
    'wrong.needRest': 'Vier Rakʿas geschafft – zuerst eine kurze Pause.',
    'wrong.notRest': 'Noch nicht – die Pause kommt nach je vier Rakʿas.',
    'wrong.vitrEarly': 'Das Witr kommt nach allen 20 Rakʿas des Tarawih.',
    'wrong.needVitr': 'Das Tarawih ist mit 20 Rakʿas vollständig – jetzt krön es mit dem Witr.',
  },
  bs: {
    title: 'Toranj teravije',
    description: 'Sagradi noćni namaz ramazana: po dva rekata, odmor nakon svaka četiri – i vitr na vrhu.',
    howTo: 'Prevuci blok na toranj (ili ga dodirni). Dva puta po dva rekata čine jedan sprat od četiri.',
    'play.pairs': 'Slaži teraviju po dva rekata do 20.',
    'play.rests': 'Nakon svaka četiri rekata dolazi kratak odmor – postavi ga sam.',
    'play.vitr': 'Sagradi svih 20 rekata napamet, pa okruni toranj vitrom.',
    two: '2 rekata',
    rest: 'Odmor',
    vitr: 'Vitr (3)',
    count: 'Rekata: {n}',
    tower: 'Toranj teravije',
    'wrong.needRest': 'Četiri rekata su gotova – prvo kratak odmor.',
    'wrong.notRest': 'Još ne – odmor dolazi nakon svaka četiri rekata.',
    'wrong.vitrEarly': 'Vitr dolazi nakon svih 20 rekata teravije.',
    'wrong.needVitr': 'Teravija je potpuna s 20 rekata – sada je okruni vitrom.',
  },
});

const FLOORS: TowerKind[] = Array.from({ length: 5 }, () => ['two', 'two', 'rest'] as TowerKind[]).flat();

export interface TaraweehConfig {
  sequence: TowerKind[];
  auto: TowerKind[];
  tray: TowerKind[];
  showCount: boolean;
  ghosts: boolean;
  hints: boolean;
  prompt: 'play.pairs' | 'play.rests' | 'play.vitr';
}

function wrongKey(got: TowerKind, expected: TowerKind): string {
  if (expected === 'vitr') return 'wrong.needVitr';
  if (got === 'vitr') return 'wrong.vitrEarly';
  if (expected === 'rest') return 'wrong.needRest';
  return 'wrong.notRest';
}

function TaraweehTowerGame(api: GameApi<TaraweehConfig>) {
  const { sequence, auto, tray, showCount, ghosts, hints, prompt } = api.config;
  const moves = sequence.filter((k) => !auto.includes(k)).length;
  return (
    <GameBoard api={api} padding={8}>
      <PrayerTower
        sequence={sequence}
        auto={auto}
        tray={tray}
        showCount={showCount}
        ghosts={ghosts}
        hints={hints}
        prompt={api.t(prompt)}
        labels={{ two: api.t('two'), rest: api.t('rest'), vitr: api.t('vitr') }}
        texts={{ count: (n) => api.t('count', { n }), wrong: (got, expected) => api.t(wrongKey(got, expected)), tower: api.t('tower') }}
        onDone={finishWith(api, moves)}
      />
    </GameBoard>
  );
}

export const taraweehTowerGame = ramadanGame<TaraweehConfig>({
  id: TARAWEEH_ID,
  i18n,
  coverArt: 'ramadan.taraweeh-tower',
  hintArt: 'ramadan.night-mosque',
  component: TaraweehTowerGame,
  levels: [
    { level: 1, config: { sequence: FLOORS, auto: ['rest'], tray: ['two'], showCount: true, ghosts: true, hints: true, prompt: 'play.pairs' }, facts: [FACTS.taraweeh] },
    { level: 2, config: { sequence: FLOORS, auto: [], tray: ['two', 'rest'], showCount: true, ghosts: true, hints: false, prompt: 'play.rests' }, facts: [FACTS.taraweehCount] },
    { level: 3, config: { sequence: [...FLOORS, 'vitr'], auto: [], tray: ['two', 'rest', 'vitr'], showCount: false, ghosts: false, hints: false, prompt: 'play.vitr' }, facts: [FACTS.quranMonth] },
  ],
  teaches: { questionKeys: ['quest:ramadan-taraweeh-tf'] },
  order: 110,
});

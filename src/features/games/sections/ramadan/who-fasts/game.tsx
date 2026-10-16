import type { GameApi } from '@/core/games';
import { type ConnectPair, ConnectPairs, GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Who Fasts? Connect each situation with what applies (Quran 2:183–185; Hanafi practice per the ilmihal):
 * the healthy adult fasts, the ill and the traveller make the days up later, children are not obliged, the very old
 * who cannot fast feed a poor person for each day (fidya, 2:184), and whoever feels unwell stops and tells an adult.
 * L1: three pairs with hints. L2: five pairs. L3: all six, both columns shuffled, no hints.
 */

export const WHO_FASTS_ID = 'who-fasts';

const i18n = defineNamespace(`game.${WHO_FASTS_ID}`, {
  en: {
    title: 'Who Fasts?',
    description: 'Allah wants ease, not hardship: connect each situation with what applies in Ramadan.',
    howTo: 'Draw a line from each picture on the left to the right answer (or tap one, then the other).',
    'play.prompt': 'Connect each situation with what applies.',
  },
  de: {
    title: 'Wer fastet?',
    description: 'Allah will Erleichterung, nicht Erschwernis: Verbinde jede Situation mit dem, was im Ramadan gilt.',
    howTo: 'Zieh eine Linie von jedem Bild links zur passenden Antwort (oder tippe auf das eine, dann auf das andere).',
    'play.prompt': 'Verbinde jede Situation mit dem, was gilt.',
  },
  bs: {
    title: 'Ko posti?',
    description: 'Allah želi olakšanje, a ne poteškoću: poveži svaku situaciju s onim što vrijedi u ramazanu.',
    howTo: 'Povuci liniju od svake slike lijevo do pravog odgovora (ili dodirni jedno, pa drugo).',
    'play.prompt': 'Poveži svaku situaciju s onim što vrijedi.',
  },
});

const P = {
  adult: {
    id: 'adult',
    left: { art: 'place.house', label: T('A healthy adult at home', 'Ein gesunder Erwachsener zu Hause', 'Zdrava odrasla osoba kod kuće') },
    right: { label: T('Fasts every day of Ramadan', 'Fastet jeden Tag im Ramadan', 'Posti svaki dan ramazana') },
  },
  ill: {
    id: 'ill',
    left: { art: 'ramadan.medicine', label: T('Someone who is ill', 'Jemand, der krank ist', 'Neko ko je bolestan') },
    right: { label: T('Rests now, makes up the days when well', 'Ruht sich aus, holt die Tage nach, wenn er gesund ist', 'Odmara se, naknadi dane kad ozdravi') },
  },
  traveller: {
    id: 'traveller',
    left: { art: 'ramadan.suitcase', label: T('A traveller', 'Ein Reisender', 'Putnik') },
    right: { label: T('May break the fast on the journey, makes it up later', 'Darf auf der Reise das Fasten brechen, holt es später nach', 'Smije na putu ne postiti, naknadi kasnije') },
  },
  child: {
    id: 'child',
    left: { art: 'ramadan.small-shoes', label: T('A child before puberty', 'Ein Kind vor der Pubertät', 'Dijete prije puberteta') },
    right: { label: T('Not obliged – may practise with the family', 'Nicht verpflichtet – darf mit der Familie üben', 'Nije obavezno – može vježbati uz porodicu') },
  },
  old: {
    id: 'old',
    left: { art: 'ramadan.cane', label: T('Very old, cannot fast', 'Sehr alt, kann nicht fasten', 'Vrlo star, ne može postiti') },
    right: { label: T('Feeds a poor person for each day (fidya)', 'Speist für jeden Tag einen Armen (Fidya)', 'Nahrani siromaha za svaki dan (fidja)') },
  },
  dizzy: {
    id: 'dizzy',
    left: { art: 'food.water', label: T('Practising and feeling dizzy', 'Übt und fühlt sich schwindlig', 'Vježba i vrti mu se u glavi') },
    right: { label: T('Stops and tells an adult', 'Hört auf und sagt es einem Erwachsenen', 'Prestane i kaže odrasloj osobi') },
  },
} satisfies Record<string, ConnectPair>;

export interface WhoFastsConfig {
  pairs: ConnectPair[];
  hints: boolean;
  shuffleLeft: boolean;
}

const FACT_OF: Record<string, string> = {
  ill: FACTS.makeUp.id,
  traveller: FACTS.makeUp.id,
  dizzy: FACTS.staySafe.id,
  old: FACTS.fidya.id,
  child: FACTS.whoFasts.id,
  adult: FACTS.whoFasts.id,
};

function WhoFastsGame(api: GameApi<WhoFastsConfig>) {
  const { pairs, hints, shuffleLeft } = api.config;
  return (
    <GameBoard api={api}>
      <ConnectPairs pairs={pairs} hints={hints} shuffleLeft={shuffleLeft} leftShare={0.44} prompt={api.t('play.prompt')} onDone={finishWith(api, pairs.length, (id) => FACT_OF[id])} />
    </GameBoard>
  );
}

export const whoFastsGame = ramadanGame<WhoFastsConfig>({
  id: WHO_FASTS_ID,
  i18n,
  coverArt: 'ramadan.suitcase',
  hintArt: 'ramadan.calendar',
  component: WhoFastsGame,
  levels: [
    { level: 1, config: { pairs: [P.adult, P.ill, P.child], hints: true, shuffleLeft: false }, facts: [FACTS.whoFasts] },
    { level: 2, config: { pairs: [P.adult, P.ill, P.traveller, P.child, P.dizzy], hints: false, shuffleLeft: false }, facts: [FACTS.makeUp, FACTS.staySafe] },
    { level: 3, config: { pairs: [P.adult, P.ill, P.traveller, P.child, P.old, P.dizzy], hints: false, shuffleLeft: true }, facts: [FACTS.fidya] },
  ],
  teaches: { questionKeys: ['learn:ramadan-month-4', 'quest:ramadan-children', 'quest:ramadan-dizzy'] },
  order: 100,
});

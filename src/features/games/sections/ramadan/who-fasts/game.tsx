import type { GameApi } from '@/core/games';
import { type ConnectPair, ConnectPairs, GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Who Fasts? Connect each situation with what applies (Quran 2:183–185; Hanafi practice per the ilmihal):
 * the healthy adult fasts, the ill and the traveller make the days up later, children are not obliged, the very old
 * who cannot fast feed a poor person for each day (fidya, 2:184), and whoever feels unwell stops and tells an adult.
 * Every level has its own situations: L1 who fasts (the adult, the child, feeling dizzy), with hints. L2 who is
 * excused (the ill, the traveller, the very old). L3 during the fast day (practising until noon, drinking by
 * forgetting – Bukhari 1933, thirsty in the afternoon – 2:187), both columns shuffled, no hints.
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
  practise: {
    id: 'practise',
    left: { art: 'ramadan.sky-arc', label: T('A child practising until noon', 'Ein Kind übt bis zum Mittag', 'Dijete vježba post do podne') },
    right: { label: T('Good – little by little, with the parents’ guidance', 'Gut – Schritt für Schritt, mit Anleitung der Eltern', 'Dobro – malo po malo, uz vodstvo roditelja') },
  },
  forgot: {
    id: 'forgot',
    left: { art: 'ramadan.thought', label: T('Drank water, forgetting the fast', 'Trank Wasser und vergaß das Fasten', 'Popio vodu, zaboravivši da posti') },
    right: { label: T('The fast still counts – completes it', 'Das Fasten gilt – fastet weiter', 'Post mu vrijedi – nastavlja postiti') },
  },
  thirsty: {
    id: 'thirsty',
    left: { art: 'sky.afternoon', label: T('Thirsty in the afternoon, but well', 'Am Nachmittag durstig, aber gesund', 'Žedan popodne, ali je dobro') },
    right: { label: T('Keeps the fast until sunset (Maghrib)', 'Fastet weiter bis Sonnenuntergang (Maghrib)', 'Posti dalje do zalaska sunca (akšama)') },
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
  practise: FACTS.forgot.id,
  forgot: FACTS.forgot.id,
  thirsty: FACTS.fastTime.id,
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
    { level: 1, config: { pairs: [P.adult, P.child, P.dizzy], hints: true, shuffleLeft: false }, facts: [FACTS.whoFasts, FACTS.staySafe] },
    { level: 2, config: { pairs: [P.ill, P.traveller, P.old], hints: false, shuffleLeft: false }, facts: [FACTS.makeUp, FACTS.fidya] },
    { level: 3, config: { pairs: [P.practise, P.forgot, P.thirsty], hints: false, shuffleLeft: true }, facts: [FACTS.forgot, FACTS.fastTime] },
  ],
  teaches: { questionKeys: ['learn:ramadan-month-4', 'quest:ramadan-children', 'quest:ramadan-dizzy', 'quest:ramadan-fast-time'] },
  order: 100,
});

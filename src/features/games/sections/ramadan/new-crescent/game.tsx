import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { type MoonRound, MoonWatch } from '../shared/engines/MoonWatch';
import { FACTS, T } from '../shared/facts';

/*
 * The New Crescent: slide through the nights of the lunar month and watch the moon grow and shrink.
 * L1: the new crescent and the full moon, with a glowing hint. L2: four moments of Ramadan, no hints.
 * L3: find a night only from the moon's shape, and a cloudy 29th night – the month completes thirty days (Bukhari 1909).
 */

export const CRESCENT_ID = 'new-crescent';

const i18n = defineNamespace(`game.${CRESCENT_ID}`, {
  en: {
    title: 'The New Crescent',
    description: 'Watch the moon through the month and spot the thin new crescent that begins Ramadan.',
    howTo: 'Slide along the nights (or use − and +) until the moon looks right, then tap "This one!".',
    here: 'This one!',
    night: 'Night {n}',
    prev: 'One night earlier',
    next: 'One night later',
    earlier: 'Earlier in the month.',
    later: 'Later in the month.',
  },
  de: {
    title: 'Die neue Mondsichel',
    description: 'Beobachte den Mond durch den Monat und entdecke die dünne neue Sichel, mit der der Ramadan beginnt.',
    howTo: 'Schieb durch die Nächte (oder nutze − und +), bis der Mond passt, und tippe dann auf „Diese!“.',
    here: 'Diese!',
    night: 'Nacht {n}',
    prev: 'Eine Nacht früher',
    next: 'Eine Nacht später',
    earlier: 'Früher im Monat.',
    later: 'Später im Monat.',
  },
  bs: {
    title: 'Mlađak',
    description: 'Prati mjesec kroz cijeli mjesec i pronađi tanki mlađak kojim počinje ramazan.',
    howTo: 'Kreći se kroz noći (ili koristi − i +) dok mjesec ne izgleda kako treba, pa dodirni „Ova!“.',
    here: 'Ova!',
    night: '{n}. noć',
    prev: 'Jednu noć ranije',
    next: 'Jednu noć kasnije',
    earlier: 'Ranije u mjesecu.',
    later: 'Kasnije u mjesecu.',
  },
});

const R = {
  crescent: {
    id: 'crescent',
    days: [1, 2],
    prompt: T('Find the new crescent – the first thin moon after sunset.', 'Finde die neue Mondsichel – den ersten dünnen Mond nach Sonnenuntergang.', 'Pronađi mlađak – prvi tanki mjesec nakon zalaska sunca.'),
    caption: T('The new crescent: a new month begins.', 'Die neue Mondsichel: Ein neuer Monat beginnt.', 'Mlađak: počinje novi mjesec.'),
  },
  full: {
    id: 'full',
    days: [14, 15, 16],
    prompt: T('Find the full moon.', 'Finde den Vollmond.', 'Pronađi pun mjesec.'),
    caption: T('The full moon – the middle of the month.', 'Der Vollmond – die Mitte des Monats.', 'Pun mjesec – sredina mjeseca.'),
  },
  ramadanStart: {
    id: 'ramadan-start',
    days: [1, 2],
    prompt: T('Ramadan begins when the new crescent is seen. Find it!', 'Der Ramadan beginnt, wenn die neue Mondsichel gesehen wird. Finde sie!', 'Ramazan počinje kad se vidi mlađak. Pronađi ga!'),
    caption: T('The crescent is seen – Ramadan begins!', 'Die Sichel ist zu sehen – der Ramadan beginnt!', 'Mlađak je viđen – ramazan počinje!'),
  },
  half: {
    id: 'half',
    days: [7, 8],
    prompt: T('One week of fasting: the moon is half full. Which night?', 'Eine Woche Fasten: Der Mond ist halb voll. Welche Nacht?', 'Sedmica posta: mjesec je napola pun. Koja noć?'),
    caption: T('Half a moon – a quarter of the month has passed.', 'Ein halber Mond – ein Viertel des Monats ist vorbei.', 'Pola mjeseca – prošla je četvrtina mjeseca.'),
  },
  middle: {
    id: 'middle',
    days: [14, 15, 16],
    prompt: T('The middle of Ramadan: the moon is round and bright.', 'Die Mitte des Ramadan: Der Mond ist rund und hell.', 'Sredina ramazana: mjesec je okrugao i sjajan.'),
    caption: T('Half of Ramadan is done.', 'Die Hälfte des Ramadan ist geschafft.', 'Pola ramazana je prošlo.'),
  },
  lastTen: {
    id: 'last-ten',
    days: [21],
    prompt: T('The last ten nights begin. Go to night 21.', 'Die letzten zehn Nächte beginnen. Geh zu Nacht 21.', 'Počinje posljednjih deset noći. Idi na 21. noć.'),
    caption: T('The last ten nights: seek Laylat al-Qadr in the odd ones.', 'Die letzten zehn Nächte: Suche Laylat al-Qadr in den ungeraden.', 'Posljednjih deset noći: traži Lejletul-kadr u neparnim.'),
  },
  shapeCrescent: { id: 'shape-crescent', days: [1, 2], showShape: true, prompt: T('Find the night of this moon.', 'Finde die Nacht dieses Mondes.', 'Pronađi noć ovog mjeseca.') },
  shapeFull: { id: 'shape-full', days: [14, 15, 16], showShape: true, prompt: T('Find the night of this moon.', 'Finde die Nacht dieses Mondes.', 'Pronađi noć ovog mjeseca.') },
  shapeWaning: { id: 'shape-waning', days: [22, 23], showShape: true, prompt: T('Now this moon – it is getting smaller.', 'Jetzt dieser Mond – er wird kleiner.', 'Sada ovaj mjesec – postaje sve manji.') },
  clouds: {
    id: 'clouds',
    days: [30],
    clouds: true,
    prompt: T('Night 29: clouds hide the sky, no crescent is seen. How long is the month?', 'Nacht 29: Wolken verdecken den Himmel, keine Sichel ist zu sehen. Wie lang ist der Monat?', '29. noć: oblaci skrivaju nebo, mlađak se ne vidi. Koliko traje mjesec?'),
    caption: T('Complete thirty days – then the new month begins.', 'Vollende dreißig Tage – dann beginnt der neue Monat.', 'Upotpuni trideset dana – onda počinje novi mjesec.'),
  },
} satisfies Record<string, MoonRound>;

export interface CrescentConfig {
  rounds: MoonRound[];
  hints: boolean;
}

function NewCrescentGame(api: GameApi<CrescentConfig>) {
  const { rounds, hints } = api.config;
  return (
    <GameBoard api={api}>
      <MoonWatch
        rounds={rounds}
        hints={hints}
        texts={{ here: api.t('here'), night: (n) => api.t('night', { n }), prev: api.t('prev'), next: api.t('next'), earlier: api.t('earlier'), later: api.t('later') }}
        onDone={finishWith(api, rounds.length)}
      />
    </GameBoard>
  );
}

export const newCrescentGame = ramadanGame<CrescentConfig>({
  id: CRESCENT_ID,
  i18n,
  coverArt: 'ramadan.crescent-dusk',
  hintArt: 'object.crescent',
  component: NewCrescentGame,
  levels: [
    { level: 1, config: { rounds: [R.crescent, R.full], hints: true }, facts: [FACTS.ninthMonth] },
    { level: 2, config: { rounds: [R.ramadanStart, R.half, R.middle, R.lastTen], hints: false }, facts: [FACTS.moonNote] },
    { level: 3, config: { rounds: [R.shapeFull, R.shapeCrescent, R.shapeWaning, R.clouds], hints: false }, facts: [FACTS.newMoons] },
  ],
  teaches: { questionKeys: ['quest:ramadan-moon', 'quest:ramadan-month', 'quest:ramadan-memory'] },
  order: 40,
});

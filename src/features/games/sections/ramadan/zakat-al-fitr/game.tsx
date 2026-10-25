import type { GameApi } from '@/core/games';
import { GameBoard, PourFill, type PourVessel } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Zakat al-Fitr: fill one measure (sa‘) of food for every member of the family before the Eid prayer (Bukhari 1503).
 * L1: two sacks with a wide band. L2: the whole family – four sacks, a narrower band.
 * L3: the grandparents and the little ones (young or old, Bukhari 1503) – faster grain and a strict measure.
 */

export const ZAKAT_ID = 'zakat-al-fitr';

const i18n = defineNamespace(`game.${ZAKAT_ID}`, {
  en: {
    title: 'Zakat al-Fitr',
    description: 'Before the Eid prayer, fill one measure of food for every family member – so everyone can celebrate.',
    howTo: 'Hold the button to pour and let go at the gold line. Too much? It empties – pour again.',
    'play.prompt': 'One full measure for each person – stop at the gold line.',
    'play.family': 'The whole family: one measure each, before the Eid prayer.',
    'play.young-old': 'Young or old – grandma, grandpa and the little ones each get a measure too.',
  },
  de: {
    title: 'Zakat al-Fitr',
    description: 'Fülle vor dem Eid-Gebet ein Maß Lebensmittel für jedes Familienmitglied – damit alle feiern können.',
    howTo: 'Halte den Knopf zum Schütten gedrückt und lass an der goldenen Linie los. Zu viel? Es wird geleert – schütte neu.',
    'play.prompt': 'Ein volles Maß für jede Person – stopp an der goldenen Linie.',
    'play.family': 'Die ganze Familie: ein Maß für jeden, vor dem Eid-Gebet.',
    'play.young-old': 'Ob jung oder alt – auch Oma, Opa und die Kleinen bekommen je ein Maß.',
  },
  bs: {
    title: 'Sadekatul-fitr',
    description: 'Prije bajram-namaza napuni jednu mjeru hrane za svakog člana porodice – da svi mogu slaviti.',
    howTo: 'Drži dugme da sipaš i pusti na zlatnoj liniji. Previše? Isprazni se – sipaj ponovo.',
    'play.prompt': 'Jedna puna mjera za svaku osobu – stani na zlatnoj liniji.',
    'play.family': 'Cijela porodica: po jedna mjera, prije bajram-namaza.',
    'play.young-old': 'Malo ili veliko – i nana, djed i mališani dobiju po mjeru.',
  },
});

const sack = (id: string, label: ReturnType<typeof T>, art: string, tolerance: number): PourVessel => ({ id, label, art, target: 0.72, tolerance });

const L1 = [sack('dates', T('Dates for me', 'Datteln für mich', 'Hurme za mene'), 'food.dates', 0.1), sack('barley', T('Barley for my brother', 'Gerste für meinen Bruder', 'Ječam za brata'), 'object.grain-sack', 0.1)];
const L2 = [
  sack('mother', T('For mother', 'Für Mama', 'Za mamu'), 'object.grain-sack', 0.07),
  sack('father', T('For father', 'Für Papa', 'Za tatu'), 'object.grain-sack', 0.07),
  sack('me', T('For me', 'Für mich', 'Za mene'), 'food.dates', 0.07),
  sack('sister', T('For my sister', 'Für meine Schwester', 'Za sestru'), 'food.dates', 0.07),
];
const L3 = [
  sack('grandma', T('For grandma', 'Für Oma', 'Za nanu'), 'object.grain-sack', 0.045),
  sack('grandpa', T('For grandpa', 'Für Opa', 'Za djeda'), 'food.dates', 0.045),
  sack('little-brother', T('For my little brother', 'Für meinen kleinen Bruder', 'Za malog brata'), 'object.grain-sack', 0.045),
  sack('baby', T('For the baby, too', 'Auch für das Baby', 'I za bebu'), 'ramadan.charity-bag', 0.045),
];

export interface ZakatConfig {
  vessels: PourVessel[];
  rate?: number;
  prompt: 'play.prompt' | 'play.family' | 'play.young-old';
}

function ZakatAlFitrGame(api: GameApi<ZakatConfig>) {
  const { vessels, rate, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <PourFill vessels={vessels} liquid="grain" rate={rate} prompt={api.t(prompt)} onDone={finishWith(api, vessels.length)} />
    </GameBoard>
  );
}

export const zakatAlFitrGame = ramadanGame<ZakatConfig>({
  id: ZAKAT_ID,
  i18n,
  coverArt: 'ramadan.charity-bag',
  hintArt: 'object.grain-sack',
  component: ZakatAlFitrGame,
  levels: [
    { level: 1, config: { vessels: L1, prompt: 'play.prompt' }, facts: [FACTS.zakatFitr] },
    { level: 2, config: { vessels: L2, prompt: 'play.family' }, facts: [FACTS.zakatMeasure] },
    { level: 3, config: { vessels: L3, rate: 0.4, prompt: 'play.young-old' }, facts: [FACTS.eid] },
  ],
  teaches: { questionKeys: ['quest:ramadan-zakat-fitr'] },
  order: 80,
});

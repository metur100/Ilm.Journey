import type { GameApi } from '@/core/games';
import { GameBoard, type SceneSpot, TapScene } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Eid Morning: get ready for Bajram in a festive room – find what belongs to the morning of Eid al-Fitr.
 * L1: four things, with hints. L2: the morning in order (nice clothes, dates before the prayer – Bukhari 953,
 * Zakat al-Fitr before the prayer – Bukhari 1503, the Eid prayer, gifts). L3: more things and two that do not belong
 * (fasting on Eid is not allowed – Bukhari 1990, Muslim 1137).
 */

export const BAJRAM_ID = 'bajram-morning';

const i18n = defineNamespace(`game.${BAJRAM_ID}`, {
  en: {
    title: 'Eid Morning',
    description: 'Bajram is here! Find everything for the morning of Eid al-Fitr – and what does not belong today.',
    howTo: 'Tap the things in the picture that belong to the Eid morning.',
    'play.find': 'Get ready for Eid: find the four things below.',
    'play.order': 'The Eid morning step by step – find each thing in order.',
    'play.mixed': 'Find everything for Eid – but careful: two things do not belong today.',
  },
  de: {
    title: 'Eid-Morgen',
    description: 'Eid ist da! Finde alles für den Morgen von Eid al-Fitr – und was heute nicht dazugehört.',
    howTo: 'Tippe im Bild auf die Dinge, die zum Eid-Morgen gehören.',
    'play.find': 'Mach dich bereit für Eid: Finde die vier Dinge unten.',
    'play.order': 'Der Eid-Morgen Schritt für Schritt – finde jedes Ding der Reihe nach.',
    'play.mixed': 'Finde alles für Eid – aber Achtung: Zwei Dinge gehören heute nicht dazu.',
  },
  bs: {
    title: 'Bajramsko jutro',
    description: 'Bajram je stigao! Pronađi sve za jutro Ramazanskog bajrama – i šta danas ne pripada.',
    howTo: 'Dodirni stvari na slici koje pripadaju bajramskom jutru.',
    'play.find': 'Spremi se za Bajram: pronađi četiri stvari ispod.',
    'play.order': 'Bajramsko jutro korak po korak – pronađi svaku stvar redom.',
    'play.mixed': 'Pronađi sve za Bajram – ali pažljivo: dvije stvari danas ne pripadaju.',
  },
});

const S = {
  clothes: {
    id: 'clothes',
    spotArt: 'ramadan.eid-clothes',
    art: 'ramadan.eid-clothes',
    at: { x: 0.04, y: 0.46, w: 0.16, h: 0.21 },
    label: T('Nice clothes', 'Schöne Kleidung', 'Lijepa odjeća'),
    caption: T('We wear nice clothes on Eid.', 'An Eid tragen wir schöne Kleidung.', 'Za Bajram oblačimo lijepu odjeću.'),
  },
  dates: {
    id: 'dates',
    spotArt: 'food.dates',
    art: 'food.dates',
    at: { x: 0.33, y: 0.7, w: 0.17, h: 0.13 },
    label: T('Dates', 'Datteln', 'Hurme'),
    caption: T('A few dates before going out to the Eid prayer.', 'Ein paar Datteln, bevor man zum Eid-Gebet geht.', 'Nekoliko hurmi prije izlaska na bajram-namaz.'),
  },
  zakat: {
    id: 'zakat',
    spotArt: 'ramadan.charity-bag',
    art: 'ramadan.charity-bag',
    at: { x: 0.6, y: 0.72, w: 0.13, h: 0.17 },
    label: T('Zakat al-Fitr', 'Zakat al-Fitr', 'Sadekatul-fitr'),
    caption: T('Zakat al-Fitr is given before the Eid prayer.', 'Die Zakat al-Fitr wird vor dem Eid-Gebet gegeben.', 'Sadekatul-fitr se daje prije bajram-namaza.'),
  },
  masjid: {
    id: 'masjid',
    art: 'garden.masjid-small',
    at: { x: 0.5, y: 0.34, w: 0.26, h: 0.32 },
    label: T('The Eid prayer', 'Das Eid-Gebet', 'Bajram-namaz'),
    caption: T('We pray the Eid prayer together and say the takbir.', 'Wir beten gemeinsam das Eid-Gebet und sprechen den Takbir.', 'Zajedno klanjamo bajram-namaz i učimo tekbire.'),
  },
  gift: {
    id: 'gift',
    spotArt: 'ramadan.eid-gift',
    art: 'ramadan.eid-gift',
    at: { x: 0.06, y: 0.25, w: 0.13, h: 0.15 },
    label: T('Gifts for family', 'Geschenke für die Familie', 'Darovi za porodicu'),
    caption: T('We visit family and give gifts – a day of joy.', 'Wir besuchen die Familie und beschenken einander – ein Tag der Freude.', 'Posjećujemo porodicu i darujemo se – dan radosti.'),
  },
  lantern: {
    id: 'lantern',
    spotArt: 'object.lantern-ramadan',
    art: 'object.lantern-ramadan',
    at: { x: 0.85, y: 0.06, w: 0.1, h: 0.2 },
    label: T('Festive lantern', 'Festliche Laterne', 'Svečani fenjer'),
    caption: T('The house is festive for Bajram.', 'Das Haus ist festlich für Eid geschmückt.', 'Kuća je svečana za Bajram.'),
  },
  alarm: {
    id: 'alarm',
    spotArt: 'object.clock',
    art: 'object.clock',
    at: { x: 0.24, y: 0.27, w: 0.1, h: 0.13 },
    target: false,
    label: T('Suhoor alarm', 'Suhur-Wecker', 'Budilnik za sehur'),
  },
  fastPlan: {
    id: 'fast-plan',
    spotArt: 'ramadan.calendar',
    art: 'ramadan.calendar',
    at: { x: 0.82, y: 0.74, w: 0.13, h: 0.17 },
    target: false,
    label: T('A fast for today', 'Ein Fasten für heute', 'Post za danas'),
  },
} satisfies Record<string, SceneSpot>;

export interface BajramConfig {
  spots: SceneSpot[];
  ordered: boolean;
  hints: boolean;
  prompt: 'play.find' | 'play.order' | 'play.mixed';
}

const FACT_OF: Record<string, string> = { alarm: FACTS.eid.id, 'fast-plan': FACTS.eid.id, dates: FACTS.eidDates.id };

function BajramMorningGame(api: GameApi<BajramConfig>) {
  const { spots, ordered, hints, prompt } = api.config;
  const targets = spots.filter((s) => s.target !== false).length;
  return (
    <GameBoard api={api} padding={8}>
      <TapScene scene="ramadan.eid-morning" spots={spots} ordered={ordered} hints={hints} prompt={ordered ? undefined : api.t(prompt)} onDone={finishWith(api, targets, (id) => FACT_OF[id])} />
    </GameBoard>
  );
}

export const bajramMorningGame = ramadanGame<BajramConfig>({
  id: BAJRAM_ID,
  i18n,
  coverArt: 'ramadan.eid-gift',
  hintArt: 'ramadan.eid-morning',
  component: BajramMorningGame,
  levels: [
    { level: 1, config: { spots: [S.clothes, S.gift, S.zakat, S.masjid], ordered: false, hints: true, prompt: 'play.find' }, facts: [FACTS.zakatFitr] },
    { level: 2, config: { spots: [S.clothes, S.dates, S.zakat, S.masjid, S.gift], ordered: true, hints: false, prompt: 'play.order' }, facts: [FACTS.eidDates] },
    { level: 3, config: { spots: [S.clothes, S.dates, S.zakat, S.masjid, S.gift, S.lantern, S.alarm, S.fastPlan], ordered: false, hints: false, prompt: 'play.mixed' }, facts: [FACTS.eid] },
  ],
  teaches: { questionKeys: ['quest:ramadan-eid-fast', 'quest:ramadan-zakat-fitr'] },
  order: 90,
});

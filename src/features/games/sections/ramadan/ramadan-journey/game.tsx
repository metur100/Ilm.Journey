import type { GameApi } from '@/core/games';
import { GameBoard, type KitItem, SequenceBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { FACTS, T } from '../shared/facts';
import { finishWith, ramadanGame } from '../shared/define';

/*
 * Ramadan Journey (v2 id kept, reworked on the kit): put the Ramadan day – and then the whole month – in order.
 * L1: four picture stones along a path (suhoor → Fajr → iftar → teravija), hints.
 * L2: the full day as a list (quests/ramadan.json "ramadan-order"), no hints.
 * L3: the month from the new crescent to Eid, from memory.
 */

export const RAMADAN_JOURNEY_ID = 'ramadan-journey';

const i18n = defineNamespace(`game.${RAMADAN_JOURNEY_ID}`, {
  en: {
    title: 'Ramadan Journey',
    description: 'Walk through a Ramadan day from suhoor to the night prayer – and then through the whole month to Eid.',
    howTo: 'Drag each step to its place in the right order.',
    'play.path': 'Put the day in order: drag each picture onto its stone.',
    'play.day': 'Drag the steps of a fasting day into order, then tap Check.',
    'play.month': 'From the new crescent to Eid: put the month in order, then tap Check.',
  },
  de: {
    title: 'Ramadan-Reise',
    description: 'Geh durch einen Ramadantag vom Suhur bis zum Nachtgebet – und dann durch den ganzen Monat bis zum Eid.',
    howTo: 'Zieh jeden Schritt in der richtigen Reihenfolge an seinen Platz.',
    'play.path': 'Bring den Tag in Ordnung: Zieh jedes Bild auf seinen Stein.',
    'play.day': 'Zieh die Schritte eines Fastentags in die richtige Reihenfolge und tippe auf Prüfen.',
    'play.month': 'Von der neuen Mondsichel bis zum Eid: Bring den Monat in Ordnung und tippe auf Prüfen.',
  },
  bs: {
    title: 'Ramazansko putovanje',
    description: 'Prođi kroz ramazanski dan od sehura do noćnog namaza – a zatim kroz cijeli mjesec do Bajrama.',
    howTo: 'Prevuci svaki korak na njegovo mjesto pravim redom.',
    'play.path': 'Poredaj dan: prevuci svaku sliku na njen kamen.',
    'play.day': 'Poredaj korake posnog dana i dodirni Provjeri.',
    'play.month': 'Od mlađaka do Bajrama: poredaj mjesec i dodirni Provjeri.',
  },
});

/* Labels of the day come from quests/ramadan.json (question "ramadan-order"). */
const DAY: KitItem[] = [
  { id: 'suhoor', art: 'food.bread', label: T('Suhoor before dawn', 'Suhur vor der Dämmerung', 'Sehur prije zore') },
  { id: 'fajr', art: 'sky.dawn', label: T('Fajr prayer – the fast begins', 'Fadschr-Gebet – das Fasten beginnt', 'Sabah-namaz – post počinje') },
  { id: 'day', art: 'object.quran-stand', label: T('The day: school, kindness, Quran', 'Der Tag: Schule, Freundlichkeit, Koran', "Dan: škola, dobrota, Kur'an") },
  { id: 'iftar', art: 'ramadan.iftar-feast', label: T('Iftar at sunset', 'Iftar bei Sonnenuntergang', 'Iftar o zalasku sunca') },
  { id: 'taraweeh', art: 'ramadan.night-mosque', label: T('Isha and Taraweeh', 'Ischa und Tarawih', 'Jacija i teravija') },
];

const PATH: KitItem[] = [
  { id: 'suhoor', art: 'food.bread', label: T('Suhoor', 'Suhur', 'Sehur') },
  { id: 'fajr', art: 'sky.dawn', label: T('Fajr', 'Fadschr', 'Sabah') },
  { id: 'iftar', art: 'ramadan.iftar-feast', label: T('Iftar', 'Iftar', 'Iftar') },
  { id: 'taraweeh', art: 'ramadan.night-mosque', label: T('Taraweeh', 'Tarawih', 'Teravija') },
];

const MONTH: KitItem[] = [
  { id: 'crescent', art: 'ramadan.crescent-dusk', label: T('The new crescent: Ramadan begins', 'Die neue Mondsichel: Ramadan beginnt', 'Mlađak: ramazan počinje') },
  { id: 'fasting', art: 'ramadan.sky-arc', label: T('Days of fasting, nights of prayer', 'Fastentage und Gebetsnächte', 'Dani posta, noći namaza') },
  { id: 'qadr', art: 'ramadan.qadr-sky', label: T('The last ten nights: Laylat al-Qadr', 'Die letzten zehn Nächte: Laylat al-Qadr', 'Posljednjih deset noći: Lejletul-kadr') },
  { id: 'zakat', art: 'ramadan.charity-bag', label: T('Zakat al-Fitr before the prayer', 'Zakat al-Fitr vor dem Gebet', 'Sadekatul-fitr prije namaza') },
  { id: 'eid-prayer', art: 'ramadan.mosque-skyline', label: T('The Eid prayer together', 'Das Eid-Gebet gemeinsam', 'Bajram-namaz zajedno') },
  { id: 'eid-day', art: 'ramadan.eid-gift', label: T('Eid: family, gifts, joy', 'Eid: Familie, Geschenke, Freude', 'Bajram: porodica, darovi, radost') },
];

const FACT_OF: Record<string, string> = {
  suhoor: FACTS.suhoor.id,
  fajr: FACTS.fastTime.id,
  day: FACTS.fastTime.id,
  iftar: FACTS.iftar.id,
  taraweeh: FACTS.taraweeh.id,
  crescent: FACTS.ninthMonth.id,
  fasting: FACTS.ninthMonth.id,
  qadr: FACTS.ninthMonth.id,
  zakat: FACTS.zakatFitr.id,
  'eid-prayer': FACTS.eid.id,
  'eid-day': FACTS.eid.id,
};

export interface JourneyConfig {
  items: KitItem[];
  variant: 'path' | 'list';
  hints: boolean;
  prompt: 'play.path' | 'play.day' | 'play.month';
}

function RamadanJourneyGame(api: GameApi<JourneyConfig>) {
  const { items, variant, hints, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <SequenceBoard items={items} variant={variant} columns={2} endArt="object.lantern-ramadan" hints={hints} prompt={api.t(prompt)} onDone={finishWith(api, items.length, (id) => FACT_OF[id])} />
    </GameBoard>
  );
}

export const ramadanJourneyGame = ramadanGame<JourneyConfig>({
  id: RAMADAN_JOURNEY_ID,
  i18n,
  coverArt: 'object.lantern-ramadan',
  hintArt: 'ramadan.iftar-feast',
  component: RamadanJourneyGame,
  levels: [
    { level: 1, config: { items: PATH, variant: 'path', hints: true, prompt: 'play.path' }, facts: [FACTS.suhoor, FACTS.fastTime] },
    { level: 2, config: { items: DAY, variant: 'list', hints: false, prompt: 'play.day' }, facts: [FACTS.iftar, FACTS.taraweeh] },
    { level: 3, config: { items: MONTH, variant: 'list', hints: false, prompt: 'play.month' }, facts: [FACTS.ninthMonth, FACTS.zakatFitr, FACTS.eid] },
  ],
  teaches: { questionKeys: ['quest:ramadan-order', 'quest:ramadan-suhoor-blessing', 'quest:ramadan-iftar-dates', 'quest:ramadan-zakat-fitr'] },
  order: 10,
});

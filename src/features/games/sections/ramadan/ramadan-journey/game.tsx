import type { GameApi } from '@/core/games';
import { GameBoard, type KitItem, SequenceBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { FACTS, T } from '../shared/facts';
import { finishWith, ramadanGame } from '../shared/define';

/*
 * Ramadan Journey (v2 id kept, reworked on the kit): the fasting day, the Ramadan night and the whole month –
 * each level its own part of Ramadan.
 * L1: the day on picture stones along a path (suhoor → Fajr → the day → iftar), hints.
 * L2: the night as a list (Maghrib → Isha → taraweeh → vitr – the Hanafi order per the ilmihal), no hints.
 * L3: the month from the new crescent to Eid, from memory.
 */

export const RAMADAN_JOURNEY_ID = 'ramadan-journey';

const i18n = defineNamespace(`game.${RAMADAN_JOURNEY_ID}`, {
  en: {
    title: 'Ramadan Journey',
    description: 'Walk through a fasting day, a Ramadan night with its prayers – and then through the whole month to Eid.',
    howTo: 'Drag each step to its place in the right order.',
    'play.path': 'Put the fasting day in order: drag each picture onto its stone.',
    'play.day': 'After iftar: drag the prayers of the Ramadan night into order, then tap Check.',
    'play.month': 'From the new crescent to Eid: put the month in order, then tap Check.',
  },
  de: {
    title: 'Ramadan-Reise',
    description: 'Geh durch einen Fastentag, eine Ramadan-Nacht mit ihren Gebeten – und dann durch den ganzen Monat bis zum Eid.',
    howTo: 'Zieh jeden Schritt in der richtigen Reihenfolge an seinen Platz.',
    'play.path': 'Bring den Fastentag in Ordnung: Zieh jedes Bild auf seinen Stein.',
    'play.day': 'Nach dem Iftar: Zieh die Gebete der Ramadan-Nacht in die richtige Reihenfolge und tippe auf Prüfen.',
    'play.month': 'Von der neuen Mondsichel bis zum Eid: Bring den Monat in Ordnung und tippe auf Prüfen.',
  },
  bs: {
    title: 'Ramazansko putovanje',
    description: 'Prođi kroz posni dan, ramazansku noć s njenim namazima – a zatim kroz cijeli mjesec do Bajrama.',
    howTo: 'Prevuci svaki korak na njegovo mjesto pravim redom.',
    'play.path': 'Poredaj posni dan: prevuci svaku sliku na njen kamen.',
    'play.day': 'Poslije iftara: poredaj namaze ramazanske noći i dodirni Provjeri.',
    'play.month': 'Od mlađaka do Bajrama: poredaj mjesec i dodirni Provjeri.',
  },
});

/* The day (labels from quests/ramadan.json, question "ramadan-order"). */
const PATH: KitItem[] = [
  { id: 'suhoor', art: 'food.bread', label: T('Suhoor', 'Suhur', 'Sehur') },
  { id: 'fajr', art: 'sky.dawn', label: T('Fajr – the fast begins', 'Fadschr – das Fasten beginnt', 'Sabah – post počinje') },
  { id: 'day', art: 'object.quran-stand', label: T('School, kindness, Quran', 'Schule, Freundlichkeit, Koran', "Škola, dobrota, Kur'an") },
  { id: 'iftar', art: 'ramadan.iftar-feast', label: T('Iftar at sunset', 'Iftar bei Sonnenuntergang', 'Iftar o zalasku') },
];

/* The night after iftar (Hanafi: taraweeh after Isha, then vitr – ilmihal). */
const NIGHT: KitItem[] = [
  { id: 'maghrib', art: 'sky.sunset', label: T('Maghrib prayer', 'Maghrib-Gebet', 'Akšam-namaz') },
  { id: 'isha', art: 'sky.night', label: T('Isha prayer', 'Ischa-Gebet', 'Jacija-namaz') },
  { id: 'taraweeh', art: 'ramadan.night-mosque', label: T('Taraweeh, two rakats at a time', 'Tarawih, je zwei Rakʿas', 'Teravija, po dva rekata') },
  { id: 'vitr', art: 'object.prayer-mat', label: T('Vitr prayer', 'Witr-Gebet', 'Vitr-namaz') },
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
  iftar: FACTS.fastTime.id,
  maghrib: FACTS.iftar.id,
  isha: FACTS.taraweehCount.id,
  taraweeh: FACTS.taraweehCount.id,
  vitr: FACTS.taraweehCount.id,
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
    { level: 2, config: { items: NIGHT, variant: 'list', hints: false, prompt: 'play.day' }, facts: [FACTS.iftar, FACTS.taraweehCount] },
    { level: 3, config: { items: MONTH, variant: 'list', hints: false, prompt: 'play.month' }, facts: [FACTS.ninthMonth, FACTS.zakatFitr, FACTS.eid] },
  ],
  teaches: { questionKeys: ['quest:ramadan-order', 'quest:ramadan-suhoor-blessing', 'quest:ramadan-iftar-dates', 'quest:ramadan-zakat-fitr'] },
  order: 10,
});

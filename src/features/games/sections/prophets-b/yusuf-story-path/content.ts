import type { GameFact } from '@/core/games';
import type { KitItem } from '@/core/games/kit';

import { quran, T } from '../shared/kit';
import { YUSUF_FACTS } from '../yusuf-storehouse/facts';

/** Stops of Yusuf's story (Quran, Surah Yusuf) as path tiles – places and objects only, never a person. */
export const YUSUF_EVENTS = {
  dream: { id: 'dream', art: 'prophet.yusuf-dream', label: T('The dream', 'Der Traum', 'San'), sub: '12:4' },
  well: { id: 'well', art: 'prophet.yusuf-well', label: T('The well', 'Der Brunnen', 'Bunar'), sub: '12:15' },
  caravan: { id: 'caravan', art: 'animal.camel', label: T('The caravan', 'Die Karawane', 'Karavan'), sub: '12:19–21' },
  honesty: { id: 'honesty', art: 'object.scales', label: T('Staying honest', 'Ehrlich bleiben', 'Ostati iskren'), sub: '12:23–33' },
  prison: { id: 'prison', art: 'object.lamp', label: T('Prison', 'Gefängnis', 'Tamnica'), sub: '12:35–42' },
  kingDream: { id: 'king-dream', art: 'animal.cow', label: T("King's dream", 'Traum des Königs', 'Kraljev san'), sub: '12:43–49' },
  storehouses: { id: 'storehouses', art: 'prophet.yusuf-granary', label: T('Storehouses', 'Vorratshäuser', 'Riznice'), sub: '12:55' },
  forgiveness: { id: 'forgiveness', art: 'prophet.yaqub-shirt', label: T('Forgiveness', 'Vergebung', 'Oprost'), sub: '12:92–93' },
} satisfies Record<string, KitItem & { sub: string }>;

export interface YusufPathConfig {
  events: KitItem[];
  variant: 'path' | 'list';
  hints: boolean;
  missedFactId: string;
}

const E = YUSUF_EVENTS;

export const PATH_LEVELS: [YusufPathConfig, YusufPathConfig, YusufPathConfig] = [
  { events: [E.dream, E.well, E.caravan, E.prison], variant: 'path', hints: true, missedFactId: 'yusuf-dream-trail' },
  { events: [E.well, E.caravan, E.honesty, E.prison, E.kingDream, E.storehouses], variant: 'path', hints: false, missedFactId: 'yusuf-honesty-trail' },
  { events: [E.dream, E.well, E.caravan, E.prison, E.kingDream, E.storehouses, E.forgiveness], variant: 'list', hints: false, missedFactId: 'yusuf-forgive-trail' },
];

export const PATH_FACTS = {
  dream: {
    id: 'yusuf-dream-trail',
    text: T(
      'As a boy, Yusuf saw in a dream eleven stars, the sun and the moon prostrating to him. His father Yaqub told him not to tell his brothers.',
      'Als Junge sah Yusuf im Traum elf Sterne, die Sonne und den Mond, die sich vor ihm niederwarfen. Sein Vater Yaqub sagte ihm, er solle es seinen Brüdern nicht erzählen.',
      'Kao dječak, Jusuf je usnio jedanaest zvijezda, sunce i mjesec kako mu se klanjaju. Otac Jakub mu je rekao da to ne priča braći.',
    ),
    sources: quran('12:4–5'),
    art: 'prophet.yusuf-dream',
    reviewKey: 'stories:yusuf-stars',
  },
  honest: { ...YUSUF_FACTS.honest, id: 'yusuf-honesty-trail' },
  forgive: {
    id: 'yusuf-forgive-trail',
    text: T(
      'Yusuf told his brothers: "No blame upon you today. May Allah forgive you – He is the Most Merciful of the merciful."',
      'Yusuf sagte seinen Brüdern: „Kein Tadel soll euch heute treffen. Allah möge euch vergeben – Er ist der Barmherzigste der Barmherzigen.“',
      'Jusuf je rekao braći: „Danas nema prijekora za vas. Allah će vam oprostiti – On je od milostivih najmilostiviji.“',
    ),
    sources: quran('12:92'),
    art: 'prophet.yaqub-shirt',
    reviewKey: 'stories:yusuf-revenge',
  },
  plan: { ...YUSUF_FACTS.plan, id: 'yusuf-plan-trail' },
} satisfies Record<string, GameFact>;

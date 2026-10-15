import type { LocalizedText, SourceRef } from '@/core/models';

import story from '@/features/stories/content/prophets/yusuf.json';
import { YUSUF_FACTS } from '../yusuf-storehouse/facts';

export interface YusufEvent {
  id: string;
  title: LocalizedText;
  text: LocalizedText;
  art: string;
  sources: SourceRef[];
}

const source = (reference: string): SourceRef[] => [{ sourceName: 'Quran', sourceReference: reference }];
const scenes = story.scenes;

/** Ten story stops drawn from the existing sourced Yusuf story; no person or prophet is illustrated. */
export const YUSUF_EVENTS: readonly YusufEvent[] = [
  { id: 'dream', title: { en: 'The dream', de: 'Der Traum', bs: 'San' }, text: story.intro, art: 'garden.stars', sources: source('12:4–6') },
  { id: 'brothers', title: { en: 'His brothers', de: 'Seine Brüder', bs: 'Braća' }, text: scenes[0].text, art: 'object.book', sources: source('12:8–15') },
  { id: 'well', title: { en: 'The well', de: 'Der Brunnen', bs: 'Bunar' }, text: { en: 'The brothers put Yusuf in a well.', de: 'Die Brüder ließen Yusuf in einen Brunnen hinab.', bs: 'Braća su Jusufa spustila u bunar.' }, art: 'object.water-jug', sources: source('12:15') },
  { id: 'caravan', title: { en: 'The caravan', de: 'Die Karawane', bs: 'Karavan' }, text: { en: 'A caravan found Yusuf and took him to Egypt.', de: 'Eine Karawane fand Yusuf und brachte ihn nach Ägypten.', bs: 'Karavan je pronašao Jusufa i odveo ga u Egipat.' }, art: 'animal.camel', sources: source('12:19–21') },
  { id: 'honesty', title: { en: 'Staying honest', de: 'Ehrlich bleiben', bs: 'Ostati iskren' }, text: { en: 'Yusuf refused to do wrong, even when that led to an unjust prison sentence.', de: 'Yusuf weigerte sich, Unrecht zu tun, obwohl er deshalb ungerecht ins Gefängnis kam.', bs: 'Jusuf je odbio činiti zlo, iako je zbog toga nepravedno završio u tamnici.' }, art: 'object.scales', sources: source('12:23–35') },
  { id: 'prison', title: { en: 'Teaching in prison', de: 'Lehren im Gefängnis', bs: 'Poučavanje u tamnici' }, text: { en: 'Even in prison Yusuf taught about Allah and explained dreams.', de: 'Selbst im Gefängnis lehrte Yusuf über Allah und deutete Träume.', bs: 'Čak je i u tamnici Jusuf poučavao o Allahu i tumačio snove.' }, art: 'object.book', sources: source('12:36–41') },
  { id: 'king-dream', title: { en: 'The king’s dream', de: 'Der Traum des Königs', bs: 'Kraljev san' }, text: { en: 'The king dreamed of seven fat cows, seven thin cows, and green and dry ears of grain.', de: 'Der König träumte von sieben fetten und sieben mageren Kühen sowie grünen und vertrockneten Ähren.', bs: 'Kralj je sanjao sedam debelih i sedam mršavih krava te zelene i suhe klasove.' }, art: 'animal.cow', sources: source('12:43–49') },
  { id: 'good-years', title: { en: 'Seven good years', de: 'Sieben gute Jahre', bs: 'Sedam rodnih godina' }, text: YUSUF_FACTS.plan.text, art: 'garden.olive', sources: YUSUF_FACTS.plan.sources },
  { id: 'hard-years', title: { en: 'Seven hard years', de: 'Sieben harte Jahre', bs: 'Sedam teških godina' }, text: YUSUF_FACTS.hardYears.text, art: 'sky.afternoon', sources: YUSUF_FACTS.hardYears.sources },
  { id: 'forgiveness', title: { en: 'Forgiveness', de: 'Vergebung', bs: 'Oprost' }, text: { en: 'When his brothers came to him, Yusuf forgave them and the family was reunited.', de: 'Als seine Brüder zu ihm kamen, vergab Yusuf ihnen und die Familie fand wieder zusammen.', bs: 'Kada su mu braća došla, Jusuf im je oprostio i porodica se ponovo sastala.' }, art: 'ui.heart', sources: source('12:92–100') },
];

export const YUSUF_PATH_ART = [...new Set(YUSUF_EVENTS.map((event) => event.art))];
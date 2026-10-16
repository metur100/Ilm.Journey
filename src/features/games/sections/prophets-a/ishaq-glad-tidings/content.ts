import type { GameFact } from '@/core/games';
import type { BuildPart, ConnectPair, KitItem } from '@/core/games/kit';

import { quran, T } from '../shared';

/* Ishaq – Glad Tidings: the honoured guests (51:24–27, 11:69), the glad tidings (11:71), the family of Ibrahim (14:39, 12:6). */

export const ISHAQ_FACTS = {
  guests: {
    id: 'ishaq-honoured-guests',
    text: T(
      'Ibrahim greeted his guests with salam and quickly brought them a roasted calf.',
      'Ibrahim grüßte seine Gäste mit Salam und brachte ihnen schnell ein gebratenes Kalb.',
      'Ibrahim je goste pozdravio selamom i brzo im donio pečeno tele.',
    ),
    sources: [quran('11:69'), quran('51:24–27')],
    art: 'prophet.ishaq-platter',
    reviewKey: 'stories:ishaq-salam',
  },
  tidings: {
    id: 'ishaq-and-yaqub',
    text: T('The guests gave the glad tidings of Ishaq – and after Ishaq, of Yaqub.', 'Die Gäste verkündeten Ishaq – und nach Ishaq Yaqub.', 'Gosti su obradovali Ishakom – a poslije Ishaka Jakubom.'),
    sources: [quran('11:71')],
    art: 'prophet.ishaq-tent',
    reviewKey: 'stories:ishaq-after',
  },
  mercy: {
    id: 'ishaq-mercy-house',
    text: T(
      '"The mercy of Allah and His blessings are upon you, people of the house."',
      '„Die Barmherzigkeit Allahs und Seine Segnungen sind über euch, ihr Leute des Hauses.“',
      '„Allahova milost i Njegovi blagoslovi neka su na vama, ukućani.“',
    ),
    sources: [quran('11:73')],
    art: 'prophet.ishaq-tent',
  },
  prophet: {
    id: 'ishaq-prophet-righteous',
    text: T('Ishaq was a prophet from among the righteous, and Allah blessed Ibrahim and Ishaq.', 'Ishaq war ein Prophet unter den Rechtschaffenen, und Allah segnete Ibrahim und Ishaq.', 'Ishak je bio poslanik od dobrih, a Allah je blagoslovio Ibrahima i Ishaka.'),
    sources: [quran('37:112–113')],
    art: 'story.sun',
    reviewKey: 'stories:ishaq-prophet',
  },
  family: {
    id: 'ishaq-family',
    text: T(
      'Ibrahim said: "Praise be to Allah, who gave me Ismail and Ishaq in my old age." Ishaq\'s son was Yaqub, and Yaqub\'s son was Yusuf.',
      'Ibrahim sagte: „Lob sei Allah, der mir im Alter Ismail und Ishaq geschenkt hat.“ Ishaqs Sohn war Yaqub, und Yaqubs Sohn war Yusuf.',
      'Ibrahim je rekao: „Hvala Allahu koji mi je u starosti darovao Ismaila i Ishaka.“ Ishakov sin bio je Jakub, a Jakubov sin Jusuf.',
    ),
    sources: [quran('14:39'), quran('12:6')],
    art: 'prophet.ishaq-tent',
    check: {
      type: 'choice',
      prompt: T('Who was the son of Ishaq?', 'Wer war der Sohn von Ishaq?', 'Ko je bio Ishakov sin?'),
      options: [T('Yaqub', 'Yaqub', 'Jakub'), T('Ismail', 'Ismail', 'Ismail'), T('Nuh', 'Nuh', 'Nuh')],
      correctIndex: 0,
    },
  },
} satisfies Record<string, GameFact>;

/** L1: prepare the welcome in front of the tent (`prophet.ishaq-tent-site`, 400 × 300). */
const box = (x: number, y: number, w: number, h: number) => ({ x: x / 400, y: y / 300, w: w / 400, h: h / 300 });
export const WELCOME: BuildPart[] = [
  { id: 'rug', art: 'prophet.ishaq-rug', label: T('Rug', 'Teppich', 'Ćilim'), slot: box(100, 236, 200, 40), caption: T('A place ready for the honoured guests (51:24).', 'Ein Platz für die geehrten Gäste (51:24).', 'Mjesto za ugledne goste (51:24).') },
  { id: 'cushion-left', art: 'prophet.ishaq-cushion', label: T('Cushion', 'Kissen', 'Jastuk'), slot: box(84, 214, 70, 40), caption: T('"Salam!" – "Salam!" (11:69)', '„Salam!“ – „Salam!“ (11:69)', '„Selam!“ – „Selam!“ (11:69)') },
  { id: 'cushion-right', art: 'prophet.ishaq-cushion', label: T('Cushion', 'Kissen', 'Jastuk'), slot: box(246, 214, 70, 40), caption: T('Every guest is welcome.', 'Jeder Gast ist willkommen.', 'Svaki gost je dobrodošao.') },
  { id: 'platter', art: 'prophet.ishaq-platter', label: T('Roasted calf', 'Gebratenes Kalb', 'Pečeno tele'), slot: box(140, 200, 120, 66), caption: T('Ibrahim quickly brought a roasted calf (11:69).', 'Ibrahim brachte schnell ein gebratenes Kalb (11:69).', 'Ibrahim je brzo donio pečeno tele (11:69).') },
];

/** L2: the story of the guests in order (11:69–73). */
export const GUEST_STORY: KitItem[] = [
  { id: 'salam', label: T('"Salam" – "Salam"', '„Salam“ – „Salam“', '„Selam“ – „Selam“'), sub: '11:69' },
  { id: 'calf', art: 'prophet.ishaq-platter', label: T('A roasted calf', 'Ein gebratenes Kalb', 'Pečeno tele'), sub: '11:69' },
  { id: 'noeat', label: T('The guests do not eat', 'Die Gäste essen nicht', 'Gosti ne jedu'), sub: '11:70' },
  { id: 'nofear', label: T('"Do not be afraid"', '„Fürchte dich nicht“', '„Ne boj se“'), sub: '11:70' },
  { id: 'ishaq', label: T('Glad tidings of Ishaq', 'Frohe Botschaft: Ishaq', 'Radosna vijest: Ishak'), sub: '11:71' },
  { id: 'yaqub', label: T('… and after him Yaqub', '… und nach ihm Yaqub', '… a poslije njega Jakub'), sub: '11:71' },
];

/** L3: the family of Ibrahim. */
export const FAMILY: ConnectPair[] = [
  { id: 'ismail', left: { label: T('Ismail', 'Ismail', 'Ismail') }, right: { label: T('Son of Ibrahim and Hajar', 'Sohn von Ibrahim und Hadschar', 'Sin Ibrahima i Hadžere') } },
  { id: 'ishaq', left: { label: T('Ishaq', 'Ishaq', 'Ishak') }, right: { label: T('Son of Ibrahim and Sarah', 'Sohn von Ibrahim und Sara', 'Sin Ibrahima i Sare') } },
  { id: 'yaqub', left: { label: T('Yaqub', 'Yaqub', 'Jakub') }, right: { label: T('Son of Ishaq', 'Sohn von Ishaq', 'Ishakov sin') } },
  { id: 'yusuf', left: { label: T('Yusuf', 'Yusuf', 'Jusuf') }, right: { label: T('Son of Yaqub', 'Sohn von Yaqub', 'Jakubov sin') } },
];

export const ITEM_FACT: Record<string, string> = {
  rug: ISHAQ_FACTS.guests.id,
  'cushion-left': ISHAQ_FACTS.guests.id,
  'cushion-right': ISHAQ_FACTS.guests.id,
  platter: ISHAQ_FACTS.guests.id,
  salam: ISHAQ_FACTS.guests.id,
  calf: ISHAQ_FACTS.guests.id,
  noeat: ISHAQ_FACTS.tidings.id,
  nofear: ISHAQ_FACTS.tidings.id,
  ishaq: ISHAQ_FACTS.tidings.id,
  yaqub: ISHAQ_FACTS.family.id,
  ismail: ISHAQ_FACTS.family.id,
  yusuf: ISHAQ_FACTS.family.id,
};

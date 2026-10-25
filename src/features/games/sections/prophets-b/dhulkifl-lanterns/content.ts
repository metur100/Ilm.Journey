import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

import { type Episode, type EpisodeConfig, lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/*
 * Dhul-Kifl – the Quran tells only a little about him, so the game uses only what it says, one facet per level:
 *  L1 "All were of the patient" (21:85): hold a lamp steadily until it is lit – letting go early does not light it.
 *  L2 Named with the other prophets: in Allah's mercy, righteous, among the best (21:85–86, 38:48): connect (episode).
 *  L3 What the Quran tells about him – and what it does not tell (21:85–86, 38:48, 17:36): sort (episode).
 */

export interface LampsConfig {
  words: LocalizedText[];
  holdMs: number;
  /** Lamps must be lit in this order (indices); empty = any order. */
  order: number[];
  /** The order is shown only at the start (ms), then hidden (0 = always shown). */
  showOrderMs: number;
  hints: boolean;
}

export type DhulkiflConfig = LampsConfig | EpisodeConfig;

/** Words about patience, each from the Quran (21:85, 2:153, 39:10). */
export const WORDS = {
  patient: T('Patient', 'Geduldig', 'Strpljiv'),
  steady: T('Steadfast', 'Standhaft', 'Postojan'),
  withPatient: T('Allah is with the patient', 'Allah ist mit den Geduldigen', 'Allah je sa strpljivima'),
  reward: T('A reward without measure', 'Lohn ohne Maß', 'Nagrada bez računa'),
};

const W = WORDS;

/** L1 – four lamps in order with a guide. */
export const LAMPS: LampsConfig = { words: [W.patient, W.steady, W.withPatient, W.reward], holdMs: 900, order: [0, 1, 2, 3], showOrderMs: 0, hints: true };

/** Index of the next lamp to light (or null when any unlit lamp may be lit). */
export function nextLamp(cfg: LampsConfig, lit: readonly number[]): number | null {
  if (!cfg.order.length) return null;
  return cfg.order.find((i) => !lit.includes(i)) ?? null;
}

/** L2 – named together with the other prophets. */
export const NAMED_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Allah names Dhul-Kifl together with other prophets. Connect each ayah with its ending.',
    'Allah nennt Dhul-Kifl zusammen mit anderen Propheten. Verbinde jeden Vers mit seinem Ende.',
    'Allah spominje Zul-Kifla zajedno s drugim poslanicima. Spoji svaki ajet s njegovim krajem.',
  ),
  hints: false,
  pairs: [
    { id: 'ismail-idris', left: { art: 'prophet.dhulkifl-lamp', label: T('"Ismail, Idris and Dhul-Kifl"', '„Ismail, Idris und Dhul-Kifl“', '„Ismail, Idris i Zul-Kifl“') }, right: { label: T('all were of the patient', 'alle gehörten zu den Geduldigen', 'svi su bili strpljivi'), sub: '21:85' } },
    { id: 'admitted', left: { art: 'prophet.dhulkifl-lamp-lit', label: T('"We admitted them"', '„Wir ließen sie eingehen“', '„Mi smo ih uveli“') }, right: { label: T('into Our mercy', 'in Unsere Barmherzigkeit', 'u Našu milost'), sub: '21:86' } },
    { id: 'they-were', left: { art: 'object.prayer-mat', label: T('"They were"', '„Sie gehörten“', '„Oni su bili“') }, right: { label: T('of the righteous', 'zu den Rechtschaffenen', 'od dobrih'), sub: '21:86' } },
    { id: 'ismail-alyasa', left: { art: 'object.book', label: T('"Ismail, Al-Yasa and Dhul-Kifl"', '„Ismail, Al-Yasa und Dhul-Kifl“', '„Ismail, El-Jesa i Zul-Kifl“') }, right: { label: T('all are among the best', 'alle gehören zu den Besten', 'svi su od najboljih'), sub: '38:48' } },
  ],
  factMap: { 'ismail-idris': 'dhulkifl-righteous', admitted: 'dhulkifl-righteous', 'they-were': 'dhulkifl-righteous', 'ismail-alyasa': 'dhulkifl-best' },
};

/** L3 – what the Quran tells about Dhul-Kifl, and what it does not tell. */
export const TOLD_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Sort: what does the Quran tell about Dhul-Kifl – and what does it not tell?',
    'Sortiere: Was erzählt der Koran über Dhul-Kifl – und was erzählt er nicht?',
    'Razvrstaj: šta Kur’an kazuje o Zul-Kiflu – a šta ne kazuje?',
  ),
  hints: false,
  bins: [
    { id: 'told', art: 'object.book', label: T('The Quran tells it', 'Der Koran erzählt es', 'Kur’an to kazuje') },
    { id: 'not-told', art: 'object.scroll', label: T('The Quran does not tell it', 'Der Koran erzählt es nicht', 'Kur’an to ne kazuje') },
  ],
  items: [
    { id: 'in-anbiya', bin: 'told', label: T('He is named in Surah al-Anbiya', 'Er wird in der Sure al-Anbiya genannt', 'Spomenut je u suri El-Enbija'), sub: '21:85' },
    { id: 'in-sad', bin: 'told', label: T('He is named in Surah Sad', 'Er wird in der Sure Sad genannt', 'Spomenut je u suri Sad'), sub: '38:48' },
    { id: 'remember-him', bin: 'told', label: T('Allah tells us to remember him', 'Allah sagt uns, seiner zu gedenken', 'Allah nam kaže da ga se sjećamo'), sub: '38:48' },
    { id: 'his-town', bin: 'not-told', label: T('The town where he lived', 'Die Stadt, in der er lebte', 'Grad u kojem je živio') },
    { id: 'his-age', bin: 'not-told', label: T('How old he became', 'Wie alt er wurde', 'Koliko je dugo živio') },
    { id: 'his-family', bin: 'not-told', label: T('The names of his family', 'Die Namen seiner Familie', 'Imena njegove porodice') },
  ],
  factMap: { 'in-anbiya': 'dhulkifl-little-told', 'in-sad': 'dhulkifl-little-told', 'remember-him': 'dhulkifl-little-told', 'his-town': 'lesson-dhulkifl-only-truth', 'his-age': 'lesson-dhulkifl-only-truth', 'his-family': 'lesson-dhulkifl-only-truth' },
};

export const DHULKIFL_FACTS = {
  patient: {
    id: 'dhulkifl-patient',
    text: T(
      'Allah says: "And Ismail, Idris and Dhul-Kifl – all were of the patient."',
      'Allah sagt: „Und Ismail, Idris und Dhul-Kifl – alle gehörten zu den Geduldigen.“',
      'Allah kaže: „I Ismail, i Idris, i Zul-Kifl – svi su oni bili strpljivi.“',
    ),
    sources: quran('21:85'),
    art: 'prophet.dhulkifl-lamp',
    reviewKey: 'stories:dhulkifl-patient',
  },
  withPatient: {
    id: 'allah-with-patient',
    text: T('Allah is with the patient.', 'Allah ist mit den Geduldigen.', 'Allah je sa strpljivima.'),
    sources: quran('2:153'),
    art: 'prophet.dhulkifl-lamp-lit',
  },
  righteous: {
    id: 'dhulkifl-righteous',
    text: T('"We admitted them into Our mercy. They were of the righteous."', '„Wir ließen sie in Unsere Barmherzigkeit eingehen. Sie gehörten zu den Rechtschaffenen.“', '„I Mi smo ih milošću Našom obasuli. Oni su bili dobri.“'),
    sources: quran('21:86'),
    art: 'prophet.dhulkifl-lamp-lit',
    reviewKey: 'stories:dhulkifl-mercy',
  },
  best: {
    id: 'dhulkifl-best',
    text: T(
      'Allah says: "And remember Ismail, Al-Yasa and Dhul-Kifl – all are among the best."',
      'Allah sagt: „Und gedenke Ismails, Al-Yasas und Dhul-Kifls – alle gehören zu den Besten.“',
      'Allah kaže: „I spomeni Ismaila, i El-Jese’a, i Zul-Kifla – svi su oni bili od najboljih.“',
    ),
    sources: quran('38:48'),
    art: 'object.book',
    check: {
      type: 'choice',
      prompt: T('What does Allah say about Dhul-Kifl in 38:48?', 'Was sagt Allah in 38:48 über Dhul-Kifl?', 'Šta Allah kaže o Zul-Kiflu u 38:48?'),
      options: [T('He is among the best', 'Er gehört zu den Besten', 'On je od najboljih'), T('He was a king', 'Er war ein König', 'Bio je kralj'), T('He built a ship', 'Er baute ein Schiff', 'Gradio je lađu')],
      correctIndex: 0,
    },
  },
  littleTold: {
    id: 'dhulkifl-little-told',
    text: T(
      'The Quran names Dhul-Kifl in two places – Surah al-Anbiya and Surah Sad – and praises him, but it does not tell the details of his life.',
      'Der Koran nennt Dhul-Kifl an zwei Stellen – in der Sure al-Anbiya und der Sure Sad – und lobt ihn, erzählt aber keine Einzelheiten aus seinem Leben.',
      'Kur’an spominje Zul-Kifla na dva mjesta – u suri El-Enbija i suri Sad – i hvali ga, ali ne kazuje pojedinosti iz njegova života.',
    ),
    sources: quran('21:85–86', '38:48'),
    art: 'object.book',
    reviewKey: 'stories:dhulkifl-little',
  },
  lessonPatience: lessonFact(
    'dhulkifl-patience',
    T(
      'Be patient in small and big things – stay steady and good even when something is hard or takes long. Allah is with the patient.',
      'Sei geduldig in kleinen und großen Dingen – bleib ruhig und gut, auch wenn etwas schwer ist oder lange dauert. Allah ist mit den Geduldigen.',
      'Budi strpljiv u malim i velikim stvarima – ostani miran i dobar i kad je nešto teško ili dugo traje. Allah je sa strpljivima.',
    ),
    quran('21:85', '2:153'),
    { art: 'prophet.dhulkifl-lamp-lit', reviewKey: 'stories:dhulkifl-lesson' },
  ),
  lessonGood: lessonFact(
    'dhulkifl-good-company',
    T(
      'Patience and doing good lead into Allah’s mercy. Learn from the best people and try to be like them.',
      'Geduld und gute Taten führen in Allahs Barmherzigkeit. Lerne von den besten Menschen und versuche, wie sie zu sein.',
      'Strpljenje i dobra djela vode u Allahovu milost. Uči od najboljih ljudi i trudi se biti kao oni.',
    ),
    quran('21:86', '38:48'),
    { art: 'prophet.dhulkifl-lamp' },
  ),
  lessonTruth: lessonFact(
    'dhulkifl-only-truth',
    T(
      'Say only what you know for sure. The Quran tells us little about Dhul-Kifl, so we do not add stories about him.',
      'Sag nur, was du sicher weißt. Der Koran erzählt uns wenig über Dhul-Kifl, also fügen wir keine Geschichten über ihn hinzu.',
      'Govori samo ono što sigurno znaš. Kur’an nam malo kazuje o Zul-Kiflu, zato o njemu ne dodajemo priče.',
    ),
    quran('17:36'),
    { art: 'object.scroll' },
  ),
} satisfies Record<string, GameFact>;

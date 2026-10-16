import type { GameFact } from '@/core/games';
import type { PathStop, SortBin, SortItem } from '@/core/games/kit';

import { bukhari, quran, T } from '../shared';

/*
 * Idris – The High Station. The Quran tells only a little about Idris (19:56–57, 21:85–86); the game stays with
 * exactly that: truthful, a prophet, patient, admitted into Allah's mercy, righteous, raised to a high station.
 */

export const IDRIS_FACTS = {
  truthful: {
    id: 'idris-man-of-truth',
    text: T('The Quran says: Idris was a man of truth and a prophet.', 'Der Koran sagt: Idris war ein Mann der Wahrhaftigkeit und ein Prophet.', "Kur'an kaže: Idris je bio iskren čovjek i poslanik."),
    sources: [quran('19:56')],
    art: 'prophet.idris-star',
    reviewKey: 'stories:idris-truthful',
  },
  high: {
    id: 'idris-high-station',
    text: T('Allah says about Idris: "And We raised him to a high station."', 'Allah sagt über Idris: „Und Wir erhoben ihn zu einem hohen Rang.“', 'Allah o Idrisu kaže: „I Mi smo ga na visoko mjesto uzdigli.“'),
    sources: [quran('19:57')],
    art: 'prophet.idris-high-place',
    reviewKey: 'stories:idris-high',
  },
  patient: {
    id: 'idris-among-patient',
    text: T(
      'Ismail, Idris and Dhul-Kifl – all of them were among the patient.',
      'Ismail, Idris und Dhul-Kifl – alle gehörten zu den Geduldigen.',
      'Ismail, Idris i Zul-Kifl – svi su bili od strpljivih.',
    ),
    sources: [quran('21:85')],
    art: 'story.lamp',
    reviewKey: 'stories:idris-with',
  },
  mercy: {
    id: 'idris-mercy-righteous',
    text: T(
      'Allah admitted them into His mercy – they were among the righteous.',
      'Allah ließ sie in Seine Barmherzigkeit eingehen – sie gehörten zu den Rechtschaffenen.',
      'Allah ih je uveo u Svoju milost – bili su od dobrih.',
    ),
    sources: [quran('21:86')],
    art: 'prophet.idris-star',
    check: {
      type: 'trueFalse',
      statement: T('Allah admitted Idris into His mercy.', 'Allah ließ Idris in Seine Barmherzigkeit eingehen.', 'Allah je Idrisa uveo u Svoju milost.'),
      correct: true,
    },
  },
  qualities: {
    id: 'idris-truth-and-patience',
    text: T(
      'Truthfulness and patience are qualities Allah praised in Idris – and we can live them every day.',
      'Wahrhaftigkeit und Geduld sind Eigenschaften, die Allah an Idris lobte – und wir können sie jeden Tag leben.',
      'Iskrenost i strpljivost su osobine koje je Allah pohvalio kod Idrisa – i mi ih možemo živjeti svaki dan.',
    ),
    sources: [quran('19:56'), quran('21:85')],
    art: 'prophet.idris-star',
  },
  heaven: {
    id: 'idris-fourth-heaven',
    text: T(
      'On the night of the Mi\'raj, the Prophet Muhammad ﷺ met Idris in the fourth heaven.',
      'In der Nacht der Mi\'radsch traf der Prophet Muhammad ﷺ Idris im vierten Himmel.',
      'U noći Miradža Poslanik Muhammed, s.a.v.s., susreo je Idrisa na četvrtom nebu.',
    ),
    sources: [bukhari('3207')],
    art: 'prophet.idris-sky-steps',
  },
} satisfies Record<string, GameFact>;

const STAR = 'prophet.idris-star';

const STOP = {
  start: { id: 'start', label: T('Start', 'Start', 'Početak'), art: 'garden.path-stone' },
  truthful: { id: 'truthful', label: T('Truthful', 'Wahrhaftig', 'Iskren'), art: STAR, caption: IDRIS_FACTS.truthful.text },
  prophet: { id: 'prophet', label: T('A prophet', 'Ein Prophet', 'Poslanik'), art: STAR, caption: T('Idris was a prophet (19:56).', 'Idris war ein Prophet (19:56).', 'Idris je bio poslanik (19:56).') },
  patient: { id: 'patient', label: T('Patient', 'Geduldig', 'Strpljiv'), art: STAR, caption: IDRIS_FACTS.patient.text },
  mercy: { id: 'mercy', label: T('In His mercy', 'In Seiner Gnade', 'U Njegovoj milosti'), art: STAR, caption: T('Allah admitted them into His mercy (21:86).', 'Allah ließ sie in Seine Barmherzigkeit eingehen (21:86).', 'Allah ih je uveo u Svoju milost (21:86).') },
  righteous: { id: 'righteous', label: T('Righteous', 'Rechtschaffen', 'Dobar'), art: STAR, caption: T('They were among the righteous (21:86).', 'Sie gehörten zu den Rechtschaffenen (21:86).', 'Bili su od dobrih (21:86).') },
  high: { id: 'high', label: T('High station', 'Hoher Rang', 'Visok položaj'), art: STAR, caption: IDRIS_FACTS.high.text },
};

/** Star path from the foot of the mountain up into the night sky (positions on the 300 × 400 map). */
export const PATH_L1: PathStop[] = [
  { ...STOP.start, at: { x: 0.5, y: 0.9 } },
  { ...STOP.truthful, at: { x: 0.26, y: 0.7 } },
  { ...STOP.patient, at: { x: 0.7, y: 0.52 } },
  { ...STOP.righteous, at: { x: 0.3, y: 0.33 } },
  { ...STOP.high, at: { x: 0.62, y: 0.13 } },
];

export const PATH_L2: PathStop[] = [
  { ...STOP.start, at: { x: 0.2, y: 0.92 } },
  { ...STOP.truthful, at: { x: 0.62, y: 0.82 } },
  { ...STOP.prophet, at: { x: 0.82, y: 0.64 } },
  { ...STOP.patient, at: { x: 0.42, y: 0.56 } },
  { ...STOP.mercy, at: { x: 0.14, y: 0.4 } },
  { ...STOP.righteous, at: { x: 0.5, y: 0.27 } },
  { ...STOP.high, at: { x: 0.82, y: 0.1 } },
];

/** Stop → fact taught there (a wrong move at a stop sends that fact to review). */
export const STOP_FACT: Record<string, string> = {
  truthful: IDRIS_FACTS.truthful.id,
  prophet: IDRIS_FACTS.truthful.id,
  patient: IDRIS_FACTS.patient.id,
  mercy: IDRIS_FACTS.mercy.id,
  righteous: IDRIS_FACTS.mercy.id,
  high: IDRIS_FACTS.high.id,
};

export const QUALITY_BINS: SortBin[] = [
  { id: 'truth', label: T('Truthful', 'Wahrhaftig', 'Iskren'), art: 'object.scroll' },
  { id: 'patience', label: T('Patient', 'Geduldig', 'Strpljiv'), art: 'object.hourglass' },
];

export const QUALITY_ITEMS: SortItem[] = [
  { id: 'admit', bin: 'truth', label: T('Admit a mistake', 'Einen Fehler zugeben', 'Priznati grešku') },
  { id: 'promise', bin: 'truth', label: T('Keep a promise', 'Ein Versprechen halten', 'Održati obećanje') },
  { id: 'change', bin: 'truth', label: T('Give back extra change', 'Zu viel Wechselgeld zurückgeben', 'Vratiti višak kusura'), art: 'object.coins' },
  { id: 'what-happened', bin: 'truth', label: T('Tell what really happened', 'Sagen, was wirklich war', 'Reći šta se stvarno desilo') },
  { id: 'turn', bin: 'patience', label: T('Wait for your turn', 'Warten, bis du dran bist', 'Sačekati svoj red') },
  { id: 'practise', bin: 'patience', label: T('Keep practising a hard lesson', 'Eine schwere Lektion weiter üben', 'Nastaviti vježbati težak dio'), art: 'object.book' },
  { id: 'calm', bin: 'patience', label: T('Stay calm when upset', 'Ruhig bleiben, wenn du dich ärgerst', 'Ostati miran kad se naljutiš') },
  { id: 'iftar', bin: 'patience', label: T('Wait calmly for iftar', 'Ruhig auf das Iftar warten', 'Mirno čekati iftar'), art: 'food.dates' },
];

export const ITEM_FACT: Record<string, string> = Object.fromEntries(
  QUALITY_ITEMS.map((i) => [i.id, i.bin === 'truth' ? IDRIS_FACTS.truthful.id : IDRIS_FACTS.patient.id]),
);

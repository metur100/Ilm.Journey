import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

import { quran, T } from '../shared/kit';

/*
 * Lamps of Patience (Dhul-Kifl) – hold a lamp steadily until it is lit (patience: letting go early does not light it).
 * Each lit lamp shows a word the Quran uses for Dhul-Kifl and the prophets named with him (21:85–86, 38:48).
 * L1: four lamps in order with a guide; L2: six lamps, longer to hold, any order; L3: a sequence shown at the start
 * must be kept from memory.
 */

export interface LampsConfig {
  words: LocalizedText[];
  holdMs: number;
  /** Lamps must be lit in this order (indices); empty = any order. */
  order: number[];
  /** L3: the order is shown only at the start (ms), then hidden. */
  showOrderMs: number;
  hints: boolean;
}

export const WORDS = {
  patient: T('Patient', 'Geduldig', 'Strpljiv'),
  righteous: T('Righteous', 'Rechtschaffen', 'Dobar'),
  mercy: T("In Allah's mercy", 'In Allahs Barmherzigkeit', 'U Allahovoj milosti'),
  best: T('Among the best', 'Unter den Besten', 'Među najboljima'),
  steady: T('Steadfast', 'Standhaft', 'Postojan'),
  remember: T('Remembered', 'In Erinnerung', 'Spomenut'),
};

const W = WORDS;

export const LEVEL_1: LampsConfig = { words: [W.patient, W.mercy, W.righteous, W.best], holdMs: 900, order: [0, 1, 2, 3], showOrderMs: 0, hints: true };
export const LEVEL_2: LampsConfig = { words: [W.patient, W.mercy, W.righteous, W.best, W.steady, W.remember], holdMs: 1400, order: [], showOrderMs: 0, hints: false };
export const LEVEL_3: LampsConfig = { words: [W.patient, W.mercy, W.righteous, W.best, W.steady, W.remember], holdMs: 1400, order: [2, 0, 5, 1, 4, 3], showOrderMs: 3500, hints: false };

/** Index of the next lamp to light (or null when any unlit lamp may be lit). */
export function nextLamp(cfg: LampsConfig, lit: readonly number[]): number | null {
  if (!cfg.order.length) return null;
  return cfg.order.find((i) => !lit.includes(i)) ?? null;
}

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
      'Allah kaže: „I spomeni Ismaila, i El-Jese\'a, i Zul-Kifla – svi su oni bili od najboljih.“',
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
  withPatient: {
    id: 'allah-with-patient',
    text: T('Allah is with the patient.', 'Allah ist mit den Geduldigen.', 'Allah je sa strpljivima.'),
    sources: quran('2:153'),
    art: 'prophet.dhulkifl-lamp-lit',
  },
} satisfies Record<string, GameFact>;

import type { LocalizedText, SourceRef } from '@/core/models';
import akhlaqQuests from '@/features/learn/content/quests/akhlaq.json';

/*
 * Content of A Day of Good Deeds – the scenario questions of the Learn content (quests/akhlaq.json), copied with
 * their options, the gentle feedback of every option and their sources. Nothing here is a new religious claim; the
 * game adds only the moments of the day, the pictures and the UI texts (i18n).
 */

export interface ContentChoice {
  id: string;
  prompt: LocalizedText;
  options: { text: LocalizedText; feedback?: LocalizedText }[];
  correctIndex: number;
  sources: SourceRef[];
}

interface Question {
  id: string;
  prompt: LocalizedText;
  options?: { id: string; text: LocalizedText; feedback?: LocalizedText }[];
  correctOptionId?: string;
  sources?: SourceRef[];
}

const QUESTIONS = akhlaqQuests.questions as unknown as Question[];

export function choice(id: string): ContentChoice {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q?.options || !q.correctOptionId) throw new Error(`Akhlaq scenario not found: ${id}`);
  return {
    id,
    prompt: q.prompt,
    options: q.options.map(({ text, feedback }) => ({ text, feedback })),
    correctIndex: q.options.findIndex((o) => o.id === q.correctOptionId),
    sources: q.sources ?? [],
  };
}

/** A moment of the day: a content scenario with its picture and time of day. */
export interface Moment {
  id: string;
  question: string;
  art: string;
  time: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
}

const M = (id: string, question: string, art: string, time: Moment['time']): Moment => ({ id, question, art, time });

/** Level 1 – an everyday day. */
export const EVERYDAY: Moment[] = [
  M('present', 'akhlaq-shukr-scenario', 'object.gift', 'morning'),
  M('wallet', 'akhlaq-found-money', 'object.coins', 'noon'),
  M('new-student', 'akhlaq-mocking', 'akhlaq.school', 'afternoon'),
  M('table', 'akhlaq-parents-scenario', 'akhlaq.dishes', 'evening'),
];

/** Level 2 – harder moments. */
export const DILEMMAS: Moment[] = [
  M('cup', 'akhlaq-vase', 'akhlaq.broken-cup', 'morning'),
  M('toy', 'akhlaq-toy', 'akhlaq.toy-car', 'noon'),
  M('cat', 'akhlaq-animal', 'animal.cat', 'afternoon'),
  M('sorry', 'akhlaq-forgive-scenario', 'ui.heart', 'evening'),
];

/** Level 3 – the whole day at once: every good deed to its moment. */
export const WHOLE_DAY: Moment[] = [
  M('neighbour', 'akhlaq-helping-scenario', 'akhlaq.shopping-bags', 'morning'),
  M('wallet', 'akhlaq-found-money', 'object.coins', 'noon'),
  M('cat', 'akhlaq-animal', 'animal.cat', 'afternoon'),
  M('table', 'akhlaq-parents-scenario', 'akhlaq.dishes', 'evening'),
];

export const FLOWERS = ['garden.flower-tulip', 'garden.flower-rose', 'garden.flower-lily', 'garden.flower-jasmine'];

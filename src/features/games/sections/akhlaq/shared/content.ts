import type { GameFact } from '@/core/games';
import type { LocalizedText, SourceRef } from '@/core/models';
import akhlaqQuests from '@/features/learn/content/quests/akhlaq.json';

/*
 * Akhlaq section – helpers shared by all games of the section.
 * `lessonFact` / `questFact` copy texts and sources unchanged from the Learn content (quests/akhlaq.json), so the
 * games never restate a lesson in other words. New facts (facts.ts) carry their own Quran / hadith references.
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

interface Lesson {
  id: string;
  sections: { body: LocalizedText }[];
  sources: SourceRef[];
}
interface QuestFact {
  id: string;
  text: LocalizedText;
  sources: SourceRef[];
}

const LESSONS = akhlaqQuests.lessons as unknown as Lesson[];
const FACTS = akhlaqQuests.facts as unknown as QuestFact[];

/** Text of section `section` of an akhlaq lesson with the lesson's sources (unchanged). */
export function lessonText(lessonId: string, section = 0): { text: LocalizedText; sources: SourceRef[] } {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson || !lesson.sections[section]) throw new Error(`Akhlaq lesson section not found: ${lessonId}#${section}`);
  return { text: lesson.sections[section].body, sources: lesson.sources };
}

/** A game fact copied from a lesson section. */
export function lessonFact(id: string, lessonId: string, section = 0, extra: Partial<GameFact> = {}): GameFact {
  return { id, ...lessonText(lessonId, section), ...extra };
}

/** A game fact copied from the quest facts (`akhlaq-fact-*`). */
export function questFact(id: string, factId: string, extra: Partial<GameFact> = {}): GameFact {
  const fact = FACTS.find((f) => f.id === factId);
  if (!fact) throw new Error(`Akhlaq fact not found: ${factId}`);
  return { id, text: fact.text, sources: fact.sources, ...extra };
}

export const quran = (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref });
export const bukhari = (n: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n });
export const muslim = (n: string): SourceRef => ({ sourceName: 'Sahih Muslim', sourceReference: n });
export const abuDawud = (n: string): SourceRef => ({ sourceName: 'Sunan Abi Dawud', sourceReference: n });

import { localizedFrom, translateNs } from '@/core/i18n';
import { type Question, questionKey, type TopicId, type TrueFalseQuestion } from '@/core/models';
import type { DailyCandidate } from '@/core/services/daily';

import { FACTS, getFact, getQuestQuestion, QUEST_QUESTIONS } from '../../content/quests';
import { questI18n } from '../i18n';
import type { Fact } from '../models';

export const QUEST_PREFIX = 'quest';
export const questQuestionKey = (questionId: string) => questionKey(QUEST_PREFIX, questionId);

/** Ids of fact questions (`quest:fact-<factId>`). Fact ids already start with the world id, so they stay unique. */
const FACT_PREFIX = 'fact-';
export const factQuestionId = (factId: string) => `${FACT_PREFIX}${factId}`;

/**
 * islam-quest's "Did you know?" facts as self-contained daily questions: the learner reads the (sourced) fact and
 * confirms it. Nothing is added to the fact – prompt and explanation only wrap its text.
 */
export function factQuestion(fact: Fact): TrueFalseQuestion {
  return {
    id: factQuestionId(fact.id),
    type: 'trueFalse',
    topic: `fact-${fact.worldId}`,
    areaId: fact.worldId as TopicId,
    prompt: localizedFrom((lang) => translateNs(questI18n, lang, 'fact.prompt', { fact: fact.text[lang] || fact.text.en })),
    explanation: localizedFrom((lang) => translateNs(questI18n, lang, 'fact.explanation', { fact: fact.text[lang] || fact.text.en })),
    correct: true,
    ...(fact.sources?.length ? { sources: fact.sources } : {}),
  };
}

const factQuestionCache = new Map<string, TrueFalseQuestion>();

/** Resolves any question of the islam-quest port: quest questions and fact questions. */
export function getAnyQuestQuestion(id: string): Question | undefined {
  const question = getQuestQuestion(id);
  if (question) return question;
  if (!id.startsWith(FACT_PREFIX)) return undefined;
  const fact = getFact(id.slice(FACT_PREFIX.length));
  if (!fact) return undefined;
  let cached = factQuestionCache.get(fact.id);
  if (!cached) {
    cached = factQuestion(fact);
    factQuestionCache.set(fact.id, cached);
  }
  return cached;
}

/**
 * Candidates for the core daily challenge – islam-quest's daily kinds: quick questions ("question of the day",
 * "mini quiz"), scenarios ("what would you do?"), memory games, matching/ordering mini games and the
 * "Did you know?" facts. Quran memorization puzzles are rendered by our registered renderers.
 */
export function dailyCandidates(): DailyCandidate[] {
  return [
    ...QUEST_QUESTIONS.map((q) => ({ key: questQuestionKey(q.id), question: q as Question })),
    ...FACTS.map((f) => {
      const question = getAnyQuestQuestion(factQuestionId(f.id)) as Question;
      return { key: questQuestionKey(question.id), question };
    }),
  ];
}

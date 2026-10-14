import { type DayKey, type LocalizedText, type Quest, type QuestEvent, type QuestKind, TOPIC_IDS, type TopicId } from '../models';
import { dayNumber } from '../utils/date';

/** XP per quest kind (small – quests guide learning, they are not the main reward). */
export const QUEST_XP: Record<QuestKind, number> = {
  daily: 15,
  learning: 20,
  knowledge: 20,
  review: 20,
  challenge: 30,
  story: 20,
  episode: 20,
  game: 15,
};

export const MAX_QUESTS = 5;

/**
 * A quest a feature suggests for today (see `registerQuestProvider`), e.g. "complete the next unit",
 * "pass the Salah master challenge", "finish the story of Nuh". Completion is reported by the feature
 * with `reportQuestEvent({ type: 'complete', target })`.
 */
export interface QuestCandidate {
  /** Stable id part, unique across features, e.g. `learn-unit-salah-basics`. */
  id: string;
  kind: Exclude<QuestKind, 'daily' | 'knowledge' | 'review'>;
  /** Completion target, e.g. `learn:unit:salah-basics`. */
  target: string;
  title: LocalizedText;
  /** Topic used for today's knowledge quest when this is the first candidate. */
  topicArea?: TopicId;
  /** Higher comes first. Learn's next item uses 10. */
  priority?: number;
  xp?: number;
}

/**
 * Builds today's quest log: the daily challenge, the best feature suggestions, a knowledge quest and
 * a review quest when something is pending. At most five quests – no timers and no penalties.
 */
export function generateQuests(day: DayKey, candidates: readonly QuestCandidate[], pendingReviews: number): Quest[] {
  const sorted = [...candidates].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));
  const fromCandidate = (c: QuestCandidate): Quest => ({
    id: `${day}-${c.id}`,
    kind: c.kind,
    goal: { type: 'complete', target: c.target, title: c.title },
    progress: 0,
    target: 1,
    completed: false,
    xp: c.xp ?? QUEST_XP[c.kind],
  });

  const quests: Quest[] = [
    { id: `${day}-daily`, kind: 'daily', goal: { type: 'dailyChallenge' }, progress: 0, target: 1, completed: false, xp: QUEST_XP.daily },
  ];
  const [first, ...rest] = sorted;
  if (first) quests.push(fromCandidate(first));

  const topicArea: TopicId = first?.topicArea ?? TOPIC_IDS[dayNumber(day) % TOPIC_IDS.length];
  quests.push({
    id: `${day}-knowledge`,
    kind: 'knowledge',
    goal: { type: 'correctAnswers', topicArea, count: 5 },
    progress: 0,
    target: 5,
    completed: false,
    xp: QUEST_XP.knowledge,
  });

  if (pendingReviews > 0) {
    const count = Math.min(5, pendingReviews);
    quests.push({
      id: `${day}-review`,
      kind: 'review',
      goal: { type: 'reviewAnswers', count },
      progress: 0,
      target: count,
      completed: false,
      xp: QUEST_XP.review,
    });
  }

  for (const candidate of rest) {
    if (quests.length >= MAX_QUESTS) break;
    quests.push(fromCandidate(candidate));
  }
  return quests;
}

/** Applies an event to the quest log and returns the updated quests plus XP from newly completed ones. */
export function progressQuests(quests: readonly Quest[], event: QuestEvent): { quests: Quest[]; xp: number; completed: Quest[] } {
  const completed: Quest[] = [];
  const next = quests.map((quest) => {
    if (quest.completed) return quest;
    const goal = quest.goal;
    let gain = 0;
    if (goal.type === 'dailyChallenge' && event.type === 'dailyComplete') gain = 1;
    if (goal.type === 'complete' && event.type === 'complete' && event.target === goal.target) gain = 1;
    if (goal.type === 'correctAnswers' && event.type === 'answer' && event.correct && !event.review && event.topicArea === goal.topicArea) gain = 1;
    if (goal.type === 'reviewAnswers' && event.type === 'answer' && event.review && event.correct) gain = 1;
    if (gain === 0) return quest;
    const progress = Math.min(quest.target, quest.progress + gain);
    const updated = { ...quest, progress, completed: progress >= quest.target };
    if (updated.completed) completed.push(updated);
    return updated;
  });
  return { quests: next, xp: completed.reduce((sum, q) => sum + q.xp, 0), completed };
}

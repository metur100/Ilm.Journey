import { type AppData, TOPIC_IDS, type TopicId } from '../models';

/**
 * Knowledge stat (0..100) for a pool of question keys: share answered correctly at least once and
 * not currently pending in review. It represents covered and understood content, never a
 * "religious skill".
 */
export function knowledgePercent(keys: readonly string[], data: Pick<AppData, 'correctlyAnswered' | 'review'>): number {
  if (keys.length === 0) return 0;
  const correct = new Set(data.correctlyAnswered);
  const understood = keys.filter((key) => correct.has(key) && !(data.review[key] && !data.review[key].mastered)).length;
  return Math.round((understood / keys.length) * 100);
}

export interface TopicKnowledge {
  id: TopicId;
  /** 0..100 */
  knowledge: number;
  /** Number of questions in the pool. */
  total: number;
}

/** Knowledge per topic from the question pools every feature reports (merged per topic). */
export function topicKnowledge(
  pools: readonly Partial<Record<TopicId, readonly string[]>>[],
  data: Pick<AppData, 'correctlyAnswered' | 'review'>,
): TopicKnowledge[] {
  return TOPIC_IDS.map((id) => {
    const keys = [...new Set(pools.flatMap((p) => p[id] ?? []))];
    return { id, knowledge: knowledgePercent(keys, data), total: keys.length };
  });
}

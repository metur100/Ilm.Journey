import type { Href } from 'expo-router';

import { TOPIC_IDS, type TopicId } from '@/core/models';

import { unitsOfArea } from './content';
import { getPathSources, type TopicPathItem } from './extensions';
import type { LearnData } from './models';
import { isMasterPassed, isUnitCompleted } from './services/progression';

export type PathItemStatus = 'locked' | 'available' | 'completed';

export interface PathEntry {
  item: TopicPathItem;
  status: PathItemStatus;
  /** 0-based position in the path. */
  index: number;
}

const UNIT_ORDER = 50;
const MASTER_ORDER = 100;

/** Id of the Master Challenge path item of a topic. */
export const masterItemId = (topic: TopicId) => `master-${topic}`;

/**
 * The single path of a topic: registered extra items (islam-quest beginner quests, order 10) →
 * knowledge-rpg units (50) → Master Challenge (100). All topics are open; inside a path an item
 * unlocks when the previous one is completed.
 */
export function buildTopicPath(topic: TopicId, learn: Pick<LearnData, 'units' | 'masters'>): PathEntry[] {
  const groups: { order: number; items: TopicPathItem[] }[] = [
    { order: UNIT_ORDER, items: unitsOfArea(topic).map((u) => ({ kind: 'unit', id: u.id, completed: isUnitCompleted(learn.units, u.id) })) },
    { order: MASTER_ORDER, items: [{ kind: 'master', id: masterItemId(topic), completed: isMasterPassed(topic, learn.masters) }] },
    ...getPathSources().map((source) => {
      let items: TopicPathItem[] = [];
      try {
        items = source.items(topic);
      } catch {
        items = [];
      }
      return { order: source.order, items };
    }),
  ];
  const all = groups.sort((a, b) => a.order - b.order).flatMap((g) => g.items);
  // The Sufara course teaches letters, harakat, joining and reading itself. The old Arabic letter quests and units
  // (arabic-q1 … arabic-q5, arabic-letters … arabic-reading) were shown again after lesson 19 – exactly the repetition
  // the course replaced. Keep them out of the Sufara path; the course and the Master Challenge remain.
  const items = topic === 'sufara' ? all.filter((item) => !item.id.startsWith('arabic-')) : all;

  let previousDone = true;
  return items.map((item, index) => {
    const status: PathItemStatus = item.completed ? 'completed' : previousDone ? 'available' : 'locked';
    previousDone = item.completed;
    return { item, status, index };
  });
}

/** First available (not completed) item of a topic path, or null when the path is finished. */
export function nextPathEntry(topic: TopicId, learn: Pick<LearnData, 'units' | 'masters'>): PathEntry | null {
  return buildTopicPath(topic, learn).find((e) => e.status === 'available') ?? null;
}

export function pathProgress(topic: TopicId, learn: Pick<LearnData, 'units' | 'masters'>): { completed: number; total: number } {
  const path = buildTopicPath(topic, learn);
  return { completed: path.filter((e) => e.status === 'completed').length, total: path.length };
}

/** Topics with at least one completed path item. */
export function startedTopics(learn: Pick<LearnData, 'units' | 'masters'>): TopicId[] {
  return TOPIC_IDS.filter((topic) => buildTopicPath(topic, learn).some((e) => e.status === 'completed'));
}

/** Where a path item opens. */
export function pathItemHref(topic: TopicId, item: TopicPathItem): Href {
  if (item.kind === 'unit') return { pathname: '/unit/[id]', params: { id: item.id } };
  if (item.kind === 'master') return { pathname: '/master/[id]', params: { id: topic } };
  return item.href;
}

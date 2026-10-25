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
 * Units whose lesson a beginner quest or a prophet story of the same topic already teaches: unit id → the path items that
 * teach it. A topic page shows every piece of content once, so such a unit is left out of the path while all of these items
 * are in it. The unit itself stays: its test questions remain in the Master Challenge pool, and saved progress, review,
 * history and search links keep working.
 */
export const UNITS_TAUGHT_ELSEWHERE: Readonly<Record<string, readonly string[]>> = {
  'salah-basics': ['salah-q1'],
  'salah-times': ['salah-q2'],
  'salah-wudu': ['salah-q3', 'salah-q4'],
  'quran-revelation': ['quran-q1'],
  'quran-structure': ['quran-q2'],
  'quran-etiquette': ['quran-q3', 'quran-q4', 'quran-q5', 'quran-q6'],
  'prophets-adam-nuh': ['prophet-adam', 'prophet-nuh'],
  'prophets-ibrahim-musa': ['prophet-ibrahim', 'prophet-musa'],
  'prophets-yusuf-yunus-isa': ['prophet-yusuf', 'prophet-yunus', 'prophet-isa'],
  'prophets-musa-firaun': ['prophet-musa'],
  'akhlaq-sabr-shukr': ['akhlaq-q1'],
  'akhlaq-honesty-trust': ['akhlaq-q2'],
  'akhlaq-mercy-family': ['akhlaq-q3', 'akhlaq-q4', 'akhlaq-q5'],
  'ramadan-month': ['ramadan-q1', 'ramadan-q2'],
  'ramadan-days-nights': ['ramadan-q3', 'ramadan-q4'],
  'ramadan-charity-eid': ['ramadan-q5'],
  'arabic-words': ['arabic-q6', 'arabic-q7'],
};

/** True for a unit that is (or can be) left out of its path because other items teach it – it still opens directly. */
export const isUnitTaughtElsewhere = (unitId: string) => Object.hasOwn(UNITS_TAUGHT_ELSEWHERE, unitId);

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
  const inPath = topic === 'sufara' ? all.filter((item) => !item.id.startsWith('arabic-')) : all;
  // Never the same lesson twice: drop units whose content the quests / stories in this path already teach.
  const ids = new Set(inPath.map((item) => item.id));
  const items = inPath.filter((item) => item.kind !== 'unit' || !(UNITS_TAUGHT_ELSEWHERE[item.id]?.every((id) => ids.has(id)) ?? false));

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

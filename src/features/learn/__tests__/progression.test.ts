import type { AppData } from '@/core/models';
import { applyAnswer, createInitialData } from '@/core/services/engine';
import { knowledgePercent } from '@/core/services/knowledge';
import { learnKey, testQuestionsOfArea, unitsOfArea } from '@/features/learn/content';
import { clearLearnExtensionsForTests, getTopicTools, registerPathSource, registerTopicTool } from '@/features/learn/extensions';
import type { UnitProgress } from '@/features/learn/models';
import { buildTopicPath, masterItemId, nextPathEntry, pathProgress, startedTopics } from '@/features/learn/path';
import { pickMasterQuestions } from '@/features/learn/services/progression';

const done: UnitProgress = { completed: true, attempts: 1, bestScore: 100, completedAt: '2026-10-01T00:00:00.000Z' };
const complete = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, done]));
const NOW = new Date('2026-10-06T10:00:00.000Z');
const text = { en: 'x', de: 'x', bs: 'x' };

afterEach(() => clearLearnExtensionsForTests());

describe('topic paths', () => {
  it('opens every topic from the start', () => {
    for (const topic of ['salah', 'quran', 'prophets', 'seerah', 'akhlaq', 'ramadan', 'history', 'sufara', 'arabic'] as const) {
      expect(nextPathEntry(topic, { units: {}, masters: {} })?.status).toBe('available');
    }
  });

  it('unlocks units one after another and the master challenge last', () => {
    const units = unitsOfArea('salah');
    const [u1, u2] = units;
    const status = (done: Record<string, UnitProgress>) => buildTopicPath('salah', { units: done, masters: {} }).map((e) => [e.item.id, e.status]);
    expect(status({})).toEqual([...units.map((u, i) => [u.id, i === 0 ? 'available' : 'locked']), [masterItemId('salah'), 'locked']]);
    expect(status(complete(u1.id))[1]).toEqual([u2.id, 'available']);
    expect(status(complete(...units.map((u) => u.id))).at(-1)).toEqual([masterItemId('salah'), 'available']);
    expect(pathProgress('salah', { units: complete(u1.id), masters: {} })).toEqual({ completed: 1, total: units.length + 1 });
    expect(startedTopics({ units: complete(u1.id), masters: {} })).toEqual(['salah']);
  });

  it('puts registered beginner quests before the units (extension point)', () => {
    let questDone = false;
    registerPathSource({
      id: 'quests',
      order: 10,
      items: (topic) => (topic === 'salah' ? [{ kind: 'quest', id: 'salah-q1', title: text, href: '/', completed: questDone, target: 'quest:salah-q1' }] : []),
    });
    const path = buildTopicPath('salah', { units: {}, masters: {} });
    expect(path[0]).toMatchObject({ item: { kind: 'quest', id: 'salah-q1' }, status: 'available' });
    expect(path[1].status).toBe('locked');
    questDone = true;
    expect(buildTopicPath('salah', { units: {}, masters: {} })[1].status).toBe('available');
    expect(buildTopicPath('quran', { units: {}, masters: {} })[0].item.kind).toBe('unit');
  });

  it('a crashing path source does not break the path', () => {
    registerPathSource({ id: 'bad', order: 10, items: () => { throw new Error('x'); } });
    expect(buildTopicPath('salah', { units: {}, masters: {} }).length).toBe(unitsOfArea('salah').length + 1);
  });

  it('registers topic tools per topic in order', () => {
    registerTopicTool({ id: 'b', topic: 'quran', order: 20, icon: 'quran', label: () => 'B', href: '/' });
    registerTopicTool({ id: 'a', topic: 'quran', order: 10, icon: 'quran', label: () => 'A', href: '/' });
    expect(getTopicTools('quran').map((t) => t.id)).toEqual(['a', 'b']);
    expect(getTopicTools('salah')).toEqual([]);
  });
});

describe('master questions', () => {
  it('picks 10 unique questions from the topic, weak ones first', () => {
    const pool = testQuestionsOfArea('salah');
    const weak = pool[pool.length - 1];
    const state: AppData = applyAnswer(createInitialData(), { key: learnKey(weak.id), topic: weak.topic }, false, 'test', NOW).data;
    const picked = pickMasterQuestions(pool, state.review, 0, (q) => learnKey(q.id));
    expect(picked).toHaveLength(10);
    expect(new Set(picked.map((q) => q.id)).size).toBe(10);
    expect(picked[0].id).toBe(weak.id);
    expect(picked.every((q) => q.areaId === 'salah')).toBe(true);
  });

  it('is stable for one attempt and varies between attempts', () => {
    const pool = testQuestionsOfArea('quran');
    const pick = (n: number) => pickMasterQuestions(pool, {}, n, (q) => learnKey(q.id)).map((q) => q.id).join();
    expect(pick(1)).toBe(pick(1));
    expect([2, 3, 4, 5].map(pick).some((v) => v !== pick(1))).toBe(true);
  });
});

describe('knowledge stats', () => {
  it('measures understood content and drops while a question is pending review', () => {
    const keys = testQuestionsOfArea('salah').map((q) => learnKey(q.id));
    let data = createInitialData();
    expect(knowledgePercent(keys, data)).toBe(0);
    data = applyAnswer(data, { key: keys[0], topic: 't' }, true, 'test', NOW).data;
    expect(knowledgePercent(keys, data)).toBe(Math.round(100 / keys.length));
    data = applyAnswer(data, { key: keys[0], topic: 't' }, false, 'master', NOW).data;
    expect(knowledgePercent(keys, data)).toBe(0);
  });
});

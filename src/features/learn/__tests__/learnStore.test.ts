import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearRegistryForTests, getContinueItem, getDailyCandidates, getQuestCandidates, getQuestionByKey, getRecentlyCompleted, searchAll } from '@/core/registry';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { savePersisted } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { learnKey, testQuestionsOfArea, unitsOfArea } from '@/features/learn/content';
import { clearLearnExtensionsForTests } from '@/features/learn/extensions';
import { registerLearnFeature } from '@/features/learn/register';
import { EMPTY_LEARN } from '@/features/learn/services/progression';
import { LEARN_PERSIST, sanitizeLearnData, unitTarget, useLearnStore } from '@/features/learn/store/learnStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  clearLearnExtensionsForTests();
  registerLearnFeature();
  useLearnStore.setState({ ...EMPTY_LEARN, hydrated: true });
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], celebrationsPaused: false });
});

describe('learn feature registration', () => {
  it('resolves learn questions by global key with unit context', () => {
    const q = testQuestionsOfArea('salah')[0];
    const resolved = getQuestionByKey(learnKey(q.id));
    expect(resolved?.question).toBe(q);
    expect(resolved?.topicArea).toBe('salah');
    expect(resolved?.context?.title).toEqual(unitsOfArea('salah').find((u) => u.questions.includes(q))?.title);
  });

  it('offers test questions to the daily challenge and suggests the next unit as a quest', () => {
    const keys = getDailyCandidates().map((c) => c.key);
    expect(keys).toContain(learnKey(testQuestionsOfArea('arabic')[0].id));
    const [first] = getQuestCandidates({ day: '2026-10-06' });
    expect(first).toMatchObject({ kind: 'learning', target: unitTarget(unitsOfArea('salah')[0].id), topicArea: 'salah' });
  });

  it('finds units and topics in search', () => {
    const unit = unitsOfArea('salah')[0];
    expect(searchAll(unit.title.en.slice(0, 6), 'en').some((r) => r.key === `learn:unit:${unit.id}`)).toBe(true);
    expect(searchAll('arab', 'en').some((r) => r.key === 'learn:topic:arabic')).toBe(true);
  });
});

describe('completing units and masters', () => {
  it('awards completion and perfect XP once, counts the streak and earns badges', () => {
    const unit = unitsOfArea('salah')[0];
    const first = useLearnStore.getState().completeUnit(unit.id, 'salah', [true, true, true, true]);
    expect(first.firstCompletion).toBe(true);
    expect(first.xp).toBeGreaterThanOrEqual(XP.unitComplete + XP.perfectBonus);
    const app = useAppStore.getState();
    expect(app.xpAwards).toMatchObject({ [`learn:unit:${unit.id}:complete`]: XP.unitComplete, [`learn:unit:${unit.id}:perfect`]: XP.perfectBonus });
    expect(app.streak.current).toBe(1);
    expect(app.badges.first_lesson).toBeDefined();
    expect(app.badges.perfect_score).toBeDefined();

    const again = useLearnStore.getState().completeUnit(unit.id, 'salah', [true, true, true, true]);
    expect(again.firstCompletion).toBe(false);
    expect(again.xp).toBe(0);
    expect(useLearnStore.getState().units[unit.id].attempts).toBe(2);
  });

  it('completes the learning quest of the day through the reported event', () => {
    useAppStore.getState().refreshQuests(true);
    const unit = unitsOfArea('salah')[0];
    useLearnStore.getState().completeUnit(unit.id, 'salah', [true, false]);
    expect(useAppStore.getState().quests.find((q) => q.kind === 'learning')?.completed).toBe(true);
  });

  it('passes the master challenge at 70 % and earns the topic badge', () => {
    const fail = useLearnStore.getState().completeMaster('salah', [true, true, true, true, true, true, false, false, false, false]);
    expect(fail).toMatchObject({ passed: false, xp: 0 });
    expect(useLearnStore.getState().masters.salah).toMatchObject({ passed: false, attempts: 1, bestScore: 60 });

    const pass = useLearnStore.getState().completeMaster('salah', [true, true, true, true, true, true, true, false, false, false]);
    expect(pass.passed).toBe(true);
    expect(pass.firstPass).toBe(true);
    expect(pass.xp).toBeGreaterThanOrEqual(XP.masterPassed);
    expect(useAppStore.getState().badges.salah_scholar).toBeDefined();

    expect(useLearnStore.getState().completeMaster('salah', Array(10).fill(true)).xp).toBe(0);
    expect(useLearnStore.getState().masters.salah?.bestScore).toBe(100);
  });

  it('reports continue and recently completed items', () => {
    expect(getContinueItem()).toBeNull();
    const [u1, u2] = unitsOfArea('quran');
    useLearnStore.getState().visit('quran', u1.id);
    expect(getContinueItem()?.key).toBe(`learn:unit:${u1.id}`);
    useLearnStore.getState().completeUnit(u1.id, 'quran', [true]);
    expect(getContinueItem()?.key).toBe(`learn:unit:${u2.id}`);
    expect(getRecentlyCompleted().map((i) => i.key)).toContain(`learn:unit:${u1.id}`);
  });
});

describe('learn persistence', () => {
  it('hydrates, sanitizes and resets', async () => {
    const unit = unitsOfArea('salah')[0];
    await savePersisted(LEARN_PERSIST, { ...EMPTY_LEARN, units: { [unit.id]: { completed: true, attempts: 1, bestScore: 80 } } });
    await useLearnStore.getState().hydrate();
    expect(useLearnStore.getState().units[unit.id].bestScore).toBe(80);

    expect(sanitizeLearnData({ masters: { salah: { passed: true, attempts: 1, bestScore: 90 }, mars: {} }, lastVisited: { topic: 'nope', itemId: 'x', at: '' } })).toMatchObject({
      masters: { salah: { passed: true } },
      lastVisited: null,
    });
    expect(sanitizeLearnData('broken')).toBeNull();

    await useLearnStore.getState().reset();
    expect(useLearnStore.getState().units).toEqual({});
    expect(await AsyncStorage.getItem(LEARN_PERSIST.key)).toBeNull();
  });

  it('is reset by the global resetProgress', async () => {
    const unit = unitsOfArea('salah')[0];
    useLearnStore.getState().completeUnit(unit.id, 'salah', [true]);
    await useAppStore.getState().resetProgress();
    expect(useLearnStore.getState().units).toEqual({});
    expect(useAppStore.getState().xp).toBe(0);
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getNamespaces, translateNs } from '@/core/i18n';
import {
  clearRegistryForTests,
  collectFeatureMetrics,
  getContinueItem,
  getDailyCandidates,
  getHomeSections,
  getProfileLinks,
  getQuestCandidates,
  getQuestionByKey,
  getRecentlyCompleted,
  resetFeatures,
  resolveSources,
  searchAll,
} from '@/core/registry';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { savePersisted } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { EPISODES, EVENTS, getQuestion, PEOPLE, QUESTIONS, seerahKey } from '@/features/seerah/content';
import { seerahI18n } from '@/features/seerah/i18n';
import { registerSeerahFeature } from '@/features/seerah/register';
import { createEmptySeerah, SEERAH_XP } from '@/features/seerah/services/engine';
import { episodeTarget, SEERAH_PERSIST, startSeerahAutoSave, useSeerahStore, xpReason } from '@/features/seerah/store/seerahStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  registerSeerahFeature();
  useSeerahStore.setState({ ...createEmptySeerah(), hydrated: true });
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], celebrationsPaused: false });
});

describe('seerah registration', () => {
  it('resolves seerah questions by global key with episode context', () => {
    const resolved = getQuestionByKey('seerah:e01-q1');
    expect(resolved?.question).toBe(getQuestion('e01-q1'));
    expect(resolved?.prefix).toBe('seerah');
    expect(resolved?.topicArea).toBe('seerah');
    expect(resolved?.context?.title).toEqual(EPISODES[0].title);
    expect(getQuestionByKey('seerah:nope')).toBeUndefined();
    for (const q of QUESTIONS) expect(getQuestionByKey(seerahKey(q.id))?.question.id).toBe(q.id);
  });

  it('resolves source ids to sira citations for the feedback panel', () => {
    expect(resolveSources(getQuestion('e01-q1')!)).toEqual([{ sourceName: 'Quran al-Fil 105:1–5', sourceReference: '' }]);
    for (const q of QUESTIONS) expect(resolveSources(q).length).toBe(q.sourceIds.length);
  });

  it('offers every question to the daily challenge and suggests the next episode as a quest', () => {
    expect(getDailyCandidates()).toHaveLength(QUESTIONS.length);
    expect(getDailyCandidates()[0].key.startsWith('seerah:')).toBe(true);
    expect(getQuestCandidates({ day: '2026-10-07' })).toEqual([expect.objectContaining({ kind: 'episode', target: episodeTarget('episode-01'), topicArea: 'seerah' })]);
  });

  it('registers search, the home section and profile links', () => {
    const results = searchAll('Bilal', 'en');
    expect(results[0]).toMatchObject({ feature: 'seerah', key: 'seerah:person:bilal', href: { pathname: '/seerah/person/[id]', params: { id: 'bilal' } } });
    expect(getHomeSections().map((s) => s.id)).toContain('todays-seerah');
    expect(getProfileLinks().map((l) => l.href)).toEqual(['/seerah/bookmarks', '/seerah/reflections']);
    expect(getProfileLinks()[0].label('de')).toBe(translateNs(seerahI18n, 'de', 'link.bookmarks'));
  });

  it('defines the complete "seerah" i18n namespace', () => {
    const ns = getNamespaces().find((n) => n.name === 'seerah');
    expect(ns).toBeDefined();
    expect(Object.keys(ns!.dictionaries.de).sort()).toEqual(Object.keys(ns!.dictionaries.en).sort());
    expect(Object.keys(ns!.dictionaries.bs).sort()).toEqual(Object.keys(ns!.dictionaries.en).sort());
  });
});

describe('episodes, XP and badges', () => {
  it('awards completion XP once per episode, counts the streak and the quest, and earns First Journey', () => {
    useAppStore.getState().refreshQuests(true);
    const first = useSeerahStore.getState().completeEpisode('episode-01', [true, true, false]);
    expect(first.firstCompletion).toBe(true);
    expect(first.xp).toBeGreaterThanOrEqual(XP.episodeComplete);
    const app = useAppStore.getState();
    expect(app.xpAwards[xpReason.complete('episode-01')]).toBe(XP.episodeComplete);
    expect(app.xpAwards[xpReason.perfect('episode-01')]).toBeUndefined();
    expect(app.streak.current).toBe(1);
    expect(app.badges.first_journey).toBeDefined();
    expect(app.quests.find((q) => q.kind === 'episode')?.completed).toBe(true);

    const again = useSeerahStore.getState().completeEpisode('episode-01', [true, true, true]);
    expect(again.firstCompletion).toBe(false);
    expect(again.xp).toBe(XP.perfectEpisodeQuizBonus); // only the perfect bonus is new
    const third = useSeerahStore.getState().completeEpisode('episode-01', [true, true, true]);
    expect(third.xp).toBe(0);
    expect(useAppStore.getState().badges.perfect_score).toBeDefined();
  });

  it('grants discovery and reflection XP once per item', () => {
    const before = useAppStore.getState().xp;
    expect(useSeerahStore.getState().discover('event', ['hijrah', 'badr'])).toBe(2 * SEERAH_XP.discovery);
    expect(useSeerahStore.getState().discover('event', ['hijrah'])).toBe(0);
    const input = { questionId: 'e01-r1', episodeId: 'episode-01', text: 'A thought', optionIndex: null };
    expect(useSeerahStore.getState().saveReflection(input)).toBe(SEERAH_XP.reflection);
    expect(useSeerahStore.getState().saveReflection({ ...input, text: 'Edited' })).toBe(0);
    useSeerahStore.getState().saveReflection({ ...input, text: '' });
    expect(useSeerahStore.getState().saveReflection(input)).toBe(0); // removed and re-added: no farming
    expect(useAppStore.getState().xp - before).toBe(2 * SEERAH_XP.discovery + SEERAH_XP.reflection);
  });

  it('reports metrics that earn the explorer badges', () => {
    useSeerahStore.getState().discover('event', EVENTS.map((e) => e.id));
    useSeerahStore.getState().discover('person', PEOPLE.map((p) => p.id));
    for (const ep of EPISODES) useSeerahStore.getState().completeEpisode(ep.id, [true, true, true]);
    for (const ep of EPISODES.slice(0, 5)) {
      useSeerahStore.getState().saveReflection({ questionId: ep.reflectionQuestions[0].id, episodeId: ep.id, text: 'x', optionIndex: null });
    }
    expect(collectFeatureMetrics()).toMatchObject({ 'seerah.episodesCompleted': 10, 'seerah.allEpisodesCompleted': 1, 'seerah.reflections': 5 });
    const badges = useAppStore.getState().badges;
    for (const id of ['first_journey', 'makkah_explorer', 'madinah_explorer', 'timeline_explorer', 'history_seeker', 'reflective_mind', 'seerah_student', 'ten_episodes'] as const) {
      expect({ id, earned: !!badges[id] }).toEqual({ id, earned: true });
    }
  });

  it('feeds Continue and Recently completed on the home screen', () => {
    expect(getContinueItem()).toBeNull();
    useSeerahStore.getState().setEpisodeStep('episode-03', 'people');
    expect(getContinueItem()).toMatchObject({ key: 'seerah:episode:episode-03', topicArea: 'seerah', href: { pathname: '/seerah/episode/[id]', params: { id: 'episode-03' } } });
    expect(getContinueItem()?.progress).toBeCloseTo(5 / 11);
    useSeerahStore.getState().completeEpisode('episode-03', [true]);
    expect(getContinueItem()).toBeNull();
    expect(getRecentlyCompleted().map((i) => i.key)).toEqual(['seerah:episode:episode-03']);
  });
});

describe('persistence and reset', () => {
  it('persists bookmarks and reflections and hydrates them', async () => {
    useSeerahStore.getState().toggleBookmark('place', 'badr');
    useSeerahStore.getState().saveReflection({ questionId: 'e02-r1', episodeId: 'episode-02', text: 'Učiti', optionIndex: 1 });
    useSeerahStore.getState().setEpisodeStep('episode-02', 'locations');
    const s = useSeerahStore.getState();
    await savePersisted(SEERAH_PERSIST, {
      episodes: s.episodes,
      lastEpisodeId: s.lastEpisodeId,
      quizResults: s.quizResults,
      perfectEpisodes: s.perfectEpisodes,
      bookmarks: s.bookmarks,
      reflections: s.reflections,
      discovered: s.discovered,
    });
    useSeerahStore.setState({ ...createEmptySeerah(), hydrated: false });
    await useSeerahStore.getState().hydrate();
    const h = useSeerahStore.getState();
    expect(h.hydrated).toBe(true);
    expect(h.bookmarks).toEqual([expect.objectContaining({ type: 'place', id: 'badr' })]);
    expect(h.reflections['e02-r1']).toMatchObject({ text: 'Učiti', optionIndex: 1 });
    expect(h.episodes['episode-02'].step).toBe('locations');
  });

  it('auto-saves after changes', async () => {
    jest.useFakeTimers();
    const stop = startSeerahAutoSave();
    useSeerahStore.getState().toggleBookmark('event', 'hijrah');
    jest.advanceTimersByTime(400);
    jest.useRealTimers();
    stop();
    await new Promise((r) => setTimeout(r, 0));
    const raw = JSON.parse((await AsyncStorage.getItem(SEERAH_PERSIST.key)) ?? 'null');
    expect(raw?.data.bookmarks[0]).toMatchObject({ type: 'event', id: 'hijrah' });
  });

  it('starts fresh on corrupt storage', async () => {
    await AsyncStorage.setItem(SEERAH_PERSIST.key, '{oops');
    await useSeerahStore.getState().hydrate();
    expect(useSeerahStore.getState().bookmarks).toEqual([]);
  });

  it('"Reset progress" clears the seerah store and its storage', async () => {
    useSeerahStore.getState().completeEpisode('episode-01', [true]);
    useSeerahStore.getState().toggleBookmark('person', 'bilal');
    await savePersisted(SEERAH_PERSIST, createEmptySeerah());
    await resetFeatures();
    const s = useSeerahStore.getState();
    expect(s.episodes).toEqual({});
    expect(s.bookmarks).toEqual([]);
    expect(await AsyncStorage.getItem(SEERAH_PERSIST.key)).toBeNull();
  });
});

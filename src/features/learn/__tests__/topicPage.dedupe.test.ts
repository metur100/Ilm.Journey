import AsyncStorage from '@react-native-async-storage/async-storage';

import { localize, topicName, translate } from '@/core/i18n';
import { type Language, type LocalizedText, TOPIC_IDS, type TopicId } from '@/core/models';
import { clearRegistryForTests } from '@/core/registry';
import { listSurahs } from '@/features/quran';
import { STORIES } from '@/features/stories/content';
import { learnAchievements, learnCollectionCards } from '@/features/learn/collection';
import { getUnit, unitsOfArea } from '@/features/learn/content';
import { getQuest, questsOfTopic } from '@/features/learn/content/quests';
import { clearLearnExtensionsForTests, getTopicTools, type TopicPathItem } from '@/features/learn/extensions';
import { buildTopicPath, masterItemId, pathProgress, UNITS_TAUGHT_ELSEWHERE } from '@/features/learn/path';
import { EMPTY_QUEST_DATA } from '@/features/learn/quests/services/progress';
import { useQuestStore } from '@/features/learn/quests/store/questStore';
import { registerLearnFeature } from '@/features/learn/register';
import { EMPTY_LEARN } from '@/features/learn/services/progression';
import { useLearnStore } from '@/features/learn/store/learnStore';

const LANGUAGES: readonly Language[] = ['en', 'de', 'bs'];
const learn = () => useLearnStore.getState();
const done = { completed: true, attempts: 1, bestScore: 100, completedAt: '2026-10-01T00:00:00.000Z' };

function title(topic: TopicId, item: TopicPathItem, lang: Language): string {
  if (item.kind === 'unit') return localize(getUnit(item.id)!.title, lang);
  if (item.kind === 'master') return `master ${translate(lang, topicName(topic))}`;
  return localize(item.title as LocalizedText, lang);
}

/** "The Five Daily Prayers" and "Five Daily Prayers", "Honesty & Trust" and "Honesty and Trust" are the same title. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\b(the|die|der|das)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Surah numbers a path item teaches: memorisation quests recite them, surah steps open them. */
function surahsOf(item: TopicPathItem): number[] {
  if (item.kind !== 'quest') return [];
  const surahStep = /^surah-(\d+)$/.exec(item.id);
  if (surahStep) return [Number(surahStep[1])];
  return getQuest(item.id)?.steps.flatMap((s) => (s.kind === 'recite' ? [s.surahNumber] : [])) ?? [];
}

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  clearLearnExtensionsForTests();
  registerLearnFeature();
  useLearnStore.setState({ ...EMPTY_LEARN, hydrated: true });
  useQuestStore.setState({ ...EMPTY_QUEST_DATA, hydrated: true });
});

describe('every topic page shows each piece of content once', () => {
  it.each(TOPIC_IDS)('%s: no repeated ids or titles in the path and tools', (topic) => {
    const path = buildTopicPath(topic, learn());
    const ids = path.map((e) => e.item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const lang of LANGUAGES) {
      const titles = [...path.map((e) => title(topic, e.item, lang)), ...getTopicTools(topic).map((t) => t.label(lang))].map(normalize);
      const repeated = titles.filter((t, i) => titles.indexOf(t) !== i);
      expect({ topic, lang, repeated }).toEqual({ topic, lang, repeated: [] });
    }
    expect(path.at(-1)?.item.id).toBe(masterItemId(topic));
  });

  it('Quran: every Juz ʿAmma surah (and Al-Fatiha) appears exactly once', () => {
    const numbers = buildTopicPath('quran', learn()).flatMap((e) => surahsOf(e.item));
    expect(new Set(numbers).size).toBe(numbers.length);
    expect([...numbers].sort((a, b) => a - b)).toEqual(listSurahs('memorization').map((s) => s.number).sort((a, b) => a - b));
    // The surah list is not repeated as a tool card next to the path.
    expect(getTopicTools('quran').map((t) => t.id)).not.toContain('quran-memorization');
  });

  it('Prophets: every prophet has one step – his story – and no unit or tool repeats it', () => {
    const path = buildTopicPath('prophets', learn());
    const stories = path.filter((e) => e.item.id.startsWith('prophet-')).map((e) => e.item.id);
    expect(stories).toEqual(STORIES.map((s) => `prophet-${s.id}`));
    const names = STORIES.map((s) => s.prophetName.en);
    for (const entry of path.filter((e) => e.item.kind === 'unit')) {
      const unitTitle = localize(getUnit(entry.item.id)!.title, 'en');
      expect({ unitTitle, names: names.filter((n) => unitTitle.includes(n)) }).toEqual({ unitTitle, names: [] });
    }
    expect(getTopicTools('prophets')).toEqual([]);
  });

  it('Salah: one step for what Salah is, the five prayers and wudu', () => {
    const ids = buildTopicPath('salah', learn()).map((e) => e.item.id);
    expect(ids).toEqual([...questsOfTopic('salah').map((q) => q.id), 'salah-sunnah-fard', 'salah-five-prayers', masterItemId('salah')]);
  });
});

describe('units taught by a quest or story', () => {
  it('reference existing units and items of the same topic path, and leave that path', () => {
    for (const [unitId, teachers] of Object.entries(UNITS_TAUGHT_ELSEWHERE)) {
      const unit = getUnit(unitId);
      expect(unit).toBeDefined();
      const ids = buildTopicPath(unit!.areaId, learn()).map((e) => e.item.id);
      expect(ids).not.toContain(unitId);
      for (const id of teachers) expect({ unitId, id, inPath: ids.includes(id) }).toEqual({ unitId, id, inPath: true });
    }
  });

  it('keep their test questions in the Master Challenge pool', () => {
    for (const unitId of Object.keys(UNITS_TAUGHT_ELSEWHERE)) {
      const unit = getUnit(unitId)!;
      expect(unitsOfArea(unit.areaId).map((u) => u.id)).toContain(unitId);
    }
  });

  it('old progress on a hidden unit is harmless; the master unlocks after the visible steps', () => {
    useLearnStore.setState({ units: { 'salah-basics': done, 'salah-wudu': done }, lastVisited: { topic: 'salah', itemId: 'salah-basics', at: done.completedAt } });
    const path = buildTopicPath('salah', learn());
    expect(path.some((e) => e.item.id === 'salah-basics')).toBe(false);
    expect(pathProgress('salah', learn())).toEqual({ completed: 0, total: path.length });

    for (const q of questsOfTopic('salah')) useQuestStore.getState().completeQuest(q.id, [true]);
    useLearnStore.setState({ units: { ...learn().units, 'salah-sunnah-fard': done, 'salah-five-prayers': done } });
    expect(buildTopicPath('salah', learn()).find((e) => e.item.kind === 'master')?.status).toBe('available');
  });

  it('akhlaq good-deed cards unlock with the quest that teaches them – and stay unlocked from the old unit', () => {
    const deeds = learnCollectionCards().filter((c) => c.category === 'deeds');
    expect(deeds).toHaveLength(7);
    for (const card of deeds) expect(card.unlock).toMatch(/^quest:akhlaq-q[1-5]:complete$/);

    useQuestStore.getState().completeQuest('akhlaq-q4', [true]);
    expect(learnAchievements()).toContain('quest:akhlaq-q4:complete');

    useLearnStore.setState({ units: { 'akhlaq-mercy-family': done } });
    expect(learnAchievements()).toEqual(expect.arrayContaining(['quest:akhlaq-q3:complete', 'quest:akhlaq-q5:complete']));
  });
});

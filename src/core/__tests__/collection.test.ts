import AsyncStorage from '@react-native-async-storage/async-storage';

import { catalogue, hasArt } from '@/core/art';
import {
  COLLECTION_ART_NAMES,
  COLLECTION_PERSIST,
  collectionArtNames,
  collectionProgress,
  cardsUnlockedBy,
  isCardUnlocked,
  newlyUnlockedCards,
  parseUnlockKey,
  registerCollectionCore,
  sortCards,
  unlockHint,
  useCollectionStore,
} from '@/core/collection';
import { translate } from '@/core/i18n';
import { COLLECTION_CATEGORIES, LANGUAGES, type CollectionCard, TOPIC_IDS } from '@/core/models';
import { collectAchievements, getCollectionCards, hydrateFeatures, resetFeatures } from '@/core/registry';
import { savePersisted } from '@/core/storage';
import { registerFeatures } from '@/features';
import { learnCollectionCards } from '@/features/learn/collection';
import { getUnit } from '@/features/learn/content';
import { ALPHABET, getQuest } from '@/features/learn/content/quests';
import { useQuestStore } from '@/features/learn/quests/store/questStore';
import { getDua, getSurah } from '@/features/quran';
import { seerahCollectionCards } from '@/features/seerah/collection';
import { getEpisode } from '@/features/seerah/content';
import { storiesCollectionCards } from '@/features/stories/collection';
import { getStory } from '@/features/stories/content';
import { useStoriesStore } from '@/features/stories/store/storiesStore';

registerFeatures();

const cards = () => getCollectionCards();
/** The cards seeded by the Learn, Stories and Seerah features (games may register more). */
const seedCards = () => [...learnCollectionCards(), ...storiesCollectionCards(), ...seerahCollectionCards()];
const nonEmpty = (s: string | undefined) => typeof s === 'string' && s.trim().length > 0;

describe('collection seed', () => {
  it('has about sixty cards with unique ids in every category', () => {
    expect(seedCards().length).toBeGreaterThanOrEqual(55);
    expect(seedCards().length).toBeLessThanOrEqual(80);
    expect(cards()).toEqual(expect.arrayContaining(seedCards()));
    const ids = cards().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of COLLECTION_CATEGORIES) expect({ category, count: cards().filter((c) => c.category === category).length > 0 }).toEqual({ category, count: true });
  });

  it('gives every card a title, fact and unlock title in every language and at least one source', () => {
    for (const card of cards()) {
      for (const lang of LANGUAGES) {
        expect({ id: card.id, lang, title: nonEmpty(card.title[lang]) }).toEqual({ id: card.id, lang, title: true });
        expect({ id: card.id, lang, fact: nonEmpty(card.fact[lang]) }).toEqual({ id: card.id, lang, fact: true });
        expect({ id: card.id, lang, unlockTitle: nonEmpty(card.unlockTitle[lang]) }).toEqual({ id: card.id, lang, unlockTitle: true });
        if (card.subtitle) expect({ id: card.id, lang, subtitle: nonEmpty(card.subtitle[lang]) }).toEqual({ id: card.id, lang, subtitle: true });
      }
      expect({ id: card.id, sources: card.sources.length > 0 && card.sources.every((s) => nonEmpty(s.sourceName)) }).toEqual({ id: card.id, sources: true });
    }
  });

  it('uses well-formed unlock keys that point to existing content', () => {
    for (const card of cards()) {
      const rule = parseUnlockKey(card.unlock);
      expect({ id: card.id, key: card.unlock, valid: rule !== null }).toEqual({ id: card.id, key: card.unlock, valid: true });
      if (!rule) continue;
      const exists = (() => {
        switch (rule.kind) {
          case 'story':
            return !!getStory(rule.id);
          case 'episode':
            return !!getEpisode(rule.id);
          case 'surah':
            return !!getSurah(Number(rule.id));
          case 'dua':
            return !!getDua(rule.id);
          case 'letter':
            return ALPHABET.some((l) => l.letter === rule.id);
          case 'unit':
            return !!getUnit(rule.id);
          case 'quest':
            return !!getQuest(rule.id);
          case 'master':
            return (TOPIC_IDS as readonly string[]).includes(rule.id);
          case 'game':
            return true;
        }
      })();
      expect({ id: card.id, key: card.unlock, exists }).toEqual({ id: card.id, key: card.unlock, exists: true });
    }
  });

  it('copies facts from the content (surah facts are composed from data fields only)', () => {
    const story = getStory('nuh')!;
    expect(cards().find((c) => c.id === 'object-ark')?.fact).toEqual(story.scenes.find((s) => s.id === 'nuh-s2')?.text);
    expect(cards().find((c) => c.id === 'dua-yunus-in-the-darkness')?.fact).toEqual(getDua('yunus-in-the-darkness')?.context);
    const ikhlas = cards().find((c) => c.id === 'surah-112')!;
    expect(ikhlas.fact.en).toBe('Surah Al-Ikhlaas means “Sincerity”. It has 4 ayahs and was revealed in Makkah.');
    expect(ikhlas.fact.bs).toContain('Mekki');
    expect(cards().find((c) => c.id === 'surah-110')?.fact.de).toContain('Medina');
  });

  it('lists every art name it uses in COLLECTION_ART_NAMES', () => {
    expect([...COLLECTION_ART_NAMES]).toEqual(collectionArtNames(seedCards()));
    expect(collectionArtNames()).toEqual(expect.arrayContaining([...COLLECTION_ART_NAMES]));
    for (const name of collectionArtNames()) expect(name).toMatch(/^[a-z]+\.[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  // Active once the art library lands (the stub catalogue is empty).
  if (Object.keys(catalogue).length > 0) {
    it('has a piece in the art library for every card', () => {
      for (const name of collectionArtNames()) expect({ name, exists: hasArt(name) }).toEqual({ name, exists: true });
    });
  }
});

describe('unlock rules', () => {
  const card = (id: string): CollectionCard => cards().find((c) => c.id === id)!;

  it('parses the achievement vocabulary', () => {
    expect(parseUnlockKey('game:memory:2')).toEqual({ kind: 'game', id: 'memory', level: 2 });
    expect(parseUnlockKey('story:nuh:complete')).toEqual({ kind: 'story', id: 'nuh' });
    expect(parseUnlockKey('episode:episode-01')).toEqual({ kind: 'episode', id: 'episode-01' });
    expect(parseUnlockKey('surah:112:memorised')).toEqual({ kind: 'surah', id: '112' });
    expect(parseUnlockKey('letter:ب:traced')).toEqual({ kind: 'letter', id: 'ب' });
    expect(parseUnlockKey('master:salah:passed')).toEqual({ kind: 'master', id: 'salah' });
    for (const bad of ['', 'story:nuh', 'story:nuh:done', 'episode:', 'episode:a:b', 'game:memory', 'game:memory:0', 'surah:abc:memorised', 'foo:bar:complete']) {
      expect({ bad, parsed: parseUnlockKey(bad) }).toEqual({ bad, parsed: null });
    }
  });

  it('unlocks deterministically from achievements', () => {
    const achievements = new Set(['story:nuh:complete', 'episode:episode-01', 'surah:112:memorised']);
    expect(isCardUnlocked(card('object-ark'), achievements)).toBe(true);
    expect(isCardUnlocked(card('object-fire'), achievements)).toBe(false);
    const first = cards().filter((c) => isCardUnlocked(c, achievements)).map((c) => c.id);
    const second = cards().filter((c) => isCardUnlocked(c, new Set([...achievements].reverse()))).map((c) => c.id);
    expect(second).toEqual(first);
    expect(first).toEqual(expect.arrayContaining(['object-ark', 'place-judi', 'place-makkah', 'event-elephant', 'surah-112']));
  });

  it('finds the cards an achievement unlocks', () => {
    expect(cardsUnlockedBy('story:nuh:complete').map((c) => c.id)).toEqual(['place-judi', 'object-ark']);
    expect(cardsUnlockedBy('story:musa:complete').map((c) => c.id)).toEqual(['object-basket', 'object-staff']);
    expect(cardsUnlockedBy('nothing:here')).toEqual([]);
  });

  it('reports newly unlocked cards in a stable order', () => {
    const before = new Set(['story:nuh:complete']);
    const after = new Set(['story:nuh:complete', 'episode:episode-05', 'story:musa:complete']);
    const ids = newlyUnlockedCards(before, after).map((c) => c.id);
    expect(ids).toEqual(newlyUnlockedCards(new Set(before), new Set([...after].reverse())).map((c) => c.id));
    expect(ids).toEqual(['place-thawr', 'place-quba', 'place-madinah', 'event-hijrah', 'object-basket', 'object-staff']);
    expect(newlyUnlockedCards(after, after)).toEqual([]);
    expect(sortCards(sortCards(cards())).map((c) => c.id)).toEqual(sortCards(cards()).map((c) => c.id));
  });

  it('counts progress per category', () => {
    const progress = collectionProgress(new Set(['story:musa:complete']));
    expect(progress.total).toBe(cards().length);
    expect(progress.unlocked).toBe(2);
    expect(progress.categories.objects.unlocked).toBe(2);
    expect(COLLECTION_CATEGORIES.reduce((sum, c) => sum + progress.categories[c].total, 0)).toBe(cards().length);
    expect(collectionProgress(new Set()).unlocked).toBe(0);
  });

  it('builds "How to unlock" hints in every language', () => {
    expect(unlockHint(card('object-ark'), 'en')).toBe('Complete the story “Nuh: The Great Ark”.');
    expect(unlockHint(card('surah-112'), 'de')).toBe('Lerne die Sure Al-Ikhlaas auswendig: markiere jeden Vers als gelernt.');
    expect(unlockHint(card('place-makkah'), 'bs')).toContain('Završi epizodu Sire');
    const gameCard: CollectionCard = { ...card('object-ark'), unlock: 'game:memory:3', unlockTitle: { en: 'Memory', de: 'Memory', bs: 'Memorija' } };
    expect(unlockHint(gameCard, 'en')).toBe('Complete level 3 of the game “Memory”.');
    expect(unlockHint({ ...gameCard, unlock: 'weird' }, 'en')).toBe(translate('en', 'collection.unlock.other', { title: 'Memory' }));
    for (const c of cards()) {
      for (const lang of LANGUAGES) {
        const hint = unlockHint(c, lang);
        expect({ id: c.id, lang, ok: nonEmpty(hint) && !hint.includes('{') && !hint.startsWith('collection.') }).toEqual({ id: c.id, lang, ok: true });
      }
    }
  });
});

describe('achievements from feature stores', () => {
  afterEach(async () => {
    await useQuestStore.getState().reset();
    await useStoriesStore.getState().reset();
  });

  it('reports traced letters, memorised surahs, learned duas and finished stories', () => {
    expect(collectAchievements().size).toBe(0);
    useQuestStore.getState().markLetterTraced('ب');
    useQuestStore.getState().toggleDuaLearned('yunus-in-the-darkness');
    for (const ayah of [1, 2, 3]) useQuestStore.getState().setAyahLearned(112, ayah, true);
    expect(collectAchievements().has('surah:112:memorised')).toBe(false);
    useQuestStore.getState().setAyahLearned(112, 4, true);
    useStoriesStore.setState({ stories: { nuh: { completed: true, bestStars: 3, bestScore: 1, attempts: 1 } } });
    const achievements = collectAchievements();
    expect([...achievements].sort()).toEqual(['dua:yunus-in-the-darkness:learned', 'letter:ب:traced', 'story:nuh:complete', 'surah:112:memorised']);
    expect(collectionProgress(achievements).unlocked).toBe(5);
  });
});

describe('collection store', () => {
  beforeAll(() => registerCollectionCore());

  beforeEach(async () => {
    await useCollectionStore.getState().reset();
  });

  it('marks cards as seen once', () => {
    useCollectionStore.getState().markSeen('object-ark');
    useCollectionStore.getState().markSeen('object-ark');
    expect(useCollectionStore.getState().seen).toEqual(['object-ark']);
  });

  it('hydrates from storage, sanitizes and resets through the lifecycle', async () => {
    await savePersisted(COLLECTION_PERSIST, { seen: ['place-makkah', 7, 'place-makkah'] as unknown as string[] });
    await hydrateFeatures();
    expect(useCollectionStore.getState().seen).toEqual(['place-makkah']);
    expect(useCollectionStore.getState().hydrated).toBe(true);
    await resetFeatures();
    expect(useCollectionStore.getState().seen).toEqual([]);
    expect(await AsyncStorage.getItem(COLLECTION_PERSIST.key)).toBeNull();
    expect(COLLECTION_PERSIST.key).toBe('ilmjourney:collection');
  });
});

import { type CoreKey, localize, translate } from '../i18n';
import { type AchievementKey, COLLECTION_CATEGORIES, type CollectionCard, type CollectionCategory, type Language } from '../models';
import { collectAchievements, getCollectionCards } from '../registry';

/**
 * Collection album logic (pure): unlock rules, progress and "How to unlock" hints. Cards unlock deterministically
 * from achievement keys (see `AchievementKey` in core/models/collection) – never randomly.
 */

export type UnlockRuleKind = 'game' | 'story' | 'episode' | 'surah' | 'dua' | 'letter' | 'unit' | 'quest' | 'master';

export const UNLOCK_RULE_KINDS: readonly UnlockRuleKind[] = ['game', 'story', 'episode', 'surah', 'dua', 'letter', 'unit', 'quest', 'master'];

export interface ParsedUnlock {
  kind: UnlockRuleKind;
  /** Game, story, episode, dua, unit or quest id; surah number; letter character; master topic. */
  id: string;
  /** Game level (game keys only). */
  level?: number;
}

/** Trailing word of each rule kind's key (`story:<id>:complete`, …); null = the key has no trailing word. */
const SUFFIX: Record<UnlockRuleKind, string | null> = {
  game: null,
  story: 'complete',
  episode: null,
  surah: 'memorised',
  dua: 'learned',
  letter: 'traced',
  unit: 'complete',
  quest: 'complete',
  master: 'passed',
};

const isKind = (value: string): value is UnlockRuleKind => (UNLOCK_RULE_KINDS as readonly string[]).includes(value);

/** Parses an achievement key; returns null when it is not well-formed. */
export function parseUnlockKey(key: AchievementKey): ParsedUnlock | null {
  const parts = key.split(':');
  const [kind, id] = parts;
  if (!kind || !isKind(kind) || !id || id.trim() !== id) return null;
  if (kind === 'game') {
    if (parts.length !== 3 || !/^[1-9]\d*$/.test(parts[2])) return null;
    return { kind, id, level: Number(parts[2]) };
  }
  const suffix = SUFFIX[kind];
  if (suffix === null ? parts.length !== 2 : parts.length !== 3 || parts[2] !== suffix) return null;
  if (kind === 'surah' && !/^[1-9]\d*$/.test(id)) return null;
  return { kind, id };
}

/** True when the learner has earned the card's achievement key. */
export function isCardUnlocked(card: CollectionCard, achievements: ReadonlySet<AchievementKey>): boolean {
  return achievements.has(card.unlock);
}

/** Cards in album order: by category (COLLECTION_CATEGORIES), then `order`, then registration order. */
export function sortCards(cards: readonly CollectionCard[]): CollectionCard[] {
  return cards
    .map((card, index) => ({ card, index }))
    .sort(
      (a, b) =>
        COLLECTION_CATEGORIES.indexOf(a.card.category) - COLLECTION_CATEGORIES.indexOf(b.card.category) ||
        (a.card.order ?? a.index) - (b.card.order ?? b.index) ||
        a.index - b.index,
    )
    .map(({ card }) => card);
}

/** Every registered card in album order. */
export function allCards(cards: readonly CollectionCard[] = getCollectionCards()): CollectionCard[] {
  return sortCards(cards);
}

/** The cards an achievement key unlocks (album order). */
export function cardsUnlockedBy(achievementKey: AchievementKey, cards: readonly CollectionCard[] = getCollectionCards()): CollectionCard[] {
  return sortCards(cards.filter((card) => card.unlock === achievementKey));
}

/**
 * Cards unlocked by `after` but not by `before` (album order – stable for the same inputs). Used after a game, story
 * or episode to show "New card unlocked!".
 */
export function newlyUnlockedCards(
  before: ReadonlySet<AchievementKey>,
  after: ReadonlySet<AchievementKey>,
  cards: readonly CollectionCard[] = getCollectionCards(),
): CollectionCard[] {
  return sortCards(cards.filter((card) => isCardUnlocked(card, after) && !isCardUnlocked(card, before)));
}

export interface CategoryProgress {
  unlocked: number;
  total: number;
}

export interface CollectionProgress extends CategoryProgress {
  categories: Record<CollectionCategory, CategoryProgress>;
}

/** Unlocked / total cards overall and per category. */
export function collectionProgress(
  achievements: ReadonlySet<AchievementKey> = collectAchievements(),
  cards: readonly CollectionCard[] = getCollectionCards(),
): CollectionProgress {
  const categories = Object.fromEntries(COLLECTION_CATEGORIES.map((c) => [c, { unlocked: 0, total: 0 }])) as Record<CollectionCategory, CategoryProgress>;
  let unlocked = 0;
  for (const card of cards) {
    const entry = categories[card.category];
    entry.total++;
    if (isCardUnlocked(card, achievements)) {
      entry.unlocked++;
      unlocked++;
    }
  }
  return { unlocked, total: cards.length, categories };
}

/** "How to unlock" text for a card, built from its rule kind and `unlockTitle`. */
export function unlockHint(card: CollectionCard, language: Language): string {
  const parsed = parseUnlockKey(card.unlock);
  const title = localize(card.unlockTitle, language);
  if (!parsed) return translate(language, 'collection.unlock.other', { title });
  const key = `collection.unlock.${parsed.kind}` as CoreKey;
  return translate(language, key, { title, level: parsed.level ?? 1 });
}

/** Translation key of a category name. */
export const categoryKey = (category: CollectionCategory) => `collection.category.${category}` as CoreKey;

/** Sorted unique art names of the given (default: all registered) cards. */
export function collectionArtNames(cards: readonly CollectionCard[] = getCollectionCards()): string[] {
  return [...new Set(cards.map((c) => c.art))].sort();
}

/**
 * Art names used by the seeded cards (`registerLearnCollection`, `registerStoriesCollection`,
 * `registerSeerahCollection`) – the list the art library has to provide. The collection test checks that it equals
 * `collectionArtNames()` after the features registered.
 */
export const COLLECTION_ART_NAMES: readonly string[] = [
  'animal.camel',
  'animal.dove',
  'animal.elephant',
  'animal.whale',
  'food.dates',
  'garden.sapling',
  'object.ark',
  'object.basket',
  'object.book',
  'object.coins',
  'object.compass',
  'object.fire',
  'object.grain-sack',
  'object.lantern',
  'object.pen',
  'object.prayer-mat',
  'object.quran-stand',
  'object.scroll',
  'object.staff',
  'object.well',
  'pattern.star-tile',
  'place.badr-wells',
  'place.cave-hira',
  'place.cave-thawr',
  'place.city-generic',
  'place.desert-road',
  'place.kaaba',
  'place.madinah-city',
  'place.makkah-city',
  'place.masjid-nabawi',
  'place.masjid-nabawi-early',
  'place.mount-judi',
  'place.mount-uhud',
  'place.taif',
  'place.valley',
  'scene.mountains',
  'ui.heart',
  'ui.star-filled',
];

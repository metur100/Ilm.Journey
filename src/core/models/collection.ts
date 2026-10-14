import type { LocalizedText, SourceRef } from './common';

/**
 * Collection album (see docs/GAMES.md "Engagement systems"). Cards are registered by features (built from their
 * existing content, never new claims) and unlock deterministically from achievement keys – never randomly.
 */
export type CollectionCategory = 'letters' | 'places' | 'surahs' | 'duas' | 'events' | 'objects' | 'deeds';

export const COLLECTION_CATEGORIES: readonly CollectionCategory[] = ['letters', 'places', 'surahs', 'duas', 'events', 'objects', 'deeds'];

/**
 * Achievement keys – the vocabulary of unlock rules. Features report the keys their learner has earned through
 * `registerAchievements` (core reports the game keys itself):
 *
 * | Key                       | Earned when                                         |
 * | ------------------------- | --------------------------------------------------- |
 * | `game:<gameId>:<level>`   | a game level was completed (≥ 1 star)               |
 * | `story:<storyId>:complete`| a prophet story was finished                        |
 * | `episode:<episodeId>`     | a Seerah episode was completed                      |
 * | `surah:<n>:memorised`     | every ayah of surah n is marked as learned          |
 * | `dua:<duaId>:learned`     | a Quranic dua was marked as learned                 |
 * | `letter:<letter>:traced`  | an Arabic letter was traced in the alphabet tool    |
 * | `unit:<unitId>:complete`  | a Learn unit was completed                          |
 * | `quest:<questId>:complete`| a beginner quest was completed                      |
 * | `master:<topic>:passed`   | a topic's Master Challenge was passed               |
 */
export type AchievementKey = string;

export interface CollectionCard {
  /** Globally unique, e.g. `letter-alif`, `place-makkah`, `surah-112`. */
  id: string;
  category: CollectionCategory;
  /** Art library name (`<Art name=… />`). */
  art: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  /** Optional Arabic word or letter shown on the card (never Quran text typed by hand). */
  arabic?: string;
  /** Fact on the back of the card – copied from existing content, never a new claim. */
  fact: LocalizedText;
  /** Where the fact comes from (required, at least one). */
  sources: SourceRef[];
  /** Achievement key that unlocks the card (see `AchievementKey`). */
  unlock: AchievementKey;
  /** Name of the thing to complete, used in the "How to unlock" hint (e.g. the story or episode title). */
  unlockTitle: LocalizedText;
  /** Sort order inside its category (default: registration order). */
  order?: number;
}

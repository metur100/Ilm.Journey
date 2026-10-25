import type { GameFact } from '@/core/games';
import type { ConnectPair, KitItem, MemoryPair, SceneSpot, SortBin, SortItem } from '@/core/games/kit';
import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Episodes of a prophet's life (owner feedback: no level may repeat the content of another level). Every level of a
 * prophets game walks through a different, well-established event of that prophet's life as told in the Quran, played
 * with one kit engine, and its "You learned" cards end with a lesson (pouka) for the child – see `lessonFact`.
 *
 * Types and helpers only (no UI): register files import this; the board is `EpisodeBoard.tsx` (loaded lazily).
 */

interface EpisodeBase {
  /** Inline caption under the board before the first move. */
  prompt: LocalizedText;
  /** Hint pointer (default: true on level 1 only – pass it explicitly). */
  hints?: boolean;
  /** Item id → fact id it teaches (missed items become missed facts). */
  factMap: Record<string, string>;
}

/** Put the events of the episode in order (SequenceBoard). */
export interface SequenceEpisode extends EpisodeBase {
  kind: 'sequence';
  items: KitItem[];
  variant?: 'list' | 'path';
  endArt?: string;
}

/** Connect each event with what it means / teaches (ConnectPairs). */
export interface ConnectEpisode extends EpisodeBase {
  kind: 'connect';
  pairs: ConnectPair[];
}

/** Sort cards into 2–3 bins (SortBins). */
export interface SortEpisode extends EpisodeBase {
  kind: 'sort';
  bins: SortBin[];
  items: SortItem[];
}

/** Find the pairs (MemoryPairs). */
export interface MemoryEpisode extends EpisodeBase {
  kind: 'memory';
  pairs: MemoryPair[];
  peekMs?: number;
}

/** Find things in an illustrated scene (TapScene). */
export interface TapEpisode extends EpisodeBase {
  kind: 'tap';
  scene: string;
  spots: SceneSpot[];
  ordered?: boolean;
}

export type Episode = SequenceEpisode | ConnectEpisode | SortEpisode | MemoryEpisode | TapEpisode;

/** Level config of a level that is an episode (games may mix it with their own modes). */
export interface EpisodeConfig {
  mode: 'episode';
  episode: Episode;
}

export const isEpisodeConfig = (config: unknown): config is EpisodeConfig =>
  !!config && typeof config === 'object' && (config as { mode?: unknown }).mode === 'episode';

/** Ids of the items the learner works with in an episode. */
export function episodeItemIds(episode: Episode): string[] {
  switch (episode.kind) {
    case 'sequence':
    case 'sort':
      return episode.items.map((i) => i.id);
    case 'connect':
    case 'memory':
      return episode.pairs.map((p) => p.id);
    case 'tap':
      return episode.spots.map((s) => s.id);
  }
}

/** Number of moves of an episode (score: 10 per move). */
export const episodeMoves = (episode: Episode): number => episodeItemIds(episode).length;

/** Every art name an episode draws (for the art tests). */
export function episodeArt(episode: Episode): string[] {
  const faces: { art?: string; spotArt?: string }[] =
    episode.kind === 'sequence'
      ? episode.items
      : episode.kind === 'sort'
        ? [...episode.items, ...episode.bins]
        : episode.kind === 'connect'
          ? episode.pairs.flatMap((p) => [p.left, p.right])
          : episode.kind === 'memory'
            ? episode.pairs.flatMap((p) => (p.b ? [p.a, p.b] : [p.a]))
            : episode.spots;
  const extra = episode.kind === 'tap' ? [episode.scene] : episode.kind === 'sequence' && episode.endArt ? [episode.endArt] : [];
  return [...new Set([...faces.flatMap((f) => [f.art, f.spotArt]).filter((x): x is string => !!x), ...extra])];
}

/** How the lesson card starts in each language ("Lesson:" / "Lehre:" / "Pouka:"). */
export const LESSON_PREFIX: LocalizedText = { en: 'Lesson: ', de: 'Lehre: ', bs: 'Pouka: ' };

/**
 * The lesson (pouka) of a level – always the last "You learned" card. `text` is the moral without the prefix; the
 * sources are the ayahs the lesson is drawn from. The id gets the prefix `lesson-`.
 */
export function lessonFact(id: string, text: LocalizedText, sources: SourceRef[], extra: Partial<Pick<GameFact, 'art' | 'check' | 'reviewKey'>> = {}): GameFact {
  return {
    id: `lesson-${id}`,
    text: { en: LESSON_PREFIX.en + text.en, de: LESSON_PREFIX.de + text.de, bs: LESSON_PREFIX.bs + text.bs },
    sources,
    ...extra,
  };
}

export const isLessonFact = (fact: GameFact): boolean =>
  fact.id.startsWith('lesson-') && fact.text.en.startsWith(LESSON_PREFIX.en) && fact.text.de.startsWith(LESSON_PREFIX.de) && fact.text.bs.startsWith(LESSON_PREFIX.bs);

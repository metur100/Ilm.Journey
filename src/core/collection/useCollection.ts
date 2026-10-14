import { useMemo, useSyncExternalStore } from 'react';

import { useProgressVersion } from '../hooks/useProgress';
import type { AchievementKey, CollectionCard } from '../models';
import { collectAchievements, getCollectionCards, subscribeProgress } from '../registry';
import { useAppStore } from '../store/appStore';
import { allCards, type CollectionProgress, collectionProgress, isCardUnlocked } from './logic';
import { useCollectionStore } from './store';

export interface CollectionEntry {
  card: CollectionCard;
  unlocked: boolean;
  /** Unlocked but not opened yet. */
  isNew: boolean;
}

export interface CollectionState {
  /** Every card in album order. */
  entries: CollectionEntry[];
  progress: CollectionProgress;
  newCount: number;
  achievements: ReadonlySet<AchievementKey>;
}

/** Feature stores (via the registry's progress version) and the app store (game keys) can add achievements. */
function subscribeAchievements(listener: () => void): () => void {
  const stopProgress = subscribeProgress(listener);
  const stopApp = useAppStore.subscribe(listener);
  return () => {
    stopProgress();
    stopApp();
  };
}

/** Stable string snapshot of the earned keys (re-renders only when the set really changes). */
function achievementsSnapshot(): string {
  return [...collectAchievements()].sort().join('\n');
}

/** The learner's earned achievement keys; re-renders when they change. */
export function useAchievements(): ReadonlySet<AchievementKey> {
  const snapshot = useSyncExternalStore(subscribeAchievements, achievementsSnapshot, achievementsSnapshot);
  return useMemo(() => new Set(snapshot ? snapshot.split('\n') : []), [snapshot]);
}

/** Collection album: every card with `unlocked` and `isNew`, plus progress. */
export function useCollection(): CollectionState {
  const version = useProgressVersion();
  const achievements = useAchievements();
  const seen = useCollectionStore((s) => s.seen);

  return useMemo(() => {
    // `version` changes when features (re-)register cards.
    void version;
    const cards = getCollectionCards();
    const seenSet = new Set(seen);
    const entries = allCards(cards).map((card) => {
      const unlocked = isCardUnlocked(card, achievements);
      return { card, unlocked, isNew: unlocked && !seenSet.has(card.id) };
    });
    return {
      entries,
      progress: collectionProgress(achievements, cards),
      newCount: entries.filter((e) => e.isNew).length,
      achievements,
    };
  }, [version, achievements, seen]);
}

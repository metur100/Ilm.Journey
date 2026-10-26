import type { EventSubscription } from 'expo-modules-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useKitColors } from '@/core/games/kit';
import { configureAudioSession, sharedLearnerPlayer } from '@/core/services/audioSession';
import { radius, spacing } from '@/core/theme';
import { audioUrlForAyah } from '@/features/quran';

/**
 * Optional streamed recitation (Mishary Alafasy via the Islamic Network CDN, see docs/AUDIO.md) – only loaded when
 * the learner taps Listen. One ayah or several in a row. Offline the stream cannot start: after a short wait the
 * chip turns into a quiet note and the game simply goes on without audio.
 */

export const STREAM_TIMEOUT_MS = 8000;

export type RecitationState = 'idle' | 'loading' | 'playing' | 'unavailable';

export function useRecitation() {
  const [state, setState] = useState<RecitationState>('idle');
  /** Listener of the ayah that is playing; the player itself is shared and reused (one media session). */
  const active = useRef<EventSubscription | null>(null);
  const queue = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<() => void>(() => undefined);

  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const current = active.current;
    active.current = null;
    if (current) {
      current.remove();
      try {
        sharedLearnerPlayer('game-recitation').pause();
      } catch {
        // ignore
      }
    }
  }, []);

  const stop = useCallback(
    (next: RecitationState = 'idle') => {
      queue.current = [];
      release();
      setState((s) => (s === 'unavailable' ? s : next));
    },
    [release],
  );

  useEffect(() => () => stop(), [stop]);

  const playNext = useCallback(() => {
    const global = queue.current.shift();
    release();
    if (global === undefined) {
      setState((s) => (s === 'unavailable' ? s : 'idle'));
      return;
    }
    try {
      const next = sharedLearnerPlayer('game-recitation');
      const sub: EventSubscription = next.addListener('playbackStatusUpdate', (status) => {
        if (active.current !== sub) return;
        if (status.error) {
          stop('unavailable');
          return;
        }
        if (status.isLoaded) setState('playing');
        if (status.didJustFinish) nextRef.current();
      });
      active.current = sub;
      next.replace({ uri: audioUrlForAyah(global) });
      setState('loading');
      timer.current = setTimeout(() => {
        if (active.current === sub && !next.isLoaded) stop('unavailable');
      }, STREAM_TIMEOUT_MS);
      void configureAudioSession()
        .catch(() => undefined)
        .then(() => {
          if (active.current === sub) next.play();
        });
    } catch {
      stop('unavailable');
    }
  }, [release, stop]);

  useEffect(() => {
    nextRef.current = playNext;
  }, [playNext]);

  /** Plays the ayahs (global numbers) in a row, or stops when something is playing. */
  const toggle = useCallback(
    (globals: number[]) => {
      if (state === 'unavailable') return;
      if (active.current || queue.current.length) {
        stop();
        return;
      }
      queue.current = [...globals];
      playNext();
    },
    [state, stop, playNext],
  );

  return { state, toggle, stop };
}

/** A small "Listen" chip for one or several ayahs; becomes a quiet offline note when the stream is unavailable. */
export function ListenChip({ ayahs, labels }: { ayahs: number[]; labels: { listen: string; stop: string; loading: string; offline: string } }) {
  const k = useKitColors();
  const { state, toggle } = useRecitation();
  if (state === 'unavailable') {
    return (
      <AppText variant="tiny" color={k.textMuted} align="center" testID="listen-offline">
        {labels.offline}
      </AppText>
    );
  }
  const busy = state === 'loading' || state === 'playing';
  const label = state === 'loading' ? labels.loading : busy ? labels.stop : labels.listen;
  return (
    <Pressable
      onPress={() => toggle(ayahs)}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID="listen-chip"
      style={({ pressed }) => [styles.chip, { backgroundColor: busy ? k.goldSoft : k.tileFace, borderColor: busy ? k.gold : k.tileBorder, opacity: pressed ? 0.8 : 1 }]}
    >
      <Icon name={busy ? 'stop' : 'speaker'} size={18} color={k.accent} />
      <AppText variant="small" color={k.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: spacing.xs, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: 40 },
});

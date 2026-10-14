import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { audioUrlForAyah } from '@/features/quran';

/**
 * Optional streamed recitation of one ayah (Mishary Alafasy via the Islamic Network CDN, see the Quran README) –
 * only loaded when the learner taps "Listen". Offline the stream cannot load: after a short wait the button turns
 * into a quiet note and the game simply goes on without audio.
 */

export const STREAM_TIMEOUT_MS = 8000;

export type RecitationState = 'idle' | 'loading' | 'playing' | 'unavailable';

export function useAyahRecitation() {
  const [state, setState] = useState<RecitationState>('idle');
  const player = useRef<AudioPlayer | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback((next: RecitationState = 'idle') => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const current = player.current;
    player.current = null;
    if (current) {
      try {
        current.pause();
        current.remove();
      } catch {
        // ignore
      }
    }
    setState((s) => (s === 'unavailable' ? s : next));
  }, []);

  useEffect(() => () => stop(), [stop]);

  const toggle = useCallback(
    (globalAyah: number) => {
      if (state === 'unavailable') return;
      if (player.current) {
        stop();
        return;
      }
      try {
        void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => undefined);
        const next = createAudioPlayer({ uri: audioUrlForAyah(globalAyah) });
        player.current = next;
        setState('loading');
        timer.current = setTimeout(() => {
          if (player.current === next && !next.isLoaded) stop('unavailable');
        }, STREAM_TIMEOUT_MS);
        next.addListener('playbackStatusUpdate', (status) => {
          if (player.current !== next) return;
          if (status.isLoaded) setState('playing');
          if (status.didJustFinish) stop();
        });
        next.play();
      } catch {
        stop('unavailable');
      }
    },
    [state, stop],
  );

  return { state, toggle, stop };
}

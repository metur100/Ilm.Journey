import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

import { audioUrlForAyah } from '@/features/quran';

/**
 * Optional streamed Quran recitation – exactly like islam-quest's "Listen": the audio of one ayah is loaded from
 * the Islamic Network CDN (Mishary Alafasy) only when the learner taps play. Nothing is downloaded otherwise;
 * without internet the player reports an error after a short wait and the app keeps working offline.
 */

/** How long a stream may take to load before we tell the learner that it needs internet. */
export const STREAM_TIMEOUT_MS = 8000;

let player: AudioPlayer | null = null;
let currentAyah: number | null = null;
let configured = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

async function configure() {
  if (configured) return;
  configured = true;
  try {
    // Recitation is deliberately requested by the learner, so it may play in silent mode.
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch {
    // best effort
  }
}

export function stopRecitation(): void {
  if (player) {
    try {
      player.pause();
      player.remove();
    } catch {
      // ignore
    }
  }
  player = null;
  currentAyah = null;
  notify();
}

/** Starts streaming one ayah (global ayah number). Returns false when audio cannot be created. */
export function playRecitation(globalAyah: number, onEnd: (error: boolean) => void): boolean {
  stopRecitation();
  void configure();
  try {
    const next = createAudioPlayer({ uri: audioUrlForAyah(globalAyah) });
    player = next;
    currentAyah = globalAyah;
    const timeout = setTimeout(() => {
      if (player === next && !next.isLoaded) {
        stopRecitation();
        onEnd(true);
      }
    }, STREAM_TIMEOUT_MS);
    next.addListener('playbackStatusUpdate', (status) => {
      if (player !== next) return;
      if (status.isLoaded) clearTimeout(timeout);
      if (status.didJustFinish) {
        clearTimeout(timeout);
        stopRecitation();
        onEnd(false);
      }
    });
    next.play();
    notify();
    return true;
  } catch {
    stopRecitation();
    return false;
  }
}

export function currentRecitation(): number | null {
  return currentAyah;
}

/** React state for the recitation player; stops playback when the screen unmounts. */
export function useRecitation() {
  const [playing, setPlaying] = useState<number | null>(currentAyah);
  const [error, setError] = useState(false);

  useEffect(() => {
    const listener = () => setPlaying(currentAyah);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      stopRecitation();
    };
  }, []);

  const toggle = useCallback((globalAyah: number) => {
    if (currentAyah === globalAyah) {
      stopRecitation();
      return;
    }
    setError(false);
    const ok = playRecitation(globalAyah, (failed) => {
      if (failed) setError(true);
    });
    if (!ok) setError(true);
  }, []);

  return { playing, error, toggle, stop: stopRecitation };
}

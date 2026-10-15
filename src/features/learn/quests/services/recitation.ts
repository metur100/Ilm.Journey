import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

import { audioSessionReady } from '@/core/services/audioSession';
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
let streamTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function stopRecitation(): void {
  if (streamTimeout) clearTimeout(streamTimeout);
  streamTimeout = null;
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
  try {
    const next = createAudioPlayer({ uri: audioUrlForAyah(globalAyah) });
    player = next;
    currentAyah = globalAyah;
    streamTimeout = setTimeout(() => {
      if (player === next && (!next.isLoaded || !next.playing)) {
        stopRecitation();
        onEnd(true);
      }
    }, STREAM_TIMEOUT_MS);
    next.addListener('playbackStatusUpdate', (status) => {
      if (player !== next) return;
      if (status.error) {
        stopRecitation();
        onEnd(true);
        return;
      }
      if (status.playing) {
        if (streamTimeout) clearTimeout(streamTimeout);
        streamTimeout = null;
      }
      if (status.didJustFinish) {
        stopRecitation();
        onEnd(false);
      }
    });
    notify();
    // Configure the app audio mode first (audible in silent mode); play even if that native call failed.
    void audioSessionReady().then(() => {
      if (player !== next) return;
      try {
        next.play();
      } catch {
        stopRecitation();
        onEnd(true);
      }
    });
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
  /** The ayah whose recitation could not be loaded (e.g. offline), so screens can show the hint right there. */
  const [failed, setFailed] = useState<number | null>(null);

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
    setFailed(null);
    const ok = playRecitation(globalAyah, (didFail) => {
      if (didFail) setFailed(globalAyah);
    });
    if (!ok) setFailed(globalAyah);
  }, []);

  return { playing, error: failed !== null, failed, toggle, stop: stopRecitation };
}

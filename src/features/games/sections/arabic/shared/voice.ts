import { useCallback, useEffect, useState } from 'react';

import { useGamesStore } from '@/core/games';
import { arabicVoiceStatus, detectArabicVoice, onArabicVoiceStatus, speakArabic, stopSpeaking } from '@/core/services/speech';

/**
 * Arabic pronunciation in the Arabic / Sufara games (docs/AUDIO.md): `say` speaks letters, syllables and words through
 * `speakArabic` (explicit Arabic voice; the app-wide hint explains how to install one). `available` is false when the
 * device has no Arabic voice – the games then show the target visually instead of only saying it.
 */
export function useArabicVoice(): { available: boolean; say: (text: string) => void } {
  const [available, setAvailable] = useState<boolean>(arabicVoiceStatus() !== 'missing');
  useEffect(() => {
    let alive = true;
    const off = onArabicVoiceStatus((s) => {
      if (alive) setAvailable(s !== 'missing');
    });
    void detectArabicVoice().then((s) => {
      if (alive) setAvailable(s !== 'missing');
    });
    return () => {
      alive = false;
      off();
      stopSpeaking();
    };
  }, []);
  const say = useCallback((text: string) => {
    speakArabic(text);
  }, []);
  return { available, say };
}

/** How often the learner already played this level (read once at mount) – rotates the content between plays. */
export function usePlayIndex(gameId: string, level: 1 | 2 | 3): number {
  const [index] = useState(() => useGamesStore.getState().games[gameId]?.levels[`${level}`]?.plays ?? 0);
  return index;
}

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Language } from '../models';
import { deviceNarration } from '../services/speech';

/** idle → preparing (the device voice renders the text, ~0.5–2 s) → speaking → idle. */
export type ReadAloudState = 'idle' | 'preparing' | 'speaking';

let nextId = 1;

/**
 * Reads a text with the device voice (`deviceNarration`) and tracks this component's own utterance:
 * `toggle(text)` starts or stops it, it stops when the component unmounts, and the state falls back to idle when
 * the speech ends, fails or another reader takes over.
 */
export function useReadAloud(language: Language) {
  const [state, setState] = useState<ReadAloudState>('idle');
  /** Id of this component's utterance (0: none). */
  const active = useRef(0);

  const stop = useCallback(() => {
    if (active.current) {
      active.current = 0;
      deviceNarration.stop();
    }
    setState('idle');
  }, []);

  const speak = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = nextId++;
      active.current = id;
      setState('preparing');
      deviceNarration.speak(trimmed, language, {
        onStart: () => {
          if (active.current === id) setState('speaking');
        },
        onDone: () => {
          if (active.current !== id) return;
          active.current = 0;
          setState('idle');
        },
      });
    },
    [language],
  );

  const toggle = useCallback((text: string) => (active.current ? stop() : speak(text)), [speak, stop]);

  // Leaving the page (unmount) stops this component's speech – never someone else's.
  useEffect(
    () => () => {
      if (!active.current) return;
      active.current = 0;
      deviceNarration.stop();
    },
    [],
  );

  return { state, speaking: state !== 'idle', speak, stop, toggle };
}

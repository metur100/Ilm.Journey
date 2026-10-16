import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Test probes: every mounted engine registers a small handle that can play its next correct move through the same
 * code path a learner's drop / tap uses. `playToEnd` (kit/testing) drives a level to completion with them, so a game
 * test does not need to know the engine's internals. Probes cost nothing at runtime (a Set of objects).
 */
export interface KitProbe {
  /** Engine name, e.g. `SortBins`. */
  engine: string;
  testID: string;
  /** Plays the next correct move; returns false when there is nothing left to do. */
  step: () => boolean;
  /** Plays one wrong move if the engine can (for testing mistakes); returns false otherwise. */
  mistake?: () => boolean;
  /** True when the engine has finished (onDone was or is about to be called). */
  done: () => boolean;
}

const probes = new Set<KitProbe>();

export function getKitProbes(): KitProbe[] {
  return [...probes];
}

/** Registers the engine's probe while it is mounted. The handle reads the latest state through a ref. */
export function useKitProbe(probe: KitProbe): void {
  const ref = useRef(probe);
  useLayoutEffect(() => {
    ref.current = probe;
  });
  useEffect(() => {
    const handle: KitProbe = {
      get engine() {
        return ref.current.engine;
      },
      get testID() {
        return ref.current.testID;
      },
      step: () => ref.current.step(),
      mistake: () => ref.current.mistake?.() ?? false,
      done: () => ref.current.done(),
    };
    probes.add(handle);
    return () => {
      probes.delete(handle);
    };
  }, []);
}

import { useCallback, useEffect, useRef, useState } from 'react';

import type { KitKey } from './i18n';
import { useIdleHint, useStopwatch } from './board';
import type { CaptionTone } from './board';
import { useEngineFlags } from './context';
import type { EngineProps } from './types';

export interface CaptionState {
  text: string;
  tone: CaptionTone;
}

/**
 * Shared bookkeeping of every engine: mistakes and missed items, progress (to the engine's `onProgress` and the
 * shell header), inline caption, feedback sound + haptics, the idle hint timer, the stopwatch and finishing once.
 */
export function useEngineCore(props: EngineProps, total: number) {
  const { env, reduced, challenge, seed } = useEngineFlags(props);
  const mistakesRef = useRef(0);
  const missedRef = useRef<string[]>([]);
  const finishedRef = useRef(false);
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [caption, setCaption] = useState<CaptionState | null>(() => (props.prompt ? { text: env.text(props.prompt), tone: 'info' } : null));
  const [burst, setBurst] = useState(0);
  const stopwatch = useStopwatch(challenge);
  const hintsOn = props.hints ?? true;
  const idle = useIdleHint(hintsOn && !finished, moves);
  const rightCount = useRef(0);

  const { onDone, onMistake, onProgress } = props;
  const reportProgress = env.reportProgress;

  const progress = useCallback(
    (done: number, of = total) => {
      onProgress?.({ done, total: of });
      reportProgress(done, of);
    },
    [onProgress, reportProgress, total],
  );

  // Initial progress (0 of n) so the header shows the bar from the start.
  useEffect(() => {
    progress(0, total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** A correct move: sound, haptic, burst trigger and (optionally) a cheering caption. */
  const right = useCallback(
    (options: { caption?: string | false; tone?: CaptionTone } = {}) => {
      setMoves((m) => m + 1);
      setBurst((b) => b + 1);
      env.sound('success');
      env.haptic('success');
      rightCount.current += 1;
      if (options.caption === false) return;
      setCaption({ text: options.caption ?? env.kt(`fb.right.${rightCount.current % 4}` as KitKey), tone: options.tone ?? 'right' });
    },
    [env],
  );

  /** A wrong move with the item involved: counted, reported, gentle caption. */
  const wrong = useCallback(
    (itemId: string, captionText?: string | false) => {
      mistakesRef.current += 1;
      setMistakes(mistakesRef.current);
      setMoves((m) => m + 1);
      if (itemId && !missedRef.current.includes(itemId)) missedRef.current = [...missedRef.current, itemId];
      onMistake?.(itemId);
      env.sound('failure');
      env.haptic('warning');
      if (captionText !== false) setCaption({ text: captionText ?? env.kt('fb.wrong'), tone: 'wrong' });
    },
    [env, onMistake],
  );

  /** Marks an item as missed without counting another mistake (e.g. the other misplaced items of one check). */
  const miss = useCallback(
    (itemId: string) => {
      if (itemId && !missedRef.current.includes(itemId)) missedRef.current = [...missedRef.current, itemId];
      onMistake?.(itemId);
    },
    [onMistake],
  );

  /** A neutral move (selection, flip) – resets the idle timer and plays a click. */
  const touch = useCallback(() => {
    setMoves((m) => m + 1);
    env.haptic('selection');
  }, [env]);

  /** Finishes once (after a short pause so the last animation can be seen). */
  const finish = useCallback(
    (delay?: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setFinished(true);
      const info = { mistakes: mistakesRef.current, missed: missedRef.current, ms: stopwatch.elapsed() };
      const wait = delay ?? (reduced ? 150 : 650);
      if (wait <= 0) onDone(info);
      else setTimeout(() => onDone(info), wait);
    },
    [onDone, reduced, stopwatch],
  );

  return {
    env,
    k: env.colors,
    reduced,
    challenge,
    seed,
    hintsOn,
    idle,
    mistakes,
    moves,
    finished,
    finishedRef,
    caption,
    setCaption,
    burst,
    stopwatch,
    progress,
    right,
    wrong,
    miss,
    touch,
    finish,
  };
}

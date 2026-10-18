import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, TraceShape } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { LETTER_LESSON } from '../shared/lessonText';
import { mustLetter } from '../shared/letters';
import { letterStrokes } from '../shared/strokes';
import { TargetBar } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';

export interface LetterTraceConfig {
  /** Letters in sufara order. */
  letters: string[];
  hints: boolean;
  /** Tolerance of the trace (smaller = stricter). */
  tolerance: number;
}

/**
 * Letter Tracing: meet each letter – hear it, read its lesson line – and write it with the finger, stroke by stroke along
 * its real shape (shared/strokes.ts; each dot is a short stroke). The three levels walk through all 28 letters in sufara
 * order.
 */
export function LetterTraceGame(api: GameApi<LetterTraceConfig>) {
  const { letters, hints, tolerance } = api.config;
  const { say } = useArabicVoice();
  const [current, setCurrent] = useState(0);
  const letter = letters[Math.min(current, letters.length - 1)];
  const info = mustLetter(letter);
  const shapes = useMemo(() => letters.map((l) => ({ id: `l${mustLetter(l).position}`, glyph: l, label: mustLetter(l).name, strokes: traceStrokes(l) })), [letters]);

  useEffect(() => {
    say(letter);
  }, [letter, say]);

  return (
    <GameBoard api={api}>
      <View style={styles.top}>
        <TargetBar text={api.l(LETTER_LESSON[letter])} onListen={() => say(letter)} listenLabel={api.t('play.listen', { name: api.l(info.name) })} />
      </View>
      <TraceShape
        shapes={shapes}
        hints={hints}
        tolerance={tolerance}
        prompt={api.t('play.prompt')}
        onProgress={({ done }) => setCurrent(Math.min(done, letters.length - 1))}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: letters.length, mistakes, factsMissed: missedFacts(missed, api.facts) }))}
      />
    </GameBoard>
  );
}

/** The letter's strokes for TraceShape; its dots become short strokes (TraceShape follows strokes only). */
function traceStrokes(letter: string): string[] | undefined {
  const data = letterStrokes(letter);
  if (!data) return undefined;
  return [...data.strokes, ...(data.dots ?? []).map(([x, y]) => `M${x + 3} ${y} L${x - 3} ${y}`)];
}

const styles = StyleSheet.create({
  top: { marginBottom: spacing.sm },
});

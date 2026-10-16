import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  DragTile,
  type EngineProps,
  FaceView,
  faceLabel,
  HintPointer,
  InlineCaption,
  type KitItem,
  kitShuffle,
  Slot,
  Tile,
  Tray,
  useEngineCore,
  useKitProbe,
  useMeasure,
} from '@/core/games/kit';
import { spacing } from '@/core/theme';

/*
 * GapLine – a local engine of the Quran section (the kit has no gap-fill engine): an ayah is shown word by word,
 * right to left, with one or more words missing. Drag the right word into each gap (or tap a word: it goes into
 * the next open gap). Wrong words shake back. Built from the kit's primitives, core and probe.
 */

export interface GapLineProps extends EngineProps {
  /** Words of the ayah in reading order (verified Quran text). */
  words: KitItem[];
  /** Indexes of the missing words. */
  gaps: number[];
  /** Words that do not fit. */
  distractors?: KitItem[];
}

export function GapLine(props: GapLineProps) {
  const { words, gaps } = props;
  const core = useEngineCore(props, gaps.length);
  const { env, reduced } = core;
  const [filled, setFilled] = useState<number[]>([]);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const measure = useMeasure();
  const testID = props.testID ?? 'gap-line';
  const open = gaps.filter((g) => !filled.includes(g));
  const next = open[0];
  const pool = useMemo(() => kitShuffle([...gaps.map((g) => words[g]), ...(props.distractors ?? [])], `${core.seed}:gaps`), [gaps, words, props.distractors, core.seed]);
  const label = (i: KitItem) => faceLabel(i, env.text);

  const put = (itemId: string, gap: number | undefined): boolean => {
    if (core.finishedRef.current || gap === undefined || filled.includes(gap)) return false;
    if (words[gap].id !== itemId && words[gap].arabic !== pool.find((p) => p.id === itemId)?.arabic) {
      core.wrong(itemId);
      setNudge((n) => ({ ...n, [itemId]: (n[itemId] ?? 0) + 1 }));
      return false;
    }
    const nextFilled = [...filled, gap];
    setFilled(nextFilled);
    core.progress(nextFilled.length);
    core.right({ caption: false });
    if (nextFilled.length === gaps.length) {
      core.setCaption({ text: env.kt('fb.done'), tone: 'right' });
      core.finish(reduced ? 300 : 1000);
    }
    return true;
  };

  useKitProbe({
    engine: 'GapLine',
    testID,
    step: () => {
      if (next === undefined) return false;
      put(words[next].id, next);
      return true;
    },
    mistake: () => {
      if (next === undefined) return false;
      const wrong = (props.distractors ?? []).find((d) => d.arabic !== words[next].arabic);
      if (!wrong) return false;
      put(wrong.id, next);
      return true;
    },
    done: () => next === undefined,
  });

  const used = new Set(filled.map((g) => words[g].id));
  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.stage} onLayout={measure.onLayout}>
        <View style={styles.line}>
          {words.map((w, i) => {
            const isGap = gaps.includes(i);
            if (!isGap || filled.includes(i)) {
              return (
                <Tile key={w.id} state={isGap ? 'placed' : 'idle'} depth={isGap ? 4 : 2} padding={4} minHeight={52}>
                  <FaceView face={w} arabicSize={24} />
                </Tile>
              );
            }
            return (
              <View key={w.id} style={styles.gap}>
                <Slot
                  id={`gap-${i}`}
                  testID={`zone-gap-${i}`}
                  state={core.hintsOn && i === next ? 'next' : 'empty'}
                  accessibilityLabel={env.kt('word.slot', { number: i + 1 })}
                  style={{ flex: 1 }}
                />
              </View>
            );
          })}
        </View>
        {core.hintsOn && core.idle && next !== undefined ? <HintPointer from={{ x: measure.w / 2, y: measure.h - 16 }} /> : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.tray}>
        {pool
          .filter((p) => !used.has(p.id))
          .map((item) => (
            <DragTile
              key={item.id}
              id={item.id}
              nudge={nudge[item.id] ?? 0}
              accessibilityLabel={env.kt('a11y.tile', { label: label(item) })}
              onLift={core.touch}
              onPress={() => put(item.id, next)}
              onDrop={(zone) => (zone.startsWith('gap-') ? put(item.id, Number(zone.slice(4))) : false)}
            >
              <Tile minHeight={56} style={{ minWidth: 64 }}>
                <FaceView face={item} arabicSize={26} />
              </Tile>
            </DragTile>
          ))}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, justifyContent: 'center', minHeight: 140 },
  line: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  gap: { width: 84, height: 56 },
  tray: { minHeight: 64, flexDirection: 'row-reverse' },
});

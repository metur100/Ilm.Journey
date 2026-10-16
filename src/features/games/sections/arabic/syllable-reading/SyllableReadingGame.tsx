import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { GameBoard, InlineCaption, kitResult, useKitColors } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useKitProbe } from '@/core/games/kit/probe';
import type { LocalizedText } from '@/core/models';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';
import { radius, spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { ArabicText, TargetBar } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';

export interface ReadingChip {
  id: string;
  arabic: string;
  /** Latin reading shown after it is read (and as the target when there is no Arabic voice). */
  reading: LocalizedText;
}

export interface SyllableReadingConfig {
  /** Lines of the sufara page, each in reading order (right to left). */
  lines: ReadingChip[][];
  /** `along`: read every chip in order (karaoke) · `find`: hear one and tap it. */
  mode: 'along' | 'find';
  hints: boolean;
}

/**
 * Reading Line by Line: a sufara page with lines of syllables and short words. Read along – tap each one in reading
 * order (right to left, top to bottom), hear it and see it light up – or, in level 3, hear one and find it on the page.
 */
export function SyllableReadingGame(api: GameApi<SyllableReadingConfig>) {
  const { lines, mode, hints } = api.config;
  const k = useKitColors();
  const { available, say } = useArabicVoice();
  const chips = useMemo(() => lines.flat(), [lines]);
  const order = useMemo(() => (mode === 'along' ? chips : shuffle(chips, seededRandom(hashString(`${api.gameId}:${api.level}`)))), [chips, mode, api.gameId, api.level]);
  const core = useEngineCore({ hints, prompt: api.t(mode === 'along' ? 'play.along' : 'play.find'), onDone: () => undefined }, order.length);
  const [step, setStep] = useState(0);
  const [read, setRead] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState({ n: 0, ids: [] as string[] });
  const target = order[Math.min(step, order.length - 1)];
  const finished = step >= order.length;

  const tap = (chip: ReadingChip) => {
    if (finished || core.finishedRef.current) return;
    say(chip.arabic);
    if (chip.id !== target.id) {
      if (read.includes(chip.id)) return; // re-hearing a read one is free
      core.wrong(chip.id, mode === 'along' ? api.t('play.wrongAlong') : api.t('play.wrongFind', { reading: api.l(chip.reading) }));
      setShake(chip.id);
      setMistakes((m) => ({ n: m.n + 1, ids: [...m.ids, chip.id] }));
      return;
    }
    const next = step + 1;
    setRead((r) => [...r, chip.id]);
    setShake(null);
    setStep(next);
    core.progress(next);
    core.right({ caption: `${chip.arabic} – ${api.l(chip.reading)}`, tone: 'right' });
    if (next >= order.length) {
      core.finishedRef.current = true;
      const m = mistakes;
      setTimeout(() => api.onComplete(kitResult({ moves: order.length, mistakes: m.n, factsMissed: missedFacts(m.ids, api.facts) })), api.reducedMotion ? 400 : 1300);
    } else if (mode === 'find') setTimeout(() => say(order[next].arabic), 700);
  };

  useKitProbe({
    engine: 'SyllableReading',
    testID: 'syllable-reading',
    step: () => {
      if (finished || core.finishedRef.current) return false;
      tap(target);
      return true;
    },
    mistake: () => {
      const wrong = chips.find((c) => c.id !== target.id && !read.includes(c.id));
      if (!wrong || finished) return false;
      tap(wrong);
      return true;
    },
    done: () => finished || core.finishedRef.current,
  });

  return (
    <GameBoard api={api}>
      {mode === 'find' ? (
        <View style={styles.top}>
          <TargetBar text={available ? api.t('play.listenFind') : api.l(target.reading)} onListen={() => say(target.arabic)} listenLabel={api.t('play.listen')} />
        </View>
      ) : null}
      <View style={[styles.page, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
        {lines.map((line, li) => (
          <View key={li} style={[styles.line, { borderBottomColor: k.slotBorder }]}>
            {line.map((chip) => {
              const done = read.includes(chip.id);
              const next = mode === 'along' && hints && chip.id === target.id && !finished;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => tap(chip)}
                  testID={`chip-${chip.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={done ? `${chip.arabic}, ${api.l(chip.reading)}` : chip.arabic}
                  style={[styles.chip, { backgroundColor: done ? k.rightSoft : shake === chip.id ? k.wrongSoft : 'transparent', borderColor: next ? k.gold : done ? k.right : shake === chip.id ? k.wrong : 'transparent' }]}
                >
                  <ArabicText size={36}>
                    {chip.arabic}
                  </ArabicText>
                  <AppText variant="tiny" color={k.textMuted} style={{ opacity: done ? 1 : 0 }}>
                    {api.l(chip.reading)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: spacing.sm },
  page: { flex: 1, borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.sm, justifyContent: 'space-evenly' },
  line: { flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center', borderBottomWidth: 1, borderStyle: 'dashed', paddingVertical: 2 },
  chip: { minWidth: 64, minHeight: 56, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
});

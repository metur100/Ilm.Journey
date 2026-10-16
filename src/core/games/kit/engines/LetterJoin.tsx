import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption, ProgressDots } from '../board';
import { DragTile } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, Glow, Pop } from '../fx';
import { useMeasure } from '../layout';
import { Slot, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitText } from '../types';

export interface JoinWord {
  id: string;
  /** Letters in reading order (isolated forms, e.g. ['ب', 'ا', 'ب']). */
  letters: string[];
  /** The joined word (default: the letters joined – the Arabic font connects them). */
  word?: string;
  /** Meaning / transliteration shown when the word is complete. */
  meaning?: KitText;
}

export interface LetterJoinProps extends EngineProps {
  words: JoinWord[];
  /** Extra letters in the tray that do not belong (harder levels). */
  extraLetters?: string[];
}

/**
 * LetterJoin – the "spajanje harfova" engine: drag (or tap) separate Arabic letters into place from right to left and
 * watch them join into the word above. Words come one after another.
 */
export function LetterJoin(props: LetterJoinProps) {
  const { words } = props;
  const total = words.reduce((n, w) => n + w.letters.length, 0);
  const core = useEngineCore(props, total);
  const { env, k, reduced } = core;
  const [wordIndex, setWordIndex] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [doneLetters, setDoneLetters] = useState(0);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [pop, setPop] = useState(0);
  const measure = useMeasure();
  const testID = props.testID ?? 'letter-join';
  const word = words[Math.min(wordIndex, words.length - 1)];
  const complete = placed === word.letters.length;
  const allDone = wordIndex >= words.length - 1 && complete;

  const pool = useMemo(() => {
    const tiles = word.letters.map((letter, i) => ({ id: `${word.id}-${i}`, letter, index: i }));
    const extras = (props.extraLetters ?? []).slice(0, 2).map((letter, i) => ({ id: `${word.id}-x${i}`, letter, index: -1 }));
    return kitShuffle([...tiles, ...extras], `${core.seed}:${word.id}`);
  }, [word, props.extraLetters, core.seed]);
  const used = pool.filter((t) => t.index >= 0 && t.index < placed).map((t) => t.id);

  const put = (tileId: string): boolean => {
    if (core.finishedRef.current || complete) return false;
    const tile = pool.find((t) => t.id === tileId);
    if (!tile) return false;
    // Same letter twice in a word: any copy is right for its place.
    if (tile.letter !== word.letters[placed] || tile.index < 0) {
      core.wrong(word.id);
      setNudge((n) => ({ ...n, [tileId]: (n[tileId] ?? 0) + 1 }));
      return false;
    }
    if (tile.index !== placed) {
      // Swap identity with the copy that belongs here (keeps the tray consistent).
      const copy = pool.find((t) => t.index === placed)!;
      copy.index = tile.index;
      tile.index = placed;
    }
    const next = placed + 1;
    setPlaced(next);
    setPop((p) => p + 1);
    const count = doneLetters + 1;
    setDoneLetters(count);
    core.progress(count);
    if (next === word.letters.length) {
      core.right({ caption: word.meaning ? `${word.word ?? word.letters.join('')} – ${env.text(word.meaning)}` : env.kt('join.word', { word: word.word ?? word.letters.join('') }), tone: 'fact' });
      if (wordIndex === words.length - 1) core.finish(reduced ? 400 : 1600);
      else {
        const from = wordIndex;
        setTimeout(() => goNext(from), reduced ? 700 : 1500);
      }
    } else core.right({ caption: false });
    return true;
  };

  /** Moves on from word `from` once (the timer and a probe may both ask). */
  const advanced = useRef(-1);
  const goNext = (from: number) => {
    if (advanced.current >= from) return;
    advanced.current = from;
    setWordIndex(Math.min(words.length - 1, from + 1));
    setPlaced(0);
  };

  useKitProbe({
    engine: 'LetterJoin',
    testID,
    step: () => {
      if (allDone) return false;
      if (complete) {
        goNext(wordIndex);
        return true;
      }
      const tile = pool.find((t) => t.index === placed)!;
      put(tile.id);
      return true;
    },
    mistake: () => {
      if (complete) return false;
      const wrong = pool.find((t) => t.letter !== word.letters[placed]);
      if (!wrong) return false;
      put(wrong.id);
      return true;
    },
    done: () => allDone,
  });

  const joined = word.letters.slice(0, placed).join('');
  const fullWord = word.word ?? word.letters.join('');
  const n = word.letters.length;
  const gap = spacing.xs;
  const plusW = 16;
  const slotW = measure.w > 0 ? Math.max(48, Math.min(72, Math.floor((measure.w - (n - 1) * (plusW + gap * 2)) / n))) : 60;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {words.length > 1 ? <ProgressDots total={words.length} done={wordIndex + (complete ? 1 : 0)} /> : null}
      <View style={styles.stage} onLayout={measure.onLayout}>
        <Pop trigger={pop} style={[styles.word, { backgroundColor: k.tileFace, borderColor: complete ? k.right : k.tileBorder }]}>
          <Glow active={complete} color={k.right} radius={radius.xl} pulse={false} />
          <AppText
            script="arabic"
            align="center"
            color={joined ? k.text : k.textMuted}
            style={{ fontFamily: fonts.arabicBold, fontSize: 56, lineHeight: 92, writingDirection: 'rtl' }}
            accessibilityLabel={env.kt('join.word', { word: joined || '…' })}
            accessibilityLiveRegion="polite"
            testID="join-preview"
          >
            {complete ? fullWord : joined || '…'}
          </AppText>
          {complete ? <Burst trigger={wordIndex + 1} distance={90} size={16} /> : null}
        </Pop>
        <View style={styles.arrow}>
          <Icon name="chevron" size={22} color={k.accent} />
        </View>
        <View style={styles.slots}>
          {word.letters.map((letter, i) => (
            <View key={`${word.id}-${i}`} style={styles.slotCell}>
              {i > 0 ? (
                <AppText variant="heading" color={k.textMuted} style={{ width: plusW, textAlign: 'center' }}>
                  +
                </AppText>
              ) : null}
              <View style={{ width: slotW, height: 72 }}>
                <Slot
                  id={`join-${i}`}
                  testID={`zone-join-${i}`}
                  state={i < placed ? 'filled' : core.hintsOn && i === placed ? 'next' : 'empty'}
                  accessibilityLabel={i < placed ? env.kt('a11y.slotFilled', { number: i + 1, label: letter }) : env.kt('word.slot', { number: i + 1 })}
                  style={{ flex: 1 }}
                >
                  {i < placed ? (
                    <Animated.View entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(12)} style={{ flex: 1, alignSelf: 'stretch' }}>
                      <Tile state="placed" height={72} padding={0}>
                        <AppText script="arabic" style={{ fontFamily: fonts.arabicBold, fontSize: 30, lineHeight: 50 }} color={k.text}>
                          {letter}
                        </AppText>
                      </Tile>
                    </Animated.View>
                  ) : null}
                </Slot>
              </View>
            </View>
          ))}
        </View>
        {core.hintsOn && core.idle && !complete ? <HintPointer from={{ x: measure.w / 2, y: measure.h - 10 }} /> : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={env.kt('join.letters')} style={styles.tray}>
        {pool
          .filter((t) => !used.includes(t.id))
          .map((t) => (
            <Animated.View key={t.id} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
              <DragTile
                id={t.id}
                nudge={nudge[t.id] ?? 0}
                accessibilityLabel={env.kt('a11y.tile', { label: t.letter })}
                onLift={core.touch}
                onPress={() => put(t.id)}
                onDrop={(zone) => (zone === `join-${placed}` ? put(t.id) : false)}
              >
                <Tile width={60} minHeight={64} padding={0}>
                  <AppText script="arabic" style={{ fontFamily: fonts.arabicBold, fontSize: 32, lineHeight: 52 }} color={k.text}>
                    {t.letter}
                  </AppText>
                </Tile>
              </DragTile>
            </Animated.View>
          ))}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, minHeight: 200 },
  word: { minWidth: 180, minHeight: 110, borderRadius: radius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  arrow: { transform: [{ rotate: '-90deg' }] },
  slots: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  slotCell: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs },
  tray: { minHeight: 70, flexDirection: 'row-reverse' },
});

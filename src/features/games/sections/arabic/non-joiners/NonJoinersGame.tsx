import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { Burst, GameBoard, InlineCaption, kitResult, ProgressDots, useKitColors } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useKitProbe } from '@/core/games/kit/probe';
import { radius, spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { SortGame, type SortConfig } from '../shared/engineGames';
import { mustLetter } from '../shared/letters';
import { joinsNext, joinsPrevious, splitLetters } from '../shared/script';
import { ArabicText } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';
import { getWord } from '../shared/words';

export interface NonJoinersConfig {
  /** Level 1: sort letters (joins forward / never joins forward). */
  sort?: SortConfig;
  /** Levels 2–3: words whose letters are bridged by the learner. */
  words?: string[];
  hints: boolean;
}

export interface Gap {
  index: number;
  joins: boolean;
  /** The letter before the gap (the one that does or does not join forward). */
  before: string;
}

/** The gaps between the letters of a word and whether a join (a bridge) belongs there. */
export function gapsOf(arabic: string): Gap[] {
  const letters = splitLetters(arabic);
  return letters.slice(0, -1).map((l, i) => ({ index: i, joins: joinsNext(l.base) && joinsPrevious(letters[i + 1].base), before: l.base }));
}

/**
 * Non-joining letters: the letters of a word stand apart; tap every gap where the two letters hold hands. After
 * ا د ذ ر ز و there is never a bridge. When every bridge is built the word joins and is said.
 */
function Bridges(props: { api: GameApi<NonJoinersConfig>; words: string[] }) {
  const { api, words } = props;
  const k = useKitColors();
  const { say } = useArabicVoice();
  const items = useMemo(() => words.map((id) => ({ word: getWord(id), gaps: gapsOf(getWord(id).arabic) })), [words]);
  const total = items.reduce((n, w) => n + w.gaps.filter((g) => g.joins).length, 0);
  const core = useEngineCore({ hints: api.config.hints, prompt: api.t('play.bridges'), onDone: () => undefined }, total);
  const [wordIndex, setWordIndex] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState({ n: 0, ids: [] as string[] });
  const current = items[wordIndex];
  const letters = splitLetters(current.word.arabic);
  const needed = current.gaps.filter((g) => g.joins).map((g) => g.index);
  const complete = needed.every((i) => built.includes(i));
  const last = wordIndex >= items.length - 1;

  const indexRef = useRef(0);
  const next = (from = wordIndex) => {
    if (from >= items.length - 1 || indexRef.current !== from) return;
    indexRef.current = from + 1;
    setWordIndex(from + 1);
    setBuilt([]);
    setShake(null);
  };

  const finishLevel = (m: { n: number; ids: string[] }) => api.onComplete(kitResult({ moves: total, mistakes: m.n, factsMissed: missedFacts(m.ids, api.facts) }));

  const tap = (gap: Gap) => {
    if (complete || built.includes(gap.index) || core.finishedRef.current) return;
    if (!gap.joins) {
      core.wrong(current.word.id, api.t('play.noBridge', { letter: gap.before, name: api.l(mustLetter(gap.before).name) }));
      setShake(gap.index);
      setMistakes((m) => ({ n: m.n + 1, ids: [...m.ids, current.word.id] }));
      return;
    }
    const nextBuilt = [...built, gap.index];
    setBuilt(nextBuilt);
    setDone((d) => d + 1);
    core.progress(done + 1);
    if (needed.every((i) => nextBuilt.includes(i))) {
      say(current.word.arabic);
      core.right({ caption: `${current.word.arabic} – ${current.word.translit} · ${api.l(current.word.meaning)}`, tone: 'fact' });
      if (last) {
        core.finishedRef.current = true;
        const m = mistakes;
        setTimeout(() => finishLevel(m), api.reducedMotion ? 400 : 1400);
      } else {
        const from = wordIndex;
        setTimeout(() => next(from), api.reducedMotion ? 900 : 1600);
      }
    } else core.right({ caption: false });
  };

  useKitProbe({
    engine: 'Bridges',
    testID: 'bridges',
    step: () => {
      if (core.finishedRef.current) return false;
      if (complete) {
        next();
        return true;
      }
      const g = current.gaps.find((x) => x.joins && !built.includes(x.index));
      if (g) tap(g);
      return true;
    },
    mistake: () => {
      const g = current.gaps.find((x) => !x.joins);
      if (!g || complete) return false;
      tap(g);
      return true;
    },
    done: () => core.finishedRef.current || (last && complete),
  });

  return (
    <View style={styles.root}>
      <ProgressDots total={items.length} done={wordIndex + (complete ? 1 : 0)} />
      <View style={styles.stage}>
        <View style={[styles.joined, { backgroundColor: complete ? k.rightSoft : k.tileFace, borderColor: complete ? k.right : k.tileBorder }]}>
          <ArabicText size={52} color={complete ? k.text : k.textMuted}>
            {complete ? current.word.arabic : '…'}
          </ArabicText>
          {complete ? <Burst trigger={wordIndex + 1} distance={80} /> : null}
        </View>
        <View style={styles.row}>
          {letters.map((l, i) => (
            <View key={`${current.word.id}-${i}`} style={styles.cell}>
              <View style={[styles.letter, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
                <ArabicText size={34}>{l.text}</ArabicText>
              </View>
              {i < letters.length - 1 ? (
                <Pressable
                  onPress={() => tap(current.gaps[i])}
                  testID={`gap-${i}`}
                  hitSlop={{ left: 11, right: 11, top: 8, bottom: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={api.t('a11y.gap', { a: l.base, b: letters[i + 1].base })}
                  style={[
                    styles.gap,
                    {
                      backgroundColor: built.includes(i) ? k.right : shake === i ? k.wrongSoft : k.slotFill,
                      borderColor: built.includes(i) ? k.right : shake === i ? k.wrong : core.hintsOn && core.idle && needed.includes(i) && !built.includes(i) ? k.gold : k.slotBorder,
                    },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

export function NonJoinersGame(api: GameApi<NonJoinersConfig>) {
  if (api.config.sort) return <SortGame {...(api as unknown as GameApi<SortConfig>)} config={api.config.sort} />;
  return (
    <GameBoard api={api}>
      <Bridges api={api} words={api.config.words ?? []} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  joined: { minWidth: 180, minHeight: 100, borderRadius: radius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', rowGap: spacing.sm },
  cell: { flexDirection: 'row-reverse', alignItems: 'center' },
  letter: { width: 52, height: 72, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  gap: { width: 26, height: 48, marginHorizontal: 2, borderRadius: radius.sm, borderWidth: 2, borderStyle: 'dashed' },
});

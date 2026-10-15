import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { ChallengeClock, InlineCaption } from '../board';
import { useEngineCore } from '../engine';
import { Burst } from '../fx';
import { FaceView, faceLabel, FlipCard } from '../primitives';
import { useKitProbe } from '../probe';
import { useMeasure } from '../layout';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitFace } from '../types';

export interface MemoryPair {
  id: string;
  /** Face of the first card. */
  a: KitFace;
  /** Face of the second card (default: the same as `a`). E.g. a letter and its name, a word and its picture. */
  b?: KitFace;
  /** Caption shown when the pair is found (a short explanation). */
  caption?: KitFace['label'];
}

export interface MemoryPairsProps extends EngineProps {
  pairs: MemoryPair[];
  /** Show every card face up for this many ms at the start (an easy first level). */
  peekMs?: number;
  /** Columns (default: 3 for ≤ 3 pairs, else 4). */
  columns?: number;
}

interface CardDef {
  key: string;
  pairId: string;
  face: KitFace;
}

/**
 * MemoryPairs – flip two cards; matching ones stay open (green, sparkle, optional caption), others flip back.
 * Only "forgetting" counts as a mistake: a mismatch where one of the cards had been seen before.
 */
export function MemoryPairs(props: MemoryPairsProps) {
  const { pairs } = props;
  const core = useEngineCore(props, pairs.length);
  const { env, reduced } = core;
  const cards = useMemo<CardDef[]>(
    () =>
      kitShuffle(
        pairs.flatMap((p) => [
          { key: `${p.id}-a`, pairId: p.id, face: p.a },
          { key: `${p.id}-b`, pairId: p.id, face: p.b ?? p.a },
        ]),
        `${core.seed}:memory`,
      ),
    [pairs, core.seed],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [peek, setPeek] = useState((props.peekMs ?? 0) > 0);
  const size = useMeasure();
  const onLayout = size.onLayout;
  const seen = useRef(new Set<string>());
  const busy = useRef(false);
  const testID = props.testID ?? 'memory-pairs';

  useEffect(() => {
    if (!peek) return;
    const id = setTimeout(() => setPeek(false), props.peekMs);
    return () => clearTimeout(id);
  }, [peek, props.peekMs]);

  const flip = (key: string) => {
    if (peek || busy.current || core.finishedRef.current) return;
    const card = cards.find((c) => c.key === key);
    if (!card || matched.includes(card.pairId) || open.includes(key)) return;
    if (open.length === 0) {
      setOpen([key]);
      core.touch();
      return;
    }
    const first = cards.find((c) => c.key === open[0])!;
    setOpen([open[0], key]);
    if (first.pairId === card.pairId) {
      const next = [...matched, card.pairId];
      setMatched(next);
      setOpen([]);
      core.progress(next.length);
      const pair = pairs.find((p) => p.id === card.pairId)!;
      core.right({ caption: pair.caption ? env.text(pair.caption) : undefined });
      if (next.length === pairs.length) core.finish();
    } else {
      const forgot = seen.current.has(key) || seen.current.has(first.key);
      if (forgot) core.wrong(card.pairId, env.kt('fb.tryAgain'));
      else core.touch();
      busy.current = true;
      setTimeout(
        () => {
          busy.current = false;
          setOpen([]);
        },
        reduced ? 500 : 900,
      );
    }
    seen.current.add(key);
    seen.current.add(first.key);
  };

  useKitProbe({
    engine: 'MemoryPairs',
    testID,
    step: () => {
      if (matched.length === pairs.length) return false;
      if (busy.current) {
        busy.current = false;
        setOpen([]);
        return true;
      }
      if (peek) {
        setPeek(false);
        return true;
      }
      if (open.length === 1) {
        const first = cards.find((c) => c.key === open[0])!;
        flip(cards.find((c) => c.pairId === first.pairId && c.key !== first.key)!.key);
        return true;
      }
      const target = cards.find((c) => !matched.includes(c.pairId))!;
      flip(target.key);
      return true;
    },
    /** Two calls: open a card already "seen", then a card of another pair (counts as a mistake). */
    mistake: () => {
      if (busy.current || peek) return false;
      const rest = cards.filter((c) => !matched.includes(c.pairId));
      if (open.length === 0) {
        const a = rest[0];
        if (!a) return false;
        seen.current.add(a.key);
        flip(a.key);
        return true;
      }
      const first = cards.find((c) => c.key === open[0])!;
      const b = rest.find((c) => c.pairId !== first.pairId);
      if (!b) return false;
      flip(b.key);
      return true;
    },
    done: () => matched.length === pairs.length,
  });

  const cols = props.columns ?? (cards.length <= 6 ? 3 : 4);
  const rows = Math.ceil(cards.length / cols);
  const gap = spacing.sm;
  const cardW = size.w > 0 ? Math.floor((size.w - gap * (cols - 1)) / cols) : 70;
  const cardH = size.h > 0 ? Math.max(56, Math.min(Math.floor(cardW * 1.3), Math.floor((size.h - gap * (rows - 1)) / rows))) : 90;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={onLayout}>
        {size.w > 0 ? (
          <View style={[styles.grid, { gap }]}>
            {cards.map((card, i) => {
              const isMatched = matched.includes(card.pairId);
              const faceUp = peek || isMatched || open.includes(card.key);
              const label = faceLabel(card.face, env.text);
              return (
                <View key={card.key} style={{ width: cardW, height: cardH }}>
                  <FlipCard
                    faceUp={faceUp}
                    matched={isMatched}
                    width={cardW}
                    height={cardH}
                    disabled={isMatched}
                    testID={`card-${card.key}`}
                    accessibilityLabel={isMatched ? env.kt('memory.matched', { number: i + 1, label }) : faceUp ? env.kt('memory.open', { number: i + 1, label }) : env.kt('memory.hidden', { number: i + 1 })}
                    onPress={() => flip(card.key)}
                    front={<FaceView face={card.face} artSize={Math.min(cardW - 16, cardH - 30, 64)} arabicSize={Math.min(34, cardW * 0.4)} variant="tiny" numberOfLines={3} />}
                  />
                  {isMatched ? <Burst trigger={1} distance={cardW * 0.6} size={12} /> : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' },
});

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { star8Path } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, type EngineProps, Glow, InlineCaption, useEngineCore, useKitProbe, useMeasure, useShake } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

import { NightBackdrop } from '../ui';

/*
 * StarNights – a custom Ramadan engine: the nights of the month are stars in the night sky. Tap the stars that are
 * asked for (e.g. the odd nights of the last ten); they light up gold. Other stars shake gently (a mistake).
 * `ordered`: one after another. `numbered(n)`: which stars show their number (hide some for a counting twist).
 */

export interface StarNightsProps extends EngineProps {
  /** Nights shown, in sky order (left to right, top to bottom). */
  nights: number[];
  targets: number[];
  ordered?: boolean;
  numbered?: (night: number) => boolean;
  /** Nights drawn in a soft band (e.g. the last ten). */
  band?: number[];
  texts: { night: (n: number) => string; found: (n: number) => string; next: string };
}

export function StarNights(props: StarNightsProps) {
  const { nights, targets, ordered, texts } = props;
  const core = useEngineCore(props, targets.length);
  const { k } = core;
  const area = useMeasure();
  const [found, setFound] = useState<number[]>([]);
  const [shake, setShake] = useState({ n: 0, tick: 0 });
  const testID = props.testID ?? 'star-nights';
  const next = targets.find((t) => !found.includes(t));
  const done = !next;

  const tap = (n: number) => {
    if (core.finishedRef.current || found.includes(n)) return;
    const ok = ordered ? n === next : targets.includes(n);
    if (!ok) {
      core.wrong(`night-${n}`, ordered ? texts.next : undefined);
      setShake((s) => ({ n, tick: s.tick + 1 }));
      return;
    }
    const nextFound = [...found, n];
    setFound(nextFound);
    core.progress(nextFound.length);
    core.right({ caption: texts.found(n), tone: 'fact' });
    if (nextFound.length >= targets.length) core.finish(1000);
  };

  useKitProbe({
    engine: 'StarNights',
    testID,
    step: () => {
      if (!next) return false;
      tap(next);
      return true;
    },
    mistake: () => {
      const other = nights.find((n) => !targets.includes(n)) ?? (ordered ? targets.find((t) => t !== next && !found.includes(t)) : undefined);
      if (other === undefined || done) return false;
      tap(other);
      return true;
    },
    done: () => done,
  });

  const cols = nights.length > 10 ? 6 : 5;
  const rows = Math.ceil(nights.length / cols);
  const w = area.w;
  const h = area.h;
  const cellW = w / cols;
  const cellH = Math.min(cellW * 1.2, (h - 16) / rows);
  const top = (h - cellH * rows) / 2;
  const size = Math.max(48, Math.min(cellW, cellH) * 0.9);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={[styles.sky, { borderColor: k.boardBorder }]} onLayout={area.onLayout}>
        {w > 0 ? <NightBackdrop w={w} h={h} id="starnights" /> : null}
        {w > 0
          ? nights.map((n, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const jx = (((n * 37) % 11) - 5) * cellW * 0.03;
              const jy = (((n * 53) % 9) - 4) * cellH * 0.04;
              const cx = col * cellW + cellW / 2 + jx;
              const cy = top + row * cellH + cellH / 2 + jy;
              return (
                <StarSpot
                  key={n}
                  n={n}
                  x={cx - size / 2}
                  y={cy - size / 2}
                  size={size}
                  lit={found.includes(n)}
                  band={props.band?.includes(n) ?? false}
                  numbered={props.numbered ? props.numbered(n) : true}
                  hint={core.hintsOn && core.idle && n === next}
                  shakeTick={shake.n === n ? shake.tick : 0}
                  reduced={core.reduced}
                  label={texts.night(n)}
                  onPress={() => tap(n)}
                  colors={{ text: k.onGold, gold: k.gold }}
                />
              );
            })
          : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

function StarSpot({ n, x, y, size, lit, band, numbered, hint, shakeTick, reduced, label, onPress, colors }: {
  n: number;
  x: number;
  y: number;
  size: number;
  lit: boolean;
  band: boolean;
  numbered: boolean;
  hint: boolean;
  shakeTick: number;
  reduced: boolean;
  label: string;
  onPress: () => void;
  colors: { text: string; gold: string };
}) {
  const { style, shake } = useShake(reduced);
  useEffect(() => {
    if (shakeTick > 0) shake();
  }, [shakeTick, shake]);
  const c = size / 2;
  return (
    <Animated.View style={[styles.spot, { left: x, top: y, width: size, height: size }, style]}>
      {hint ? <Glow active radius={c} spread={0} /> : null}
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: lit }} testID={`night-${n}`} style={styles.press}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          {band ? <Circle cx={c} cy={c} r={c * 0.92} fill="#FFE9A8" opacity={0.12} /> : null}
          {lit ? <Circle cx={c} cy={c} r={c * 0.95} fill="#FFE9A8" opacity={0.35} /> : null}
          <Path d={star8Path(c, c, c * (lit ? 0.72 : 0.5))} fill={lit ? '#F2B544' : '#C9CBE8'} opacity={lit ? 1 : 0.75} />
          <Path d={star8Path(c, c, c * (lit ? 0.52 : 0.36))} fill={lit ? '#FFE9A8' : '#3B3F7A'} />
        </Svg>
        {numbered ? (
          <AppText variant="tiny" color={lit ? colors.text : '#FFFFFF'} style={{ fontFamily: fonts.heavy }}>
            {String(n)}
          </AppText>
        ) : null}
      </Pressable>
      {lit ? <Burst trigger={1} distance={c} size={10} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  sky: { flex: 1, minHeight: 240, borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  spot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  press: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});

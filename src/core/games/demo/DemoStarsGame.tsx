import { useMemo, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '../../theme';
import { hashString, seededRandom, shuffle } from '../../utils/random';
import type { GameApi, GameResultInput } from '../types';

export interface DemoStarsConfig {
  /** Number of stars to tap in order. */
  count: number;
}

const COLS = 4;
const ROWS = 3;

/** Deterministic star positions (fractions of the sky panel), one per grid cell so stars never overlap. */
export function starPositions(count: number, seed: string): { x: number; y: number }[] {
  const random = seededRandom(hashString(seed));
  const cells = shuffle(
    Array.from({ length: COLS * ROWS }, (_, i) => i),
    random,
  ).slice(0, Math.min(count, COLS * ROWS));
  return cells.map((cell) => ({
    x: ((cell % COLS) + 0.25 + random() * 0.5) / COLS,
    y: (Math.floor(cell / COLS) + 0.25 + random() * 0.5) / ROWS,
  }));
}

/** Scoring of the demo: 10 points per star, −5 per wrong tap; stars 3 / 2 / 1 for 0 / ≤2 / more mistakes. */
export function demoResult(count: number, mistakes: number, factIds: string[]): GameResultInput {
  return {
    score: Math.max(0, count * 10 - mistakes * 5),
    maxScore: count * 10,
    stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1,
    mistakes,
    // Many wrong taps → the level's facts come back in the review centre (demonstrates review keys).
    factsMissed: mistakes >= 3 ? factIds : [],
  };
}

const STAR = 56;

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  sky: { width: '100%', aspectRatio: 4 / 3, backgroundColor: c.night, borderRadius: radius.lg, overflow: 'hidden' },
  star: { position: 'absolute', width: STAR, height: STAR, marginLeft: -STAR / 2, marginTop: -STAR / 2, alignItems: 'center', justifyContent: 'center' },
  number: { position: 'absolute', bottom: 2 },
  hint: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
}));

/** Demo / test fixture game: tap the numbered stars in order. Uses only the GameApi – the pattern for real games. */
export function DemoStarsGame({ gameId, level, config, facts, onComplete, playSound, haptic, reducedMotion, t }: GameApi<DemoStarsConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const positions = useMemo(() => starPositions(config.count, `${gameId}:${level}`), [config.count, gameId, level]);
  const [next, setNext] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const shake = useState(() => new Animated.Value(0))[0];
  const done = next > positions.length;

  const wobble = () => {
    if (reducedMotion) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const tap = (number: number) => {
    if (done || number < next) return;
    if (number !== next) {
      setMistakes((m) => m + 1);
      haptic('warning');
      playSound('failure');
      wobble();
      return;
    }
    haptic('tap');
    playSound('click');
    if (number === positions.length) {
      setNext(number + 1);
      playSound('success');
      onComplete(demoResult(positions.length, mistakes, facts.map((f) => f.id)));
    } else {
      setNext(number + 1);
    }
  };

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <View style={styles.root}>
      <View style={styles.hint} accessibilityLiveRegion="polite">
        <AppText variant="heading" align="center">
          {done ? '✓' : t('play.next', { number: next })}
        </AppText>
      </View>
      <Animated.View style={[styles.sky, { transform: [{ translateX }] }]}>
        {positions.map((p, i) => {
          const number = i + 1;
          const found = number < next;
          return (
            <Pressable
              key={number}
              onPress={() => tap(number)}
              accessibilityRole="button"
              accessibilityLabel={t(found ? 'play.found' : 'play.star', { number })}
              style={[styles.star, { left: `${p.x * 100}%`, top: `${p.y * 100}%` }]}
            >
              <Icon name={found ? 'star' : 'starOutline'} size={44} color={found ? c.gold : c.onNightMuted} />
              <AppText variant="tiny" color={found ? c.onGold : c.onNight} style={styles.number}>
                {number}
              </AppText>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

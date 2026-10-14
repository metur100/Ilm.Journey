import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { makeStyles, radius, useTheme } from '@/core/theme';

import { type AnimalKind, animalArt } from './logic';

export interface FlipCardProps {
  kind: AnimalKind;
  name: string;
  faceUp: boolean;
  matched: boolean;
  /** Changes every time this card was part of a mismatch – triggers a soft shake. */
  shake: number;
  width: number;
  height: number;
  label: string;
  reducedMotion: boolean;
  onPress: () => void;
}

const useStyles = makeStyles((c) => ({
  face: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  back: { backgroundColor: c.primary, borderColor: c.primaryBorder },
  front: { backgroundColor: c.surface, borderColor: c.goldBorder, gap: 2, paddingHorizontal: 2 },
  matched: { backgroundColor: c.successSoft, borderColor: c.success },
  check: { position: 'absolute', top: 4, right: 4 },
}));

/** A memory card that turns over (rotateY; an instant swap with reduced motion) and pops when its pair is found. */
export function FlipCard({ kind, name, faceUp, matched, shake, width, height, label, reducedMotion, onPress }: FlipCardProps) {
  const styles = useStyles();
  const { c } = useTheme();
  const flip = useSharedValue(faceUp ? 1 : 0);
  const pop = useSharedValue(1);
  const jiggle = useSharedValue(0);

  useEffect(() => {
    flip.value = reducedMotion ? (faceUp ? 1 : 0) : withTiming(faceUp ? 1 : 0, { duration: 300 });
  }, [faceUp, reducedMotion, flip]);

  useEffect(() => {
    if (matched && !reducedMotion) pop.value = withSequence(withSpring(1.1, { damping: 8 }), withSpring(1, { damping: 10 }));
  }, [matched, reducedMotion, pop]);

  useEffect(() => {
    if (shake === 0 || reducedMotion) return;
    jiggle.value = withSequence(withTiming(-5, { duration: 60 }), withTiming(5, { duration: 60 }), withTiming(-3, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [shake, reducedMotion, jiggle]);

  const outer = useAnimatedStyle(() => ({ transform: [{ translateX: jiggle.value }, { scale: pop.value }] }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 700 }, { rotateY: `${flip.value * 180}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 700 }, { rotateY: `${flip.value * 180 - 180}deg` }],
  }));

  const art = Math.min(width * 0.78, height * 0.62);
  return (
    <Animated.View style={[{ width, height }, outer]}>
      <Pressable
        onPress={onPress}
        disabled={matched}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: matched }}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[styles.face, styles.back, backStyle]}>
          <Art name="pattern.star" size={Math.min(width, height) * 0.5} />
        </Animated.View>
        <Animated.View style={[styles.face, styles.front, matched && styles.matched, frontStyle]}>
          <Art name={animalArt(kind)} size={art} height={art * 0.85} />
          <AppText variant="tiny" numberOfLines={1} color={c.textMuted}>
            {name}
          </AppText>
          {matched ? (
            <View style={styles.check}>
              <Icon name="check" size={14} color={c.success} />
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

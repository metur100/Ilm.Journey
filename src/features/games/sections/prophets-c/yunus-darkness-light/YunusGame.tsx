import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, useKitColors, WordTiles } from '@/core/games/kit';
import { useMeasure } from '@/core/games/kit/layout';
import { radius, spacing } from '@/core/theme';

import { missedFor, type YunusConfig } from './register';

/**
 * Light in the Darknesses (21:87–88): a window onto the darkness above the word tiles. Every placed tile lifts a
 * layer of darkness and the light grows; when the dua is complete, the gourd plant appears on the shore (37:146).
 */
export function YunusGame(api: GameApi<YunusConfig>) {
  const { target, distractors, quran, hints, prompt } = api.config;
  const [done, setDone] = useState(0);
  return (
    <GameBoard api={api}>
      <DarknessWindow progress={done / target.length} reduced={api.reducedMotion} dark={api.t('scene.dark')} light={api.t('scene.light')} />
      <WordTiles
        target={target}
        distractors={distractors}
        quran={quran}
        hints={hints}
        prompt={api.t(prompt)}
        onProgress={(p) => setDone(p.done)}
        onDone={({ mistakes, missed }) =>
          api.onComplete(
            kitResult({
              moves: target.length,
              mistakes,
              factsMissed: [...new Set(missed.map((id) => missedFor(api.level, id)).filter((x): x is string => !!x))],
            }),
          )
        }
      />
    </GameBoard>
  );
}

function DarknessWindow({ progress, reduced, dark, light }: { progress: number; reduced: boolean; dark: string; light: string }) {
  const k = useKitColors();
  const box = useMeasure();
  const w = box.w;
  const h = Math.min(150, Math.max(110, w * 0.4));
  const finished = progress >= 1;
  const veil = useAnimatedStyle(() => ({ opacity: reduced ? 0.8 * (1 - progress) : withTiming(0.8 * (1 - progress), { duration: 700 }) }));
  const glow = useAnimatedStyle(() => {
    const s = 0.6 + progress * 1.4;
    return {
      transform: [{ scale: reduced ? s : withTiming(s, { duration: 700 }) }],
      opacity: reduced ? 0.4 + progress * 0.6 : withTiming(0.4 + progress * 0.6, { duration: 700 }),
    };
  });
  return (
    <View onLayout={box.onLayout} style={[styles.window, { height: h, borderColor: k.boardBorder }]} accessibilityLabel={finished ? light : dark}>
      {w > 0 ? (
        <>
          <Art name="prophet.yunus-darkness" size={w} height={h} fit="cover" dark />
          <Animated.View style={[styles.light, glow]} pointerEvents="none">
            <Art name="prophet.yunus-light" size={56} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veil]} pointerEvents="none" />
          {finished ? (
            <Animated.View entering={reduced ? undefined : FadeIn.duration(900)} style={[StyleSheet.absoluteFill, styles.shore]}>
              <Art name="prophet.yunus-gourd" size={Math.min(140, h * 1.1)} />
            </Animated.View>
          ) : null}
          <View style={[styles.label, { backgroundColor: k.tileFace }]} pointerEvents="none">
            <AppText variant="tiny" color={k.text} numberOfLines={1}>
              {finished ? light : dark}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  window: { width: '100%', borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden', marginBottom: spacing.sm },
  veil: { backgroundColor: '#03060F' },
  light: { position: 'absolute', left: '50%', bottom: 10, marginLeft: -28 },
  shore: { alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: spacing.md },
  label: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    maxWidth: '90%',
  },
});

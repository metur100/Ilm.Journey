import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { Art, hasArt } from '../../art';
import { star8Path } from '../../art/kit';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Icon, type IconName } from '../../components/ui/Icon';
import type { TopicId } from '../../models';
import { radius, spacing } from '../../theme';
import type { GameApi } from '../types';
import { KitProvider, useKitColors, useKitEnvValue, useKitMaybe } from './context';
import { Burst } from './fx';
import { formatClock } from './scoring';

/*
 * The board and the shared pieces around every engine: the topic-tinted GameBoard surface, the inline caption, the
 * progress dots, the hint pointer, the challenge clock and the finished-picture reveal.
 */

export interface GameBoardProps {
  /** The GameApi of the game: sound, haptics, reduced motion, challenge mode, language, topic, header progress. */
  api?: GameApi<unknown>;
  /** Override the topic colours (default: the game's topic). */
  topic?: TopicId;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Inner padding (default 12). Use 0 for full-bleed scenes. */
  padding?: number;
  /** Faint stars in the corners (default true). */
  decorate?: boolean;
  testID?: string;
}

/**
 * The game board: a rounded, topic-tinted surface that fills the play area and provides the kit environment to
 * every engine inside. One board per game screen; engines and custom content go inside.
 */
export function GameBoard({ api, topic, children, style, padding = spacing.md, decorate = true, testID = 'game-board' }: GameBoardProps) {
  const env = useKitEnvValue(api, topic);
  const k = env.colors;
  return (
    <KitProvider value={env}>
      <LinearGradient colors={k.board} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 1 }} style={[styles.board, { borderColor: k.boardBorder, padding }, style]} testID={testID}>
        {decorate ? <BoardDeco color={k.boardDeco} /> : null}
        {children}
      </LinearGradient>
    </KitProvider>
  );
}

function BoardDeco({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      <Svg width={120} height={120} viewBox="0 0 120 120" style={{ position: 'absolute', right: -34, top: -34 }}>
        <Path d={star8Path(60, 60, 52)} fill="none" stroke={color} strokeWidth={3} />
        <Path d={star8Path(60, 60, 30)} fill={color} opacity={0.6} />
      </Svg>
      <Svg width={90} height={90} viewBox="0 0 120 120" style={{ position: 'absolute', left: -30, bottom: -30 }}>
        <Path d={star8Path(60, 60, 52)} fill="none" stroke={color} strokeWidth={3} />
      </Svg>
    </View>
  );
}

export type CaptionTone = 'info' | 'right' | 'wrong' | 'fact' | 'hint';

const TONE_ICON: Record<CaptionTone, IconName> = { info: 'info', right: 'check', wrong: 'refresh', fact: 'sparkle', hint: 'pointer' as IconName };

/**
 * Inline caption under the board: instructions, gentle "try again", short explanations during play. Animates when
 * the text changes and is announced by screen readers. Never a modal.
 */
export function InlineCaption({ text, tone = 'info', icon, style, testID = 'kit-caption' }: { text?: string; tone?: CaptionTone; icon?: IconName; style?: StyleProp<ViewStyle>; testID?: string }) {
  const k = useKitColors();
  const env = useKitMaybe();
  const reduced = env?.reducedMotion ?? false;
  const bg = tone === 'right' ? k.rightSoft : tone === 'wrong' ? k.wrongSoft : tone === 'fact' || tone === 'hint' ? k.goldSoft : k.tileFace;
  const border = tone === 'right' ? k.right : tone === 'wrong' ? k.wrong : tone === 'fact' || tone === 'hint' ? k.goldEdge : k.tileBorder;
  const fg = tone === 'right' ? k.right : tone === 'wrong' ? k.wrong : tone === 'fact' || tone === 'hint' ? k.text : k.text;
  const iconColor = tone === 'right' ? k.right : tone === 'wrong' ? k.wrong : tone === 'fact' || tone === 'hint' ? k.gold : k.accent;
  return (
    <View style={[styles.captionSlot, style]} accessibilityLiveRegion="polite" testID={testID}>
      {text ? (
        <Animated.View key={`${tone}:${text}`} entering={reduced ? FadeIn.duration(180) : FadeInDown.duration(260).springify().damping(16)} style={[styles.caption, { backgroundColor: bg, borderColor: border }]}>
          <Icon name={icon ?? TONE_ICON[tone]} size={18} color={iconColor} />
          <AppText variant="small" color={fg} style={styles.captionText}>
            {text}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Progress dots: done (topic colour), current (wide gold), open (track). */
export function ProgressDots({ total, done, label, style }: { total: number; done: number; label?: string; style?: StyleProp<ViewStyle> }) {
  const k = useKitColors();
  const env = useKitMaybe();
  return (
    <View
      style={[styles.dots, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? env?.kt('progress', { done, total }) ?? `${done}/${total}`}
      accessibilityValue={{ min: 0, max: total, now: done }}
      testID="kit-progress-dots"
    >
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} state={i < done ? 'done' : i === done ? 'current' : 'open'} colors={{ done: k.accent, current: k.gold, open: k.slotBorder }} />
      ))}
    </View>
  );
}

function Dot({ state, colors }: { state: 'done' | 'current' | 'open'; colors: { done: string; current: string; open: string } }) {
  const w = useSharedValue(state === 'current' ? 22 : 10);
  useEffect(() => {
    w.set(withSpring(state === 'current' ? 22 : 10, { damping: 14, stiffness: 180 }));
  }, [state, w]);
  const animated = useAnimatedStyle(() => ({ width: w.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: colors[state], opacity: state === 'open' ? 0.55 : 1 }, animated]} />;
}

/**
 * Animated hint finger (positions in px inside the parent): taps at `from`, or drags from `from` to `to`.
 * Static at `from` under reduced motion. Render it as the last child of a relatively positioned container.
 */
export function HintPointer({ from, to, visible = true, size = 44 }: { from: { x: number; y: number }; to?: { x: number; y: number }; visible?: boolean; size?: number }) {
  const k = useKitColors();
  const env = useKitMaybe();
  const reduced = env?.reducedMotion ?? false;
  const p = useSharedValue(0);
  const tap = useSharedValue(0);
  const show = useSharedValue(0);
  useEffect(() => {
    show.set(withTiming(visible ? 1 : 0, { duration: 250 }));
    if (!visible || reduced) {
      cancelAnimation(p);
      cancelAnimation(tap);
      p.set(0);
      return;
    }
    if (to) {
      p.set(withRepeat(withSequence(withTiming(0, { duration: 300 }), withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), withDelay(400, withTiming(1, { duration: 0 }))), -1, false));
    }
    tap.set(withRepeat(withSequence(withTiming(1, { duration: 450 }), withTiming(0, { duration: 0 }), withDelay(to ? 1350 : 500, withTiming(0, { duration: 0 }))), -1, false));
    return () => {
      cancelAnimation(p);
      cancelAnimation(tap);
    };
  }, [visible, reduced, to, p, tap, show]);
  const dx = to ? to.x - from.x : 0;
  const dy = to ? to.y - from.y : 0;
  const finger = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ translateX: from.x - size / 2 + dx * p.value }, { translateY: from.y - size / 2 + dy * p.value }, { scale: 1 - tap.value * 0.12 }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: show.value * (reduced ? 0 : 0.8 * (1 - tap.value)),
    transform: [{ translateX: from.x - size / 2 + dx * p.value }, { translateY: from.y - size / 2 + dy * p.value }, { scale: 1 + tap.value * 1.2 }],
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="kit-hint-pointer">
      <Animated.View style={[styles.hintRing, { width: size, height: size, borderRadius: size / 2, borderColor: k.gold }, ring]} />
      <Animated.View style={[styles.hintFinger, { width: size, height: size, borderRadius: size / 2, backgroundColor: k.gold, shadowColor: k.shadow }, finger]}>
        <Icon name={'pointer' as IconName} size={size * 0.52} color={k.onGold} />
      </Animated.View>
    </View>
  );
}

/** True after `delay` ms without a move (the learner seems stuck) – resets whenever `moves` changes. */
export function useIdleHint(enabled: boolean, moves: number, delay = 6000): boolean {
  // Idle belongs to one (moves, delay) state: a new move makes the stored key stale, so the hint hides at once.
  const key = `${moves}:${delay}`;
  const [idleKey, setIdleKey] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => setIdleKey(key), delay);
    return () => clearTimeout(id);
  }, [enabled, key, delay]);
  return enabled && idleKey === key;
}

/** Milliseconds since mount (ticks every second while `active`). Measures always; show it only in Challenge mode. */
export function useStopwatch(active: boolean): { elapsed: () => number; ms: number } {
  const [start] = useState(() => Date.now());
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMs(Date.now() - start), 1000);
    return () => clearInterval(id);
  }, [active, start]);
  return { elapsed: () => Date.now() - start, ms };
}

/** Calm stopwatch pill for Challenge mode (counts up – there is never a "time's up"). */
export function ChallengeClock({ ms, style }: { ms: number; style?: StyleProp<ViewStyle> }) {
  const k = useKitColors();
  const env = useKitMaybe();
  return (
    <View style={[styles.clock, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }, style]} accessible accessibilityLabel={`${env?.kt('clock') ?? ''} ${formatClock(ms)}`} testID="kit-clock">
      <Icon name="flame" size={14} color={k.gold} />
      <AppText variant="tiny" color={k.text}>
        {formatClock(ms)}
      </AppText>
    </View>
  );
}

export interface FinishRevealProps {
  visible: boolean;
  /** Big art of the finished picture (or pass `children`, e.g. the finished scene). */
  art?: string;
  children?: ReactNode;
  title?: string;
  caption?: string;
  /** Shows a button; without it the reveal stays (call onDone yourself). */
  onContinue?: () => void;
  continueLabel?: string;
  artSize?: number;
  testID?: string;
}

/**
 * The finished-picture payoff, inside the board (not a modal): soft glow and slowly turning rays behind the big
 * picture, a sparkle burst, a title and an optional caption + continue button. Reduced motion: a fade.
 */
export function FinishReveal({ visible, art, children, title, caption, onContinue, continueLabel, artSize = 200, testID = 'kit-finish' }: FinishRevealProps) {
  const k = useKitColors();
  const env = useKitMaybe();
  const reduced = env?.reducedMotion ?? false;
  const p = useSharedValue(0);
  const spin = useSharedValue(0);
  useEffect(() => {
    if (!visible) {
      p.set(0);
      return;
    }
    p.set(reduced ? withTiming(1, { duration: 300 }) : withSpring(1, { damping: 13, stiffness: 110 }));
    if (!reduced) spin.set(withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(spin);
  }, [visible, reduced, p, spin]);
  const pic = useAnimatedStyle(() => (reduced ? { opacity: p.value } : { opacity: Math.min(1, p.value * 1.6), transform: [{ scale: 0.35 + 0.65 * p.value }] }));
  const rays = useAnimatedStyle(() => ({ opacity: p.value * 0.9, transform: [{ rotate: `${spin.value * 360}deg` }, { scale: reduced ? 1 : 0.6 + 0.4 * p.value }] }));
  const textIn = useAnimatedStyle(() => ({ opacity: Math.max(0, (p.value - 0.4) / 0.6), transform: [{ translateY: reduced ? 0 : (1 - p.value) * 16 }] }));
  if (!visible) return null;
  const ray = artSize * 1.6;
  return (
    <View style={[StyleSheet.absoluteFill, styles.reveal]} testID={testID}>
      <LinearGradient colors={[k.board[0], k.board[1]]} style={StyleSheet.absoluteFill} />
      <View style={styles.revealStage}>
        <Animated.View style={[{ position: 'absolute', width: ray, height: ray }, rays]} pointerEvents="none">
          <Svg width={ray} height={ray} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="kitRevealGlow" cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={k.gold} stopOpacity={0.55} />
                <Stop offset="0.6" stopColor={k.gold} stopOpacity={0.12} />
                <Stop offset="1" stopColor={k.gold} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={100} cy={100} r={100} fill="url(#kitRevealGlow)" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const b = a + Math.PI / 24;
              return <Path key={i} d={`M100 100L${100 + Math.cos(a) * 100} ${100 + Math.sin(a) * 100}L${100 + Math.cos(b) * 100} ${100 + Math.sin(b) * 100}Z`} fill={k.gold} opacity={0.14} />;
            })}
          </Svg>
        </Animated.View>
        <Animated.View style={pic}>{children ?? (art && hasArt(art) ? <Art name={art} size={artSize} /> : null)}</Animated.View>
        <Burst trigger={1} distance={artSize * 0.6} size={18} />
      </View>
      <Animated.View style={[styles.revealText, textIn]}>
        {title ? (
          <AppText variant="title" align="center" color={k.text} accessibilityLiveRegion="polite">
            {title}
          </AppText>
        ) : null}
        {caption ? (
          <AppText variant="body" align="center" color={k.textMuted}>
            {caption}
          </AppText>
        ) : null}
        {onContinue ? <Button label={continueLabel ?? env?.kt('continue') ?? 'Continue'} iconRight="chevron" variant="gold" onPress={onContinue} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden' },
  captionSlot: { minHeight: 46, justifyContent: 'center' },
  caption: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  captionText: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, minHeight: 16 },
  dot: { height: 10, borderRadius: 5 },
  hintRing: { position: 'absolute', left: 0, top: 0, borderWidth: 3 },
  hintFinger: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  clock: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1 },
  reveal: { zIndex: 200, elevation: 20, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  revealStage: { alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  revealText: { alignSelf: 'stretch', gap: spacing.sm, alignItems: 'stretch' },
});

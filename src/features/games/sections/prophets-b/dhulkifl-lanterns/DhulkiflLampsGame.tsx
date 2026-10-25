import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, FinishReveal, GameBoard, Glow, InlineCaption, kitResult, useKitColors, useShake } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { useEngineCore, useKitProbe, useMeasure } from '../shared/kit';
import { type DhulkiflConfig, type LampsConfig, nextLamp } from './content';

interface LampProps {
  index: number;
  lit: boolean;
  word: string;
  number?: number;
  glow: boolean;
  holdMs: number;
  size: number;
  nudge: number;
  label: string;
  onHoldStart: () => void;
  onHoldEnd: (completed: boolean) => void;
  onLight: () => void;
}

function Lamp({ index, lit, word, number, glow, holdMs, size, nudge, label, onHoldStart, onHoldEnd, onLight }: LampProps) {
  const k = useKitColors();
  const fill = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { style: shakeStyle, shake } = useShake();
  useEffect(() => {
    if (nudge > 0) shake();
  }, [nudge, shake]);
  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);
  const bar = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  const start = () => {
    if (lit) return;
    onHoldStart();
    fill.set(0);
    fill.set(withTiming(1, { duration: holdMs, easing: Easing.linear }));
    timer.current = setTimeout(() => {
      timer.current = null;
      onLight();
    }, holdMs);
  };
  const end = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    cancelAnimation(fill);
    fill.set(withTiming(0, { duration: 200 }));
    onHoldEnd(false);
  };

  return (
    <Animated.View style={[{ width: size, padding: 4 }, shakeStyle]}>
      <Pressable
        onPressIn={start}
        onPressOut={end}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => (lit ? undefined : onLight())}
        testID={`lamp-${index}`}
      >
        <View style={[styles.lamp, { backgroundColor: lit ? k.goldSoft : k.tileFace, borderColor: lit ? k.goldEdge : k.tileBorder }]}>
          {glow ? <Glow active radius={radius.md} spread={3} /> : null}
          <Art name={lit ? 'prophet.dhulkifl-lamp-lit' : 'prophet.dhulkifl-lamp-unlit'} size={size * 0.7} />
          {number !== undefined ? (
            <View style={[styles.number, { backgroundColor: k.accent }]}>
              <AppText variant="tiny" color={k.onAccent} style={{ fontFamily: fonts.heavy }}>
                {String(number)}
              </AppText>
            </View>
          ) : null}
          {lit ? (
            <AppText variant="tiny" align="center" color={k.text} numberOfLines={2}>
              {word}
            </AppText>
          ) : (
            <View style={[styles.track, { backgroundColor: k.slotFill, borderColor: k.slotBorder }]}>
              <Animated.View style={[styles.trackFill, { backgroundColor: k.gold }, bar]} />
            </View>
          )}
          <Burst trigger={lit ? 1 : 0} distance={size * 0.45} size={12} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Lamps({ api }: { api: GameApi<LampsConfig> }) {
  const cfg = api.config;
  const { t, l } = api;
  const total = cfg.words.length;
  const fact = api.facts[0]?.id ?? 'dhulkifl-patient';
  const prompt = 'play.prompt';
  const core = useEngineCore({ onDone: ({ mistakes }) => api.onComplete(kitResult({ moves: total, mistakes, factsMissed: mistakes > 0 ? [fact] : [] })), prompt: t(prompt), hints: cfg.hints, testID: 'dhulkifl-lamps' }, total);
  const [lit, setLit] = useState<number[]>([]);
  const [showNumbers, setShowNumbers] = useState(cfg.order.length > 0);
  const [nudge, setNudge] = useState<Record<number, number>>({});
  const area = useMeasure();

  useEffect(() => {
    if (!cfg.showOrderMs) return;
    const id = setTimeout(() => setShowNumbers(false), cfg.showOrderMs);
    return () => clearTimeout(id);
  }, [cfg.showOrderMs]);

  const allLit = lit.length === total;
  const next = nextLamp(cfg, lit);

  const light = (i: number) => {
    if (core.finishedRef.current || lit.includes(i)) return;
    if (next !== null && i !== next) {
      setNudge((n) => ({ ...n, [i]: (n[i] ?? 0) + 1 }));
      core.wrong(`lamp-${i}`, t('play.notThis'));
      return;
    }
    const after = [...lit, i];
    setLit(after);
    core.progress(after.length);
    core.right({ caption: t('play.lit', { word: l(cfg.words[i]) }), tone: 'fact' });
  };

  useKitProbe({
    engine: 'DhulkiflLamps',
    testID: 'dhulkifl-lamps',
    step: () => {
      if (core.finishedRef.current) return false;
      if (allLit) {
        core.finish(0);
        return true;
      }
      light(next ?? cfg.words.findIndex((_, i) => !lit.includes(i)));
      return true;
    },
    mistake: () => {
      if (next === null) return false;
      const wrong = cfg.words.findIndex((_, i) => i !== next && !lit.includes(i));
      if (wrong < 0) return false;
      light(wrong);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const size = Math.max(92, Math.min(124, Math.floor(area.w / 3)));
  const numberOf = (i: number) => (showNumbers && cfg.order.length ? cfg.order.indexOf(i) + 1 : undefined);

  return (
    <View style={styles.root}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        <View style={styles.lamps}>
          {cfg.words.map((word, i) => (
            <Lamp
              key={i}
              index={i}
              lit={lit.includes(i)}
              word={l(word)}
              number={numberOf(i)}
              glow={cfg.hints && next === i}
              holdMs={cfg.holdMs}
              size={size}
              nudge={nudge[i] ?? 0}
              label={lit.includes(i) ? t('a11y.lampLit', { number: i + 1, word: l(word) }) : t('a11y.lamp', { number: i + 1 })}
              onHoldStart={() => core.touch()}
              onHoldEnd={() => core.setCaption({ text: t('play.early'), tone: 'hint' })}
              onLight={() => light(i)}
            />
          ))}
        </View>
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={allLit} art="prophet.dhulkifl-lamp" title={t('play.doneTitle')} caption={t('play.doneText')} onContinue={() => core.finish(0)} artSize={150} />
    </View>
  );
}

/** Dhul-Kifl: L1 (Quran 21:85) holds steadily to light each lamp of patience; L2 and L3 are episodes (21:85–86, 38:48). */
export function DhulkiflLampsGame(api: GameApi<DhulkiflConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return (
    <GameBoard api={api}>
      <Lamps api={{ ...api, config }} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, justifyContent: 'center', minHeight: 200 },
  lamps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  lamp: { borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', padding: 6, gap: 4, minHeight: 112 },
  number: { position: 'absolute', top: -8, left: -8, minWidth: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, width: '80%', borderRadius: 4, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  trackFill: { height: '100%' },
});

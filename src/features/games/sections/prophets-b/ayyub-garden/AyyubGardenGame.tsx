import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, FinishReveal, GameBoard, Glow, InlineCaption, kitResult, Tile, useKitColors, useShake } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { useEngineCore, useKitProbe, useMeasure } from '../shared/kit';
import { type Bed, caresNeeded, type GardenConfig, grow, needOf, type Tool } from './logic';

const BED_ART: Record<Bed, string> = {
  empty: 'prophet.ayyub-soil',
  seeded: 'prophet.ayyub-soil-seed',
  dry: 'prophet.ayyub-plant-dry',
  sprout: 'prophet.ayyub-plant-sprout',
  bloom: 'prophet.ayyub-plant-bloom',
};
const TOOL_ART: Record<Tool, string> = { seed: 'garden.seed', water: 'garden.watering-can' };

function GrowBar({ ms, reduced }: { ms: number; reduced: boolean }) {
  const k = useKitColors();
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(1, { duration: reduced ? 0 : ms, easing: Easing.linear }));
  }, [ms, p, reduced]);
  const style = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={[styles.growTrack, { backgroundColor: k.slotFill, borderColor: k.slotBorder }]}>
      <Animated.View style={[styles.growFill, { backgroundColor: k.right }, style]} />
    </View>
  );
}

function BedView(props: { index: number; bed: Bed; growing: boolean; growMs: number; bubble: Tool | null; glow: boolean; nudge: number; burst: number; size: number; label: string; reduced: boolean; onPress: () => void }) {
  const { bed, growing, size, bubble } = props;
  const k = useKitColors();
  const { style, shake } = useShake();
  useEffect(() => {
    if (props.nudge > 0) shake();
  }, [props.nudge, shake]);
  return (
    <Animated.View style={[{ width: size, padding: 4 }, style]}>
      <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel={props.label} testID={`bed-${props.index}`}>
        <View style={[styles.bed, { backgroundColor: bed === 'bloom' ? k.rightSoft : k.tileFace, borderColor: bed === 'bloom' ? k.right : k.tileBorder }]}>
          {props.glow ? <Glow active radius={radius.md} spread={3} /> : null}
          <Art name={BED_ART[bed]} size={size * 0.72} />
          {bubble ? (
            <View style={[styles.bubble, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]}>
              <Art name={TOOL_ART[bubble]} size={22} />
            </View>
          ) : null}
          {growing ? <GrowBar ms={props.growMs} reduced={props.reduced} /> : <View style={styles.growSpace} />}
          <Burst trigger={props.burst} distance={size * 0.45} size={12} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Garden({ api }: { api: GameApi<GardenConfig> }) {
  const cfg = api.config;
  const { t } = api;
  const total = caresNeeded(cfg.beds);
  const toolMissFact = api.facts[0]?.id ?? 'ayyub-call';
  const missed = useRef<string[]>([]);
  const core = useEngineCore(
    {
      onDone: ({ mistakes }) => api.onComplete(kitResult({ moves: total, mistakes, factsMissed: missed.current })),
      prompt: t(cfg.strictPatience ? 'play.promptStrict' : cfg.tools.length > 1 ? 'play.promptTools' : 'play.prompt'),
      hints: cfg.hints,
      testID: 'ayyub-garden',
    },
    total,
  );
  const reduced = core.reduced;
  const growMs = reduced ? 250 : 1400;
  const [beds, setBeds] = useState<Bed[]>(cfg.beds);
  const [growing, setGrowing] = useState<number[]>([]);
  const [tool, setTool] = useState<Tool | null>(cfg.tools.length === 1 ? cfg.tools[0] : null);
  const [done, setDone] = useState(0);
  const [nudge, setNudge] = useState<Record<number, number>>({});
  const [burst, setBurst] = useState<Record<number, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const area = useMeasure();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const allBloom = beds.every((b) => b === 'bloom') && growing.length === 0;

  const miss = (fact: string) => {
    if (!missed.current.includes(fact)) missed.current = [...missed.current, fact];
  };

  const care = (i: number, use: Tool | null) => {
    if (core.finishedRef.current || allBloom) return;
    const bed = beds[i];
    if (growing.includes(i)) {
      if (cfg.strictPatience) {
        miss('ayyub-patient');
        setNudge((n) => ({ ...n, [i]: (n[i] ?? 0) + 1 }));
        core.wrong(`bed-${i}`, t('play.growing'));
      } else core.setCaption({ text: t('play.growing'), tone: 'hint' });
      return;
    }
    const need = needOf(bed);
    if (!need) {
      core.setCaption({ text: t('play.blooming'), tone: 'info' });
      return;
    }
    if (!use) {
      core.setCaption({ text: t('play.pickTool'), tone: 'hint' });
      return;
    }
    if (use !== need) {
      miss(toolMissFact);
      setNudge((n) => ({ ...n, [i]: (n[i] ?? 0) + 1 }));
      core.wrong(`bed-${i}`, t('play.wrongTool'));
      return;
    }
    const next = grow(bed);
    setBeds((b) => b.map((x, n) => (n === i ? next : x)));
    setGrowing((g) => [...g, i]);
    setBurst((b) => ({ ...b, [i]: (b[i] ?? 0) + 1 }));
    setDone(done + 1);
    core.progress(done + 1);
    core.right({ caption: t(use === 'seed' ? 'play.cared.seed' : 'play.cared.water'), tone: 'right' });
    timers.current.push(
      setTimeout(() => {
        setGrowing((g) => g.filter((x) => x !== i));
        if (next === 'bloom') core.setCaption({ text: t('play.bloomed'), tone: 'right' });
      }, growMs),
    );
  };

  useKitProbe({
    engine: 'AyyubGarden',
    testID: 'ayyub-garden',
    step: () => {
      if (core.finishedRef.current) return false;
      if (allBloom) {
        core.finish(0);
        return true;
      }
      const i = beds.findIndex((b, n) => needOf(b) && !growing.includes(n));
      if (i >= 0) {
        const need = needOf(beds[i])!;
        setTool(need);
        care(i, need);
      }
      return true;
    },
    mistake: () => {
      const i = beds.findIndex((b, n) => needOf(b) && !growing.includes(n));
      if (i < 0) return false;
      const other = cfg.tools.find((x) => x !== needOf(beds[i]));
      if (!other) return false;
      care(i, other);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const cols = 3;
  const size = Math.max(84, Math.min(130, Math.floor(area.w / cols)));
  const hintBed = cfg.hints ? beds.findIndex((b, n) => needOf(b) && !growing.includes(n)) : -1;
  const stateLabel = (i: number) => (growing.includes(i) ? t('a11y.growingState') : t(`a11y.${beds[i]}`));

  return (
    <View style={styles.root}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        <View style={styles.beds}>
          {beds.map((bed, i) => (
            <BedView
              key={i}
              index={i}
              bed={bed}
              growing={growing.includes(i)}
              growMs={growMs}
              bubble={cfg.bubbles && !growing.includes(i) ? needOf(bed) : null}
              glow={hintBed === i}
              nudge={nudge[i] ?? 0}
              burst={burst[i] ?? 0}
              size={size}
              label={t('a11y.bed', { number: i + 1, state: stateLabel(i) })}
              reduced={reduced}
              onPress={() => care(i, tool)}
            />
          ))}
        </View>
      </View>
      <View style={styles.tools}>
        {cfg.tools.map((x) => (
          <Pressable key={x} onPress={() => setTool(x)} accessibilityRole="button" accessibilityState={{ selected: tool === x }} accessibilityLabel={t('a11y.tool', { tool: t(`play.tool.${x}`) })} testID={`tool-${x}`}>
            <Tile state={tool === x ? 'selected' : 'idle'} width={110} minHeight={64}>
              <View style={styles.toolFace}>
                <Art name={TOOL_ART[x]} size={36} />
                <AppText variant="small">{t(`play.tool.${x}`)}</AppText>
              </View>
            </Tile>
          </Pressable>
        ))}
      </View>
      <AppText variant="tiny" align="center" color={core.k.textMuted}>{`${done} / ${total}`}</AppText>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={allBloom} art="prophet.ayyub-spring" title={t('play.doneTitle')} caption={t('play.doneText')} onContinue={() => core.finish(0)} artSize={190} />
    </View>
  );
}

/** Garden of Patience (Ayyub, Quran 21:83–84, 38:41–44): care for a withered garden; the spring is the narrated payoff. */
export function AyyubGardenGame(api: GameApi<GardenConfig>) {
  return (
    <GameBoard api={api}>
      <Garden api={api} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, justifyContent: 'center', minHeight: 180 },
  beds: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  bed: { borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', paddingTop: 6, paddingBottom: 6 },
  bubble: { position: 'absolute', top: -6, right: -6, borderRadius: 16, borderWidth: 1.5, padding: 3 },
  growTrack: { height: 8, width: '70%', borderRadius: 4, borderWidth: 1, overflow: 'hidden' },
  growFill: { height: '100%', borderRadius: 4 },
  growSpace: { height: 8 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  toolFace: { alignItems: 'center', gap: 2 },
});

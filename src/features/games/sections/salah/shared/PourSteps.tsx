import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Art, hasArt } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, CheckBadge, ChallengeClock, DragTile, DropZone, faceLabel, Glow, HintPointer, InlineCaption, kitShuffle, Tile, useKitColors as useKitColorsSafe, type EngineProps, type KitItem, type KitText } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useMeasure } from '@/core/games/kit/layout';
import { useKitProbe } from '@/core/games/kit/probe';
import { fonts, radius, spacing } from '@/core/theme';

/*
 * PourSteps – a custom engine of the salah section (the kit has no "pour onto parts in order" mechanic): drag the
 * ibrik onto the body part that comes next (or tap the part). The card fills with water up to its `fill` line (e.g.
 * only a quarter for wiping the head), shows its step number and a short inline caption. Built from kit primitives.
 */

export interface PourPart extends KitItem {
  /** How far the water rises in the card (default 1 = the whole part). */
  fill?: number;
  /** Inline caption after this part (short, sourced in the level facts). */
  caption?: KitText;
}

export interface PourStepsProps extends EngineProps {
  /** Parts in the right order. */
  parts: PourPart[];
  /** Art of the jug (default `salah.basics-ibrik`). */
  toolArt?: string;
  toolLabel: KitText;
  /** Gentle caption after a wrong part (default: the kit's "try again"). */
  wrongText?: KitText;
  /** Cards per row (default 3, or 4 for eight parts). */
  columns?: number;
}

export function PourSteps(props: PourStepsProps) {
  const { parts } = props;
  const core = useEngineCore(props, parts.length);
  const { env, k, reduced } = core;
  const grid = useMemo(() => kitShuffle(parts, `${core.seed}:pour`), [parts, core.seed]);
  const [washed, setWashed] = useState<string[]>([]);
  const [selected, setSelected] = useState(false);
  const [nudge, setNudge] = useState(0);
  const [wrongTick, setWrongTick] = useState<{ id: string; n: number }>({ id: '', n: 0 });
  const area = useMeasure();
  const testID = props.testID ?? 'pour-steps';
  const next = parts.find((p) => !washed.includes(p.id));
  const label = (p: KitItem) => faceLabel(p, env.text);
  const columns = props.columns ?? (parts.length > 6 ? 4 : 3);

  const pour = (partId: string): boolean => {
    if (core.finishedRef.current || washed.includes(partId)) return false;
    setSelected(false);
    if (!next || partId !== next.id) {
      core.wrong(partId, props.wrongText ? env.text(props.wrongText) : undefined);
      setNudge((n) => n + 1);
      setWrongTick((w) => ({ id: partId, n: w.n + 1 }));
      return false;
    }
    const nextWashed = [...washed, partId];
    setWashed(nextWashed);
    core.progress(nextWashed.length);
    const part = parts.find((p) => p.id === partId)!;
    core.right({ caption: part.caption ? `${nextWashed.length}. ${label(part)} – ${env.text(part.caption)}` : `${nextWashed.length}. ${label(part)}`, tone: part.caption ? 'fact' : 'right' });
    if (nextWashed.length === parts.length) core.finish(reduced ? 300 : 1300);
    return true;
  };

  useKitProbe({
    engine: 'PourSteps',
    testID,
    step: () => {
      if (!next) return false;
      pour(next.id);
      return true;
    },
    mistake: () => {
      const other = parts.find((p) => !washed.includes(p.id) && p.id !== next?.id);
      if (!other) return false;
      pour(other.id);
      return true;
    },
    done: () => !next,
  });

  const gap = spacing.sm;
  const cardW = area.w > 0 ? Math.floor((area.w - gap * (columns - 1)) / columns) : 90;
  const rows = Math.ceil(parts.length / columns);
  const cardH = area.h > 0 ? Math.max(84, Math.min(cardW * 1.15, (area.h - gap * (rows - 1)) / rows)) : 100;
  const artSize = Math.min(cardW - 20, cardH - 40);
  const nextIndex = next ? grid.findIndex((p) => p.id === next.id) : -1;
  const showHint = core.hintsOn && core.idle && !!next && area.w > 0;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.toolRow}>
        <DragTile
          id="tool"
          testID="tile-tool"
          selected={selected}
          nudge={nudge}
          accessibilityLabel={env.kt(selected ? 'a11y.selected' : 'a11y.tile', { label: env.text(props.toolLabel) })}
          onLift={() => {
            setSelected(false);
            core.touch();
          }}
          onPress={() => {
            setSelected((s) => !s);
            core.touch();
          }}
          onDrop={(zone) => (zone.startsWith('part-') ? pour(zone.slice(5)) : false)}
        >
          <Tile state={selected ? 'selected' : 'idle'} width={84} minHeight={84} glow={core.hintsOn && washed.length === 0 && !selected}>
            <Art name={props.toolArt && hasArt(props.toolArt) ? props.toolArt : 'salah.basics-ibrik'} size={64} />
          </Tile>
        </DragTile>
        <AppText variant="tiny" color={k.textMuted} style={styles.toolText}>
          {env.text(props.toolLabel)}
        </AppText>
      </View>
      <View style={styles.grid} onLayout={area.onLayout}>
        {grid.map((part, i) => {
          const order = washed.indexOf(part.id);
          const done = order >= 0;
          const isNext = core.hintsOn && next?.id === part.id;
          return (
            <DropZone
              key={part.id}
              id={`part-${part.id}`}
              testID={`zone-${part.id}`}
              disabled={done}
              accessibilityLabel={done ? `${order + 1}. ${label(part)}` : env.kt('a11y.zone', { label: label(part) })}
              onPress={() => pour(part.id)}
              style={{ width: cardW, height: cardH, marginLeft: i % columns ? gap : 0, marginTop: i >= columns ? gap : 0 }}
              hoverStyle={{ borderRadius: radius.md + 3, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
            >
              <PartCard
                part={part}
                done={done}
                order={order + 1}
                isNext={isNext}
                wrongTick={wrongTick.id === part.id ? wrongTick.n : 0}
                artSize={artSize}
                label={label(part)}
                reduced={reduced}
              />
            </DropZone>
          );
        })}
        {showHint && nextIndex >= 0 ? (
          <HintPointer
            from={{ x: 42, y: -60 }}
            to={{ x: (nextIndex % columns) * (cardW + gap) + cardW / 2, y: Math.floor(nextIndex / columns) * (cardH + gap) + cardH / 2 }}
          />
        ) : null}
      </View>
      <InlineCaption text={selected ? env.kt('fb.selected', { label: env.text(props.toolLabel) }) : core.caption?.text} tone={selected ? 'hint' : core.caption?.tone} />
    </View>
  );
}

function PartCard({ part, done, order, isNext, wrongTick, artSize, label, reduced }: { part: PourPart; done: boolean; order: number; isNext: boolean; wrongTick: number; artSize: number; label: string; reduced: boolean }) {
  const water = useSharedValue(0);
  const shake = useSharedValue(0);
  useEffect(() => {
    const to = done ? (part.fill ?? 1) : 0;
    water.set(reduced ? to : withTiming(to, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [done, part.fill, reduced, water]);
  useEffect(() => {
    if (wrongTick <= 0 || reduced) return;
    shake.set(0);
    shake.set(withTiming(1, { duration: 360 }));
  }, [wrongTick, reduced, shake]);
  const waterStyle = useAnimatedStyle(() => ({ height: `${water.value * 100}%` }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin(shake.value * Math.PI * 4) * 6 * (1 - shake.value) }] }));
  return (
    <Animated.View style={[styles.cardWrap, shakeStyle]}>
      {isNext ? <Glow active radius={radius.md} /> : null}
      <Tile state={done ? 'right' : 'idle'} height={undefined} style={styles.fill} faceStyle={styles.cardFace} padding={0}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <WaterFill style={waterStyle} />
        </View>
        <View style={styles.cardContent} pointerEvents="none">
          {part.art && hasArt(part.art) ? <Art name={part.art} size={artSize} /> : null}
          <AppText variant="tiny" align="center" numberOfLines={2} style={{ fontFamily: fonts.bold }}>
            {label}
          </AppText>
        </View>
        {done ? (
          <View style={styles.badge} pointerEvents="none">
            <OrderBadge n={order} />
          </View>
        ) : null}
      </Tile>
      <CheckBadge show={done} />
      {done ? <Burst trigger={order} distance={artSize * 0.6} /> : null}
    </Animated.View>
  );
}

function WaterFill({ style }: { style: object }) {
  const k = useKitColorsSafe();
  return <Animated.View style={[styles.water, { backgroundColor: k.waterSoft, borderTopColor: k.water }, style]} />;
}

function OrderBadge({ n }: { n: number }) {
  const k = useKitColorsSafe();
  return (
    <View style={[styles.orderBadge, { backgroundColor: k.accent }]}>
      <AppText variant="tiny" color={k.onAccent} style={{ fontFamily: fonts.heavy }}>
        {String(n)}
      </AppText>
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, zIndex: 20, elevation: 20 },
  toolText: { flex: 1 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start' },
  cardWrap: { flex: 1 },
  fill: { flex: 1 },
  cardFace: { flex: 1, overflow: 'hidden' },
  cardContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4 },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 2, opacity: 0.85 },
  badge: { position: 'absolute', left: 4, top: 4 },
  orderBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
});

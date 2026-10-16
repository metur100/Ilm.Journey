import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Art, catalogue, hasArt } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import {
  Burst,
  ChallengeClock,
  DragTile,
  DropZone,
  type EngineProps,
  FaceView,
  faceLabel,
  GrowIn,
  HintPointer,
  InlineCaption,
  type KitBox,
  type KitItem,
  type KitText,
  kitShuffle,
  Pop,
  Tile,
  Tray,
  useEngineCore,
  useKitProbe,
  useMeasure,
} from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

/*
 * SceneDrop – the akhlaq section's own drag & drop engine (built from the kit primitives): drop tiles from a tray
 * onto places in an illustrated scene, where a pure rule decides what is right. Placed tiles stay at their place
 * (small pictures in a pile). It covers what the kit's BuildScene / SortBins cannot: one place taking several items
 * (plates, doors), places that open in a given order (the nearest door first), and distractor tiles that never fit
 * (unkind words, the not-good deed).
 */

export interface DropTarget {
  id: string;
  /** Place in the scene (fractions 0..1). */
  at: KitBox;
  label?: KitText;
  /** Art drawn at the place before anything is placed (a plate, a door …). */
  art?: string;
}

export interface DropMove {
  item: string;
  target: string;
}

/** The pure rule of a SceneDrop game (unit-tested in the game's logic). */
export interface DropRule {
  /** `true` = right; a string = wrong, with the gentle reason shown in the caption. */
  check: (placed: readonly DropMove[], move: DropMove) => true | string;
  /** A right move from this state (for hints and the test probe), or null when nothing is left. */
  next: (placed: readonly DropMove[]) => DropMove | null;
  /** A wrong move from this state (test probe), or null. */
  wrong: (placed: readonly DropMove[]) => DropMove | null;
  /** The round is complete. */
  done: (placed: readonly DropMove[]) => boolean;
  /** Number of right moves of the round (progress). */
  total: number;
}

export interface SceneDropProps extends EngineProps {
  scene?: string;
  aspect?: number;
  /** Extra layers over the scene (e.g. a growing tree). */
  backdrop?: ReactNode;
  targets: DropTarget[];
  items: KitItem[];
  rule: DropRule;
  /** Keep the item order (default: shuffled). */
  ordered?: boolean;
  /** Tiles in the tray at once (default 4). */
  visible?: number;
  /** Caption after a right move (default: the kit's cheering). */
  rightCaption?: (move: DropMove) => string | undefined;
  /** Hide placed items at their place (e.g. words that turn into leaves of a backdrop). */
  hidePlaced?: boolean;
  /** Tile width (default 84; word tiles grow with their text). */
  tileWidth?: number;
  /** Called after every right move with the placements so far. */
  onPlaced?: (placed: readonly DropMove[]) => void;
}

export function SceneDrop(props: SceneDropProps) {
  const { targets, items, rule } = props;
  const core = useEngineCore(props, rule.total);
  const { env, k, reduced } = core;
  const tray = useMemo(() => (props.ordered ? [...items] : kitShuffle(items, `${core.seed}:drop`)), [items, props.ordered, core.seed]);
  const [placed, setPlaced] = useState<DropMove[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [pops, setPops] = useState<Record<string, number>>({});
  const area = useMeasure();
  const testID = props.testID ?? 'scene-drop';
  const label = (f: KitItem) => faceLabel(f, env.text);
  const isPlaced = (id: string) => placed.some((p) => p.item === id);

  const drop = (item: string, target: string): boolean => {
    if (core.finishedRef.current || isPlaced(item)) return false;
    setSelected(null);
    const verdict = rule.check(placed, { item, target });
    if (verdict !== true) {
      core.wrong(item, verdict);
      setNudge((n) => ({ ...n, [item]: (n[item] ?? 0) + 1 }));
      return false;
    }
    const next = [...placed, { item, target }];
    setPlaced(next);
    setPops((p) => ({ ...p, [target]: (p[target] ?? 0) + 1 }));
    core.progress(Math.min(rule.total, next.length));
    const caption = props.rightCaption?.({ item, target });
    core.right(caption ? { caption, tone: 'fact' } : {});
    props.onPlaced?.(next);
    if (rule.done(next)) core.finish(reduced ? 300 : 900);
    return true;
  };

  useKitProbe({
    engine: 'SceneDrop',
    testID,
    step: () => {
      const move = rule.next(placed);
      if (!move || core.finishedRef.current) return false;
      return drop(move.item, move.target) || true;
    },
    mistake: () => {
      const move = rule.wrong(placed);
      if (!move || core.finishedRef.current) return false;
      drop(move.item, move.target);
      return true;
    },
    done: () => core.finishedRef.current || rule.done(placed),
  });

  const bgAspect = props.scene && catalogue[props.scene] ? catalogue[props.scene].aspect : 4 / 3;
  const aspect = props.aspect ?? bgAspect;
  const w = area.w > 0 ? Math.min(area.w, area.h * aspect) : 0;
  const h = w / aspect;
  const waiting = tray.filter((i) => !isPlaced(i.id));
  const visible = waiting.slice(0, props.visible ?? 4);
  // Never leave only distractors in the tray: the next right item always gets a place.
  const needed = rule.next(placed);
  if (needed && visible.length > 0 && !visible.some((i) => i.id === needed.item)) {
    const item = waiting.find((i) => i.id === needed.item);
    if (item) visible[visible.length - 1] = item;
  }
  const rest = waiting.length - visible.length;
  const hint = core.hintsOn && core.idle && !selected ? needed : null;
  const hintTarget = hint ? targets.find((t) => t.id === hint.target) : undefined;
  const tileW = props.tileWidth ?? 84;
  const pictures = items.every((i) => !!i.art);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.sceneArea} onLayout={area.onLayout}>
        {w > 0 ? (
          <View style={[styles.frame, { width: w, height: h, borderColor: k.boardBorder }]}>
            {props.scene && hasArt(props.scene) ? <Art name={props.scene} size={w} height={h} fit="cover" /> : <LinearGradient colors={[k.accentSoft, k.board[1]]} style={StyleSheet.absoluteFill} />}
            {props.backdrop ? <View style={StyleSheet.absoluteFill} pointerEvents="none">{props.backdrop}</View> : null}
            {targets.map((t) => {
              const box = { left: t.at.x * w, top: t.at.y * h, width: t.at.w * w, height: t.at.h * h };
              const inside = placed.filter((p) => p.target === t.id).map((p) => items.find((i) => i.id === p.item)!);
              const tLabel = env.text(t.label);
              return (
                <View key={t.id} style={[styles.abs, box]}>
                  <DropZone
                    id={`target-${t.id}`}
                    testID={`zone-${t.id}`}
                    accessibilityLabel={`${tLabel}${inside.length ? `, ${inside.length}` : ''}${selected ? `. ${env.kt('a11y.zone', { label: tLabel })}` : ''}`}
                    onPress={selected ? () => drop(selected, t.id) : undefined}
                    style={[styles.target, { borderColor: selected ? k.gold : 'transparent' }]}
                    hoverStyle={{ borderRadius: radius.md, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
                  >
                    <Pop trigger={pops[t.id] ?? 0} style={styles.targetInner}>
                      {t.art && hasArt(t.art) ? <Art name={t.art} size={Math.min(box.width, box.height * (catalogue[t.art]?.aspect ?? 1))} /> : null}
                      {!props.hidePlaced && inside.length > 0 ? (
                        <View style={styles.pile} pointerEvents="none">
                          {inside.slice(-4).map((i, n) => (
                            <GrowIn key={i.id} style={{ marginLeft: n ? -12 : 0 }}>
                              {i.art && hasArt(i.art) ? <Art name={i.art} size={Math.max(22, Math.min(40, box.width * 0.42))} /> : <View style={[styles.dot, { backgroundColor: k.gold }]} />}
                            </GrowIn>
                          ))}
                        </View>
                      ) : null}
                      <Burst trigger={pops[t.id] ?? 0} distance={40} />
                    </Pop>
                  </DropZone>
                  {tLabel ? (
                    <View style={[styles.tag, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]} pointerEvents="none">
                      <AppText variant="tiny" color={k.text} numberOfLines={1}>
                        {tLabel}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              );
            })}
            {hintTarget ? <HintPointer from={{ x: (hintTarget.at.x + hintTarget.at.w / 2) * w, y: (hintTarget.at.y + hintTarget.at.h / 2) * h }} /> : null}
          </View>
        ) : null}
      </View>
      <InlineCaption text={selected ? env.kt('fb.selected', { label: label(items.find((i) => i.id === selected)!) }) : core.caption?.text} tone={selected ? 'hint' : core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.tray}>
        {visible.map((item) => (
          <Animated.View key={item.id} entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(14)} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
            <DragTile
              id={item.id}
              selected={selected === item.id}
              nudge={nudge[item.id] ?? 0}
              accessibilityLabel={env.kt('a11y.tile', { label: label(item) })}
              onLift={() => {
                setSelected(null);
                core.touch();
              }}
              onPress={() => {
                setSelected((s) => (s === item.id ? null : item.id));
                core.touch();
              }}
              onDrop={(zone) => (zone.startsWith('target-') ? drop(item.id, zone.slice(7)) : false)}
            >
              <Tile state={selected === item.id || hint?.item === item.id ? 'selected' : 'idle'} width={pictures ? tileW : undefined} minHeight={pictures ? tileW : 52} padding={pictures ? 4 : spacing.sm} style={!pictures ? { minWidth: tileW, maxWidth: 260 } : undefined}>
                <FaceView face={item} artSize={Math.min(48, tileW - 30)} variant={pictures ? 'tiny' : 'small'} numberOfLines={3} />
              </Tile>
            </DragTile>
          </Animated.View>
        ))}
        {rest > 0 ? (
          <View style={[styles.more, { borderColor: k.slotBorder }]}>
            <AppText variant="small" color={k.textMuted}>{`+${rest}`}</AppText>
          </View>
        ) : null}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  sceneArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  frame: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  abs: { position: 'absolute' },
  target: { flex: 1, borderRadius: radius.md, borderWidth: 2, borderStyle: 'dashed', minWidth: 48, minHeight: 48 },
  targetInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pile: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', bottom: '18%' },
  dot: { width: 14, height: 14, borderRadius: 7 },
  tag: { position: 'absolute', bottom: -10, alignSelf: 'center', borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  tray: { minHeight: 70 },
  more: { minWidth: 48, minHeight: 48, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
});

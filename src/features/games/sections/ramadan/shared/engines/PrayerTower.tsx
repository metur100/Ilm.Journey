import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { domePath, crescentPath } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, DragTile, DropZone, type EngineProps, InlineCaption, Tile, Tray, useEngineCore, useKitProbe, useMeasure } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

import { NightBackdrop } from '../ui';

/*
 * PrayerTower – a custom Ramadan engine: stack the night prayer into a glowing tower. Blocks of two rakats go side by
 * side, a rest (a small lantern) closes every floor of four rakats, and vitr crowns the tower. Wrong blocks shake
 * back with an inline explanation. Drag a block onto the tower or tap it.
 */

export type TowerKind = 'two' | 'rest' | 'vitr';

export interface PrayerTowerProps extends EngineProps {
  /** The full correct sequence, bottom to top. */
  sequence: TowerKind[];
  /** Kinds placed automatically when they come next (e.g. the rests on an easy level). */
  auto?: TowerKind[];
  /** Kinds offered in the tray. */
  tray: TowerKind[];
  showCount?: boolean;
  /** Faint outlines of the places still to fill. */
  ghosts?: boolean;
  labels: Record<TowerKind, string>;
  texts: { count: (rakats: number) => string; wrong: (got: TowerKind, expected: TowerKind) => string; tower: string };
}

export function rakatsOf(kinds: readonly TowerKind[]): number {
  return kinds.reduce((n, k) => n + (k === 'two' ? 2 : k === 'vitr' ? 3 : 0), 0);
}

/** Splits the sequence into floors (each ends with a rest) and the crown (vitr). */
function floorsOf(sequence: readonly TowerKind[]): { index: number; kind: TowerKind }[][] {
  const floors: { index: number; kind: TowerKind }[][] = [[]];
  sequence.forEach((kind, index) => {
    if (kind === 'vitr') {
      floors.push([{ index, kind }]);
      return;
    }
    floors[floors.length - 1].push({ index, kind });
    if (kind === 'rest') floors.push([]);
  });
  return floors.filter((f) => f.length > 0);
}

export function PrayerTower(props: PrayerTowerProps) {
  const { sequence, tray, labels, texts } = props;
  const auto = props.auto ?? [];
  const total = sequence.filter((k) => !auto.includes(k)).length;
  const core = useEngineCore(props, total);
  const { k, reduced } = core;
  const area = useMeasure();
  const [pos, setPos] = useState(() => skipAuto(sequence, auto, 0));
  const [moves, setMoves] = useState(0);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const testID = props.testID ?? 'prayer-tower';
  const done = pos >= sequence.length;
  const expected = sequence[pos];
  const rakats = rakatsOf(sequence.slice(0, pos));

  const place = (kind: TowerKind): boolean => {
    if (core.finishedRef.current || done) return false;
    if (kind !== expected) {
      core.wrong(kind, texts.wrong(kind, expected));
      setNudge((n) => ({ ...n, [kind]: (n[kind] ?? 0) + 1 }));
      return false;
    }
    const next = skipAuto(sequence, auto, pos + 1);
    setPos(next);
    const m = moves + 1;
    setMoves(m);
    core.progress(m);
    core.right({ caption: texts.count(rakatsOf(sequence.slice(0, next))) });
    if (next >= sequence.length) core.finish(1200);
    return true;
  };

  useKitProbe({
    engine: 'PrayerTower',
    testID,
    step: () => {
      if (done) return false;
      place(expected);
      return true;
    },
    mistake: () => {
      const other = tray.find((t) => t !== expected);
      if (done || !other) return false;
      place(other);
      return true;
    },
    done: () => done,
  });

  const floors = floorsOf(sequence);
  const w = area.w;
  const towerW = Math.min(w * 0.8, 300);
  const floorH = Math.max(40, Math.min(54, (area.h - 70) / Math.max(1, floors.length)));

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {props.showCount ? (
        <View style={[styles.counter, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]}>
          <AppText variant="bodyBold" color={k.text} style={{ fontFamily: fonts.heavy }}>
            {texts.count(rakats)}
          </AppText>
        </View>
      ) : null}
      <DropZone
        id="tower"
        testID="zone-tower"
        accessibilityLabel={texts.tower}
        style={[styles.towerZone, { borderColor: k.boardBorder }]}
        hoverStyle={{ borderRadius: radius.lg + 3, borderWidth: 3, borderColor: k.gold }}
      >
        <View style={StyleSheet.absoluteFill} onLayout={area.onLayout}>
          {w > 0 ? <NightBackdrop w={w} h={area.h} id="prayertower" /> : null}
        </View>
        <View style={styles.tower}>
          {floors.map((floor, f) => {
            if (floor[0].kind === 'vitr') {
              const item = floor[0];
              const built = item.index < pos;
              const show = built || props.ghosts;
              return (
                <View key={`f${f}`} style={[styles.crown, { width: towerW * 0.5, height: floorH * 1.3, opacity: built ? 1 : show ? 0.3 : 0 }]}>
                  <Svg width={towerW * 0.5} height={floorH * 1.3} viewBox="0 0 100 70">
                    <Path d={domePath(50, 66, 34, 1.5)} fill={built ? '#F2B544' : 'none'} stroke="#F7D774" strokeWidth={built ? 0 : 2} strokeDasharray="4 4" />
                    <Path d={crescentPath(50, 8, 5, 2.4, -1.6, 4.2)} fill="#F7D774" />
                  </Svg>
                  {built ? (
                    <View style={styles.crownLabel}>
                      <AppText variant="tiny" color={k.onGold} style={{ fontFamily: fonts.heavy }}>
                        {labels.vitr}
                      </AppText>
                    </View>
                  ) : null}
                  {built ? <Burst trigger={1} distance={40} /> : null}
                </View>
              );
            }
            const shrink = 1 - f * 0.05;
            return (
              <View key={`f${f}`} style={[styles.floor, { width: towerW * shrink, height: floorH }]}>
                {floor.map((item) => {
                  const built = item.index < pos;
                  const isNext = item.index === pos;
                  if (!built && !props.ghosts && !isNext) return <View key={item.index} style={item.kind === 'rest' ? styles.restSlot : styles.blockSlot} />;
                  if (item.kind === 'rest') {
                    return (
                      <View key={item.index} style={[styles.restSlot, { borderColor: built ? k.goldEdge : k.slotBorder, backgroundColor: built ? k.gold : 'transparent', opacity: built ? 1 : 0.45 }]}>
                        {built ? (
                          <Animated.View entering={reduced ? FadeIn : ZoomIn.springify().damping(14)}>
                            <Svg width={16} height={16} viewBox="0 0 20 20">
                              <Path d={crescentPath(10, 10, 7, 3.4, -2.4, 6)} fill="#FFFFFF" />
                            </Svg>
                          </Animated.View>
                        ) : null}
                      </View>
                    );
                  }
                  return (
                    <View key={item.index} style={styles.blockSlot}>
                      {built ? (
                        <Animated.View entering={reduced ? FadeIn : ZoomIn.springify().damping(14)} style={{ flex: 1 }}>
                          <Tile state="placed" height={floorH - 6} minHeight={36} padding={2}>
                            <AppText variant="bodyBold" color={k.text} style={{ fontFamily: fonts.heavy }}>
                              {labels.two}
                            </AppText>
                          </Tile>
                        </Animated.View>
                      ) : (
                        <View style={[styles.ghost, { borderColor: isNext && core.hintsOn ? k.gold : k.slotBorder, height: floorH - 6 }]} />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </DropZone>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={texts.tower}>
        {tray.map((kind) => (
          <DragTile
            key={kind}
            id={kind}
            testID={`tile-${kind}`}
            nudge={nudge[kind] ?? 0}
            accessibilityLabel={labels[kind]}
            onLift={() => core.touch()}
            onPress={() => place(kind)}
            onDrop={(zone) => (zone === 'tower' ? place(kind) : false)}
          >
            <Tile state="idle" minHeight={52} glow={core.hintsOn && core.idle && kind === expected} style={{ minWidth: 96 }}>
              <AppText variant="bodyBold" color={k.text} align="center">
                {labels[kind]}
              </AppText>
            </Tile>
          </DragTile>
        ))}
      </Tray>
    </View>
  );
}

function skipAuto(sequence: readonly TowerKind[], auto: readonly TowerKind[], from: number): number {
  let i = from;
  while (i < sequence.length && auto.includes(sequence[i])) i++;
  return i;
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  counter: { alignSelf: 'center', borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: spacing.lg, paddingVertical: 4 },
  towerZone: { flex: 1, minHeight: 260, borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  tower: { flex: 1, flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'flex-start', paddingBottom: spacing.sm, gap: 3 },
  floor: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  blockSlot: { flex: 1 },
  restSlot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  ghost: { borderRadius: radius.md, borderWidth: 2, borderStyle: 'dashed' },
  crown: { alignItems: 'center', justifyContent: 'flex-end' },
  crownLabel: { position: 'absolute', bottom: 6 },
});

import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Art, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { DragTile, DropZone } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, Pop } from '../fx';
import { FaceView, faceLabel, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { useMeasure } from '../layout';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitFace, KitItem } from '../types';

export interface SortBin extends KitFace {
  id: string;
}

export interface SortItem extends KitItem {
  /** Id of the bin it belongs in. */
  bin: string;
}

export interface SortBinsProps extends EngineProps {
  /** 2–4 bins (baskets). `art` defaults to `kit.basket`. */
  bins: SortBin[];
  items: SortItem[];
  /** Items waiting in the tray at once (default 4 with pictures, 3 for words); the rest follow. */
  visible?: number;
  /** Keep the given item order instead of shuffling. */
  ordered?: boolean;
}

const TRAY_GAP = spacing.sm;

/** Pure rule: is `binId` the right bin for the item? */
export function isRightBin(items: readonly SortItem[], itemId: string, binId: string): boolean {
  return items.find((i) => i.id === itemId)?.bin === binId;
}

/**
 * SortBins – drag each item into the right basket (2–4 illustrated bins). Right: the item drops in, the basket
 * bounces and its counter grows. Wrong: the item springs back with a soft shake. Tap an item, then a basket, works
 * too. Items come from a small tray, a few at a time.
 */
export function SortBins(props: SortBinsProps) {
  const { bins, items, ordered } = props;
  const core = useEngineCore(props, items.length);
  const { env, k, reduced } = core;
  const label = (f: KitFace) => faceLabel(f, env.text);
  const queue = useMemo(() => (ordered ? [...items] : kitShuffle(items, `${core.seed}:sort`)), [items, ordered, core.seed]);
  const pictures = items.every((i) => !!i.art);
  const visibleCount = props.visible ?? (pictures ? 4 : 3);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [pops, setPops] = useState<Record<string, number>>({});
  const measured = useMeasure();
  const width = measured.w;
  const testID = props.testID ?? 'sort-bins';

  const waiting = queue.filter((i) => !placed[i.id]);
  const visible = waiting.slice(0, visibleCount);
  const doneCount = items.length - waiting.length;

  const place = (itemId: string, binId: string): boolean => {
    if (placed[itemId] || core.finishedRef.current) return false;
    if (!isRightBin(items, itemId, binId)) {
      core.wrong(itemId);
      setNudge((n) => ({ ...n, [itemId]: (n[itemId] ?? 0) + 1 }));
      setSelected(null);
      return false;
    }
    const next = { ...placed, [itemId]: binId };
    setPlaced(next);
    setSelected(null);
    setPops((p) => ({ ...p, [binId]: (p[binId] ?? 0) + 1 }));
    const done = Object.keys(next).length;
    core.progress(done);
    const item = items.find((i) => i.id === itemId)!;
    const bin = bins.find((b) => b.id === binId)!;
    core.right({ caption: `${label(item)} → ${label(bin)}` });
    if (done === items.length) core.finish();
    return true;
  };

  useKitProbe({
    engine: 'SortBins',
    testID,
    step: () => {
      const next = waiting[0];
      if (!next) return false;
      place(next.id, next.bin);
      return true;
    },
    mistake: () => {
      const next = waiting[0];
      const other = next && bins.find((b) => b.id !== next.bin);
      if (!next || !other) return false;
      place(next.id, other.id);
      return true;
    },
    done: () => waiting.length === 0,
  });

  const onLayout = measured.onLayout;
  const tileW = width > 0 ? Math.floor((width - TRAY_GAP * (Math.min(visibleCount, pictures ? 4 : 2) - 1)) / Math.min(visibleCount, pictures ? 4 : 2)) : 80;
  const binW = width > 0 ? Math.floor((width - spacing.sm * (bins.length - 1)) / bins.length) : 100;
  const artSize = Math.min(64, tileW - 24);
  const showHint = core.hintsOn && core.idle && !selected && visible.length > 0 && width > 0;
  const hintItem = visible[0];
  const hintBinIndex = hintItem ? bins.findIndex((b) => b.id === hintItem.bin) : -1;

  return (
    <View style={styles.root} testID={testID} onLayout={onLayout}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.trayArea}>
        <Tray label={env.kt('tray')}>
          {visible.map((item) => (
            <Animated.View key={item.id} entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(14)} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
              <DragTile
                id={item.id}
                selected={selected === item.id}
                nudge={nudge[item.id] ?? 0}
                accessibilityLabel={selected === item.id ? env.kt('a11y.selected', { label: label(item) }) : env.kt('a11y.tile', { label: label(item) })}
                onLift={() => {
                  setSelected(null);
                  core.touch();
                }}
                onPress={() => {
                  setSelected((s) => (s === item.id ? null : item.id));
                  core.touch();
                }}
                onDrop={(zone) => (zone ? place(item.id, zone) : false)}
              >
                <Tile state={selected === item.id ? 'selected' : 'idle'} width={pictures ? tileW : undefined} minHeight={pictures ? tileW : 52} style={!pictures ? { minWidth: tileW, maxWidth: width || undefined } : undefined}>
                  <FaceView face={item} artSize={artSize} variant={pictures ? 'tiny' : 'bodyBold'} numberOfLines={2} />
                </Tile>
              </DragTile>
            </Animated.View>
          ))}
          {waiting.length > visible.length ? (
            <View style={[styles.more, { borderColor: k.slotBorder }]}>
              <AppText variant="small" color={k.textMuted}>{`+${waiting.length - visible.length}`}</AppText>
            </View>
          ) : null}
        </Tray>
      </View>

      <InlineCaption text={selected ? env.kt('fb.selected', { label: label(items.find((i) => i.id === selected)!) }) : core.caption?.text} tone={selected ? 'hint' : core.caption?.tone} />

      <View style={styles.bins}>
        {bins.map((bin) => {
          const inside = items.filter((i) => placed[i.id] === bin.id);
          return (
            <DropZone
              key={bin.id}
              id={bin.id}
              testID={`zone-${bin.id}`}
              accessibilityLabel={`${env.kt('bins.bin', { label: label(bin), count: inside.length })}${selected ? `. ${env.kt('a11y.zone', { label: label(bin) })}` : ''}`}
              onPress={selected ? () => place(selected, bin.id) : undefined}
              style={[styles.bin, { width: binW, backgroundColor: k.slotFill, borderColor: selected ? k.gold : k.slotBorder }]}
              hoverStyle={{ borderRadius: radius.lg + 3, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
            >
              <Pop trigger={pops[bin.id] ?? 0} style={styles.binInner}>
                <View style={[styles.binLabel, { backgroundColor: k.accent }]}>
                  <AppText variant="small" color={k.onAccent} align="center" numberOfLines={2}>
                    {label(bin)}
                  </AppText>
                </View>
                <View style={styles.binArt}>
                  <Art name={bin.art && hasArt(bin.art) ? bin.art : 'kit.basket'} size={Math.min(binW - 16, 120)} />
                  <View style={styles.peek} pointerEvents="none">
                    {inside.slice(-3).map((i, n) => (
                      <View key={i.id} style={{ marginLeft: n ? -10 : 0, transform: [{ rotate: `${(n - 1) * 12}deg` }] }}>
                        {i.art && hasArt(i.art) ? <Art name={i.art} size={26} /> : <View style={[styles.peekDot, { backgroundColor: k.gold }]} />}
                      </View>
                    ))}
                  </View>
                  <Burst trigger={pops[bin.id] ?? 0} distance={50} />
                </View>
                {inside.length > 0 ? (
                  <View style={[styles.count, { backgroundColor: k.right, borderColor: k.tileFace }]}>
                    <AppText variant="tiny" color={k.tileFace}>
                      {String(inside.length)}
                    </AppText>
                  </View>
                ) : null}
              </Pop>
            </DropZone>
          );
        })}
      </View>
      <View style={styles.progressRow}>
        <AppText variant="tiny" color={k.textMuted} align="center">
          {env.kt('progress', { done: doneCount, total: items.length })}
        </AppText>
      </View>
      {showHint && hintBinIndex >= 0 ? (
        <HintPointer from={{ x: tileW / 2, y: 40 }} to={{ x: binW * hintBinIndex + spacing.sm * hintBinIndex + binW / 2, y: 260 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  trayArea: { minHeight: 96, justifyContent: 'center', zIndex: 10, elevation: 10 },
  more: { minWidth: 48, minHeight: 48, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  bins: { flex: 1, flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch', minHeight: 170 },
  bin: { borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', padding: spacing.sm },
  binInner: { flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  binLabel: { alignSelf: 'stretch', borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 4, minHeight: 32, justifyContent: 'center' },
  binArt: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'stretch' },
  peek: { position: 'absolute', top: '30%', flexDirection: 'row', alignSelf: 'center' },
  peekDot: { width: 14, height: 14, borderRadius: 7 },
  count: { position: 'absolute', top: -14, right: -14, minWidth: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  progressRow: { minHeight: 16 },
});

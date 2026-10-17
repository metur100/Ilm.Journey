import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Art, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { DragTile, DropZone } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, Pop } from '../fx';
import { useMeasure } from '../layout';
import { FaceView, faceLabel, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
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

const GAP = spacing.sm;
/** Largest picture tile in the tray (tablets) and the smallest touch target. */
const MAX_TILE = 112;
const MIN_TILE = 64;

/** Pure rule: is `binId` the right bin for the item? */
export function isRightBin(items: readonly SortItem[], itemId: string, binId: string): boolean {
  return items.find((i) => i.id === itemId)?.bin === binId;
}

/** Even tile width for `columns` tiles in `width` (pure – exported for tests). */
export function evenTileWidth(width: number, columns: number, max = MAX_TILE): number {
  if (width <= 0 || columns <= 0) return 80;
  return Math.max(MIN_TILE, Math.min(max, Math.floor((width - GAP * (columns - 1)) / columns)));
}

/**
 * SortBins – drag each item into the right basket (2–4 illustrated bins). Right: the item drops in as a readable
 * chip (picture + name), the basket bounces and its counter grows. Wrong: the item springs back with a soft shake.
 * Tap an item, then a basket, works too. Items come from a small tray, a few at a time; all tray tiles have the same
 * size, and the bins grow with what is inside them.
 */
export function SortBins(props: SortBinsProps) {
  const { bins, items, ordered } = props;
  const core = useEngineCore(props, items.length);
  const { env, k, reduced } = core;
  const label = (f: KitFace) => faceLabel(f, env.text);
  const queue = useMemo(() => (ordered ? [...items] : kitShuffle(items, `${core.seed}:sort`)), [items, ordered, core.seed]);
  const pictures = items.every((i) => !!i.art);
  const anySub = items.some((i) => !!i.sub);
  const visibleCount = props.visible ?? (pictures ? 4 : 3);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [pops, setPops] = useState<Record<string, number>>({});
  const measured = useMeasure();
  const [binsY, setBinsY] = useState(0);
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

  // Tray: every tile has the same width – 4 pictures or 2 words per row (words are wider).
  const trayColumns = pictures ? Math.min(4, Math.max(visibleCount, 3)) : 2;
  const tileW = evenTileWidth(width, trayColumns, pictures ? MAX_TILE : 220);
  const tileArt = Math.min(56, tileW - 26);
  const binW = width > 0 ? Math.floor((width - GAP * (bins.length - 1)) / bins.length) : 100;
  // Sorted items inside a bin: two chips per row in wide bins, one in narrow ones.
  const chipCols = binW >= 150 ? 2 : 1;
  const chipW = Math.floor((binW - spacing.sm * 2 - 4 - (chipCols - 1) * 6) / chipCols);
  const stackedChip = chipW < 96;
  const basketSize = Math.max(44, Math.min(72, binW * 0.42));

  const showHint = core.hintsOn && core.idle && !selected && visible.length > 0 && width > 0;
  const hintItem = visible[0];
  const hintBinIndex = hintItem ? bins.findIndex((b) => b.id === hintItem.bin) : -1;

  return (
    <View style={styles.root} testID={testID} onLayout={measured.onLayout}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={[styles.trayArea, { minHeight: pictures ? Math.min(tileW, MAX_TILE) + 8 : 64 }]}>
        <Tray label={env.kt('tray')}>
          {visible.map((item) => (
            <Animated.View key={item.id} entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(20)} layout={reduced ? undefined : LinearTransition.duration(220)}>
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
                <Tile state={selected === item.id ? 'selected' : 'idle'} width={tileW} height={pictures ? tileW + (anySub ? 16 : 0) : undefined} minHeight={pictures ? undefined : 60} padding={pictures ? 6 : spacing.sm}>
                  <FaceView face={item} artSize={tileArt} arabicSize={pictures ? 24 : 28} variant={pictures ? 'tiny' : 'bodyBold'} numberOfLines={2} />
                </Tile>
              </DragTile>
            </Animated.View>
          ))}
        </Tray>
      </View>

      <InlineCaption
        text={selected ? env.kt('fb.selected', { label: label(items.find((i) => i.id === selected)!) }) : core.caption?.text}
        tone={selected ? 'hint' : core.caption?.tone}
      />

      <ScrollView style={styles.binsScroll} contentContainerStyle={styles.binsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bins} onLayout={(e) => setBinsY(e.nativeEvent.layout.y)}>
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
                <Pop trigger={pops[bin.id] ?? 0} style={styles.binInner} amount={0.05}>
                  <View style={[styles.binLabel, { backgroundColor: k.accent }]}>
                    <AppText variant="small" color={k.onAccent} align="center" numberOfLines={2} style={styles.binLabelText}>
                      {label(bin)}
                    </AppText>
                  </View>
                  <View style={styles.basket}>
                    <Art name={bin.art && hasArt(bin.art) ? bin.art : 'kit.basket'} size={basketSize} height={basketSize} />
                    <Burst trigger={pops[bin.id] ?? 0} distance={40} />
                    {inside.length > 0 ? (
                      <View style={[styles.count, { backgroundColor: k.right, borderColor: k.tileFace }]}>
                        <AppText variant="tiny" color={k.onRight} style={{ fontFamily: fonts.heavy }}>
                          {String(inside.length)}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.chips}>
                    {inside.map((i) => (
                      <Animated.View
                        key={i.id}
                        entering={reduced ? FadeIn.duration(150) : ZoomIn.duration(240)}
                        style={[
                          styles.chip,
                          stackedChip ? styles.chipStacked : styles.chipRow,
                          { width: chipW, backgroundColor: k.rightSoft, borderColor: k.right },
                        ]}
                        testID={`sorted-${i.id}`}
                      >
                        {i.art && hasArt(i.art) ? <Art name={i.art} size={stackedChip ? 34 : 30} height={stackedChip ? 34 : 30} /> : null}
                        {i.arabic && !i.art ? (
                          <AppText script="arabic" color={k.text} align="center" style={{ fontFamily: fonts.arabicBold, fontSize: 20, lineHeight: 30, writingDirection: 'rtl' }}>
                            {i.arabic}
                          </AppText>
                        ) : null}
                        {env.text(i.label) ? (
                          <AppText variant="tiny" color={k.text} align={stackedChip ? 'center' : 'left'} numberOfLines={2} style={stackedChip ? undefined : styles.flex}>
                            {env.text(i.label)}
                          </AppText>
                        ) : null}
                      </Animated.View>
                    ))}
                    {inside.length === 0 ? <View style={[styles.emptyLine, { borderColor: k.slotBorder }]} /> : null}
                  </View>
                </Pop>
              </DropZone>
            );
          })}
        </View>
      </ScrollView>
      <AppText variant="tiny" color={k.textMuted} align="center">
        {env.kt('progress', { done: doneCount, total: items.length })}
      </AppText>
      {showHint && hintBinIndex >= 0 ? (
        <HintPointer
          from={{ x: Math.min(tileW / 2, width / 2), y: Math.min(tileW, 80) / 2 + 4 }}
          to={{ x: binW * hintBinIndex + GAP * hintBinIndex + binW / 2, y: (binsY || 200) + 120 + 72 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  flex: { flex: 1 },
  trayArea: { justifyContent: 'center', zIndex: 10, elevation: 10 },
  binsScroll: { flex: 1, marginHorizontal: -4 },
  binsContent: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: spacing.sm },
  bins: { flexDirection: 'row', gap: GAP, alignItems: 'stretch' },
  bin: { borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', padding: spacing.sm, minHeight: 168 },
  binInner: { flex: 1, alignItems: 'center', gap: 6 },
  binLabel: { alignSelf: 'stretch', borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 4, minHeight: 32, justifyContent: 'center' },
  binLabelText: { fontFamily: fonts.bold },
  basket: { alignItems: 'center', justifyContent: 'center' },
  chips: { alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  chip: { borderRadius: radius.sm, borderWidth: 1.5, paddingHorizontal: 6, paddingVertical: 4, minHeight: 36 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipStacked: { alignItems: 'center', gap: 2 },
  emptyLine: { width: '100%', height: 36, borderRadius: radius.sm, borderWidth: 1.5, borderStyle: 'dashed', opacity: 0.6 },
  count: {
    position: 'absolute',
    top: -4,
    right: -14,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

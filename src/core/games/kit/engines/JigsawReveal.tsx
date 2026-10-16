import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Art, catalogue } from '../../../art';
import { radius, spacing } from '../../../theme';
import { ChallengeClock, FinishReveal, HintPointer, InlineCaption } from '../board';
import { DragTile, DropZone } from '../drag';
import { useEngineCore } from '../engine';
import { Burst } from '../fx';
import { useMeasure } from '../layout';
import { Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitText } from '../types';

export interface JigsawRevealProps extends EngineProps {
  /** The picture (art name). */
  art: string;
  rows: number;
  cols: number;
  /** `place` (default): drag pieces from a tray into the frame. `swap`: the frame is full; swap two pieces at a time. */
  mode?: 'place' | 'swap';
  /** Finished-picture reveal; `false` finishes right away. */
  reveal?: { title?: KitText; caption?: KitText } | false;
}

/** A piece of the picture: the art drawn at full size, clipped to one cell. */
function Piece({ art, index, cols, rows, w, h, scale = 1 }: { art: string; index: number; cols: number; rows: number; w: number; h: number; scale?: number }) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  return (
    <View style={{ width: w * scale, height: h * scale, overflow: 'hidden', borderRadius: 6 }}>
      <View style={{ position: 'absolute', left: -col * w * scale, top: -row * h * scale }}>
        <Art name={art} size={w * cols * scale} height={h * rows * scale} fit="cover" />
      </View>
    </View>
  );
}

/**
 * JigsawReveal – rebuild a picture from pieces (drag them into the frame, or swap misplaced pieces), then the whole
 * picture is revealed big with a caption.
 */
export function JigsawReveal(props: JigsawRevealProps) {
  const { art, rows, cols } = props;
  const swap = props.mode === 'swap';
  const count = rows * cols;
  const core = useEngineCore(props, count);
  const { env, k, reduced } = core;
  const order = useMemo(() => kitShuffle(Array.from({ length: count }, (_, i) => i), `${core.seed}:jigsaw`), [count, core.seed]);
  // place mode: cell → piece | null. swap mode: cell → piece (always full).
  const [cells, setCells] = useState<(number | null)[]>(() => (swap ? order : Array.from({ length: count }, () => null)));
  const [selected, setSelected] = useState<number | null>(null);
  const [nudge, setNudge] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const area = useMeasure();
  const testID = props.testID ?? 'jigsaw-reveal';
  const correct = cells.filter((p, i) => p === i).length;
  const complete = correct === count;

  useEffect(() => {
    core.progress(correct);
    if (!complete) return;
    core.right({ caption: env.kt('finish.done') });
    if (props.reveal === false) {
      core.finish();
      return;
    }
    const id = setTimeout(() => setRevealed(true), reduced ? 200 : 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct]);

  const place = (piece: number, cell: number): boolean => {
    if (core.finishedRef.current || cells[cell] !== null) return false;
    if (piece !== cell) {
      core.wrong(`piece-${piece}`);
      setNudge((n) => ({ ...n, [piece]: (n[piece] ?? 0) + 1 }));
      setSelected(null);
      return false;
    }
    setCells((c) => c.map((p, i) => (i === cell ? piece : p)));
    setSelected(null);
    core.touch();
    return true;
  };

  const swapCells = (a: number, b: number) => {
    if (core.finishedRef.current || a === b) return;
    const next = [...cells];
    [next[a], next[b]] = [next[b], next[a]];
    const gained = (next[a] === a ? 1 : 0) + (next[b] === b ? 1 : 0);
    if (gained === 0) core.wrong(`piece-${cells[a]}`, env.kt('fb.tryAgain'));
    else core.touch();
    setCells(next);
    setSelected(null);
  };

  const tapCell = (cell: number) => {
    if (swap) {
      if (cells[cell] === cell) return;
      if (selected === null) {
        setSelected(cell);
        core.touch();
      } else swapCells(selected, cell);
      return;
    }
    if (selected !== null) place(selected, cell);
  };

  useKitProbe({
    engine: 'JigsawReveal',
    testID,
    step: () => {
      if (core.finishedRef.current) return false;
      if (complete) {
        setRevealed(true);
        core.finish(0);
        return true;
      }
      const cell = cells.findIndex((p, i) => p !== i);
      if (swap) swapCells(cell, cells.indexOf(cell));
      else place(cell, cell);
      return true;
    },
    mistake: () => {
      const cell = cells.findIndex((p, i) => p !== i);
      if (cell < 0) return false;
      if (swap) {
        const other = cells.findIndex((p, i) => i !== cell && p !== i && p !== cell && cells[cell] !== i);
        if (other < 0) return false;
        swapCells(cell, other);
      } else {
        const wrongPiece = order.find((p) => p !== cell && !cells.includes(p));
        if (wrongPiece === undefined) return false;
        place(wrongPiece, cell);
      }
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const aspect = catalogue[art]?.aspect ?? 1;
  // Tray: up to 4 pieces at a time, all the same size (big enough to recognise and to grab).
  const traySide = area.w > 0 ? Math.max(60, Math.min(96, Math.floor((area.w - spacing.sm * 3) / 4) - 10)) : 72;
  const boardW = area.w > 0 ? Math.min(area.w - 8, Math.max(120, area.h - 8) * aspect) : 0;
  const boardH = boardW / aspect;
  const cellW = boardW / cols;
  const cellH = boardH / rows;
  const trayScale = Math.min(1, traySide / Math.max(cellW, cellH, 1));
  const tray = order.filter((p) => !cells.includes(p));
  const trayVisible = tray.slice(0, 4);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        {boardW > 0 ? (
          <View style={[styles.frame, { width: boardW + 8, height: boardH + 8, borderColor: k.accent, backgroundColor: k.slotFill }]}>
            {cells.map((piece, cell) => {
              const col = cell % cols;
              const row = Math.floor(cell / cols);
              const right = piece === cell;
              return (
                <View key={cell} style={{ position: 'absolute', left: col * cellW, top: row * cellH, width: cellW, height: cellH }}>
                  <DropZone
                    id={`cell-${cell}`}
                    testID={`zone-cell-${cell}`}
                    accessibilityLabel={env.kt('jigsaw.cell', { number: cell + 1 })}
                    onPress={() => tapCell(cell)}
                    disabled={!swap && piece !== null}
                    style={[styles.cell, { borderColor: selected === cell && swap ? k.gold : right && swap ? 'transparent' : k.slotBorder, borderWidth: piece === null || swap ? 1 : 0 }]}
                    hoverStyle={{ borderRadius: 6, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
                  >
                    {piece !== null ? (
                      <Animated.View entering={reduced || swap ? undefined : ZoomIn.springify().damping(13)}>
                        <Piece art={art} index={piece} cols={cols} rows={rows} w={cellW - (swap ? 2 : 0)} h={cellH - (swap ? 2 : 0)} />
                        {right && !swap ? <Burst trigger={1} distance={cellW * 0.5} size={10} /> : null}
                      </Animated.View>
                    ) : null}
                  </DropZone>
                </View>
              );
            })}
            {core.hintsOn && core.idle && !complete && tray.length > 0 ? (
              <HintPointer from={{ x: boardW / 2, y: boardH + 60 }} to={{ x: 4 + (tray[0] % cols) * cellW + cellW / 2, y: 4 + Math.floor(tray[0] / cols) * cellH + cellH / 2 }} />
            ) : null}
          </View>
        ) : null}
      </View>
      <InlineCaption text={selected !== null && !swap ? env.kt('fb.selected', { label: env.kt('jigsaw.piece', { number: selected + 1 }) }) : core.caption?.text} tone={selected !== null && !swap ? 'hint' : core.caption?.tone} />
      {!swap ? (
        <Tray label={env.kt('tray')} style={[styles.tray, { minHeight: traySide + 14 }]}>
          {trayVisible.map((p) => (
            <Animated.View key={p} entering={FadeIn.duration(200)} layout={reduced ? undefined : LinearTransition.duration(220)}>
              <DragTile
                id={`piece-${p}`}
                selected={selected === p}
                nudge={nudge[p] ?? 0}
                accessibilityLabel={env.kt('jigsaw.piece', { number: p + 1 })}
                onLift={() => {
                  setSelected(null);
                  core.touch();
                }}
                onPress={() => {
                  setSelected((s) => (s === p ? null : p));
                  core.touch();
                }}
                onDrop={(zone) => (zone.startsWith('cell-') ? place(p, Number(zone.slice(5))) : false)}
                liftScale={1 / Math.max(0.3, trayScale) > 1.6 ? 1.6 : 1 / Math.max(0.3, trayScale)}
              >
                <View style={[styles.trayPiece, { borderColor: selected === p ? k.gold : k.tileEdge, backgroundColor: k.tileFace }]}>
                  {boardW > 0 ? <Piece art={art} index={p} cols={cols} rows={rows} w={cellW} h={cellH} scale={trayScale} /> : null}
                </View>
              </DragTile>
            </Animated.View>
          ))}
        </Tray>
      ) : null}
      <FinishReveal
        visible={revealed}
        art={art}
        title={props.reveal && props.reveal.title ? env.text(props.reveal.title) : env.kt('finish.done')}
        caption={props.reveal && props.reveal.caption ? env.text(props.reveal.caption) : undefined}
        onContinue={() => core.finish(0)}
        artSize={Math.min(area.w, 240)}
      />
      {/* Screen readers in swap mode: every cell is a button; the selected one is announced via the caption. */}
      {swap && selected !== null ? <Pressable accessibilityRole="button" accessibilityLabel={env.kt('a11y.selected', { label: env.kt('jigsaw.piece', { number: selected + 1 }) })} onPress={() => setSelected(null)} style={styles.srOnly} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  frame: { borderRadius: radius.md, borderWidth: 4 },
  cell: { flex: 1, borderStyle: 'dashed', borderRadius: 4, overflow: 'hidden' },
  tray: { alignItems: 'center' },
  trayPiece: { padding: 3, borderRadius: 9, borderWidth: 2, borderBottomWidth: 5 },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});

import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Art, catalogue, hasArt } from '../../../art';
import { radius, spacing } from '../../../theme';
import { ChallengeClock, FinishReveal, HintPointer, InlineCaption } from '../board';
import { DragTile } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, GrowIn } from '../fx';
import { FaceView, faceLabel, Slot, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { useMeasure } from '../layout';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitBox, KitItem, KitText } from '../types';

export interface BuildPart extends KitItem {
  /** Where the part sits in the scene (fractions 0..1 of the scene). */
  slot: KitBox;
  /** Art drawn in the scene when built (default: the tile's `art`). */
  sceneArt?: string;
  /** Short inline caption shown when this part is placed (what it is / why). */
  caption?: KitText;
}

export interface BuildSceneProps extends EngineProps {
  /** Background art of the scene (drawn with `fit="cover"`), e.g. `scene.desert`. */
  scene?: string;
  /** Width / height of the scene (default: the background art's aspect, else 4:3). */
  aspect?: number;
  /** Parts in building order. */
  parts: BuildPart[];
  /** Parts must be built in the given order (the next place glows); default false. */
  ordered?: boolean;
  /** Faint silhouettes show where each part goes (default true; turn off for harder levels). */
  ghosts?: boolean;
  /** Parts waiting in the tray at once (default 4). */
  visible?: number;
  /** Finished-picture reveal (title, caption); `false` skips it and finishes right away. */
  reveal?: { title?: KitText; caption?: KitText } | false;
  /** Extra layers drawn over the background and under the parts (e.g. ground, sky details). */
  backdrop?: ReactNode;
}

/**
 * BuildScene – drag parts onto their places in a scene; the scene grows continuously with every part (no pop-ups,
 * a short inline caption per part) and the finished picture is revealed big at the end.
 */
export function BuildScene(props: BuildSceneProps) {
  const { parts, ordered } = props;
  const core = useEngineCore(props, parts.length);
  const { env, k, reduced } = core;
  const ghosts = props.ghosts ?? true;
  const tray = useMemo(() => kitShuffle(parts, `${core.seed}:build`), [parts, core.seed]);
  const [built, setBuilt] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const area = useMeasure();
  const testID = props.testID ?? 'build-scene';
  const label = (p: KitItem) => faceLabel(p, env.text);
  const nextPart = parts.find((p) => !built.includes(p.id));
  const allBuilt = built.length === parts.length;

  const place = (partId: string, slotPartId: string): boolean => {
    if (core.finishedRef.current || built.includes(slotPartId)) return false;
    if (partId !== slotPartId || (ordered && nextPart && nextPart.id !== slotPartId)) {
      core.wrong(partId);
      setNudge((n) => ({ ...n, [partId]: (n[partId] ?? 0) + 1 }));
      setSelected(null);
      return false;
    }
    const next = [...built, partId];
    setBuilt(next);
    setSelected(null);
    core.progress(next.length);
    const part = parts.find((p) => p.id === partId)!;
    core.right({ caption: part.caption ? env.text(part.caption) : env.kt('build.built', { label: label(part) }), tone: part.caption ? 'fact' : 'right' });
    return true;
  };

  useEffect(() => {
    if (!allBuilt) return;
    if (props.reveal === false) {
      core.finish();
      return;
    }
    const id = setTimeout(() => setRevealed(true), reduced ? 200 : 750);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBuilt]);

  useKitProbe({
    engine: 'BuildScene',
    testID,
    step: () => {
      if (core.finishedRef.current) return false;
      if (allBuilt) {
        setRevealed(true);
        core.finish(0);
        return true;
      }
      const part = nextPart!;
      place(part.id, part.id);
      return true;
    },
    mistake: () => {
      const open = parts.filter((p) => !built.includes(p.id));
      if (open.length < 2) return false;
      place(open[1].id, open[0].id);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  // Scene size: fit the aspect into the measured area.
  const bgAspect = props.scene && catalogue[props.scene] ? catalogue[props.scene].aspect : 4 / 3;
  const aspect = props.aspect ?? bgAspect;
  const sceneW = area.w > 0 ? Math.min(area.w, area.h * aspect) : 0;
  const sceneH = sceneW / aspect;
  const onLayout = area.onLayout;
  const visible = tray.filter((p) => !built.includes(p.id)).slice(0, props.visible ?? 4);
  const remaining = parts.length - built.length;
  const hintPart = ordered ? nextPart : visible[0];

  const sceneLayers = (w: number, h: number, interactive: boolean) => (
    <View style={{ width: w, height: h, borderRadius: radius.lg, overflow: 'hidden' }}>
      {props.scene && hasArt(props.scene) ? (
        <Art name={props.scene} size={w} height={h} fit="cover" />
      ) : (
        <LinearGradient colors={[k.accentSoft, k.board[1]]} style={StyleSheet.absoluteFill} />
      )}
      {props.backdrop ? <View style={StyleSheet.absoluteFill}>{props.backdrop}</View> : null}
      {parts.map((part) => {
        const box = { left: part.slot.x * w, top: part.slot.y * h, width: part.slot.w * w, height: part.slot.h * h };
        const art = part.sceneArt ?? part.art;
        const isBuilt = built.includes(part.id);
        const artAspect = art && catalogue[art] ? catalogue[art].aspect : 1;
        const artW = Math.min(box.width, box.height * artAspect);
        if (isBuilt) {
          return (
            <View key={part.id} style={[styles.abs, box, styles.center]} pointerEvents="none" testID={interactive ? `built-${part.id}` : undefined}>
              {interactive ? (
                <GrowIn from={0.3}>{art ? <Art name={art} size={artW} /> : null}</GrowIn>
              ) : art ? (
                <Art name={art} size={artW} />
              ) : null}
              {interactive ? <Burst trigger={1} distance={Math.max(30, box.width * 0.6)} /> : null}
            </View>
          );
        }
        if (!interactive) return null;
        const isNext = ordered ? nextPart?.id === part.id : false;
        return (
          <View key={part.id} style={[styles.abs, box]}>
            <Slot
              id={`part-${part.id}`}
              testID={`zone-${part.id}`}
              state={isNext && core.hintsOn ? 'next' : 'empty'}
              radius={radius.sm}
              accessibilityLabel={env.kt('build.slot', { label: label(part) })}
              onPress={selected ? () => place(selected, part.id) : undefined}
              style={[styles.sceneSlot, { backgroundColor: k.slotGlass }]}
            >
              {ghosts && art ? (
                <View style={{ opacity: 0.28 }} importantForAccessibility="no-hide-descendants">
                  <Art name={art} size={artW * 0.92} />
                </View>
              ) : null}
            </Slot>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.sceneArea} onLayout={onLayout}>
        {sceneW > 0 ? (
          <View style={[styles.sceneFrame, { borderColor: k.boardBorder, shadowColor: k.shadow }]}>
            {sceneLayers(sceneW, sceneH, true)}
          </View>
        ) : null}
        {core.hintsOn && core.idle && !selected && hintPart && sceneW > 0 ? (
          <HintPointer
            from={{ x: area.w / 2, y: area.h + 60 }}
            to={{ x: (area.w - sceneW) / 2 + (hintPart.slot.x + hintPart.slot.w / 2) * sceneW, y: (area.h - sceneH) / 2 + (hintPart.slot.y + hintPart.slot.h / 2) * sceneH }}
          />
        ) : null}
      </View>
      <InlineCaption text={selected ? env.kt('fb.selected', { label: label(parts.find((p) => p.id === selected)!) }) : core.caption?.text} tone={selected ? 'hint' : core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.tray}>
        {visible.map((part) => (
          <Animated.View key={part.id} entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(14)} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
            <DragTile
              id={part.id}
              selected={selected === part.id}
              nudge={nudge[part.id] ?? 0}
              accessibilityLabel={env.kt('a11y.tile', { label: label(part) })}
              onLift={() => {
                setSelected(null);
                core.touch();
              }}
              onPress={() => {
                setSelected((s) => (s === part.id ? null : part.id));
                core.touch();
              }}
              onDrop={(zone) => (zone.startsWith('part-') ? place(part.id, zone.slice(5)) : false)}
            >
              <Tile state={selected === part.id ? 'selected' : 'idle'} width={76} minHeight={76} padding={4}>
                <FaceView face={part} artSize={44} variant="tiny" numberOfLines={2} />
              </Tile>
            </DragTile>
          </Animated.View>
        ))}
        {remaining > visible.length ? (
          <View style={[styles.more, { borderColor: k.slotBorder }]}>
            <FaceView face={{ label: `+${remaining - visible.length}` }} color={k.textMuted} />
          </View>
        ) : null}
      </Tray>
      <FinishReveal
        visible={revealed}
        title={props.reveal && props.reveal.title ? env.text(props.reveal.title) : env.kt('finish.done')}
        caption={props.reveal && props.reveal.caption ? env.text(props.reveal.caption) : undefined}
        onContinue={() => core.finish(0)}
      >
        {sceneW > 0 ? sceneLayers(Math.min(area.w, sceneW * 1.0), Math.min(area.w, sceneW) / aspect, false) : null}
      </FinishReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  sceneArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  sceneFrame: { borderRadius: radius.lg + 2, borderWidth: 2, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'flex-end' },
  sceneSlot: { flex: 1, minHeight: 0, minWidth: 0, borderWidth: 2 },
  tray: { minHeight: 84 },
  more: { width: 56, minHeight: 76, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
});

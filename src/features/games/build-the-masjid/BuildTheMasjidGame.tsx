import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import type { GameApi } from '@/core/games';
import type { SourceRef } from '@/core/models';
import { makeStyles, radius, shadows, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { MOSQUE_DATE, QIBLA_CHANGE, QIBLA_DATE, sourceRefs } from './content';
import { Draggable } from './Draggable';
import {
  checkPlacement,
  checkQibla,
  JERUSALEM_BEARING,
  KAABA_BEARING,
  masjidResult,
  nextPart,
  normalize,
  PARTS,
  type PartId,
  type PlacementResult,
  SITE,
  slotCentre,
} from './logic';
import { PartIcon } from './PartIcon';
import { QiblaDial } from './QiblaDial';
import { Burst, FadeUp, type MasjidTime, Scene } from './Scene';

export interface MasjidConfig {
  /** The parts of the main build, in their reference order (the guided order of level 1). */
  parts: PartId[];
  /** Level 1: the next part glows in the tray and its place glows on the site. */
  guided: boolean;
  /** Light of the scene. */
  time: MasjidTime;
  /** Level 3: after the main build the qibla changes – turn it, then build these parts. */
  afterQibla?: PartId[];
}

type Phase = 'build' | 'turn' | 'after' | 'reveal';

/** What the inline caption under the scene explains. */
type Info = { key: number; title: string; text: string; sources: SourceRef[]; part: PartId | null; note?: string };

const GAP = spacing.sm;
const CAPTION_MIN = 104;
const TURN_STEP = 15;

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  captionTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.track },
  dotDone: { backgroundColor: c.gold },
  info: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  infoIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  card: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 2,
    ...shadows(c.shadow).raised,
  },
  cardGlow: { borderColor: c.gold, backgroundColor: c.goldSoft },
  turnRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  round: {
    width: TOUCH_TARGET + 4,
    height: TOUCH_TARGET + 4,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reveal: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: c.background },
  revealScroll: { alignItems: 'center', gap: spacing.md, paddingBottom: spacing.lg },
  revealArt: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.goldBorder, ...shadows(c.shadow).raised },
}));

const sourceLabel = (sources: SourceRef[]) => sources.map((s) => (s.sourceReference ? `${s.sourceName} ${s.sourceReference}` : s.sourceName)).join(' · ');

/**
 * Build the Masjid: build the early Masjid an-Nabawi part by part on one illustrated site – the place where the camel
 * knelt, mud-brick walls, palm-trunk pillars and the palm-leaf roof. Parts snap in with a short animation and an inline
 * caption; there is no dialog between parts. Level 3 adds the change of the qibla, the shade on the new qibla side and
 * the Suffa. The finished masjid is revealed as a large picture before the result.
 */
export function BuildTheMasjidGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<MasjidConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const afterParts = useMemo(() => config.afterQibla ?? [], [config.afterQibla]);
  const allParts = useMemo(() => [...config.parts, ...afterParts], [config.parts, afterParts]);
  const random = useMemo(() => seededRandom(hashString(`${gameId}:${level}`)), [gameId, level]);
  const mainTray = useMemo(() => (config.guided ? config.parts : shuffle(config.parts, random)), [config.guided, config.parts, random]);
  const afterTray = useMemo(() => shuffle(afterParts, random), [afterParts, random]);

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('build');
  const [placed, setPlaced] = useState<PartId[]>([]);
  const [info, setInfo] = useState<Info | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ key: number; x: number; y: number; part: PartId } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [withMistakes, setWithMistakes] = useState<PartId[]>([]);
  const [angle, setAngle] = useState(JERUSALEM_BEARING);
  const [qiblaMistakes, setQiblaMistakes] = useState(0);
  const [qiblaTurned, setQiblaTurned] = useState(false);
  const counter = useRef(0);
  // Mirrors of the state for callbacks that fire after an animation (a snapping card).
  const placedRef = useRef<PartId[]>([]);
  const phaseRef = useRef<Phase>('build');
  const finished = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const name = (id: PartId) => t(`part.${id}`);
  const tray = phase === 'after' ? afterTray : phase === 'build' ? mainTray : [];
  const guidedNext = config.guided && phase === 'build' ? nextPart(config.parts, placed) : null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 1 || Math.abs(size.h - height) > 1) setSize({ w: width, h: height });
  };

  // ---------- layout: scene on top, the caption, the tray (or the qibla controls) at the bottom ----------
  const w = size?.w ?? 320;
  const h = size?.h ?? 560;
  const slots = Math.max(config.parts.length, 1);
  const cardSize = Math.max(64, Math.min(88, (w - GAP * (slots - 1)) / slots));
  const trayH = cardSize + 6;
  const stageW = Math.min(w, ((h - trayH - CAPTION_MIN - GAP * 2) * SITE.w) / SITE.h);
  const scale = stageW / SITE.w;
  const stageH = SITE.h * scale;
  const stageX = (w - stageW) / 2;
  const captionY = stageH + GAP;
  const trayY = h - trayH;
  const captionH = trayY - GAP - captionY;
  const trayX = (n: number) => (w - (cardSize * n + GAP * (n - 1))) / 2;

  // ---------- building ----------

  const mistake = (id: PartId, text: string) => {
    setMistakes((m) => m + 1);
    setWithMistakes((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setHint(text);
    haptic('warning');
  };

  const explain = (id: PartId, res: PlacementResult) => {
    if (res.ok || res.reason === 'placed') return;
    if (res.reason === 'needs-first') mistake(id, t('play.needsFirst', { part: name(res.missing) }));
    else mistake(id, config.guided ? t('play.glowHint') : t('play.wrongSpot', { part: name(id) }));
  };

  const finish = (qiblaWrong: number) => {
    if (finished.current) return;
    finished.current = true;
    haptic('tap');
    onComplete(
      masjidResult({
        parts: allParts.length,
        partsWithMistakes: withMistakes.length,
        buildMistakes: mistakes,
        qiblaMistakes: config.afterQibla ? qiblaWrong : undefined,
      }),
    );
  };

  const place = (id: PartId) => {
    if (placedRef.current.includes(id)) return;
    const next = [...placedRef.current, id];
    placedRef.current = next;
    setPlaced(next);
    setHint(null);
    counter.current += 1;
    setInfo({ key: counter.current, title: name(id), text: t(`caption.${id}`), sources: PARTS[id].sources, part: id });
    const centre = slotCentre(id);
    setBurst({ key: counter.current, x: centre.x, y: centre.y, part: id });
    haptic('success');

    const mainDone = config.parts.every((p) => next.includes(p));
    if (phaseRef.current === 'build' && mainDone && config.afterQibla) {
      playSound('success');
      phaseRef.current = 'turn';
      setPhase('turn');
      return;
    }
    if (allParts.every((p) => next.includes(p))) {
      playSound('reward');
      phaseRef.current = 'reveal';
      if (reducedMotion) setPhase('reveal');
      else revealTimer.current = setTimeout(() => setPhase('reveal'), 900);
      return;
    }
    playSound('success');
  };

  // ---------- the qibla (level 3) ----------

  const turnTo = (next: number) => {
    setAngle(normalize(next));
    haptic('selection');
  };

  const face = () => {
    const result = checkQibla(angle);
    if (result === 'kaaba') {
      setAngle(KAABA_BEARING);
      setQiblaTurned(true);
      phaseRef.current = 'after';
      setPhase('after');
      setHint(null);
      counter.current += 1;
      setInfo({
        key: counter.current,
        title: t('play.qiblaDone'),
        text: l(QIBLA_CHANGE.text),
        sources: sourceRefs(QIBLA_CHANGE.sourceIds),
        part: null,
        note: l(QIBLA_DATE.label),
      });
      playSound('success');
      haptic('success');
      return;
    }
    if (result === 'jerusalem') {
      setHint(t('play.stillJerusalem'));
      return;
    }
    setQiblaMistakes((m) => m + 1);
    setHint(`${t('play.notYet')} ${t('play.hint')}`);
    haptic('warning');
  };

  // ---------- texts ----------

  const instruction =
    phase === 'turn'
      ? t('play.turn')
      : phase === 'after'
        ? t('play.after')
        : phase === 'reveal'
          ? t('play.complete')
          : guidedNext
            ? t('play.next', { part: name(guidedNext) })
            : t('play.memory');

  const dialSize = Math.min(104, stageH * 0.46);
  const showDial = config.afterQibla !== undefined && (phase === 'turn' || (phase === 'after' && qiblaTurned));

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size ? (
        <>
          <Scene
            x={stageX}
            y={0}
            width={stageW}
            height={stageH}
            time={config.time}
            placed={placed}
            glow={guidedNext}
            qibla={config.afterQibla && config.parts.every((p) => placed.includes(p)) ? (qiblaTurned ? 'south' : 'north') : null}
            burst={burst}
            reducedMotion={reducedMotion}
            label={t('a11y.site')}
          >
            {showDial ? (
              <QiblaDial
                x={stageW - dialSize - spacing.sm}
                y={spacing.sm}
                size={dialSize}
                angle={angle}
                showKaaba={qiblaTurned || qiblaMistakes >= 2}
                done={qiblaTurned}
                disabled={phase !== 'turn'}
                onDrag={(a) => setAngle(a)}
                reducedMotion={reducedMotion}
                t={t}
              />
            ) : null}
          </Scene>

          {/* inline caption: instruction, progress and what the last part was */}
          <View style={[styles.caption, { top: captionY, height: Math.max(CAPTION_MIN, captionH) }]} accessibilityLiveRegion="polite">
            <View style={styles.captionTop}>
              <View style={styles.dots} accessible accessibilityLabel={t('play.progress', { done: placed.length, total: allParts.length })}>
                {allParts.map((p, i) => (
                  <View key={p} style={[styles.dot, i < placed.length && styles.dotDone]} />
                ))}
              </View>
              <AppText variant="small" color={c.textMuted} style={{ flex: 1 }} numberOfLines={2}>
                {instruction}
              </AppText>
            </View>
            <ScrollView contentContainerStyle={{ gap: spacing.xs }} showsVerticalScrollIndicator={false}>
              {info ? (
                <Animated.View key={info.key} entering={reducedMotion ? FadeIn.duration(200) : FadeInDown.duration(320)} style={styles.info}>
                  <View style={styles.infoIcon}>{info.part ? <PartIcon id={info.part} size={38} /> : <Art name="object.kaaba-icon" size={30} />}</View>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{info.title}</AppText>
                    <AppText variant="small">{info.text}</AppText>
                    <AppText variant="tiny" color={c.textMuted}>
                      {info.note ? `${info.note} · ` : ''}
                      {sourceLabel(info.sources)}
                    </AppText>
                  </View>
                </Animated.View>
              ) : null}
              {hint ? (
                <Animated.View key={hint} entering={FadeIn.duration(200)}>
                  <AppText variant="small" color={c.goldText}>
                    {hint}
                  </AppText>
                </Animated.View>
              ) : null}
            </ScrollView>
          </View>

          {/* the tray of parts */}
          {tray.map((id, k) => {
            if (placed.includes(id)) return null;
            const x = trayX(tray.length) + k * (cardSize + GAP);
            const glow = id === guidedNext;
            return (
              <Draggable
                key={id}
                x={x}
                y={trayY}
                width={cardSize}
                height={cardSize}
                reducedMotion={reducedMotion}
                label={t('a11y.part', { part: name(id) })}
                onLift={() => haptic('selection')}
                onDrop={(cx, cy) => {
                  const point = { x: (cx - stageX) / scale, y: cy / scale };
                  const res = checkPlacement(id, placed, point);
                  if (!res.ok) {
                    explain(id, res);
                    return null;
                  }
                  const target = slotCentre(id);
                  return { x: stageX + target.x * scale - cardSize / 2, y: target.y * scale - cardSize / 2 };
                }}
                onSnapped={() => place(id)}
                onTap={() => {
                  const res = checkPlacement(id, placed, null);
                  if (res.ok) place(id);
                  else explain(id, res);
                }}
                style={[styles.card, glow && styles.cardGlow]}
              >
                <PartIcon id={id} size={Math.min(44, cardSize * 0.56)} />
                <AppText variant="tiny" align="center" numberOfLines={1}>
                  {t(`short.${id}`)}
                </AppText>
              </Draggable>
            );
          })}

          {/* level 3: turning the qibla */}
          {phase === 'turn' ? (
            <View style={[styles.turnRow, { top: trayY, height: trayH }]}>
              <Pressable accessibilityRole="button" accessibilityLabel={t('play.turnLeft')} onPress={() => turnTo(angle - TURN_STEP)} style={styles.round}>
                <Icon name="back" size={22} color={c.primaryText} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <FadeUp reducedMotion={reducedMotion}>
                  <Button label={t('play.face')} variant="primary" onPress={face} fullWidth />
                </FadeUp>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('play.turnRight')} onPress={() => turnTo(angle + TURN_STEP)} style={styles.round}>
                <Icon name="chevron" size={22} color={c.primaryText} />
              </Pressable>
            </View>
          ) : null}

          {/* the finished masjid */}
          {phase === 'reveal' ? (
            <Animated.View style={styles.reveal} entering={reducedMotion ? FadeIn.duration(250) : ZoomIn.duration(520)}>
              <ScrollView contentContainerStyle={styles.revealScroll}>
                <View style={[styles.revealArt, { width: w, height: (w * SITE.h) / SITE.w }]}>
                  <Art
                    name={config.afterQibla ? 'seerah.masjid-finished-qibla' : 'seerah.masjid-finished'}
                    size={w}
                    height={(w * SITE.h) / SITE.w}
                    label={t('a11y.reveal')}
                  />
                  <Burst x={w / 2} y={(w * SITE.h) / SITE.w / 2} colors={[c.goldSoft, c.gold, c.goldBorder, c.primaryBorder]} reducedMotion={reducedMotion} spread={w * 0.4} />
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <AppText variant="bodyBold" align="center">
                    {t('reveal.title')}
                  </AppText>
                  <AppText variant="small" color={c.textMuted} align="center">
                    {`${t('reveal.place')} · ${l((config.afterQibla ? QIBLA_DATE : MOSQUE_DATE).label)}`}
                  </AppText>
                </View>
                <Button label={t('reveal.finish')} variant="gold" iconRight="chevron" onPress={() => finish(qiblaMistakes)} />
              </ScrollView>
            </Animated.View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

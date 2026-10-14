import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { DifferenceNote } from '@/core/components/ui/SourceList';
import type { GameApi, GameResultInput } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import {
  challengeBonus,
  ChallengeClock,
  Draggable,
  moveItem,
  ProgressDots,
  ReorderList,
  Sparkles,
  useDropZones,
  useShake,
  useStopwatch,
  useZoneHover,
  type DropZones,
} from '../wudu-flow/kit';
import { PRAYER_ARABIC, PRAYER_BODY, PRAYER_HEADING, PRAYER_NAME, TIMES_DIFFERENCE_NOTE } from './content';
import {
  dayResult,
  isDayOrder,
  MAX_BLOCKS,
  mixedPrayers,
  PAR_MS,
  phaseAt,
  PRAYER_IDS,
  PRAYER_SKY,
  prayerAt,
  rakahFeedback,
  rakahResult,
  skyTilesOrder,
  sunResult,
  type PrayerId,
  type SkyConfig,
} from './logic';
import { SkyStage } from './SkyStage';

export type { SkyConfig } from './logic';

type Tone = 'info' | 'warn' | 'ok';

const useStyles = makeStyles((c) => ({
  scroll: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  instruction: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: spacing.md, gap: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepButton: {
    width: TOUCH_TARGET + 4,
    height: TOUCH_TARGET + 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  grow: { flex: 1 },
  body: { backgroundColor: c.successSoft, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  banner: { borderRadius: radius.lg, overflow: 'hidden', height: 96, justifyContent: 'flex-end' },
  bannerName: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 2, overflow: 'hidden' },
  bannerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.night, opacity: 0.6 },
  matRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  mat: {
    flex: 1,
    minHeight: MAX_BLOCKS * 36 + 48,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.primaryBorder,
    backgroundColor: c.surfaceAlt,
    padding: spacing.sm,
    justifyContent: 'flex-end',
    gap: 4,
  },
  matHover: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: radius.lg, borderWidth: 3, borderColor: c.primary },
  block: {
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: c.primarySoft,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  source: { width: 104, alignItems: 'center', gap: spacing.sm, zIndex: 5 },
  sourceBlock: {
    width: 96,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', zIndex: 5, minHeight: TOUCH_TARGET },
  chip: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { borderColor: c.gold, backgroundColor: c.goldSoft, borderWidth: 2.5 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  tile: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: c.border },
  tileDone: { borderColor: c.success },
  tileLabel: { position: 'absolute', left: 4, right: 4, bottom: 4, alignItems: 'center' },
  tileLabelPill: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1, overflow: 'hidden' },
  center: { alignItems: 'center', gap: spacing.sm },
  stretch: { alignSelf: 'stretch' },
}));

/** Prayer Sky: drag the sun to each prayer (L1), stack rak'ah blocks (L2), order the day and match skies (L3). */
export function PrayerSkyGame(api: GameApi<SkyConfig>) {
  if (api.config.mode === 'rakahs') return <RakahPlay {...api} />;
  if (api.config.mode === 'day') return <DayPlay {...api} />;
  return <SunPlay {...api} />;
}

function useFinish(api: GameApi<SkyConfig>) {
  const done = useRef(false);
  const watch = useStopwatch(api.challengeMode);
  const finish = useCallback(
    (make: (bonus?: { points: number; max: number }) => GameResultInput) => {
      if (done.current) return;
      done.current = true;
      const bonus = api.challengeMode ? { points: challengeBonus(watch.elapsed(), PAR_MS[api.config.mode]), max: 10 } : undefined;
      api.onComplete(make(bonus));
    },
    [api, watch],
  );
  return { finish, ms: watch.ms };
}

function Instruction({ title, message, tone = 'info' }: { title: string; message?: string; tone?: Tone }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.instruction}>
      <AppText variant="bodyBold" accessibilityRole="header">
        {title}
      </AppText>
      {message ? (
        <AppText variant="small" color={tone === 'warn' ? c.goldText : tone === 'ok' ? c.success : c.textMuted} accessibilityLiveRegion="polite">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

function BodyNote({ prayer, api }: { prayer: PrayerId; api: GameApi<SkyConfig> }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.body}>
      <Icon name="check" size={20} color={c.success} />
      <AppText variant="small" style={styles.grow}>
        {api.l(PRAYER_BODY[prayer])}
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Level 1: move the sun to each prayer's time

function SunPlay(api: GameApi<SkyConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, l, haptic, playSound, reducedMotion } = api;
  const [round, setRound] = useState(0);
  const [s, setS] = useState(0.3);
  const [wrong, setWrong] = useState<Partial<Record<PrayerId, number>>>({});
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: Tone } | null>(null);
  const [sparkle, setSparkle] = useState(0);
  const { style: shakeStyle, shake } = useShake(reducedMotion);
  const { finish, ms } = useFinish(api);
  const lastPhase = useRef(phaseAt(0.3));
  const prayer = PRAYER_IDS[round];
  const name = l(PRAYER_NAME[prayer]);
  const last = round === PRAYER_IDS.length - 1;

  const move = useCallback(
    (v: number) => {
      setS(v);
      const phase = phaseAt(v);
      if (phase !== lastPhase.current) {
        lastPhase.current = phase;
        haptic('selection');
      }
    },
    [haptic],
  );

  const confirm = () => {
    if (solved) return;
    if (prayerAt(s) === prayer) {
      haptic('success');
      playSound('success');
      setSolved(true);
      setSparkle((x) => x + 1);
      setMessage(null);
      return;
    }
    haptic('warning');
    playSound('failure');
    shake();
    setWrong((w) => ({ ...w, [prayer]: (w[prayer] ?? 0) + 1 }));
    setMessage({ text: t('play.lookAgain', { heading: l(PRAYER_HEADING[prayer]) }), tone: 'warn' });
  };

  const next = () => {
    setRound((r) => r + 1);
    setSolved(false);
    setMessage(null);
  };

  const caption = t(`phase.${phaseAt(s)}`);
  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={solved}>
      {api.challengeMode ? <ChallengeClock ms={ms} label={t('play.time')} /> : null}
      <ProgressDots total={PRAYER_IDS.length} done={round + (solved ? 1 : 0)} label={t('play.progress', { done: round + (solved ? 1 : 0), total: PRAYER_IDS.length })} />
      <Instruction title={t('play.moveSun', { prayer: name })} message={message?.text} tone={message?.tone} />
      <Animated.View style={shakeStyle}>
        <SkyStage value={s} onChange={move} caption={caption} label={t('play.sky', { phase: caption })} disabled={solved} reducedMotion={reducedMotion} />
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={220} />
        </View>
      </Animated.View>
      {solved ? (
        <>
          <BodyNote prayer={prayer} api={api} />
          {prayer === 'asr' || last ? <DifferenceNote note={TIMES_DIFFERENCE_NOTE} /> : null}
          {last ? (
            <Button label={t('play.finish')} icon="check" variant="gold" onPress={() => finish((bonus) => sunResult(wrong, bonus))} />
          ) : (
            <Button label={t('play.next')} iconRight="chevron" onPress={next} />
          )}
        </>
      ) : (
        <View style={styles.controls}>
          <Pressable style={styles.stepButton} onPress={() => move(Math.max(0, Math.round((s - 0.02) * 200) / 200))} accessibilityRole="button" accessibilityLabel={t('play.earlier')}>
            <Icon name="back" size={22} color={c.primaryText} />
          </Pressable>
          <View style={styles.grow}>
            <Button label={t('play.confirm', { prayer: name })} icon="sun" variant="gold" onPress={confirm} />
          </View>
          <Pressable style={styles.stepButton} onPress={() => move(Math.min(1, Math.round((s + 0.02) * 200) / 200))} accessibilityRole="button" accessibilityLabel={t('play.later')}>
            <Icon name="chevron" size={22} color={c.primaryText} />
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Level 2: stack the obligatory rak'ahs of each prayer

function RakahBlock({ n, reducedMotion, label }: { n: number; reducedMotion: boolean; label: string }) {
  const { c } = useTheme();
  const styles = useStyles();
  const scale = useSharedValue(reducedMotion ? 1 : 0.6);
  useEffect(() => {
    if (!reducedMotion) scale.set(withSpring(1, { damping: 10, stiffness: 220 }));
  }, [reducedMotion, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.block, style]} accessible accessibilityLabel={label}>
      <Art name={n % 2 === 0 ? 'pose.bowing' : 'pose.standing'} size={24} />
      <AppText variant="small" color={c.primaryText}>
        {label}
      </AppText>
    </Animated.View>
  );
}

function RakahPlay(api: GameApi<SkyConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, l, haptic, playSound, reducedMotion } = api;
  const [round, setRound] = useState(0);
  const [count, setCount] = useState(0);
  const [wrong, setWrong] = useState<Partial<Record<PrayerId, number>>>({});
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: Tone } | null>(null);
  const [sparkle, setSparkle] = useState(0);
  const { style: shakeStyle, shake } = useShake(reducedMotion);
  const zones = useDropZones();
  const hover = useZoneHover(zones, 0);
  const { finish, ms } = useFinish(api);
  const [bannerW, setBannerW] = useState(0);
  const prayer = PRAYER_IDS[round];
  const name = l(PRAYER_NAME[prayer]);
  const last = round === PRAYER_IDS.length - 1;

  const add = () => {
    if (solved || count >= MAX_BLOCKS) return false;
    haptic('tap');
    playSound('click');
    setCount((n) => n + 1);
    setMessage(null);
    return true;
  };
  const remove = () => {
    if (solved || count === 0) return;
    haptic('tap');
    setCount((n) => n - 1);
    setMessage(null);
  };
  const check = () => {
    const feedback = rakahFeedback(prayer, count);
    if (feedback === 'right') {
      haptic('success');
      playSound('success');
      setSolved(true);
      setSparkle((x) => x + 1);
      setMessage(null);
      return;
    }
    haptic('warning');
    playSound('failure');
    shake();
    setWrong((w) => ({ ...w, [prayer]: (w[prayer] ?? 0) + 1 }));
    setMessage({ text: t(feedback === 'more' ? 'play.more' : 'play.fewer', { prayer: name }), tone: 'warn' });
  };
  const next = () => {
    setRound((r) => r + 1);
    setCount(0);
    setSolved(false);
    setMessage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={solved}>
      {api.challengeMode ? <ChallengeClock ms={ms} label={t('play.time')} /> : null}
      <ProgressDots total={PRAYER_IDS.length} done={round + (solved ? 1 : 0)} label={t('play.progress', { done: round + (solved ? 1 : 0), total: PRAYER_IDS.length })} />
      <Instruction title={t('play.howMany', { prayer: name })} message={message?.text ?? (solved ? undefined : t('play.blockHint'))} tone={message?.tone} />
      <View style={styles.banner} onLayout={(e: LayoutChangeEvent) => setBannerW(e.nativeEvent.layout.width)}>
        {bannerW > 0 ? <Art name={PRAYER_SKY[prayer]} size={bannerW} height={96} fit="cover" style={{ position: 'absolute', top: 0, left: 0 }} label={t(`skyTile.${prayer}`)} /> : null}
        <View style={styles.bannerName}>
          <View style={styles.bannerBg} />
          <AppText variant="bodyBold" color={c.onNight}>
            {`${name} · ${PRAYER_ARABIC[prayer]}`}
          </AppText>
        </View>
      </View>
      <View style={styles.matRow}>
        <Animated.View style={[styles.grow, shakeStyle]}>
          <View ref={zones.ref(0)} collapsable={false} style={styles.mat} accessible accessibilityLabel={t('play.mat', { count })}>
            {Array.from({ length: count }, (_, i) => count - 1 - i).map((i) => (
              <RakahBlock key={`${round}-${i}`} n={i} reducedMotion={reducedMotion} label={t('play.rakah', { n: i + 1 })} />
            ))}
            <Art name="object.prayer-mat" size={44} style={{ alignSelf: 'center', transform: [{ rotate: '90deg' }] }} />
            <Animated.View pointerEvents="none" style={[styles.matHover, hover]} />
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={180} />
            </View>
          </View>
        </Animated.View>
        <View style={styles.source}>
          <Draggable
            zones={zones}
            onDrop={(zone) => (zone === 0 ? add() : false)}
            onPress={add}
            onPickUp={() => haptic('selection')}
            accessibilityLabel={t('play.block')}
            accessibilityHint={t('play.blockHint')}
            disabled={solved || count >= MAX_BLOCKS}
            reducedMotion={reducedMotion}
          >
            <View style={styles.sourceBlock}>
              <Art name="pose.standing" size={34} />
              <Icon name="plus" size={18} color={c.onPrimary} />
            </View>
          </Draggable>
          <Pressable
            style={styles.stepButton}
            onPress={remove}
            disabled={solved || count === 0}
            accessibilityRole="button"
            accessibilityLabel={t('play.remove')}
            accessibilityState={{ disabled: solved || count === 0 }}
          >
            <Icon name="minus" size={22} color={count === 0 ? c.textMuted : c.primaryText} />
          </Pressable>
          <AppText variant="title" color={c.primaryText} accessibilityElementsHidden importantForAccessibility="no">
            {count}
          </AppText>
        </View>
      </View>
      {solved ? (
        <>
          <BodyNote prayer={prayer} api={api} />
          {last ? (
            <Button label={t('play.finish')} icon="check" variant="gold" onPress={() => finish((bonus) => rakahResult(wrong, bonus))} />
          ) : (
            <Button label={t('play.next')} iconRight="chevron" onPress={next} />
          )}
        </>
      ) : (
        <Button label={t('play.checkCount')} icon="check" variant="gold" onPress={check} disabled={count === 0} />
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Level 3: order the five prayers, then match each to its sky

function DayPlay(api: GameApi<SkyConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, l, haptic, playSound, reducedMotion } = api;
  const [phase, setPhase] = useState<'order' | 'match' | 'end'>('order');
  const [order, setOrder] = useState<PrayerId[]>(() => mixedPrayers());
  const [failedChecks, setFailedChecks] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<string[]>([]);
  const [tiles] = useState<PrayerId[]>(() => skyTilesOrder());
  const [matched, setMatched] = useState<PrayerId[]>([]);
  const [selected, setSelected] = useState<PrayerId | null>(null);
  const [wrongMatches, setWrongMatches] = useState<Partial<Record<PrayerId, number>>>({});
  const [shakes, setShakes] = useState<Partial<Record<PrayerId, number>>>({});
  const [message, setMessage] = useState<{ text: string; tone: Tone } | null>(null);
  const [sparkle, setSparkle] = useState(0);
  const [tilesW, setTilesW] = useState(0);
  const { style: shakeStyle, shake } = useShake(reducedMotion);
  const zones = useDropZones();
  const { finish, ms } = useFinish(api);
  const total = PRAYER_IDS.length;

  const onMove = useCallback(
    (from: number, to: number) => {
      haptic('selection');
      setOrder((o) => moveItem(o, from, to));
    },
    [haptic],
  );

  const checkOrder = () => {
    if (isDayOrder(order)) {
      haptic('success');
      playSound('success');
      setSparkle((x) => x + 1);
      setPhase('match');
      setMessage({ text: t('play.ordered'), tone: 'ok' });
      return;
    }
    haptic('warning');
    playSound('failure');
    shake();
    setFailedChecks((f) => f + 1);
    const right = order.filter((p, i) => p === PRAYER_IDS[i]);
    setLastCorrect(order.flatMap((p, i) => (p === PRAYER_IDS[i] ? [`${p}@${i}`] : [])));
    setMessage({ text: t('play.inPlace', { count: right.length, total }), tone: 'warn' });
  };

  const match = (prayer: PrayerId, sky: PrayerId): boolean => {
    if (matched.includes(prayer) || matched.includes(sky)) return false;
    if (prayer === sky) {
      haptic('success');
      playSound('click');
      setSparkle((x) => x + 1);
      const next = [...matched, prayer];
      setMatched(next);
      setSelected(null);
      if (next.length === total) {
        playSound('success');
        setPhase('end');
        setMessage({ text: t('play.allMatched'), tone: 'ok' });
      } else {
        setMessage(null);
      }
      return true;
    }
    haptic('warning');
    playSound('failure');
    setWrongMatches((w) => ({ ...w, [prayer]: (w[prayer] ?? 0) + 1 }));
    setShakes((s) => ({ ...s, [prayer]: (s[prayer] ?? 0) + 1 }));
    setSelected(null);
    setMessage({ text: t('play.notThisSky'), tone: 'warn' });
    return false;
  };

  const cols = 3;
  const tileW = tilesW > 0 ? Math.floor((tilesW - spacing.sm * (cols - 1)) / cols) : 96;

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={phase === 'end'}>
      {api.challengeMode ? <ChallengeClock ms={ms} label={t('play.time')} /> : null}
      {phase === 'order' ? (
        <>
          <Instruction title={t('play.orderTitle')} message={message?.text ?? t('play.orderHint')} tone={message?.tone} />
          <Animated.View style={shakeStyle}>
            <ReorderList
              items={order}
              keyOf={(p) => p}
              onMove={onMove}
              reducedMotion={reducedMotion}
              rowHeight={58}
              gap={8}
              onPickUp={() => haptic('selection')}
              tone={(p, i) => (lastCorrect.includes(`${p}@${i}`) ? 'correct' : 'normal')}
              labelOf={(p, i) => t('play.position', { prayer: l(PRAYER_NAME[p]), n: i + 1, total })}
              moveUpLabel={(p) => t('play.moveUp', { prayer: l(PRAYER_NAME[p]) })}
              moveDownLabel={(p) => t('play.moveDown', { prayer: l(PRAYER_NAME[p]) })}
              renderItem={(p, i) => (
                <>
                  <AppText variant="small" color={c.textMuted}>
                    {i + 1}
                  </AppText>
                  <AppText variant="bodyBold" style={styles.grow}>
                    {l(PRAYER_NAME[p])}
                  </AppText>
                  <AppText variant="body" script="arabic" color={c.textMuted}>
                    {PRAYER_ARABIC[p]}
                  </AppText>
                </>
              )}
            />
          </Animated.View>
          <Button label={t('play.checkOrder')} icon="check" onPress={checkOrder} />
        </>
      ) : (
        <>
          <Instruction
            title={phase === 'end' ? t('play.allMatched') : t('play.matchTitle')}
            message={message?.text ?? (selected ? t('play.matchSelected', { prayer: l(PRAYER_NAME[selected]) }) : t('play.matchHint'))}
            tone={message?.tone}
          />
          {phase === 'match' ? (
            <View style={styles.chips}>
              {PRAYER_IDS.filter((p) => !matched.includes(p)).map((p) => (
                <PrayerChip
                  key={p}
                  prayer={p}
                  zones={zones}
                  tiles={tiles}
                  selected={selected === p}
                  shake={shakes[p] ?? 0}
                  onDrop={(zone) => (zone >= 0 ? match(p, tiles[zone]) : false)}
                  onPress={() => {
                    haptic('selection');
                    setSelected((s) => (s === p ? null : p));
                    setMessage(null);
                  }}
                  api={api}
                />
              ))}
            </View>
          ) : null}
          <View style={styles.tiles} onLayout={(e: LayoutChangeEvent) => setTilesW(e.nativeEvent.layout.width)}>
            {tiles.map((sky, i) => (
              <SkyTile
                key={sky}
                sky={sky}
                index={i}
                width={tileW}
                zones={zones}
                matched={matched.includes(sky)}
                onPress={() => (selected ? match(selected, sky) : setMessage({ text: t('play.matchHint'), tone: 'info' }))}
                api={api}
              />
            ))}
          </View>
          {phase === 'end' ? (
            <View style={styles.center}>
              <View style={styles.stretch}>
                <DifferenceNote note={TIMES_DIFFERENCE_NOTE} />
              </View>
              <Button label={t('play.finish')} icon="check" variant="gold" onPress={() => finish((bonus) => dayResult(failedChecks, wrongMatches, bonus))} />
            </View>
          ) : null}
        </>
      )}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}>
        <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={220} />
      </View>
    </ScrollView>
  );
}

function PrayerChip({
  prayer,
  zones,
  selected,
  shake: shakeCount,
  onDrop,
  onPress,
  api,
}: {
  prayer: PrayerId;
  zones: DropZones;
  tiles: PrayerId[];
  selected: boolean;
  shake: number;
  onDrop: (zone: number) => boolean;
  onPress: () => void;
  api: GameApi<SkyConfig>;
}) {
  const styles = useStyles();
  const { style, shake } = useShake(api.reducedMotion);
  useEffect(() => {
    if (shakeCount > 0) shake();
  }, [shakeCount, shake]);
  return (
    <Animated.View style={style}>
      <Draggable
        zones={zones}
        onDrop={onDrop}
        onPress={onPress}
        onPickUp={() => api.haptic('selection')}
        selected={selected}
        accessibilityLabel={api.l(PRAYER_NAME[prayer])}
        reducedMotion={api.reducedMotion}
      >
        <View style={[styles.chip, selected && styles.chipSelected]}>
          <AppText variant="bodyBold">{api.l(PRAYER_NAME[prayer])}</AppText>
        </View>
      </Draggable>
    </Animated.View>
  );
}

function SkyTile({
  sky,
  index,
  width,
  zones,
  matched,
  onPress,
  api,
}: {
  sky: PrayerId;
  index: number;
  width: number;
  zones: DropZones;
  matched: boolean;
  onPress: () => void;
  api: GameApi<SkyConfig>;
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const hover = useZoneHover(zones, index);
  const height = Math.round(width * 0.75);
  const skyName = api.t(`skyTile.${sky}`);
  return (
    <Pressable
      ref={zones.ref(index)}
      collapsable={false}
      onPress={onPress}
      disabled={matched}
      accessibilityRole="button"
      accessibilityLabel={matched ? api.t('skyTile.matched', { sky: skyName, prayer: api.l(PRAYER_NAME[sky]) }) : skyName}
      accessibilityState={{ disabled: matched }}
      style={[styles.tile, { width, height }, matched && styles.tileDone]}
    >
      <Art name={PRAYER_SKY[sky]} size={width} height={height} fit="cover" />
      {matched ? (
        <View style={styles.tileLabel}>
          <View style={styles.tileLabelPill}>
            <View style={[styles.bannerBg, { opacity: 0.7 }]} />
            <AppText variant="small" color={c.onNight}>
              {api.l(PRAYER_NAME[sky])}
            </AppText>
          </View>
        </View>
      ) : null}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.md, borderWidth: 3, borderColor: c.gold }, hover]} />
    </Pressable>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { DifferenceNote } from '@/core/components/ui/SourceList';
import type { GameApi, GameResultInput } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { BASKET_TEXT, STEP_TEXT, WUDU_DIFFERENCE_NOTE } from './content';
import {
  Draggable,
  HintGlow,
  ProgressDots,
  ReorderList,
  Ripple,
  Sparkles,
  challengeBonus,
  ChallengeClock,
  moveItem,
  useDropZones,
  useShake,
  useStopwatch,
  useZoneHover,
  type DropZones,
} from './kit';
import {
  boardOrder,
  fullResult,
  guidedResult,
  isNextStep,
  isRightBasket,
  misplaced,
  PAR_MS,
  repairResult,
  scrambled,
  stepsFor,
  WUDU_STEPS,
  type WuduConfig,
  type WuduSource,
  type WuduStep,
  type WuduStepId,
} from './logic';

export type { WuduConfig } from './logic';

const useStyles = makeStyles((c) => ({
  scroll: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: spacing.md,
  },
  instructionText: { flex: 1, gap: 2 },
  board: { flex: 1, minHeight: 220, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' },
  tile: { borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  tileDone: { backgroundColor: c.infoSoft, borderColor: c.info },
  tileHover: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: radius.lg, borderWidth: 3, borderColor: c.primary },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dropArea: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xs, zIndex: 5 },
  drop: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: c.infoSoft, borderWidth: 2, borderColor: c.info },
  tray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, zIndex: 5, minHeight: 90 },
  card: {
    width: 96,
    minHeight: 96,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 2,
  },
  cardSelected: { borderColor: c.gold, backgroundColor: c.goldSoft, borderWidth: 2.5 },
  baskets: { flexDirection: 'row', gap: spacing.md },
  basket: {
    flex: 1,
    minHeight: 150,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.goldBorder,
    backgroundColor: c.goldSoft,
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  basketSunnah: { borderColor: c.primaryBorder, backgroundColor: c.primarySoft },
  basketItems: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  stripItem: { alignItems: 'center', width: 52 },
  rowArt: { width: 44, alignItems: 'center' },
  center: { alignItems: 'center', gap: spacing.sm },
  minTouch: { minHeight: TOUCH_TARGET },
}));

/** Wudu Flow: water to the body pictograms in order (L1/L2), sort into baskets (L2), repair a mixed sequence (L3). */
export function WuduFlowGame(api: GameApi<WuduConfig>) {
  if (api.config.mode === 'repair') return <RepairPlay {...api} />;
  return <SequencePlay {...api} />;
}

/** Calls onComplete once per play. */
function useFinish(api: GameApi<WuduConfig>) {
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

function Instruction({ art, title, message, tone }: { art: string; title: string; message?: string; tone?: 'info' | 'warn' | 'ok' }) {
  const { c } = useTheme();
  const styles = useStyles();
  const color = tone === 'warn' ? c.goldText : tone === 'ok' ? c.success : c.textMuted;
  return (
    <View style={styles.instruction}>
      <Art name={art} size={48} />
      <View style={styles.instructionText}>
        <AppText variant="bodyBold" accessibilityRole="header">
          {title}
        </AppText>
        {message ? (
          <AppText variant="small" color={color} accessibilityLiveRegion="polite">
            {message}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function WuduStrip({ steps, api }: { steps: readonly WuduStep[]; api: GameApi<WuduConfig> }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.strip} accessible accessibilityLabel={steps.map((s) => api.l(STEP_TEXT[s.id])).join(', ')}>
      {steps.map((s, i) => (
        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={styles.stripItem}>
            <Art name={s.art} size={44} />
            <AppText variant="tiny" color={c.textMuted}>
              {i + 1}
            </AppText>
          </View>
          {i < steps.length - 1 ? <Icon name="chevron" size={14} color={c.textMuted} /> : null}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Levels 1 + 2: pour water in order (then sort into baskets in level 2)

type Phase = 'sequence' | 'sort' | 'end';

function SequencePlay(api: GameApi<WuduConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, l, haptic, playSound, reducedMotion, config } = api;
  const sequence = stepsFor(config.mode);
  const [board] = useState(() => boardOrder(sequence));
  const [phase, setPhase] = useState<Phase>('sequence');
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongStepIds, setWrongStepIds] = useState<WuduStepId[]>([]);
  const [hint, setHint] = useState<WuduStepId | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'warn' | 'ok' } | null>(null);
  const [ripples, setRipples] = useState<Partial<Record<WuduStepId, number>>>({});
  const [shakes, setShakes] = useState<Partial<Record<WuduStepId, number>>>({});
  const [sparkle, setSparkle] = useState(0);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const zones = useDropZones();
  const { finish, ms } = useFinish(api);

  // Sorting (level 2)
  const [sortOrder] = useState(() => boardOrder(WUDU_STEPS));
  const [placed, setPlaced] = useState<Partial<Record<WuduStepId, WuduSource>>>({});
  const [selected, setSelected] = useState<WuduStepId | null>(null);
  const [sortMistakes, setSortMistakes] = useState(0);
  const basketZones = useDropZones();

  const total = sequence.length;
  const current = sequence[done];

  const pour = useCallback(
    (id: WuduStepId): boolean => {
      if (phase !== 'sequence' || !current) return false;
      if (sequence.slice(0, done).some((s) => s.id === id)) return false;
      if (isNextStep(sequence, done, id)) {
        haptic('success');
        playSound('click');
        setRipples((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
        setSparkle((s) => s + 1);
        setHint(null);
        const next = done + 1;
        setDone(next);
        if (next === total) {
          playSound('success');
          setMessage({ text: t('play.allDone'), tone: 'ok' });
          setPhase(config.mode === 'full' ? 'sort' : 'end');
        } else {
          setMessage({ text: t('play.nice', { step: l(STEP_TEXT[id]) }), tone: 'ok' });
        }
        return true;
      }
      haptic('warning');
      playSound('failure');
      setMistakes((m) => m + 1);
      setWrongStepIds((w) => (w.includes(current.id) ? w : [...w, current.id]));
      setShakes((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
      setHint(current.id);
      setMessage({ text: t('play.notYet'), tone: 'warn' });
      return false;
    },
    [phase, current, sequence, done, total, haptic, playSound, t, l, config.mode],
  );

  const place = useCallback(
    (id: WuduStepId, basket: WuduSource): boolean => {
      if (placed[id]) return false;
      if (isRightBasket(id, basket)) {
        haptic('success');
        playSound('click');
        setSparkle((s) => s + 1);
        const next = { ...placed, [id]: basket };
        setPlaced(next);
        setSelected(null);
        if (Object.keys(next).length === WUDU_STEPS.length) {
          playSound('success');
          setMessage({ text: t('play.sortDone'), tone: 'ok' });
          setPhase('end');
        } else {
          setMessage(null);
        }
        return true;
      }
      haptic('warning');
      playSound('failure');
      setSortMistakes((m) => m + 1);
      setShakes((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
      setSelected(null);
      setMessage({ text: t('play.otherBasket'), tone: 'warn' });
      return false;
    },
    [placed, haptic, playSound, t],
  );

  const complete = () =>
    finish((bonus) =>
      config.mode === 'full'
        ? fullResult({ mistakes, wrongSteps: wrongStepIds.length }, sortMistakes, bonus)
        : guidedResult({ mistakes, wrongSteps: wrongStepIds.length }, bonus),
    );

  const onBoardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - boardSize.w) > 1 || Math.abs(height - boardSize.h) > 1) setBoardSize({ w: width, h: height });
  };

  const cols = board.length <= 4 ? 2 : 3;
  const rows = Math.ceil(board.length / cols);
  const gap = spacing.md;
  const tileSize = Math.max(
    72,
    Math.floor(Math.min(boardSize.w > 0 ? (boardSize.w - gap * (cols - 1)) / cols : 110, boardSize.h > 0 ? (boardSize.h - gap * (rows - 1)) / rows : 110, 150)),
  );

  const title =
    phase === 'sequence' && current
      ? config.mode === 'guided'
        ? t('play.stepNamed', { n: done + 1, total, step: l(STEP_TEXT[current.id]) })
        : t('play.stepNext', { n: done + 1, total })
      : phase === 'sort'
        ? t('play.sortTitle')
        : t('play.allDone');

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={phase === 'end'}>
      {api.challengeMode ? <ChallengeClock ms={ms} label={t('play.time')} /> : null}
      <ProgressDots total={total} done={done} label={t('play.progress', { done, total })} />
      <Instruction
        art={phase === 'sort' ? 'object.basket' : 'body.water-on-hands'}
        title={title}
        message={message?.text ?? (phase === 'sequence' ? t('play.dragHint') : phase === 'sort' ? (selected ? t('play.selected', { step: l(STEP_TEXT[selected]) }) : t('play.sortHint')) : undefined)}
        tone={message?.tone ?? 'info'}
      />

      {phase === 'sequence' ? (
        <>
          <View style={[styles.board, { gap }]} onLayout={onBoardLayout}>
            {board.map((step, i) => {
              const order = sequence.slice(0, done).findIndex((s) => s.id === step.id);
              return (
                <BodyTile
                  key={step.id}
                  step={step}
                  index={i}
                  size={tileSize}
                  zones={zones}
                  doneNumber={order >= 0 ? order + 1 : null}
                  hint={hint === step.id}
                  ripple={ripples[step.id] ?? 0}
                  shake={shakes[step.id] ?? 0}
                  onPress={() => pour(step.id)}
                  api={api}
                />
              );
            })}
          </View>
          <View style={styles.dropArea}>
            <Draggable
              zones={zones}
              onDrop={(zone) => (zone >= 0 ? pour(board[zone].id) : false)}
              onPress={() => {
                haptic('tap');
                setMessage({ text: t('play.dropHint'), tone: 'info' });
              }}
              onPickUp={() => haptic('selection')}
              accessibilityLabel={t('play.drop')}
              accessibilityHint={t('play.dropHint')}
              reducedMotion={reducedMotion}
            >
              <View style={styles.drop}>
                <Art name="ui.water-drop" size={56} />
              </View>
            </Draggable>
          </View>
        </>
      ) : null}

      {phase === 'sort' ? (
        <>
          <View style={styles.tray}>
            {sortOrder
              .filter((s) => !placed[s.id])
              .map((step) => (
                <SortCard
                  key={step.id}
                  step={step}
                  zones={basketZones}
                  selected={selected === step.id}
                  shake={shakes[step.id] ?? 0}
                  onDrop={(zone) => (zone < 0 ? false : place(step.id, zone === 0 ? 'quran' : 'sunnah'))}
                  onPress={() => {
                    haptic('selection');
                    setSelected((s) => (s === step.id ? null : step.id));
                    setMessage(null);
                  }}
                  api={api}
                />
              ))}
          </View>
          <View style={styles.baskets}>
            {(['quran', 'sunnah'] as const).map((basket, i) => (
              <Basket
                key={basket}
                basket={basket}
                index={i}
                zones={basketZones}
                items={WUDU_STEPS.filter((s) => placed[s.id] === basket)}
                onPress={() => (selected ? place(selected, basket) : setMessage({ text: t('play.sortHint'), tone: 'info' }))}
                api={api}
              />
            ))}
          </View>
        </>
      ) : null}

      {phase === 'end' ? (
        <View style={styles.center}>
          <AppText variant="label" color={c.textMuted}>
            {t('play.yourWudu').toUpperCase()}
          </AppText>
          <WuduStrip steps={sequence} api={api} />
          {config.mode === 'full' ? (
            <View style={[styles.baskets, { alignSelf: 'stretch' }]}>
              {(['quran', 'sunnah'] as const).map((basket, i) => (
                <Basket key={basket} basket={basket} index={i} zones={basketZones} items={WUDU_STEPS.filter((s) => placed[s.id] === basket)} onPress={() => undefined} api={api} />
              ))}
            </View>
          ) : null}
          {config.mode === 'full' ? (
            <View style={{ alignSelf: 'stretch' }}>
              <DifferenceNote note={WUDU_DIFFERENCE_NOTE} />
            </View>
          ) : null}
          <Button label={t('play.finish')} icon="check" variant="gold" onPress={complete} />
        </View>
      ) : null}

      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260 }}>
        <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={200} />
      </View>
    </ScrollView>
  );
}

function BodyTile({
  step,
  index,
  size,
  zones,
  doneNumber,
  hint,
  ripple,
  shake: shakeCount,
  onPress,
  api,
}: {
  step: WuduStep;
  index: number;
  size: number;
  zones: DropZones;
  doneNumber: number | null;
  hint: boolean;
  ripple: number;
  shake: number;
  onPress: () => void;
  api: GameApi<WuduConfig>;
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const { style: shakeStyle, shake } = useShake(api.reducedMotion);
  const hover = useZoneHover(zones, index);
  useEffect(() => {
    if (shakeCount > 0) shake();
  }, [shakeCount, shake]);
  const label = doneNumber ? api.t('play.doneStep', { step: api.l(STEP_TEXT[step.id]), n: doneNumber }) : api.l(STEP_TEXT[step.id]);
  return (
    <Animated.View style={shakeStyle}>
      <HintGlow active={hint} reducedMotion={api.reducedMotion}>
        <Pressable
          ref={zones.ref(index)}
          collapsable={false}
          onPress={onPress}
          disabled={doneNumber !== null}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: doneNumber !== null }}
          style={[styles.tile, { width: size, height: size }, doneNumber !== null && styles.tileDone]}
        >
          <Art name={step.art} size={Math.round(size * 0.72)} />
          <Animated.View pointerEvents="none" style={[styles.tileHover, hover]} />
          <Ripple trigger={ripple} color={c.info} reducedMotion={api.reducedMotion} />
          {doneNumber !== null ? (
            <View style={styles.badge}>
              <AppText variant="tiny" color={c.onPrimary}>
                {doneNumber}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      </HintGlow>
    </Animated.View>
  );
}

function SortCard({
  step,
  zones,
  selected,
  shake: shakeCount,
  onDrop,
  onPress,
  api,
}: {
  step: WuduStep;
  zones: DropZones;
  selected: boolean;
  shake: number;
  onDrop: (zone: number) => boolean;
  onPress: () => void;
  api: GameApi<WuduConfig>;
}) {
  const styles = useStyles();
  const { style: shakeStyle, shake } = useShake(api.reducedMotion);
  useEffect(() => {
    if (shakeCount > 0) shake();
  }, [shakeCount, shake]);
  return (
    <Animated.View style={shakeStyle}>
      <Draggable
        zones={zones}
        onDrop={onDrop}
        onPress={onPress}
        onPickUp={() => api.haptic('selection')}
        selected={selected}
        accessibilityLabel={api.l(STEP_TEXT[step.id])}
        reducedMotion={api.reducedMotion}
      >
        <View style={[styles.card, selected && styles.cardSelected]}>
          <Art name={step.art} size={52} />
          <AppText variant="tiny" align="center" numberOfLines={2}>
            {api.l(STEP_TEXT[step.id])}
          </AppText>
        </View>
      </Draggable>
    </Animated.View>
  );
}

function Basket({
  basket,
  index,
  zones,
  items,
  onPress,
  api,
}: {
  basket: WuduSource;
  index: number;
  zones: DropZones;
  items: WuduStep[];
  onPress: () => void;
  api: GameApi<WuduConfig>;
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const hover = useZoneHover(zones, index);
  const name = api.l(BASKET_TEXT[basket]);
  return (
    <Pressable
      ref={zones.ref(index)}
      collapsable={false}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={api.t('play.basket', { name, count: items.length })}
      style={[styles.basket, basket === 'sunnah' && styles.basketSunnah]}
    >
      <Art name={basket === 'quran' ? 'object.book' : 'object.water-jug'} size={40} />
      <AppText variant="small" align="center" color={basket === 'quran' ? c.goldText : c.primaryText}>
        {name}
      </AppText>
      <View style={styles.basketItems}>
        {items.map((s) => (
          <Art key={s.id} name={s.art} size={30} />
        ))}
      </View>
      <Animated.View pointerEvents="none" style={[styles.tileHover, hover]} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Level 3: repair a mixed-up sequence

function RepairPlay(api: GameApi<WuduConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, l, haptic, playSound, reducedMotion } = api;
  const [order, setOrder] = useState<WuduStep[]>(() => scrambled(WUDU_STEPS));
  const [failedChecks, setFailedChecks] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'warn' | 'ok' } | null>(null);
  const [sparkle, setSparkle] = useState(0);
  const { style: shakeStyle, shake } = useShake(reducedMotion);
  const { finish, ms } = useFinish(api);
  const total = WUDU_STEPS.length;

  const onMove = useCallback(
    (from: number, to: number) => {
      haptic('selection');
      setOrder((o) => moveItem(o, from, to));
    },
    [haptic],
  );

  const check = () => {
    const wrong = misplaced(order.map((s) => s.id));
    if (wrong.length === 0) {
      haptic('success');
      playSound('success');
      setSolved(true);
      setSparkle((s) => s + 1);
      setMessage({ text: t('play.repaired'), tone: 'ok' });
      return;
    }
    haptic('warning');
    playSound('failure');
    shake();
    setFailedChecks((f) => f + 1);
    setLastCorrect(order.flatMap((s, i) => (wrong.includes(i) ? [] : [`${s.id}@${i}`])));
    setMessage({ text: t('play.inPlace', { count: total - wrong.length, total }), tone: 'warn' });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={solved}>
      {api.challengeMode ? <ChallengeClock ms={ms} label={t('play.time')} /> : null}
      <Instruction art="body.water-on-hands" title={t('play.repairTitle')} message={message?.text ?? t('play.repairHint')} tone={message?.tone ?? 'info'} />
      <Animated.View style={shakeStyle}>
        <ReorderList
          items={order}
          keyOf={(s) => s.id}
          onMove={onMove}
          disabled={solved}
          reducedMotion={reducedMotion}
          rowHeight={54}
          gap={6}
          onPickUp={() => haptic('selection')}
          tone={(s, i) => (solved || lastCorrect.includes(`${s.id}@${i}`) ? 'correct' : 'normal')}
          labelOf={(s, i) => t('play.position', { step: l(STEP_TEXT[s.id]), n: i + 1, total })}
          moveUpLabel={(s) => t('play.moveUp', { step: l(STEP_TEXT[s.id]) })}
          moveDownLabel={(s) => t('play.moveDown', { step: l(STEP_TEXT[s.id]) })}
          renderItem={(s, i) => (
            <>
              <AppText variant="small" color={c.textMuted}>
                {i + 1}
              </AppText>
              <View style={styles.rowArt}>
                <Art name={s.art} size={40} />
              </View>
              <AppText variant="small" style={{ flex: 1 }} numberOfLines={2}>
                {l(STEP_TEXT[s.id])}
              </AppText>
            </>
          )}
        />
      </Animated.View>
      {solved ? (
        <View style={styles.center}>
          <View style={{ alignSelf: 'stretch' }}>
            <DifferenceNote note={WUDU_DIFFERENCE_NOTE} />
          </View>
          <Button label={t('play.finish')} icon="check" variant="gold" onPress={() => finish((bonus) => repairResult(failedChecks, bonus))} />
        </View>
      ) : (
        <Button label={t('play.check')} icon="check" onPress={check} />
      )}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}>
        <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={220} />
      </View>
    </ScrollView>
  );
}

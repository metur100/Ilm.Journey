import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Art } from '@/core/art';
import { C } from '@/core/art/palette';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { BlockCard } from './BlockCard';
import { QIBLA_CHANGE, QIBLA_DATE, QIBLA_JERUSALEM } from './content';
import { Draggable } from './Draggable';
import type { MasjidConfig } from './BuildTheMasjidGame';
import { angleFromCenter, checkQibla, JERUSALEM_BEARING, KAABA_BEARING, masjidResult, nearestTurn, normalize } from './logic';

/** Dial units: 300 × 300, centre 150/150. Rows sit behind the centre, the arrow points from the centre. */
const DIAL = 300;
const ROW_OFFSETS = [-6, 22, 50];
const ROWS = ROW_OFFSETS.length;
const RING = 128;
const SPRING = { damping: 15, stiffness: 140 };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  board: { flex: 1 },
  layer: { position: 'absolute' },
  rowCard: { flex: 1, borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 2, borderColor: c.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  marker: { position: 'absolute', width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  feedback: { minHeight: 40 },
}));

/** A row of prayer mats (dial units, centred on x = 0). */
function MatRow({ y }: { y: number }) {
  return (
    <G>
      {[-33, -16, 1, 18].map((x) => (
        <G key={x}>
          <Rect x={150 + x} y={y - 9} width={15} height={18} rx={2} fill={C.teal} stroke={C.gold} strokeWidth={1.2} />
          <Path d={`M${150 + x + 4} ${y - 4}h7`} stroke={C.goldLight} strokeWidth={1.2} />
        </G>
      ))}
    </G>
  );
}

const polar = (bearingDeg: number, r: number) => {
  const a = (bearingDeg * Math.PI) / 180;
  return { x: 150 + r * Math.sin(a), y: 150 - r * Math.cos(a) };
};

/**
 * Level 3: on the ground plan of the masjid, lay out the prayer rows (they face Jerusalem, the first qibla), then turn
 * the qibla arrow towards the Kaʿbah – the rows turn with it (Quran 2:144, Sahih al-Bukhari 40).
 */
export function QiblaTurn({ onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<MasjidConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [step, setStep] = useState<'rows' | 'turn' | 'done'>('rows');
  const [placedRows, setPlacedRows] = useState<number[]>([]);
  const rows = placedRows.length;
  const [card, setCard] = useState<'jerusalem' | 'change' | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  /** Where the arrow points (degrees from north). */
  const [angle, setAngle] = useState(JERUSALEM_BEARING);
  const degrees = Math.round(angle);
  const rot = useSharedValue(JERUSALEM_BEARING);
  const finished = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 1 || Math.abs(size.h - height) > 1) setSize({ w: width, h: height });
  };

  const controlsH = 56;
  const dial = size ? Math.min(size.w, size.h - controlsH - 8) : DIAL;
  const k = dial / DIAL;
  const dialX = size ? (size.w - dial) / 2 : 0;
  const rowW = size ? Math.min(104, (size.w - 16) / 3) : 96;

  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  const setArrow = (next: number, animate: boolean) => {
    setAngle(normalize(next));
    const target = nearestTurn(rot.value, next);
    rot.value = animate && !reducedMotion ? withTiming(target, { duration: 180 }) : target;
  };

  // ---------- rows ----------

  const rowCenter = (i: number) => {
    const a = (JERUSALEM_BEARING * Math.PI) / 180;
    const oy = ROW_OFFSETS[i];
    return { x: dialX + (150 - oy * Math.sin(a)) * k, y: (150 + oy * Math.cos(a)) * k };
  };

  const placeRow = (index: number) => {
    if (placedRows.includes(index)) return;
    const next = [...placedRows, index];
    setPlacedRows(next);
    haptic('success');
    if (next.length === ROWS) {
      setCard('jerusalem');
      playSound('success');
    }
  };

  // ---------- turning ----------

  const evaluate = () => {
    const result = checkQibla(angle);
    if (result === 'kaaba') {
      rot.value = reducedMotion ? nearestTurn(rot.value, KAABA_BEARING) : withSpring(nearestTurn(rot.value, KAABA_BEARING), SPRING);
      setAngle(KAABA_BEARING);
      setStep('done');
      setMessage(t('play.qiblaDone'));
      setCard('change');
      playSound('reward');
      haptic('success');
      return;
    }
    if (result === 'jerusalem') {
      setMessage(t('play.stillJerusalem'));
      return;
    }
    setMistakes((m) => m + 1);
    setMessage(`${t('play.notYet')} ${t('play.hint')}`);
    haptic('warning');
  };

  const turning = step === 'turn' && card === null;
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(turning)
    .minDistance(2)
    .onUpdate((e) => setArrow(angleFromCenter(e.x - dial / 2, e.y - dial / 2), false))
    .onEnd(() => evaluate());

  const closeCard = () => {
    haptic('tap');
    if (card === 'jerusalem') {
      setCard(null);
      setStep('turn');
      setMessage(null);
      return;
    }
    setCard(null);
    if (!finished.current) {
      finished.current = true;
      onComplete(masjidResult({ parts: ROWS, partsWithMistakes: 0, buildMistakes: 0, qiblaMistakes: mistakes }));
    }
  };

  // The rows face the arrow; before the rows step ends the arrow rests on Jerusalem.
  useEffect(() => {
    if (step === 'rows') rot.value = JERUSALEM_BEARING;
  }, [rot, step]);

  const showKaaba = step === 'done' || mistakes >= 2;
  const jerusalem = polar(JERUSALEM_BEARING, RING);
  const kaaba = polar(KAABA_BEARING, RING);
  const instruction = step === 'rows' ? t('play.rows') : step === 'turn' ? t('play.turn') : t('play.qiblaDone');

  return (
    <View style={styles.root}>
      <View accessibilityLiveRegion="polite">
        <AppText variant="heading">{instruction}</AppText>
      </View>

      <View style={styles.board} onLayout={onLayout}>
        {size ? (
          <>
            <GestureDetector gesture={pan}>
              <View style={[styles.layer, { left: dialX, top: 0, width: dial, height: dial }]} accessible accessibilityRole="adjustable"
                accessibilityLabel={t('a11y.dial', { degrees })}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={(e) => {
                  if (!turning) return;
                  setArrow(angle + (e.nativeEvent.actionName === 'increment' ? 15 : -15), true);
                }}
              >
                <Svg width={dial} height={dial} viewBox={`0 0 ${DIAL} ${DIAL}`} style={StyleSheet.absoluteFill}>
                  <Circle cx={150} cy={150} r={146} fill={c.surface} stroke={c.border} strokeWidth={2} />
                  <Circle cx={150} cy={150} r={RING} fill="none" stroke={c.border} strokeWidth={1.5} strokeDasharray="3 5" />
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = polar(i * 30, 140);
                    const b = polar(i * 30, i % 3 === 0 ? 128 : 134);
                    return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.textMuted} strokeWidth={i % 3 === 0 ? 2 : 1} />;
                  })}
                  {(['n', 'e', 's', 'w'] as const).map((d, i) => {
                    const p = polar(i * 90, 112);
                    return (
                      <SvgText key={d} x={p.x} y={p.y + 5} fontSize={14} fontWeight="bold" textAnchor="middle" fill={d === 'n' ? c.primaryText : c.textMuted}>
                        {t(`compass.${d}`)}
                      </SvgText>
                    );
                  })}
                  <Rect x={98} y={84} width={104} height={132} rx={4} fill={C.sandLight} stroke={C.mud} strokeWidth={9} />
                  <Rect x={98} y={84} width={104} height={132} rx={4} fill="none" stroke={C.clay} strokeWidth={1.2} strokeDasharray="5 3" />
                  <SvgText x={150} y={232} fontSize={10} textAnchor="middle" fill={c.textMuted}>
                    {t('place.madinah')}
                  </SvgText>
                  <Circle cx={jerusalem.x} cy={jerusalem.y} r={7} fill={c.info} stroke={c.surface} strokeWidth={2} />
                  <SvgText x={jerusalem.x + 10} y={jerusalem.y - 8} fontSize={11} fontWeight="bold" fill={c.info}>
                    {t('place.jerusalem')}
                  </SvgText>
                  {showKaaba ? (
                    <SvgText x={kaaba.x + 18} y={kaaba.y + 4} fontSize={11} fontWeight="bold" fill={c.text} opacity={step === 'done' ? 1 : 0.55}>
                      {t('place.makkah')}
                    </SvgText>
                  ) : null}
                </Svg>

                <Animated.View style={[styles.layer, { left: 0, top: 0, width: dial, height: dial }, rotStyle]} pointerEvents="none">
                  <Svg width={dial} height={dial} viewBox={`0 0 ${DIAL} ${DIAL}`}>
                    {ROW_OFFSETS.slice(0, rows).map((y) => (
                      <MatRow key={y} y={150 + y} />
                    ))}
                    {step !== 'rows' || rows === ROWS ? (
                      <G>
                        <Rect x={146} y={64} width={8} height={86} rx={4} fill={c.primary} />
                        <Path d="M150 36 168 70H132Z" fill={c.primary} stroke={c.primaryText} strokeWidth={2} strokeLinejoin="round" />
                        <Circle cx={150} cy={150} r={9} fill={c.gold} stroke={c.goldText} strokeWidth={2} />
                      </G>
                    ) : null}
                  </Svg>
                </Animated.View>

                {showKaaba ? (
                  <Animated.View
                    entering={reducedMotion ? undefined : ZoomIn.springify()}
                    style={[styles.marker, { left: kaaba.x * k - 17, top: kaaba.y * k - 17, opacity: step === 'done' ? 1 : 0.5 }]}
                    pointerEvents="none"
                  >
                    <Art name="object.kaaba-icon" size={30} />
                  </Animated.View>
                ) : null}
              </View>
            </GestureDetector>

            {step === 'rows'
              ? ROW_OFFSETS.map((_, i) => {
                  if (placedRows.includes(i)) return null;
                  const x = (size.w - (rowW * 3 + 16)) / 2 + i * (rowW + 8);
                  return (
                    <Draggable
                      key={`row-${i}`}
                      x={x}
                      y={dial + 8}
                      width={rowW}
                      height={controlsH - 4}
                      reducedMotion={reducedMotion}
                      disabled={card !== null}
                      label={t('a11y.row', { number: i + 1 })}
                      onLift={() => haptic('selection')}
                      onDrop={(cx, cy) => {
                        const dx = (cx - dialX) / k - 150;
                        const dy = cy / k - 150;
                        if (Math.hypot(dx, dy) > 80) return null;
                        const p = rowCenter(rows);
                        return { x: p.x - rowW / 2, y: p.y - (controlsH - 4) / 2 };
                      }}
                      onSnapped={() => placeRow(i)}
                      onTap={() => placeRow(i)}
                      style={styles.rowCard}
                    >
                      <Svg width={rowW - 12} height={26} viewBox="110 136 80 28">
                        <MatRow y={150} />
                      </Svg>
                      <AppText variant="tiny">{t('play.row', { number: i + 1 })}</AppText>
                    </Draggable>
                  );
                })
              : null}

            {step === 'turn' ? (
              <View style={[styles.controls, { top: dial + 8 }]}>
                <Button label={t('play.turnLeft')} icon="back" variant="secondary" size="md" disabled={!turning} onPress={() => setArrow(angle - 15, true)} />
                <Button label={t('play.face')} variant="primary" size="md" disabled={!turning} onPress={evaluate} />
                <Button label={t('play.turnRight')} iconRight="chevron" variant="secondary" size="md" disabled={!turning} onPress={() => setArrow(angle + 15, true)} />
              </View>
            ) : null}
          </>
        ) : null}

        {card && size ? (
          <Animated.View style={styles.overlay} entering={reducedMotion ? undefined : FadeInDown.duration(280)}>
            <BlockCard
              eyebrow={card === 'jerusalem' ? t('play.rowsDone') : t('play.qiblaTitle')}
              title={card === 'jerusalem' ? t('place.jerusalem') : t('play.qiblaDone')}
              art={card === 'jerusalem' ? 'object.prayer-mat' : 'object.kaaba-icon'}
              block={card === 'jerusalem' ? QIBLA_JERUSALEM : QIBLA_CHANGE}
              date={card === 'jerusalem' ? null : QIBLA_DATE}
              maxHeight={size.h * 0.85}
              onContinue={closeCard}
              t={t}
              l={l}
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.feedback} accessibilityLiveRegion="polite">
        {message ? (
          <AppText variant="small" color={step === 'done' ? c.success : c.goldText}>
            {message}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

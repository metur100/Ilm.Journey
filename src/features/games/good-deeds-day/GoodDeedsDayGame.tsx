import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { Avatar } from '@/core/components/character/Avatar';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { DifferenceNote, SourceList } from '@/core/components/ui/SourceList';
import type { GameApi } from '@/core/games';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, shadows, spacing, useTheme } from '@/core/theme';

import { DAYS, type DayId, FASTING_NOTE, GOOD_DEEDS, type GoodDeedId, type Scene, type Step, WHO_FASTS, WHO_FASTS_SOURCES } from './content';
import { Draggable } from './Draggable';
import { advance, answerChoice, dayResult, deedsDone, isSunset, NEW_SCENE, type SceneState, stepDone, sunAt, sunProgress, toggleDeed } from './logic';

export interface DeedsConfig {
  day: DayId;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  dotNow: { backgroundColor: c.gold },
  flex: { flex: 1 },
  stage: { borderRadius: radius.lg, overflow: 'hidden', alignSelf: 'center' },
  abs: { position: 'absolute' },
  sun: { position: 'absolute', backgroundColor: c.gold, borderWidth: 4, borderColor: c.goldBorder },
  badge: { position: 'absolute', minWidth: 26, height: 26, borderRadius: 13, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  controls: { gap: spacing.sm, paddingBottom: spacing.sm },
  option: { borderRadius: radius.md, borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, padding: spacing.md, minHeight: 48, justifyContent: 'center' },
  optionTried: { opacity: 0.55, borderColor: c.goldBorder, backgroundColor: c.goldSoft },
  framing: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: spacing.md, gap: spacing.sm },
  deed: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  deedOn: { backgroundColor: c.successSoft, borderColor: c.success },
  garden: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 52, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: c.successSoft },
  plot: { width: 40, height: 46, alignItems: 'center', justifyContent: 'flex-end' },
  soil: { width: 30, height: 8, borderRadius: 4, backgroundColor: c.goldBorder },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  card: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.goldBorder, ...shadows(c.shadow).raised },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  cardFoot: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
}));

const itemName = (art: string) => `item.${art.split('.')[1]}`;

/**
 * A Day of Good Deeds: an illustrated day (dawn → night) in small scenes. The learner drags, taps or chooses; each good
 * deed plants something in the garden strip. Level 3 is a Ramadan day (suhoor, the fast, iftar at sunset, the night
 * prayer and the good-deed tracker). Only the learner's own hero is drawn. No judging: other choices simply show the
 * content's gentle feedback and the learner tries again.
 */
export function GoodDeedsDayGame({ config, onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<DeedsConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const character = useAppStore((s) => s.profile.character);
  const scenes = DAYS[config.day];
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<SceneState>(NEW_SCENE);
  const [delivered, setDelivered] = useState<number[]>([]);
  const [tried, setTried] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [retried, setRetried] = useState<string[]>([]);
  const [planted, setPlanted] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);
  const [sunT, setSunT] = useState(0);
  const [ticked, setTicked] = useState<GoodDeedId[]>([]);
  const [finished, setFinished] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [rootH, setRootH] = useState(600);

  const scene: Scene = scenes[index];
  const step: Step | undefined = scene.steps[state.step];
  const title = t(`scene.${scene.id}`);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (width === null || Math.abs(width - w) > 1) setWidth(w);
    if (Math.abs(rootH - h) > 1) setRootH(h);
  };

  // ---------- flow ----------

  const completeScene = () => {
    setPlanted(index + 1);
    setCardOpen(true);
    playSound(index === scenes.length - 1 ? 'reward' : 'success');
    haptic('success');
  };

  const nextStep = (from: SceneState) => {
    const next = advance(scene, from);
    setDelivered([]);
    setTried([]);
    if (!next) {
      setState(from);
      completeScene();
      return;
    }
    setState(next);
    if (scene.steps[next.step]?.kind === 'tracker') setTicked(deedsDone(scenes, index + 1));
  };

  const closeCard = () => {
    haptic('tap');
    setCardOpen(false);
    setFeedback(null);
    if (index === scenes.length - 1) {
      if (!finished) {
        setFinished(true);
        onComplete(dayResult(scenes, retried));
      }
      return;
    }
    setIndex(index + 1);
    setState(NEW_SCENE);
    setSunT(0);
  };

  const choose = (i: number) => {
    if (step?.kind !== 'choice' || tried.includes(i)) return;
    const option = step.choice.options[i];
    if (answerChoice(step.choice, i) === 'good') {
      setFeedback({ good: true, text: l(option.feedback) });
      haptic('success');
      nextStep(state);
      return;
    }
    setTried([...tried, i]);
    setFeedback({ good: false, text: `${l(option.feedback)} ${t('play.tryAgain')}` });
    haptic('warning');
    if (!state.retried) {
      setState({ ...state, retried: true });
      setRetried((r) => (r.includes(scene.id) ? r : [...r, scene.id]));
    }
  };

  const deliver = (i: number) => {
    if (step?.kind !== 'drag' || delivered.includes(i)) return;
    const next = [...delivered, i];
    setDelivered(next);
    playSound('click');
    haptic('tap');
    if (next.length >= step.items.length) nextStep({ ...state, dragged: next.length });
  };

  const tapItem = () => {
    if (step?.kind !== 'tap') return;
    const s = { ...state, tapped: state.tapped + 1 };
    playSound('click');
    haptic('tap');
    if (stepDone(scene, s)) nextStep(s);
    else setState(s);
  };

  const moveSun = (t01: number, release: boolean) => {
    if (step?.kind !== 'sun') return;
    setSunT(t01);
    if (isSunset(t01)) {
      setFeedback({ good: true, text: t('play.sunset') });
      haptic('success');
      nextStep(state);
    } else if (release) setFeedback({ good: false, text: t('play.sunNotYet') });
  };

  // ---------- stage geometry ----------

  const W = width ?? 320;
  const H = Math.min(W * 0.75, rootH * 0.42);
  const SW = H / 0.75;
  const heroS = H * 0.4;
  const hero = { x: SW * 0.04, y: H - heroS * 1.1 - H * 0.03, w: heroS, h: heroS * 1.1 };
  const targetS = H * 0.36;
  const targetArt = step?.kind === 'drag' || step?.kind === 'tap' ? step.target : null;
  const targetBox = targetArt === 'hero' ? hero : { x: SW - targetS - SW * 0.04, y: H - targetS - H * 0.06, w: targetS, h: targetS };
  const itemS = H * 0.24;
  const sky = step?.kind === 'sun' ? 'sky.afternoon' : `sky.${scene.time}`;
  const sun = sunAt(sunT);
  const sunR = H * 0.07;

  const sunPan = Gesture.Pan()
    .runOnJS(true)
    .enabled(step?.kind === 'sun' && !cardOpen)
    .onUpdate((e) => setSunT(sunProgress(e.x / SW, e.y / H)))
    .onEnd((e) => moveSun(sunProgress(e.x / SW, e.y / H), true));

  const inTarget = (cx: number, cy: number) => {
    const pad = targetBox.w * 0.25;
    return cx >= targetBox.x - pad && cx <= targetBox.x + targetBox.w + pad && cy >= targetBox.y - pad && cy <= targetBox.y + targetBox.h + pad;
  };

  // ---------- render ----------

  const renderControls = () => {
    if (!step) return null;
    if (step.kind === 'choice') {
      return (
        <>
          <AppText variant="bodyBold">{l(step.choice.prompt)}</AppText>
          {step.choice.options.map((o, i) => (
            <Pressable
              key={i}
              onPress={() => choose(i)}
              accessibilityRole="button"
              accessibilityLabel={l(o.text)}
              accessibilityState={{ disabled: tried.includes(i) }}
              style={[styles.option, tried.includes(i) && styles.optionTried]}
            >
              <AppText variant="body">{l(o.text)}</AppText>
            </Pressable>
          ))}
        </>
      );
    }
    if (step.kind === 'mode') {
      return (
        <>
          <View style={styles.framing}>
            <AppText variant="small">{l(WHO_FASTS)}</AppText>
            <DifferenceNote note={FASTING_NOTE} />
            <SourceList sources={WHO_FASTS_SOURCES} />
          </View>
          <AppText variant="bodyBold">{t('mode.title')}</AppText>
          {(['mode.full', 'mode.part', 'mode.none'] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => {
                setFeedback({ good: true, text: t('mode.ok') });
                haptic('selection');
                nextStep(state);
              }}
              accessibilityRole="button"
              accessibilityLabel={t(key)}
              style={styles.option}
            >
              <AppText variant="body">{t(key)}</AppText>
            </Pressable>
          ))}
        </>
      );
    }
    if (step.kind === 'tracker') {
      return (
        <>
          <AppText variant="bodyBold">{t('tracker.title')}</AppText>
          <AppText variant="small" color={c.textMuted}>
            {t('tracker.hint')}
          </AppText>
          {GOOD_DEEDS.map((d) => {
            const on = ticked.includes(d.id);
            return (
              <Pressable
                key={d.id}
                onPress={() => {
                  setTicked(toggleDeed(ticked, d.id));
                  haptic('selection');
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={t(on ? 'a11y.deed' : 'a11y.deedOpen', { deed: l(d.label) })}
                style={[styles.deed, on && styles.deedOn]}
              >
                <Icon name={on ? 'check' : 'plus'} size={20} color={on ? c.success : c.textMuted} />
                <AppText variant="body" style={styles.flex}>
                  {l(d.label)}
                </AppText>
              </Pressable>
            );
          })}
          <Button label={t('tracker.finish')} iconRight="check" onPress={() => nextStep(state)} />
        </>
      );
    }
    if (step.kind === 'sun') {
      return (
        <>
          <AppText variant="bodyBold">{t('play.sun')}</AppText>
          <Button label={t('play.lowerSun')} variant="secondary" icon="sun" onPress={() => moveSun(Math.min(1, sunT + 0.25), true)} />
        </>
      );
    }
    return <AppText variant="bodyBold">{t(step.hint)}</AppText>;
  };

  return (
    <View style={styles.root} onLayout={onLayout}>
      <View style={styles.head}>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {scenes.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotNow]}>
              <Icon name={s.time === 'night' || s.time === 'dawn' ? 'moon' : 'sun'} size={13} color={i === index ? c.onGold : c.textMuted} />
            </View>
          ))}
        </View>
        <AppText variant="heading" style={styles.flex} numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
      </View>

      <GestureDetector gesture={sunPan}>
        <Animated.View key={scene.id} entering={reducedMotion ? undefined : FadeIn.duration(320)} style={[styles.stage, { width: SW, height: H }]} accessible accessibilityLabel={t('a11y.stage', { title })}>
          <Art name={sky} size={SW} height={H} fit="cover" />
          {step?.kind === 'sun' ? (
            <View style={[styles.abs, { left: 0, top: 0, opacity: sunT }]} pointerEvents="none">
              <Art name="sky.sunset" size={SW} height={H} fit="cover" />
            </View>
          ) : null}
          {step?.kind === 'sun' ? (
            <View
              pointerEvents="none"
              accessibilityLabel={t('a11y.sun')}
              style={[styles.sun, { left: sun.x * SW - sunR, top: sun.y * H - sunR, width: sunR * 2, height: sunR * 2, borderRadius: sunR }]}
            />
          ) : null}

          {scene.decor && !targetArt ? <Art name={scene.decor} size={H * 0.3} style={[styles.abs, { left: SW * 0.62, top: H * 0.48 }]} /> : null}
          {targetArt && targetArt !== 'hero' ? <Art name={targetArt} size={targetS} style={[styles.abs, { left: targetBox.x, top: targetBox.y }]} /> : null}

          <View style={[styles.abs, { left: hero.x, top: hero.y }]} pointerEvents="none">
            <Avatar character={character} size={heroS} />
          </View>

          {step?.kind === 'tap' ? (
            <>
              <Pressable
                onPress={tapItem}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.tap', { item: t(itemName(step.item)) })}
                style={[styles.abs, { left: SW * 0.36, top: H * 0.3 }]}
              >
                <Art name={step.item} size={itemS * 1.3} />
              </Pressable>
              {state.tapped > 0 ? (
                <Animated.View key={state.tapped} entering={reducedMotion ? undefined : ZoomIn} style={[styles.badge, { left: targetBox.x + targetBox.w - 20, top: targetBox.y - 6 }]}>
                  <AppText variant="tiny" color={c.onGold}>{`${state.tapped}/${step.count}`}</AppText>
                </Animated.View>
              ) : null}
            </>
          ) : null}

          {step?.kind === 'drag'
            ? step.items.map((art, i) =>
                delivered.includes(i) ? null : (
                  <Draggable
                    key={`${scene.id}-${state.step}-${i}`}
                    x={SW * 0.34 + i * (itemS + 8)}
                    y={H * 0.12}
                    width={itemS}
                    height={itemS}
                    reducedMotion={reducedMotion}
                    disabled={cardOpen}
                    label={t('a11y.drag', { item: t(itemName(art)) })}
                    onLift={() => haptic('selection')}
                    onDrop={(cx, cy) => (inTarget(cx, cy) ? { x: targetBox.x + targetBox.w / 2 - itemS / 2, y: targetBox.y + targetBox.h / 2 - itemS / 2 } : null)}
                    onSnapped={() => deliver(i)}
                    onTap={() => deliver(i)}
                  >
                    <Art name={art} size={itemS} />
                  </Draggable>
                ),
              )
            : null}
        </Animated.View>
      </GestureDetector>

      <ScrollView style={styles.flex} contentContainerStyle={styles.controls}>
        {renderControls()}
        {feedback && !cardOpen ? (
          <View accessibilityLiveRegion="polite">
            <AppText variant="small" color={feedback.good ? c.success : c.goldText}>
              {feedback.text}
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.garden} accessible accessibilityLabel={t('a11y.garden', { count: planted, total: scenes.length })}>
        {scenes.map((s, i) => (
          <View key={s.id} style={styles.plot}>
            {i < planted ? (
              <Animated.View entering={reducedMotion ? undefined : ZoomIn.springify().damping(12)}>
                <Art name={s.plant} size={38} />
              </Animated.View>
            ) : (
              <View style={styles.soil} />
            )}
          </View>
        ))}
      </View>

      {cardOpen ? (
        <Animated.View style={styles.overlay} entering={reducedMotion ? undefined : FadeInDown.duration(280)}>
          <View style={[styles.card, { maxHeight: rootH * 0.8 }]} accessibilityLiveRegion="polite">
            <ScrollView contentContainerStyle={styles.cardBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Art name={scene.plant} size={52} />
                <View style={styles.flex}>
                  <AppText variant="label" color={c.goldText}>
                    {t(index === scenes.length - 1 ? 'play.dayDone' : 'play.planted').toUpperCase()}
                  </AppText>
                  <AppText variant="heading" accessibilityRole="header">
                    {t('play.why')}
                  </AppText>
                </View>
              </View>
              {feedback?.good ? (
                <AppText variant="bodyBold" color={c.success}>
                  {feedback.text}
                </AppText>
              ) : null}
              {scene.card.texts.map((text, i) => (
                <AppText key={i} variant="body">
                  {l(text)}
                </AppText>
              ))}
              <DifferenceNote note={scene.card.note} />
              <SourceList sources={scene.card.sources} />
            </ScrollView>
            <View style={styles.cardFoot}>
              <Button label={t('play.continue')} iconRight="chevron" onPress={closeCard} />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

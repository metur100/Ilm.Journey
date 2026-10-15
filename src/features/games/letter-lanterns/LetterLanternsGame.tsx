import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { ArabicLetterCard, Art, artAspect } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { type GameApi, useGamesStore } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { Glow, GrowIn, SparkleBurst, useArabicVoice } from '../ayah-builder/kit';
import { letterInfo } from './letters';
import { buildSteps, lanternResult, type LanternOption, type LetterLanternsConfig, syllableReading, type WrongTap } from './logic';

const LANTERN_W = 90;
const LAMP_W = 50;
const LAMP_H = Math.round(LAMP_W / artAspect('object.lantern-ramadan'));
const CARD_W = 70;
const CARD_H = Math.round((CARD_W * 182) / 140);
const LANTERN_H = 12 + LAMP_H + CARD_H;
/** Where each lane starts its rise (fraction of the way up), so the sky is never empty at the start of a step. */
const PHASES = [0.62, 0.3, 0.8, 0.45, 0.15];
const LIT_DELAY = 950;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  target: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 72 },
  targetText: { flex: 1, gap: 2 },
  speaker: { width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft },
  hintButton: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: c.surfaceAlt },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  sky: { flex: 1, minHeight: 320, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.night },
  moon: { position: 'absolute', right: 12, top: 10, opacity: 0.9 },
  stars: { position: 'absolute', left: 8, top: 8, opacity: 0.8 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around', padding: spacing.sm },
  lantern: { width: LANTERN_W, height: LANTERN_H, alignItems: 'center' },
  string: { width: 2, height: 12, backgroundColor: c.goldBorder },
  card: { marginTop: -4 },
  note: { minHeight: 20 },
  panel: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
}));

interface LanternProps {
  option: LanternOption;
  lane: number;
  lanes: number;
  sky: { width: number; height: number };
  riseSeconds: number;
  reducedMotion: boolean;
  lit: boolean;
  wobble: number;
  label: string;
  onPress: () => void;
}

/** One lantern: rises slowly through the sky (looping) and sways; lights up and floats away when it is the answer. */
function Lantern({ option, lane, lanes, sky, riseSeconds, reducedMotion, lit, wobble, label, onPress }: LanternProps) {
  const styles = useStyles();
  const { c } = useTheme();
  const y = useSharedValue(0);
  const sway = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || sky.height <= 0) return;
    const from = sky.height;
    const to = -LANTERN_H;
    const travel = from - to;
    const duration = riseSeconds * 1000;
    const phase = PHASES[lane % PHASES.length];
    y.set(from - phase * travel);
    y.set(withSequence(
      withTiming(to, { duration: duration * (1 - phase), easing: Easing.linear }),
      withRepeat(withSequence(withTiming(from, { duration: 0 }), withTiming(to, { duration, easing: Easing.linear })), -1),
    ));
    sway.set(withRepeat(withSequence(withTiming(7, { duration: 1500 + lane * 230, easing: Easing.inOut(Easing.sin) }), withTiming(-7, { duration: 1500 + lane * 230, easing: Easing.inOut(Easing.sin) })), -1, true));
  }, [lane, reducedMotion, riseSeconds, sky.height, sway, y]);

  useEffect(() => {
    if (!lit || reducedMotion) return;
    y.set(withTiming(-LANTERN_H - 20, { duration: LIT_DELAY, easing: Easing.in(Easing.quad) }));
  }, [lit, reducedMotion, y]);

  useEffect(() => {
    if (wobble === 0 || reducedMotion) return;
    tilt.set(withSequence(withTiming(-9, { duration: 70 }), withTiming(9, { duration: 90 }), withTiming(-5, { duration: 80 }), withTiming(0, { duration: 70 })));
  }, [reducedMotion, tilt, wobble]);

  const slot = sky.width / lanes;
  const left = slot * lane + slot / 2 - LANTERN_W / 2;
  const moving = useAnimatedStyle(() => ({
    transform: [{ translateX: sway.value }, { translateY: y.value }, { rotate: `${tilt.value}deg` }],
  }));

  const body = (
    <Pressable onPress={onPress} disabled={lit} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: lit }} style={styles.lantern}>
      <Glow color={c.gold} active={lit} reducedMotion={reducedMotion} radius={LANTERN_W / 2} />
      <View style={styles.string} />
      <Art name="object.lantern-ramadan" size={LAMP_W} dark />
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <ArabicLetterCard letter={option.text} size={CARD_W} tone={lit ? 'gold' : 'night'} dark style={styles.card} />
      </View>
      <SparkleBurst trigger={lit ? 1 : 0} reducedMotion={reducedMotion} distance={56} />
    </Pressable>
  );

  if (reducedMotion) return body;
  return <Animated.View style={[{ position: 'absolute', top: 0, left }, moving]}>{body}</Animated.View>;
}

type Phase = 'intro' | 'play' | 'done';

/**
 * Letter Lanterns: lanterns carrying letters float up through a night sky; the target is said (offline Arabic voice)
 * and/or shown above the sky; tapping the right lantern lights it. Reduced motion: the lanterns stand still in a grid.
 */
export function LetterLanternsGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, language, t, l }: GameApi<LetterLanternsConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { available: hasVoice, speak } = useArabicVoice();
  const [playIndex] = useState(() => useGamesStore.getState().games[gameId]?.levels[`${level}`]?.plays ?? 0);
  const steps = useMemo(() => buildSteps(config, playIndex, `${gameId}:${level}`), [config, gameId, level, playIndex]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [litId, setLitId] = useState<string | null>(null);
  const [wrong, setWrong] = useState<WrongTap[]>([]);
  const [wobble, setWobble] = useState<{ id: string; n: number }>({ id: '', n: 0 });
  const [message, setMessage] = useState<'nudge' | 'lit' | null>(null);
  const [showSound, setShowSound] = useState(false);
  const [sky, setSky] = useState({ width: 0, height: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[index];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Say the target when a step starts (only with an Arabic voice on the device).
  useEffect(() => {
    if (phase === 'play' && hasVoice && step) speak(step.say);
  }, [hasVoice, index, phase, speak, step]);

  const tap = (option: LanternOption) => {
    if (litId || !step) return;
    if (!option.correct) {
      setWrong((w) => [...w, { step, tapped: option }]);
      setWobble((s) => ({ id: option.id, n: s.n + 1 }));
      setMessage('nudge');
      haptic('warning');
      return;
    }
    setLitId(option.id);
    setMessage('lit');
    haptic('success');
    playSound('click');
    timer.current = setTimeout(
      () => {
        setLitId(null);
        setMessage(null);
        setShowSound(false);
        if (index + 1 < steps.length) {
          setIndex(index + 1);
        } else {
          playSound('success');
          setPhase('done');
        }
      },
      reducedMotion ? 450 : LIT_DELAY,
    );
  };

  if (!step) return null;
  const info = letterInfo(step.letter);

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.panel}>
          <View style={styles.row}>
            {[0, 1, 2].map((i) => (
              <GrowIn key={i} reducedMotion={reducedMotion} delay={i * 140}>
                <Art name="object.lantern-ramadan" size={i === 1 ? 70 : 54} />
              </GrowIn>
            ))}
          </View>
          <AppText variant="title" align="center">
            {t(`play.intro.${config.mode}`)}
          </AppText>
          <AppText variant="body" align="center">
            {t(`play.introBody.${config.mode}`, { count: steps.length })}
          </AppText>
          {!hasVoice ? (
            <AppText variant="small" align="center" color={c.textMuted}>
              {t('play.noVoice')}
            </AppText>
          ) : null}
          <Button label={t('common.start')} icon="play" onPress={() => setPhase('play')} fullWidth />
        </View>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.panel}>
          <View style={styles.row}>
            {steps.slice(0, 5).map((s, i) => (
              <GrowIn key={s.letter + i} reducedMotion={reducedMotion} delay={i * 100}>
                <ArabicLetterCard letter={s.text} size={52} tone="gold" />
              </GrowIn>
            ))}
          </View>
          <AppText variant="title" align="center">
            {t('play.doneTitle')}
          </AppText>
          <AppText variant="body" align="center">
            {t('play.doneBody', { count: steps.length })}
          </AppText>
          <Button label={t('play.finish')} icon="sparkle" onPress={() => onComplete(lanternResult(steps.length, wrong, config.factRules))} fullWidth />
        </View>
      </ScrollView>
    );
  }

  const name = info ? `${l(info.name)} · ${info.translit}` : step.letter;
  const sound = step.haraka ? syllableReading(step.letter, step.haraka, language) : '';
  let prompt: string;
  if (config.mode === 'harakat') prompt = hasVoice && !showSound ? t('play.findSoundHidden') : t('play.findSound', { sound });
  else if (config.mode === 'forms' && step.position) prompt = t('play.findForm', { form: t(`play.position.${step.position}`) });
  else prompt = t('play.find', { name });

  return (
    <View style={styles.root}>
      <View style={styles.target}>
        {config.mode !== 'isolated' ? (
          <ArabicLetterCard letter={config.mode === 'harakat' && hasVoice && !showSound ? '?' : step.text} size={56} tone="teal" label={step.text} />
        ) : null}
        <View style={styles.targetText} accessibilityLiveRegion="polite">
          <AppText variant="heading">{prompt}</AppText>
          {config.mode === 'forms' && info ? (
            <AppText variant="small" color={c.textMuted}>
              {name}
            </AppText>
          ) : null}
          {config.mode === 'harakat' && hasVoice && !showSound ? (
            <Pressable onPress={() => setShowSound(true)} accessibilityRole="button" accessibilityLabel={t('play.showHint')} style={styles.hintButton}>
              <AppText variant="tiny" color={c.primaryText}>
                {t('play.showHint')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
        {hasVoice ? (
          <Pressable onPress={() => speak(step.say)} accessibilityRole="button" accessibilityLabel={t('play.listen')} style={styles.speaker}>
            <Icon name="speaker" size={22} color={c.primaryText} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.progress} accessible accessibilityLabel={t('a11y.progress', { count: index, total: steps.length })}>
        {steps.map((s, i) => (
          <Icon key={`${s.letter}-${i}`} name="lantern" size={18} color={i < index || (i === index && litId) ? c.gold : c.locked} />
        ))}
      </View>

      <View style={styles.sky} onLayout={(e) => setSky({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
        <Art name="garden.stars" size={140} dark style={styles.stars} />
        <Art name="garden.moon" size={54} dark style={styles.moon} />
        <View style={reducedMotion ? styles.grid : StyleSheet.absoluteFill} key={`step-${index}`}>
          {sky.width > 0 || reducedMotion
            ? step.options.map((option, lane) => (
                <Lantern
                  key={option.id}
                  option={option}
                  lane={lane}
                  lanes={step.options.length}
                  sky={sky}
                  riseSeconds={config.riseSeconds}
                  reducedMotion={reducedMotion}
                  lit={litId === option.id}
                  wobble={wobble.id === option.id ? wobble.n : 0}
                  label={t(litId === option.id ? 'a11y.lanternLit' : 'a11y.lantern', { text: option.text })}
                  onPress={() => tap(option)}
                />
              ))
            : null}
        </View>
      </View>

      <View style={styles.note} accessibilityLiveRegion="polite">
        {message ? (
          <AppText variant="small" align="center" color={message === 'lit' ? c.goldText : c.textMuted}>
            {t(message === 'lit' ? 'play.lit' : 'play.nudge')}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

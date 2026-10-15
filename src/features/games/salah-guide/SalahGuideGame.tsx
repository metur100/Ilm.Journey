import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SourceList } from '@/core/components/ui/SourceList';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { RAKAHS, type PrayerId } from '../prayer-sky/content';
import { poseChoices, RAKAH_MOVEMENTS, rakahsInGuide, salahGuideResult, type SalahGuideConfig, type SalahPose } from './logic';

const PRAYER_NAMES: Record<PrayerId, Record<'en' | 'de' | 'bs', string>> = {
  fajr: { en: 'Fajr', de: 'Fadschr', bs: 'Sabah' },
  dhuhr: { en: 'Dhuhr', de: 'Dhuhr', bs: 'Podne' },
  asr: { en: 'Asr', de: 'Asr', bs: 'Ikindija' },
  maghrib: { en: 'Maghrib', de: 'Maghrib', bs: 'Akšam' },
  isha: { en: 'Isha', de: 'Ischa', bs: 'Jacija' },
};

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.md },
  header: { gap: spacing.xs },
  stage: { minHeight: 220, borderRadius: radius.lg, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: spacing.xs },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: { flex: 1, minHeight: 124, padding: spacing.xs, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  optionText: { minHeight: 38, textAlign: 'center' },
  feedback: { minHeight: 24 },
  note: { padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
}));

export function SalahGuideGame({ config, facts, language, onComplete, playSound, haptic, t }: GameApi<SalahGuideConfig>) {
  const styles = useStyles();
  const { c } = useTheme();
  const [prayerIndex, setPrayerIndex] = useState(0);
  const [rakah, setRakah] = useState(1);
  const [movement, setMovement] = useState(0);
  const [prayerStarted, setPrayerStarted] = useState(false);
  const [finalSitting, setFinalSitting] = useState(false);
  const [taslim, setTaslim] = useState(false);
  const [prayerDone, setPrayerDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState('');
  const completed = useRef(false);
  const prayer = config.prayers[prayerIndex];
  const totalRakahs = rakahsInGuide(config.prayers);
  const priorRakahs = config.prayers.slice(0, prayerIndex).reduce((sum, id) => sum + RAKAHS[id], 0);
  const completedRakahs = priorRakahs + Math.max(0, rakah - 1) + (prayerDone ? 1 : 0);
  const currentPose: SalahPose = !prayerStarted ? 'takbir' : taslim ? 'taslim' : finalSitting ? 'final-sitting' : RAKAH_MOVEMENTS[movement];
  const choices = poseChoices(currentPose, movement + priorRakahs);
  const prayerName = (id: PrayerId) => PRAYER_NAMES[id][language];

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete(salahGuideResult(config, mistakes));
  };

  const nextPrayer = () => {
    setFeedback('');
    if (prayerIndex + 1 >= config.prayers.length) {
      finish();
      return;
    }
    setPrayerIndex((index) => index + 1);
    setRakah(1);
    setMovement(0);
    setPrayerStarted(false);
    setFinalSitting(false);
    setTaslim(false);
    setPrayerDone(false);
  };

  const choose = (pose: SalahPose) => {
    if (prayerDone) return;
    if (pose !== currentPose) {
      setMistakes((count) => count + 1);
      setFeedback(t('play.tryAgain'));
      playSound('failure');
      haptic('warning');
      return;
    }
    playSound('success');
    haptic('success');
    setFeedback(t('play.correct'));
    if (!prayerStarted) {
      setPrayerStarted(true);
      return;
    }
    if (taslim) {
      setPrayerDone(true);
      return;
    }
    if (finalSitting) {
      setTaslim(true);
      return;
    }
    if (movement + 1 < RAKAH_MOVEMENTS.length) {
      setMovement((step) => step + 1);
      return;
    }
    if (rakah < RAKAHS[prayer]) {
      setRakah((count) => count + 1);
      setMovement(0);
      return;
    }
    setFinalSitting(true);
  };

  const progress = completedRakahs / totalRakahs;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="heading">{prayerDone ? t('play.prayerDone', { prayer: prayerName(prayer), count: RAKAHS[prayer] }) : finalSitting ? t('play.finalSitting', { prayer: prayerName(prayer) }) : t('play.rakah', { prayer: prayerName(prayer), current: rakah, total: RAKAHS[prayer] })}</AppText>
        <ProgressBar progress={progress} accessibilityLabel={`${completedRakahs} / ${totalRakahs}`} />
      </View>

      <View style={styles.stage}>
        <SalahIllustration pose={prayerDone || taslim || finalSitting ? 'final-sitting' : !prayerStarted || movement === 0 ? null : RAKAH_MOVEMENTS[movement - 1]} size={148} />
        <AppText variant="bodyBold" align="center">{prayerDone ? t('play.prayerDone', { prayer: prayerName(prayer), count: RAKAHS[prayer] }) : t('play.nextMovement')}</AppText>
      </View>

      {prayerDone ? (
        <Button label={prayerIndex + 1 < config.prayers.length ? t('play.nextPrayer') : t('play.finish')} iconRight="chevron" onPress={nextPrayer} />
      ) : (
        <View style={styles.options}>
          {choices.map((choice) => (
            <Pressable key={choice.pose} onPress={() => choose(choice.pose)} accessibilityRole="button" accessibilityLabel={t(`pose.${choice.pose}`)} style={styles.option}>
              <SalahIllustration pose={choice.pose} size={66} />
              <AppText variant="tiny" style={styles.optionText}>
                {t(`pose.${choice.pose}`)}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}

      <AppText variant="small" color={feedback === t('play.correct') ? c.success : c.goldText} style={styles.feedback} accessibilityLiveRegion="polite">{feedback}</AppText>
      {prayerDone ? <SourceList sources={facts.flatMap((fact) => fact.sources)} /> : null}
      <AppText variant="tiny" color={c.textMuted} style={styles.note}>{t('play.teacherNote')}</AppText>
    </View>
  );
}

function SalahIllustration({ pose, size }: { pose: SalahPose | null; size: number }) {
  const { c } = useTheme();
  const stroke = c.primaryText;
  const head = <Circle cx={80} cy={28} r={12} fill={c.primary} />;
  if (!pose) {
    return <Svg width={size} height={size * 0.84} viewBox="0 0 160 190"><Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} /><Path d="M30 158v-10M130 158v-10" stroke={c.border} strokeWidth={3} /></Svg>;
  }
  if (pose === 'standing' || pose === 'rising') {
    return (
      <Svg width={size} height={size * 0.84} viewBox="0 0 160 190">
        <Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} />
        {head}
        <Path d="M80 42v68M80 58 56 100M80 58l24 42M80 110l-18 48M80 110l18 48" stroke={stroke} strokeWidth={10} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (pose === 'bowing') {
    return (
      <Svg width={size} height={size * 0.84} viewBox="0 0 160 190">
        <Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} />
        <Circle cx={50} cy={62} r={12} fill={c.primary} />
        <Path d="M62 68 108 82M74 72l-8 26M96 78l10 17M108 82l-5 42M108 82l24 6M103 124l-14 34M103 124l25 34" stroke={stroke} strokeWidth={10} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (pose === 'prostrating' || pose === 'prostrating-again') {
    return (
      <Svg width={size} height={size * 0.84} viewBox="0 0 160 190">
        <Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} />
        <Circle cx={43} cy={132} r={10} fill={c.primary} />
        <Path d="M54 132 90 124 112 139 130 146M70 129l-25 22M87 125l-12 23M110 140l-20 17M112 140l29 17" stroke={stroke} strokeWidth={10} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size * 0.84} viewBox="0 0 160 190">
      <Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} />
      <Circle cx={80} cy={58} r={12} fill={c.primary} />
      <Path d="M80 72v42M80 86 58 110M80 86l22 24M80 114 52 144 112 144 134 158M80 114l16 28" stroke={stroke} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
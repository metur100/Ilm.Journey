import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

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
        <SalahIllustration
          pose={
            prayerDone || taslim
              ? 'taslim'
              : finalSitting
                ? 'prostrating-again'
                : !prayerStarted
                  ? 'takbir'
                  : movement === 0
                    ? 'standing'
                    : RAKAH_MOVEMENTS[movement - 1]
          }
          size={148}
        />
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
  const outline = c.primaryText;
  const rug = <><Rect x={12} y={158} width={136} height={10} rx={5} fill={c.goldSoft} /><Path d="M24 158v-5m112 5v-5M50 163h60" stroke={c.goldBorder} strokeWidth={2} strokeLinecap="round" /></>;
  const head = (x: number, y: number) => (
    <G>
      <Circle cx={x} cy={y} r={12} fill={c.gold} />
      <Path d={`M${x - 11} ${y - 4}q11-13 22 0v4h-22Z`} fill={outline} />
    </G>
  );
  const legs = <Path d="M70 110v43m20-43v43m-20 0-7 4m27-4 7 4" stroke={outline} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  const standing = (
    <G>
      {head(80, 30)}
      <Path d="M67 47q13-8 26 0l8 62q-21 12-42 0Z" fill={c.primary} stroke={outline} strokeWidth={3} strokeLinejoin="round" />
      {legs}
      {pose === 'takbir' ? (
        <G>
          <Path d="M67 55 54 37m39 18 13-18" stroke={c.primary} strokeWidth={11} strokeLinecap="round" />
          <Path d="M67 55 54 37m39 18 13-18" stroke={outline} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={52} cy={34} r={5} fill={c.gold} /><Circle cx={108} cy={34} r={5} fill={c.gold} />
        </G>
      ) : (
        <Path d="M67 55 61 91m32-36 6 36" stroke={c.primary} strokeWidth={11} strokeLinecap="round" />
      )}
    </G>
  );
  const bowing = (
    <G>
      {head(119, 67)}
      <Path d="m64 57 43 7-4 21-42-8Z" fill={c.primary} stroke={outline} strokeWidth={3} strokeLinejoin="round" />
      <Path d="m65 76-2 75m20-70 4 70m-21 0-7 4m28-4 7 4" stroke={outline} strokeWidth={10} strokeLinecap="round" />
      <Path d="m78 63-8 31m28-27-3 28" stroke={c.primary} strokeWidth={9} strokeLinecap="round" />
      <Path d="m78 63-8 31m28-27-3 28" stroke={outline} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={70} cy={97} r={4} fill={c.gold} /><Circle cx={95} cy={97} r={4} fill={c.gold} />
    </G>
  );
  const prostrating = (
    <G>
      {head(48, 131)}
      <Path d="m59 124 31-16 21 12-26 20-25-5Z" fill={c.primary} stroke={outline} strokeWidth={3} strokeLinejoin="round" />
      <Path d="m64 126-17 24m42-15-10 17m32-32 14 28m-25-12 24 12" stroke={outline} strokeWidth={9} strokeLinecap="round" />
      <Path d="m63 128-16 18m30-5-7 13" stroke={c.primary} strokeWidth={7} strokeLinecap="round" />
      <Circle cx={46} cy={151} r={4} fill={c.gold} /><Circle cx={70} cy={158} r={4} fill={c.gold} />
    </G>
  );
  const sitting = (
    <G>
      {head(80, 45)}
      <Path d="M67 62q13-8 26 0l7 45q-18 9-38 0Z" fill={c.primary} stroke={outline} strokeWidth={3} strokeLinejoin="round" />
      <Path d="m69 70-7 33m29-33 7 33m-28 5-16 20 47 1 23 13m-54-34 5 22" stroke={outline} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {pose === 'taslim' ? <Path d="M54 44q-18 7-20 22m72-22q18 7 20 22" stroke={c.goldBorder} strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
    </G>
  );
  const figure = pose === 'bowing' ? bowing : pose === 'prostrating' || pose === 'prostrating-again' ? prostrating : pose === 'sitting-between' || pose === 'final-sitting' || pose === 'taslim' ? sitting : standing;

  return <Svg width={size} height={size * 0.84} viewBox="0 0 160 190">{rug}{figure}</Svg>;
}
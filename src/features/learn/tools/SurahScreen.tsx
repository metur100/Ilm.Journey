import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';
import { type Ayah, BASMALA, getSurah, QURAN_SOURCE, type Surah } from '@/features/quran';

import { AyahListen } from '../quests/components/AyahListen';
import { useQuestI18n } from '../quests/i18n';
import { memorizationOf } from '../quests/services/memorization';
import { useRecitation } from '../quests/services/recitation';
import { useQuestStore } from '../quests/store/questStore';

const useStyles = makeStyles((c) => ({
  header: { gap: spacing.xs, alignItems: 'center' },
  basmala: { backgroundColor: c.goldSoft, borderRadius: radius.lg, padding: spacing.md, gap: 2, borderWidth: 1, borderColor: c.goldBorder },
  ayahCard: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: c.border, padding: spacing.lg, gap: spacing.sm },
  ayahLearned: { borderColor: c.success },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  learnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  learnToggleOn: { backgroundColor: c.successSoft, borderColor: c.success },
  hiddenBox: {
    minHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
}));

export default function SurahScreen() {
  const { surah: param } = useLocalSearchParams<{ surah: string }>();
  const { t } = useQuestI18n();
  useStatusBar(false);
  const surah = getSurah(Number(param));
  if (!surah) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="quran" title={t('mem.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }
  return <SurahView key={surah.number} surah={surah} />;
}

function SurahView({ surah }: { surah: Surah }) {
  const { t, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const recitation = useRecitation();
  const memorization = useQuestStore((s) => s.memorization);
  const setAyahLearned = useQuestStore((s) => s.setAyahLearned);
  const [testing, setTesting] = useState(false);
  const memo = memorizationOf({ memorization }, surah.number);
  const learned = new Set(memo.learned);
  const meaning = surah.nameMeaningLocalized?.[language] ?? surah.nameMeaning;

  if (testing) {
    return (
      <Screen header={<TopBar title={surah.nameTransliterated} backIcon="close" backLabel={t('mem.test.exit')} onBack={() => setTesting(false)} />}>
        <SelfTest surah={surah} onClose={() => setTesting(false)} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={surah.nameTransliterated} />}>
      <View style={styles.header}>
        <AppText variant="display" script="quran" align="center" color={c.goldText} accessibilityLabel={`${surah.number}. ${surah.nameTransliterated}`}>
          {surah.nameArabic}
        </AppText>
        <AppText variant="heading" align="center" accessibilityRole="header">
          {surah.number}. {surah.nameTransliterated} – {meaning}
        </AppText>
        <AppText variant="small" color={c.textMuted} align="center">
          {surah.revelationType === 'makki' ? t('recite.makki') : t('recite.madani')} · {t('recite.ayahs', { count: surah.ayahCount })} · {t('mem.juz', { juz: surah.juz })}
        </AppText>
      </View>

      <Card tone="primary">
        <AppText variant="bodyBold">{t('mem.surahProgress', { learned: learned.size, total: surah.ayahCount })}</AppText>
        <ProgressBar progress={learned.size / surah.ayahCount} color={learned.size === surah.ayahCount ? c.success : topicThemes.quran.accent} />
        {memo.tests > 0 ? (
          <AppText variant="small" color={c.textMuted}>
            {t('mem.test.best', { percent: memo.bestTest })}
          </AppText>
        ) : null}
        {learned.size === surah.ayahCount ? (
          <AppText variant="small" color={c.success}>
            {t('mem.allLearned')}
          </AppText>
        ) : null}
      </Card>
      <AppText variant="small" color={c.textMuted}>
        {t('mem.learnHint')}
      </AppText>
      <Button
        label={t('mem.test.start')}
        icon="eyeOff"
        variant="gold"
        onPress={() => {
          recitation.stop();
          setTesting(true);
        }}
      />

      {surah.number !== 1 ? (
        <View style={styles.basmala}>
          <AppText variant="heading" script="quran" align="center">
            {BASMALA}
          </AppText>
          <AppText variant="tiny" align="center" color={c.textMuted}>
            {t('recite.basmalaNote')}
          </AppText>
        </View>
      ) : null}

      {surah.ayahs.map((ayah) => {
        const isLearned = learned.has(ayah.numberInSurah);
        return (
          <View key={ayah.numberInSurah} style={[styles.ayahCard, isLearned && styles.ayahLearned]}>
            <AyahText ayah={ayah} />
            <View style={styles.footer}>
              <AyahListen
                playing={recitation.playing === ayah.globalNumber}
                onPress={() => recitation.toggle(ayah.globalNumber)}
                label={t('recite.ayahLabel', { number: ayah.numberInSurah })}
              />
              <Pressable
                onPress={() => setAyahLearned(surah.number, ayah.numberInSurah, !isLearned)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isLearned }}
                accessibilityLabel={`${t('recite.ayahLabel', { number: ayah.numberInSurah })}: ${t('mem.learned')}`}
                style={[styles.learnToggle, isLearned && styles.learnToggleOn]}
              >
                <Icon name={isLearned ? 'check' : 'starOutline'} size={18} color={isLearned ? c.success : c.textMuted} strokeWidth={isLearned ? 3 : 2} />
                <AppText variant="small" color={isLearned ? c.success : c.text}>
                  {isLearned ? t('mem.learned') : t('mem.markLearned')}
                </AppText>
              </Pressable>
            </View>
            {recitation.failed === ayah.globalNumber ? (
              <AppText variant="small" color={c.error} accessibilityLiveRegion="polite">
                {t('recite.audioUnavailable')}
              </AppText>
            ) : null}
          </View>
        );
      })}

      <AppText variant="tiny" color={c.textMuted}>
        {t('recite.source', { translation: QURAN_SOURCE.translations[language] })} {t('recite.audioSource')}
      </AppText>
    </Screen>
  );
}

function AyahText({ ayah }: { ayah: Ayah }) {
  const { l } = useQuestI18n();
  const { c } = useTheme();
  return (
    <>
      <AppText variant="title" script="quran" align="center">
        {ayah.arabic} ﴿{ayah.numberInSurah}﴾
      </AppText>
      <AppText variant="small" align="center" color={c.textMuted}>
        {ayah.transliteration}
      </AppText>
      <AppText variant="body" align="center">
        {l(ayah.translation)}
      </AppText>
    </>
  );
}

/** "Test myself": ayahs are hidden; the learner recites, reveals and rates honestly. Known ayahs become learned. */
function SelfTest({ surah, onClose }: { surah: Surah; onClose: () => void }) {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const record = useQuestStore((s) => s.recordMemorizationTest);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const ayah = surah.ayahs[index];

  const rate = (knew: boolean) => {
    const nextKnown = knew ? [...known, ayah.numberInSurah] : known;
    if (knew) feedback.success();
    else feedback.tap();
    setKnown(nextKnown);
    setRevealed(false);
    if (index + 1 < surah.ayahs.length) {
      setIndex(index + 1);
      return;
    }
    record(surah.number, nextKnown);
    feedback.reward();
    setDone(true);
  };

  if (done) {
    return (
      <>
        <AppText variant="title" align="center" accessibilityRole="header">
          {t('mem.test.result', { correct: known.length, total: surah.ayahs.length })}
        </AppText>
        <ProgressBar progress={known.length / surah.ayahs.length} color={c.success} />
        <AppText variant="body" color={c.textMuted} align="center">
          {t('mem.test.resultHint')}
        </AppText>
        <Button
          label={t('mem.test.again')}
          icon="refresh"
          variant="secondary"
          onPress={() => {
            setIndex(0);
            setKnown([]);
            setDone(false);
          }}
        />
        <Button label={t('mem.test.back')} onPress={onClose} />
      </>
    );
  }

  return (
    <>
      <AppText variant="body" color={c.textMuted}>
        {t('mem.test.intro')}
      </AppText>
      <AppText variant="label" color={c.goldText} accessibilityLiveRegion="polite">
        {t('mem.test.progress', { current: index + 1, total: surah.ayahs.length }).toUpperCase()}
      </AppText>
      <ProgressBar progress={index / surah.ayahs.length} color={topicThemes.quran.accent} />
      {revealed ? (
        <View style={styles.ayahCard}>
          <AyahText ayah={ayah} />
        </View>
      ) : (
        <Pressable onPress={() => setRevealed(true)} accessibilityRole="button" accessibilityLabel={t('mem.test.reveal')} style={styles.hiddenBox}>
          <Icon name="eyeOff" size={28} color={c.textMuted} />
          <AppText variant="heading" color={c.textMuted}>
            {t('recite.ayahLabel', { number: ayah.numberInSurah })}
          </AppText>
        </Pressable>
      )}
      {revealed ? (
        <View style={styles.row}>
          <View style={styles.cell}>
            <Button label={t('mem.test.notYet')} variant="secondary" onPress={() => rate(false)} />
          </View>
          <View style={styles.cell}>
            <Button label={t('mem.test.knew')} icon="check" onPress={() => rate(true)} />
          </View>
        </View>
      ) : (
        <Button label={t('mem.test.reveal')} icon="eye" onPress={() => setRevealed(true)} />
      )}
    </>
  );
}

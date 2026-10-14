import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { BASMALA, getSurah, QURAN_SOURCE } from '@/features/quran';

import { useQuestI18n } from '../i18n';
import { addRepetition, allRepeated, REPEATS } from '../services/memorization';
import { useRecitation } from '../services/recitation';
import { AyahListen } from './AyahListen';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  header: { gap: spacing.xs },
  basmala: { backgroundColor: c.goldSoft, borderRadius: radius.lg, padding: spacing.md, gap: 2, borderWidth: 1, borderColor: c.goldBorder },
  ayahCard: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: c.border, overflow: 'hidden' },
  ayahDone: { borderColor: c.success },
  ayahPress: { padding: spacing.lg, gap: spacing.xs, minHeight: 64 },
  hiddenText: { opacity: 0.06 },
  ayahFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border },
  dotOn: { backgroundColor: c.success, borderColor: c.success },
}));

/**
 * Memorisation step (islam-quest ReciteView): the learner reads each verified ayah and taps it after each of three
 * repetitions. "Test myself" hides the Arabic text; "Listen" streams the recitation (optional, needs internet).
 */
export function ReciteStep({ surahNumber, onDone }: { surahNumber: number; onDone: () => void }) {
  const { t, l, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const recitation = useRecitation();
  const surah = getSurah(surahNumber);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [hidden, setHidden] = useState(false);

  if (!surah) return <Button label={t('common.continue')} onPress={onDone} />;
  const allDone = allRepeated(
    counts,
    surah.ayahs.map((a) => a.numberInSurah),
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('recite.title', { surah: surah.nameTransliterated })}
        </AppText>
        <AppText variant="title" script="quran" align="center" color={c.goldText}>
          {surah.nameArabic}
        </AppText>
        <AppText variant="small" color={c.textMuted}>
          {surah.revelationType === 'makki' ? t('recite.makki') : t('recite.madani')} · {t('recite.ayahs', { count: surah.ayahCount })}
        </AppText>
        <AppText variant="body">{t('recite.hint')}</AppText>
      </View>

      <Button
        label={hidden ? t('recite.showText') : t('recite.hideText')}
        icon={hidden ? 'eye' : 'eyeOff'}
        variant="secondary"
        onPress={() => setHidden((h) => !h)}
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
        const count = counts[ayah.numberInSurah] ?? 0;
        const complete = count >= REPEATS;
        return (
          <View key={ayah.numberInSurah} style={[styles.ayahCard, complete && styles.ayahDone]}>
            <Pressable
              onPress={() => {
                if (complete) return;
                feedback.tap();
                setCounts((cs) => addRepetition(cs, ayah.numberInSurah));
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('recite.ayahLabel', { number: ayah.numberInSurah })}. ${ayah.transliteration}. ${t('recite.repeat', { count })}`}
              accessibilityState={{ disabled: complete }}
              style={styles.ayahPress}
            >
              <AppText variant="title" script="quran" align="center" style={hidden ? styles.hiddenText : undefined}>
                {ayah.arabic} ﴿{ayah.numberInSurah}﴾
              </AppText>
              {!hidden ? (
                <>
                  <AppText variant="small" align="center" color={c.textMuted}>
                    {ayah.transliteration}
                  </AppText>
                  <AppText variant="small" align="center">
                    {l(ayah.translation)}
                  </AppText>
                </>
              ) : null}
            </Pressable>
            <View style={styles.ayahFooter}>
              <AyahListen
                playing={recitation.playing === ayah.globalNumber}
                onPress={() => recitation.toggle(ayah.globalNumber)}
                label={t('recite.ayahLabel', { number: ayah.numberInSurah })}
              />
              <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                {Array.from({ length: REPEATS }, (_, i) => (
                  <View key={i} style={[styles.dot, i < count && styles.dotOn]} />
                ))}
              </View>
            </View>
          </View>
        );
      })}

      {recitation.error ? (
        <AppText variant="small" color={c.error} accessibilityLiveRegion="polite">
          {t('recite.audioUnavailable')}
        </AppText>
      ) : null}
      <AppText variant="tiny" color={c.textMuted}>
        {t('recite.source', { translation: QURAN_SOURCE.translations[language] })} {t('recite.audioSource')}
      </AppText>
      {!allDone ? (
        <AppText variant="small" color={c.textMuted} align="center">
          {t('recite.remaining')}
        </AppText>
      ) : null}
      <Button
        label={t('recite.done')}
        icon="check"
        disabled={!allDone}
        onPress={() => {
          recitation.stop();
          onDone();
        }}
      />
    </View>
  );
}

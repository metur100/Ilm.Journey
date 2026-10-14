import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { SourceList } from '@/core/components/ui/SourceList';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { getDua, QURAN_SOURCE } from '@/features/quran';

import { AyahListen } from '../quests/components/AyahListen';
import { useQuestI18n } from '../quests/i18n';
import { useRecitation } from '../quests/services/recitation';
import { useQuestStore } from '../quests/store/questStore';
import { duaThemeKey } from './DuasScreen';

const useStyles = makeStyles((c) => ({
  header: { gap: spacing.xs },
  pill: { alignSelf: 'flex-start', backgroundColor: c.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  arabicCard: { backgroundColor: c.goldSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: c.goldBorder, padding: spacing.lg, gap: spacing.md },
  ayah: { gap: spacing.xs },
  section: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
}));

/** One Quranic dua: full ayah(s) in Amiri Quran, transliteration, translation in the UI language, context and source. */
export default function DuaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  useStatusBar(false);
  const feedback = useFeedback();
  const recitation = useRecitation();
  const learned = useQuestStore((s) => s.duasLearned);
  const favourites = useQuestStore((s) => s.duasFavourite);
  const toggleLearned = useQuestStore((s) => s.toggleDuaLearned);
  const toggleFavourite = useQuestStore((s) => s.toggleDuaFavourite);
  const dua = getDua(String(id));

  if (!dua) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="quran" title={t('duas.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const isLearned = learned.includes(dua.id);
  const isFavourite = favourites.includes(dua.id);

  return (
    <Screen header={<TopBar title={t('duas.title')} />}>
      <View style={styles.header}>
        <View style={styles.pill}>
          <AppText variant="label" color={c.primaryText}>
            {t(duaThemeKey(dua.theme)).toUpperCase()}
          </AppText>
        </View>
        <AppText variant="title" accessibilityRole="header">
          {l(dua.title)}
        </AppText>
        <AppText variant="small" color={c.textMuted}>
          {dua.surah.nameTransliterated} ({dua.surah.nameMeaning}) · {dua.ref}
        </AppText>
      </View>

      <View style={styles.arabicCard}>
        {dua.ayahs.map((ayah) => (
          <View key={`${ayah.surah}:${ayah.numberInSurah}`} style={styles.ayah}>
            <AppText variant="title" script="quran" align="center">
              {ayah.arabic} ﴿{ayah.numberInSurah}﴾
            </AppText>
            <AyahListen
              playing={recitation.playing === ayah.globalNumber}
              onPress={() => recitation.toggle(ayah.globalNumber)}
              label={`${ayah.surah}:${ayah.numberInSurah}`}
            />
          </View>
        ))}
      </View>
      {recitation.error ? (
        <AppText variant="small" color={c.error} accessibilityLiveRegion="polite">
          {t('recite.audioUnavailable')}
        </AppText>
      ) : null}

      <View style={styles.row}>
        <View style={styles.cell}>
          <Button
            label={isLearned ? t('duas.learned') : t('duas.markLearned')}
            icon="check"
            variant={isLearned ? 'primary' : 'secondary'}
            onPress={() => {
              if (!isLearned) feedback.success();
              toggleLearned(dua.id);
            }}
          />
        </View>
        <View style={styles.cell}>
          <Button
            label={isFavourite ? t('duas.unfavourite') : t('duas.favourite')}
            icon="heart"
            variant={isFavourite ? 'gold' : 'secondary'}
            onPress={() => toggleFavourite(dua.id)}
          />
        </View>
      </View>

      <Card>
        <View style={styles.section}>
          <AppText variant="label" color={c.goldText}>
            {t('duas.transliteration').toUpperCase()}
          </AppText>
          {dua.ayahs.map((ayah) => (
            <AppText key={ayah.numberInSurah} variant="body" color={c.textMuted}>
              {ayah.transliteration}
            </AppText>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="label" color={c.goldText}>
            {t('duas.translation').toUpperCase()}
          </AppText>
          {dua.ayahs.map((ayah) => (
            <AppText key={ayah.numberInSurah} variant="reading">
              ({ayah.numberInSurah}) {l(ayah.translation)}
            </AppText>
          ))}
          <AppText variant="tiny" color={c.textMuted}>
            {t('duas.translationBy', { name: QURAN_SOURCE.translations[language] })}
          </AppText>
        </View>
      </Card>

      <Card tone="primary">
        <View style={styles.section}>
          <AppText variant="label" color={c.primaryText}>
            {t('duas.context').toUpperCase()}
          </AppText>
          <AppText variant="body">{l(dua.context)}</AppText>
        </View>
      </Card>

      <SourceList sources={[{ sourceName: dua.sourceName, sourceReference: dua.sourceReference }]} />
      <AppText variant="tiny" color={c.textMuted}>
        {t('duas.fullAyahNote')} {t('recite.source', { translation: QURAN_SOURCE.translations[language] })} {t('recite.audioSource')}
      </AppText>
    </Screen>
  );
}

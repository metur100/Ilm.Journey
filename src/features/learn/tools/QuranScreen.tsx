import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';
import { listSurahs, QURAN_SOURCE, type Surah } from '@/features/quran';

import { useQuestI18n } from '../quests/i18n';
import { learnedCount, memorizationSummary } from '../quests/services/memorization';
import { useQuestStore } from '../quests/store/questStore';

type Order = 'memorization' | 'mushaf';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  heroText: { gap: spacing.xs },
  segment: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: radius.pill, padding: 4, gap: 4 },
  segmentItem: { flex: 1, minHeight: TOUCH_TARGET, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  segmentActive: { backgroundColor: c.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft },
  numberDone: { backgroundColor: c.success },
  texts: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' },
  arabic: { minWidth: 72 },
  list: { gap: spacing.sm },
}));

/** Quran memorization tool: all 38 surahs (Al-Fatiha + Juz ʿAmma) with per-surah progress. */
export default function QuranScreen() {
  const { t, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const memorization = useQuestStore((s) => s.memorization);
  const practice = useQuestStore((s) => s.recitePractice);
  const [order, setOrder] = useState<Order>('memorization');
  const surahs = useMemo(() => listSurahs(order), [order]);
  const summary = memorizationSummary({ memorization });
  const theme = topicThemes.quran;

  const meaning = (s: Surah) => s.nameMeaningLocalized?.[language] ?? s.nameMeaning;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <HeroHeader gradient={theme.gradient}>
          <TopBar dark />
          <View style={styles.heroText}>
            <AppText variant="display" color={c.onNight} accessibilityRole="header">
              {t('mem.title')}
            </AppText>
            <AppText variant="body" color={c.onNight}>
              {t('mem.intro')}
            </AppText>
          </View>
          <AppText variant="small" color={c.onNight}>
            {t('mem.summary', { learned: summary.learned, total: summary.total })}
          </AppText>
          <ProgressBar progress={summary.total ? summary.learned / summary.total : 0} color={c.gold} trackColor="rgba(255,255,255,0.2)" />
        </HeroHeader>
      <View style={styles.body}>
      <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel={t('mem.order')}>
        {(['memorization', 'mushaf'] as const).map((o) => {
          const active = o === order;
          return (
            <Pressable
              key={o}
              onPress={() => setOrder(o)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              style={[styles.segmentItem, active && styles.segmentActive]}
            >
              <AppText variant="small" color={active ? c.onPrimary : c.text} align="center">
                {t(`mem.order.${o}`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="small" color={c.textMuted}>
        {t(`mem.orderHint.${order}`)}
      </AppText>

      <View style={styles.list}>
        {surahs.map((s) => {
          const learned = learnedCount({ memorization }, s);
          const done = learned === s.ayahCount;
          const practised = practice[String(s.number)] ?? 0;
          const label = `${s.number}. ${s.nameTransliterated}, ${meaning(s)}. ${t('mem.surahProgress', { learned, total: s.ayahCount })}`;
          return (
            <Card key={s.number} onPress={() => router.push({ pathname: '/tools/quran/[surah]', params: { surah: String(s.number) } })} accessibilityLabel={label}>
              <View style={styles.row}>
                <View style={[styles.number, done && styles.numberDone]}>
                  {done ? (
                    <Icon name="check" size={20} color={c.onStatus} strokeWidth={3} />
                  ) : (
                    <AppText variant="bodyBold" color={c.primaryText}>
                      {s.number}
                    </AppText>
                  )}
                </View>
                <View style={styles.texts}>
                  <AppText variant="bodyBold">{s.nameTransliterated}</AppText>
                  <AppText variant="small" color={c.textMuted} numberOfLines={1}>
                    {meaning(s)}
                  </AppText>
                  <View style={styles.meta}>
                    <AppText variant="tiny" color={c.textMuted}>
                      {t(`mem.difficulty.${s.difficulty}`)} · {t('recite.ayahs', { count: s.ayahCount })}
                      {practised > 0 ? ` · ${t('mem.practised', { count: practised })}` : ''}
                    </AppText>
                  </View>
                  <ProgressBar progress={learned / s.ayahCount} color={done ? c.success : theme.accent} height={6} />
                </View>
                <AppText variant="heading" script="quran" color={c.goldText} style={styles.arabic} align="right">
                  {s.nameArabic.replace(/^سُورَةُ\s*/, '')}
                </AppText>
              </View>
            </Card>
          );
        })}
      </View>
      <AppText variant="tiny" color={c.textMuted}>
        {t('recite.source', { translation: QURAN_SOURCE.translations[language] })} {t('recite.audioSource')}
      </AppText>
      </View>
    </ScrollView>
  );
}

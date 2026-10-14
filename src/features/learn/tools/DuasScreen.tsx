import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';
import { type DuaTheme, duasByTheme, listDuas, type QuranicDua } from '@/features/quran';

import { type QuestKey, useQuestI18n } from '../quests/i18n';
import { useQuestStore } from '../quests/store/questStore';

type Filter = 'all' | 'favourites' | 'learned';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  heroText: { gap: spacing.xs },
  group: { gap: spacing.sm },
  segment: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: radius.pill, padding: 4, gap: 4 },
  segmentItem: { flex: 1, minHeight: TOUCH_TARGET, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  segmentActive: { backgroundColor: c.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  ref: { alignSelf: 'flex-start', backgroundColor: c.goldSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
}));

export const duaThemeKey = (theme: DuaTheme) => `duas.theme.${theme}` as QuestKey;

/** Quranic duas grouped by theme, with favourites and learned filters. */
export default function DuasScreen() {
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const learned = useQuestStore((s) => s.duasLearned);
  const favourites = useQuestStore((s) => s.duasFavourite);
  const [filter, setFilter] = useState<Filter>('all');
  const groups = useMemo(() => Object.entries(duasByTheme()) as [DuaTheme, QuranicDua[]][], []);
  const total = listDuas().length;

  const visible = (d: QuranicDua) => (filter === 'all' ? true : filter === 'favourites' ? favourites.includes(d.id) : learned.includes(d.id));
  const shown = groups.map(([theme, duas]) => [theme, duas.filter(visible)] as const).filter(([, duas]) => duas.length > 0);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={topicThemes.quran.gradient}>
        <TopBar dark />
        <View style={styles.heroText}>
          <AppText variant="display" color={c.onNight} accessibilityRole="header">
            {t('duas.title')}
          </AppText>
          <AppText variant="body" color={c.onNight}>
            {t('duas.intro')}
          </AppText>
        </View>
        <AppText variant="small" color={c.onNight}>
          {t('duas.summary', { learned: learned.filter((id) => listDuas().some((d) => d.id === id)).length, total, favourites: favourites.length })}
        </AppText>
      </HeroHeader>

      <View style={styles.body}>
        <View style={styles.segment} accessibilityRole="tablist">
          {(['all', 'favourites', 'learned'] as const).map((f) => {
            const active = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                <AppText variant="small" color={active ? c.onPrimary : c.text} align="center">
                  {t(`duas.filter.${f}`)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {shown.length === 0 ? (
          <EmptyState icon={filter === 'favourites' ? 'heart' : 'check'} title={t(filter === 'favourites' ? 'duas.emptyFavourites' : 'duas.emptyLearned')} />
        ) : null}

        {shown.map(([theme, duas]) => (
          <View key={theme} style={styles.group}>
            <SectionHeader title={t(duaThemeKey(theme))} />
            {duas.map((dua) => {
              const isLearned = learned.includes(dua.id);
              const isFavourite = favourites.includes(dua.id);
              return (
                <Card
                  key={dua.id}
                  onPress={() => router.push({ pathname: '/tools/duas/[id]', params: { id: dua.id } })}
                  accessibilityLabel={`${l(dua.title)}, ${dua.surah.nameTransliterated} ${dua.ref}${isLearned ? `, ${t('duas.learned')}` : ''}${isFavourite ? `, ${t('duas.filter.favourites')}` : ''}`}
                >
                  <View style={styles.row}>
                    <View style={styles.texts}>
                      <AppText variant="bodyBold">{l(dua.title)}</AppText>
                      <AppText variant="heading" script="quran" numberOfLines={1} align="right">
                        {dua.ayahs[0]?.arabic}
                      </AppText>
                      <View style={styles.badges}>
                        <View style={styles.ref}>
                          <AppText variant="tiny" color={c.goldText}>
                            {dua.surah.nameTransliterated} {dua.ref}
                          </AppText>
                        </View>
                        {isLearned ? <Icon name="check" size={18} color={c.success} strokeWidth={3} /> : null}
                        {isFavourite ? <Icon name="heart" size={18} color={c.error} /> : null}
                      </View>
                    </View>
                    <Icon name="chevron" size={20} color={c.textMuted} />
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

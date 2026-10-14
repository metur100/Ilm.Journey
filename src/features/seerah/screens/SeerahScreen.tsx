import { router, type Href } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { KindLegend } from '../components/Blocks';
import { EpisodeCard } from '../components/Cards';
import { SearchBar } from '../components/Controls';
import { TodaysSeerahCard } from '../components/TodaysSeerah';
import { EPISODES } from '../content';
import { useSeerahI18n } from '../i18n';
import type { SeerahKey } from '../i18n';
import { openNode } from '../navigation';
import { seerahReviewCenter } from '../services/review';
import { continueEpisode, exploration } from '../services/progress';
import { CONTENT_COUNTS, pickSeerah, useSeerahStore } from '../store/seerahStore';
import { SEERAH_ACCENT, SEERAH_GRADIENT } from '../theme';

const ENTRIES: readonly { key: string; icon: IconName; label: SeerahKey; href: Href }[] = [
  { key: 'timeline', icon: 'timeline', label: 'nav.timeline', href: '/seerah/timeline' },
  { key: 'map', icon: 'map', label: 'nav.map', href: '/seerah/map' },
  { key: 'people', icon: 'people', label: 'explore.people', href: { pathname: '/seerah/list/[type]', params: { type: 'person' } } },
  { key: 'explore', icon: 'compass', label: 'nav.explore', href: '/seerah/explore' },
  { key: 'search', icon: 'search', label: 'search.title', href: '/seerah/search' },
  { key: 'bookmarks', icon: 'bookmark', label: 'bookmarks.title', href: '/seerah/bookmarks' },
  { key: 'reflections', icon: 'feather', label: 'profile.reflections', href: '/seerah/reflections' },
  { key: 'review', icon: 'refresh', label: 'review.title', href: '/seerah/review' },
];

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 64 },
  tileIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: SEERAH_ACCENT },
  flex: { flex: 1 },
}));

/**
 * Seerah tab (sira's journey): overview with progress, continue, quick entries to timeline, map,
 * people, explore, search, bookmarks, reflections and review, Today's Seerah and all ten episodes.
 */
export default function SeerahScreen() {
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const data = useSeerahStore((s) => s);
  const review = useAppStore((s) => s.review);
  const seerah = pickSeerah(data);
  const stats = exploration(seerah, CONTENT_COUNTS);
  const current = continueEpisode(seerah, EPISODES);
  const currentStep = current ? seerah.episodes[current.id]?.step : undefined;
  const due = seerahReviewCenter(review, new Date().toISOString()).due.length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <HeroHeader gradient={SEERAH_GRADIENT}>
        <AppText variant="display" color={c.onAccent} accessibilityRole="header">
          {t('tab.title')}
        </AppText>
        <AppText variant="body" color={c.onAccent}>
          {t('app.tagline')}
        </AppText>
        <View style={styles.progressRow}>
          <AppText variant="bodyBold" color={c.onAccent}>
            {t('home.episodes', { done: stats.episodesCompleted, total: stats.episodesTotal })}
          </AppText>
          <AppText variant="bodyBold" color={c.onAccent}>
            {t('home.explored', { percent: stats.explored })}
          </AppText>
        </View>
        <ProgressBar
          progress={stats.explored / 100}
          color={c.gold}
          trackColor={c.overlay}
          accessibilityLabel={`${t('home.progress')}: ${t('home.explored', { percent: stats.explored })}`}
        />
      </HeroHeader>

      <View style={styles.body}>
        <SearchBar value="" placeholder={t('search.placeholder')} onPress={() => router.push('/seerah/search')} />

        {current ? (
          <View style={styles.section}>
            <SectionHeader title={currentStep ? t('home.continue') : t('home.start')} />
            <EpisodeCard episode={current} />
            <Button
              label={currentStep ? `${t('episode.continue')} · ${t(`episode.step.${currentStep}`)}` : t('episode.start')}
              icon="play"
              onPress={() => openNode('episode', current.id)}
            />
          </View>
        ) : (
          <Card tone="gold">
            <AppText variant="body">{t('home.allDone')}</AppText>
          </Card>
        )}

        <View style={styles.section}>
          <SectionHeader title={t('tab.quick')} />
          <View style={styles.grid}>
            {ENTRIES.map((entry) => {
              const label = t(entry.label);
              const extra = entry.key === 'review' && due > 0 ? t('home.reviewDue', { count: due }) : null;
              return (
                <Card key={entry.key} style={styles.tile} onPress={() => router.push(entry.href)} accessibilityLabel={extra ? `${label}, ${extra}` : label}>
                  <View style={styles.tileIcon}>
                    <Icon name={entry.icon} size={20} color={c.onAccent} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{label}</AppText>
                    {extra ? (
                      <AppText variant="tiny" color={c.goldText}>
                        {extra}
                      </AppText>
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <TodaysSeerahCard />

        <View style={styles.section}>
          <SectionHeader title={t('tab.journey')} />
          {EPISODES.map((e) => (
            <EpisodeCard key={e.id} episode={e} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('tab.accuracy')} />
          <KindLegend />
          <AppText variant="small" color={c.textMuted}>
            {t('tab.accuracyNote')}
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}

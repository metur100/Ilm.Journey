import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { CharacterCard } from '@/core/components/character/CharacterCard';
import { KnowledgeList } from '@/core/components/game/KnowledgeRadar';
import { QuestCard } from '@/core/components/game/QuestCard';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { StreakDisplay } from '@/core/components/ui/StreakDisplay';
import { XPBar } from '@/core/components/ui/XPBar';
import { useSummary } from '@/core/hooks/useProgress';
import { type CoreKey, useI18n } from '@/core/i18n';
import { getDailyCandidates, getHomeSections } from '@/core/registry';
import { dailyChallengeFor } from '@/core/services/daily';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
}));

/**
 * Home: greeting + hero, Continue, daily challenge, reviews, today's quests, feature sections
 * (e.g. "Today's Seerah" registered by the Seerah feature), knowledge and recently completed.
 */
export default function Home() {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const profile = useAppStore((s) => s.profile);
  const xp = useAppStore((s) => s.xp);
  const quests = useAppStore((s) => s.quests);
  const summary = useSummary();
  const daily = useMemo(
    () => dailyChallengeFor(summary.today, getDailyCandidates(), summary.pendingReviewKeys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary.today, summary.pendingReviewKeys, summary.version],
  );
  const openQuests = quests.filter((q) => !q.completed);
  const next = summary.continueItem;

  const coreSections: { order: number; key: string; node: React.ReactNode }[] = [
    {
      order: 10,
      key: 'continue',
      node: next ? (
        <Card tone="primary" onPress={() => router.push(next.href)} accessibilityLabel={`${t('home.continue')}: ${l(next.title)}${next.subtitle ? `, ${l(next.subtitle)}` : ''}`}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: next.topicArea ? topicThemes[next.topicArea].accent : c.primary }]}>
              <Icon name={next.icon} size={26} color={c.onAccent} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color={c.primaryText}>
                {t('home.continue').toUpperCase()}
              </AppText>
              <AppText variant="heading">{l(next.title)}</AppText>
              {next.subtitle ? (
                <AppText variant="small" color={c.textMuted}>
                  {l(next.subtitle)}
                </AppText>
              ) : null}
              {next.progress !== undefined ? <ProgressBar progress={next.progress} height={6} /> : null}
            </View>
            <Icon name="play" size={24} color={c.primaryText} />
          </View>
        </Card>
      ) : (
        <Card tone="primary" onPress={() => router.push('/(tabs)/learn')} accessibilityLabel={`${t('home.start')}: ${t('home.startBody')}`}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: c.primary }]}>
              <Icon name="book" size={26} color={c.onPrimary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color={c.primaryText}>
                {t('home.start').toUpperCase()}
              </AppText>
              <AppText variant="body">{t('home.startBody')}</AppText>
            </View>
            <Icon name="chevron" size={22} color={c.primaryText} />
          </View>
        </Card>
      ),
    },
    {
      order: 20,
      key: 'daily',
      node: (
        <Card tone="gold" onPress={() => router.push('/daily')} accessibilityLabel={`${t('home.daily')}: ${t(`daily.kind.${daily.kind}` as CoreKey)}`}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: c.gold }]}>
              <Icon name={summary.dailyDone ? 'check' : 'sun'} size={26} color={c.onGold} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color={c.goldText}>
                {t('home.daily').toUpperCase()}
              </AppText>
              <AppText variant="heading">{t(`daily.kind.${daily.kind}` as CoreKey)}</AppText>
              {summary.dailyDone ? (
                <AppText variant="small" color={c.textMuted}>
                  {t('home.dailyDone')}
                </AppText>
              ) : null}
            </View>
            <Icon name="chevron" size={22} color={c.goldText} />
          </View>
        </Card>
      ),
    },
    {
      order: 30,
      key: 'review',
      node: (
        <Card onPress={() => router.push('/review')} accessibilityLabel={t('home.review')}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: c.infoSoft }]}>
              <Icon name="refresh" size={24} color={c.info} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold">{t('home.review')}</AppText>
              <AppText variant="small" color={c.textMuted}>
                {summary.dueCount > 0 ? t('home.reviewCount', { count: summary.dueCount }) : t('home.reviewNone')}
              </AppText>
            </View>
            <Icon name="chevron" size={22} color={c.textMuted} />
          </View>
        </Card>
      ),
    },
    {
      order: 40,
      key: 'quests',
      node:
        openQuests.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={t('home.quests')} />
            {quests.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </View>
        ) : null,
    },
    {
      order: 60,
      key: 'knowledge',
      node: (
        <View style={styles.section}>
          <SectionHeader title={t('home.knowledge')} actionLabel={t('tabs.learn')} onAction={() => router.push('/(tabs)/learn')} />
          <Card>
            <KnowledgeList topics={summary.topics} />
          </Card>
        </View>
      ),
    },
    {
      order: 80,
      key: 'recent',
      node:
        summary.recentlyCompleted.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={t('home.recent')} />
            <Card>
              {summary.recentlyCompleted.map((item) => (
                <View key={item.key} style={styles.recentRow} accessible accessibilityLabel={l(item.title)}>
                  <Icon name={item.icon} size={22} color={item.topicArea ? topicThemes[item.topicArea].accent : c.primaryText} />
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{l(item.title)}</AppText>
                    {item.subtitle ? (
                      <AppText variant="tiny" color={c.textMuted}>
                        {l(item.subtitle)}
                      </AppText>
                    ) : null}
                  </View>
                  <Icon name="check" size={20} color={c.success} />
                </View>
              ))}
            </Card>
          </View>
        ) : null,
    },
  ];

  const featureSections = getHomeSections().map((s) => ({ order: s.order, key: `feature-${s.id}`, node: <s.Component /> }));
  const sections = [...coreSections, ...featureSections].sort((a, b) => a.order - b.order);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <CharacterCard character={profile.character} name={profile.name} level={summary.level.level} dark />
          </View>
          <StreakDisplay days={summary.streak} activeToday={summary.activeToday} compact dark />
        </View>
        <AppText variant="heading" color={c.onNight}>
          {t(profile.learnerGroup === 'child' ? 'home.greeting.child' : 'home.greeting', { name: profile.name })}
        </AppText>
        <XPBar xp={xp} dark />
      </HeroHeader>
      <View style={styles.body}>
        {sections.map((s) => (s.node ? <React.Fragment key={s.key}>{s.node}</React.Fragment> : null))}
      </View>
    </ScrollView>
  );
}

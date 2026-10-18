import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { useCollection } from '@/core/collection';
import { CharacterCard } from '@/core/components/character/CharacterCard';
import { useGarden } from '@/core/components/garden/useGarden';
import { KnowledgeList, KnowledgeRadar } from '@/core/components/game/KnowledgeRadar';
import { AppText } from '@/core/components/ui/AppText';
import { Badge } from '@/core/components/ui/Badge';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { LinkRow } from '@/core/components/ui/SettingRow';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { StreakDisplay } from '@/core/components/ui/StreakDisplay';
import { XPBar } from '@/core/components/ui/XPBar';
import { useSummary } from '@/core/hooks/useProgress';
import { type CoreKey, useI18n } from '@/core/i18n';
import { getProfileLinks } from '@/core/registry';
import { BADGES } from '@/core/services/badges';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  note: { marginTop: spacing.sm },
  radarCard: { gap: spacing.md },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48.5%', backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: c.border },
  // Left-aligned: with space-between a half-filled last row was pushed apart to both edges.
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  links: { gap: 0 },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: { flex: 1, alignItems: 'center', gap: spacing.xs },
}));

/**
 * Me (v2 profile): hero with the character (level wardrobe, level, XP) first, right below it "More" (settings, review
 * centre, feature links, about), then streak, Ilm Garden and collection album, knowledge radar, badges, statistics.
 */
export default function Profile() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const profile = useAppStore((s) => s.profile);
  const xp = useAppStore((s) => s.xp);
  const stats = useAppStore((s) => s.stats);
  const streak = useAppStore((s) => s.streak);
  const badges = useAppStore((s) => s.badges);
  const dailyCompleted = useAppStore((s) => s.dailyCompleted);
  const summary = useSummary();
  const collection = useCollection();
  const garden = useGarden();
  const accuracy = stats.questionsAnswered ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
  const earned = BADGES.filter((b) => badges[b.id]);
  const preview = [...earned, ...BADGES.filter((b) => !badges[b.id])].slice(0, 6);

  const statItems = [
    { label: t('stats.answers'), value: String(stats.correctAnswers) },
    { label: t('stats.accuracy'), value: `${accuracy}%` },
    { label: t('stats.longest'), value: t(streak.longest === 1 ? 'streak.day' : 'streak.days', { count: streak.longest }) },
    { label: t('stats.reviews'), value: String(stats.reviewsCorrect) },
    { label: t('stats.daily'), value: String(dailyCompleted.length) },
    { label: t('stats.badges'), value: `${earned.length}/${BADGES.length}` },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={c.onNight} accessibilityRole="header">
          {t('profile.title')}
        </AppText>
        <CharacterCard character={profile.character} name={profile.name} level={summary.level.level} size={104} dark />
        <AppText variant="small" color={c.onNightMuted}>
          {t('profile.learner', { group: t(`learner.${profile.learnerGroup}` as CoreKey) })}
        </AppText>
        <Button label={t('profile.edit')} variant="light" icon="pencil" onPress={() => router.push('/character')} />
        <XPBar xp={xp} dark />
      </HeroHeader>

      <View style={styles.body}>
        {/* The hero (character) comes first, "More" (settings and links) right below it. */}
        <SectionHeader title={t('profile.more')} />
        <Card style={styles.links}>
          <LinkRow icon="settings" label={t('profile.settings')} onPress={() => router.push('/settings')} />
          <LinkRow
            icon="refresh"
            label={t('profile.review')}
            value={summary.dueCount > 0 ? String(summary.dueCount) : undefined}
            onPress={() => router.push('/review')}
          />
          {getProfileLinks().map((link) => (
            <LinkRow key={link.id} icon={link.icon} label={link.label(language)} onPress={() => router.push(link.href)} />
          ))}
          <LinkRow icon="info" label={t('settings.about')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'about' } })} />
          <LinkRow icon="shield" label={t('settings.privacy')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'privacy' } })} />
          <LinkRow icon="book" label={t('settings.sources')} onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'sources' } })} />
        </Card>

        <Card>
          <StreakDisplay days={summary.streak} activeToday={summary.activeToday} />
          <AppText variant="tiny" color={c.textMuted} style={styles.note}>
            {t('streak.note')}
          </AppText>
        </Card>

        <View style={styles.tiles}>
          <Card style={styles.tile} onPress={() => router.push('/garden')} accessibilityLabel={`${t('garden.title')}: ${t('me.gardenCount', { count: garden.garden.placed.length })}, ${garden.stateLabel}`}>
            <Art name="garden.palm" size={64} />
            <AppText variant="bodyBold" align="center">
              {t('garden.title')}
            </AppText>
            <AppText variant="tiny" color={c.textMuted} align="center">
              {t('me.gardenCount', { count: garden.garden.placed.length })}
            </AppText>
          </Card>
          <Card style={styles.tile} onPress={() => router.push('/collection')} accessibilityLabel={`${t('collection.title')}: ${t('collection.progress', { count: collection.progress.unlocked, total: collection.progress.total })}`}>
            <Art name="pattern.star" size={64} />
            <AppText variant="bodyBold" align="center">
              {t('collection.title')}
            </AppText>
            <AppText variant="tiny" color={collection.newCount > 0 ? c.goldText : c.textMuted} align="center">
              {collection.newCount > 0 ? t('me.newCards', { count: collection.newCount }) : t('collection.progress', { count: collection.progress.unlocked, total: collection.progress.total })}
            </AppText>
          </Card>
        </View>

        <SectionHeader title={t('profile.knowledgeMap')} />
        <Card style={styles.radarCard}>
          <KnowledgeRadar topics={summary.topics} />
          <KnowledgeList topics={summary.topics} />
          <AppText variant="tiny" color={c.textMuted}>
            {t('profile.knowledgeNote')}
          </AppText>
        </Card>

        <SectionHeader title={t('profile.badges')} actionLabel={t('common.seeAll')} onAction={() => router.push('/badges')} />
        <Pressable onPress={() => router.push('/badges')} accessibilityRole="button" accessibilityLabel={`${t('profile.badges')}: ${t('badges.count', { earned: earned.length, total: BADGES.length })}`}>
          <Card>
            <View style={styles.badges}>
              {preview.map((b) => (
                <Badge key={b.id} id={b.id} earned={!!badges[b.id]} size={64} />
              ))}
            </View>
          </Card>
        </Pressable>

        <SectionHeader title={t('profile.stats')} />
        <View style={styles.statGrid}>
          {statItems.map((s) => (
            <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
              <AppText variant="title" color={c.primaryText}>
                {s.value}
              </AppText>
              <AppText variant="tiny" color={c.textMuted}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

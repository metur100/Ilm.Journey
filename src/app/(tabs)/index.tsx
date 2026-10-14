import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Art } from '@/core/art';
import { Avatar } from '@/core/components/character/Avatar';
import { QuestCard } from '@/core/components/game/QuestCard';
import { GardenScene } from '@/core/components/garden/GardenScene';
import { useGarden } from '@/core/components/garden/useGarden';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { Stars } from '@/core/components/ui/Stars';
import { totalStars, useGameOfTheDay, useGamesStore } from '@/core/games';
import { useGardenStore } from '@/core/garden';
import { skyForDate } from '@/core/garden/sky';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useSummary } from '@/core/hooks/useProgress';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { translateNs, useI18n } from '@/core/i18n';
import type { Quest } from '@/core/models';
import { getHomeSections } from '@/core/registry';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  hero: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  overlayTop: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  panel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(20,23,58,0.62)', borderRadius: radius.lg, padding: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.goldSoft, overflow: 'hidden', alignItems: 'center' },
  flex: { flex: 1, gap: 2 },
  streak: { alignItems: 'center', backgroundColor: 'rgba(20,23,58,0.62)', borderRadius: radius.lg, padding: spacing.sm, minWidth: 64, minHeight: 64, justifyContent: 'center' },
  overlayBottom: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  gardenButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(20,23,58,0.62)', borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: TOUCH_TARGET },
  waterButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: c.gold, borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: TOUCH_TARGET },
  spacer: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  gameCard: { borderRadius: radius.xl, overflow: 'hidden' },
  gameInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 130 },
  pill: { alignSelf: 'flex-start', backgroundColor: c.gold, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 3 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
}));

/** Where a quest of the day leads when tapped (daily challenge, a game); null = not directly openable. */
function questHref(quest: Quest): Href | null {
  if (quest.goal.type === 'dailyChallenge') return '/daily';
  if (quest.goal.type === 'reviewAnswers') return '/review';
  if (quest.goal.type === 'complete' && /^game:[^:]+$/.test(quest.goal.target)) {
    return { pathname: '/game/[id]', params: { id: quest.goal.target.slice(5) } };
  }
  return null;
}

/**
 * Home (v2): the Ilm Garden as the hero (sky follows the real time of day, the garden grows with learning) with
 * level and streak on top → game of the day → continue → today's quests → reviews due → feature sections
 * (e.g. "Today's Seerah").
 */
export default function Home() {
  const { t, l, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const feedback = useFeedback();
  const profile = useAppStore((s) => s.profile);
  const quests = useAppStore((s) => s.quests);
  const summary = useSummary();
  const garden = useGarden();
  const waterPlants = useGardenStore((s) => s.waterPlants);
  const game = useGameOfTheDay();
  const games = useGamesStore((s) => s.games);
  const sky = skyForDate(new Date());
  useStatusBar(sky === 'night' || sky === 'sunset');

  const next = summary.continueItem;
  const heroHeight = 300 + insets.top;

  const water = () => {
    if (waterPlants()) feedback.success();
  };

  const coreSections: { order: number; key: string; node: React.ReactNode }[] = [
    {
      order: 5,
      key: 'game-of-the-day',
      node: game ? (
        <Pressable
          onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${t('play.gameOfDay')}: ${translateNs(game.i18n, language, 'title')}`}
          style={({ pressed }) => [styles.gameCard, pressed && styles.pressed]}
        >
          <LinearGradient colors={topicThemes[game.topicId].gradient} style={styles.gameInner}>
            <View style={styles.flex}>
              <View style={styles.pill}>
                <AppText variant="label" color={c.onGold}>
                  {t('play.gameOfDay').toUpperCase()}
                </AppText>
              </View>
              <AppText variant="heading" color={c.onAccent}>
                {translateNs(game.i18n, language, 'title')}
              </AppText>
              <AppText variant="small" color={c.onAccent} numberOfLines={2}>
                {translateNs(game.i18n, language, 'description')}
              </AppText>
              <Stars count={Math.min(3, Math.round(totalStars({ games, challengeMode: false }, game.id) / Math.max(1, game.levels.length)))} size={16} dark />
            </View>
            <Art name={game.coverArt} size={100} />
          </LinearGradient>
        </Pressable>
      ) : null,
    },
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
      key: 'quests',
      node:
        quests.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={t('home.quests')} />
            {quests.map((q) => {
              const href = q.completed ? null : questHref(q);
              return <QuestCard key={q.id} quest={q} onPress={href ? () => router.push(href) : undefined} />;
            })}
          </View>
        ) : null,
    },
    {
      order: 30,
      key: 'review',
      node: (
        <Card onPress={() => router.push('/review')} accessibilityLabel={`${t('home.review')}: ${summary.dueCount > 0 ? t('home.reviewCount', { count: summary.dueCount }) : t('home.reviewNone')}`}>
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
  ];

  const featureSections = getHomeSections().map((s) => ({ order: s.order, key: `feature-${s.id}`, node: <s.Component /> }));
  const sections = [...coreSections, ...featureSections].sort((a, b) => a.order - b.order);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <GardenScene placed={garden.garden.placed} thirst={garden.thirst} height={heroHeight} rounded={false} topInset={insets.top + 92} accessibilityLabel={garden.a11y}>
          <View style={[styles.overlayTop, { top: insets.top + spacing.sm }]}>
            <View style={styles.panel}>
              <View style={styles.avatar}>
                <Avatar character={profile.character} size={46} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyBold" color={c.onNight} numberOfLines={2}>
                  {t(profile.learnerGroup === 'child' ? 'home.greeting.child' : 'home.greeting', { name: profile.name })}
                </AppText>
                <AppText variant="tiny" color={c.gold}>
                  {t('common.level', { level: summary.level.level })}
                </AppText>
                <ProgressBar progress={summary.level.progress} height={5} color={c.gold} trackColor="rgba(255,255,255,0.25)" accessibilityLabel={t('a11y.xpBar', { xp: summary.level.xpIntoLevel, total: summary.level.xpForNextLevel })} />
              </View>
            </View>
            <View style={styles.streak} accessible accessibilityLabel={`${t('streak.label')}: ${t(summary.streak === 1 ? 'streak.day' : 'streak.days', { count: summary.streak })}`}>
              <Icon name="flame" size={22} color={summary.activeToday ? c.gold : c.onNightMuted} />
              <AppText variant="bodyBold" color={c.onNight}>
                {summary.streak}
              </AppText>
            </View>
          </View>
          <View style={styles.overlayBottom}>
            <Pressable
              onPress={() => router.push('/garden')}
              accessibilityRole="button"
              accessibilityLabel={`${t('home.openGarden')}. ${t('garden.seedsCount', { count: garden.garden.seeds })}. ${garden.stateLabel}`}
              style={styles.gardenButton}
            >
              <Art name="garden.seed" size={22} />
              <AppText variant="small" color={c.onNight}>
                {`${t('home.openGarden')} · ${garden.garden.seeds}`}
              </AppText>
              <Icon name="chevron" size={16} color={c.onNight} />
            </Pressable>
            <View style={styles.spacer} />
            {garden.canWater ? (
              <Pressable onPress={water} accessibilityRole="button" accessibilityLabel={t('garden.water')} style={styles.waterButton}>
                <Art name="garden.watering-can" size={30} />
                <AppText variant="bodyBold" color={c.onGold}>
                  {t('garden.water')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </GardenScene>
      </View>
      <View style={styles.body}>
        {sections.map((s) => (s.node ? <React.Fragment key={s.key}>{s.node}</React.Fragment> : null))}
      </View>
    </ScrollView>
  );
}

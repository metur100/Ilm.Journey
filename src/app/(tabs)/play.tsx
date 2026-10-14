import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { Stars } from '@/core/components/ui/Stars';
import { EmptyState } from '@/core/components/ui/States';
import { type GameDef, isNewGame, totalStars, useGameOfTheDay, useGames, useGamesStore } from '@/core/games';
import { topicName, translateNs, useI18n } from '@/core/i18n';
import { TOPIC_IDS, type TopicId } from '@/core/models';
import { makeStyles, radius, shadows, spacing, topicThemes, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.xl },
  hero: { borderRadius: radius.xl, overflow: 'hidden', ...shadows(c.shadow).raised },
  heroInner: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 170 },
  heroText: { flex: 1, gap: spacing.xs },
  pill: { alignSelf: 'flex-start', backgroundColor: c.gold, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  topic: { gap: spacing.md },
  topicHeader: { borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shelf: { gap: spacing.md, paddingRight: spacing.lg },
  card: { width: 200, backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, overflow: 'hidden', ...shadows(c.shadow).card },
  cardArt: { height: 150, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.md, gap: 4 },
  newBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: c.gold, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
}));

/** Play tab: the illustrated game shelf grouped by topic, with "Game of the day", stars and "New" markers. */
export default function PlayScreen() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const games = useGames();
  const today = useGameOfTheDay();
  const data = useGamesStore((s) => s.games);
  const challengeMode = useGamesStore((s) => s.challengeMode);
  const state = { games: data, challengeMode };

  const byTopic = useMemo(() => TOPIC_IDS.map((topic) => ({ topic, games: games.filter((g) => g.topicId === topic) })).filter((g) => g.games.length > 0), [games]);
  const title = (g: GameDef<unknown>) => translateNs(g.i18n, language, 'title');
  const open = (g: GameDef<unknown>) => router.push({ pathname: '/game/[id]', params: { id: g.id } });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={c.onNight} accessibilityRole="header">
          {t('play.title')}
        </AppText>
        <AppText variant="body" color={c.onNightMuted}>
          {t('play.subtitle')}
        </AppText>
      </HeroHeader>

      <View style={styles.body}>
        {games.length === 0 ? <EmptyState icon="star" title={t('play.emptyTitle')} body={t('play.emptyBody')} /> : null}

        {today ? (
          <Pressable
            onPress={() => open(today)}
            accessibilityRole="button"
            accessibilityLabel={`${t('play.gameOfDay')}: ${title(today)}. ${translateNs(today.i18n, language, 'description')}`}
            style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
          >
            <LinearGradient colors={topicThemes[today.topicId].gradient} style={styles.heroInner}>
              <View style={styles.heroText}>
                <View style={styles.pill}>
                  <AppText variant="label" color={c.onGold}>
                    {t('play.gameOfDay').toUpperCase()}
                  </AppText>
                </View>
                <AppText variant="title" color={c.onAccent}>
                  {title(today)}
                </AppText>
                <AppText variant="small" color={c.onAccent} numberOfLines={3}>
                  {translateNs(today.i18n, language, 'description')}
                </AppText>
                <Stars count={Math.min(3, Math.round(totalStars(state, today.id) / Math.max(1, today.levels.length)))} size={18} dark />
              </View>
              <Art name={today.coverArt} size={130} />
            </LinearGradient>
          </Pressable>
        ) : null}

        {byTopic.map(({ topic, games: list }) => (
          <TopicShelf key={topic} topic={topic}>
            {list.map((g) => {
              const stars = totalStars(state, g.id);
              const isNew = isNewGame(state, g.id);
              return (
                <Pressable
                  key={g.id}
                  onPress={() => open(g)}
                  accessibilityRole="button"
                  accessibilityLabel={`${title(g)}${isNew ? `, ${t('play.new')}` : ''}. ${t('games.totalStars', { count: stars, total: g.levels.length * 3 })}`}
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  <LinearGradient colors={[topicThemes[g.topicId].gradient[1], topicThemes[g.topicId].gradient[0]]} style={styles.cardArt}>
                    <Art name={g.coverArt} size={120} />
                  </LinearGradient>
                  {isNew ? (
                    <View style={styles.newBadge}>
                      <AppText variant="label" color={c.onGold}>
                        {t('play.new').toUpperCase()}
                      </AppText>
                    </View>
                  ) : null}
                  <View style={styles.cardBody}>
                    <AppText variant="bodyBold" numberOfLines={1}>
                      {title(g)}
                    </AppText>
                    <AppText variant="tiny" color={c.textMuted} numberOfLines={2}>
                      {translateNs(g.i18n, language, 'description')}
                    </AppText>
                    <AppText variant="tiny" color={c.goldText}>
                      {`★ ${t('games.totalStars', { count: stars, total: g.levels.length * 3 })}`}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </TopicShelf>
        ))}
      </View>
    </ScrollView>
  );
}

function TopicShelf({ topic, children }: { topic: TopicId; children: ReactNode }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const theme = topicThemes[topic];
  return (
    <View style={styles.topic}>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topicHeader}>
        <Icon name={theme.icon} size={22} color={c.onAccent} />
        <AppText variant="heading" color={c.onAccent} accessibilityRole="header">
          {t(topicName(topic))}
        </AppText>
      </LinearGradient>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
        {children}
      </ScrollView>
    </View>
  );
}

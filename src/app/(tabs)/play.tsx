import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Stars } from '@/core/components/ui/Stars';
import { EmptyState } from '@/core/components/ui/States';
import {
  DEV_SECTION,
  type GameDef,
  PLAY_SECTIONS,
  playI18n,
  type PlaySectionId,
  sectionGames,
  sectionStats,
  SHOW_DEV_GAMES,
  totalStars,
  useGameOfTheDay,
  useGames,
  useGamesStore,
} from '@/core/games';
import { SectionCard } from '@/core/games/play/PlayCards';
import { translateNs, useI18n } from '@/core/i18n';
import { makeStyles, radius, shadows, spacing, topicThemes, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  hero: { borderRadius: radius.xl, overflow: 'hidden', ...shadows(c.shadow).raised },
  heroInner: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 170 },
  heroText: { flex: 1, gap: spacing.xs },
  pill: { alignSelf: 'flex-start', backgroundColor: c.gold, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
}));

/** Play tab: game of the day + the sections (Salah, Quran, Arabic / Sufara, …) as cards → section screen. */
export default function PlayScreen() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const games = useGames();
  const today = useGameOfTheDay();
  const data = useGamesStore((s) => s.games);
  const challengeMode = useGamesStore((s) => s.challengeMode);
  const state = useMemo(() => ({ games: data, challengeMode }), [data, challengeMode]);
  const [width, setWidth] = useState(0);

  const sections = useMemo(() => {
    const ids: PlaySectionId[] = [...PLAY_SECTIONS, ...(SHOW_DEV_GAMES ? [DEV_SECTION as PlaySectionId] : [])];
    return ids.map((id) => ({ id, stats: sectionStats(sectionGames(id, games), state) })).filter((s) => s.id !== DEV_SECTION || s.stats.games > 0);
  }, [games, state]);

  const title = (g: GameDef<unknown>) => translateNs(g.i18n, language, 'title');
  const open = (g: GameDef<unknown>) => router.push({ pathname: '/game/[id]', params: { id: g.id } });
  const cardW = width > 0 ? Math.floor((width - spacing.md) / 2) : 150;

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
              <Art name={today.coverArt} size={120} />
            </LinearGradient>
          </Pressable>
        ) : null}

        <AppText variant="heading" accessibilityRole="header">
          {translateNs(playI18n, language, 'sections')}
        </AppText>
        <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {sections.map(({ id, stats }) => (
            <SectionCard key={id} section={id} stats={stats} width={cardW} onPress={() => router.push({ pathname: '/play/[section]', params: { section: id } })} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

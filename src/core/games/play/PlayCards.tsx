import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Art } from '../../art';
import { star8Path } from '../../art/kit';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { translateNs, useI18n } from '../../i18n';
import type { TopicId } from '../../models';
import { radius, shadows, spacing, topicThemes, useTheme } from '../../theme';
import { kitColors } from '../kit/theme';
import { levelProgress, totalStars, type GamesData } from '../progress';
import { playI18n, SECTION_ART, type PlaySectionId, type SectionStats } from '../sections';
import { GAME_LEVELS, type GameDef } from '../types';

const topicOf = (section: PlaySectionId): TopicId => (section === 'dev' ? 'salah' : section);

/** Section card of the Play tab: topic gradient, cover art, games count and stars progress. */
export function SectionCard({ section, stats, onPress, width }: { section: PlaySectionId; stats: SectionStats; onPress: () => void; width: number }) {
  const { language } = useI18n();
  const { c } = useTheme();
  const pt = (key: keyof typeof playI18n.dictionaries.en, params?: Record<string, string | number>) => translateNs(playI18n, language, key, params);
  const title = pt(`section.${section}` as keyof typeof playI18n.dictionaries.en);
  const theme = topicThemes[topicOf(section)];
  const fraction = stats.maxStars > 0 ? stats.stars / stats.maxStars : 0;
  const count = stats.games === 1 ? pt('gamesOne') : pt('games', { count: stats.games });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${count}. ${pt('stars', { count: stats.stars, total: stats.maxStars })}`}
      testID={`section-${section}`}
      style={({ pressed }) => [styles.sectionCard, { width, shadowColor: c.shadow }, pressed && styles.pressed]}
    >
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sectionInner}>
        <Svg width={110} height={110} viewBox="0 0 120 120" style={styles.sectionDeco} pointerEvents="none">
          <Path d={star8Path(60, 60, 54)} fill="none" stroke={c.onAccent} strokeOpacity={0.14} strokeWidth={3} />
        </Svg>
        <View style={styles.sectionTop}>
          <View style={styles.sectionArt}>
            <Art name={SECTION_ART[section]} size={58} height={58} />
          </View>

        </View>
        <AppText variant="heading" color={c.onAccent} numberOfLines={2} accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="tiny" color={c.onAccent} style={styles.dim}>
          {count}
        </AppText>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%`, backgroundColor: c.gold }]} />
        </View>
        <View style={styles.starsRow}>
          <Icon name="star" size={13} color={c.gold} />
          <AppText variant="tiny" color={c.onAccent}>{`${stats.stars}/${stats.maxStars}`}</AppText>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Game card of a section grid: cover art on the topic board colours, title, level dots and stars. */
export function GameCard({ game, data, onPress, width }: { game: GameDef<unknown>; data: GamesData; onPress: () => void; width: number }) {
  const { language, t } = useI18n();
  const { c, dark, highContrast } = useTheme();
  const k = kitColors(c, game.topicId, dark, highContrast);
  const title = translateNs(game.i18n, language, 'title');
  const stars = totalStars(data, game.id);
  const max = game.levels.length * 3;
  const done = GAME_LEVELS.filter((l) => l <= game.levels.length && !!levelProgress(data, game.id, l)).length;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${t('games.totalStars', { count: stars, total: max })}`}
      testID={`game-card-${game.id}`}
      style={({ pressed }) => [styles.gameCard, { width, backgroundColor: c.surface, borderColor: c.border, shadowColor: c.shadow }, pressed && styles.pressed]}
    >
      <LinearGradient colors={k.board} style={styles.gameArt}>
        <Art name={game.coverArt} size={Math.min(104, width - 40)} />
      </LinearGradient>
      <View style={styles.gameBody}>
        <AppText variant="bodyBold" numberOfLines={2} style={styles.gameTitle}>
          {title}
        </AppText>
        <View style={styles.gameMeta}>
          <View style={styles.levelDots}>
            {game.levels.map(({ level }) => (
              <View key={level} style={[styles.levelDot, { backgroundColor: level <= done ? k.accent : c.track, borderColor: level <= done ? k.accent : c.border }]} />
            ))}
          </View>
          <View style={styles.starsRow}>
            <Icon name="star" size={13} color={stars > 0 ? c.gold : c.locked} />
            <AppText variant="tiny" color={c.textMuted}>{`${stars}/${max}`}</AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  sectionCard: { borderRadius: radius.lg, ...shadows('#000').card },
  sectionInner: { borderRadius: radius.lg, padding: spacing.md, gap: 4, minHeight: 186, overflow: 'hidden' },
  sectionDeco: { position: 'absolute', right: -30, bottom: -34 },
  sectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  sectionArt: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.88 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: 6, borderRadius: 3 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gameCard: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', ...shadows('#000').card },
  gameArt: { height: 124, alignItems: 'center', justifyContent: 'center' },
  gameBody: { padding: spacing.sm, gap: spacing.xs, flex: 1, justifyContent: 'space-between' },
  gameTitle: { minHeight: 44 },
  gameMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelDots: { flexDirection: 'row', gap: 4 },
  levelDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Art } from '../../art';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/States';
import { Icon } from '../../components/ui/Icon';
import { useStatusBar } from '../../hooks/useStatusBar';
import { translateNs, useI18n } from '../../i18n';
import { isTopicId } from '../../models';
import { makeStyles, spacing, useTheme } from '../../theme';
import { useGames } from '../hooks';
import { GameHeader } from '../shell/GameHeader';
import { DEV_SECTION, playI18n, type PlaySectionId, sectionGames, sectionStats } from '../sections';
import { useGamesStore } from '../store';
import { GameCard } from './PlayCards';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
}));

/** A Play section: header (topic gradient, stars), the Sufara path link in Arabic, and a grid of game cards. */
export function SectionScreen({ section }: { section: string }) {
  const { language, t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const games = useGames();
  const data = useGamesStore((s) => s.games);
  const challengeMode = useGamesStore((s) => s.challengeMode);
  const [width, setWidth] = useState(0);
  useStatusBar(true);

  const id: PlaySectionId = isTopicId(section) ? section : DEV_SECTION;
  const list = useMemo(() => sectionGames(id, games), [id, games]);
  const stats = useMemo(() => sectionStats(list, { games: data, challengeMode }), [list, data, challengeMode]);
  const pt = (key: keyof typeof playI18n.dictionaries.en, params?: Record<string, string | number>) => translateNs(playI18n, language, key, params);
  const cardW = width > 0 ? Math.floor((width - spacing.md) / 2) : 150;
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/play'));

  return (
    <View style={styles.root}>
      <GameHeader
        title={pt(`section.${id}` as keyof typeof playI18n.dictionaries.en)}
        subtitle={`${stats.games === 1 ? pt('gamesOne') : pt('games', { count: stats.games })} · ${pt('stars', { count: stats.stars, total: stats.maxStars })}`}
        topic={id === DEV_SECTION ? 'salah' : id}
        onBack={leave}
        backLabel={t('a11y.back')}
        progress={stats.maxStars > 0 ? stats.stars / stats.maxStars : 0}
        progressLabel={pt('stars', { count: stats.stars, total: stats.maxStars })}
      />
      <ScrollView contentContainerStyle={styles.body}>
        {id === 'arabic' ? (
          <Card tone="gold" onPress={() => router.push('/sufara')} accessibilityLabel={`${pt('sufaraTitle')}. ${pt('sufaraBody')}`}>
            <View style={styles.row}>
              <Art name="object.book" size={56} />
              <View style={styles.flex}>
                <AppText variant="bodyBold">{pt('sufaraTitle')}</AppText>
                <AppText variant="small" color={c.textMuted}>
                  {pt('sufaraBody')}
                </AppText>
              </View>
              <Icon name="chevron" size={20} color={c.goldText} />
            </View>
          </Card>
        ) : null}
        {list.length === 0 ? <EmptyState icon="star" title={pt('soon')} /> : null}
        <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {list.map((g) => (
            <GameCard key={g.id} game={g} data={{ games: data, challengeMode }} width={cardW} onPress={() => router.push({ pathname: '/game/[id]', params: { id: g.id } })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

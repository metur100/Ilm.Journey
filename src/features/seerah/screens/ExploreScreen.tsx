import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { ConnectionView } from '../components/ConnectionView';
import { SearchBar } from '../components/Controls';
import { EPISODES, EVENTS, getEvent, PEOPLE, PLACES, SEERAH_CONTENT, THEMES } from '../content';
import { useSeerahI18n } from '../i18n';
import { openConnections, openNode } from '../navigation';
import { connectionChain } from '../services/connections';
import { SEERAH_GRADIENT } from '../theme';

const CATEGORIES = [
  { type: 'person', icon: 'people', label: 'explore.people', count: PEOPLE.length },
  { type: 'place', icon: 'pin', label: 'explore.places', count: PLACES.length },
  { type: 'event', icon: 'calendar', label: 'explore.events', count: EVENTS.length },
  { type: 'theme', icon: 'tag', label: 'explore.themes', count: THEMES.length },
  { type: 'episode', icon: 'book', label: 'explore.episodes', count: EPISODES.length },
] as const satisfies readonly { type: string; icon: IconName; label: string; count: number }[];

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  heroTop: { marginHorizontal: -spacing.lg, marginTop: -spacing.lg },
  body: { padding: spacing.lg, gap: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '46%', flexGrow: 1, gap: 6 },
  section: { gap: spacing.md },
}));

/** People, places, events, themes and episodes – and how they connect. */
export default function ExploreScreen() {
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const example = getEvent('hijrah');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={SEERAH_GRADIENT}>
        <View style={styles.heroTop}>
          <TopBar dark />
        </View>
        <AppText variant="display" color={c.onAccent} accessibilityRole="header">
          {t('explore.title')}
        </AppText>
        <AppText variant="body" color={c.onAccent}>
          {t('explore.subtitle')}
        </AppText>
      </HeroHeader>
      <View style={styles.body}>
        <SearchBar value="" placeholder={t('search.placeholder')} onPress={() => router.push('/seerah/search')} />

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.type}
              style={styles.tile}
              onPress={() => router.push({ pathname: '/seerah/list/[type]', params: { type: cat.type } })}
              accessibilityLabel={`${t(cat.label)}, ${cat.count}`}
            >
              <Icon name={cat.icon} size={26} color={c.goldText} />
              <AppText variant="bodyBold">{t(cat.label)}</AppText>
              <AppText variant="tiny" color={c.textMuted}>
                {cat.count}
              </AppText>
            </Card>
          ))}
          <Card style={styles.tile} onPress={() => router.push('/seerah/bookmarks')} accessibilityLabel={t('explore.bookmarks')}>
            <Icon name="bookmark" size={26} color={c.goldText} />
            <AppText variant="bodyBold">{t('explore.bookmarks')}</AppText>
          </Card>
        </View>

        {example ? (
          <View style={styles.section}>
            <SectionHeader title={t('connections.title')} actionLabel={t('common.seeAll')} onAction={() => openConnections('event', example.id)} />
            <AppText variant="small" color={c.textMuted}>
              {t('connections.chain')} – {l(example.title)}
            </AppText>
            <ConnectionView
              groups={connectionChain(example.id, SEERAH_CONTENT)}
              titles={[t('type.event'), t('explore.people'), t('explore.places'), t('event.related')]}
              onNodePress={(type, id) => (type === 'event' && id === example.id ? openNode(type, id) : openConnections(type, id))}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

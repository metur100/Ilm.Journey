import { useLocalSearchParams } from 'expo-router';
import { type ReactElement, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { EpisodeCard, EventCard, PersonCard, PlaceCard } from '../components/Cards';
import { SearchBar } from '../components/Controls';
import { EPISODES, EVENTS, PEOPLE, PLACES, THEMES } from '../content';
import { useSeerahI18n } from '../i18n';
import { openNode } from '../navigation';
import { normalize } from '../services/search';

const TITLES = {
  person: 'explore.people',
  place: 'explore.places',
  event: 'explore.events',
  theme: 'explore.themes',
  episode: 'explore.episodes',
} as const;

type ListType = keyof typeof TITLES;

interface Row {
  id: string;
  name: string;
  render: () => ReactElement;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingBottom: spacing.md },
  sep: { height: spacing.md },
  theme: { gap: spacing.xs },
}));

/** Browsable list of people, places, events, themes or episodes, with a quick filter. */
export default function ListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  useStatusBar();
  const [query, setQuery] = useState('');
  const listType: ListType | null = type && type in TITLES ? (type as ListType) : null;

  const rows = useMemo<Row[]>(() => {
    switch (listType) {
      case 'person':
        return PEOPLE.map((p) => ({ id: p.id, name: l(p.name), render: () => <PersonCard person={p} /> }));
      case 'place':
        return PLACES.map((p) => ({ id: p.id, name: l(p.name), render: () => <PlaceCard place={p} /> }));
      case 'event':
        return EVENTS.map((e) => ({ id: e.id, name: l(e.title), render: () => <EventCard event={e} /> }));
      case 'episode':
        return EPISODES.map((e) => ({ id: e.id, name: l(e.title), render: () => <EpisodeCard episode={e} /> }));
      case 'theme':
        return THEMES.map((th) => ({
          id: th.id,
          name: l(th.name),
          render: () => (
            <Card onPress={() => openNode('theme', th.id)} accessibilityLabel={`${l(th.name)}. ${l(th.description)}`} style={styles.theme}>
              <AppText variant="heading">{l(th.name)}</AppText>
              <AppText variant="small" color={c.textMuted}>
                {l(th.description)}
              </AppText>
            </Card>
          ),
        }));
      default:
        return [];
    }
  }, [listType, l, c, styles]);

  const filtered = query.trim() ? rows.filter((r) => normalize(r.name).includes(normalize(query))) : rows;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar title={t(listType ? TITLES[listType] : 'explore.title')} />
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => item.render()}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchBar value={query} onChangeText={setQuery} placeholder={t(listType ? TITLES[listType] : 'explore.title')} />
          </View>
        }
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

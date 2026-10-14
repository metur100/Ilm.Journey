import { router } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { searchAll, type SearchResult } from '@/core/registry';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { ConnectionCard } from '../components/Cards';
import { SearchBar } from '../components/Controls';
import { SEERAH_CONTENT } from '../content';
import { useSeerahI18n } from '../i18n';
import { search, type SearchHit } from '../services/search';

type Row = { kind: 'seerah'; hit: SearchHit; firstRelated: boolean } | { kind: 'other'; result: SearchResult; first: boolean };

const useStyles = makeStyles(() => ({
  root: { flex: 1 },
  bar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sep: { height: spacing.sm },
  item: { gap: spacing.sm },
  heading: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  hint: { padding: spacing.sm },
}));

/**
 * Search: the Seerah (episodes, events, people, places, themes – names in every language, related
 * events of a matching person or place) first, then everything else in the app via `searchAll`.
 */
export default function SearchScreen() {
  const { t, language } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  useStatusBar();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);

  const rows = useMemo<Row[]>(() => {
    const hits = search(deferred, language, SEERAH_CONTENT);
    const others = searchAll(deferred, language).filter((r) => r.feature !== 'seerah');
    return [
      ...hits.map((hit, i): Row => ({ kind: 'seerah', hit, firstRelated: hit.related && (i === 0 || !hits[i - 1].related) })),
      ...others.map((result, i): Row => ({ kind: 'other', result, first: i === 0 })),
    ];
  }, [deferred, language]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]} edges={['top', 'left', 'right']}>
      <TopBar title={t('search.title')} />
      <View style={styles.bar}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} autoFocus />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => (r.kind === 'seerah' ? `seerah-${r.hit.type}-${r.hit.id}` : r.result.key)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) =>
          item.kind === 'seerah' ? (
            <View style={styles.item}>
              {item.firstRelated ? (
                <AppText variant="label" color={c.goldText} style={styles.heading} accessibilityRole="header">
                  {t('search.related').toUpperCase()}
                </AppText>
              ) : null}
              <ConnectionCard type={item.hit.type} id={item.hit.id} />
            </View>
          ) : (
            <View style={styles.item}>
              {item.first ? (
                <AppText variant="label" color={c.primaryText} style={styles.heading} accessibilityRole="header">
                  {t('search.everywhere').toUpperCase()}
                </AppText>
              ) : null}
              <Card onPress={() => router.push(item.result.href)} accessibilityLabel={item.result.subtitle ? `${item.result.title}, ${item.result.subtitle}` : item.result.title}>
                <View style={styles.row}>
                  <Icon name={item.result.icon} size={20} color={c.primaryText} />
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{item.result.title}</AppText>
                    {item.result.subtitle ? (
                      <AppText variant="tiny" color={c.textMuted}>
                        {item.result.subtitle}
                      </AppText>
                    ) : null}
                  </View>
                  <Icon name="chevron" size={18} color={c.textMuted} />
                </View>
              </Card>
            </View>
          )
        }
        ListEmptyComponent={
          query.trim().length >= 2 ? (
            <EmptyState icon="search" title={t('search.empty', { query: query.trim() })} />
          ) : (
            <AppText variant="small" color={c.textMuted} style={styles.hint}>
              {t('search.hint')}
            </AppText>
          )
        }
      />
    </SafeAreaView>
  );
}

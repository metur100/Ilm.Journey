import { useMemo, useState } from 'react';
import { ScrollView, SectionList, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { TimelineItem } from '../components/Cards';
import { FilterChip } from '../components/Controls';
import { EVENTS, THEMES } from '../content';
import { useSeerahI18n } from '../i18n';
import type { Era } from '../models';
import { ERA_ORDER, timelineSections } from '../services/timeline';
import { SEERAH_GRADIENT } from '../theme';

type Filter = { kind: 'all' } | { kind: 'era'; era: Era } | { kind: 'theme'; id: string };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  heroTop: { marginHorizontal: -spacing.lg, marginTop: -spacing.lg },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  legend: { paddingHorizontal: spacing.lg },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  item: { paddingHorizontal: spacing.lg },
  list: { paddingBottom: spacing.xxl },
}));

/** The 28 events of the Seerah in order, grouped by era, with era and theme filters. */
export default function TimelineScreen() {
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [filter, setFilter] = useState<Filter>({ kind: 'all' });

  const sections = useMemo(
    () =>
      timelineSections(EVENTS, (e) => (filter.kind === 'all' ? true : filter.kind === 'era' ? e.era === filter.era : e.themeIds.includes(filter.id))).map((s) => ({
        era: s.era,
        data: s.events,
      })),
    [filter],
  );
  const isSel = (f: Filter) => JSON.stringify(f) === JSON.stringify(filter);

  return (
    <View style={styles.root}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        windowSize={7}
        ListHeaderComponent={
          <View style={styles.header}>
            <HeroHeader gradient={SEERAH_GRADIENT}>
              <View style={styles.heroTop}>
                <TopBar dark />
              </View>
              <AppText variant="display" color={c.onAccent} accessibilityRole="header">
                {t('timeline.title')}
              </AppText>
              <AppText variant="body" color={c.onAccent}>
                {t('timeline.subtitle')}
              </AppText>
            </HeroHeader>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <FilterChip label={t('timeline.all')} selected={isSel({ kind: 'all' })} onPress={() => setFilter({ kind: 'all' })} />
              {ERA_ORDER.map((era) => (
                <FilterChip key={era} label={t(`era.${era}`)} selected={isSel({ kind: 'era', era })} onPress={() => setFilter({ kind: 'era', era })} />
              ))}
              {THEMES.map((th) => (
                <FilterChip key={th.id} icon="tag" label={l(th.name)} selected={isSel({ kind: 'theme', id: th.id })} onPress={() => setFilter({ kind: 'theme', id: th.id })} />
              ))}
            </ScrollView>
            <AppText variant="small" color={c.textMuted} style={styles.legend}>
              {t('timeline.legend')}
            </AppText>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="label" color={c.goldText} style={styles.sectionHeader} accessibilityRole="header">
            {t(`era.${section.era}`).toUpperCase()}
          </AppText>
        )}
        renderItem={({ item, index, section }) => (
          <View style={styles.item}>
            <TimelineItem event={item} first={index === 0} last={index === section.data.length - 1} />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

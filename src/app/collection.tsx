import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { categoryKey, type CollectionEntry, useCollection, useCollectionStore } from '@/core/collection';
import { CATEGORY_ICON, categoryColor, CollectionCardDetail, CollectionCardTile } from '@/core/components/collection/CollectionCardView';
import { AppModal } from '@/core/components/ui/AppModal';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useI18n } from '@/core/i18n';
import { COLLECTION_CATEGORIES, type CollectionCategory } from '@/core/models';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

const MAX_CONTENT = 720;

const useStyles = makeStyles((c) => ({
  summary: { gap: spacing.sm },
  tabs: { gap: spacing.sm, paddingVertical: 2 },
  tab: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  tabPressed: { opacity: 0.85 },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
}));

const isCategory = (value: unknown): value is CollectionCategory => typeof value === 'string' && (COLLECTION_CATEGORIES as readonly string[]).includes(value);

/** Collection album: progress, category tabs and a grid of cards (tap → flip card or "How to unlock"). */
export default function CollectionScreen() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ card?: string; category?: string }>();
  const { entries, progress } = useCollection();
  const markSeen = useCollectionStore((s) => s.markSeen);

  const initialCard = typeof params.card === 'string' ? entries.find((e) => e.card.id === params.card) : undefined;
  const [category, setCategory] = useState<CollectionCategory>(
    initialCard?.card.category ?? (isCategory(params.category) ? params.category : COLLECTION_CATEGORIES[0]),
  );
  const [openId, setOpenId] = useState<string | null>(initialCard?.card.id ?? null);

  const visible = useMemo(() => entries.filter((e) => e.card.category === category), [entries, category]);
  const open = openId ? entries.find((e) => e.card.id === openId) : undefined;
  const openUnlockedId = open?.unlocked ? open.card.id : null;

  // Opening an unlocked card removes its "New" marker.
  useEffect(() => {
    if (openUnlockedId) markSeen(openUnlockedId);
  }, [openUnlockedId, markSeen]);

  const columns = width >= 600 ? 4 : 3;
  const contentWidth = Math.min(width, MAX_CONTENT) - spacing.lg * 2;
  const tileWidth = Math.floor((contentWidth - spacing.md * (columns - 1)) / columns);

  const openCard = (entry: CollectionEntry) => setOpenId(entry.card.id);

  return (
    <Screen header={<TopBar title={t('collection.title')} />}>
      <View style={styles.summary}>
        <AppText variant="bodyBold" align="center">
          {t('collection.progress', { count: progress.unlocked, total: progress.total })}
        </AppText>
        <ProgressBar
          progress={progress.total > 0 ? progress.unlocked / progress.total : 0}
          color={c.gold}
          accessibilityLabel={t('collection.progress', { count: progress.unlocked, total: progress.total })}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {COLLECTION_CATEGORIES.map((cat) => {
          const selected = cat === category;
          const counts = progress.categories[cat];
          const name = t(categoryKey(cat));
          const hasNew = entries.some((e) => e.card.category === cat && e.isNew);
          const fg = selected ? c.onAccent : c.text;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={t('collection.a11y.tab', { category: name, count: counts.unlocked, total: counts.total })}
              style={({ pressed }) => [styles.tab, selected && { backgroundColor: categoryColor(cat), borderColor: categoryColor(cat) }, pressed && styles.tabPressed]}
            >
              <Icon name={CATEGORY_ICON[cat]} size={18} color={fg} />
              <AppText variant="small" color={fg}>
                {name}
              </AppText>
              <AppText variant="tiny" color={selected ? c.onAccent : c.textMuted}>
                {t('collection.categoryProgress', { count: counts.unlocked, total: counts.total })}
              </AppText>
              {hasNew ? <View style={styles.newDot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.length === 0 ? (
        <EmptyState icon={CATEGORY_ICON[category]} title={t('collection.emptyTitle')} body={t('collection.emptyBody')} />
      ) : (
        <View style={styles.grid}>
          {visible.map((entry) => (
            <CollectionCardTile key={entry.card.id} entry={entry} width={tileWidth} onPress={openCard} />
          ))}
        </View>
      )}

      <AppModal visible={!!open} onClose={() => setOpenId(null)}>
        {open ? <CollectionCardDetail card={open.card} unlocked={open.unlocked} onClose={() => setOpenId(null)} /> : null}
      </AppModal>
    </Screen>
  );
}

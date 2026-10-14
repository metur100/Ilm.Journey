import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { SourceCard } from '../components/Blocks';
import { ConnectionCard } from '../components/Cards';
import { getSource } from '../content';
import { useSeerahI18n } from '../i18n';
import type { BookmarkType } from '../models';
import { useSeerahStore } from '../store/seerahStore';

const ORDER: readonly BookmarkType[] = ['episode', 'event', 'person', 'place', 'source'];

const useStyles = makeStyles(() => ({
  section: { gap: spacing.sm },
}));

/** My Bookmarks – episodes, events, people, places and sources. */
export default function BookmarksScreen() {
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const bookmarks = useSeerahStore((s) => s.bookmarks);

  return (
    <Screen header={<TopBar title={t('bookmarks.title')} />}>
      {bookmarks.length === 0 ? (
        <EmptyState icon="bookmark" title={t('bookmarks.title')} body={t('bookmarks.empty')} />
      ) : (
        ORDER.map((type) => {
          const items = bookmarks.filter((b) => b.type === type);
          if (!items.length) return null;
          return (
            <View key={type} style={styles.section}>
              <AppText variant="label" color={c.textMuted} accessibilityRole="header">
                {`${t(`type.${type}`)} · ${items.length}`.toUpperCase()}
              </AppText>
              {items.map((b) => {
                if (b.type === 'source') {
                  const source = getSource(b.id);
                  return source ? <SourceCard key={b.id} source={source} compact /> : null;
                }
                return <ConnectionCard key={`${b.type}-${b.id}`} type={b.type} id={b.id} />;
              })}
            </View>
          );
        })
      )}
    </Screen>
  );
}

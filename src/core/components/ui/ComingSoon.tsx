import { ScrollView, View } from 'react-native';

import { makeStyles, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { HeroHeader } from './HeroHeader';
import { EmptyState } from './States';
import type { IconName } from './Icon';

/** Placeholder tab content until a feature port lands. */
export function ComingSoon({ title, body, icon }: { title: string; body: string; icon: IconName }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader>
        <AppText variant="display" color={c.onNight} accessibilityRole="header">
          {title}
        </AppText>
      </HeroHeader>
      <View style={styles.body}>
        <EmptyState icon={icon} title={title} body={body} />
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg },
}));

import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing } from '@/core/theme';

import { ConnectionCard, EpisodeCard } from '../components/Cards';
import { ChapterHeader } from '../components/Controls';
import { episodesOfTheme, eventsOfTheme, getTheme } from '../content';
import { useSeerahI18n } from '../i18n';
import { sortChronologically } from '../services/timeline';

const useStyles = makeStyles(() => ({
  section: { gap: spacing.md },
}));

export default function ThemeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const theme = getTheme(String(id));

  if (!theme) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="tag" title={t('theme.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const episodes = episodesOfTheme(theme.id);
  const events = sortChronologically(eventsOfTheme(theme.id));

  return (
    <Screen header={<TopBar title={t('type.theme')} />}>
      <ChapterHeader label={t('type.theme')} title={l(theme.name)} subtitle={l(theme.description)} />
      {episodes.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('theme.episodes')} />
          {episodes.map((e) => (
            <EpisodeCard key={e.id} episode={e} />
          ))}
        </View>
      ) : null}
      {events.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('theme.events')} />
          {events.map((e) => (
            <ConnectionCard key={e.id} type="event" id={e.id} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

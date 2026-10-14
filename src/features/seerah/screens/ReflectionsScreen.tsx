import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { ReflectionCard } from '../components/ReflectionCard';
import { EPISODES } from '../content';
import { useSeerahI18n } from '../i18n';
import { useSeerahStore } from '../store/seerahStore';

const useStyles = makeStyles(() => ({
  section: { gap: spacing.sm },
}));

/** All saved reflections, grouped by episode, editable in place. */
export default function ReflectionsScreen() {
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const reflections = useSeerahStore((s) => s.reflections);
  const episodes = EPISODES.filter((e) => e.reflectionQuestions.some((q) => reflections[q.id]));

  return (
    <Screen header={<TopBar title={t('profile.reflections')} />}>
      {episodes.length === 0 ? (
        <EmptyState icon="feather" title={t('profile.reflections')} body={t('reflection.note')} />
      ) : (
        <>
          <AppText variant="small" color={c.textMuted}>
            {t('reflection.note')}
          </AppText>
          {episodes.map((e) => (
            <View key={e.id} style={styles.section}>
              <AppText variant="label" color={c.textMuted} accessibilityRole="header">
                {`${t('episode.label', { number: e.order })} · ${l(e.title)}`.toUpperCase()}
              </AppText>
              {e.reflectionQuestions
                .filter((q) => reflections[q.id])
                .map((q) => (
                  <ReflectionCard key={q.id} question={q} episodeId={e.id} />
                ))}
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

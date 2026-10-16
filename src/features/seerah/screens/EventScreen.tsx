import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { StoryStage } from '@/core/components/scene/StoryStage';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { BlockView, SourceCard } from '../components/Blocks';
import { ConnectionCard } from '../components/Cards';
import { BookmarkButton, ChapterHeader, FilterChip } from '../components/Controls';
import { getEvent, getSource, getTheme, resolve } from '../content';
import { useSeerahI18n } from '../i18n';
import { openConnections, openNode } from '../navigation';
import { eventStage } from '../stages';
import { useSeerahStore } from '../store/seerahStore';

const useStyles = makeStyles(() => ({
  section: { gap: spacing.sm },
  card: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
}));

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const event = getEvent(String(id));
  const discover = useSeerahStore((s) => s.discover);

  useEffect(() => {
    if (event) discover('event', [event.id]);
  }, [event, discover]);

  if (!event) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="calendar" title={t('event.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={t('type.event')} right={<BookmarkButton type="event" id={event.id} />} />}>
      {eventStage(event) ? <StoryStage stage={eventStage(event)} height={190} /> : null}
      <ChapterHeader label={t(`era.${event.era}`)} title={l(event.title)} />
      <Card tone="alt" style={styles.card}>
        <AppText variant="label" color={c.textMuted}>
          {t('event.date').toUpperCase()}
        </AppText>
        <AppText variant="heading" color={c.goldText}>
          {l(event.date.label)}
        </AppText>
        <AppText variant="tiny" color={event.date.certainty === 'established' ? c.success : c.goldText}>
          {t(`certainty.${event.date.certainty}`)}
        </AppText>
        {event.date.note ? (
          <AppText variant="small" color={c.textMuted}>
            {l(event.date.note)}
          </AppText>
        ) : null}
      </Card>

      <SectionHeader title={t('event.summary')} />
      {event.summary.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}

      <Button label={t('connections.title')} variant="secondary" icon="link" onPress={() => openConnections('event', event.id)} />

      {event.peopleIds.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('event.people')} />
          {event.peopleIds.map((pid) => (
            <ConnectionCard key={pid} type="person" id={pid} />
          ))}
        </View>
      ) : null}
      {event.placeIds.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('event.places')} />
          {event.placeIds.map((pid) => (
            <ConnectionCard key={pid} type="place" id={pid} />
          ))}
        </View>
      ) : null}
      {event.episodeId ? (
        <View style={styles.section}>
          <SectionHeader title={t('event.episode')} />
          <ConnectionCard type="episode" id={event.episodeId} />
        </View>
      ) : null}
      {event.relatedEventIds.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('event.related')} />
          {event.relatedEventIds.map((eid) => (
            <ConnectionCard key={eid} type="event" id={eid} />
          ))}
        </View>
      ) : null}
      {event.themeIds.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('event.themes')} />
          <View style={styles.chips}>
            {resolve(event.themeIds, getTheme).map((th) => (
              <FilterChip key={th.id} icon="tag" label={l(th.name)} selected={false} onPress={() => openNode('theme', th.id)} />
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.section}>
        <SectionHeader title={t('event.sources')} />
        {resolve(event.sourceIds, getSource).map((s) => (
          <SourceCard key={s.id} source={s} compact />
        ))}
      </View>
    </Screen>
  );
}

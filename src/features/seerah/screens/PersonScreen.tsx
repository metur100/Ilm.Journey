import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { BlockView, SourceCard } from '../components/Blocks';
import { ConnectionCard, PersonInitial } from '../components/Cards';
import { BookmarkButton, Ornament } from '../components/Controls';
import { PersonName } from '../components/PersonName';
import { episodesOfPerson, eventsOfPerson, getPerson, getSource, resolve } from '../content';
import { useSeerahI18n } from '../i18n';
import { openConnections } from '../navigation';
import { useSeerahStore } from '../store/seerahStore';

const useStyles = makeStyles(() => ({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { gap: spacing.sm },
  card: { gap: spacing.xs },
}));

/** A person of the Seerah – represented by typography only, never by a portrait or silhouette. */
export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const person = getPerson(String(id));
  const discover = useSeerahStore((s) => s.discover);

  useEffect(() => {
    if (person) discover('person', [person.id]);
  }, [person, discover]);

  if (!person) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="people" title={t('person.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const events = eventsOfPerson(person.id);
  const episodes = episodesOfPerson(person.id);

  return (
    <Screen header={<TopBar title={t('type.person')} right={<BookmarkButton type="person" id={person.id} />} />}>
      <View style={styles.head}>
        <PersonInitial person={person} size={64} />
        <View style={styles.flex}>
          <PersonName person={person} variant="title" />
          <AppText variant="body" color={c.goldText} script="arabic">
            {person.arabicName}
          </AppText>
        </View>
      </View>
      <Ornament color={c.goldText} />
      <Card tone="alt" style={styles.card}>
        <AppText variant="label" color={c.textMuted}>
          {t('person.role').toUpperCase()}
        </AppText>
        <AppText variant="body">{l(person.role)}</AppText>
        <AppText variant="label" color={c.textMuted}>
          {t('person.relationship').toUpperCase()}
        </AppText>
        <AppText variant="body">{l(person.relationship)}</AppText>
      </Card>

      <SectionHeader title={t('person.biography')} />
      {person.bio.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}

      <Button label={t('connections.title')} variant="secondary" icon="link" onPress={() => openConnections('person', person.id)} />

      {events.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('person.events')} />
          {events.map((e) => (
            <ConnectionCard key={e.id} type="event" id={e.id} />
          ))}
        </View>
      ) : null}
      {episodes.length ? (
        <View style={styles.section}>
          <SectionHeader title={t('person.episodes')} />
          {episodes.map((e) => (
            <ConnectionCard key={e.id} type="episode" id={e.id} />
          ))}
        </View>
      ) : null}
      <View style={styles.section}>
        <SectionHeader title={t('event.sources')} />
        {resolve(person.sourceIds, getSource).map((s) => (
          <SourceCard key={s.id} source={s} compact />
        ))}
      </View>
    </Screen>
  );
}

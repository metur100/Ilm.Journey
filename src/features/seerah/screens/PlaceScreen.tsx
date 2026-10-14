import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/core/components/ui/Button';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { makeStyles, spacing } from '@/core/theme';

import { BlockView, SourceCard } from '../components/Blocks';
import { HistoricalMap } from '../components/HistoricalMap';
import { PlaceDetails } from '../components/PlaceDetails';
import { getPlace, getSource, PLACES, resolve } from '../content';
import { useSeerahI18n } from '../i18n';
import { openConnections } from '../navigation';
import { useSeerahStore } from '../store/seerahStore';

const MAP_PLACES = PLACES.filter((p) => p.coords);

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.sm },
}));

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useSeerahI18n();
  const styles = useStyles();
  useStatusBar();
  const place = getPlace(String(id));
  const discover = useSeerahStore((s) => s.discover);
  // The page pauses scrolling while the map is dragged or pinched.
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    if (place) discover('place', [place.id]);
  }, [place, discover]);

  if (!place) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="pin" title={t('place.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar title={t('type.place')} />
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false}>
        {place.coords ? (
          <HistoricalMap
            places={MAP_PLACES}
            routes={[]}
            selectedId={place.id}
            height={220}
            showRoutes={false}
            onInteraction={(active) => setScrollEnabled(!active)}
            onSelect={(pid) => {
              if (pid !== place.id) router.replace({ pathname: '/seerah/place/[id]', params: { id: pid } });
            }}
          />
        ) : null}
        <PlaceDetails place={place} />
        <SectionHeader title={t('place.description')} />
        {place.description.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
        <Button label={t('connections.title')} variant="secondary" icon="link" onPress={() => openConnections('place', place.id)} />
        {place.sourceIds.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('event.sources')} />
            {resolve(place.sourceIds, getSource).map((s) => (
              <SourceCard key={s.id} source={s} compact />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

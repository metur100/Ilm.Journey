import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { FilterChip, IconButton } from '../components/Controls';
import { HistoricalMap, type MapHandle } from '../components/HistoricalMap';
import { PlaceDetails } from '../components/PlaceDetails';
import { getPlace, PLACES, ROUTES } from '../content';
import { useSeerahI18n } from '../i18n';
import { useSeerahStore } from '../store/seerahStore';
import { mapColors, precisionColor } from '../theme';

const MAP_PLACES = PLACES.filter((p) => p.coords);

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs },
  legend: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, backgroundColor: c.surface, borderColor: c.border },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
  square: { width: 14, height: 14, borderWidth: 2 },
  routeSample: { width: 22, borderTopWidth: 2.5, borderStyle: 'dashed', borderColor: c.goldText },
  mapWrap: { paddingHorizontal: spacing.lg },
  chipRow: { flexGrow: 0 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  details: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
}));

/** Map of the Hijaz with all Seerah places, approximate routes and a legend. */
export default function MapScreen() {
  const { t, l } = useSeerahI18n();
  const { c, dark } = useTheme();
  const styles = useStyles();
  useStatusBar();
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ place?: string }>();
  const discover = useSeerahStore((s) => s.discover);
  const [selectedId, setSelectedId] = useState<string | null>(params.place ?? null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [legend, setLegend] = useState(false);
  const mapRef = useRef<MapHandle>(null);
  const selected = selectedId ? getPlace(selectedId) : undefined;
  const sea = mapColors(dark).sea;

  const select = (id: string, focus: boolean) => {
    setSelectedId(id);
    discover('place', [id]);
    if (focus) mapRef.current?.focus(id);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar
        title={t('map.title')}
        right={
          <View style={styles.legendRow}>
            <IconButton icon="route" label={t('map.showRoutes')} selected={showRoutes} onPress={() => setShowRoutes((v) => !v)} color={showRoutes ? c.goldText : c.textMuted} />
            <IconButton icon="info" label={t('map.legend')} selected={legend} onPress={() => setLegend((v) => !v)} color={legend ? c.goldText : c.textMuted} />
          </View>
        }
      />
      <View style={styles.header}>
        <AppText variant="tiny" color={c.textMuted} style={styles.flex}>
          {t('map.subtitle')}
        </AppText>
      </View>

      {legend ? (
        <View style={styles.legend}>
          {(['historical', 'approximate', 'modern'] as const).map((p) => (
            <View key={p} style={styles.legendRow}>
              <View
                style={[
                  p === 'modern' ? styles.square : styles.dot,
                  { borderColor: precisionColor(c, p), backgroundColor: p === 'historical' ? precisionColor(c, p) : c.surface, borderStyle: p === 'approximate' ? 'dashed' : 'solid' },
                ]}
              />
              <AppText variant="tiny" style={styles.flex}>
                {t(`map.${p}`)} – {t(`map.${p}.desc`)}
              </AppText>
            </View>
          ))}
          <View style={styles.legendRow}>
            <View style={styles.routeSample} />
            <AppText variant="tiny" style={styles.flex}>
              {t('map.route')}
            </AppText>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.square, { backgroundColor: sea, borderColor: sea }]} />
            <AppText variant="tiny" style={styles.flex}>
              {t('map.coast')}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.mapWrap}>
        <HistoricalMap
          ref={mapRef}
          places={PLACES}
          routes={ROUTES}
          selectedId={selectedId}
          onSelect={(id) => select(id, false)}
          height={Math.round(Math.max(300, windowHeight * 0.44))}
          showRoutes={showRoutes}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipRow}>
        {MAP_PLACES.map((p) => (
          <FilterChip key={p.id} label={l(p.name)} icon="pin" selected={p.id === selectedId} onPress={() => select(p.id, true)} />
        ))}
      </ScrollView>

      <ScrollView style={styles.flex} contentContainerStyle={styles.details}>
        {selected ? (
          <PlaceDetails place={selected} compact />
        ) : (
          <AppText variant="small" color={c.textMuted}>
            {t('episode.mapHint')}
          </AppText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

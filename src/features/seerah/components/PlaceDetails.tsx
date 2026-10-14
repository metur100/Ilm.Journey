import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { episodesAtPlace, eventsAtPlace, getPlace, peopleAtPlace } from '../content';
import { useSeerahI18n } from '../i18n';
import type { Place } from '../models';
import { openNode } from '../navigation';
import { distanceKm } from '../services/mapProjection';
import { precisionColor } from '../theme';
import { ConnectionCard } from './Cards';
import { BookmarkButton } from './Controls';

const useStyles = makeStyles(() => ({
  root: { gap: spacing.sm },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  precision: { borderLeftWidth: 3, paddingLeft: spacing.sm, paddingVertical: 2 },
}));

/** Location information shown when a place is selected on the map. */
export function PlaceDetails({ place, compact }: { place: Place; compact?: boolean }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const makkah = getPlace('makkah')?.coords;
  const km = makkah && place.coords && place.id !== 'makkah' ? Math.round(distanceKm(makkah, place.coords) / 5) * 5 : null;
  const events = eventsAtPlace(place.id);
  const people = peopleAtPlace(place.id).slice(0, compact ? 4 : 12);
  const episodes = episodesAtPlace(place.id);
  const color = precisionColor(c, place.precision);
  const label = (text: string) => (
    <AppText variant="label" color={c.textMuted} accessibilityRole="header">
      {text.toUpperCase()}
    </AppText>
  );

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <AppText variant="title">{l(place.name)}</AppText>
          <AppText variant="small" color={c.goldText} script="arabic">
            {place.arabicName}
          </AppText>
        </View>
        <BookmarkButton type="place" id={place.id} />
      </View>
      <View style={[styles.precision, { borderColor: color }]}>
        <AppText variant="tiny" color={color}>
          {t(`map.${place.precision}`)} – {t(`map.${place.precision}.desc`)}
        </AppText>
      </View>

      {label(t('map.whyItMatters'))}
      <AppText variant="reading">{l(place.whyItMatters)}</AppText>

      {label(t('map.howKnown'))}
      <AppText variant="small">{l(place.locationNote)}</AppText>
      {km ? (
        <AppText variant="small" color={c.textMuted}>
          {t('map.distance', { km })}
        </AppText>
      ) : null}

      {events.length ? (
        <>
          {label(t('map.events'))}
          {events.slice(0, compact ? 4 : 20).map((e) => (
            <ConnectionCard key={e.id} type="event" id={e.id} />
          ))}
        </>
      ) : null}
      {people.length ? (
        <>
          {label(t('map.people'))}
          {people.map((p) => (
            <ConnectionCard key={p.id} type="person" id={p.id} />
          ))}
        </>
      ) : null}
      {episodes.length ? (
        <>
          {label(t('map.episodes'))}
          {episodes.map((ep) => (
            <ConnectionCard key={ep.id} type="episode" id={ep.id} />
          ))}
        </>
      ) : null}
      {compact ? <Button label={t('map.openPlace')} variant="secondary" iconRight="chevron" onPress={() => openNode('place', place.id)} /> : null}
    </View>
  );
}

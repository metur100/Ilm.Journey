import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SceneView } from '@/core/components/scene/SceneView';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { getEpisode, getEvent, getPerson, getPlace, getTheme, toSceneSpec } from '../content';
import { useSeerahI18n } from '../i18n';
import type { Episode, Person, Place, SeerahEvent } from '../models';
import { openNode } from '../navigation';
import type { NodeType } from '../services/connections';
import { episodeProgress } from '../services/progress';
import { useSeerahStore } from '../store/seerahStore';
import { precisionColor, SEERAH_ACCENT } from '../theme';
import { PersonName } from './PersonName';

export const NODE_ICON: Record<NodeType | 'source', IconName> = {
  episode: 'book',
  event: 'calendar',
  person: 'feather',
  place: 'pin',
  theme: 'tag',
  source: 'scroll',
};

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  episode: { overflow: 'hidden' },
  episodeBody: { padding: spacing.lg, gap: 4 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.goldSoft },
  iconCircleAlt: { backgroundColor: c.surfaceAlt },
  initial: { borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  initialProphet: { backgroundColor: c.goldSoft },
  connection: { padding: spacing.md },
  tlRow: { flexDirection: 'row', alignItems: 'stretch' },
  tlRail: { width: 28, alignItems: 'center' },
  tlLine: { width: 2, height: 22, backgroundColor: c.border },
  tlLineFill: { flex: 1 },
  tlHidden: { backgroundColor: 'transparent' },
  tlDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: c.goldText, backgroundColor: c.background },
  tlDotDone: { backgroundColor: c.goldText },
  tlCard: { paddingBottom: spacing.md },
  tlInner: { gap: spacing.xs },
  certainty: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: c.goldSoft },
}));

export function EpisodeCard({ episode, onPress }: { episode: Episode; onPress?: () => void }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const progress = useSeerahStore((s) => s.episodes[episode.id]);
  const fraction = useSeerahStore((s) => episodeProgress(s, episode.id));
  const done = !!progress?.completedAt;
  const status = done ? `. ${t('episode.completed')}` : progress ? `. ${t('tab.stepNow', { step: t(`episode.step.${progress.step}`) })}` : '';
  return (
    <Card
      padded={false}
      onPress={onPress ?? (() => openNode('episode', episode.id))}
      style={styles.episode}
      accessibilityLabel={`${t('episode.label', { number: episode.order })}: ${l(episode.title)}. ${l(episode.subtitle)}${status}`}
    >
      <SceneView scene={toSceneSpec(episode.scene)} height={96} rounded={false} />
      <View style={styles.episodeBody}>
        <View style={styles.row}>
          <AppText variant="label" color={c.goldText} style={styles.flex}>
            {`${t('episode.label', { number: episode.order })} · ${l(episode.period)}`.toUpperCase()}
          </AppText>
          {done ? <Icon name="check" size={18} color={c.success} strokeWidth={2.6} /> : null}
        </View>
        <AppText variant="heading">{l(episode.title)}</AppText>
        <AppText variant="small" color={c.textMuted}>
          {l(episode.subtitle)}
        </AppText>
        {progress && !done ? (
          <>
            <AppText variant="tiny" color={c.primaryText}>
              {t('tab.stepNow', { step: t(`episode.step.${progress.step}`) })}
            </AppText>
            <ProgressBar progress={fraction} height={6} color={SEERAH_ACCENT} />
          </>
        ) : null}
      </View>
    </Card>
  );
}

export function EventCard({ event, compact }: { event: SeerahEvent; compact?: boolean }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const discovered = useSeerahStore((s) => !!s.discovered.event[event.id]);
  return (
    <Card onPress={() => openNode('event', event.id)} accessibilityLabel={`${t('type.event')}: ${l(event.title)}, ${l(event.date.label)}`}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Icon name="calendar" size={20} color={c.goldText} />
        </View>
        <View style={styles.flex}>
          <AppText variant="tiny" color={c.goldText}>
            {l(event.date.label)}
          </AppText>
          <AppText variant="bodyBold">{l(event.title)}</AppText>
          {!compact ? (
            <AppText variant="small" color={c.textMuted} numberOfLines={2}>
              {l(event.summary[0]?.text)}
            </AppText>
          ) : null}
        </View>
        {discovered ? <Icon name="check" size={16} color={c.success} /> : <Icon name="chevron" size={18} color={c.textMuted} />}
      </View>
    </Card>
  );
}

export function PersonCard({ person }: { person: Person }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const discovered = useSeerahStore((s) => !!s.discovered.person[person.id]);
  return (
    <Card onPress={() => openNode('person', person.id)} accessibilityLabel={`${t('type.person')}: ${l(person.name)}. ${l(person.role)}`}>
      <View style={styles.row}>
        <PersonInitial person={person} />
        <View style={styles.flex}>
          <PersonName person={person} />
          <AppText variant="small" color={c.textMuted} numberOfLines={2}>
            {l(person.role)}
          </AppText>
        </View>
        {discovered ? <Icon name="check" size={16} color={c.success} /> : <Icon name="chevron" size={18} color={c.textMuted} />}
      </View>
    </Card>
  );
}

export function PlaceCard({ place }: { place: Place }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const discovered = useSeerahStore((s) => !!s.discovered.place[place.id]);
  const color = precisionColor(c, place.precision);
  return (
    <Card onPress={() => openNode('place', place.id)} accessibilityLabel={`${t('type.place')}: ${l(place.name)}. ${t(`map.${place.precision}`)}`}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, styles.iconCircleAlt]}>
          <Icon name="pin" size={20} color={color} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyBold">{l(place.name)}</AppText>
          <AppText variant="tiny" color={color}>
            {t(`map.${place.precision}`)}
          </AppText>
          <AppText variant="small" color={c.textMuted} numberOfLines={2}>
            {l(place.whyItMatters)}
          </AppText>
        </View>
        {discovered ? <Icon name="check" size={16} color={c.success} /> : <Icon name="chevron" size={18} color={c.textMuted} />}
      </View>
    </Card>
  );
}

/** Compact card for any connected node – used in the connection view, search and bookmarks. */
export function ConnectionCard({ type, id, onPress }: { type: NodeType; id: string; onPress?: () => void }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const person = type === 'person' ? getPerson(id) : undefined;
  const place = type === 'place' ? getPlace(id) : undefined;
  const title =
    type === 'event' ? l(getEvent(id)?.title) : type === 'place' ? l(place?.name) : type === 'episode' ? l(getEpisode(id)?.title) : type === 'theme' ? l(getTheme(id)?.name) : '';
  const subtitle =
    type === 'event'
      ? l(getEvent(id)?.date.label)
      : type === 'person'
        ? l(person?.role)
        : type === 'episode'
          ? t('episode.label', { number: getEpisode(id)?.order ?? 0 })
          : place
            ? t(`map.${place.precision}`)
            : t(`type.${type}`);
  if (type === 'person' && !person) return null;
  return (
    <Card
      onPress={onPress ?? (() => openNode(type, id))}
      style={styles.connection}
      padded={false}
      accessibilityLabel={`${t(`type.${type}`)}: ${person ? l(person.name) : title}. ${subtitle}`}
    >
      <View style={styles.row}>
        {person ? <PersonInitial person={person} size={34} /> : <Icon name={NODE_ICON[type]} size={18} color={c.goldText} />}
        <View style={styles.flex}>
          {person ? <PersonName person={person} variant="small" /> : <AppText variant="bodyBold">{title}</AppText>}
          <AppText variant="tiny" color={c.textMuted} numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

/**
 * People are represented only by typography – the first letter of their name, and for the Prophet ﷺ
 * the calligraphic ﷺ – never by a portrait, silhouette or figure.
 */
export function PersonInitial({ person, size = 42 }: { person: Person; size?: number }) {
  const { c } = useTheme();
  const { l } = useSeerahI18n();
  const styles = useStyles();
  const prophet = person.honorific === 'saw';
  const letter = prophet ? 'ﷺ' : (l(person.name).replace(/^(The|Die|al-|ʿ)\s*/i, '').charAt(0) || '·').toUpperCase();
  return (
    <View
      style={[styles.initial, prophet && styles.initialProphet, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText variant={prophet ? 'bodyBold' : 'heading'} color={c.goldText} script={prophet ? 'arabic' : 'auto'} maxFontSizeMultiplier={1.2}>
        {letter}
      </AppText>
    </View>
  );
}

export function TimelineItem({ event, first, last }: { event: SeerahEvent; first?: boolean; last?: boolean }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const discovered = useSeerahStore((s) => !!s.discovered.event[event.id]);
  const certain = event.date.certainty === 'established';
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlRail}>
        <View style={[styles.tlLine, first && styles.tlHidden]} />
        <View style={[styles.tlDot, discovered && styles.tlDotDone]} />
        <View style={[styles.tlLine, styles.tlLineFill, last && styles.tlHidden]} />
      </View>
      <View style={[styles.flex, styles.tlCard]}>
        <Card onPress={() => openNode('event', event.id)} accessibilityLabel={`${l(event.date.label)}, ${t(`certainty.${event.date.certainty}`)}: ${l(event.title)}`}>
          <View style={styles.tlInner}>
            <View style={styles.row}>
              <AppText variant="bodyBold" color={c.goldText} style={styles.flex}>
                {l(event.date.label)}
              </AppText>
              {!certain ? (
                <View style={styles.certainty}>
                  <AppText variant="tiny" color={c.goldText}>
                    {t(`certainty.${event.date.certainty}`)}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText variant="heading">{l(event.title)}</AppText>
            <AppText variant="small" color={c.textMuted} numberOfLines={3}>
              {l(event.summary[0]?.text)}
            </AppText>
          </View>
        </Card>
      </View>
    </View>
  );
}

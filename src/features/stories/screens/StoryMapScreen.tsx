import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { Stars } from '@/core/components/ui/Stars';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, radius, shadows, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';

import { ProphetName, prophetLabel } from '../components/ProphetName';
import { StoryMapArt } from '../components/StoryMapArt';
import { STORIES } from '../content';
import { PLACE_IDS } from '../content/places';
import { useStoriesI18n } from '../i18n';
import type { MapPlaceId, Story } from '../models';
import { storiesByPlace } from '../services/progress';
import { storyStatus, unlockingStory } from '../services/unlocking';
import { useStoriesStore } from '../store/storiesStore';

const theme = topicThemes.prophets;
const BY_PLACE = storiesByPlace(STORIES);
const MAP_PLACES = PLACE_IDS.filter((id) => (BY_PLACE[id]?.length ?? 0) > 0);

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  topBar: { marginHorizontal: -spacing.lg, marginTop: -spacing.lg, marginBottom: -spacing.md },
  body: { padding: spacing.lg, gap: spacing.lg },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', paddingVertical: 4 },
  chip: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: c.primarySoft,
    borderWidth: 1,
    borderColor: c.primaryBorder,
  },
  timeline: { gap: spacing.lg },
  line: {
    position: 'absolute',
    left: '50%',
    top: spacing.xl,
    bottom: spacing.xl,
    width: 4,
    marginLeft: -2,
    backgroundColor: c.border,
    borderRadius: 2,
  },
  stop: { alignItems: 'flex-start', paddingRight: '18%' },
  stopRight: { alignItems: 'flex-end', paddingRight: 0, paddingLeft: '18%' },
  dot: {
    position: 'absolute',
    left: '50%',
    top: 8,
    marginLeft: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 3,
    borderColor: c.background,
  },
  dotDone: { backgroundColor: c.success },
  dotLocked: { backgroundColor: c.locked },
  card: {
    width: '100%',
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
    ...shadows(c.shadow).card,
  },
  cardLocked: { backgroundColor: c.surfaceAlt },
  pressed: { transform: [{ scale: 0.98 }] },
  dim: { opacity: 0.45 },
  cardBody: { padding: spacing.md, gap: 2 },
}));

/** Story map: the places of the stories on a simple map and the timeline of the prophets. Never a person. */
export default function StoryMapScreen() {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const stories = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);

  const placeName = (id: MapPlaceId) => t(`place.${id}`);
  const open = (story: Story) => {
    feedback.tap();
    router.push({ pathname: '/story/[id]', params: { id: story.id } });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader gradient={theme.gradient}>
        <View style={styles.topBar}>
          <TopBar dark />
        </View>
        <AppText variant="display" color={c.onAccent} accessibilityRole="header">
          {t('map.title')}
        </AppText>
        <AppText variant="body" color={c.onAccent}>
          {t('map.subtitle')}
        </AppText>
      </HeroHeader>

      <View style={styles.body}>
        <SectionHeader title={t('map.places')} />
        <StoryMapArt
          places={MAP_PLACES}
          name={placeName}
          pinState={(id) => ((BY_PLACE[id] ?? []).some((s) => stories[s.id]?.completed) ? 'highlight' : 'idle')}
          placeLabel={(id) =>
            t('map.placeStories', { place: placeName(id), stories: (BY_PLACE[id] ?? []).map((s) => l(s.prophetName)).join(', ') })
          }
        />
        <AppText variant="tiny" color={c.textMuted}>
          {t('map.placesNote')}
        </AppText>
        <Card>
          {MAP_PLACES.map((id) => (
            <View key={id} style={styles.placeRow}>
              <Icon name="pin" size={18} color={c.goldText} />
              <AppText variant="bodyBold">{placeName(id)}</AppText>
              {(BY_PLACE[id] ?? []).map((story) => (
                <Pressable
                  key={story.id}
                  onPress={() => open(story)}
                  accessibilityRole="button"
                  accessibilityLabel={`${placeName(id)}: ${prophetLabel(story, l, t)}, ${l(story.title)}`}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <AppText variant="small" color={c.primaryText}>
                    {l(story.prophetName)}
                    {story.honorific === 'sallallahu-alayhi-wa-sallam' ? ' ﷺ' : ''}
                  </AppText>
                </Pressable>
              ))}
            </View>
          ))}
        </Card>

        <SectionHeader title={t('map.timeline')} />
        <View style={styles.timeline}>
          <View style={styles.line} />
          {STORIES.map((story, index) => {
            const status = storyStatus(story, stories, STORIES);
            const previous = unlockingStory(story, STORIES);
            const inProgress = run?.storyId === story.id;
            const locked = status === 'locked';
            const lockedMessage = locked && previous ? t('map.lockedBecause', { name: l(previous.prophetName) }) : '';
            return (
              <View key={story.id} style={[styles.stop, index % 2 === 1 && styles.stopRight]}>
                <View style={[styles.dot, status === 'completed' && styles.dotDone, locked && styles.dotLocked]}>
                  {status === 'completed' ? (
                    <Icon name="check" size={16} color={c.onStatus} strokeWidth={3} />
                  ) : (
                    <AppText variant="tiny" color={c.onAccent}>
                      {index + 1}
                    </AppText>
                  )}
                </View>
                <Pressable
                  onPress={() => open(story)}
                  accessibilityRole="button"
                  accessibilityLabel={[
                    prophetLabel(story, l, t),
                    l(story.title),
                    lockedMessage || (status === 'completed' ? t('map.completed') : inProgress ? t('map.inProgress') : ''),
                  ]
                    .filter(Boolean)
                    .join('. ')}
                  style={({ pressed }) => [styles.card, locked && styles.cardLocked, pressed && styles.pressed]}
                >
                  <SceneView scene={{ sky: story.cover.sky, elements: [story.symbol] }} height={96} rounded={false} style={locked ? styles.dim : undefined} />
                  <View style={styles.cardBody}>
                    <ProphetName story={story} variant="bodyBold" />
                    <AppText variant="small" color={c.goldText}>
                      {l(story.title)}
                    </AppText>
                    <AppText variant="tiny" color={c.textMuted}>
                      {l(story.place)}
                    </AppText>
                    {status === 'completed' ? <Stars count={stories[story.id]?.bestStars ?? 0} size={14} /> : null}
                    {inProgress ? (
                      <AppText variant="tiny" color={c.primaryText}>
                        {t('map.inProgress')}
                      </AppText>
                    ) : null}
                    {lockedMessage ? <LockedContent message={lockedMessage} /> : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

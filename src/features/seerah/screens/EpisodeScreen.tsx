import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { QuestionView } from '@/core/components/questions/QuestionView';
import { StoryStage } from '@/core/components/scene/StoryStage';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { EmptyState } from '@/core/components/ui/States';
import { gameTitle, getGame } from '@/core/games';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { BlockView, SourceSections } from '../components/Blocks';
import { EventCard, PersonCard, PlaceCard, TimelineItem } from '../components/Cards';
import { ConnectionView } from '../components/ConnectionView';
import { ChapterHeader, BookmarkButton, FilterChip, IconButton } from '../components/Controls';
import { HistoricalMap } from '../components/HistoricalMap';
import { NarrationButton } from '../components/NarrationButton';
import { ReflectionCard } from '../components/ReflectionCard';
import { EPISODES, getEpisode, getEvent, getPerson, getPlace, getQuestion, getRoute, getTheme, resolve, SEERAH_CONTENT, seerahKey, toSceneSpec } from '../content';
import { useSeerahI18n } from '../i18n';
import type { Episode } from '../models';
import { openConnections, openNode } from '../navigation';
import { connectionChain } from '../services/connections';
import { CHALLENGE_INDEX, EPISODE_STEPS } from '../services/engine';
import { sortChronologically } from '../services/timeline';
import { EPISODE_GAMES } from '../games';
import { episodeStage, episodeStepStage } from '../stages';
import { type EpisodeOutcome, useSeerahStore } from '../store/seerahStore';
import { blockColors, SEERAH_ACCENT } from '../theme';

const useStyles = makeStyles((c) => ({
  fill: { flex: 1, backgroundColor: c.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xs, minHeight: 56 },
  headerText: { flex: 1, alignItems: 'center' },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
  intro: { fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  card: { gap: spacing.sm },
  routeNote: { borderLeftWidth: 3, paddingLeft: spacing.md, gap: 2, borderColor: c.goldText },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.background },
}));

export default function EpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const episode = getEpisode(String(id));
  const { t } = useSeerahI18n();
  const styles = useStyles();
  useStatusBar();
  if (!episode) {
    return (
      <SafeAreaView style={styles.fill}>
        <EmptyState icon="book" title={t('episode.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </SafeAreaView>
    );
  }
  // Keyed so that "next episode" always starts with fresh state.
  return <EpisodeJourney key={episode.id} episode={episode} />;
}

function EpisodeJourney({ episode }: { episode: Episode }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const setEpisodeStep = useSeerahStore((s) => s.setEpisodeStep);
  const discover = useSeerahStore((s) => s.discover);
  const completeEpisode = useSeerahStore((s) => s.completeEpisode);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const setPaused = useAppStore((s) => s.setCelebrationsPaused);
  const focused = useIsFocused();

  // Resume where the reader stopped; after the challenge, resume at the challenge so the quiz is not skipped.
  const [stepIndex, setStepIndex] = useState(() => {
    const progress = useSeerahStore.getState().episodes[episode.id];
    if (!progress || progress.completedAt) return 0;
    const saved = EPISODE_STEPS.indexOf(progress.step);
    return saved > CHALLENGE_INDEX ? CHALLENGE_INDEX : Math.max(0, saved);
  });
  const [quizIndex, setQuizIndex] = useState(-1);
  const [results, setResults] = useState<boolean[]>([]);
  const [answerXp, setAnswerXp] = useState(0);
  const [outcome, setOutcome] = useState<EpisodeOutcome | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const step = EPISODE_STEPS[stepIndex];
  const questions = resolve(episode.questions, getQuestion);
  const challengeDone = quizIndex >= questions.length;
  const routes = resolve(episode.routes, getRoute);
  const places = resolve(episode.places, getPlace);
  const mainEvent = getEvent(episode.mainEventId);

  // Badge / level pop-ups wait until the episode is finished.
  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  useEffect(() => {
    if (outcome) setPaused(false);
  }, [outcome, setPaused]);

  // Remember the step and record discoveries as the reader reaches them.
  useEffect(() => {
    setEpisodeStep(episode.id, step);
    if (step === 'timeline') discover('event', episode.events);
    if (step === 'people') discover('person', episode.people);
    if (step === 'locations') discover('place', episode.places);
  }, [episode, step, setEpisodeStep, discover]);

  const go = (index: number) => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setStepIndex(index);
  };

  const finish = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setOutcome(completeEpisode(episode.id, results));
  };

  if (outcome) return <EpisodeDone episode={episode} outcome={outcome} answerXp={answerXp} />;

  const stepName = t(`episode.step.${step}`);
  const stepStage = episodeStepStage(episode, step);

  const isLast = stepIndex === EPISODE_STEPS.length - 1;
  const canContinue = step !== 'challenge' || challengeDone;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/seerah'));

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="close" label={t('a11y.close')} onPress={close} />
        <View style={styles.headerText}>
          <AppText variant="tiny" color={c.textMuted} numberOfLines={1}>
            {t('episode.label', { number: episode.order })} · {l(episode.title)}
          </AppText>
          <AppText
            variant="bodyBold"
            numberOfLines={1}
            accessibilityRole="header"
            accessibilityLabel={t('a11y.step', { current: stepIndex + 1, total: EPISODE_STEPS.length, name: stepName })}
          >
            {stepName}
          </AppText>
        </View>
        <BookmarkButton type="episode" id={episode.id} />
      </View>
      <View style={styles.progress}>
        <View style={styles.flex}>
          <ProgressBar progress={(stepIndex + 1) / EPISODE_STEPS.length} height={6} color={SEERAH_ACCENT} />
        </View>
        <AppText variant="tiny" color={c.textMuted}>
          {t('episode.stepOf', { current: stepIndex + 1, total: EPISODE_STEPS.length })}
        </AppText>
      </View>

      <ScrollView ref={scrollRef} scrollEnabled={scrollEnabled} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step !== 'introduction' && stepStage ? <StoryStage key={step} stage={stepStage} height={180} paused={!focused} /> : null}
        {step === 'introduction' ? (
          <>
            <StoryStage key="cover" stage={episodeStepStage(episode, 'introduction') ?? episodeStage(episode)} scene={toSceneSpec(episode.scene)} height={210} paused={!focused} />
            <ChapterHeader label={`${t('episode.label', { number: episode.order })} · ${l(episode.period)}`} title={l(episode.title)} subtitle={l(episode.subtitle)} />
            <NarrationButton episodeId={episode.id} />
            <AppText variant="reading" style={styles.intro}>
              {l(episode.introduction)}
            </AppText>
            <View style={styles.chips}>
              {resolve(episode.themeIds, getTheme).map((th) => (
                <FilterChip key={th.id} icon="tag" label={l(th.name)} selected={false} onPress={() => openNode('theme', th.id)} />
              ))}
            </View>
            <Card tone="alt" style={styles.card}>
              <AppText variant="label" color={c.textMuted}>
                {t('episode.overview').toUpperCase()}
              </AppText>
              {EPISODE_STEPS.map((s, i) => (
                <AppText key={s} variant="small" color={i === 0 ? c.text : c.textMuted}>
                  {i + 1}. {t(`episode.step.${s}`)}
                </AppText>
              ))}
            </Card>
          </>
        ) : null}

        {step === 'context' ? (
          <>
            <ChapterHeader title={stepName} />
            {episode.context.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </>
        ) : null}

        {step === 'timeline' ? (
          <>
            <ChapterHeader title={stepName} subtitle={l(episode.period)} />
            <View>
              {sortChronologically(resolve(episode.events, getEvent)).map((e, i, all) => (
                <TimelineItem key={e.id} event={e} first={i === 0} last={i === all.length - 1} />
              ))}
            </View>
          </>
        ) : null}

        {step === 'mainEvent' ? (
          <>
            <ChapterHeader title={stepName} />
            {episode.mainEvent.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
            {mainEvent ? <EventCard event={mainEvent} compact /> : null}
          </>
        ) : null}

        {step === 'people' ? (
          <>
            <ChapterHeader title={stepName} subtitle={t('episode.tapToDiscover')} />
            {resolve(episode.people, getPerson).map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </>
        ) : null}

        {step === 'locations' ? (
          <>
            <ChapterHeader title={stepName} subtitle={t('episode.mapHint')} />
            <HistoricalMap places={places} routes={routes} height={320} fitToPlaces onSelect={(pid) => openNode('place', pid)} onInteraction={(active) => setScrollEnabled(!active)} />
            {routes.map((r) => (
              <View key={r.id} style={styles.routeNote}>
                <AppText variant="bodyBold">{l(r.name)}</AppText>
                <AppText variant="small" color={c.textMuted}>
                  {t('map.route')}: {l(r.note)}
                </AppText>
              </View>
            ))}
            {places.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </>
        ) : null}

        {step === 'explore' ? (
          <>
            <ChapterHeader title={t('connections.title')} subtitle={t('connections.subtitle')} />
            <AppText variant="small" color={c.textMuted}>
              {t('connections.chain')}
            </AppText>
            <ConnectionView
              groups={connectionChain(episode.mainEventId, SEERAH_CONTENT)}
              titles={[t('episode.mainEvent'), t('explore.people'), t('explore.places'), t('event.related')]}
              onNodePress={(type, nid) => openConnections(type, nid)}
            />
          </>
        ) : null}

        {step === 'challenge' ? (
          quizIndex < 0 ? (
            <>
              <ChapterHeader title={stepName} subtitle={t('episode.challengeIntro', { count: questions.length })} />
              <Button label={t('episode.challengeStart')} icon="play" onPress={() => setQuizIndex(0)} />
            </>
          ) : challengeDone ? (
            <>
              <ChapterHeader title={stepName} />
              <Card tone="gold" style={styles.card}>
                <AppText variant="title" align="center">
                  {t('episode.challengeResult', { correct: results.filter(Boolean).length, total: results.length })}
                </AppText>
                {results.some((r) => !r) ? (
                  <AppText variant="small" color={c.textMuted} align="center">
                    {t('episode.challengeRetry')}
                  </AppText>
                ) : null}
              </Card>
            </>
          ) : (
            <>
              <AppText variant="label" color={c.textMuted}>
                {t('quiz.question', { current: quizIndex + 1, total: questions.length }).toUpperCase()}
              </AppText>
              <QuestionView
                key={questions[quizIndex].id}
                question={questions[quizIndex]}
                label="quiz"
                onResult={(correct) => {
                  const q = questions[quizIndex];
                  setResults((r) => [...r, correct]);
                  setAnswerXp((x) => x + recordAnswer({ key: seerahKey(q.id), topic: q.topic, topicArea: 'seerah' }, correct, 'quiz'));
                }}
                onContinue={() => {
                  scrollRef.current?.scrollTo({ y: 0, animated: false });
                  setQuizIndex(quizIndex + 1);
                }}
              />
            </>
          )
        ) : null}

        {step === 'lesson' ? (
          <>
            <ChapterHeader title={stepName} />
            {episode.lessons.map((lesson, i) => {
              const theme = getTheme(lesson.themeId);
              return (
                <Card key={i} style={styles.card}>
                  <View style={styles.row}>
                    <Icon name="sparkle" size={18} color={blockColors(c, 'reflection').fg} />
                    <AppText variant="heading" style={styles.flex}>
                      {l(lesson.title)}
                    </AppText>
                  </View>
                  <AppText variant="reading">{l(lesson.text)}</AppText>
                  {theme ? (
                    <View style={styles.chips}>
                      <FilterChip icon="tag" label={l(theme.name)} selected={false} onPress={() => openNode('theme', theme.id)} />
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </>
        ) : null}

        {step === 'reflection' ? (
          <>
            <ChapterHeader title={t('reflection.title')} subtitle={t('reflection.note')} />
            {episode.reflectionQuestions.map((q) => (
              <ReflectionCard key={q.id} question={q} episodeId={episode.id} />
            ))}
          </>
        ) : null}

        {step === 'sources' ? (
          <>
            <ChapterHeader title={stepName} />
            <SourceSections sources={episode.sources} />
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {stepIndex > 0 ? <IconButton icon="back" label={t('common.back')} onPress={() => go(stepIndex - 1)} /> : null}
        <View style={styles.flex}>
          <Button
            label={isLast ? t('episode.finish') : step === 'reflection' ? t('reflection.skip') : t('episode.next')}
            iconRight={isLast ? 'check' : 'chevron'}
            disabled={!canContinue}
            size="md"
            onPress={() => (isLast ? finish() : go(stepIndex + 1))}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


function EpisodeDone({ episode, outcome, answerXp }: { episode: Episode; outcome: EpisodeOutcome; answerXp: number }) {
  const { c } = useTheme();
  const { t, l } = useSeerahI18n();
  const styles = useStyles();
  const next = EPISODES.find((e) => e.order === episode.order + 1);
  const xp = outcome.xp + answerXp;
  const game = EPISODE_GAMES[episode.id] ? getGame(EPISODE_GAMES[episode.id]) : undefined;
  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.content}>
        <StoryStage stage={episodeStage(episode)} scene={toSceneSpec(episode.scene)} height={170} />
        <ChapterHeader label={t('episode.completed')} title={t('episode.doneTitle')} subtitle={t('episode.doneBody', { title: l(episode.title) })} />
        {outcome.score.total > 0 ? (
          <Card tone="gold">
            <AppText variant="title" align="center">
              {t('episode.challengeResult', { correct: outcome.score.correct, total: outcome.score.total })}
            </AppText>
          </Card>
        ) : null}
        {xp > 0 ? (
          <RewardAnimation xp={xp} label={t('episode.doneTitle')} />
        ) : (
          <AppText variant="small" color={c.textMuted} align="center">
            {t('reward.noXp')}
          </AppText>
        )}
        {game ? (
          <Button
            label={t('episode.playGame', { title: l(gameTitle(game)) })}
            icon="play"
            variant="gold"
            onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
          />
        ) : null}
        {next ? (
          <Button
            label={`${t('episode.nextEpisode')}: ${l(next.title)}`}
            iconRight="chevron"
            onPress={() => router.replace({ pathname: '/seerah/episode/[id]', params: { id: next.id } })}
          />
        ) : null}
        <Button label={t('episode.backHome')} variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/seerah'))} />
      </ScrollView>
    </SafeAreaView>
  );
}

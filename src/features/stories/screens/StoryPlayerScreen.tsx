import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { QuestionView } from '@/core/components/questions/QuestionView';
import { Dialog } from '@/core/components/ui/AppModal';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Stars } from '@/core/components/ui/Stars';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import type { Question } from '@/core/models';
import { deviceNarration } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { LessonsView, StoryPage } from '../components/StoryPage';
import { getQuestion, getScene, getStory, STORIES, storiesKey } from '../content';
import { type StoriesKey, useStoriesI18n } from '../i18n';
import type { Story } from '../models';
import { buildStoryFlow } from '../services/storyFlow';
import { nextStory, storyStatus } from '../services/unlocking';
import { type RewardLineKind, type StoryOutcome, useStoriesStore } from '../store/storiesStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
  center: { alignItems: 'center' },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: spacing.md },
}));

const LINE_KEYS: Record<RewardLineKind, StoriesKey> = {
  learning: 'reward.lines.learning',
  storyComplete: 'reward.lines.storyComplete',
  perfectBonus: 'reward.lines.perfectBonus',
  quest: 'reward.lines.quest',
};

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(String(id));
  const { t } = useStoriesI18n();
  const styles = useStyles();
  useStatusBar(false);
  if (!story) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar />
        <EmptyState icon="scroll" title={t('story.notFound')} />
      </SafeAreaView>
    );
  }
  // Keyed so moving on to the next story always starts with fresh state.
  return <StoryPlayer key={story.id} story={story} />;
}

function StoryPlayer({ story }: { story: Story }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const setPaused = useAppStore((s) => s.setCelebrationsPaused);
  const saveStep = useStoriesStore((s) => s.saveStep);
  const learnLessons = useStoriesStore((s) => s.learnLessons);
  const completeStory = useStoriesStore((s) => s.completeStory);
  const [flow] = useState(() => buildStoryFlow(story));

  // Resume where the learner left off; the status check happens once on entry.
  const [initial] = useState(() => {
    const state = useStoriesStore.getState();
    const run = state.run?.storyId === story.id ? state.run : null;
    return {
      status: storyStatus(story, state.stories, STORIES),
      stepIndex: run ? Math.min(run.stepIndex, flow.length - 1) : 0,
      results: run?.results ?? [],
      xp: run?.xpEarned ?? 0,
    };
  });
  const [stepIndex, setStepIndex] = useState(initial.stepIndex);
  const [results, setResults] = useState<boolean[]>(initial.results);
  const [learningXp, setLearningXp] = useState(initial.xp);
  /** The current question step was answered (so pausing resumes after it, not before). */
  const [answered, setAnswered] = useState(false);
  const [outcome, setOutcome] = useState<StoryOutcome | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setPaused(true);
    return () => {
      setPaused(false);
      deviceNarration.stop();
    };
  }, [setPaused]);

  useEffect(() => {
    if (outcome) {
      setPaused(false);
      feedback.reward();
    }
  }, [feedback, outcome, setPaused]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (outcome) return false;
      setConfirmExit(true);
      return true;
    });
    return () => sub.remove();
  }, [outcome]);

  // Remember the position when the story is opened, so "Continue story" works from the start.
  useEffect(() => {
    if (initial.status !== 'locked') saveStep(story.id, initial.stepIndex, initial.results, initial.xp);
  }, [initial, saveStep, story.id]);

  if (initial.status === 'locked') {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar title={l(story.title)} />
        <View style={styles.content}>
          <LockedContent message={t('common.locked')} />
          <Button label={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const advance = (nextResults = results, nextXp = learningXp) => {
    deviceNarration.stop();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setAnswered(false);
    if (stepIndex + 1 < flow.length) {
      const next = stepIndex + 1;
      setStepIndex(next);
      saveStep(story.id, next, nextResults, nextXp);
      return;
    }
    const result = completeStory(story.id, nextResults);
    if (result) setOutcome({ ...result, lines: nextXp > 0 ? [{ kind: 'learning', xp: nextXp }, ...result.lines] : result.lines, xp: result.xp + nextXp });
  };

  const exit = () => {
    setConfirmExit(false);
    const resumeAt = answered ? Math.min(stepIndex + 1, flow.length - 1) : stepIndex;
    saveStep(story.id, resumeAt, results, learningXp);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/stories');
  };

  if (outcome) {
    const next = nextStory(useStoriesStore.getState().stories, STORIES);
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="display" align="center" accessibilityRole="header">
            {t('reward.title')}
          </AppText>
          <RewardAnimation xp={outcome.xp} label={t('reward.score', { correct: outcome.score.correct, total: outcome.score.total })} />
          <View style={styles.center}>
            <Stars count={outcome.score.stars} size={36} />
          </View>
          <Card>
            {outcome.lines.map((line) => (
              <View key={line.kind} style={styles.line}>
                <AppText variant="body" style={styles.flex}>
                  {t(LINE_KEYS[line.kind])}
                </AppText>
                <AppText variant="bodyBold" color={c.goldText}>
                  {t('reward.xp', { xp: line.xp })}
                </AppText>
              </View>
            ))}
            {outcome.xp === 0 ? (
              <AppText variant="small" color={c.textMuted}>
                {t('reward.storyNoXp')}
              </AppText>
            ) : null}
          </Card>
          <Card tone="gold">
            <AppText variant="label" color={c.goldText}>
              {t('reward.lessons').toUpperCase()}
            </AppText>
            {story.lessons.map((lesson) => (
              <AppText key={lesson.id} variant="bodyBold">
                • {l(lesson.title)}
              </AppText>
            ))}
          </Card>
          {next ? (
            <Button label={t('reward.next')} variant="gold" iconRight="chevron" fullWidth onPress={() => router.replace({ pathname: '/story/[id]', params: { id: next.id } })} />
          ) : null}
          {results.some((r) => !r) ? (
            <Button label={t('reward.review')} icon="refresh" variant="secondary" fullWidth onPress={() => router.replace('/review')} />
          ) : null}
          <Button label={t('reward.map')} icon="map" variant="ghost" fullWidth onPress={() => router.replace('/story/map')} />
          <Button label={t('reward.stories')} icon="scroll" variant="ghost" fullWidth onPress={() => router.dismissTo('/(tabs)/stories')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const step = flow[stepIndex];
  const sceneNumber = (sceneId: string) => story.scenes.findIndex((s) => s.id === sceneId) + 1;

  const answer = (question: Question, correct: boolean) => {
    setAnswered(true);
    const nextResults = [...results, correct];
    const gained = recordAnswer({ key: storiesKey(question.id), topic: question.topic, topicArea: 'prophets' }, correct, 'quiz');
    setResults(nextResults);
    setLearningXp((x) => x + gained);
  };

  const body = (() => {
    switch (step.kind) {
      case 'intro':
        return (
          <>
            <StoryPage key="intro" label={t('player.intro')} title={story.title} body={story.intro} scene={story.cover} stage={story.coverStage} sources={story.sources} large />
            <Button label={t('common.start')} iconRight="chevron" fullWidth onPress={() => advance()} />
          </>
        );
      case 'scene': {
        const scene = getScene(step.sceneId);
        if (!scene) return <Button label={t('common.continue')} onPress={() => advance()} />;
        return (
          <>
            <StoryPage key={scene.id} label={t('player.scene', { number: sceneNumber(scene.id) })} title={scene.title} body={scene.text} scene={scene.scene} stage={scene.stage} sources={scene.sources} />
            <Button label={t('common.continue')} iconRight="chevron" fullWidth onPress={() => advance()} />
          </>
        );
      }
      case 'question': {
        const question = getQuestion(step.questionId);
        if (!question) return <Button label={t('common.continue')} onPress={() => advance()} />;
        return (
          <QuestionView
            key={`${stepIndex}-${question.id}`}
            question={question}
            label={step.role}
            onResult={(correct) => answer(question, correct)}
            onContinue={() => advance()}
          />
        );
      }
      case 'lessons':
        return (
          <>
            <LessonsView lessons={story.lessons} sources={story.sources} />
            <Button
              label={t('player.lessonsDone')}
              icon="check"
              fullWidth
              onPress={() => {
                const gained = learnLessons(story.id);
                setLearningXp((x) => x + gained);
                advance(results, learningXp + gained);
              }}
            />
          </>
        );
    }
  })();

  const percent = Math.round((stepIndex / flow.length) * 100);
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TopBar backIcon="close" backLabel={t('player.close')} onBack={() => setConfirmExit(true)} title={l(story.prophetName)} />
        <View style={styles.progressRow}>
          <ProgressBar
            progress={stepIndex / flow.length}
            color={topicThemes.prophets.accent}
            style={styles.flex}
            accessibilityLabel={t('a11y.progress', { percent })}
          />
          <AppText variant="tiny" color={c.textMuted}>
            {stepIndex + 1}/{flow.length}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {body}
      </ScrollView>
      <Dialog
        visible={confirmExit}
        title={t('player.exitTitle')}
        body={t('player.exitBody')}
        confirmLabel={t('player.exit')}
        cancelLabel={t('player.stay')}
        onConfirm={exit}
        onCancel={() => setConfirmExit(false)}
      />
    </SafeAreaView>
  );
}

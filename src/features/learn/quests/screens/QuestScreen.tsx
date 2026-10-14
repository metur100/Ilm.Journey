import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { type QuestionLabel, QuestionView } from '@/core/components/questions/QuestionView';
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
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { getQuest, getQuestLesson, getQuestQuestion, lessonsOfQuest } from '../../content/quests';
import { nextPathEntry, pathItemHref } from '../../path';
import { useLearnStore } from '../../store/learnStore';
import { LearnedStep, StoryStep } from '../components/StoryStep';
import { QuestLessonView } from '../components/QuestLessonView';
import { ReciteStep } from '../components/ReciteStep';
import { TracingStep } from '../components/TracingStep';
import { type QuestKey, useQuestI18n } from '../i18n';
import type { BeginnerQuest, QuestQuestionLabel, QuestStep } from '../models';
import { questQuestionKey } from '../services/questions';
import { questStatus } from '../services/status';
import { type QuestOutcome, useQuestStore } from '../store/questStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  center: { alignItems: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4 },
  pill: { alignSelf: 'flex-start', backgroundColor: c.primarySoft, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 4 },
  actions: { gap: spacing.sm },
  lessons: { gap: spacing.xs },
}));

/** islam-quest labels → core label pill (`interactive` has its own wording, shown by the player). */
const CORE_LABEL: Record<QuestQuestionLabel, QuestionLabel | undefined> = { quiz: 'quiz', challenge: 'challenge', interactive: undefined };

export default function QuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Keyed by id so moving on to the next quest always starts with fresh state.
  return <QuestPlayer key={String(id)} id={String(id)} />;
}

function QuestPlayer({ id }: { id: string }) {
  const { t, l } = useQuestI18n();
  const styles = useStyles();
  useStatusBar(false);
  const quest = getQuest(id);
  // Status is checked once on entry so finishing the quest does not re-lock the screen.
  const [initialStatus] = useState(() => (quest ? questStatus(quest) : 'locked'));

  if (!quest) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar />
        <EmptyState icon="map" title={t('player.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (initialStatus === 'locked') {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar title={l(quest.title)} />
        <View style={styles.content}>
          <LockedContent message={t('player.locked')} />
          <Button label={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return <QuestFlow quest={quest} />;
}

function QuestFlow({ quest }: { quest: BeginnerQuest }) {
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const setPaused = useAppStore((s) => s.setCelebrationsPaused);
  const visit = useLearnStore((s) => s.visit);
  const completeLesson = useQuestStore((s) => s.completeLesson);
  const completeQuest = useQuestStore((s) => s.completeQuest);
  const practiseRecite = useQuestStore((s) => s.practiseRecite);

  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [learningXp, setLearningXp] = useState(0);
  const [outcome, setOutcome] = useState<QuestOutcome | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const steps = quest.steps;
  const step = steps[stepIndex];
  const theme = topicThemes[quest.worldId];

  useEffect(() => {
    visit(quest.worldId, quest.id);
  }, [quest.id, quest.worldId, visit]);

  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  useEffect(() => {
    if (outcome) setPaused(false);
  }, [outcome, setPaused]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (outcome) return false;
      setConfirmExit(true);
      return true;
    });
    return () => sub.remove();
  }, [outcome]);

  const advance = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
      return;
    }
    feedback.reward();
    setOutcome(completeQuest(quest.id, results));
  };

  const exit = () => {
    setConfirmExit(false);
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/topic/[id]', params: { id: quest.worldId } });
  };

  const renderStep = (s: QuestStep) => {
    switch (s.kind) {
      case 'intro':
        return (
          <>
            <StoryStep title={s.title} body={s.body} scene={s.scene} intro />
            <Button label={t('common.start')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'story':
        return (
          <>
            <StoryStep title={s.title} body={s.body} scene={s.scene} sources={s.sources} />
            <Button label={t('common.continue')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'lesson': {
        const lesson = getQuestLesson(s.lessonId);
        if (!lesson) return <Button label={t('common.continue')} onPress={advance} />;
        return (
          <>
            <QuestLessonView lesson={lesson} />
            <Button
              label={t('lesson.done')}
              icon="check"
              onPress={() => {
                setLearningXp((x) => x + completeLesson(lesson.id));
                advance();
              }}
            />
          </>
        );
      }
      case 'question': {
        const question = getQuestQuestion(s.questionId);
        if (!question) return <Button label={t('common.continue')} onPress={advance} />;
        const ownPill = s.label === 'interactive' && question.type !== 'scenario';
        return (
          <>
            {ownPill ? (
              <View style={styles.pill}>
                <AppText variant="label" color={c.primaryText}>
                  {t('player.label.interactive').toUpperCase()}
                </AppText>
              </View>
            ) : null}
            <QuestionView
              key={`${stepIndex}-${question.id}`}
              question={question}
              label={s.label ? CORE_LABEL[s.label] : undefined}
              onResult={(correct) => {
                setResults((r) => [...r, correct]);
                setLearningXp((x) => x + recordAnswer({ key: questQuestionKey(question.id), topic: question.topic, topicArea: question.areaId }, correct, 'quiz'));
              }}
              onContinue={advance}
            />
          </>
        );
      }
      case 'learned':
        return (
          <>
            <LearnedStep values={s.values} />
            <Button label={t('common.continue')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'tracing':
        return <TracingStep key={stepIndex} letters={s.letters} onDone={advance} />;
      case 'recite':
        return (
          <ReciteStep
            key={stepIndex}
            surahNumber={s.surahNumber}
            onDone={() => {
              practiseRecite(s.surahNumber);
              advance();
            }}
          />
        );
    }
  };

  if (outcome) {
    const next = nextPathEntry(quest.worldId, useLearnStore.getState());
    const total = outcome.xp + learningXp;
    const lines = [
      ...(learningXp > 0 ? [{ key: 'answers', label: t('reward.lines.answers'), xp: learningXp }] : []),
      ...outcome.lines.map((line) => ({ key: line.kind, label: t(`reward.lines.${line.kind}` as QuestKey), xp: line.xp })),
    ];
    const lessons = lessonsOfQuest(quest);
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="display" align="center" accessibilityRole="header">
            {t('reward.title')}
          </AppText>
          <RewardAnimation xp={total} label={t('reward.score', { correct: outcome.score.correct, total: outcome.score.total })} />
          <View style={styles.center}>
            <Stars count={outcome.score.stars} size={36} />
          </View>
          {lines.length > 0 ? (
            <Card>
              {lines.map((line) => (
                <View key={line.key} style={styles.line}>
                  <AppText variant="body">{line.label}</AppText>
                  <AppText variant="bodyBold" color={c.goldText}>
                    {t('reward.xp', { xp: line.xp })}
                  </AppText>
                </View>
              ))}
            </Card>
          ) : (
            <Card tone="alt">
              <AppText variant="small" color={c.textMuted}>
                {t('reward.noXp')}
              </AppText>
            </Card>
          )}
          <View style={styles.actions}>
            {next ? <Button label={t('reward.nextQuest')} variant="gold" iconRight="chevron" onPress={() => router.replace(pathItemHref(quest.worldId, next.item))} /> : null}
            {results.some((r) => !r) ? <Button label={t('reward.reviewMistakes')} icon="refresh" variant="secondary" onPress={() => router.replace('/review')} /> : null}
            <Button
              label={t('reward.backToTopic')}
              icon="map"
              variant={next ? 'ghost' : 'primary'}
              onPress={() => router.replace({ pathname: '/topic/[id]', params: { id: quest.worldId } })}
            />
          </View>
          {lessons.length > 0 ? (
            <View style={styles.lessons}>
              <AppText variant="small" color={c.textMuted}>
                {t('reward.lessons')}
              </AppText>
              {lessons.map((lesson) => (
                <Button
                  key={lesson.id}
                  label={l(lesson.title)}
                  icon="book"
                  variant="ghost"
                  size="md"
                  onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const percent = Math.round((stepIndex / steps.length) * 100);
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TopBar backIcon="close" backLabel={t('a11y.closeQuest')} onBack={() => setConfirmExit(true)} title={l(quest.title)} />
        <View style={styles.progressRow}>
          <ProgressBar progress={stepIndex / steps.length} color={theme.accent} style={styles.flex} accessibilityLabel={t('a11y.progress', { percent })} />
          <AppText variant="tiny" color={c.textMuted} accessibilityLabel={t('player.step', { current: stepIndex + 1, total: steps.length })}>
            {stepIndex + 1}/{steps.length}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step ? renderStep(step) : null}
      </ScrollView>
      <Dialog
        visible={confirmExit}
        title={t('player.exitTitle')}
        body={t('player.exitBody')}
        confirmLabel={t('player.exit')}
        cancelLabel={t('player.stay')}
        onConfirm={exit}
        onCancel={() => setConfirmExit(false)}
        destructive
      />
    </SafeAreaView>
  );
}

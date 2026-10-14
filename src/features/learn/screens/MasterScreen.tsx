import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { QuestionView } from '@/core/components/questions/QuestionView';
import { SceneView } from '@/core/components/scene/SceneView';
import { Dialog } from '@/core/components/ui/AppModal';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { topicName } from '@/core/i18n';
import { isTopicId, type Question, type TopicId } from '@/core/models';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { learnKey, testQuestionsOfArea, unitOfQuestion, UNITS } from '../content';
import { useLearnI18n } from '../i18n';
import { buildTopicPath, masterItemId } from '../path';
import { MASTER_PASS_PERCENT, pickMasterQuestions } from '../services/progression';
import { type MasterOutcome, useLearnStore } from '../store/learnStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  topic: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
}));

export default function MasterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLearnI18n();
  const styles = useStyles();
  useStatusBar(false);
  const topic = isTopicId(id) ? id : null;
  const [unlocked] = useState(() => {
    if (!topic) return false;
    const status = buildTopicPath(topic, useLearnStore.getState()).find((e) => e.item.id === masterItemId(topic))?.status;
    return status === 'available' || status === 'completed';
  });
  // Each attempt gets a fresh run (and a fresh question selection).
  const [run, setRun] = useState(0);

  if (!topic) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar />
        <EmptyState icon="map" title={t('topic.notFound')} />
      </SafeAreaView>
    );
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar title={t('master.title')} />
        <View style={styles.content}>
          <LockedContent message={t('master.locked')} />
          <Button label={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return <MasterRun key={run} topic={topic} onRetry={() => setRun((r) => r + 1)} />;
}

function MasterRun({ topic, onRetry }: { topic: TopicId; onRetry: () => void }) {
  const { t, l } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const setPaused = useAppStore((s) => s.setCelebrationsPaused);
  const completeMaster = useLearnStore((s) => s.completeMaster);
  const topicLabel = t(topicName(topic));

  const [questions] = useState<Question[]>(() => {
    const attempts = useLearnStore.getState().masters[topic]?.attempts ?? 0;
    return pickMasterQuestions(testQuestionsOfArea(topic), useAppStore.getState().review, attempts, (q) => learnKey(q.id));
  });
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [learningXp, setLearningXp] = useState(0);
  const [outcome, setOutcome] = useState<MasterOutcome | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const theme = topicThemes[topic];

  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  useEffect(() => {
    if (outcome) setPaused(false);
  }, [outcome, setPaused]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (outcome || !started) return false;
      setConfirmExit(true);
      return true;
    });
    return () => sub.remove();
  }, [outcome, started]);

  if (!started) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar title={t('master.title')} />
        <ScrollView contentContainerStyle={styles.content}>
          <SceneView scene={theme.scene} height={170} />
          <AppText variant="title" align="center" accessibilityRole="header">
            {topicLabel}
          </AppText>
          <Card tone="gold">
            <AppText variant="body">{t('master.intro', { count: questions.length, topic: topicLabel, percent: MASTER_PASS_PERCENT })}</AppText>
          </Card>
          <Button label={t('master.start')} variant="gold" icon="trophy" onPress={() => setStarted(true)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (outcome) {
    // Weak topics are shown as the units whose questions were missed.
    const missedUnitIds = new Set(questions.filter((_, i) => results[i] === false).map((q) => unitOfQuestion(q.id)?.id));
    const missedUnits = UNITS.filter((u) => missedUnitIds.has(u.id));
    const totalXp = outcome.xp + learningXp;
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="display" align="center" accessibilityRole="header">
            {outcome.passed ? t('master.passedTitle') : t('master.failedTitle')}
          </AppText>
          {outcome.passed ? (
            <RewardAnimation xp={totalXp} label={t('master.passedBody', { score: outcome.score.percent, topic: topicLabel })} />
          ) : (
            <Card>
              <AppText variant="body">{t('master.failedBody', { score: outcome.score.percent, percent: MASTER_PASS_PERCENT })}</AppText>
            </Card>
          )}
          {missedUnits.length > 0 ? (
            <Card tone="alt">
              <AppText variant="label" color={c.textMuted}>
                {t('master.weakTopics').toUpperCase()}
              </AppText>
              {missedUnits.map((u) => (
                <View key={u.id} style={styles.topic}>
                  <Icon name="book" size={18} color={theme.accent} />
                  <AppText variant="bodyBold" style={styles.flex}>
                    {l(u.title)}
                  </AppText>
                </View>
              ))}
            </Card>
          ) : null}
          {!outcome.passed ? (
            <>
              <Button label={t('master.review')} icon="refresh" onPress={() => router.replace('/review')} />
              <Button label={t('master.retry')} variant="secondary" icon="trophy" onPress={onRetry} />
            </>
          ) : null}
          <Button
            label={t('unit.backToTopic')}
            variant={outcome.passed ? 'primary' : 'ghost'}
            onPress={() => router.dismissTo({ pathname: '/topic/[id]', params: { id: topic } })}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const next = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (index + 1 < questions.length) setIndex(index + 1);
    else setOutcome(completeMaster(topic, results));
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TopBar backIcon="close" backLabel={t('a11y.close')} onBack={() => setConfirmExit(true)} title={t('master.title')} />
        <View style={styles.progressRow}>
          <ProgressBar progress={index / questions.length} color={theme.accent} style={styles.flex} />
          <AppText variant="tiny" color={c.textMuted}>
            {index + 1}/{questions.length}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <QuestionView
          key={`${index}-${question.id}`}
          question={question}
          label="master"
          onResult={(correct) => {
            setResults((r) => [...r, correct]);
            setLearningXp((x) => x + recordAnswer({ key: learnKey(question.id), topic: question.topic, topicArea: topic }, correct, 'master'));
          }}
          onContinue={next}
        />
      </ScrollView>
      <Dialog
        visible={confirmExit}
        title={t('unit.exitTitle')}
        body={t('unit.exitBody')}
        confirmLabel={t('unit.exit')}
        cancelLabel={t('unit.stay')}
        onConfirm={() => {
          setConfirmExit(false);
          router.back();
        }}
        onCancel={() => setConfirmExit(false)}
        destructive
      />
    </SafeAreaView>
  );
}

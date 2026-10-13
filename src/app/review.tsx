import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { QuestionView } from '@/core/components/questions/QuestionView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { LOCALE_TAGS, useI18n } from '@/core/i18n';
import { getQuestionByKey, type ResolvedQuestion } from '@/core/registry';
import { dueItems, nextReviewDate } from '@/core/services/review';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

const SESSION_SIZE = 8;

type SessionItem = ResolvedQuestion & { topic: string };

const useStyles = makeStyles(() => ({
  progress: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
}));

/**
 * Global review centre ("Let's try this again"): due questions of every feature from the spaced-review
 * queue, weakest topics first. Questions are resolved through the registry by their global key.
 */
export default function ReviewScreen() {
  const { t, l, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const review = useAppStore((s) => s.review);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const completeSession = useAppStore((s) => s.completeReviewSession);

  // The session is fixed when the screen opens so answering doesn't reshuffle the queue.
  // Items whose feature is not registered (yet) are skipped.
  const [session] = useState<SessionItem[]>(() =>
    dueItems(review, new Date().toISOString())
      .flatMap((item): SessionItem[] => {
        const resolved = getQuestionByKey(item.key);
        return resolved ? [{ ...resolved, topic: item.topic, topicArea: resolved.topicArea ?? item.topicArea }] : [];
      })
      .slice(0, SESSION_SIZE),
  );
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  if (session.length === 0) {
    const next = nextReviewDate(review);
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <EmptyState
          icon="check"
          title={t('review.emptyTitle')}
          body={
            next
              ? `${t('review.emptyBody')} ${t('review.next', {
                  date: new Date(next).toLocaleDateString(LOCALE_TAGS[language], { weekday: 'long', day: 'numeric', month: 'long' }),
                })}`
              : t('review.emptyBody')
          }
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  if (finished) {
    const correct = results.filter(Boolean).length;
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <AppText variant="title" align="center">
          {t('review.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t('review.doneBody', { correct, total: results.length })} />
        <Button label={t('common.done')} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!started) {
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <Card tone="primary">
          <AppText variant="heading">{t('review.title')}</AppText>
          <AppText variant="body" color={c.textMuted}>
            {t('review.intro')}
          </AppText>
        </Card>
        <Button label={t('review.start', { count: session.length })} icon="play" onPress={() => setStarted(true)} />
      </Screen>
    );
  }

  const current = session[index];
  const next = () => {
    if (index + 1 < session.length) setIndex(index + 1);
    else {
      completeSession();
      setFinished(true);
    }
  };

  return (
    <Screen
      header={
        <View>
          <TopBar title={t('review.title')} backIcon="close" backLabel={t('a11y.close')} />
          <View style={styles.progress}>
            <ProgressBar progress={index / session.length} />
          </View>
        </View>
      }
    >
      {current.context?.title ? (
        <AppText variant="label" color={c.textMuted}>
          {l(current.context.title).toUpperCase()}
        </AppText>
      ) : null}
      <QuestionView
        key={current.key}
        question={current.question}
        label="review"
        onResult={(correct) => {
          setResults((r) => [...r, correct]);
          setXp((x) => x + recordAnswer({ key: current.key, topic: current.topic, topicArea: current.topicArea }, correct, 'review'));
        }}
        onContinue={next}
      />
    </Screen>
  );
}

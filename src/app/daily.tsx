import { router } from 'expo-router';
import { useState } from 'react';

import { RewardAnimation } from '@/core/components/game/RewardAnimation';
import { QuestionView } from '@/core/components/questions/QuestionView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { type CoreKey, useI18n } from '@/core/i18n';
import { getDailyCandidates, getQuestionByKey, type ResolvedQuestion } from '@/core/registry';
import { dailyChallengeFor } from '@/core/services/daily';
import { pendingKeys } from '@/core/services/review';
import { useAppStore } from '@/core/store/appStore';
import { useTheme } from '@/core/theme';
import { toDayKey } from '@/core/utils/date';

/** One small challenge per day, chosen deterministically from the questions every feature offers. */
export default function DailyScreen() {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const completeDaily = useAppStore((s) => s.completeDaily);

  const [setup] = useState(() => {
    const state = useAppStore.getState();
    const day = toDayKey(new Date());
    const challenge = dailyChallengeFor(day, getDailyCandidates(), pendingKeys(state.review));
    return {
      day,
      challenge,
      alreadyDone: state.dailyCompleted.includes(day),
      questions: challenge.keys.map((key) => getQuestionByKey(key)).filter((q): q is ResolvedQuestion => q !== undefined),
    };
  });
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const mode = setup.challenge.kind === 'review' ? 'review' : 'daily';

  if (setup.alreadyDone && !done) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <EmptyState icon="check" title={t('daily.doneTitle')} body={t('daily.already')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <AppText variant="title" align="center">
          {t('daily.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t('reward.score', { correct: results.filter(Boolean).length, total: results.length })} />
        <Button label={t('common.done')} onPress={() => router.back()} />
      </Screen>
    );
  }

  const current = setup.questions[index];
  if (!current) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <EmptyState icon="sun" title={t('daily.empty')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={t('daily.title')} />}>
      <Card tone="gold">
        <AppText variant="label" color={c.goldText}>
          {t(`daily.kind.${setup.challenge.kind}` as CoreKey).toUpperCase()}
          {setup.questions.length > 1 ? ` · ${index + 1}/${setup.questions.length}` : ''}
        </AppText>
        {current.context?.title ? (
          <AppText variant="small" color={c.textMuted}>
            {l(current.context.title)}
          </AppText>
        ) : null}
      </Card>
      <QuestionView
        key={`${index}-${current.key}`}
        question={current.question}
        label={mode}
        onResult={(correct) => {
          setResults((r) => [...r, correct]);
          setXp((x) => x + recordAnswer({ key: current.key, topic: current.question.topic, topicArea: current.topicArea }, correct, mode));
        }}
        onContinue={() => {
          if (index + 1 < setup.questions.length) {
            setIndex(index + 1);
            return;
          }
          setXp((x) => x + completeDaily(setup.day));
          setDone(true);
        }}
      />
    </Screen>
  );
}

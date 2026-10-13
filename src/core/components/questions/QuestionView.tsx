import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { SourceList } from '@/core/components/ui/SourceList';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { type CoreKey, useI18n } from '@/core/i18n';
import type { Question, SourceRef } from '@/core/models';
import { getQuestionRenderer, resolveSources } from '@/core/registry';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { CategorizeQuestion } from './CategorizeQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { FindQuestion } from './FindQuestion';
import { ImageChoiceQuestion } from './ImageChoiceQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { MemoryQuestion } from './MemoryQuestion';
import { OrderingQuestion } from './OrderingQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import type { AnswerResult } from './types';

/** Label pill above the prompt (union of the source apps' roles). */
export type QuestionLabel =
  | 'practice'
  | 'test'
  | 'master'
  | 'review'
  | 'daily'
  | 'quiz'
  | 'challenge'
  | 'interaction'
  | 'miniGame'
  | 'question';

/** Types whose feedback hides "Correct answer: …" (the game itself shows the solution). */
const HIDE_CORRECT_ANSWER = new Set<Question['type']>(['ordering', 'ayahOrder', 'memory', 'matching', 'categorize']);

interface QuestionViewProps {
  question: Question;
  label?: QuestionLabel;
  /** Called once when the learner has answered. */
  onResult: (correct: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
  showReviewNote?: boolean;
}

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  labelPill: { alignSelf: 'flex-start', backgroundColor: c.primarySoft, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 4 },
  panel: { borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, gap: spacing.md },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  panelIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  reviewNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  unsupported: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: c.surfaceAlt },
}));

/**
 * Renders any question type with its prompt and the explanation after answering.
 * Types that need feature data (missingWord, ayahOrder, map) are rendered by renderers that
 * features register with `registerQuestionRenderer` (see core/registry.ts).
 */
export function QuestionView({ question, label, onResult, onContinue, continueLabel, showReviewNote = true }: QuestionViewProps) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const [result, setResult] = useState<AnswerResult | null>(null);

  const handleAnswered = (r: AnswerResult) => {
    if (result) return;
    setResult(r);
    if (r.correct) feedback.success();
    else feedback.failure();
    onResult(r.correct);
    AccessibilityInfo.announceForAccessibility(r.correct ? t('player.correct') : t('player.notQuite'));
  };

  const common = { onAnswered: handleAnswered, locked: result !== null };
  const extension = getQuestionRenderer(question.type);
  const body = (() => {
    if (extension) {
      const Renderer = extension.Component;
      return <Renderer question={question} {...common} />;
    }
    switch (question.type) {
      case 'multipleChoice':
      case 'lessonChoice':
      case 'scenario':
        return <ChoiceQuestion question={question} {...common} />;
      case 'trueFalse':
        return <TrueFalseQuestion question={question} {...common} />;
      case 'ordering':
        return <OrderingQuestion question={question} {...common} />;
      case 'imageChoice':
        return <ImageChoiceQuestion question={question} {...common} />;
      case 'fillBlank':
        return <FillBlankQuestion question={question} {...common} />;
      case 'categorize':
        return <CategorizeQuestion question={question} {...common} />;
      case 'matching':
        return <MatchingQuestion question={question} {...common} />;
      case 'memory':
        return <MemoryQuestion question={question} {...common} />;
      case 'find':
        return <FindQuestion question={question} {...common} />;
      default:
        // missingWord / ayahOrder / map without a registered renderer.
        return (
          <View style={styles.unsupported}>
            <AppText variant="body" color={c.textMuted}>
              {t('player.unsupported')}
            </AppText>
            <Button label={continueLabel ?? t('common.continue')} onPress={onContinue} iconRight="chevron" />
          </View>
        );
    }
  })();

  const labelKey: CoreKey | null =
    question.type === 'scenario'
      ? 'q.scenario.title'
      : question.type === 'lessonChoice'
        ? 'q.lessonChoice.title'
        : question.kind && question.kind !== 'general'
          ? (`q.kind.${question.kind}` as CoreKey)
          : label
            ? (`player.label.${label}` as CoreKey)
            : null;

  return (
    <View style={styles.root}>
      {labelKey ? (
        <View style={styles.labelPill}>
          <AppText variant="label" color={c.primaryText}>
            {t(labelKey).toUpperCase()}
          </AppText>
        </View>
      ) : null}
      <AppText variant="heading" accessibilityRole="header">
        {l(question.prompt)}
      </AppText>
      {body}
      {result ? (
        <FeedbackPanel
          result={result}
          explanation={l(question.explanation)}
          sources={resolveSources(question)}
          showReviewNote={showReviewNote && !result.correct}
          onContinue={onContinue}
          continueLabel={continueLabel ?? t('common.continue')}
          hideCorrectAnswer={extension?.hideCorrectAnswer ?? HIDE_CORRECT_ANSWER.has(question.type)}
        />
      ) : null}
    </View>
  );
}

interface FeedbackPanelProps {
  result: AnswerResult;
  explanation: string;
  sources: SourceRef[];
  showReviewNote: boolean;
  onContinue: () => void;
  continueLabel: string;
  hideCorrectAnswer: boolean;
}

function FeedbackPanel({ result, explanation, sources, showReviewNote, onContinue, continueLabel, hideCorrectAnswer }: FeedbackPanelProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const reduced = useReducedMotion();
  const [slide] = useState(() => new Animated.Value(reduced ? 0 : 24));
  const [fade] = useState(() => new Animated.Value(reduced ? 1 : 0));

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [fade, reduced, slide]);

  const good = result.correct;
  return (
    <Animated.View
      style={[
        styles.panel,
        { backgroundColor: good ? c.successSoft : c.goldSoft, borderColor: good ? c.success : c.gold },
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.panelHeader}>
        <View style={[styles.panelIcon, { backgroundColor: good ? c.success : c.gold }]}>
          <Icon name={good ? 'check' : 'sparkle'} size={20} color={good ? c.onStatus : c.onGold} strokeWidth={3} />
        </View>
        <AppText variant="heading" color={good ? c.success : c.goldText}>
          {good ? t('player.correct') : t('player.notQuite')}
        </AppText>
      </View>
      {result.extraFeedback ? <AppText variant="bodyBold">{result.extraFeedback}</AppText> : null}
      {!good && !hideCorrectAnswer && result.correctAnswer ? (
        <AppText variant="bodyBold">{t('player.correctAnswer', { answer: result.correctAnswer })}</AppText>
      ) : null}
      <AppText variant="body">{explanation}</AppText>
      <SourceList sources={sources} />
      {showReviewNote ? (
        <View style={styles.reviewNote}>
          <Icon name="refresh" size={16} color={c.textMuted} />
          <AppText variant="tiny" color={c.textMuted}>
            {t('player.addedToReview')}
          </AppText>
        </View>
      ) : null}
      <Button label={continueLabel} onPress={onContinue} iconRight="chevron" />
    </Animated.View>
  );
}

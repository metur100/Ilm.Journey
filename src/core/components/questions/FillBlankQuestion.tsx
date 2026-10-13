import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AnswerOption, type OptionState } from '@/core/components/game/AnswerOption';
import { AppText } from '@/core/components/ui/AppText';
import { useI18n } from '@/core/i18n';
import type { FillBlankQuestion as FillBlank } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import type { QuestionComponentProps } from './types';

const BLANK = '___';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  sentence: { backgroundColor: c.goldSoft, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: c.goldBorder },
  options: { gap: spacing.sm },
}));

/** Fill in the blank: the sentence shows a gap; choosing a word fills it in. */
export function FillBlankQuestion({ question, onAnswered, locked }: QuestionComponentProps<FillBlank>) {
  const { l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle(question.options, seededRandom(hashString(question.id))), [question.id, question.options]);
  const correct = question.options.find((o) => o.id === question.correctOptionId);
  const filled = picked ? question.options.find((o) => o.id === picked) : undefined;
  const sentence = l(question.sentence);
  const [before, after] = sentence.includes(BLANK) ? sentence.split(BLANK) : [sentence, ''];

  const choose = (id: string) => {
    if (picked || locked) return;
    setPicked(id);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'option', optionId: id }),
      correctAnswer: correct ? l(correct.text) : '',
    });
  };

  const stateFor = (id: string): OptionState => {
    if (!picked) return 'idle';
    if (id === question.correctOptionId) return 'correct';
    if (id === picked) return 'incorrect';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      <View style={styles.sentence}>
        <AppText variant="heading" color={c.text}>
          {before}
          <AppText variant="heading" color={picked ? (picked === question.correctOptionId ? c.success : c.error) : c.primaryText}>
            {filled ? ` ${l(filled.text)} ` : ' ______ '}
          </AppText>
          {after}
        </AppText>
      </View>
      <View style={styles.options}>
        {options.map((option) => (
          <AnswerOption key={option.id} label={l(option.text)} state={stateFor(option.id)} onPress={() => choose(option.id)} disabled={!!picked || locked} />
        ))}
      </View>
    </View>
  );
}

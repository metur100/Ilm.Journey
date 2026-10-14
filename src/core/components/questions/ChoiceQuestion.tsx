import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnswerOption, type OptionState } from '@/core/components/game/AnswerOption';
import { useI18n } from '@/core/i18n';
import type { LessonChoiceQuestion, MultipleChoiceQuestion, ScenarioQuestion } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { artForOption } from './optionArt';
import type { QuestionComponentProps } from './types';

const MARKERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Multiple choice, "choose the correct lesson" and scenario questions: tap an answer to submit it. */
export function ChoiceQuestion({
  question,
  onAnswered,
  locked,
}: QuestionComponentProps<MultipleChoiceQuestion | LessonChoiceQuestion | ScenarioQuestion>) {
  const { l } = useI18n();
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle(question.options, seededRandom(hashString(question.id))), [question.id, question.options]);

  const choose = (optionId: string) => {
    if (picked || locked) return;
    setPicked(optionId);
    const correct = evaluateAnswer(question, { type: 'option', optionId });
    const correctOption = question.options.find((o) => o.id === question.correctOptionId);
    const pickedOption = question.type === 'scenario' ? question.options.find((o) => o.id === optionId) : undefined;
    onAnswered({
      correct,
      correctAnswer: correctOption ? l(correctOption.text) : '',
      extraFeedback: pickedOption ? l(pickedOption.feedback) : undefined,
    });
  };

  const stateFor = (optionId: string): OptionState => {
    if (!picked) return 'idle';
    if (optionId === question.correctOptionId) return 'correct';
    if (optionId === picked) return 'incorrect';
    return 'dimmed';
  };

  return (
    <View style={styles.list}>
      {options.map((option, index) => (
        <AnswerOption
          key={option.id}
          marker={MARKERS[index]}
          label={l(option.text)}
          art={artForOption(question, option.id)}
          state={stateFor(option.id)}
          disabled={!!picked || locked}
          onPress={() => choose(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});

import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import type { ImageChoiceQuestion as ImageChoice } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { skyFor } from './sky';
import type { QuestionComponentProps } from './types';

export const useTileStyles = makeStyles((c) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  tile: { width: '48.5%', borderRadius: radius.md, borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, overflow: 'hidden' },
  selected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  right: { borderColor: c.success, backgroundColor: c.successSoft },
  wrong: { borderColor: c.error, backgroundColor: c.errorSoft },
  missed: { borderColor: c.gold, backgroundColor: c.goldSoft },
  dim: { opacity: 0.6 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm, minHeight: 44 },
  flex: { flex: 1 },
}));

/** Image selection: tap the illustration that answers the question. */
export function ImageChoiceQuestion({ question, onAnswered, locked }: QuestionComponentProps<ImageChoice>) {
  const { l, t } = useI18n();
  const { c } = useTheme();
  const styles = useTileStyles();
  const feedback = useFeedback();
  const options = useMemo(() => shuffle(question.options, seededRandom(hashString(question.id))), [question.id, question.options]);
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (id: string) => {
    if (picked || locked) return;
    feedback.tap();
    setPicked(id);
    const correct = question.options.find((o) => o.id === question.correctOptionId);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'option', optionId: id }),
      correctAnswer: correct ? l(correct.label) : '',
    });
  };

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isCorrect = picked !== null && option.id === question.correctOptionId;
        const isWrong = picked === option.id && option.id !== question.correctOptionId;
        const state = isCorrect ? `, ${t('a11y.correct')}` : isWrong ? `, ${t('a11y.incorrect')}` : '';
        return (
          <Pressable
            key={option.id}
            onPress={() => choose(option.id)}
            disabled={!!picked || locked}
            accessibilityRole="button"
            accessibilityLabel={`${l(option.label)}${state}`}
            style={[styles.tile, isCorrect && styles.right, isWrong && styles.wrong, picked && !isCorrect && !isWrong && styles.dim]}
          >
            <SceneView scene={{ sky: skyFor(option.element), elements: [option.element] }} height={90} rounded={false} />
            <View style={styles.label}>
              <AppText variant="small" style={styles.flex} numberOfLines={2}>
                {l(option.label)}
              </AppText>
              {isCorrect ? <Icon name="check" size={18} color={c.success} strokeWidth={3} /> : null}
              {isWrong ? <Icon name="close" size={18} color={c.error} strokeWidth={3} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

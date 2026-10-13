import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import type { FindQuestion as Find } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { useTileStyles } from './ImageChoiceQuestion';
import { skyFor } from './sky';
import type { QuestionComponentProps } from './types';

type TileState = 'idle' | 'selected' | 'right' | 'wrong' | 'missed';

/** Find game (story-of-the-prophets): select every illustrated object that belongs to the story. */
export function FindQuestion({ question, onAnswered, locked }: QuestionComponentProps<Find>) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const tiles = useTileStyles();
  const feedback = useFeedback();
  const items = useMemo(() => shuffle(question.items, seededRandom(hashString(question.id))), [question.id, question.items]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (submitted || locked) return;
    feedback.tap();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    setSubmitted(true);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'selection', ids: selected }),
      correctAnswer: question.items
        .filter((i) => question.correctIds.includes(i.id))
        .map((i) => l(i.label))
        .join(', '),
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={c.textMuted} style={tiles.flex}>
          {t('q.find.hint')}
        </AppText>
        <AppText variant="small" color={c.textMuted}>
          {t('q.find.selected', { count: selected.length })}
        </AppText>
      </View>
      <View style={tiles.grid}>
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          const isCorrect = question.correctIds.includes(item.id);
          const state: TileState = submitted
            ? isCorrect
              ? isSelected
                ? 'right'
                : 'missed'
              : isSelected
                ? 'wrong'
                : 'idle'
            : isSelected
              ? 'selected'
              : 'idle';
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: submitted }}
              accessibilityLabel={l(item.label)}
              style={[tiles.tile, state !== 'idle' && tiles[state]]}
            >
              <SceneView scene={{ sky: skyFor(item.element), elements: [item.element] }} height={86} rounded={false} />
              <View style={tiles.label}>
                <AppText variant="small" style={tiles.flex} numberOfLines={1}>
                  {l(item.label)}
                </AppText>
                {state === 'selected' || state === 'right' ? <Icon name="check" size={18} color={c.success} strokeWidth={3} /> : null}
                {state === 'wrong' ? <Icon name="close" size={18} color={c.error} strokeWidth={3} /> : null}
                {state === 'missed' ? <Icon name="info" size={18} color={c.goldText} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {!submitted ? <Button label={t('common.check')} onPress={submit} disabled={selected.length === 0 || locked} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md },
});

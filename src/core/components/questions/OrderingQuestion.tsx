import { useMemo } from 'react';

import { useI18n } from '@/core/i18n';
import type { OrderingQuestion as Ordering } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';

import { artForOption } from './optionArt';
import { SequenceBuilder } from './SequenceBuilder';
import type { QuestionComponentProps } from './types';

/** Ordering and timeline game: tap the items in the right order. */
export function OrderingQuestion({ question, onAnswered, locked }: QuestionComponentProps<Ordering>) {
  const { t, l } = useI18n();
  const items = useMemo(
    () => question.items.map((i) => ({ id: i.id, label: l(i.text), art: artForOption(question, i.id) })),
    [question, l],
  );
  return (
    <SequenceBuilder
      items={items}
      seedKey={question.id}
      hint={t(question.timeline ? 'q.ordering.timelineHint' : 'q.ordering.hint')}
      locked={locked}
      revealCorrect
      onSubmit={(ids) =>
        onAnswered({
          correct: evaluateAnswer(question, { type: 'order', ids }),
          correctAnswer: items.map((i) => i.label).join(' → '),
        })
      }
    />
  );
}

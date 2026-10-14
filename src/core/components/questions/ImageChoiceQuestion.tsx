import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Art, hasArt } from '@/core/art';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import type { ImageChoiceQuestion as ImageChoice, SceneElement } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { LiftPressable, Reactive } from './motion';
import { artForOption } from './optionArt';
import { skyFor } from './sky';
import type { QuestionComponentProps } from './types';

export const useTileStyles = makeStyles((c) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  /** Grid cell (sizing); the tile fills it so the motion wrappers keep the layout. */
  cell: { width: '48.5%' },
  tile: { width: '100%', borderRadius: radius.md, borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, overflow: 'hidden' },
  selected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  right: { borderColor: c.success, backgroundColor: c.successSoft },
  wrong: { borderColor: c.error, backgroundColor: c.errorSoft },
  missed: { borderColor: c.gold, backgroundColor: c.goldSoft },
  dim: { opacity: 0.6 },
  art: { alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  label: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm, minHeight: 44 },
  flex: { flex: 1 },
  checkBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: c.success },
}));

/** Illustration of one tile: the art library piece when it exists, otherwise the mini scene. */
export function TileIllustration({ art, element, height }: { art: string | undefined; element: SceneElement; height: number }) {
  const styles = useTileStyles();
  if (art && hasArt(art)) {
    return (
      <View style={[styles.art, { height }]}>
        <Art name={art} size={Math.round(height * 0.8)} />
      </View>
    );
  }
  return <SceneView scene={{ sky: skyFor(element), elements: [element] }} height={height} rounded={false} />;
}

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
          <Reactive
            key={option.id}
            reaction={isCorrect ? 'correct' : isWrong ? 'incorrect' : 'idle'}
            face={isCorrect}
            radius={radius.md}
            style={styles.cell}
          >
            <LiftPressable
              onPress={() => choose(option.id)}
              disabled={!!picked || locked}
              accessibilityRole="button"
              accessibilityLabel={`${l(option.label)}${state}`}
              style={[styles.tile, isCorrect && styles.right, isWrong && styles.wrong, picked && !isCorrect && !isWrong && styles.dim]}
            >
              <TileIllustration art={artForOption(question, option.id)} element={option.element} height={90} />
              <View style={styles.label}>
                <AppText variant="small" style={styles.flex} numberOfLines={2}>
                  {l(option.label)}
                </AppText>
                {isCorrect ? (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={14} color={c.onStatus} strokeWidth={3} />
                  </View>
                ) : null}
                {isWrong ? <Icon name="close" size={18} color={c.error} strokeWidth={3} /> : null}
              </View>
            </LiftPressable>
          </Reactive>
        );
      })}
    </View>
  );
}

import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import type { MatchingQuestion as Matching } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import type { QuestionComponentProps } from './types';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  hint: { flex: 1 },
  columns: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.sm },
  tile: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  rightTile: { backgroundColor: c.goldSoft, borderColor: c.goldBorder },
  selected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  matched: { borderColor: c.success, backgroundColor: c.successSoft, opacity: 0.75 },
  wrong: { borderColor: c.error, backgroundColor: c.errorSoft },
}));

/**
 * Tap a left item, then its partner on the right. Pairs with identical right-hand text
 * (e.g. several prayers with 4 rak'ahs) are interchangeable.
 */
export function MatchingQuestion({ question, onAnswered, locked }: QuestionComponentProps<Matching>) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const random = useMemo(() => seededRandom(hashString(question.id)), [question.id]);
  const left = useMemo(() => shuffle(question.pairs, random), [question.pairs, random]);
  const right = useMemo(() => shuffle(question.pairs, random), [question.pairs, random]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLeft, setMatchedLeft] = useState<string[]>([]);
  const [matchedRight, setMatchedRight] = useState<string[]>([]);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matchedLeft.length === question.pairs.length;

  const tapRight = (rightId: string) => {
    if (!selectedLeft || locked || done) return;
    const leftPair = question.pairs.find((p) => p.id === selectedLeft);
    const rightPair = question.pairs.find((p) => p.id === rightId);
    if (!leftPair || !rightPair) return;
    if (l(leftPair.right) === l(rightPair.right)) {
      feedback.success();
      const nextLeft = [...matchedLeft, selectedLeft];
      setMatchedLeft(nextLeft);
      setMatchedRight((prev) => [...prev, rightId]);
      setSelectedLeft(null);
      setWrongRight(null);
      if (nextLeft.length === question.pairs.length) {
        onAnswered({
          correct: evaluateAnswer(question, { type: 'pairs', mistakes }),
          correctAnswer: question.pairs.map((p) => `${l(p.left)} – ${l(p.right)}`).join(', '),
        });
      }
    } else {
      feedback.failure();
      setMistakes((m) => m + 1);
      setWrongRight(rightId);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={c.textMuted} style={styles.hint}>
          {t('q.matching.hint')}
        </AppText>
        <AppText variant="small" color={mistakes > 0 ? c.error : c.textMuted}>
          {t('q.matching.mistakes', { count: mistakes })}
        </AppText>
      </View>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((pair) => {
            const matched = matchedLeft.includes(pair.id);
            const selected = selectedLeft === pair.id;
            return (
              <Pressable
                key={pair.id}
                disabled={matched || locked}
                onPress={() => {
                  feedback.tap();
                  setSelectedLeft(pair.id);
                  setWrongRight(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: matched }}
                accessibilityLabel={`${l(pair.left)}${matched ? `, ${t('a11y.correct')}` : selected ? `, ${t('a11y.selected')}` : ''}`}
                style={[styles.tile, selected && styles.selected, matched && styles.matched]}
              >
                <AppText variant="bodyBold" align="center">
                  {l(pair.left)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.column}>
          {right.map((pair) => {
            const matched = matchedRight.includes(pair.id);
            const wrong = wrongRight === pair.id;
            return (
              <Pressable
                key={pair.id}
                disabled={matched || locked || !selectedLeft}
                onPress={() => tapRight(pair.id)}
                accessibilityRole="button"
                accessibilityState={{ disabled: matched || !selectedLeft }}
                accessibilityLabel={`${l(pair.right)}${matched ? `, ${t('a11y.correct')}` : wrong ? `, ${t('a11y.incorrect')}` : ''}`}
                style={[styles.tile, styles.rightTile, matched && styles.matched, wrong && styles.wrong]}
              >
                <AppText variant="bodyBold" align="center">
                  {l(pair.right)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

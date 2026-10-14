import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Art, hasArt } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import type { CategorizeQuestion as Categorize } from '@/core/models';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { LiftPressable, Reactive } from './motion';
import { artForOption } from './optionArt';
import type { QuestionComponentProps } from './types';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: c.goldBorder,
    backgroundColor: c.goldSoft,
    justifyContent: 'center',
  },
  chipWithArt: { paddingLeft: spacing.sm },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  bucket: {
    minHeight: 84,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.border,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: c.surface,
  },
  /** A picked item is "in the hand": every group lights up as a drop target. */
  bucketReady: { borderColor: c.primary, backgroundColor: c.primarySoft, borderStyle: 'solid' },
  bucketHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  placed: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  placedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: c.surfaceAlt,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  right: { borderColor: c.success, backgroundColor: c.successSoft },
  wrong: { borderColor: c.error, backgroundColor: c.errorSoft },
}));

/**
 * Categorization: pick an item, then tap the group it belongs to. Tapping a placed item
 * returns it to the pool. Uses taps rather than drag-and-drop for accessibility; the picked item lifts and the
 * groups highlight as targets.
 */
export function CategorizeQuestion({ question, onAnswered, locked }: QuestionComponentProps<Categorize>) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const items = useMemo(() => shuffle(question.items, seededRandom(hashString(question.id))), [question.id, question.items]);
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const unplaced = items.filter((i) => !assignment[i.id]);

  const place = (categoryId: string) => {
    if (!selected || submitted || locked) return;
    feedback.tap();
    setAssignment((a) => ({ ...a, [selected]: categoryId }));
    setSelected(null);
  };

  const unplace = (itemId: string) => {
    if (submitted || locked) return;
    setAssignment((a) => {
      const next = { ...a };
      delete next[itemId];
      return next;
    });
  };

  const submit = () => {
    setSubmitted(true);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'categories', assignment }),
      correctAnswer: question.categories
        .map((cat) => `${l(cat.label)}: ${question.items.filter((i) => i.categoryId === cat.id).map((i) => l(i.text)).join(', ')}`)
        .join(' · '),
    });
  };

  return (
    <View style={styles.root}>
      <AppText variant="small" color={c.textMuted}>
        {t('q.categorize.hint')}
      </AppText>
      {unplaced.length > 0 ? (
        <View style={styles.pool}>
          {unplaced.map((item) => {
            const active = selected === item.id;
            const art = artForOption(question, item.id);
            const showArt = !!art && hasArt(art);
            return (
              <LiftPressable
                key={item.id}
                lifted={active}
                onPress={() => {
                  feedback.tap();
                  setSelected(active ? null : item.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${l(item.text)}${active ? `, ${t('a11y.selected')}` : ''}`}
                style={[styles.chip, showArt && styles.chipWithArt, active && styles.chipActive]}
              >
                {showArt ? <Art name={art} size={32} /> : null}
                <AppText variant="bodyBold" color={active ? c.onPrimary : c.text}>
                  {l(item.text)}
                </AppText>
              </LiftPressable>
            );
          })}
        </View>
      ) : null}

      {question.categories.map((category) => {
        const placed = items.filter((i) => assignment[i.id] === category.id);
        const ready = !!selected && !submitted && !locked;
        return (
          <Pressable
            key={category.id}
            onPress={() => place(category.id)}
            disabled={!selected || submitted || locked}
            accessibilityRole="button"
            accessibilityLabel={`${l(category.label)}: ${placed.map((p) => l(p.text)).join(', ')}`}
            style={[styles.bucket, ready && styles.bucketReady]}
          >
            <View style={styles.bucketHeader}>
              <AppText variant="label" color={c.primaryText}>
                {l(category.label).toUpperCase()}
              </AppText>
              {ready ? <Icon name="plus" size={18} color={c.primaryText} strokeWidth={3} /> : null}
            </View>
            <View style={styles.placed}>
              {placed.map((item) => {
                const right = submitted && item.categoryId === category.id;
                const wrong = submitted && item.categoryId !== category.id;
                return (
                  <Reactive key={item.id} reaction={right ? 'correct' : wrong ? 'incorrect' : 'idle'} radius={radius.pill}>
                    <Pressable
                      onPress={() => unplace(item.id)}
                      disabled={submitted || locked}
                      accessibilityRole="button"
                      accessibilityLabel={`${l(item.text)}${right ? `, ${t('a11y.correct')}` : wrong ? `, ${t('a11y.incorrect')}` : ''}`}
                      style={[styles.placedChip, right && styles.right, wrong && styles.wrong]}
                    >
                      <AppText variant="small">{l(item.text)}</AppText>
                      {right ? <Icon name="check" size={14} color={c.success} strokeWidth={3} /> : null}
                      {wrong ? <Icon name="close" size={14} color={c.error} strokeWidth={3} /> : null}
                    </Pressable>
                  </Reactive>
                );
              })}
            </View>
          </Pressable>
        );
      })}

      {!submitted ? <Button label={t('common.check')} onPress={submit} disabled={unplaced.length > 0 || locked} /> : null}
    </View>
  );
}

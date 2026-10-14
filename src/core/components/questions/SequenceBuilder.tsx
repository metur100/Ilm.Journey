import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Art, hasArt } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffleNotIdentity } from '@/core/utils/random';

import { LiftPressable, Reactive } from './motion';

export interface SequenceItem {
  id: string;
  label: string;
  /** Optional art library name shown next to the label (when the library has the piece). */
  art?: string;
}

interface SequenceBuilderProps {
  /** Items in the correct order. */
  items: SequenceItem[];
  seedKey: string;
  hint: string;
  locked: boolean;
  /** Called with the learner's order once every item is placed and "Check" is pressed. */
  onSubmit: (orderIds: string[]) => void;
  /** 'quran' for verified ayah text (ayah ordering). */
  script?: 'auto' | 'quran';
  /** Show the correct order after submission. */
  revealCorrect: boolean;
}

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  slots: { gap: spacing.sm },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: c.surfaceAlt,
  },
  /** The next empty slot: where a tapped item will land. */
  slotTarget: { borderColor: c.primary, backgroundColor: c.primarySoft },
  slotFilled: { borderStyle: 'solid', borderColor: c.primary, backgroundColor: c.surface },
  slotRight: { borderColor: c.success, backgroundColor: c.successSoft },
  slotWrong: { borderColor: c.error, backgroundColor: c.errorSoft },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.night, alignItems: 'center', justifyContent: 'center' },
  numberTarget: { backgroundColor: c.primary },
  slotText: { flex: 1 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipWrap: { maxWidth: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: c.goldSoft,
    borderWidth: 2,
    borderColor: c.goldBorder,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  chipWithArt: { paddingLeft: spacing.sm },
  chipText: { flexShrink: 1 },
  actions: { gap: spacing.sm },
  correctList: { gap: 2 },
}));

function ItemArt({ art, size }: { art?: string; size: number }) {
  return art && hasArt(art) ? <Art name={art} size={size} /> : null;
}

/**
 * Tap-to-order puzzle (timeline, prayer order, wudu steps, ayah order).
 * Tapping is used instead of drag-and-drop because it is easier for children and screen readers. Pressed items lift,
 * the next free slot is highlighted as the target, placed items flip into their slot and the result pops / shakes.
 */
export function SequenceBuilder({ items, seedKey, hint, locked, onSubmit, script = 'auto', revealCorrect }: SequenceBuilderProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const pool = useMemo(() => shuffleNotIdentity(items, seededRandom(hashString(seedKey))), [items, seedKey]);
  const [order, setOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const remaining = pool.filter((i) => !order.includes(i.id));

  const place = (id: string) => {
    if (submitted || locked) return;
    feedback.tap();
    setOrder((prev) => [...prev, id]);
  };

  const unplace = (id: string) => {
    if (submitted || locked) return;
    setOrder((prev) => prev.filter((x) => x !== id));
  };

  const submit = () => {
    setSubmitted(true);
    onSubmit(order);
  };

  return (
    <View style={styles.root}>
      <AppText variant="small" color={c.textMuted}>
        {hint}
      </AppText>

      <View style={styles.slots}>
        {items.map((_, index) => {
          const id = order[index];
          const item = id ? byId.get(id) : undefined;
          const isRight = submitted && id === items[index].id;
          const isWrong = submitted && id !== undefined && id !== items[index].id;
          const isTarget = !submitted && !locked && index === order.length;
          return (
            <Reactive key={index} reaction={isRight ? 'correct' : isWrong ? 'incorrect' : 'idle'} face={id ?? ''} flipAxis="x" radius={radius.md}>
              <Pressable
                disabled={!item || submitted}
                onPress={() => item && unplace(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item ? `${index + 1}. ${item.label}` : `${index + 1}.`}
                style={[styles.slot, isTarget && styles.slotTarget, item && styles.slotFilled, isRight && styles.slotRight, isWrong && styles.slotWrong]}
              >
                <View style={[styles.number, isTarget && styles.numberTarget]}>
                  <AppText variant="small" color={isTarget ? c.onPrimary : c.onNight}>
                    {index + 1}
                  </AppText>
                </View>
                {item ? <ItemArt art={item.art} size={36} /> : null}
                <AppText variant="bodyBold" style={styles.slotText} script={script}>
                  {item ? item.label : ''}
                </AppText>
                {isRight ? <Icon name="check" size={20} color={c.success} strokeWidth={3} /> : null}
                {isWrong ? <Icon name="close" size={20} color={c.error} strokeWidth={3} /> : null}
              </Pressable>
            </Reactive>
          );
        })}
      </View>

      {!submitted ? (
        <View style={styles.pool}>
          {remaining.map((item) => {
            const withArt = !!item.art && hasArt(item.art);
            return (
              <LiftPressable
                key={item.id}
                onPress={() => place(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                wrapperStyle={styles.chipWrap}
                style={[styles.chip, withArt && styles.chipWithArt]}
              >
                <ItemArt art={item.art} size={32} />
                <AppText variant="bodyBold" script={script} style={styles.chipText}>
                  {item.label}
                </AppText>
              </LiftPressable>
            );
          })}
        </View>
      ) : null}

      {!submitted ? (
        <View style={styles.actions}>
          {order.length > 0 ? <Button label={t('q.ordering.reset')} variant="secondary" icon="refresh" onPress={() => setOrder([])} /> : null}
          <Button label={t('common.check')} onPress={submit} disabled={order.length !== items.length || locked} />
        </View>
      ) : null}

      {submitted && revealCorrect ? (
        <View style={styles.correctList}>
          {items.map((item, index) => (
            <AppText key={item.id} variant="small" color={c.success} script={script}>
              {index + 1}. {item.label}
            </AppText>
          ))}
        </View>
      ) : null}
    </View>
  );
}

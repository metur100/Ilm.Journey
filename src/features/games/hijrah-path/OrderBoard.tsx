import { useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { CHECKPOINTS } from './content';
import { Draggable } from './Draggable';
import { firstEmptySlot, isRightSlot, shuffledCards } from './logic';

const GAP = 6;
const NUMBER = 36;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  board: { flex: 1 },
  slot: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  number: { width: NUMBER, height: NUMBER, borderRadius: NUMBER / 2, backgroundColor: c.night, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignSelf: 'stretch', borderRadius: radius.md, borderWidth: 2, borderStyle: 'dashed', borderColor: c.border, justifyContent: 'center', paddingHorizontal: spacing.md },
  filled: { flex: 1, alignSelf: 'stretch', borderRadius: radius.md, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  chip: { borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.primaryBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, justifyContent: 'center' },
  flex: { flex: 1 },
  feedback: { minHeight: 24 },
}));

interface OrderBoardProps {
  seed: string;
  reducedMotion: boolean;
  playSound: GameApi['playSound'];
  haptic: GameApi['haptic'];
  t: GameApi['t'];
  l: GameApi['l'];
  onDone: (ordering: { mistakes: number; cardsWithMistakes: number }) => void;
}

/** Level 3: drag the stop cards (shuffled) onto a numbered timeline in the order they happened. */
export function OrderBoard({ seed, reducedMotion, playSound, haptic, t, l, onDone }: OrderBoardProps) {
  const { c } = useTheme();
  const styles = useStyles();
  const correct = useMemo(() => CHECKPOINTS.map((cp) => cp.id), []);
  const pool = useMemo(() => shuffledCards(seed), [seed]);
  const [slots, setSlots] = useState<(string | null)[]>(() => correct.map(() => null));
  const [missed, setMissed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const done = slots.every((s) => s !== null);
  /** Slot a dropped card is springing to (committed when the spring settles). */
  const pending = useRef<Record<string, number>>({});

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 1 || Math.abs(size.h - height) > 1) setSize({ w: width, h: height });
  };

  const slotH = size ? Math.min(54, (size.h * 0.52 - GAP * 4) / 5) : 50;
  const chipH = size ? Math.min(64, (size.h * 0.48 - 16 - GAP * 2) / 3) : 58;
  const chipW = size ? (size.w - GAP) / 2 : 150;
  const poolTop = 5 * (slotH + GAP) + 10;
  const slotX = NUMBER + spacing.sm;

  const place = (cardId: string, slot: number) => {
    setSlots((prev) => prev.map((s, i) => (i === slot ? cardId : s)));
    setFeedback('right');
    playSound('success');
    haptic('success');
  };

  const wrong = (cardId: string) => {
    setMistakes((m) => m + 1);
    setMissed((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
    setFeedback('wrong');
    haptic('warning');
  };

  const tryPlace = (cardId: string, slot: number): boolean => {
    if (slot < 0 || slots[slot] !== null) return false;
    if (!isRightSlot(correct, slot, cardId)) {
      wrong(cardId);
      return false;
    }
    return true;
  };

  const slotAt = (cx: number, cy: number) => {
    if (!size || cx < 0 || cx > size.w || cy < -GAP || cy > 5 * (slotH + GAP)) return -1;
    return Math.max(0, Math.min(4, Math.floor(cy / (slotH + GAP))));
  };

  return (
    <View style={styles.root}>
      <AppText variant="bodyBold">
        {t('play.order.title')}
      </AppText>
      <AppText variant="small" color={c.textMuted}>
        {t('play.order.hint')}
      </AppText>

      <View style={styles.board} onLayout={onLayout}>
        {size
          ? slots.map((cardId, i) => {
              const cp = CHECKPOINTS.find((x) => x.id === cardId);
              return (
                <View
                  key={`slot-${i}`}
                  style={[styles.slot, { top: i * (slotH + GAP), height: slotH }]}
                  accessible
                  accessibilityLabel={cp ? t('a11y.slotFilled', { number: i + 1, title: l(cp.title) }) : t('a11y.slotEmpty', { number: i + 1 })}
                >
                  <View style={styles.number}>
                    <AppText variant="bodyBold" color={c.onNight}>
                      {String(i + 1)}
                    </AppText>
                  </View>
                  {cp ? (
                    <Animated.View style={styles.filled} entering={reducedMotion ? undefined : ZoomIn.springify().damping(14)}>
                      <View style={styles.flex}>
                        <AppText variant="small" numberOfLines={2}>
                          {l(cp.title)}
                        </AppText>
                        <AppText variant="tiny" color={c.textMuted}>
                          {`${l(cp.date.label)} · ${t(`certainty.${cp.date.certainty}`)}`}
                        </AppText>
                      </View>
                      <Icon name="check" size={20} color={c.success} />
                    </Animated.View>
                  ) : (
                    <View style={styles.empty}>
                      <AppText variant="small" color={c.textMuted}>
                        {t('play.order.slot', { number: i + 1 })}
                      </AppText>
                    </View>
                  )}
                </View>
              );
            })
          : null}

        {size
          ? pool.map((cardId, k) => {
              if (slots.includes(cardId)) return null;
              const cp = CHECKPOINTS.find((x) => x.id === cardId)!;
              const x = (k % 2) * (chipW + GAP);
              const y = poolTop + Math.floor(k / 2) * (chipH + GAP);
              return (
                <Draggable
                  key={cardId}
                  x={x}
                  y={y}
                  width={chipW}
                  height={chipH}
                  reducedMotion={reducedMotion}
                  label={t('a11y.chip', { title: l(cp.title) })}
                  onLift={() => haptic('selection')}
                  onDrop={(cx, cy) => {
                    const slot = slotAt(cx, cy);
                    if (!tryPlace(cardId, slot)) return null;
                    pending.current[cardId] = slot;
                    return { x: slotX, y: slot * (slotH + GAP) };
                  }}
                  onSnapped={() => place(cardId, pending.current[cardId])}
                  onTap={() => {
                    const slot = firstEmptySlot(slots);
                    if (tryPlace(cardId, slot)) place(cardId, slot);
                  }}
                  style={styles.chip}
                >
                  <AppText variant="small" numberOfLines={2}>
                    {l(cp.title)}
                  </AppText>
                  <AppText variant="tiny" color={c.textMuted} numberOfLines={1}>
                    {l(cp.date.label)}
                  </AppText>
                </Draggable>
              );
            })
          : null}
      </View>

      <View style={styles.feedback} accessibilityLiveRegion="polite">
        {done ? (
          <AppText variant="bodyBold" color={c.success}>
            {t('play.order.done')}
          </AppText>
        ) : feedback ? (
          <AppText variant="small" color={feedback === 'right' ? c.success : c.goldText}>
            {t(feedback === 'right' ? 'play.order.right' : 'play.order.wrong')}
          </AppText>
        ) : null}
      </View>
      {done ? <Button label={t('play.continue')} iconRight="chevron" onPress={() => onDone({ mistakes, cardsWithMistakes: missed.length })} /> : null}
    </View>
  );
}

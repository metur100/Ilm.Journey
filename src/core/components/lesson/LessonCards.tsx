import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { Art, hasArt } from '@/core/art';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { useI18n } from '@/core/i18n';
import type { SceneSpec } from '@/core/models';
import { speakArabic } from '@/core/services/speech';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import type { LessonCard } from './cards';

export interface LessonCardsProps {
  /** Cards of one lesson in the current language – build them with `buildLessonCards` (memoise them). */
  cards: LessonCard[];
  /** Topic accent (`topicThemes[topic].accent`) for the active page dot; defaults to the primary colour. */
  accent?: string;
  /** Shown instead of a card's illustration while its art name is not in the art library yet. */
  fallbackScene?: SceneSpec;
  /** Called by the "Done" button on the last card. Without it, the last card has no Done button. */
  onFinished?: () => void;
}

const ART_HEIGHT = 150;
const DRAG_SLOP = 8;

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  page: { paddingHorizontal: 2 },
  card: {
    flex: 1,
    gap: spacing.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: spacing.lg,
  },
  artBox: {
    minHeight: ART_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: { gap: spacing.sm },
  revealButton: {
    minHeight: TOUCH_TARGET * 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.primaryBorder,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  flipFront: {
    minHeight: TOUCH_TARGET * 3,
    borderRadius: radius.md,
    backgroundColor: c.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  flipBack: { gap: spacing.sm },
  speak: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: TOUCH_TARGET / 2,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zone: { gap: spacing.sm },
  slot: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotDone: { borderStyle: 'solid', borderColor: c.success, backgroundColor: c.successSoft, flexDirection: 'row', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: c.primarySoft,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
  },
  footer: { gap: spacing.sm, alignItems: 'center' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { width: 22 },
  nav: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'stretch' },
  navButton: { flex: 1 },
}));

/**
 * Swipeable deck of lesson cards (docs/GAMES.md principle 4): horizontal paging with a big illustration, the heading,
 * 2–3 short lines and one small interaction per card (tap-to-reveal, flip, drag-to-match). Previous/next buttons,
 * page dots and a "Card 2 of 5" label make it usable without swiping; only the visible card is exposed to screen
 * readers. Animations are skipped with reduced motion.
 */
export function LessonCards({ cards, accent, fallbackScene, onFinished }: LessonCardsProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const reduced = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deck, setDeck] = useState(cards);

  // A new deck (other lesson or language) starts at its first card.
  if (deck !== cards) {
    setDeck(cards);
    setIndex(0);
  }
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [cards]);

  const total = cards.length;
  const current = Math.min(index, Math.max(total - 1, 0));
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Keep the visible card when the width changes (rotation, split screen).
  useEffect(() => {
    if (width > 0) scrollRef.current?.scrollTo({ x: currentRef.current * width, animated: false });
  }, [width]);

  if (total === 0) return null;

  const goTo = (next: number) => {
    const target = Math.max(0, Math.min(total - 1, next));
    setIndex(target);
    scrollRef.current?.scrollTo({ x: target * width, animated: !reduced });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next !== width) setWidth(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page !== current && page >= 0 && page < total) setIndex(page);
  };

  const last = current === total - 1;
  const position = t('lessonCards.position', { current: current + 1, total });

  return (
    <View style={styles.root} onLayout={onLayout}>
      {width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={!dragging && total > 1}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          keyboardShouldPersistTaps="handled"
          accessibilityLabel={t('lessonCards.deck')}
        >
          {cards.map((card, i) => (
            <View
              key={card.id}
              style={[styles.page, { width }]}
              accessibilityElementsHidden={i !== current}
              importantForAccessibility={i === current ? 'auto' : 'no-hide-descendants'}
            >
              <LessonCardView card={card} fallbackScene={fallbackScene} reduced={reduced} onDragChange={setDragging} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.footer}>
        {total > 1 ? (
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {cards.map((card, i) => (
              <View key={card.id} style={[styles.dot, i === current ? [styles.dotActive, { backgroundColor: accent ?? c.primary }] : null]} />
            ))}
          </View>
        ) : null}
        <AppText variant="small" color={c.textMuted} accessibilityLiveRegion="polite">
          {position}
        </AppText>
        {current === 0 && total > 1 ? (
          <AppText variant="tiny" color={c.textMuted} align="center">
            {t('lessonCards.swipeHint')}
          </AppText>
        ) : null}
        {total > 1 || onFinished ? (
          <View style={styles.nav}>
            {total > 1 ? (
              <Button
                label={t('lessonCards.previous')}
                icon="back"
                variant="secondary"
                size="md"
                disabled={current === 0}
                onPress={() => goTo(current - 1)}
                style={styles.navButton}
              />
            ) : null}
            {last ? (
              onFinished ? (
                <Button label={t('lessonCards.finish')} icon="check" size="md" onPress={onFinished} style={styles.navButton} />
              ) : null
            ) : (
              <Button
                label={t('lessonCards.next')}
                iconRight="chevron"
                variant="primary"
                size="md"
                onPress={() => goTo(current + 1)}
                style={styles.navButton}
              />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

interface CardViewProps {
  card: LessonCard;
  fallbackScene?: SceneSpec;
  reduced: boolean;
  onDragChange: (dragging: boolean) => void;
}

function LessonCardView({ card, fallbackScene, reduced, onDragChange }: CardViewProps) {
  const styles = useStyles();
  const [artWidth, setArtWidth] = useState(0);
  const useScene = !hasArt(card.art) && !!fallbackScene;

  return (
    <View style={styles.card}>
      <View style={styles.artBox} onLayout={(e) => setArtWidth(Math.round(e.nativeEvent.layout.width))}>
        {useScene && fallbackScene ? (
          <SceneView scene={fallbackScene} height={ART_HEIGHT} rounded={false} style={{ alignSelf: 'stretch' }} />
        ) : artWidth > 0 ? (
          <Art name={card.art} size={Math.min(artWidth, 280)} height={ART_HEIGHT} />
        ) : null}
      </View>
      {card.interaction.kind === 'flip' ? (
        <FlipBody card={card} reduced={reduced} />
      ) : card.interaction.kind === 'reveal' ? (
        <RevealBody card={card} reduced={reduced} />
      ) : card.interaction.kind === 'match' ? (
        <MatchBody card={card} options={card.interaction.options} answer={card.interaction.answer} reduced={reduced} onDragChange={onDragChange} />
      ) : (
        <PlainBody card={card} />
      )}
    </View>
  );
}

function Heading({ text }: { text?: string }) {
  const { c } = useTheme();
  if (!text) return null;
  return (
    <AppText variant="heading" color={c.primaryText} accessibilityRole="header">
      {text}
    </AppText>
  );
}

function PlainBody({ card }: { card: LessonCard }) {
  const styles = useStyles();
  return (
    <View style={styles.body}>
      <Heading text={card.heading} />
      <AppText variant="body">{card.text}</AppText>
    </View>
  );
}

/** Fade-in helper: starts hidden and fades to visible when `visible` turns true (instant with reduced motion). */
function useFade(visible: boolean, reduced: boolean) {
  const [opacity] = useState(() => new Animated.Value(visible ? 1 : 0));
  useEffect(() => {
    if (!visible) return;
    if (reduced) opacity.setValue(1);
    else Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [visible, reduced, opacity]);
  return opacity;
}

/** Tap-to-reveal: the heading is the prompt, the text appears on tap. */
function RevealBody({ card, reduced }: { card: LessonCard; reduced: boolean }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const [revealed, setRevealed] = useState(false);
  const opacity = useFade(revealed, reduced);

  return (
    <View style={styles.body}>
      <Heading text={card.heading} />
      {revealed ? (
        <Animated.View style={{ opacity }}>
          <AppText variant="body">{card.text}</AppText>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            feedback.tap();
            setRevealed(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('lessonCards.tapToReveal')}
          accessibilityHint={t('lessonCards.revealHint')}
          style={styles.revealButton}
        >
          <Icon name="eye" size={22} color={c.primaryText} />
          <AppText variant="bodyBold" color={c.primaryText}>
            {t('lessonCards.tapToReveal')}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

/** Flip card: front shows the Arabic (with pronunciation), back shows the heading and text. */
function FlipBody({ card, reduced }: { card: LessonCard; reduced: boolean }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const [flipped, setFlipped] = useState(false);
  const [turn] = useState(() => new Animated.Value(1));

  const flip = () => {
    feedback.tap();
    if (reduced) {
      setFlipped((f) => !f);
      return;
    }
    Animated.timing(turn, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setFlipped((f) => !f);
      Animated.timing(turn, { toValue: 1, duration: 140, useNativeDriver: true }).start();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scaleX: turn }] }}>
      {flipped ? (
        <View style={styles.flipBack}>
          <Heading text={card.heading} />
          <AppText variant="body">{card.text}</AppText>
          <Button label={t('lessonCards.flipBack')} icon="refresh" variant="ghost" size="md" fullWidth={false} onPress={flip} silent />
        </View>
      ) : (
        <Pressable
          onPress={flip}
          accessibilityRole="button"
          accessibilityLabel={`${t('lessonCards.flip')}: ${card.transliteration ?? card.arabic ?? ''}`}
          accessibilityHint={t('lessonCards.flipHint')}
          style={styles.flipFront}
        >
          <AppText variant="display" script="arabic" align="center">
            {card.arabic}
          </AppText>
          {card.transliteration ? (
            <AppText variant="small" color={c.textMuted} align="center">
              {card.transliteration}
            </AppText>
          ) : null}
          <Pressable
            onPress={() => speakArabic(card.arabic ?? '')}
            accessibilityRole="button"
            accessibilityLabel={`${t('lessonCards.listen')}${card.transliteration ? `: ${card.transliteration}` : ''}`}
            style={styles.speak}
            hitSlop={6}
          >
            <Icon name="speaker" size={22} color={c.primaryText} />
          </Pressable>
          <AppText variant="tiny" color={c.textMuted} align="center">
            {t('lessonCards.flipHint')}
          </AppText>
        </Pressable>
      )}
    </Animated.View>
  );
}

type ChooseResult = 'correct' | 'wrong' | 'miss';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Drag-to-match: drag the right heading (of two) onto the text – tapping a heading chooses it too. */
function MatchBody({
  card,
  options,
  answer,
  reduced,
  onDragChange,
}: {
  card: LessonCard;
  options: [string, string];
  answer: string;
  reduced: boolean;
  onDragChange: (dragging: boolean) => void;
}) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const [matched, setMatched] = useState(false);
  const [wrong, setWrong] = useState(false);
  const zoneRef = useRef<View>(null);
  const zoneRect = useRef<Rect | null>(null);
  const opacity = useFade(matched, reduced);

  const measureZone = () =>
    zoneRef.current?.measureInWindow((x, y, width, height) => {
      zoneRect.current = { x, y, width, height };
    });

  const choose = (option: string): ChooseResult => {
    if (option === answer) {
      feedback.success();
      setMatched(true);
      setWrong(false);
      AccessibilityInfo.announceForAccessibility(t('lessonCards.wellDone'));
      return 'correct';
    }
    feedback.failure();
    setWrong(true);
    AccessibilityInfo.announceForAccessibility(t('lessonCards.tryAgain'));
    return 'wrong';
  };

  const drop = (option: string, x: number, y: number): ChooseResult => {
    const r = zoneRect.current;
    if (r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return choose(option);
    return 'miss';
  };

  return (
    <View style={styles.body}>
      <View ref={zoneRef} style={styles.zone} onLayout={measureZone}>
        {matched ? (
          <Animated.View style={[styles.slot, styles.slotDone, { opacity }]}>
            <Icon name="check" size={20} color={c.success} />
            <AppText variant="heading" color={c.primaryText} accessibilityRole="header">
              {answer}
            </AppText>
          </Animated.View>
        ) : (
          <View style={styles.slot}>
            <AppText variant="small" color={c.textMuted} align="center">
              {t('lessonCards.dropHere')}
            </AppText>
          </View>
        )}
        <AppText variant="body">{card.text}</AppText>
      </View>
      {matched ? (
        <AppText variant="bodyBold" color={c.success} accessibilityLiveRegion="polite">
          {t('lessonCards.wellDone')}
        </AppText>
      ) : (
        <>
          <AppText variant="small" color={c.textMuted}>
            {t('lessonCards.dragHint')}
          </AppText>
          <View style={styles.chips}>
            {options.map((option) => (
              <DraggableChip
                key={option}
                label={option}
                reduced={reduced}
                onGrab={() => {
                  measureZone();
                  onDragChange(true);
                }}
                onRelease={() => onDragChange(false)}
                onChoose={() => choose(option)}
                onDrop={(x, y) => drop(option, x, y)}
              />
            ))}
          </View>
          {wrong ? (
            <AppText variant="small" color={c.error} accessibilityLiveRegion="polite">
              {t('lessonCards.tryAgain')}
            </AppText>
          ) : null}
        </>
      )}
    </View>
  );
}

interface ChipProps {
  label: string;
  reduced: boolean;
  onGrab: () => void;
  onRelease: () => void;
  onChoose: () => ChooseResult;
  onDrop: (pageX: number, pageY: number) => ChooseResult;
}

function DraggableChip(props: ChipProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  // Gesture handlers are created once; `update` hands them the latest props after every render.
  const [gesture] = useState(() => {
    const latest = { current: props };
    const pan = new Animated.ValueXY();
    const back = () => {
      if (latest.current.reduced) pan.setValue({ x: 0, y: 0 });
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
    };
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => latest.current.onGrab(),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, g) => {
        latest.current.onRelease();
        const tap = Math.abs(g.dx) < DRAG_SLOP && Math.abs(g.dy) < DRAG_SLOP;
        const result = tap ? latest.current.onChoose() : latest.current.onDrop(g.moveX, g.moveY);
        if (result !== 'correct') back();
      },
      onPanResponderTerminate: () => {
        latest.current.onRelease();
        back();
      },
    });
    return {
      pan,
      responder,
      update: (next: ChipProps) => {
        latest.current = next;
      },
    };
  });
  useEffect(() => {
    gesture.update(props);
  });

  return (
    <Animated.View
      {...gesture.responder.panHandlers}
      style={[styles.chip, { transform: gesture.pan.getTranslateTransform() }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t('lessonCards.option', { heading: props.label })}
      accessibilityHint={t('lessonCards.optionHint')}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate') props.onChoose();
      }}
    >
      <AppText variant="bodyBold" color={c.primaryText}>
        {props.label}
      </AppText>
    </Animated.View>
  );
}

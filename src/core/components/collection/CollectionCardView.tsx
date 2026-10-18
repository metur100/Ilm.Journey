import { useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { categoryKey, type CollectionEntry, unlockHint } from '@/core/collection';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { useI18n } from '@/core/i18n';
import type { CollectionCard, CollectionCategory, TopicId } from '@/core/models';
import { makeStyles, radius, spacing, topicThemes, TOUCH_TARGET, useTheme } from '@/core/theme';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { SourceList } from '../ui/SourceList';

/** Each category borrows the accent of the learning topic it belongs to (white text/icons on top). */
const CATEGORY_TOPIC: Record<CollectionCategory, TopicId> = {
  letters: 'sufara',
  places: 'seerah',
  surahs: 'quran',
  duas: 'ramadan',
  events: 'history',
  objects: 'prophets',
  deeds: 'akhlaq',
};

export const CATEGORY_ICON: Record<CollectionCategory, IconName> = {
  letters: 'letter',
  places: 'pin',
  surahs: 'quran',
  duas: 'moon',
  events: 'calendar',
  objects: 'scroll',
  deeds: 'heart',
};

/** Accent colour of a category (from the topic themes). */
export function categoryColor(category: CollectionCategory): string {
  return topicThemes[CATEGORY_TOPIC[category]].accent;
}

const FLIP_HEIGHT = 400;
const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;

const useStyles = makeStyles((c) => ({
  tile: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, minHeight: TOUCH_TARGET },
  tileUnlocked: { backgroundColor: c.surface, borderColor: c.border },
  tileLocked: { backgroundColor: c.night, borderColor: c.nightLine },
  band: { height: 6 },
  tileArt: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
  tileText: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: 2, minHeight: 44 },
  pressed: { opacity: 0.85 },
  newBadge: {
    position: 'absolute',
    top: spacing.sm + 6,
    right: spacing.xs,
    backgroundColor: c.gold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  silhouette: { opacity: 0.18 },
  lockOverlay: { ...FILL, alignItems: 'center', justifyContent: 'center' },
  letterOverlay: { ...FILL, alignItems: 'center', justifyContent: 'center' },
  // Detail
  detail: { gap: spacing.md },
  flipArea: { height: FLIP_HEIGHT },
  face: {
    ...FILL,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  frontBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  backBody: { padding: spacing.lg, gap: spacing.md },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  lockedDetail: { alignItems: 'center', gap: spacing.md },
  lockedArt: { backgroundColor: c.night, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  hintBox: { backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, alignSelf: 'stretch' },
  actions: { gap: spacing.sm },
  // Mini
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_TARGET,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.goldBorder,
    backgroundColor: c.goldSoft,
  },
  miniArt: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  miniTexts: { flex: 1, gap: 2 },
}));

/** The card's illustration; letter cards also show the Arabic letter large on top of the pattern. */
function CardArt({ card, size, silhouette }: { card: CollectionCard; size: number; silhouette?: boolean }) {
  const { c } = useTheme();
  const styles = useStyles();
  const showLetter = card.category === 'letters' && !!card.arabic;
  return (
    <View style={[{ width: size, height: size }, silhouette && styles.silhouette]}>
      <Art name={card.art} size={size} height={size} />
      {showLetter ? (
        <View style={styles.letterOverlay}>
          <AppText variant="title" script="arabic" color={silhouette ? c.onNight : categoryColor(card.category)} style={{ fontSize: size * 0.5, lineHeight: size * 0.85 }}>
            {card.arabic}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

interface TileProps {
  entry: CollectionEntry;
  width: number;
  onPress: (entry: CollectionEntry) => void;
}

/** Album tile: unlocked → illustration, title and category colour; locked → dark silhouette with a lock. */
export function CollectionCardTile({ entry, width, onPress }: TileProps) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const { card, unlocked, isNew } = entry;
  const category = t(categoryKey(card.category));
  const artSize = Math.max(40, Math.round(width * 0.62));
  const label = unlocked
    ? t(isNew ? 'collection.a11y.cardNew' : 'collection.a11y.card', { title: l(card.title), category })
    : t('collection.a11y.locked', { category });

  return (
    <Pressable
      onPress={() => onPress(entry)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, { width }, unlocked ? styles.tileUnlocked : styles.tileLocked, pressed && styles.pressed]}
    >
      <View style={[styles.band, { backgroundColor: unlocked ? categoryColor(card.category) : c.nightLine }]} />
      <View style={styles.tileArt}>
        <CardArt card={card} size={artSize} silhouette={!unlocked} />
        {!unlocked ? (
          <View style={styles.lockOverlay}>
            <Icon name="lock" size={26} color={c.onNightMuted} />
          </View>
        ) : null}
      </View>
      <View style={styles.tileText}>
        <AppText variant="small" align="center" numberOfLines={2} color={unlocked ? c.text : c.onNightMuted}>
          {unlocked ? l(card.title) : t('collection.locked')}
        </AppText>
      </View>
      {isNew ? (
        <View style={styles.newBadge}>
          <AppText variant="label" color={c.onGold}>
            {t('collection.new').toUpperCase()}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

function CategoryPill({ category }: { category: CollectionCategory }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.categoryPill, { backgroundColor: categoryColor(category) }]}>
      <Icon name={CATEGORY_ICON[category]} size={14} color={c.onAccent} />
      <AppText variant="label" color={c.onAccent}>
        {t(categoryKey(category)).toUpperCase()}
      </AppText>
    </View>
  );
}

/** Unlocked card with a flip animation: front = art, title, Arabic; back = fact + sources. */
function FlipCard({ card }: { card: CollectionCard }) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const reduced = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    // Reduced motion: switch faces instantly instead of rotating.
    if (reduced) progress.setValue(next ? 1 : 0);
    else Animated.timing(progress, { toValue: next ? 1 : 0, duration: 450, useNativeDriver: true }).start();
  };

  const frontStyle = {
    opacity: progress.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] }),
    transform: [{ perspective: 1000 }, { rotateY: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
  };
  const backStyle = {
    opacity: progress.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [0, 0, 1, 1] }),
    transform: [{ perspective: 1000 }, { rotateY: progress.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) }],
  };

  return (
    <View style={styles.detail}>
      <View style={styles.flipArea}>
        <Animated.View
          style={[styles.face, frontStyle]}
          pointerEvents={flipped ? 'none' : 'auto'}
          accessibilityElementsHidden={flipped}
          importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
        >
          <View style={[styles.band, { backgroundColor: categoryColor(card.category) }]} />
          <View style={styles.frontBody}>
            <CategoryPill category={card.category} />
            <CardArt card={card} size={160} />
            <AppText variant="title" align="center" accessibilityRole="header">
              {l(card.title)}
            </AppText>
            {card.arabic && card.category !== 'letters' ? (
              <AppText variant="heading" script="arabic" align="center" color={c.textMuted}>
                {card.arabic}
              </AppText>
            ) : null}
            {card.subtitle ? (
              <AppText variant="small" align="center" color={c.textMuted}>
                {l(card.subtitle)}
              </AppText>
            ) : null}
          </View>
        </Animated.View>
        <Animated.View
          style={[styles.face, backStyle]}
          pointerEvents={flipped ? 'auto' : 'none'}
          accessibilityElementsHidden={!flipped}
          importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
        >
          <View style={[styles.band, { backgroundColor: categoryColor(card.category) }]} />
          <ScrollView contentContainerStyle={styles.backBody}>
            <AppText variant="label" color={c.textMuted}>
              {t('collection.fact').toUpperCase()}
            </AppText>
            <AppText variant="heading">{l(card.title)}</AppText>
            <AppText variant="reading">{l(card.fact)}</AppText>
            <SourceList sources={card.sources} />
          </ScrollView>
        </Animated.View>
      </View>
      <Button label={flipped ? t('collection.flipBack') : t('collection.flip')} onPress={flip} variant="secondary" icon="refresh" />
    </View>
  );
}

/** Locked card: silhouette, lock and the "How to unlock" hint. */
function LockedCard({ card }: { card: CollectionCard }) {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.lockedDetail}>
      <CategoryPill category={card.category} />
      <View style={styles.lockedArt}>
        <CardArt card={card} size={140} silhouette />
        <View style={styles.lockOverlay}>
          <Icon name="lock" size={40} color={c.onNightMuted} />
        </View>
      </View>
      <AppText variant="heading" align="center" accessibilityRole="header">
        {t('collection.locked')}
      </AppText>
      <View style={styles.hintBox}>
        <AppText variant="label" color={c.textMuted}>
          {t('collection.howToUnlock').toUpperCase()}
        </AppText>
        <AppText variant="body">{unlockHint(card, language)}</AppText>
      </View>
    </View>
  );
}

interface DetailProps {
  card: CollectionCard;
  unlocked: boolean;
  onClose: () => void;
}

/** Card detail (for an `AppModal` or a full-screen overlay): flip card when unlocked, unlock hint when locked. */
export function CollectionCardDetail({ card, unlocked, onClose }: DetailProps) {
  const { t } = useI18n();
  const styles = useStyles();
  return (
    <View style={styles.detail}>
      {unlocked ? <FlipCard key={card.id} card={card} /> : <LockedCard card={card} />}
      <View style={styles.actions}>
        <Button label={t('collection.close')} onPress={onClose} variant="ghost" />
      </View>
    </View>
  );
}

/** Small "New card unlocked!" row (game / story result screens). */
export function CollectionCardMini({ card, onPress }: { card: CollectionCard; onPress?: () => void }) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const content = (
    <>
      <View style={styles.miniArt}>
        <CardArt card={card} size={44} />
      </View>
      <View style={styles.miniTexts}>
        <AppText variant="label" color={c.goldText}>
          {t('collection.newCardUnlocked').toUpperCase()}
        </AppText>
        <AppText variant="bodyBold" numberOfLines={2}>
          {l(card.title)}
        </AppText>
        <AppText variant="tiny" color={c.textMuted}>
          {t(categoryKey(card.category))}
        </AppText>
      </View>
      {onPress ? <Icon name="chevron" size={20} color={c.textMuted} /> : null}
    </>
  );
  const label = t('collection.a11y.newCard', { title: l(card.title) });
  if (!onPress) {
    return (
      <View style={styles.mini} accessible accessibilityLabel={label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('collection.open')}
      style={({ pressed }) => [styles.mini, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

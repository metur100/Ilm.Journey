import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Art } from '../../art';
import { CollectionCardMini } from '../../components/collection/CollectionCardView';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useFeedback } from '../../hooks/useFeedback';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useI18n } from '../../i18n';
import { makeStyles, radius, spacing, useTheme } from '../../theme';
import type { LevelSummary } from '../store';
import type { GameFact, GameLevel } from '../types';
import { FactCard, StarsBurst } from './parts';

interface GameResultProps {
  title: string;
  level: GameLevel;
  summary: LevelSummary;
  facts: GameFact[];
  accent: string;
  onReplay: () => void;
  onNext?: () => void;
  onBack: () => void;
  onLeave: () => void;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  head: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  rewards: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: c.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.md, minHeight: 44 },
  xpChip: { backgroundColor: c.goldSoft, borderColor: c.goldBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cards: { gap: spacing.md },
  actions: { gap: spacing.sm },
}));

/** Result screen of a level: stars, best, rewards, "You learned", new collection cards, next steps. */
export function GameResult({ title, level, summary, facts, onReplay, onNext, onBack, onLeave }: GameResultProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const reduced = useReducedMotion();
  const feedback = useFeedback();

  useEffect(() => {
    feedback.reward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heading = summary.stars === 3 ? t('games.result.3') : summary.stars === 2 ? t('games.result.2') : t('games.result.1');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <AppText variant="label" color={c.textMuted}>
            {`${title} · ${t('common.level', { level })}`.toUpperCase()}
          </AppText>
          <StarsBurst stars={summary.stars} reduced={reduced} />
          <AppText variant="title" align="center" accessibilityRole="header">
            {heading}
          </AppText>
          <AppText variant="body" color={c.textMuted} align="center">
            {t('games.score', { score: summary.score, max: summary.maxScore })}
          </AppText>
          {summary.newBest ? (
            <AppText variant="bodyBold" color={c.goldText} align="center">
              {t('games.newBest')}
            </AppText>
          ) : !summary.firstCompletion ? (
            <AppText variant="small" color={c.textMuted} align="center">
              {t('games.bestStars', { count: summary.bestStars })}
            </AppText>
          ) : null}
        </View>

        <View style={styles.rewards} accessible accessibilityLabel={[summary.xp > 0 ? t('reward.xp', { xp: summary.xp }) : '', summary.seeds > 0 ? t(summary.seeds === 1 ? 'games.seed' : 'games.seeds', { count: summary.seeds }) : '', summary.water > 0 ? t('games.water', { count: summary.water }) : ''].filter(Boolean).join(', ')}>
          {summary.xp > 0 ? (
            <View style={[styles.chip, styles.xpChip]}>
              <Icon name="star" size={18} color={c.goldText} />
              <AppText variant="bodyBold" color={c.goldText}>
                {t('reward.xp', { xp: summary.xp })}
              </AppText>
            </View>
          ) : null}
          {summary.seeds > 0 ? (
            <View style={styles.chip}>
              <Art name="garden.seed" size={26} />
              <AppText variant="bodyBold">{t(summary.seeds === 1 ? 'games.seed' : 'games.seeds', { count: summary.seeds })}</AppText>
            </View>
          ) : null}
          {summary.water > 0 ? (
            <View style={styles.chip}>
              <Art name="garden.water-drop" size={22} />
              <AppText variant="bodyBold">{t('games.water', { count: summary.water })}</AppText>
            </View>
          ) : null}
        </View>
        {summary.xp === 0 ? (
          <AppText variant="small" color={c.textMuted} align="center">
            {t('games.xpDone')}
          </AppText>
        ) : summary.perfect ? (
          <AppText variant="small" color={c.goldText} align="center">
            {t('games.perfect')}
          </AppText>
        ) : null}

        <View style={styles.cards}>
          <AppText variant="heading" accessibilityRole="header">
            {t('games.youLearned')}
          </AppText>
          {facts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
          {summary.reviewKeys.length > 0 ? (
            <View style={styles.row}>
              <Icon name="refresh" size={16} color={c.textMuted} />
              <AppText variant="tiny" color={c.textMuted}>
                {t('games.reviewNote')}
              </AppText>
            </View>
          ) : null}
        </View>

        {summary.newCards.length > 0 ? (
          <View style={styles.cards}>
            <AppText variant="heading" color={c.goldText}>
              {t('games.newCard')}
            </AppText>
            {summary.newCards.map((card) => (
              <CollectionCardMini key={card.id} card={card} />
            ))}
            <Button label={t('games.openAlbum')} icon="book" variant="secondary" onPress={() => router.push('/collection')} />
          </View>
        ) : null}

        <Card tone="primary" onPress={() => router.push('/garden')} accessibilityLabel={t('games.toGarden')}>
          <View style={styles.row}>
            <Art name="garden.watering-can" size={44} />
            <AppText variant="bodyBold" color={c.primaryText} style={{ flex: 1 }}>
              {t('games.toGarden')}
            </AppText>
            <Icon name="chevron" size={20} color={c.primaryText} />
          </View>
        </Card>

        <View style={styles.actions}>
          {onNext ? <Button label={t('games.nextLevel')} iconRight="chevron" variant="gold" onPress={onNext} /> : null}
          <Button label={t('games.replay')} icon="refresh" variant={onNext ? 'secondary' : 'primary'} onPress={onReplay} />
          <Button label={t('games.levels')} variant="secondary" onPress={onBack} />
          <Button label={t('games.backToShelf')} variant="ghost" onPress={onLeave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

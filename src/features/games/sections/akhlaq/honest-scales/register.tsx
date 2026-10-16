import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { BalanceScale, balancingSet, GameBoard, kitResult, ProgressDots, useKitColors } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { F, L } from '../shared/facts';
import { scalesI18n } from './i18n';

/*
 * The Honest Market Stall – BalanceScale, one customer after another (83:1–3, 17:35: give full measure).
 * L1: three small orders, few weights. L2: bigger orders and more weights – fewer obvious choices. L3 (twist):
 * orders and change: a customer paid too much, and the extra coins go back – weighed exactly on the coin scale.
 */

type Good = 'dates' | 'olives' | 'grain' | 'honey' | 'change';

export interface Round {
  good: Good;
  amount: number;
  /** Weights (kg) or coin values the learner can use. */
  weights: number[];
}

export interface ScalesConfig {
  rounds: Round[];
  fact: string;
}

const GOOD_ART: Record<Good, string> = { dates: 'food.dates', olives: 'food.olives', grain: 'object.grain-sack', honey: 'object.honey', change: 'object.coins' };

/** Pure: every round can be balanced exactly with its weights. */
export const roundsSolvable = (rounds: readonly Round[]) =>
  rounds.every((r) => balancingSet(r.weights.map((w, i) => ({ id: String(i), weight: w })), r.amount) !== null);

const FACTS = { full: F.fullMeasure(), short: F.shortMeasure(), cheat: F.noCheating(), sidq: L.sidq() };

function Order({ round, label, step, total, roundLabel }: { round: Round; label: string; step: number; total: number; roundLabel: string }) {
  const k = useKitColors();
  return (
    <Animated.View key={step} entering={FadeIn.duration(300)} style={[styles.order, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
      <Art name="akhlaq.market-stall" size={70} />
      <View style={styles.orderText}>
        <AppText variant="bodyBold" color={k.text}>
          {label}
        </AppText>
        <AppText variant="tiny" color={k.textMuted}>
          {roundLabel}
        </AppText>
        <ProgressDots total={total} done={step} />
      </View>
      <Art name={GOOD_ART[round.good]} size={44} />
    </Animated.View>
  );
}

function HonestScalesGame(api: GameApi<ScalesConfig>) {
  const { rounds, fact } = api.config;
  const [step, setStep] = useState(0);
  const mistakes = useRef(0);
  const round = rounds[Math.min(step, rounds.length - 1)];
  const coins = round.good === 'change';
  const unit = (n: number) => api.t(coins ? 'coin' : 'weight', { n });
  const next = (m: number) => {
    mistakes.current += m;
    if (step + 1 >= rounds.length) {
      api.onComplete(kitResult({ moves: rounds.length, mistakes: mistakes.current, factsMissed: mistakes.current > 0 ? [fact] : [] }));
      return;
    }
    setStep(step + 1);
  };
  return (
    <GameBoard api={api}>
      <Order
        round={round}
        step={step}
        total={rounds.length}
        label={api.t(`order.${round.good}`, { n: round.amount })}
        roundLabel={api.t('round', { n: step + 1, total: rounds.length })}
      />
      <BalanceScale
        key={step}
        testID={`balance-scale-${step}`}
        left={[{ id: `load-${step}`, art: GOOD_ART[round.good], label: api.t(`good.${round.good}`), sub: unit(round.amount), weight: round.amount }]}
        weights={round.weights.map((w, i) => ({ id: `w${step}-${i}`, art: coins ? 'object.coins' : 'akhlaq.weight', label: unit(w), weight: w }))}
        hints={step === 0}
        prompt={api.t(coins ? 'play.change' : 'play.weigh')}
        onDone={({ mistakes: m }) => next(m)}
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  order: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.sm, marginBottom: spacing.sm },
  orderText: { flex: 1, gap: 2, alignItems: 'flex-start' },
});

export const honestScalesGame: GameDef<ScalesConfig> = {
  id: 'honest-scales',
  topicId: 'akhlaq',
  i18n: scalesI18n,
  coverArt: 'akhlaq.market-stall',
  hintArt: 'object.scales',
  component: HonestScalesGame,
  levels: [
    {
      level: 1,
      config: { rounds: [{ good: 'dates', amount: 3, weights: [1, 2, 5] }, { good: 'olives', amount: 4, weights: [1, 2, 2] }, { good: 'grain', amount: 6, weights: [1, 5, 2] }], fact: FACTS.full.id },
      facts: [FACTS.full],
    },
    {
      level: 2,
      config: { rounds: [{ good: 'honey', amount: 7, weights: [1, 2, 10, 5, 2] }, { good: 'dates', amount: 9, weights: [2, 2, 5, 5, 1] }, { good: 'grain', amount: 12, weights: [5, 5, 2, 1, 10] }], fact: FACTS.short.id },
      facts: [FACTS.short],
    },
    {
      level: 3,
      config: {
        rounds: [{ good: 'olives', amount: 8, weights: [5, 2, 2, 1, 10] }, { good: 'change', amount: 3, weights: [2, 5, 1, 1] }, { good: 'honey', amount: 11, weights: [10, 5, 2, 2, 1] }, { good: 'change', amount: 6, weights: [5, 2, 2, 1, 10] }],
        fact: FACTS.cheat.id,
      },
      facts: [FACTS.cheat, FACTS.sidq],
    },
  ],
  order: 10,
};

export function registerHonestScalesGame(): void {
  registerGame(honestScalesGame);
}

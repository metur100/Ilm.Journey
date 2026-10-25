import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, PourFill, useKitColors } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { F, L } from '../shared/facts';
import { waterI18n } from './i18n';

/*
 * Water for the Thirsty – PourFill (Sahih al-Bukhari 2363: the man who filled his shoe with water for a thirsty dog).
 * The animal waiting at the well is shown above the vessel. Every level brings other animals:
 * L1: the shoe for the dog (the hadith) and a bowl for the cat, wide lines. L2: the birds, the sheep and the goat.
 * L3: a caravan at the well – the camel, the horse and the donkey, narrow lines.
 */

interface Drink {
  id: string;
  animal: string;
  vessel: string;
  art: string;
  target: number;
}

export interface WaterConfig {
  prompt: string;
  drinks: Drink[];
  tolerance: number;
  fact: string;
}

const DOG: Drink = { id: 'dog', animal: 'animal.dog', vessel: 'shoe', art: 'akhlaq.leather-shoe', target: 0.7 };
const CAT: Drink = { id: 'cat', animal: 'animal.cat', vessel: 'bowl', art: 'akhlaq.water-bowl', target: 0.5 };
const BIRDS: Drink = { id: 'birds', animal: 'animal.birds', vessel: 'dish', art: 'akhlaq.bird-dish', target: 0.35 };
const SHEEP: Drink = { id: 'sheep', animal: 'animal.sheep', vessel: 'trough', art: 'akhlaq.trough', target: 0.85 };
const GOAT: Drink = { id: 'goat', animal: 'animal.goat', vessel: 'bowl', art: 'object.bowl', target: 0.6 };
const CAMEL: Drink = { id: 'camel', animal: 'animal.camel', vessel: 'bucket', art: 'object.well-bucket', target: 0.8 };
const HORSE: Drink = { id: 'horse', animal: 'animal.horse', vessel: 'trough', art: 'akhlaq.trough', target: 0.45 };
const DONKEY: Drink = { id: 'donkey', animal: 'animal.donkey', vessel: 'bowl', art: 'object.bowl', target: 0.65 };

const FACTS = { dog: F.dogWater(), example: L.rahmahExample(), every: F.everyLivingBeing() };

function Waiting({ drink, done, label }: { drink?: Drink; done: boolean; label: string }) {
  const k = useKitColors();
  return (
    <View style={[styles.stage, { backgroundColor: k.accentSoft, borderColor: k.boardBorder }]} accessible accessibilityLabel={label}>
      {drink && !done ? (
        <Animated.View key={drink.id} entering={ZoomIn.springify().damping(14)} style={styles.row}>
          <Art name={drink.animal} size={72} />
          <Art name={drink.art} size={56} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.row}>
          <Art name="akhlaq.thirsty-dog" size={120} />
        </Animated.View>
      )}
      <AppText variant="small" color={k.text} align="center" numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

function WaterForTheThirstyGame(api: GameApi<WaterConfig>) {
  const { drinks, tolerance, prompt, fact } = api.config;
  const [done, setDone] = useState(0);
  const current = drinks[done];
  const finished = done >= drinks.length;
  return (
    <GameBoard api={api}>
      <Waiting drink={current} done={finished} label={finished ? api.t('stage.done') : api.t('stage.drinking', { animal: api.t(`animal.${current.id}`) })} />
      <PourFill
        vessels={drinks.map((d) => ({ id: d.id, art: d.art, label: api.t(`vessel.${d.vessel}`), target: d.target, tolerance }))}
        liquid="water"
        prompt={api.t(prompt)}
        onProgress={({ done: n }) => setDone(n)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: drinks.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', gap: spacing.xs, borderRadius: radius.lg, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.sm, minHeight: 110 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
});

export const waterForTheThirstyGame: GameDef<WaterConfig> = {
  id: 'water-for-the-thirsty',
  topicId: 'akhlaq',
  i18n: waterI18n,
  coverArt: 'akhlaq.thirsty-dog',
  hintArt: 'akhlaq.leather-shoe',
  component: WaterForTheThirstyGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', drinks: [DOG, CAT], tolerance: 0.1, fact: FACTS.dog.id }, facts: [FACTS.dog] },
    { level: 2, config: { prompt: 'play.l2', drinks: [BIRDS, SHEEP, GOAT], tolerance: 0.07, fact: FACTS.example.id }, facts: [FACTS.example] },
    { level: 3, config: { prompt: 'play.l3', drinks: [CAMEL, HORSE, DONKEY], tolerance: 0.045, fact: FACTS.every.id }, facts: [FACTS.every] },
  ],
  order: 20,
};

export function registerWaterForTheThirstyGame(): void {
  registerGame(waterForTheThirstyGame);
}

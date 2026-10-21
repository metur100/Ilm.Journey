import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { CatchGame, GameBoard, kitResult, useMeasure } from '@/core/games/kit';

import { F, L } from '../shared/facts';
import { stormI18n } from './i18n';

/*
 * Calm the Storm – CatchGame. Calm reactions to anger fall with the angry ones; catching the calm ones clears the
 * storm sky behind the lanes. L1: calm speed, few angry ones, hints. L2: normal speed, as many angry as calm ones.
 * L3: four lanes, every reaction, a bigger goal.
 */

interface Reaction {
  id: string;
  art?: string;
  good: boolean;
}

export interface StormConfig {
  prompt: string;
  items: Reaction[];
  goal: number;
  lanes: 3 | 4;
  speed: 'calm' | 'normal';
  hints: boolean;
  fact: string;
}

const SIT: Reaction = { id: 'sit', art: 'akhlaq.chair', good: true };
const QUIET: Reaction = { id: 'quiet', art: 'akhlaq.quiet-bubble', good: true };
const REFUGE: Reaction = { id: 'refuge', good: true };
const FORGIVE: Reaction = { id: 'forgive', art: 'ui.heart', good: true };
const SHOUT: Reaction = { id: 'shout', art: 'akhlaq.shout-bubble', good: false };
const SLAM: Reaction = { id: 'slam', art: 'akhlaq.slam-door', good: false };
const MEAN: Reaction = { id: 'mean', art: 'akhlaq.mean-bubble', good: false };
const THROW: Reaction = { id: 'throw', art: 'akhlaq.broken-cup', good: false };
// New reactions for levels 2 and 3 – each level has its own set, never the same cards again.
const BREATHE: Reaction = { id: 'breathe', art: 'akhlaq.quiet-bubble', good: true };
const WALK: Reaction = { id: 'walk', art: 'ui.heart', good: true };
const MOCK: Reaction = { id: 'mock', art: 'akhlaq.mean-bubble', good: false };
const PUSH: Reaction = { id: 'push', art: 'akhlaq.shout-bubble', good: false };
const PRAY: Reaction = { id: 'pray', art: 'object.prayer-mat', good: true };
const HELP: Reaction = { id: 'help', art: 'ui.heart', good: true };
const SMILE: Reaction = { id: 'smile', art: 'ui.heart', good: true };
const TIMEOUT: Reaction = { id: 'timeout', art: 'object.clock', good: true };
const COUNT: Reaction = { id: 'count', art: 'object.clock', good: true };
const YELL: Reaction = { id: 'yell', art: 'akhlaq.shout-bubble', good: false };
const HIT: Reaction = { id: 'hit', art: 'akhlaq.slam-door', good: false };
const INSULT: Reaction = { id: 'insult', art: 'akhlaq.mean-bubble', good: false };
const BREAK: Reaction = { id: 'break', art: 'akhlaq.broken-cup', good: false };

const FACTS = { sit: F.sitDown(), noAnger: F.noAnger(), strong: F.strongOne(), forgive: L.forgiveness() };

function StormSky({ calm }: { calm: number }) {
  const { w, h, onLayout } = useMeasure();
  const storm = useSharedValue(1);
  useEffect(() => {
    storm.set(withTiming(1 - calm, { duration: 700 }));
  }, [calm, storm]);
  const style = useAnimatedStyle(() => ({ opacity: storm.value }));
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      {w > 0 ? (
        <>
          <Art name="akhlaq.calm-sky" size={w} height={h} fit="cover" />
          <Animated.View style={[StyleSheet.absoluteFill, style]}>
            <Art name="akhlaq.storm-sky" size={w} height={h} fit="cover" />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

function CalmTheStormGame(api: GameApi<StormConfig>) {
  const { items, goal, lanes, speed, hints, prompt, fact } = api.config;
  const [caught, setCaught] = useState(0);
  return (
    <GameBoard api={api} padding={8} decorate={false}>
      <StormSky calm={caught / goal} />
      <CatchGame
        items={items.map((i) => ({ id: i.id, art: i.art, label: api.t(`r.${i.id}`), good: i.good }))}
        goal={goal}
        lanes={lanes}
        speed={speed}
        hints={hints}
        prompt={api.t(prompt)}
        onProgress={({ done }) => setCaught(done)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: goal, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const calmTheStormGame: GameDef<StormConfig> = {
  id: 'calm-the-storm',
  topicId: 'akhlaq',
  i18n: stormI18n,
  coverArt: 'akhlaq.storm-sky',
  hintArt: 'akhlaq.chair',
  component: CalmTheStormGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', items: [SIT, QUIET, FORGIVE, SHOUT, SLAM], goal: 4, lanes: 3, speed: 'calm', hints: true, fact: FACTS.sit.id }, facts: [FACTS.sit] },
    { level: 2, config: { prompt: 'play.l2', items: [REFUGE, BREATHE, WALK, TIMEOUT, MEAN, THROW, MOCK, PUSH], goal: 6, lanes: 3, speed: 'normal', hints: false, fact: FACTS.noAnger.id }, facts: [FACTS.noAnger] },
    { level: 3, config: { prompt: 'play.l3', items: [PRAY, HELP, SMILE, COUNT, YELL, HIT, INSULT, BREAK], goal: 8, lanes: 4, speed: 'normal', hints: false, fact: FACTS.strong.id }, facts: [FACTS.strong, FACTS.forgive] },
  ],
  order: 80,
};

export function registerCalmTheStormGame(): void {
  registerGame(calmTheStormGame);
}

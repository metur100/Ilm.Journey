import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { CatchGame, type CatchItem, GameBoard, kitResult, ProgressDots } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { missedFacts } from './define';
import { TargetBar } from './ui';
import { useArabicVoice } from './voice';

/*
 * Rounds of the kit's CatchGame: each round has a target that is said (Arabic voice) and/or shown, and things to catch
 * floating down. When a round is finished the next one starts; after the last one the level result is reported.
 */

export interface CatchRound {
  id: string;
  /** Arabic text the voice says (letter, syllable). */
  say: string;
  /** Text shown next to the speaker (hidden when `hidden` – then only the voice gives the target). */
  show: string;
  /** Shown big beside the target text (e.g. the letter itself). */
  arabic?: string;
  items: CatchItem[];
  goal: number;
}

export interface CatchRoundsProps {
  api: GameApi<unknown>;
  rounds: CatchRound[];
  hints: boolean;
  /** Only the voice says the target (the text appears anyway when the device has no Arabic voice). */
  hidden?: boolean;
  /** Prompt of a round (already translated). */
  prompt: (round: CatchRound) => string;
  listenLabel: string;
  /** Item id → fact id of a wrong catch (default: the level's first fact). */
  factOf?: (itemId: string, round: CatchRound) => string | undefined;
}

export function CatchRounds({ api, rounds, hints, hidden, prompt, listenLabel, factOf }: CatchRoundsProps) {
  const { available, say } = useArabicVoice();
  const [index, setIndex] = useState(0);
  const totals = useRef({ mistakes: 0, facts: [] as string[], moves: 0 });
  const round = rounds[index];

  useEffect(() => {
    say(round.say);
  }, [round, say]);

  const onDone = ({ mistakes, missed }: { mistakes: number; missed: string[] }) => {
    const t = totals.current;
    t.mistakes += mistakes;
    t.moves += round.goal;
    t.facts.push(...missedFacts(missed, api.facts, factOf ? (id) => factOf(id, round) ?? api.facts[0].id : undefined));
    if (index + 1 < rounds.length) setIndex(index + 1);
    else api.onComplete(kitResult({ moves: t.moves, mistakes: t.mistakes, factsMissed: t.facts }));
  };

  const showText = !hidden || !available;
  return (
    <GameBoard api={api}>
      <View style={styles.top}>
        <ProgressDots total={rounds.length} done={index} />
        <TargetBar text={showText ? round.show : undefined} arabic={showText ? round.arabic : undefined} onListen={() => say(round.say)} listenLabel={listenLabel} />
      </View>
      <CatchGame key={round.id} items={round.items} goal={round.goal} hints={hints} lanes={hints ? 3 : 4} speed={hints ? 'calm' : 'normal'} sky="garden.stars" prompt={prompt(round)} seed={`${api.gameId}:${api.level}:${round.id}`} onDone={onDone} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  top: { gap: spacing.sm, marginBottom: spacing.sm },
});

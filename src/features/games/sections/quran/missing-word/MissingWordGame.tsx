import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { AyahCard } from '../shared/AyahCard';
import { useRounds } from '../shared/game';
import { GapLine } from './GapLine';
import type { MissingWordConfig } from './register';

export function MissingWordGame(api: GameApi<MissingWordConfig>) {
  const { rounds, hints, mode } = api.config;
  const { round, onRoundDone } = useRounds(api, rounds.length, (r) => rounds[r].gaps.length);
  const current = rounds[round];
  const prompt = mode === 'memory' ? 'play.promptMemory' : mode === 'two' ? 'play.promptTwo' : 'play.prompt';
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <AyahCard surah={current.surah} ayah={current.ayah} language={api.language} round={{ index: round, total: rounds.length }} meaning={mode !== 'memory'} listen={mode !== 'memory'} />
        <GapLine key={round} words={current.words} gaps={current.gaps} distractors={current.distractors} hints={hints} prompt={api.t(prompt)} onDone={onRoundDone} />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

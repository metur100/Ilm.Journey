import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, WordTiles } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { AyahCard } from '../shared/AyahCard';
import { useRounds } from '../shared/game';
import type { AyahBuilderConfig } from './register';

export function AyahBuilderGame(api: GameApi<AyahBuilderConfig>) {
  const { rounds, hints, preview, mode } = api.config;
  const { round, onRoundDone } = useRounds(api, rounds.length, (r) => rounds[r].target.length);
  const current = rounds[round];
  const prompt = mode === 'memory' ? 'play.promptMemory' : mode === 'extra' ? 'play.promptExtra' : 'play.prompt';
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <AyahCard surah={current.surah} ayah={current.ayah} language={api.language} round={{ index: round, total: rounds.length }} listen={mode !== 'memory'} />
        <WordTiles
          key={round}
          target={current.target}
          distractors={current.distractors}
          quran
          hints={hints}
          preview={preview}
          prompt={api.t(prompt)}
          onDone={onRoundDone}
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

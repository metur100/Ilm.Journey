import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, JigsawReveal } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { AyahCard } from '../shared/AyahCard';
import { finishWith } from '../shared/game';
import type { SurahPuzzleConfig } from './register';

export function SurahPuzzleGame(api: GameApi<SurahPuzzleConfig>) {
  const { art, surah, ayah, rows, cols, mode, hints, reveal } = api.config;
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <AyahCard surah={surah} ayah={ayah} language={api.language} arabic meaning={false} />
        <JigsawReveal
          art={art}
          rows={rows}
          cols={cols}
          mode={mode}
          hints={hints}
          reveal={reveal}
          prompt={api.t(mode === 'swap' ? 'play.promptSwap' : 'play.promptPlace')}
          onDone={finishWith(api, rows * cols)}
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

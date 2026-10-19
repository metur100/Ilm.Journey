import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, type KitItem } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { finishWith } from '../shared/game';
import { ayahMeaning, ayahRef, surah, surahName } from '../shared/quran';
import type { SurahPuzzleConfig } from './register';

/** Every level is one complete surah: all its ayahs, in order, with nothing skipped. */
export function SurahPuzzleGame(api: GameApi<SurahPuzzleConfig>) {
  const { surah: n, mode, hints } = api.config;
  const items: KitItem[] = surah(n).ayahs.map((a) => {
    const meaning = ayahMeaning(n, a.numberInSurah);
    return mode === 'arabic'
      ? { id: `a${a.numberInSurah}`, arabic: a.arabic, quran: true, sub: meaning }
      : { id: `a${a.numberInSurah}`, label: api.l(meaning), sub: ayahRef(n, a.numberInSurah) };
  });
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <SequenceBoard
          items={items}
          hints={hints}
          prompt={api.t('play.prompt', { name: surahName(n) })}
          onDone={finishWith(api, items.length)}
          seed={`${api.gameId}:${api.level}`}
          testID="surah-puzzle"
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

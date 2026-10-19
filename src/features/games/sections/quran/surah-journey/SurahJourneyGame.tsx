import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, type KitItem } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { useRounds } from '../shared/game';
import { ayahMeaning, surah, surahName } from '../shared/quran';
import type { SurahJourneyConfig } from './register';

/** One complete surah per round: all ayahs, in mushaf order, never skipped. */
export function SurahJourneyGame(api: GameApi<SurahJourneyConfig>) {
  const { surahs, hints } = api.config;
  const { round, onRoundDone } = useRounds(api, surahs.length, (r) => surah(surahs[r]).ayahCount);
  const n = surahs[round];
  const items: KitItem[] = surah(n).ayahs.map((a) => ({
    id: `a${a.numberInSurah}`,
    arabic: a.arabic,
    quran: true,
    sub: ayahMeaning(n, a.numberInSurah),
  }));

  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <SequenceBoard
          key={n}
          items={items}
          hints={hints}
          prompt={api.t('play.prompt', { name: surahName(n), index: round + 1, total: surahs.length })}
          onDone={onRoundDone}
          seed={`${api.gameId}:${api.level}:${n}`}
          testID={`surah-journey-${n}`}
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

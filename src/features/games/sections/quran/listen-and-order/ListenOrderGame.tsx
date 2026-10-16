import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { finishWith } from '../shared/game';
import { listenLabels } from '../shared/i18n';
import { surah, surahName } from '../shared/quran';
import { ListenChip } from '../shared/recitation';
import type { ListenOrderConfig } from './register';

export function ListenOrderGame(api: GameApi<ListenOrderConfig>) {
  const { surah: n, items, variant, hints } = api.config;
  const globals = surah(n).ayahs.map((a) => a.globalNumber);
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <ListenChip ayahs={globals} labels={listenLabels(api.language)} />
        <SequenceBoard
          items={items}
          variant={variant}
          hints={hints}
          prompt={api.t(variant === 'path' ? 'play.promptPath' : 'play.prompt', { name: surahName(n) })}
          onDone={finishWith(api, items.length)}
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
});

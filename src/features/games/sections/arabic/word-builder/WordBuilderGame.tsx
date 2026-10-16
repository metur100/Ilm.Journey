import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Art } from '@/core/art';
import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, ProgressDots, WordTiles, type KitItem } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { TargetBar } from '../shared/ui';
import { useArabicVoice, usePlayIndex } from '../shared/voice';
import { pickWords, type WordBuilderConfig, wordTiles } from './logic';

/**
 * Word Builder: a picture and its word are said; build the word from its letter tiles right to left and watch the
 * letters join. Rounds follow one another; look-alike letters join the tray in level 3.
 */
export function WordBuilderGame(api: GameApi<WordBuilderConfig>) {
  const playIndex = usePlayIndex(api.gameId, api.level);
  const { say } = useArabicVoice();
  const list = useMemo(() => pickWords(api.config, playIndex), [api.config, playIndex]);
  const [index, setIndex] = useState(0);
  const totals = useRef({ mistakes: 0, moves: 0, facts: [] as string[] });
  const word = list[index];
  const tiles = useMemo(() => wordTiles(word, api.config.distractors), [word, api.config.distractors]);

  const onDone = ({ mistakes, missed }: { mistakes: number; missed: string[] }) => {
    say(word.arabic);
    const t = totals.current;
    t.mistakes += mistakes;
    t.moves += tiles.target.length;
    const wordFactId = `word-${word.id}`;
    t.facts.push(...missedFacts(missed, api.facts, () => (api.facts.some((f) => f.id === wordFactId) ? wordFactId : api.facts[0].id)));
    if (index + 1 < list.length) setIndex(index + 1);
    else api.onComplete(kitResult({ moves: t.moves, mistakes: t.mistakes, factsMissed: t.facts }));
  };

  return (
    <GameBoard api={api}>
      <View style={styles.top}>
        <ProgressDots total={list.length} done={index} />
        <TargetBar text={`${api.l(word.meaning)} · ${word.translit}`} onListen={() => say(word.arabic)} listenLabel={api.t('play.listen')}>
          {null}
        </TargetBar>
        {word.art ? (
          <View style={styles.art}>
            <Art name={word.art} size={84} />
          </View>
        ) : null}
      </View>
      <WordTiles
        key={word.id}
        target={tiles.target as KitItem[]}
        distractors={tiles.distractors}
        joiner=""
        hints={api.config.hints}
        prompt={api.t(api.config.hints ? 'play.promptHints' : 'play.prompt')}
        seed={`${api.gameId}:${api.level}:${word.id}`}
        onDone={onDone}
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  top: { gap: spacing.sm },
  art: { alignItems: 'center' },
});

import { useMemo, useRef } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, LetterJoin, type JoinWord } from '@/core/games/kit';
import { localizedFrom } from '@/core/i18n';

import { missedFacts } from '../shared/define';
import { lookAlikes, mustLetter } from '../shared/letters';
import { bareLetters, getWord } from '../shared/words';
import { useArabicVoice, usePlayIndex } from '../shared/voice';

export interface JoinLettersConfig {
  /** Two-letter joins (letters in reading order), or word ids of the vocabulary. */
  pairs?: string[][];
  words?: string[];
  /** Items per play (a block that moves on with every play). */
  count: number;
  hints: boolean;
  /** Put two look-alike letters in the tray. */
  extra: boolean;
}

/** The items of a play: pairs (joined letters, named) or words (joined, with meaning); a moving block of the pool. */
export function joinItems(config: JoinLettersConfig, playIndex: number): JoinWord[] {
  const pool: JoinWord[] = config.pairs
    ? config.pairs.map((letters, i) => ({ id: `p${i}`, letters, meaning: localizedFrom((l) => letters.map((x) => mustLetter(x).name[l]).join(' + ')) }))
    : (config.words ?? []).map((id) => {
        const word = getWord(id);
        return { id, letters: bareLetters(word), word: word.arabic, meaning: localizedFrom((l) => `${word.translit} – ${word.meaning[l]}`) };
      });
  const n = Math.min(config.count, pool.length);
  const start = (Math.max(0, playIndex) * n) % pool.length;
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
}

/**
 * Join the Letters (spajanje harfova): drag the separate letters into place from right to left and watch the font join
 * them into the word – the joined word is real Arabic text, shaped by the Arabic font. Each finished word is said.
 */
export function JoinLettersGame(api: GameApi<JoinLettersConfig>) {
  const playIndex = usePlayIndex(api.gameId, api.level);
  const { say } = useArabicVoice();
  const items = useMemo(() => joinItems(api.config, playIndex), [api.config, playIndex]);
  const extra = useMemo(() => {
    if (!api.config.extra) return undefined;
    const letters = new Set(items.flatMap((w) => w.letters));
    return [...new Set([...letters].flatMap(lookAlikes))].filter((l) => !letters.has(l)).slice(0, 2);
  }, [api.config.extra, items]);
  const said = useRef(0);
  const ends = useMemo(() => items.reduce<number[]>((acc, w) => [...acc, (acc[acc.length - 1] ?? 0) + w.letters.length], []), [items]);
  const total = ends[ends.length - 1];

  return (
    <GameBoard api={api}>
      <LetterJoin
        words={items}
        extraLetters={extra}
        hints={api.config.hints}
        prompt={api.t(api.config.pairs ? 'play.promptPairs' : 'play.prompt')}
        onProgress={({ done }) => {
          const finished = ends.filter((e) => e <= done).length;
          if (finished > said.current) {
            const w = items[finished - 1];
            said.current = finished;
            say(w.word ?? w.letters.join(''));
          }
        }}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: total, mistakes, factsMissed: missedFacts(missed, api.facts) }))}
      />
    </GameBoard>
  );
}

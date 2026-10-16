import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import type { CatchItem } from '@/core/games/kit';
import type { Language } from '@/core/models';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { CatchRounds, type CatchRound } from '../shared/CatchRounds';
import { type Haraka, SYLLABLE_LETTERS, syllable, syllableReading } from '../shared/letters';
import { usePlayIndex } from '../shared/voice';

export interface HarakatSoundsConfig {
  harakat: Haraka[];
  rounds: number;
  hints: boolean;
  /** Only the voice gives the syllable. */
  hidden: boolean;
  /** Add the same vowel on other letters as distractors. */
  otherLetters: boolean;
}

/** Rounds of a play: a letter + haraka to catch; the other harakat on the same letter (and other letters) float too. */
export function buildHarakatRounds(config: HarakatSoundsConfig, playIndex: number, seed: string, language: Language): CatchRound[] {
  const random = seededRandom(hashString(`${seed}:${playIndex}`));
  const letters = shuffle(SYLLABLE_LETTERS.map((s) => s.letter), random);
  return Array.from({ length: config.rounds }, (_, r) => {
    const letter = letters[(r + playIndex * config.rounds) % letters.length];
    const haraka = config.harakat[(r + playIndex) % config.harakat.length];
    const good: CatchItem[] = [0, 1, 2].map((i) => ({ id: `r${r}-ok${i}`, arabic: syllable(letter, haraka), a11y: syllableReading(letter, haraka, language), good: true }));
    const sameLetter: CatchItem[] = config.harakat
      .filter((h) => h !== haraka)
      .flatMap((h) => [0, 1].map((i) => ({ id: `r${r}-${h}${i}`, arabic: syllable(letter, h), a11y: syllableReading(letter, h, language), good: false })));
    const other = letters.find((l) => l !== letter)!;
    const others: CatchItem[] = config.otherLetters ? [{ id: `r${r}-other`, arabic: syllable(other, haraka), a11y: syllableReading(other, haraka, language), good: false }] : [];
    return { id: `r${r}-${haraka}`, say: syllable(letter, haraka), show: syllableReading(letter, haraka, language), arabic: config.hidden ? undefined : syllable(letter, haraka), items: shuffle([...good, ...sameLetter, ...others], random), goal: 3 };
  });
}

/** Harakat Sounds: hear a syllable (بَ ba, بِ bi, بُ bu) and catch the ones with the right vowel mark. */
export function HarakatSoundsGame(api: GameApi<HarakatSoundsConfig>) {
  const playIndex = usePlayIndex(api.gameId, api.level);
  const rounds = useMemo(() => buildHarakatRounds(api.config, playIndex, `${api.gameId}:${api.level}`, api.language), [api.config, api.gameId, api.level, api.language, playIndex]);
  const markFact = (round: CatchRound) => `mark-${round.id.split('-')[1]}`;
  return (
    <CatchRounds
      api={api as GameApi<unknown>}
      rounds={rounds}
      hints={api.config.hints}
      hidden={api.config.hidden}
      listenLabel={api.t('play.listen')}
      prompt={(round) => (api.config.hidden ? api.t('play.promptHidden') : api.t('play.prompt', { sound: round.show }))}
      factOf={(_id, round) => (api.facts.some((f) => f.id === markFact(round)) ? markFact(round) : undefined)}
    />
  );
}

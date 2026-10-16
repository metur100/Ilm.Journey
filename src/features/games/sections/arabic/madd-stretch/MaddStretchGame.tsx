import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, useKitColors, type KitItem } from '@/core/games/kit';
import type { Language } from '@/core/models';
import { radius, spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { type Haraka, HARAKAT, longReading, longSyllable, MADD_LETTER, syllable, syllableReading, SYLLABLE_LETTERS } from '../shared/letters';
import { PlaceRounds, type PlaceRound } from '../shared/PlaceRounds';
import { splitLetters } from '../shared/script';
import { ArabicText, TargetBar } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';
import { getWord } from '../shared/words';

export interface MaddStretchConfig {
  /** Short vowels to stretch (syllable rounds), or word ids (a long vowel letter is missing). */
  harakat?: Haraka[];
  words?: string[];
  rounds: number;
  hints: boolean;
}

export interface MaddRound extends PlaceRound {
  /** Letters before the gap (RTL), the gap index, the full text. */
  letters: string[];
  at: number;
  full: string;
  short?: string;
  reading: string;
  shortReading?: string;
  say: string;
}

const MADD_TILES = (language: Language): KitItem[] => [
  { id: 'alif', arabic: MADD_LETTER.fatha, a11y: { en: 'Alif', de: 'Alif', bs: 'Elif' }[language] },
  { id: 'ya', arabic: MADD_LETTER.kasra, a11y: { en: 'Ya', de: 'Ya', bs: 'Je' }[language] },
  { id: 'waw', arabic: MADD_LETTER.damma, a11y: { en: 'Waw', de: 'Waw', bs: 'Vav' }[language] },
];
const TILE_OF: Record<string, string> = { [MADD_LETTER.fatha]: 'alif', [MADD_LETTER.kasra]: 'ya', [MADD_LETTER.damma]: 'waw' };
const HARAKA_OF_MARK: Record<string, Haraka> = { [HARAKAT.fatha.mark]: 'fatha', [HARAKAT.kasra.mark]: 'kasra', [HARAKAT.damma.mark]: 'damma' };

export function maddRounds(config: MaddStretchConfig, language: Language): MaddRound[] {
  const tiles = MADD_TILES(language);
  if (config.harakat) {
    const letters = SYLLABLE_LETTERS.map((s) => s.letter);
    return Array.from({ length: config.rounds }, (_, i) => {
      const letter = letters[(i * 3 + 2) % letters.length];
      const h = config.harakat![i % config.harakat!.length];
      return {
        id: `r${i}`,
        tiles,
        zones: ['madd'],
        answer: { tile: TILE_OF[MADD_LETTER[h]], zone: 'madd' },
        letters: [syllable(letter, h)],
        at: 1,
        full: longSyllable(letter, h),
        short: syllable(letter, h),
        reading: longReading(letter, h),
        shortReading: syllableReading(letter, h, language),
        say: longSyllable(letter, h),
      };
    });
  }
  return (config.words ?? []).slice(0, config.rounds).map((id, i) => {
    const word = getWord(id);
    const parts = splitLetters(word.arabic);
    // The first long vowel: a bare ا / ي / و right after a letter with the matching short vowel.
    const at = parts.findIndex((p, j) => j > 0 && p.text === p.base && HARAKA_OF_MARK[parts[j - 1].text.slice(parts[j - 1].base.length)] !== undefined && MADD_LETTER[HARAKA_OF_MARK[parts[j - 1].text.slice(parts[j - 1].base.length)]] === p.base);
    if (at < 0) throw new Error(`No long vowel in ${id}`);
    return {
      id: `r${i}`,
      tiles,
      zones: ['madd'],
      answer: { tile: TILE_OF[parts[at].base], zone: 'madd' },
      letters: parts.map((p) => p.text),
      at,
      full: word.arabic,
      reading: `${word.translit} – ${word.meaning[language]}`,
      say: word.arabic,
    };
  });
}

/** The golden stretch bar: grows long when the vowel is stretched. */
function StretchBar({ on, reduced }: { on: boolean; reduced: boolean }) {
  const k = useKitColors();
  const w = useSharedValue(on ? 1 : 0.25);
  useEffect(() => {
    w.set(reduced ? withTiming(on ? 1 : 0.25, { duration: 150 }) : withSpring(on ? 1 : 0.25, { damping: 12 }));
  }, [on, reduced, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[styles.track, { backgroundColor: k.slotFill }]}>
      <Animated.View style={[styles.bar, { backgroundColor: k.gold }, style]} />
    </View>
  );
}

/**
 * Madd Stretch: a short vowel becomes long when its letter follows – drop alif after fatha, ya after kasra, waw after
 * damma, and watch (and hear) the sound stretch. L3 finds the missing long vowel inside words.
 */
export function MaddStretchGame(api: GameApi<MaddStretchConfig>) {
  const k = useKitColors();
  const { say } = useArabicVoice();
  const rounds = useMemo(
    () => maddRounds(api.config, api.language),
     
    [api.config, api.language],
  );
  const byId = (id: string) => rounds.find((r) => r.id === id)!;

  return (
    <GameBoard api={api}>
      <PlaceRounds
        rounds={rounds}
        hints={api.config.hints}
        prompt={api.t(api.config.words ? 'play.words' : 'play.syllables')}
        onRound={(round) => say(byId(round.id).say)}
        renderStage={({ round, solved, zone }) => {
          const r = byId(round.id);
          return (
            <View style={styles.stage}>
              <TargetBar text={r.shortReading ? `${r.shortReading} → ${r.reading}` : r.reading} onListen={() => say(r.say)} listenLabel={api.t('play.listen')} />
              <View style={[styles.word, { backgroundColor: solved ? k.rightSoft : k.tileFace, borderColor: solved ? k.right : k.tileBorder }]}>
                {solved ? (
                  <ArabicText size={64}>{r.full}</ArabicText>
                ) : (
                  <View style={styles.row}>
                    {r.letters.slice(0, r.at).map((l, i) => (
                      <ArabicText key={`a${i}`} size={56}>
                        {l}
                      </ArabicText>
                    ))}
                    {zone('madd', styles.zone, api.t('play.zone'))}
                    {r.letters.slice(r.at + 1).map((l, i) => (
                      <ArabicText key={`b${i}`} size={56}>
                        {l}
                      </ArabicText>
                    ))}
                  </View>
                )}
                <StretchBar on={solved} reduced={api.reducedMotion} />
              </View>
            </View>
          );
        }}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: rounds.length, mistakes, factsMissed: missedFacts(missed, api.facts) }))}
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: 'stretch', gap: spacing.md, alignItems: 'center' },
  word: { borderRadius: radius.xl, borderWidth: 2, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minWidth: 220, alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  zone: { width: 64, height: 80 },
  track: { height: 10, alignSelf: 'stretch', borderRadius: radius.pill, overflow: 'hidden' },
  bar: { height: 10, borderRadius: radius.pill, alignSelf: 'flex-end' },
});

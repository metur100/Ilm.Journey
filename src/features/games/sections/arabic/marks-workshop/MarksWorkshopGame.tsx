import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, useKitColors, type KitItem } from '@/core/games/kit';
import type { Language } from '@/core/models';
import { radius, spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { consonantOf, HARAKAT, type Haraka, SHADDA, SUKUN, syllableReading, SYLLABLE_LETTERS, TANWIN, tanwinReading } from '../shared/letters';
import { PlaceRounds, type PlaceRound } from '../shared/PlaceRounds';
import { splitLetters } from '../shared/script';
import { ArabicText, TargetBar } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';
import { getWord } from '../shared/words';

export type MarksMode = 'sukun' | 'tanwin' | 'words';

export interface MarksWorkshopConfig {
  mode: MarksMode;
  rounds: number;
  hints: boolean;
  /** Words (mode `words`): one letter's sukun / shadda is missing. */
  words?: string[];
}

const DOTTED = '◌';
const markTile = (id: string, mark: string, a11y: string): KitItem => ({ id, arabic: DOTTED + mark, a11y });

export interface MarkRound extends PlaceRound {
  /** Letters of the stage (RTL), the index of the one that takes the mark, the text with and without it. */
  letters: string[];
  at: number;
  bare: string;
  full: string;
  reading: string;
  say: string;
  fact: string;
}

const NAMES: Record<string, Record<Language, string>> = {
  fatha: { en: 'fatha', de: 'Fatha', bs: 'fetha' },
  kasra: { en: 'kasra', de: 'Kasra', bs: 'kesra' },
  damma: { en: 'damma', de: 'Damma', bs: 'damma' },
  sukun: { en: 'sukun', de: 'Sukun', bs: 'sukun' },
  shadda: { en: 'shadda', de: 'Schadda', bs: 'šedda' },
  tanwin: { en: 'tanwin', de: 'Tanwin', bs: 'tenvin' },
};

export function markRounds(config: MarksWorkshopConfig, language: Language, noVowel: (c: string) => string): MarkRound[] {
  const letters = SYLLABLE_LETTERS.map((s) => s.letter);
  if (config.mode === 'sukun') {
    const marks: (Haraka | 'sukun')[] = ['sukun', 'fatha', 'sukun', 'kasra', 'damma', 'sukun'];
    const tiles = [markTile('fatha', HARAKAT.fatha.mark, NAMES.fatha[language]), markTile('kasra', HARAKAT.kasra.mark, NAMES.kasra[language]), markTile('damma', HARAKAT.damma.mark, NAMES.damma[language]), markTile('sukun', SUKUN, NAMES.sukun[language])];
    return Array.from({ length: config.rounds }, (_, i) => {
      const letter = letters[(i * 3) % letters.length];
      const m = marks[i % marks.length];
      const full = letter + (m === 'sukun' ? SUKUN : HARAKAT[m].mark);
      return { id: `r${i}`, tiles, zones: ['mark'], answer: { tile: m, zone: 'mark' }, letters: [letter], at: 0, bare: letter, full, reading: m === 'sukun' ? noVowel(consonantOf(letter)) : syllableReading(letter, m, language), say: full, fact: m === 'sukun' ? 'mark-sukun' : 'harakat-sounds' };
    });
  }
  if (config.mode === 'tanwin') {
    const order: Haraka[] = ['damma', 'kasra', 'fatha'];
    const tiles = [markTile('t-damma', TANWIN.damma, `${NAMES.tanwin[language]} ${NAMES.damma[language]}`), markTile('t-kasra', TANWIN.kasra, `${NAMES.tanwin[language]} ${NAMES.kasra[language]}`), markTile('t-fatha', TANWIN.fatha, `${NAMES.tanwin[language]} ${NAMES.fatha[language]}`), markTile('damma', HARAKAT.damma.mark, NAMES.damma[language])];
    return Array.from({ length: config.rounds }, (_, i) => {
      const letter = letters[(i * 7 + 1) % letters.length];
      const h = order[i % order.length];
      const full = letter + TANWIN[h];
      return { id: `r${i}`, tiles, zones: ['mark'], answer: { tile: `t-${h}`, zone: 'mark' }, letters: [letter], at: 0, bare: letter, full, reading: tanwinReading(letter, h, language), say: full, fact: 'mark-tanwin' };
    });
  }
  const tiles = [markTile('sukun', SUKUN, NAMES.sukun[language]), markTile('shadda', SHADDA, NAMES.shadda[language]), markTile('fatha', HARAKAT.fatha.mark, NAMES.fatha[language]), markTile('damma', HARAKAT.damma.mark, NAMES.damma[language])];
  return (config.words ?? []).slice(0, config.rounds).map((id, i) => {
    const word = getWord(id);
    const parts = splitLetters(word.arabic);
    const at = parts.findIndex((p) => p.text.includes(SHADDA) || p.text.includes(SUKUN));
    const mark = parts[at].text.includes(SHADDA) ? 'shadda' : 'sukun';
    const stripped = parts.map((p, j) => (j === at ? p.text.replace(mark === 'shadda' ? SHADDA : SUKUN, '') : p.text));
    return {
      id: `r${i}`,
      tiles,
      zones: ['mark'],
      answer: { tile: mark, zone: 'mark' },
      letters: stripped,
      at,
      bare: stripped.join(''),
      full: word.arabic,
      reading: `${word.translit} – ${word.meaning[language]}`,
      say: word.arabic,
      fact: mark === 'shadda' ? 'shadda-doubles' : 'mark-sukun',
    };
  });
}

/**
 * Marks Workshop: put the missing mark on the letter so it reads like the sound you hear – sukun (no vowel), tanwin
 * (an added "n") and shadda (a doubled letter) inside real words.
 */
export function MarksWorkshopGame(api: GameApi<MarksWorkshopConfig>) {
  const k = useKitColors();
  const { say } = useArabicVoice();
  const rounds = useMemo(
    () => markRounds(api.config, api.language, (c) => api.t('play.noVowel', { sound: c })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api.config, api.language],
  );
  const byId = (id: string) => rounds.find((r) => r.id === id)!;

  return (
    <GameBoard api={api}>
      <PlaceRounds
        rounds={rounds}
        hints={api.config.hints}
        prompt={api.t(`play.${api.config.mode}`)}
        onRound={(round) => say(byId(round.id).say)}
        renderStage={({ round, solved, zone }) => {
          const r = byId(round.id);
          return (
            <View style={styles.stage}>
              <TargetBar text={r.reading} onListen={() => say(r.say)} listenLabel={api.t('play.listen')} />
              {solved ? (
                <View style={[styles.word, { backgroundColor: k.rightSoft, borderColor: k.right }]}>
                  <ArabicText size={64}>{r.full}</ArabicText>
                </View>
              ) : (
                <View style={[styles.word, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
                  <View style={styles.row}>
                    {r.letters.map((l, i) =>
                      i === r.at ? (
                        <View key={i} style={styles.target}>
                          {zone('mark', styles.zone, api.t('play.zone'))}
                          <View style={styles.overlay} pointerEvents="none">
                            <ArabicText size={52} color={k.text}>
                              {l}
                            </ArabicText>
                          </View>
                        </View>
                      ) : (
                        <ArabicText key={i} size={44} color={k.textMuted}>
                          {l}
                        </ArabicText>
                      ),
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        }}
        onDone={({ mistakes, missed }) =>
          api.onComplete(kitResult({ moves: rounds.length, mistakes, factsMissed: missedFacts(missed, api.facts, (id) => (api.facts.some((f) => f.id === byId(id).fact) ? byId(id).fact : api.facts[0].id)) }))
        }
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: 'stretch', gap: spacing.md, alignItems: 'center' },
  word: { borderRadius: radius.xl, borderWidth: 2, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minWidth: 180, alignItems: 'center' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  target: { width: 84, height: 110, alignItems: 'center', justifyContent: 'center' },
  zone: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

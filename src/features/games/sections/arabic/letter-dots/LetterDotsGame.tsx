import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, useKitColors, type KitItem } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';
import { radius, spacing } from '@/core/theme';

import { missedFacts } from '../shared/define';
import { LETTER_LESSON } from '../shared/lessonText';
import { mustLetter } from '../shared/letters';
import { PlaceRounds, type PlaceRound } from '../shared/PlaceRounds';
import { ArabicText, TargetBar } from '../shared/ui';
import { useArabicVoice } from '../shared/voice';

export interface LetterDotsConfig {
  letters: string[];
  hints: boolean;
  /** Only the voice names the letter (the name appears when there is no Arabic voice). */
  voiceOnly: boolean;
  /** Letter → fact id for a mistake on it (default: the level's first fact). */
  factOf?: Record<string, string>;
}

const DOT_TILES: { id: string; label: string; a11y: LocalizedText }[] = [
  { id: 'd1', label: '◆', a11y: { en: 'one dot', de: 'ein Punkt', bs: 'jedna tačka' } },
  { id: 'd2', label: '◆◆', a11y: { en: 'two dots', de: 'zwei Punkte', bs: 'dvije tačke' } },
  { id: 'd3', label: '◆◆◆', a11y: { en: 'three dots', de: 'drei Punkte', bs: 'tri tačke' } },
];

export function dotRounds(letters: string[]): PlaceRound[] {
  return letters.map((letter) => {
    const info = mustLetter(letter);
    if (!info.dots || !info.dotPlace) throw new Error(`${letter} has no dots`);
    const zones = info.skeleton === 'ح' ? ['above', 'inside', 'below'] : ['above', 'below'];
    const tiles: KitItem[] = DOT_TILES.map((t) => ({ id: t.id, label: t.label, a11y: t.a11y }));
    return { id: `l${info.position}`, tiles, zones, answer: { tile: `d${info.dots}`, zone: info.dotPlace } };
  });
}

/**
 * Letter Dots: the body of a letter waits without its dots – drop the right number of dots in the right place (above,
 * inside, below) and the letter appears. L1 ب ت ث ن ي · L2 the other dotted letters · L3 by the sound alone.
 */
export function LetterDotsGame(api: GameApi<LetterDotsConfig>) {
  const k = useKitColors();
  const { available, say } = useArabicVoice();
  const rounds = useMemo(
    () => dotRounds(api.config.letters).map((r, i) => ({ ...r, done: api.l(LETTER_LESSON[api.config.letters[i]]) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api.config, api.language],
  );
  const totals = useRef(rounds.length);
  const showName = !api.config.voiceOnly || !available;
  const zoneLabel = (z: string) => api.t(`zone.${z}`);

  return (
    <GameBoard api={api}>
      <PlaceRounds
        rounds={rounds}
        hints={api.config.hints}
        prompt={api.t(api.config.voiceOnly ? 'play.promptVoice' : 'play.prompt')}
        onRound={(round) => say(mustLetter(api.config.letters[rounds.indexOf(round)]).letter)}
        renderStage={({ round, solved, zone }) => {
          const letter = api.config.letters[rounds.indexOf(round)];
          const info = mustLetter(letter);
          return (
            <View style={styles.stage}>
              <TargetBar text={showName ? api.l(info.name) : api.t('play.which')} onListen={() => say(letter)} listenLabel={api.t('play.listen')} />
              <View style={[styles.letterBox, { backgroundColor: k.tileFace, borderColor: solved ? k.right : k.tileBorder }]}>
                {zone('above', styles.zoneWide, zoneLabel('above'))}
                <View style={styles.middle}>
                  <ArabicText size={110} color={k.text} testID="dots-letter">
                    {solved ? info.letter : info.skeleton}
                  </ArabicText>
                  {round.zones.includes('inside') ? <View style={styles.inside}>{zone('inside', styles.zoneSmall, zoneLabel('inside'))}</View> : null}
                </View>
                {zone('below', styles.zoneWide, zoneLabel('below'))}
              </View>
            </View>
          );
        }}
        onDone={({ mistakes, missed }) =>
          api.onComplete(
            kitResult({
              moves: totals.current,
              mistakes,
              factsMissed: missedFacts(missed, api.facts, (id) => {
                const letter = api.config.letters[rounds.findIndex((r) => r.id === id)];
                return api.config.factOf?.[letter] ?? api.facts[0].id;
              }),
            }),
          )
        }
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: 'stretch', gap: spacing.md, alignItems: 'center' },
  letterBox: { alignItems: 'center', borderRadius: radius.xl, borderWidth: 2, padding: spacing.sm, gap: spacing.xs, minWidth: 200 },
  middle: { alignItems: 'center', justifyContent: 'center' },
  inside: { position: 'absolute', bottom: 18 },
  zoneWide: { width: 150, height: 52 },
  zoneSmall: { width: 56, height: 44 },
});

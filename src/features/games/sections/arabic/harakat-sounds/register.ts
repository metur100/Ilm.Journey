import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, MARK_FACTS } from '../shared/facts';
import type { HarakatSoundsConfig } from './HarakatSoundsGame';

/*
 * Harakat Sounds (CatchGame rounds): hear a syllable and catch the bubbles with the right vowel mark.
 * L1 fatha and kasra, with the reading shown · L2 fatha, kasra and damma · L3 voice only, with other letters mixed in.
 */

export const harakatSoundsI18n = defineNamespace('game.harakat-sounds', {
  en: {
    title: 'Harakat Sounds',
    description: 'Fatha, kasra and damma change a letter\'s sound. Hear the syllable and catch the ones with the right mark.',
    howTo: 'Listen to the syllable, then move the basket under the bubbles that sound like it.',
    'play.prompt': 'Catch three bubbles that say "{sound}".',
    'play.promptHidden': 'Listen – then catch three bubbles with that sound.',
    'play.listen': 'Listen to the syllable',
  },
  de: {
    title: 'Harakat-Laute',
    description: 'Fatha, Kasra und Damma ändern den Laut eines Buchstabens. Hör die Silbe und fang die mit dem richtigen Zeichen.',
    howTo: 'Hör dir die Silbe an und schieb den Korb unter die Blasen, die so klingen.',
    'play.prompt': 'Fang drei Blasen, die „{sound}“ sagen.',
    'play.promptHidden': 'Hör genau hin – und fang drei Blasen mit diesem Laut.',
    'play.listen': 'Silbe anhören',
  },
  bs: {
    title: 'Glasovi hareketa',
    description: 'Fetha, kesra i damma mijenjaju glas harfa. Poslušaj slog i uhvati one s pravim znakom.',
    howTo: 'Poslušaj slog, pa pomjeri korpu ispod mjehurića koji tako zvuče.',
    'play.prompt': 'Uhvati tri mjehurića koji kažu „{sound}“.',
    'play.promptHidden': 'Poslušaj – pa uhvati tri mjehurića s tim glasom.',
    'play.listen': 'Poslušaj slog',
  },
});

export const harakatSoundsGame = arabicGame<HarakatSoundsConfig>({
  id: 'harakat-sounds',
  i18n: harakatSoundsI18n,
  coverArt: 'arabic.harakat-sounds',
  hintArt: 'kit.catch',
  load: () => (require('./HarakatSoundsGame') as typeof import('./HarakatSoundsGame')).HarakatSoundsGame,
  levels: [
    { config: { harakat: ['fatha', 'kasra'], rounds: 4, hints: true, hidden: false, otherLetters: false }, facts: [MARK_FACTS.fatha, MARK_FACTS.kasra] },
    { config: { harakat: ['fatha', 'kasra', 'damma'], rounds: 5, hints: false, hidden: false, otherLetters: false }, facts: [MARK_FACTS.damma, FACTS.harakat] },
    { config: { harakat: ['damma', 'fatha', 'kasra'], rounds: 5, hints: false, hidden: true, otherLetters: true }, facts: [FACTS.harakatMatch] },
  ],
  teaches: { questionKeys: ['quest:arabic-fatha', 'quest:arabic-harakat-match'] },
  order: 90,
});

export function registerHarakatSoundsGame(): void {
  registerGame(harakatSoundsGame);
}

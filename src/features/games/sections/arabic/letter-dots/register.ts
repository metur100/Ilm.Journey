import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, letterFact } from '../shared/facts';
import type { LetterDotsConfig } from './LetterDotsGame';

/*
 * Letter Dots (local PlaceRounds engine): give the letter body its dots – the right number in the right place.
 * L1 ب ت ث ن ي (named, with hints) · L2 the other dotted letters · L3 the letter is only heard.
 */

const zones = (en: [string, string, string], de: [string, string, string], bs: [string, string, string]) => ({ en, de, bs });
const Z = zones(['Above the letter', 'Inside the letter', 'Below the letter'], ['Über dem Buchstaben', 'Im Buchstaben', 'Unter dem Buchstaben'], ['Iznad harfa', 'U harfu', 'Ispod harfa']);

export const letterDotsI18n = defineNamespace('game.letter-dots', {
  en: {
    title: 'Letter Dots',
    description: 'Many letters differ only by their dots. Give each letter body the right dots in the right place.',
    howTo: 'Drag one, two or three dots above, inside or below the letter body.',
    'play.prompt': 'How many dots, and where? Drop them on the letter.',
    'play.promptVoice': 'Listen to the letter, then give the body its dots.',
    'play.which': 'Which letter do you hear?',
    'play.listen': 'Listen to the letter',
    'zone.above': Z.en[0],
    'zone.inside': Z.en[1],
    'zone.below': Z.en[2],
  },
  de: {
    title: 'Buchstabenpunkte',
    description: 'Viele Buchstaben unterscheiden sich nur durch Punkte. Gib jedem Buchstabenkörper die richtigen Punkte an der richtigen Stelle.',
    howTo: 'Zieh einen, zwei oder drei Punkte über, in oder unter den Buchstabenkörper.',
    'play.prompt': 'Wie viele Punkte, und wohin? Leg sie auf den Buchstaben.',
    'play.promptVoice': 'Hör dir den Buchstaben an und gib dem Körper seine Punkte.',
    'play.which': 'Welchen Buchstaben hörst du?',
    'play.listen': 'Buchstaben anhören',
    'zone.above': Z.de[0],
    'zone.inside': Z.de[1],
    'zone.below': Z.de[2],
  },
  bs: {
    title: 'Tačke harfova',
    description: 'Mnogi harfovi se razlikuju samo po tačkama. Daj svakom tijelu harfa prave tačke na pravo mjesto.',
    howTo: 'Prevuci jednu, dvije ili tri tačke iznad, u ili ispod tijela harfa.',
    'play.prompt': 'Koliko tačaka i gdje? Spusti ih na harf.',
    'play.promptVoice': 'Poslušaj harf, pa daj tijelu njegove tačke.',
    'play.which': 'Koji harf čuješ?',
    'play.listen': 'Poslušaj harf',
    'zone.above': Z.bs[0],
    'zone.inside': Z.bs[1],
    'zone.below': Z.bs[2],
  },
});

export const letterDotsGame = arabicGame<LetterDotsConfig>({
  id: 'letter-dots',
  i18n: letterDotsI18n,
  coverArt: 'arabic.dots-inkwell',
  hintArt: 'arabic.dots-inkwell',
  load: () => (require('./LetterDotsGame') as typeof import('./LetterDotsGame')).LetterDotsGame,
  levels: [
    { config: { letters: ['ب', 'ت', 'ث', 'ن', 'ي'], hints: true, voiceOnly: false }, facts: [FACTS.dots] },
    { config: { letters: ['ج', 'خ', 'ذ', 'ز', 'ش', 'ض', 'ظ', 'غ', 'ف', 'ق'], hints: false, voiceOnly: false, factOf: { ش: 'letter-shin', ج: 'letter-5' } }, facts: [letterFact('ج'), FACTS.shin] },
    { config: { letters: ['ت', 'ق', 'ث', 'ي', 'ش', 'ن', 'ف', 'ب'], hints: false, voiceOnly: true }, facts: [letterFact('ق')] },
  ],
  teaches: { questionKeys: ['quest:arabic-dots-ba', 'quest:arabic-shin'] },
  order: 40,
});

export function registerLetterDotsGame(): void {
  registerGame(letterDotsGame);
}

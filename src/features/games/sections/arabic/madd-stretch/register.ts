import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, letterFact } from '../shared/facts';
import type { MaddStretchConfig } from './MaddStretchGame';

/*
 * Madd Stretch (local PlaceRounds engine): stretch a short vowel with its long-vowel letter.
 * L1 fatha + alif (بَا) with hints · L2 all three (بَا بِي بُو) · L3 the long vowel missing inside words.
 */

export const maddStretchI18n = defineNamespace('game.madd-stretch', {
  en: {
    title: 'Madd Stretch',
    description: 'A short vowel becomes long when its letter follows. Stretch the sound with alif, ya or waw.',
    howTo: 'Listen, then drag the letter that stretches the vowel into the gap after the syllable.',
    'play.syllables': 'Stretch the vowel: which letter makes it long?',
    'play.words': 'A long vowel is missing in the word – which letter stretches it?',
    'play.listen': 'Listen',
    'play.zone': 'The gap for the long vowel',
  },
  de: {
    title: 'Madd-Dehnung',
    description: 'Ein kurzer Vokal wird lang, wenn sein Buchstabe folgt. Dehne den Laut mit Alif, Ya oder Waw.',
    howTo: 'Hör zu und zieh den Buchstaben, der den Vokal dehnt, in die Lücke nach der Silbe.',
    'play.syllables': 'Dehne den Vokal: Welcher Buchstabe macht ihn lang?',
    'play.words': 'Im Wort fehlt ein langer Vokal – welcher Buchstabe dehnt ihn?',
    'play.listen': 'Anhören',
    'play.zone': 'Die Lücke für den langen Vokal',
  },
  bs: {
    title: 'Istezanje (medd)',
    description: 'Kratki samoglasnik postaje dug kada iza njega dođe njegov harf. Istegni glas elifom, jeom ili vavom.',
    howTo: 'Poslušaj, pa prevuci harf koji isteže samoglasnik u prazninu iza sloga.',
    'play.syllables': 'Istegni samoglasnik: koji harf ga čini dugim?',
    'play.words': 'U riječi nedostaje dugi samoglasnik – koji harf ga isteže?',
    'play.listen': 'Poslušaj',
    'play.zone': 'Praznina za dugi samoglasnik',
  },
});

export const maddStretchGame = arabicGame<MaddStretchConfig>({
  id: 'madd-stretch',
  i18n: maddStretchI18n,
  coverArt: 'arabic.stretch',
  hintArt: 'arabic.stretch',
  load: () => (require('./MaddStretchGame') as typeof import('./MaddStretchGame')).MaddStretchGame,
  levels: [
    { config: { harakat: ['fatha'], rounds: 4, hints: true }, facts: [letterFact('ا')] },
    { config: { harakat: ['fatha', 'kasra', 'damma'], rounds: 6, hints: false }, facts: [letterFact('ي'), letterFact('و')] },
    { config: { words: ['nur', 'kitab', 'fil', 'salam', 'mizan', 'zaytun'], rounds: 6, hints: false }, facts: [FACTS.madd] },
  ],
  order: 110,
});

export function registerMaddStretchGame(): void {
  registerGame(maddStretchGame);
}

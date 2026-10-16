import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, MARK_FACTS } from '../shared/facts';
import type { MarksWorkshopConfig } from './MarksWorkshopGame';

/*
 * Marks Workshop (local PlaceRounds engine): put the missing mark on the letter. L1 sukun among the short vowels ·
 * L2 tanwin (بٌ بٍ بً) · L3 sukun and shadda inside words of the lesson (جَنَّة, مَسْجِد, عِلْم …).
 */

export const marksWorkshopI18n = defineNamespace('game.marks-workshop', {
  en: {
    title: 'Marks Workshop',
    description: 'Sukun stops the vowel, tanwin adds an "n", shadda doubles the letter. Put the right mark on the letter.',
    howTo: 'Listen to the sound, then drag the mark that makes it onto the glowing letter.',
    'play.sukun': 'Which mark makes this sound? A small circle means no vowel.',
    'play.tanwin': 'Which doubled mark adds this "n" at the end?',
    'play.words': 'One mark is missing in the word – sukun or shadda?',
    'play.noVowel': '{sound} (no vowel)',
    'play.listen': 'Listen',
    'play.zone': 'The letter that needs a mark',
  },
  de: {
    title: 'Zeichen-Werkstatt',
    description: 'Sukun stoppt den Vokal, Tanwin fügt ein „n“ hinzu, Schadda verdoppelt den Buchstaben. Setz das richtige Zeichen auf den Buchstaben.',
    howTo: 'Hör dir den Laut an und zieh das passende Zeichen auf den leuchtenden Buchstaben.',
    'play.sukun': 'Welches Zeichen ergibt diesen Laut? Ein kleiner Kreis heißt: kein Vokal.',
    'play.tanwin': 'Welches doppelte Zeichen fügt am Ende dieses „n“ hinzu?',
    'play.words': 'Im Wort fehlt ein Zeichen – Sukun oder Schadda?',
    'play.noVowel': '{sound} (kein Vokal)',
    'play.listen': 'Anhören',
    'play.zone': 'Der Buchstabe, dem ein Zeichen fehlt',
  },
  bs: {
    title: 'Radionica znakova',
    description: 'Sukun zaustavlja samoglasnik, tenvin dodaje „n“, šedda udvostručuje harf. Stavi pravi znak na harf.',
    howTo: 'Poslušaj glas, pa prevuci znak koji ga daje na harf koji svijetli.',
    'play.sukun': 'Koji znak daje ovaj glas? Kružić znači bez samoglasnika.',
    'play.tanwin': 'Koji dvostruki znak dodaje ovo „n“ na kraju?',
    'play.words': 'U riječi nedostaje jedan znak – sukun ili šedda?',
    'play.noVowel': '{sound} (bez samoglasnika)',
    'play.listen': 'Poslušaj',
    'play.zone': 'Harf kojem nedostaje znak',
  },
});

export const marksWorkshopGame = arabicGame<MarksWorkshopConfig>({
  id: 'marks-workshop',
  i18n: marksWorkshopI18n,
  coverArt: 'arabic.marks',
  hintArt: 'arabic.marks',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('./MarksWorkshopGame') as typeof import('./MarksWorkshopGame')).MarksWorkshopGame,
  levels: [
    { config: { mode: 'sukun', rounds: 6, hints: true }, facts: [MARK_FACTS.sukun, FACTS.harakatMatch] },
    { config: { mode: 'tanwin', rounds: 6, hints: false }, facts: [MARK_FACTS.tanwin] },
    { config: { mode: 'words', rounds: 6, hints: false, words: ['jannah', 'masjid', 'ilm', 'sabr', 'rahmah', 'nakhla'] }, facts: [FACTS.shaddaJannah, FACTS.masjid] },
  ],
  teaches: { questionKeys: ['quest:arabic-shadda', 'quest:arabic-harakat-match'] },
  order: 100,
});

export function registerMarksWorkshopGame(): void {
  registerGame(marksWorkshopGame);
}

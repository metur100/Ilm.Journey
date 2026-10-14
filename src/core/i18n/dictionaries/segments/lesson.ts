/**
 * Core dictionary segment "lesson" (spread into the core dictionaries en/de/bs). Keys stay in the core namespace,
 * so `t('…')` from `useI18n()` translates them. German and Bosnian (ijekavian Latin) must have exactly the keys of English.
 */
const en = {
  // ---------- lesson cards (core/components/lesson) ----------
  'lessonCards.deck': 'Lesson cards',
  'lessonCards.position': 'Card {current} of {total}',
  'lessonCards.previous': 'Previous card',
  'lessonCards.next': 'Next card',
  'lessonCards.finish': 'Done',
  'lessonCards.swipeHint': 'Swipe or use the buttons to see the next card.',
  'lessonCards.tapToReveal': 'Tap to reveal',
  'lessonCards.revealHint': 'Shows the text of this card.',
  'lessonCards.flip': 'Flip the card',
  'lessonCards.flipBack': 'Flip back',
  'lessonCards.flipHint': 'Tap to see what it means.',
  'lessonCards.listen': 'Listen to the Arabic',
  'lessonCards.dragHint': 'Drag the right title onto the text – or tap it.',
  'lessonCards.dropHere': 'Drop the title here',
  'lessonCards.option': 'Title: {heading}',
  'lessonCards.optionHint': 'Puts this title on the text.',
  'lessonCards.tryAgain': 'Not quite – try the other title.',
  'lessonCards.wellDone': 'Well done!',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  'lessonCards.deck': 'Lernkarten',
  'lessonCards.position': 'Karte {current} von {total}',
  'lessonCards.previous': 'Vorherige Karte',
  'lessonCards.next': 'Nächste Karte',
  'lessonCards.finish': 'Fertig',
  'lessonCards.swipeHint': 'Wische oder nutze die Knöpfe, um die nächste Karte zu sehen.',
  'lessonCards.tapToReveal': 'Tippen zum Aufdecken',
  'lessonCards.revealHint': 'Zeigt den Text dieser Karte.',
  'lessonCards.flip': 'Karte umdrehen',
  'lessonCards.flipBack': 'Zurückdrehen',
  'lessonCards.flipHint': 'Tippe, um zu sehen, was es bedeutet.',
  'lessonCards.listen': 'Arabisch anhören',
  'lessonCards.dragHint': 'Zieh den passenden Titel auf den Text – oder tippe ihn an.',
  'lessonCards.dropHere': 'Titel hier ablegen',
  'lessonCards.option': 'Titel: {heading}',
  'lessonCards.optionHint': 'Legt diesen Titel auf den Text.',
  'lessonCards.tryAgain': 'Nicht ganz – probier den anderen Titel.',
  'lessonCards.wellDone': 'Gut gemacht!',
};

const bs: Record<Key, string> = {
  'lessonCards.deck': 'Kartice lekcije',
  'lessonCards.position': 'Kartica {current} od {total}',
  'lessonCards.previous': 'Prethodna kartica',
  'lessonCards.next': 'Sljedeća kartica',
  'lessonCards.finish': 'Gotovo',
  'lessonCards.swipeHint': 'Prevuci ili koristi dugmad da vidiš sljedeću karticu.',
  'lessonCards.tapToReveal': 'Dodirni da otkriješ',
  'lessonCards.revealHint': 'Prikazuje tekst ove kartice.',
  'lessonCards.flip': 'Okreni karticu',
  'lessonCards.flipBack': 'Okreni nazad',
  'lessonCards.flipHint': 'Dodirni da vidiš šta znači.',
  'lessonCards.listen': 'Poslušaj arapski',
  'lessonCards.dragHint': 'Prevuci pravi naslov na tekst – ili ga dodirni.',
  'lessonCards.dropHere': 'Spusti naslov ovdje',
  'lessonCards.option': 'Naslov: {heading}',
  'lessonCards.optionHint': 'Stavlja ovaj naslov na tekst.',
  'lessonCards.tryAgain': 'Nije baš – probaj drugi naslov.',
  'lessonCards.wellDone': 'Bravo!',
};

const segment = { en, de, bs };
export default segment;

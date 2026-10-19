import type { Language, LocalizedText } from '@/core/models';
import { HARAKAT_LESSON } from '@/features/games/sections/arabic/shared/lessonText';
import type { LetterPosition } from '@/features/games/sections/arabic/shared/script';

import { courseLetter, type ExerciseKind, type SufaraLesson, type SufaraLessonKind } from './course';

/** Texts of the Sufara course (lesson titles, explanations, exercise prompts and the lesson screen). */
export interface SufaraCopy {
  lesson: (number: number) => string;
  /** Joins two letter names: "Te i Se". */
  and: string;
  newLetters: (letters: string) => string;
  withReview: string;
  kindTitle: Record<Exclude<SufaraLessonKind, 'letters'>, string>;
  kindDescription: Record<Exclude<SufaraLessonKind, 'letters'>, string>;
  explain: Partial<Record<Exclude<SufaraLessonKind, 'letters'>, string>>;
  prompt: Record<ExerciseKind, (params: Record<string, string>) => string>;
  position: Record<LetterPosition, string>;
  positionIn: Record<Exclude<LetterPosition, 'isolated'>, string>;
  meet: string;
  forms: string;
  listen: string;
  traceTitle: string;
  traceHint: string;
  examples: string;
  review: string;
  correct: string;
  tryAgain: string;
  next: string;
  start: string;
  doneTitle: string;
  doneBody: string;
  nextLesson: string;
  backToTopic: string;
  courseDone: string;
  locked: string;
  notFound: string;
  teacher: string;
  step: (current: number, total: number) => string;
}

export const SUFARA_COPY: Record<Language, SufaraCopy> = {
  bs: {
    lesson: (n) => `${n}. lekcija`,
    and: ' i ',
    newLetters: (letters) => `Novi harfovi: ${letters}`,
    withReview: 'uz ponavljanje i spajanje ranijih harfova',
    kindTitle: {
      review: 'Ponavljanje: svi harfovi',
      fatha: 'Fetha',
      kasra: 'Kesra',
      damma: 'Damma',
      sukun: 'Sukun',
      tanwin: 'Tenvin',
      madd: 'Medd – dugi glas',
      shadda: 'Šedda',
      forms: 'Oblici harfova i spajanje',
      syllables: 'Čitanje slogova',
      words: 'Čitanje kratkih riječi',
    },
    kindDescription: {
      review: 'Svih 28 harfova i lam-elif na jednom mjestu.',
      fatha: 'Kratko „e/a“ iznad harfa.',
      kasra: 'Kratko „i“ ispod harfa.',
      damma: 'Kratko „u“ iznad harfa.',
      sukun: 'Harf bez samoglasnika.',
      tanwin: 'Dvostruki harekat: „n“ na kraju.',
      madd: 'Elif, je i vav produžuju glas.',
      shadda: 'Udvojeni harf.',
      forms: 'Harf na početku, u sredini i na kraju riječi.',
      syllables: 'Spoji slogove i čitaj.',
      words: 'Prve riječi harf po harf.',
    },
    explain: {
      review: 'Ponovi sve harfove koje si naučio. Dodirni harf da ga čuješ, a onda slijedi vježba sa svim harfovima.',
      madd: 'Medd znači produženje. Elif poslije fethe, je poslije kesre i vav poslije damme produžuju glas: بَا bā, بِي bī, بُو bū.',
      forms:
        'U riječi se harfovi spajaju i mijenjaju oblik: samostalno, na početku, u sredini i na kraju riječi. Šest harfova se nikad ne spaja sa sljedećim harfom: ا د ذ ر ز و.',
      syllables: 'Sada spajaš slogove. Čitaj ih redom, zdesna nalijevo – svaki harf sa svojim harekatom.',
      words: 'Sada čitaš prave riječi. Čitaj harf po harf, zdesna nalijevo, pa cijelu riječ.',
    },
    prompt: {
      findLetter: (p) => `Pronađi harf: ${p.name}`,
      nameLetter: () => 'Kako se zove ovaj harf?',
      read: () => 'Kako se ovo čita?',
      findReading: (p) => `Pronađi: ${p.reading}`,
      findShadda: () => 'Na kojem harfu je šedda?',
      findLong: (p) => `Koji slog je dug: ${p.reading}?`,
      findForm: (p) => `Kako izgleda ${p.name} ${p.position}?`,
      nonJoiner: () => 'Koji se harf ne spaja sa sljedećim harfom?',
      join: (p) => `Kako se čita spoj: ${p.reading}?`,
      findJoin: (p) => `Pronađi spoj: ${p.reading}`,
    },
    position: { isolated: 'Samostalno', initial: 'Na početku', medial: 'U sredini', final: 'Na kraju' },
    positionIn: { initial: 'na početku riječi', medial: 'u sredini riječi', final: 'na kraju riječi' },
    meet: 'Novi harf',
    forms: 'Oblici u riječi',
    listen: 'Poslušaj',
    traceTitle: 'Napiši harf',
    traceHint: 'Kreni od zelene tačke i prstom prati sivu liniju, pa dodirni tačke harfa.',
    examples: 'Primjeri',
    review: 'Ponavljanje',
    correct: 'Tačno!',
    tryAgain: 'Pokušaj ponovo.',
    next: 'Dalje',
    start: 'Počni vježbu',
    doneTitle: 'Lekcija završena!',
    doneBody: 'Bravo! Sljedeća lekcija ponavlja i ono što si danas naučio.',
    nextLesson: 'Sljedeća lekcija',
    backToTopic: 'Nazad na sufaru',
    courseDone: 'Završio si cijelu sufaru. Nastavi čitati – i s učiteljem u mektebu.',
    locked: 'Prvo završi prethodnu lekciju.',
    notFound: 'Ova lekcija nije pronađena.',
    teacher: 'Za pravilan izgovor uči i s kvalifikovanim učiteljem.',
    step: (current, total) => `Korak ${current} od ${total}`,
  },
  de: {
    lesson: (n) => `Lektion ${n}`,
    and: ' und ',
    newLetters: (letters) => `Neue Buchstaben: ${letters}`,
    withReview: 'mit Wiederholung und Verbindung der früheren Buchstaben',
    kindTitle: {
      review: 'Wiederholung: alle Buchstaben',
      fatha: 'Fatha',
      kasra: 'Kasra',
      damma: 'Damma',
      sukun: 'Sukun',
      tanwin: 'Tanwin',
      madd: 'Madd – der lange Laut',
      shadda: 'Schadda',
      forms: 'Buchstabenformen und Verbinden',
      syllables: 'Silben lesen',
      words: 'Kurze Wörter lesen',
    },
    kindDescription: {
      review: 'Alle 28 Buchstaben und Lam-Alif auf einen Blick.',
      fatha: 'Kurzes „a“ über dem Buchstaben.',
      kasra: 'Kurzes „i“ unter dem Buchstaben.',
      damma: 'Kurzes „u“ über dem Buchstaben.',
      sukun: 'Ein Buchstabe ohne Vokal.',
      tanwin: 'Doppeltes Vokalzeichen: „n“ am Ende.',
      madd: 'Alif, Ya und Waw verlängern den Laut.',
      shadda: 'Ein verdoppelter Buchstabe.',
      forms: 'Der Buchstabe am Anfang, in der Mitte und am Ende.',
      syllables: 'Silben verbinden und lesen.',
      words: 'Erste Wörter Buchstabe für Buchstabe.',
    },
    explain: {
      review: 'Wiederhole alle Buchstaben, die du gelernt hast. Tippe einen Buchstaben an, um ihn zu hören – danach übst du mit allen Buchstaben.',
      madd: 'Madd heißt Verlängerung. Alif nach Fatha, Ya nach Kasra und Waw nach Damma verlängern den Laut: بَا bā, بِي bī, بُو bū.',
      forms:
        'Im Wort werden die Buchstaben verbunden und ändern ihre Form: einzeln, am Anfang, in der Mitte und am Ende. Sechs Buchstaben verbinden sich nie mit dem nächsten Buchstaben: ا د ذ ر ز و.',
      syllables: 'Jetzt verbindest du Silben. Lies sie der Reihe nach von rechts nach links – jeden Buchstaben mit seinem Vokalzeichen.',
      words: 'Jetzt liest du echte Wörter. Lies Buchstabe für Buchstabe von rechts nach links, dann das ganze Wort.',
    },
    prompt: {
      findLetter: (p) => `Finde den Buchstaben: ${p.name}`,
      nameLetter: () => 'Wie heißt dieser Buchstabe?',
      read: () => 'Wie wird das gelesen?',
      findReading: (p) => `Finde: ${p.reading}`,
      findShadda: () => 'Auf welchem Buchstaben steht eine Schadda?',
      findLong: (p) => `Welche Silbe ist lang: ${p.reading}?`,
      findForm: (p) => `Wie sieht ${p.name} ${p.position} aus?`,
      nonJoiner: () => 'Welcher Buchstabe verbindet sich nicht mit dem nächsten?',
      join: (p) => `Wie liest man diese Verbindung: ${p.reading}?`,
      findJoin: (p) => `Finde die Verbindung: ${p.reading}`,
    },
    position: { isolated: 'Einzeln', initial: 'Am Anfang', medial: 'In der Mitte', final: 'Am Ende' },
    positionIn: { initial: 'am Wortanfang', medial: 'in der Wortmitte', final: 'am Wortende' },
    meet: 'Neuer Buchstabe',
    forms: 'Formen im Wort',
    listen: 'Anhören',
    traceTitle: 'Schreib den Buchstaben',
    traceHint: 'Beginne am grünen Punkt, fahr die graue Linie mit dem Finger nach und tippe dann die Punkte an.',
    examples: 'Beispiele',
    review: 'Wiederholung',
    correct: 'Richtig!',
    tryAgain: 'Versuch es noch einmal.',
    next: 'Weiter',
    start: 'Übung starten',
    doneTitle: 'Lektion geschafft!',
    doneBody: 'Super! Die nächste Lektion wiederholt auch, was du heute gelernt hast.',
    nextLesson: 'Nächste Lektion',
    backToTopic: 'Zurück zur Sufara',
    courseDone: 'Du hast die ganze Sufara geschafft. Lies weiter – auch mit einer Lehrkraft.',
    locked: 'Schließe zuerst die vorige Lektion ab.',
    notFound: 'Diese Lektion wurde nicht gefunden.',
    teacher: 'Für die richtige Aussprache übe auch mit einer qualifizierten Lehrkraft.',
    step: (current, total) => `Schritt ${current} von ${total}`,
  },
  en: {
    lesson: (n) => `Lesson ${n}`,
    and: ' and ',
    newLetters: (letters) => `New letters: ${letters}`,
    withReview: 'with a review and joining of the earlier letters',
    kindTitle: {
      review: 'Review: all letters',
      fatha: 'Fatha',
      kasra: 'Kasra',
      damma: 'Damma',
      sukun: 'Sukun',
      tanwin: 'Tanwin',
      madd: 'Madd – the long sound',
      shadda: 'Shadda',
      forms: 'Letter forms and joining',
      syllables: 'Reading syllables',
      words: 'Reading short words',
    },
    kindDescription: {
      review: 'All 28 letters and lam-alif in one place.',
      fatha: 'A short "a" above the letter.',
      kasra: 'A short "i" below the letter.',
      damma: 'A short "u" above the letter.',
      sukun: 'A letter without a vowel.',
      tanwin: 'A doubled vowel mark: "n" at the end.',
      madd: 'Alif, ya and waw make the sound long.',
      shadda: 'A doubled letter.',
      forms: 'A letter at the start, in the middle and at the end.',
      syllables: 'Join syllables and read.',
      words: 'First words, letter by letter.',
    },
    explain: {
      review: 'Review all the letters you have learned. Tap a letter to hear it – then practise with all of them.',
      madd: 'Madd means lengthening. Alif after fatha, ya after kasra and waw after damma make the sound long: بَا bā, بِي bī, بُو bū.',
      forms:
        'In a word the letters join and change their shape: alone, at the start, in the middle and at the end. Six letters never join the letter after them: ا د ذ ر ز و.',
      syllables: 'Now you join syllables. Read them in order from right to left – every letter with its vowel mark.',
      words: 'Now you read real words. Read letter by letter from right to left, then the whole word.',
    },
    prompt: {
      findLetter: (p) => `Find the letter: ${p.name}`,
      nameLetter: () => 'What is this letter called?',
      read: () => 'How is this read?',
      findReading: (p) => `Find: ${p.reading}`,
      findShadda: () => 'Which letter has a shadda?',
      findLong: (p) => `Which syllable is long: ${p.reading}?`,
      findForm: (p) => `What does ${p.name} look like ${p.position}?`,
      nonJoiner: () => 'Which letter does not join the next letter?',
      join: (p) => `How is this joined pair read: ${p.reading}?`,
      findJoin: (p) => `Find the joined pair: ${p.reading}`,
    },
    position: { isolated: 'Alone', initial: 'At the start', medial: 'In the middle', final: 'At the end' },
    positionIn: { initial: 'at the start of a word', medial: 'in the middle of a word', final: 'at the end of a word' },
    meet: 'New letter',
    forms: 'Forms in a word',
    listen: 'Listen',
    traceTitle: 'Write the letter',
    traceHint: 'Start at the green dot, follow the grey line with your finger, then tap the dots.',
    examples: 'Examples',
    review: 'Review',
    correct: 'Correct!',
    tryAgain: 'Try again.',
    next: 'Next',
    start: 'Start practice',
    doneTitle: 'Lesson complete!',
    doneBody: 'Well done! The next lesson also repeats what you learned today.',
    nextLesson: 'Next lesson',
    backToTopic: 'Back to Sufara',
    courseDone: 'You finished the whole Sufara. Keep reading – with a teacher too.',
    locked: 'Finish the previous lesson first.',
    notFound: 'This lesson was not found.',
    teacher: 'Practise the pronunciation with a qualified teacher too.',
    step: (current, total) => `Step ${current} of ${total}`,
  },
};

const MARK_EXAMPLE: Partial<Record<SufaraLessonKind, string>> = { fatha: 'اَ', kasra: 'اِ', damma: 'اُ', sukun: 'بْ', shadda: 'بّ', tanwin: 'بٌ بٍ بً' };
/** The generated harakat lines are keyed by the ba examples; the course starts with the same marks on elif. */
const HARAKAT_LINE: Record<string, string> = { 'اَ': 'بَ', 'اِ': 'بِ', 'اُ': 'بُ' };

/** Explanation of a lesson (letter lessons have none – each letter is shown on its own). */
export function lessonExplanation(lesson: SufaraLesson, language: Language): { mark?: string; text: string } | null {
  const example = MARK_EXAMPLE[lesson.kind];
  if (example) return { mark: example, text: HARAKAT_LESSON[HARAKAT_LINE[example] ?? example].body[language] };
  if (lesson.kind === 'letters') return null;
  const text = SUFARA_COPY[language].explain[lesson.kind];
  return text ? { text } : null;
}

const byLanguage = (fn: (language: Language) => string): LocalizedText => ({ en: fn('en'), de: fn('de'), bs: fn('bs') });

/** "3. lekcija: Te i Se" / "18. lekcija: Fetha". */
export function lessonTitle(lesson: SufaraLesson): LocalizedText {
  return byLanguage((language) => {
    const copy = SUFARA_COPY[language];
    const name = lesson.kind === 'letters' ? lesson.letters.map((l) => courseLetter(l).name[language]).join(copy.and) : copy.kindTitle[lesson.kind];
    return `${copy.lesson(lesson.number)}: ${name}`;
  });
}

export function lessonDescription(lesson: SufaraLesson): LocalizedText {
  return byLanguage((language) => {
    const copy = SUFARA_COPY[language];
    if (lesson.kind !== 'letters') return copy.kindDescription[lesson.kind];
    const letters = copy.newLetters(lesson.letters.join(' '));
    return lesson.number > 1 ? `${letters} – ${copy.withReview}` : letters;
  });
}

import type { GameFact } from '@/core/games';
import { localizedFrom } from '@/core/i18n';
import { LANGUAGE_SOURCES, type LocalizedText } from '@/core/models';

import { HARAKAT_LESSON, LETTER_LESSON } from './lessonText';
import { letterInfo, type GameLetter } from './letters';
import { getWord, wordLine } from './words';

/*
 * "You learned" facts of the Arabic / Sufara section. All are language facts (`kind: 'language'`) about the script
 * and basic vocabulary – no religious claims – and cite the neutral references of `LANGUAGE_SOURCES`, never a Quran
 * verse. Texts are copied from the Arabic lessons, quest questions and quest facts
 * (src/features/learn/content/quests/arabic.json) where the content has them; the few script rules the lessons do
 * not spell out (non-joining letters, the four shapes, lam-alif, madd) are standard facts of the Arabic script.
 */

const ALPHABET = [LANGUAGE_SOURCES.alphabet];
const VOCABULARY = [LANGUAGE_SOURCES.vocabulary];
const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

const lang = (id: string, text: LocalizedText, art: string, extra: Partial<GameFact> = {}): GameFact => ({ id, kind: 'language', text, sources: ALPHABET, art, ...extra });

export const FACTS = {
  // Quest question `arabic-28` (explanation).
  alphabet: lang('alphabet-28-letters', T('The Arabic alphabet has 28 letters.', 'Das arabische Alphabet hat 28 Buchstaben.', 'Arapsko pismo ima 28 harfova.'), 'object.scroll', {
    reviewKey: 'quest:arabic-28',
  }),
  // Quest fact `arabic-fact-rtl`.
  joining: lang(
    'letters-join',
    T(
      'Arabic is written from right to left, and most letters join to the next letter.',
      'Arabisch wird von rechts nach links geschrieben, und die meisten Buchstaben werden mit dem nächsten verbunden.',
      'Arapski se piše zdesna nalijevo, a većina harfova se spaja sa sljedećim.',
    ),
    'object.pen',
    { reviewKey: 'quest:arabic-rtl' },
  ),
  // Quest question `arabic-dots-ba` (explanation).
  dots: lang(
    'letter-dots',
    T(
      'ب (Ba) has one dot below. ت has two dots above and ث three dots above.',
      'ب (Ba) hat einen Punkt unten. ت hat zwei Punkte oben und ث drei Punkte oben.',
      'ب (Be) ima jednu tačku ispod. ت ima dvije tačke iznad, a ث tri tačke iznad.',
    ),
    'object.inkwell',
    { reviewKey: 'quest:arabic-dots-ba' },
  ),
  // Quest question `arabic-shin` (explanation).
  shin: lang(
    'letter-shin',
    T('ش (Shin) has three dots and sounds like "sh".', 'ش (Schin) hat drei Punkte und klingt wie „sch“.', 'ش (Šin) ima tri tačke i čita se kao „š“.'),
    'object.inkwell',
    { reviewKey: 'quest:arabic-shin' },
  ),
  // Quest question `arabic-mim` (explanation).
  mim: lang('letter-mim', T('م (Mim) makes the "m" sound.', 'م (Mim) macht den Laut „m“.', 'م (Mim) daje glas „m“.'), 'object.pen', { reviewKey: 'quest:arabic-mim' }),
  // Quest question `arabic-alphabet-order` (explanation).
  order: lang(
    'alphabet-order',
    T('Alif, Ba, Ta, Tha, Jim – the alphabet begins like this.', 'Alif, Ba, Ta, Tha, Dschim – so beginnt das Alphabet.', 'Elif, be, te, se, džim – tako počinje pismo.'),
    'object.scroll',
    { reviewKey: 'quest:arabic-alphabet-order' },
  ),
  // Quest fact `arabic-fact-dad`.
  dad: lang(
    'language-of-dad',
    T(
      'Arabic is sometimes called "the language of Dad" (ض), because this sound is special to Arabic.',
      'Arabisch wird manchmal „die Sprache des Dad“ (ض) genannt, weil dieser Laut typisch für das Arabische ist.',
      'Arapski se ponekad naziva „jezikom dada“ (ض), jer je taj glas poseban za arapski.',
    ),
    'object.book',
  ),
  // Lesson `arabic-intro`, first section.
  shapes: lang(
    'letter-shapes-change',
    T(
      'Arabic is written and read from right to left, and most letters connect to each other, so their shape changes a little depending on where they are in a word.',
      'Arabisch wird von rechts nach links geschrieben und gelesen, und die meisten Buchstaben werden verbunden, deshalb ändert sich ihre Form etwas, je nachdem, wo sie im Wort stehen.',
      'Arapski se piše i čita zdesna nalijevo, a većina harfova se spaja, pa im se oblik malo mijenja zavisno od mjesta u riječi.',
    ),
    'object.pen',
  ),
  // Standard script facts (not spelled out in the lessons).
  fourForms: lang(
    'four-forms',
    T(
      'A letter that joins on both sides has four shapes: alone ب, at the start بـ, in the middle ـبـ and at the end ـب.',
      'Ein Buchstabe, der sich nach beiden Seiten verbindet, hat vier Formen: allein ب, am Anfang بـ, in der Mitte ـبـ und am Ende ـب.',
      'Harf koji se spaja s obje strane ima četiri oblika: samostalno ب, na početku بـ, u sredini ـبـ i na kraju ـب.',
    ),
    'object.scroll',
  ),
  nonJoiners: lang(
    'non-joining-letters',
    T(
      'Six letters never join the letter after them: ا د ذ ر ز و. The next letter starts a new piece of the word.',
      'Sechs Buchstaben verbinden sich nie mit dem Buchstaben danach: ا د ذ ر ز و. Der nächste Buchstabe beginnt ein neues Stück des Wortes.',
      'Šest harfova se nikad ne spaja sa sljedećim harfom: ا د ذ ر ز و. Sljedeći harf počinje novi dio riječi.',
    ),
    'object.pen',
  ),
  nonJoinersBefore: lang(
    'non-joiners-join-before',
    T(
      'The six non-joining letters ا د ذ ر ز و still join the letter before them – only the join after them is missing.',
      'Die sechs nicht verbindenden Buchstaben ا د ذ ر ز و verbinden sich trotzdem mit dem Buchstaben davor – nur die Verbindung danach fehlt.',
      'Šest harfova koji se ne spajaju ا د ذ ر ز و ipak se spajaju s harfom prije sebe – nedostaje samo spoj poslije njih.',
    ),
    'object.inkwell',
  ),
  lamAlif: lang(
    'lam-alif',
    T('When ل (Lam) is followed by ا (Alif), the two are written as one joined shape: لا.', 'Folgt auf ل (Lam) ein ا (Alif), schreibt man beide als eine verbundene Form: لا.', 'Kada iza ل (lama) dođe ا (elif), pišu se kao jedan spojeni oblik: لا.'),
    'object.pen',
  ),
  // Lesson `arabic-harakat`, first sentence (as in the v2 Letter Lanterns fact).
  harakat: lang(
    'harakat-short-vowels',
    T(
      'Small marks above or below a letter show how to pronounce it: fatha (a line above) gives a short "a" – بَ ba; kasra (a line below) gives "i" – بِ bi; damma (a small waw above) gives "u" – بُ bu.',
      'Kleine Zeichen über oder unter einem Buchstaben zeigen die Aussprache: Fatha (Strich oben) ergibt ein kurzes „a“ – بَ ba; Kasra (Strich unten) „i“ – بِ bi; Damma (kleines Waw oben) „u“ – بُ bu.',
      'Mali znakovi iznad ili ispod harfa pokazuju izgovor: fetha (crtica iznad) daje kratko „e/a“ – بَ be; kesra (crtica ispod) „i“ – بِ bi; damma (mali vav iznad) „u“ – بُ bu.',
    ),
    'object.inkwell',
    { reviewKey: 'quest:arabic-fatha' },
  ),
  // Quest question `arabic-harakat-match` (explanation).
  harakatMatch: lang(
    'harakat-sounds',
    T('Fatha = a, Kasra = i, Damma = u, Sukun = no vowel.', 'Fatha = a, Kasra = i, Damma = u, Sukun = kein Vokal.', 'Fetha = e/a, kesra = i, damma = u, sukun = bez samoglasnika.'),
    'object.inkwell',
    { reviewKey: 'quest:arabic-harakat-match' },
  ),
  // Quest question `arabic-shadda` (statement + explanation).
  shaddaJannah: lang(
    'shadda-doubles',
    T(
      'A shadda means the letter is doubled – for example in جَنَّة (jannah), the nun is doubled.',
      'Eine Schadda bedeutet, dass der Buchstabe verdoppelt wird – zum Beispiel in جَنَّة (Dschanna) wird das Nun verdoppelt.',
      'Šedda znači da se harf udvostručuje – npr. u جَنَّة (džennet) nun je udvostručen.',
    ),
    'object.inkwell',
    { reviewKey: 'quest:arabic-shadda' },
  ),
  madd: lang(
    'madd-long-vowels',
    T(
      'A vowel becomes long when its letter follows: alif after fatha (بَا bā), ya after kasra (بِي bī), waw after damma (بُو bū).',
      'Ein Vokal wird lang, wenn sein Buchstabe folgt: Alif nach Fatha (بَا bā), Ya nach Kasra (بِي bī), Waw nach Damma (بُو bū).',
      'Samoglasnik postaje dug kada iza njega dođe njegov harf: elif iza fethe (بَا bā), je iza kesre (بِي bī), vav iza damme (بُو bū).',
    ),
    'object.scroll',
  ),
  // Quest fact `arabic-fact-masjid`.
  masjid: {
    id: 'masjid-sujud',
    kind: 'language',
    text: T(
      'The word "masjid" comes from "sujud" – it means the place of prostration.',
      'Das Wort „Masdschid“ kommt von „Sudschud“ – es bedeutet Ort der Niederwerfung.',
      'Riječ „mesdžid“ dolazi od „sedžda“ – znači mjesto sedžde.',
    ),
    sources: VOCABULARY,
    art: 'garden.masjid-small',
    reviewKey: 'quest:arabic-masjid-word',
  },
} satisfies Record<string, GameFact>;

/** Lesson line of a letter as a fact ("Ba – sounds like "b". One dot below."). Id `letter-<n>`. */
export function letterFact(letter: string, art = 'object.pen'): GameFact {
  const info = letterInfo(letter) as GameLetter;
  return { id: `letter-${info.position}`, kind: 'language', text: LETTER_LESSON[letter], sources: ALPHABET, art };
}

/** A harakat lesson section as a fact: "Fatha – a small line above the letter: short "a". بَ". */
export function markFact(example: keyof typeof HARAKAT_LESSON | string, id: string): GameFact {
  const section = HARAKAT_LESSON[example];
  if (!section) throw new Error(`No harakat lesson section ${example}`);
  return {
    id,
    kind: 'language',
    text: localizedFrom((l) => `${section.heading[l]} (${example}) – ${section.body[l]}`),
    sources: ALPHABET,
    art: 'object.inkwell',
  };
}

export const MARK_FACTS = {
  fatha: markFact('بَ', 'mark-fatha'),
  kasra: markFact('بِ', 'mark-kasra'),
  damma: markFact('بُ', 'mark-damma'),
  sukun: markFact('بْ', 'mark-sukun'),
  shadda: markFact('بّ', 'mark-shadda'),
  tanwin: markFact('بٌ بٍ بً', 'mark-tanwin'),
};

/** A word of the lesson / vocabulary as a fact: "كِتَاب (kitāb) – Book", with a meaning check. */
export function wordFact(id: string, distractors: readonly string[]): GameFact {
  const word = getWord(id);
  return {
    id: `word-${id}`,
    kind: 'language',
    text: localizedFrom((l) => wordLine(word, l)),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art: word.art ?? 'object.book',
    check: {
      type: 'choice',
      prompt: localizedFrom((l) => ({ en: `What does ${word.arabic} (${word.translit}) mean?`, de: `Was bedeutet ${word.arabic} (${word.translit})?`, bs: `Šta znači ${word.arabic} (${word.translit})?` })[l]),
      options: [word.meaning, ...distractors.map((d) => getWord(d).meaning)],
      correctIndex: 0,
    },
  };
}

import { type GameDef, registerGame } from '@/core/games';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Al-Yasa – "Among the Best" (6:83–90, 38:45–48). The Quran tells little about his life, so the game keeps strictly to
 * what it says about him, in three steps, each with its lesson:
 * L1 favoured above the worlds with Ismail, Yunus and Lut (6:86) – find the pairs (episode: memory);
 * L2 what Allah gave the guided prophets: chosen, guided, the Book, wisdom, prophethood (6:87–89) (episode: connect);
 * L3 the line of guided prophets in Surah Al-Anʿam and "follow their guidance" (6:83–90) (episode: sequence).
 */

export const ALYASA_ID = 'alyasa-among-best';

export type AlyasaConfig = EpisodeConfig;

export const alyasaI18n = gameTexts(ALYASA_ID, {
  title: T('Among the Best', 'Unter den Besten', 'Među najboljima'),
  description: T(
    'What the Quran says about Al-Yasa: favoured above the worlds, given guidance and the Book, and among the best – each with its lesson.',
    'Was der Koran über Al-Yasa’ sagt: vor den Welten bevorzugt, mit Rechtleitung und der Schrift beschenkt und unter den Besten – jedes mit seiner Lehre.',
    'Šta Kur’an kazuje o El-Jesa’u: odlikovan nad svjetovima, obdaren uputom i Knjigom, i među najboljima – svaki dio sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: find the pairs. Level 2: connect each gift with the words of the Quran. Level 3: put the prophets of Surah Al-Anʿam in order.',
    'Stufe 1: Finde die Paare. Stufe 2: Verbinde jede Gabe mit den Worten des Korans. Stufe 3: Bring die Propheten der Sure Al-Anʿam in die richtige Reihenfolge.',
    'Nivo 1: pronađi parove. Nivo 2: spoji svaki dar s riječima Kur’ana. Nivo 3: poredaj poslanike iz sure El-En’am.',
  ),
});

export const ALYASA_FACTS = {
  favoured: {
    id: 'alyasa-favoured',
    text: T(
      '"And Ismail, Al-Yasa, Yunus and Lut – each of them We favoured above the worlds."',
      '„Und Ismail, Al-Yasa’, Yunus und Lut – jeden von ihnen haben Wir vor den Welten bevorzugt.“',
      '„I Ismaila, i El-Jesa’a, i Junusa, i Luta – i svakog od njih smo nad svjetovima odlikovali.“',
    ),
    sources: [quran('6:86')],
    art: 'prophet.alyasa-star',
  },
  loveProphets: lessonFact(
    'love-all-prophets',
    T(
      'Love and respect all the prophets. Allah favoured each of them – even those of whom we know only a little, like Al-Yasa.',
      'Liebe und achte alle Propheten. Allah hat jeden von ihnen bevorzugt – auch die, von denen wir nur wenig wissen, wie Al-Yasa’.',
      'Voli i poštuj sve poslanike. Allah je odlikovao svakog od njih – i one o kojima malo znamo, kao El-Jesa’a.',
    ),
    [quran('6:86'), quran('2:285')],
  ),
  book: {
    id: 'book-wisdom',
    text: T(
      'About these prophets Allah says: "We chose them and guided them to a straight path." He gave them the Book, wisdom and prophethood.',
      'Über diese Propheten sagt Allah: „Wir haben sie erwählt und zu einem geraden Weg geleitet.“ Er gab ihnen die Schrift, die Weisheit und das Prophetentum.',
      'O tim poslanicima Allah kaže: „Odabrali smo ih i na Pravi put uputili.“ Dao im je Knjigu, mudrost i vjerovjesništvo.',
    ),
    sources: [quran('6:87'), quran('6:89')],
    art: 'object.book',
  },
  askGuidance: lessonFact(
    'ask-for-guidance',
    T(
      'Guidance is a gift from Allah – ask Him for it every day, as you do in every prayer: "Guide us to the straight path."',
      'Rechtleitung ist ein Geschenk Allahs – bitte Ihn jeden Tag darum, wie in jedem Gebet: „Leite uns den geraden Weg.“',
      'Uputa je Allahov dar – moli Ga za nju svaki dan, kao u svakom namazu: „Uputi nas na Pravi put.“',
    ),
    [quran('6:88'), quran('1:6')],
    { art: 'object.lantern' },
  ),
  follow: {
    id: 'follow-guidance',
    text: T(
      'After naming these prophets, Allah says: "Those are the ones whom Allah guided, so follow their guidance." And: "Remember Ismail, Al-Yasa and Dhul-Kifl – all of them are among the best."',
      'Nachdem Allah diese Propheten genannt hat, sagt Er: „Das sind diejenigen, die Allah rechtgeleitet hat; so folge ihrer Rechtleitung.“ Und: „Gedenke Ismails, Al-Yasa’s und Dhul-Kifls – alle gehören zu den Besten.“',
      'Nakon što spomene te poslanike, Allah kaže: „To su oni kojima je Allah na Pravi put ukazao, zato ti slijedi njihov Pravi put.“ I: „Sjeti se Ismaila, i El-Jesa’a, i Zul-Kifla – svi su oni od najboljih.“',
    ),
    sources: [quran('6:90'), quran('38:48')],
    check: {
      type: 'choice',
      prompt: T('In 38:48, Al-Yasa is named with…', 'In 38:48 wird Al-Yasa’ genannt mit…', 'U 38:48 El-Jesa’ je spomenut s…'),
      options: [
        T('Ismail and Dhul-Kifl', 'Ismail und Dhul-Kifl', 'Ismailom i Zul-Kiflom'),
        T('Musa and Harun', 'Musa und Harun', 'Musaom i Harunom'),
        T('Nuh and Hud', 'Nuh und Hud', 'Nuhom i Hudom'),
      ],
      correctIndex: 0,
    },
  },
  example: lessonFact(
    'prophets-are-our-example',
    T(
      'Take the prophets as your example: their faith, patience and good character show the way. What Allah thinks of you matters most – He called Al-Yasa one of the best.',
      'Nimm die Propheten zum Vorbild: Ihr Glaube, ihre Geduld und ihr guter Charakter zeigen den Weg. Am wichtigsten ist, wie Allah dich sieht – Er nannte Al-Yasa’ einen der Besten.',
      'Uzmi poslanike za uzor: njihovo vjerovanje, strpljivost i lijep ahlak pokazuju put. Najvažnije je kako te Allah vidi – On je El-Jesa’a nazvao jednim od najboljih.',
    ),
    [quran('6:90'), quran('38:48')],
    { art: 'prophet.alyasa-lantern-chain' },
  ),
} satisfies Facts;

/** L1 – the four prophets of 6:86: picture ↔ name. */
const FAVOURED: Episode = {
  kind: 'memory',
  prompt: T(
    '"Ismail, Al-Yasa, Yunus and Lut – each We favoured above the worlds" (6:86). Find each sign with its name.',
    '„Ismail, Al-Yasa’, Yunus und Lut – jeden haben Wir vor den Welten bevorzugt“ (6:86). Finde zu jedem Zeichen den Namen.',
    '„Ismaila, El-Jesa’a, Junusa i Luta – svakog smo nad svjetovima odlikovali“ (6:86). Pronađi uz svaki znak ime.',
  ),
  hints: true,
  peekMs: 2500,
  pairs: [
    { id: 'p-ismail', a: { art: 'prophet.ismail-zamzam' }, b: { label: T('Ismail', 'Ismail', 'Ismail') }, caption: T('Ismail – the well of Zamzam', 'Ismail – der Brunnen Zamzam', 'Ismail – bunar Zemzem') },
    { id: 'p-alyasa', a: { art: 'prophet.alyasa-star' }, b: { label: T('Al-Yasa', 'Al-Yasa’', 'El-Jesa’') }, caption: T('Al-Yasa – favoured above the worlds', 'Al-Yasa’ – vor den Welten bevorzugt', 'El-Jesa’ – odlikovan nad svjetovima') },
    { id: 'p-yunus', a: { art: 'prophet.yunus-whale' }, b: { label: T('Yunus', 'Yunus', 'Junus') }, caption: T('Yunus – the great fish', 'Yunus – der große Fisch', 'Junus – velika riba') },
    { id: 'p-lut', a: { art: 'prophet.lut-lantern' }, b: { label: T('Lut', 'Lut', 'Lut') }, caption: T('Lut – leaving by night', 'Lut – Aufbruch bei Nacht', 'Lut – odlazak noću') },
  ],
  factMap: { 'p-ismail': 'alyasa-favoured', 'p-alyasa': 'alyasa-favoured', 'p-yunus': 'lesson-love-all-prophets', 'p-lut': 'lesson-love-all-prophets' },
};

/** L2 – what Allah gave the guided prophets (6:87–89). */
const GIFTS: Episode = {
  kind: 'connect',
  prompt: T('What did Allah give these prophets? Connect each gift with the words of the Quran.', 'Was gab Allah diesen Propheten? Verbinde jede Gabe mit den Worten des Korans.', 'Šta je Allah dao tim poslanicima? Spoji svaki dar s riječima Kur’ana.'),
  hints: false,
  pairs: [
    { id: 'chosen', left: { art: 'object.star8', label: T('Chosen', 'Erwählt', 'Odabrani') }, right: { label: T('"We chose them" (6:87)', '„Wir haben sie erwählt“ (6:87)', '„Odabrali smo ih“ (6:87)') } },
    { id: 'guided', left: { art: 'object.lantern', label: T('Guided', 'Rechtgeleitet', 'Upućeni') }, right: { label: T('"to a straight path" (6:87)', '„zu einem geraden Weg“ (6:87)', '„na Pravi put“ (6:87)') } },
    { id: 'the-book', left: { art: 'object.book', label: T('The Book', 'Die Schrift', 'Knjiga') }, right: { label: T('"We gave them the Book" (6:89)', '„Wir gaben ihnen die Schrift“ (6:89)', '„Dali smo im Knjigu“ (6:89)') } },
    { id: 'wisdom', left: { art: 'object.scroll', label: T('Wisdom', 'Weisheit', 'Mudrost') }, right: { label: T('"…and wisdom" (6:89)', '„…und Weisheit“ (6:89)', '„…i mudrost“ (6:89)') } },
    { id: 'prophethood', left: { art: 'prophet.alyasa-lantern-chain', label: T('Prophethood', 'Prophetentum', 'Vjerovjesništvo') }, right: { label: T('"…and prophethood" (6:89)', '„…und Prophetentum“ (6:89)', '„…i vjerovjesništvo“ (6:89)') } },
  ],
  factMap: { chosen: 'book-wisdom', guided: 'lesson-ask-for-guidance', 'the-book': 'book-wisdom', wisdom: 'book-wisdom', prophethood: 'book-wisdom' },
};

/** L3 – the line of guided prophets in Surah Al-Anʿam, in the order of the ayahs (6:83–90). */
const LINE: Episode = {
  kind: 'sequence',
  prompt: T(
    'Surah Al-Anʿam names a long line of guided prophets. Put them in the order of the ayahs, then check.',
    'Die Sure Al-Anʿam nennt eine lange Reihe rechtgeleiteter Propheten. Bring sie in die Reihenfolge der Verse und prüfe.',
    'Sura El-En’am spominje dug niz upućenih poslanika. Poredaj ih redom ajeta, pa provjeri.',
  ),
  hints: false,
  items: [
    { id: 'line-ibrahim', art: 'prophet.ibrahim-star', label: T('Ibrahim', 'Ibrahim', 'Ibrahim'), sub: '6:83' },
    { id: 'line-nuh', art: 'prophet.nuh-ark', label: T('Ishaq, Yaqub, Nuh, Dawud, Sulayman …', 'Ishaq, Yaqub, Nuh, Dawud, Sulaiman …', 'Ishak, Jakub, Nuh, Davud, Sulejman …'), sub: '6:84' },
    { id: 'line-zakariyya', art: 'prophet.zakariyya-mihrab', label: T('Zakariyya, Yahya, Isa, Ilyas', 'Zakariyya, Yahya, Isa, Ilyas', 'Zekerijja, Jahja, Isa, Ilijas'), sub: '6:85' },
    { id: 'line-alyasa', art: 'prophet.alyasa-star', label: T('Ismail, Al-Yasa, Yunus, Lut', 'Ismail, Al-Yasa’, Yunus, Lut', 'Ismail, El-Jesa’, Junus, Lut'), sub: '6:86' },
    { id: 'line-follow', art: 'object.lantern', label: T('"So follow their guidance"', '„So folge ihrer Rechtleitung“', '„Zato ti slijedi njihov Pravi put“'), sub: '6:90' },
  ],
  factMap: { 'line-ibrahim': 'follow-guidance', 'line-nuh': 'follow-guidance', 'line-zakariyya': 'follow-guidance', 'line-alyasa': 'follow-guidance', 'line-follow': 'lesson-prophets-are-our-example' },
};

export const alyasaGame: GameDef<AlyasaConfig> = {
  id: ALYASA_ID,
  topicId: 'prophets',
  i18n: alyasaI18n,
  coverArt: 'prophet.alyasa-star',
  hintArt: 'prophet.alyasa-lantern-chain',
  component: lazyGame(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    () => (require('../../prophets-story/EpisodeBoard') as typeof import('../../prophets-story/EpisodeBoard')).EpisodeGame,
  ),
  levels: [
    { level: 1, config: { mode: 'episode', episode: FAVOURED }, facts: [ALYASA_FACTS.favoured, ALYASA_FACTS.loveProphets] },
    { level: 2, config: { mode: 'episode', episode: GIFTS }, facts: [ALYASA_FACTS.book, ALYASA_FACTS.askGuidance] },
    { level: 3, config: { mode: 'episode', episode: LINE }, facts: [ALYASA_FACTS.follow, ALYASA_FACTS.example] },
  ],
  order: 20,
};

export const ALYASA_ART: string[] = [...episodeArt(FAVOURED), ...episodeArt(GIFTS), ...episodeArt(LINE)];

export function registerAlyasaGame(): void {
  registerGame(alyasaGame);
}

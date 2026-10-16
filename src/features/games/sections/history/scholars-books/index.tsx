import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, type MemoryPair, MemoryPairs } from '@/core/games/kit';

import { BOOK_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Scholars and Their Books (content: history-scholars) – memory pairs.
 *   L1 – three hadith collectors and their books; all cards shown first.
 *   L2 – the four imams and the schools named after them.
 *   L3 – the six books of hadith and their compilers (12 cards).
 */

const P = (id: string, scholar: ReturnType<typeof T>, book: ReturnType<typeof T>, art: string): MemoryPair => ({ id, a: { label: scholar, art: 'history.medallion' }, b: { label: book, art } });

const HADITH: Record<string, MemoryPair> = {
  bukhari: P('bukhari', T('Al-Bukhari', 'Al-Buchari', 'El-Buhari'), T('Sahih al-Bukhari', 'Sahih al-Buchari', 'Sahih el-Buhari'), 'history.book-green'),
  muslim: P('muslim', T('Muslim', 'Muslim', 'Muslim'), T('Sahih Muslim', 'Sahih Muslim', 'Sahih Muslim'), 'history.book-blue'),
  abudawud: P('abudawud', T('Abu Dawud', 'Abu Dawud', 'Ebu Davud'), T('Sunan Abi Dawud', 'Sunan Abi Dawud', 'Sunen Ebu Davud'), 'history.book-red'),
  tirmidhi: P('tirmidhi', T('Al-Tirmidhi', 'At-Tirmidhi', 'Et-Tirmizi'), T('Jamiʿ al-Tirmidhi', 'Dschamiʿ at-Tirmidhi', 'Džami’ et-Tirmizi'), 'history.book-gold'),
  nasai: P('nasai', T('Al-Nasa’i', 'An-Nasa’i', 'En-Nesai'), T('Sunan al-Nasa’i', 'Sunan an-Nasa’i', 'Sunen en-Nesai'), 'history.book-teal'),
  ibnmajah: P('ibnmajah', T('Ibn Majah', 'Ibn Madscha', 'Ibn Madže'), T('Sunan Ibn Majah', 'Sunan Ibn Madscha', 'Sunen Ibn Madže'), 'history.book-plum'),
};
const IMAMS: MemoryPair[] = [
  P('abuhanifa', T('Abu Hanifa', 'Abu Hanifa', 'Ebu Hanifa'), T('Hanafi school', 'Hanafitische Schule', 'Hanefijski mezheb'), 'history.book-green'),
  P('malik', T('Malik', 'Malik', 'Malik'), T('Maliki school', 'Malikitische Schule', 'Malikijski mezheb'), 'history.book-red'),
  P('shafii', T('Al-Shafi’i', 'Asch-Schafi’i', 'Eš-Šafi’i'), T('Shafi’i school', 'Schafiitische Schule', 'Šafijski mezheb'), 'history.book-blue'),
  P('ahmad', T('Ahmad ibn Hanbal', 'Ahmad ibn Hanbal', 'Ahmed ibn Hanbel'), T('Hanbali school', 'Hanbalitische Schule', 'Hanbelijski mezheb'), 'history.book-gold'),
];

export interface BooksConfig {
  set: 'hadith3' | 'imams' | 'hadith6';
}

const texts = {
  title: T('Scholars and Their Books', 'Gelehrte und ihre Bücher', 'Učenjaci i njihove knjige'),
  description: T(
    'The hadith collectors and the four imams preserved the Sunnah. Flip the cards and find each scholar’s book or school.',
    'Die Hadith-Sammler und die vier Imame bewahrten die Sunna. Dreh die Karten um und finde zu jedem Gelehrten sein Buch oder seine Schule.',
    'Sakupljači hadisa i četiri imama sačuvali su sunnet. Okreći karte i pronađi knjigu ili mezheb svakog učenjaka.',
  ),
  howTo: T('Flip two cards. A scholar and his book make a pair.', 'Dreh zwei Karten um. Ein Gelehrter und sein Buch sind ein Paar.', 'Okreni dvije karte. Učenjak i njegova knjiga čine par.'),
};

export function ScholarsBooksGame(api: GameApi<BooksConfig>) {
  const { set } = api.config;
  const pairs =
    set === 'imams' ? IMAMS : set === 'hadith3' ? [HADITH.bukhari, HADITH.muslim, HADITH.abudawud] : Object.values(HADITH);
  const fact = set === 'imams' ? F.imams.id : set === 'hadith3' ? F.sahihs.id : F.sixBooks.id;
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <MemoryPairs pairs={pairs} peekMs={set === 'hadith3' ? 2500 : undefined} columns={set === 'hadith6' ? 3 : undefined} onDone={finishWith(api as GameApi<unknown>, pairs.length, () => fact)} />
    </GameBoard>
  );
}

export const scholarsBooksGame = historyGame<BooksConfig>({
  id: 'scholars-books',
  texts,
  coverArt: 'history.book-green',
  hintArt: 'history.shelf',
  component: ScholarsBooksGame,
  levels: [
    { config: { set: 'hadith3' }, facts: [F.sahihs] },
    { config: { set: 'imams' }, facts: [F.imams, F.hanafi, F.respect] },
    { config: { set: 'hadith6' }, facts: [F.sixBooks, F.travel] },
  ],
  order: 60,
  teaches: ['learn:history-scholars-1', 'learn:history-scholars-2'],
});

export function registerScholarsBooksGame(): void {
  registerGame(scholarsBooksGame);
}

import { type GameApi, registerGame } from '@/core/games';
import { type ConnectPair, ConnectPairs, GameBoard } from '@/core/games/kit';

import { SCHOLAR_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Golden Age Scholars (content: history-golden-age): connect each scholar with …
 *   L1 – the field (pictures), hints.
 *   L2 – the work or place of learning (two more scholars: al-Zahrawi, Fatima al-Fihri).
 *   L3 – the city where they lived and worked; both columns shuffled, no hints.
 */

const SCHOLARS = {
  khwarizmi: T('Al-Khwarizmi', 'Al-Chwarizmi', 'El-Havarizmi'),
  ibnsina: T('Ibn Sina', 'Ibn Sina', 'Ibn Sina'),
  haytham: T('Ibn al-Haytham', 'Ibn al-Haitham', 'Ibn el-Hejsem'),
  zahrawi: T('Al-Zahrawi', 'Al-Zahrawi', 'Ez-Zehravi'),
  fihri: T('Fatima al-Fihri', 'Fatima al-Fihri', 'Fatima el-Fihri'),
};
type Scholar = keyof typeof SCHOLARS;

const FIELD: Record<Scholar, { label: ReturnType<typeof T>; art: string }> = {
  khwarizmi: { label: T('Algebra', 'Algebra', 'Algebra'), art: 'history.numerals' },
  ibnsina: { label: T('Medicine', 'Medizin', 'Medicina'), art: 'history.mortar' },
  haytham: { label: T('Optics (light)', 'Optik (Licht)', 'Optika (svjetlost)'), art: 'history.lens' },
  zahrawi: { label: T('Surgery', 'Chirurgie', 'Hirurgija'), art: 'history.surgical-tools' },
  fihri: { label: T('A place of learning', 'Eine Lehrstätte', 'Mjesto učenja'), art: 'history.qarawiyyin' },
};
const WORK: Record<Scholar, { label: ReturnType<typeof T>; art: string }> = {
  khwarizmi: { label: T('Book of al-Jabr', 'Buch über al-Dschabr', 'Knjiga o el-džebru'), art: 'history.book-blue' },
  ibnsina: { label: T('Canon of Medicine', 'Kanon der Medizin', 'Kanon medicine'), art: 'history.book-red' },
  haytham: { label: T('Book of Optics', 'Buch der Optik', 'Knjiga o optici'), art: 'history.book-teal' },
  zahrawi: { label: T('Al-Tasrif', 'At-Tasrif', 'Et-Tasrif'), art: 'history.surgical-tools' },
  fihri: { label: T('Al-Qarawiyyin', 'Al-Qarawiyyin', 'El-Karavijjin'), art: 'history.qarawiyyin' },
};
const CITY: Record<Scholar, ReturnType<typeof T>> = {
  khwarizmi: T('Baghdad', 'Bagdad', 'Bagdad'),
  ibnsina: T('Bukhara', 'Buchara', 'Buhara'),
  haytham: T('Cairo', 'Kairo', 'Kairo'),
  zahrawi: T('Córdoba', 'Córdoba', 'Kordoba'),
  fihri: T('Fez', 'Fès', 'Fes'),
};

export interface GoldenAgeConfig {
  scholars: Scholar[];
  right: 'field' | 'work' | 'city';
  hints: boolean;
}

const texts = {
  title: T('Golden Age Scholars', 'Gelehrte des Goldenen Zeitalters', 'Učenjaci zlatnog doba'),
  description: T(
    'Muslim scholars helped build mathematics, medicine and science. Connect each scholar with their field, their work and their city.',
    'Muslimische Gelehrte halfen, Mathematik, Medizin und Wissenschaft aufzubauen. Verbinde jeden Gelehrten mit seinem Fach, seinem Werk und seiner Stadt.',
    'Muslimanski učenjaci pomogli su izgradnju matematike, medicine i nauke. Spoji svakog učenjaka s njegovom oblašću, djelom i gradom.',
  ),
  howTo: T('Draw a line from each scholar to the right card.', 'Zieh eine Linie von jedem Gelehrten zur passenden Karte.', 'Povuci liniju od svakog učenjaka do prave kartice.'),
  'play.field': T('Which field did each scholar study?', 'Welches Fach hat jeder Gelehrte erforscht?', 'Koju oblast je proučavao svaki učenjak?'),
  'play.work': T('Connect each scholar with their famous work.', 'Verbinde jeden Gelehrten mit seinem berühmten Werk.', 'Spoji svakog učenjaka s njegovim poznatim djelom.'),
  'play.city': T('In which city did each scholar live and work?', 'In welcher Stadt lebte und wirkte jeder Gelehrte?', 'U kojem gradu je živio i radio svaki učenjak?'),
};

const factOf = (right: GoldenAgeConfig['right']) => (id: string) => {
  if (right === 'field') return id === 'khwarizmi' ? F.algebraWord.id : F.fields.id;
  if (right === 'work') return id === 'fihri' ? F.qarawiyyin.id : F.zahrawi.id;
  return id === 'haytham' ? F.optics.id : F.canon.id;
};

export function GoldenAgeGame(api: GameApi<GoldenAgeConfig>) {
  const { scholars, right, hints } = api.config;
  const pairs: ConnectPair[] = scholars.map((s) => ({
    id: s,
    left: { label: SCHOLARS[s] },
    right: right === 'field' ? FIELD[s] : right === 'work' ? WORK[s] : { label: CITY[s], art: 'kit.pin' },
  }));
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <ConnectPairs pairs={pairs} shuffleLeft={right === 'city'} hints={hints} prompt={api.t(`play.${right}`)} onDone={finishWith(api as GameApi<unknown>, pairs.length, factOf(right))} />
    </GameBoard>
  );
}

export const goldenAgeGame = historyGame<GoldenAgeConfig>({
  id: 'golden-age-scholars',
  texts,
  coverArt: 'history.astrolabe',
  hintArt: 'history.lens',
  component: GoldenAgeGame,
  levels: [
    { config: { scholars: ['khwarizmi', 'ibnsina', 'haytham'], right: 'field', hints: true }, facts: [F.fields, F.algebraWord] },
    { config: { scholars: ['khwarizmi', 'ibnsina', 'haytham', 'zahrawi', 'fihri'], right: 'work', hints: false }, facts: [F.zahrawi, F.qarawiyyin] },
    { config: { scholars: ['khwarizmi', 'ibnsina', 'haytham', 'zahrawi', 'fihri'], right: 'city', hints: false }, facts: [F.canon, F.optics] },
  ],
  order: 50,
  teaches: ['learn:history-golden-age-1', 'learn:history-golden-age-3', 'learn:history-golden-age-4'],
});

export function registerGoldenAgeGame(): void {
  registerGame(goldenAgeGame);
}

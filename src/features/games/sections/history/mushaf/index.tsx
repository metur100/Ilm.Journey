import { type GameApi, registerGame } from '@/core/games';
import { BuildScene, type BuildPart, GameBoard, type KitItem, PathTrace, type PathStop, SequenceBoard } from '@/core/games/kit';

import { MUSHAF_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Gathering the Mushaf (Sahih al-Bukhari 4986, 4987).
 *   L1 – build: gather what the Quran was written on onto Zayd's desk; the sheets are tied and kept in a chest.
 *   L2 – order the story: al-Yamama → Umar's advice → Zayd gathers → the sheets are kept → Hudhayfa → the copies.
 *   L3 – trace the path of the sheets: Abu Bakr → Umar → Hafsa → Uthman's copies → every province (no guide).
 */

const PARTS: BuildPart[] = [
  {
    id: 'palm-stalks',
    art: 'history.palm-stalks',
    label: T('Palm-leaf stalks', 'Palmblattstiele', 'Palmine peteljke'),
    slot: { x: 0.04, y: 0.4, w: 0.2, h: 0.32 },
    caption: T('Parts of the Quran were written on palm-leaf stalks.', 'Teile des Korans waren auf Palmblattstiele geschrieben.', 'Dijelovi Kur’ana bili su zapisani na palminim peteljkama.'),
  },
  {
    id: 'white-stones',
    art: 'history.white-stones',
    label: T('White stones', 'Weiße Steine', 'Bijelo kamenje'),
    slot: { x: 0.6, y: 0.5, w: 0.17, h: 0.16 },
    caption: T('Others were written on thin white stones.', 'Andere waren auf dünne weiße Steine geschrieben.', 'Drugi su bili zapisani na tankom bijelom kamenju.'),
  },
  {
    id: 'suhuf',
    art: 'history.suhuf',
    label: T('The sheets', 'Die Blätter', 'Listovi'),
    slot: { x: 0.36, y: 0.46, w: 0.24, h: 0.2 },
    caption: T('Zayd ibn Thabit wrote it all onto sheets, checked with those who knew it by heart.', 'Zaid ibn Thabit schrieb alles auf Blätter, geprüft mit denen, die ihn auswendig konnten.', 'Zejd ibn Sabit sve je prepisao na listove, provjeravajući s onima koji su ga znali napamet.'),
  },
  {
    id: 'chest',
    art: 'history.chest',
    label: T('Chest', 'Truhe', 'Sanduk'),
    slot: { x: 0.74, y: 0.62, w: 0.22, h: 0.24 },
    caption: T('The sheets were kept safe with Abu Bakr.', 'Die Blätter wurden bei Abu Bakr sicher aufbewahrt.', 'Listovi su se čuvali kod Ebu Bekra.'),
  },
];

const STORY: KitItem[] = [
  { id: 'yamama', label: T('Reciters fall at al-Yamama', 'Rezitatoren fallen bei al-Yamama', 'Učači ginu na Jemami') },
  { id: 'umar-advice', label: T('Umar urges Abu Bakr', 'Umar drängt Abu Bakr', 'Omer nagovara Ebu Bekra') },
  { id: 'zayd', label: T('Zayd gathers the Quran', 'Zaid sammelt den Koran', 'Zejd sakuplja Kur’an') },
  { id: 'kept', label: T('The sheets are kept', 'Die Blätter werden verwahrt', 'Listovi se čuvaju') },
  { id: 'hudhayfa', label: T('Hudhayfa asks Uthman', 'Hudhaifa bittet Uthman', 'Huzejfa moli Osmana') },
  { id: 'copies', label: T('Copies go to the provinces', 'Abschriften in die Provinzen', 'Prijepisi idu u pokrajine') },
];

const STOPS: PathStop[] = [
  { id: 'abubakr', label: T('Abu Bakr', 'Abu Bakr', 'Ebu Bekr'), at: { x: 0.12, y: 0.79 } },
  { id: 'umar', label: T('Umar', 'Umar', 'Omer'), at: { x: 0.32, y: 0.5 }, caption: T('After Abu Bakr, the sheets stayed with Umar.', 'Nach Abu Bakr blieben die Blätter bei Umar.', 'Nakon Ebu Bekra listovi su ostali kod Omera.') },
  { id: 'hafsa', label: T('Hafsa', 'Hafsa', 'Hafsa'), at: { x: 0.555, y: 0.7 }, caption: T('Then with Hafsa, the daughter of Umar.', 'Dann bei Hafsa, der Tochter Umars.', 'Zatim kod Hafse, Omerove kćerke.') },
  { id: 'uthman', label: T('Uthman', 'Uthman', 'Osman'), at: { x: 0.725, y: 0.373 }, caption: T('Uthman had copies made from Hafsa’s sheets.', 'Uthman ließ von Hafsas Blättern Abschriften machen.', 'Osman je dao prepisati Hafsine listove.') },
  { id: 'provinces', label: T('Provinces', 'Provinzen', 'Pokrajine'), at: { x: 0.88, y: 0.18 }, caption: T('One copy went to every Muslim province.', 'Jede muslimische Provinz bekam eine Abschrift.', 'Svaka muslimanska pokrajina dobila je po jedan prijepis.') },
];

type Mode = 'build' | 'story' | 'trace';
export interface MushafConfig {
  mode: Mode;
  hints: boolean;
}

const texts = {
  title: T('Gathering the Mushaf', 'Den Mushaf sammeln', 'Sakupljanje mushafa'),
  description: T(
    'How the Quran was gathered into one book under Abu Bakr and copied under Uthman (Sahih al-Bukhari 4986–4987).',
    'Wie der Koran unter Abu Bakr in einem Buch gesammelt und unter Uthman abgeschrieben wurde (Sahih al-Buchari 4986–4987).',
    'Kako je Kur’an sakupljen u jednu knjigu za vrijeme Ebu Bekra i prepisan za vrijeme Osmana (Sahih el-Buhari 4986–4987).',
  ),
  howTo: T('Drag each piece to its place on the desk.', 'Zieh jedes Teil an seinen Platz auf dem Tisch.', 'Prevuci svaki dio na njegovo mjesto na stolu.'),
  'play.build': T('Gather what the Quran was written on.', 'Sammle, worauf der Koran geschrieben war.', 'Sakupi ono na čemu je Kur’an bio zapisan.'),
  'play.story': T('Put the story in order, then tap Check.', 'Bring die Geschichte in die richtige Reihenfolge und tippe auf Prüfen.', 'Poredaj priču, pa dodirni Provjeri.'),
  'play.trace': T('Trace the path of the sheets with your finger.', 'Folge dem Weg der Blätter mit dem Finger.', 'Prstom prati put listova.'),
  'reveal.title': T('The sheets are gathered!', 'Die Blätter sind gesammelt!', 'Listovi su sakupljeni!'),
  'reveal.caption': T('Under Abu Bakr the Quran was gathered into one collection.', 'Unter Abu Bakr wurde der Koran in einer Sammlung zusammengetragen.', 'Za vrijeme Ebu Bekra Kur’an je sakupljen u jednu zbirku.'),
};

const storyFact: Record<string, string> = { yamama: F.yamama.id, 'umar-advice': F.yamama.id, zayd: F.yamama.id, kept: F.yamama.id, hudhayfa: F.hudhayfa.id, copies: F.hudhayfa.id };

export function MushafGame(api: GameApi<MushafConfig>) {
  const { mode, hints } = api.config;
  let board;
  if (mode === 'build') {
    board = (
      <BuildScene
        scene="history.scribe-room"
        parts={PARTS}
        ghosts
        hints={hints}
        prompt={api.t('play.build')}
        reveal={{ title: api.t('reveal.title'), caption: api.t('reveal.caption') }}
        onDone={finishWith(api as GameApi<unknown>, PARTS.length, () => F.zayd.id)}
      />
    );
  } else if (mode === 'story') {
    board = <SequenceBoard items={STORY} hints={hints} prompt={api.t('play.story')} onDone={finishWith(api as GameApi<unknown>, STORY.length, (id) => storyFact[id])} />;
  } else {
    board = (
      <PathTrace
        map="history.sheets-path"
        stops={STOPS}
        showRoute={false}
        hints={hints}
        prompt={api.t('play.trace')}
        onDone={finishWith(api as GameApi<unknown>, STOPS.length - 1, (id) => (id === 'uthman' || id === 'provinces' ? F.copies.id : F.hafsa.id))}
      />
    );
  }
  return <GameBoard api={api as GameApi<unknown>}>{board}</GameBoard>;
}

export const mushafGame = historyGame<MushafConfig>({
  id: 'mushaf-gathering',
  texts,
  coverArt: 'history.mushaf',
  hintArt: 'history.suhuf',
  component: MushafGame,
  levels: [
    { config: { mode: 'build', hints: true }, facts: [F.zayd, F.oneCollection] },
    { config: { mode: 'story', hints: true }, facts: [F.yamama, F.hudhayfa] },
    { config: { mode: 'trace', hints: false }, facts: [F.hafsa, F.copies] },
  ],
  order: 20,
});

export function registerMushafGame(): void {
  registerGame(mushafGame);
}

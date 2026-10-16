import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, SortBins, type SortItem } from '@/core/games/kit';

import { WISDOM_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * The House of Wisdom (Bayt al-Hikma, Baghdad): fill the library shelves by subject.
 *   L1 – two shelves (mathematics, medicine), tools of each field, hints.
 *   L2 – a third shelf (astronomy), no hints.
 *   L3 – four shelves (+ optics) and the famous books mixed in with the tools.
 */

const SHELF = {
  maths: { id: 'maths', label: T('Mathematics', 'Mathematik', 'Matematika'), art: 'history.shelf' },
  medicine: { id: 'medicine', label: T('Medicine', 'Medizin', 'Medicina'), art: 'history.shelf' },
  astronomy: { id: 'astronomy', label: T('Astronomy', 'Astronomie', 'Astronomija'), art: 'history.shelf' },
  optics: { id: 'optics', label: T('Light', 'Licht', 'Svjetlost'), art: 'history.shelf' },
};

const ITEMS: Record<string, SortItem> = {
  numerals: { id: 'numerals', art: 'history.numerals', label: T('Numbers', 'Zahlen', 'Brojevi'), bin: 'maths' },
  dividers: { id: 'dividers', art: 'history.dividers', label: T('Compass', 'Zirkel', 'Šestar'), bin: 'maths' },
  algebra: { id: 'algebra', art: 'history.book-blue', label: T('Al-Jabr', 'Al-Dschabr', 'El-Džebr'), sub: T('al-Khwarizmi', 'al-Chwarizmi', 'el-Havarizmi'), bin: 'maths' },
  herbs: { id: 'herbs', art: 'history.herbs', label: T('Healing herbs', 'Heilkräuter', 'Ljekovito bilje'), bin: 'medicine' },
  mortar: { id: 'mortar', art: 'history.mortar', label: T('Mortar', 'Mörser', 'Avan'), bin: 'medicine' },
  jar: { id: 'jar', art: 'history.medicine-jar', label: T('Medicine jar', 'Arzneigefäß', 'Posuda za lijek'), bin: 'medicine' },
  canon: { id: 'canon', art: 'history.book-red', label: T('Canon of Medicine', 'Kanon der Medizin', 'Kanon medicine'), sub: T('Ibn Sina', 'Ibn Sina', 'Ibn Sina'), bin: 'medicine' },
  astrolabe: { id: 'astrolabe', art: 'history.astrolabe', label: T('Astrolabe', 'Astrolabium', 'Astrolab'), bin: 'astronomy' },
  stars: { id: 'stars', art: 'history.star-chart', label: T('Star map', 'Sternkarte', 'Karta zvijezda'), bin: 'astronomy' },
  moon: { id: 'moon', art: 'history.moon-month', label: T('Moon phases', 'Mondphasen', 'Mjesečeve mijene'), bin: 'astronomy' },
  lens: { id: 'lens', art: 'history.lens', label: T('Lens', 'Linse', 'Leća'), bin: 'optics' },
  optics: { id: 'optics', art: 'history.book-teal', label: T('Book of Optics', 'Buch der Optik', 'Knjiga o optici'), sub: T('Ibn al-Haytham', 'Ibn al-Haitham', 'Ibn el-Hejsem'), bin: 'optics' },
};

export interface WisdomConfig {
  shelves: (keyof typeof SHELF)[];
  items: (keyof typeof ITEMS)[];
  hints: boolean;
}

const texts = {
  title: T('The House of Wisdom', 'Das Haus der Weisheit', 'Kuća mudrosti'),
  description: T(
    'In Baghdad, the House of Wisdom was a centre of translation and research. Fill its library shelves by subject.',
    'In Bagdad war das Haus der Weisheit ein Zentrum der Übersetzung und Forschung. Füll die Regale seiner Bibliothek nach Fächern.',
    'U Bagdadu je Kuća mudrosti bila središte prevođenja i istraživanja. Popuni police njene biblioteke po oblastima.',
  ),
  howTo: T('Drag each tool or book onto the shelf of its subject.', 'Zieh jedes Werkzeug und Buch auf das Regal seines Fachs.', 'Prevuci svaki alat ili knjigu na policu njene oblasti.'),
  'play.prompt': T('Which shelf does it belong on?', 'Auf welches Regal gehört es?', 'Na koju policu pripada?'),
};

const factOf = (id: string) => (id === 'algebra' || id === 'numerals' || id === 'dividers' ? F.khwarizmi.id : id === 'canon' ? F.canon.id : id === 'optics' || id === 'lens' ? F.optics.id : undefined);

export function HouseOfWisdomGame(api: GameApi<WisdomConfig>) {
  const { shelves, items, hints } = api.config;
  const list = items.map((id) => ITEMS[id]);
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <SortBins
        bins={shelves.map((s) => SHELF[s])}
        items={list}
        hints={hints}
        prompt={api.t('play.prompt')}
        onDone={finishWith(api as GameApi<unknown>, list.length, (id) => {
          const fact = factOf(id);
          return fact && api.facts.some((f) => f.id === fact) ? fact : undefined;
        })}
      />
    </GameBoard>
  );
}

export const houseOfWisdomGame = historyGame<WisdomConfig>({
  id: 'house-of-wisdom',
  texts,
  coverArt: 'history.house-of-wisdom',
  hintArt: 'history.shelf',
  component: HouseOfWisdomGame,
  levels: [
    { config: { shelves: ['maths', 'medicine'], items: ['numerals', 'dividers', 'herbs', 'mortar', 'jar', 'algebra'], hints: true }, facts: [F.house, F.increase] },
    { config: { shelves: ['maths', 'medicine', 'astronomy'], items: ['numerals', 'dividers', 'algebra', 'herbs', 'jar', 'astrolabe', 'stars', 'moon', 'mortar'], hints: false }, facts: [F.khwarizmi, F.read] },
    {
      config: { shelves: ['maths', 'medicine', 'astronomy', 'optics'], items: ['algebra', 'canon', 'optics', 'lens', 'astrolabe', 'herbs', 'dividers', 'stars', 'mortar', 'numerals'], hints: false },
      facts: [F.canon, F.optics],
    },
  ],
  order: 40,
  teaches: ['learn:history-golden-age-p', 'learn:history-golden-age-2'],
});

export function registerHouseOfWisdomGame(): void {
  registerGame(houseOfWisdomGame);
}

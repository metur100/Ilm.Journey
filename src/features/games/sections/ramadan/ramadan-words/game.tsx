import type { GameApi } from '@/core/games';
import { GameBoard, type MemoryPair, MemoryPairs } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Ramadan Words: a memory game of the Arabic words of Ramadan (copied with their transliteration from
 * quests/ramadan.json) and their pictures and meanings.
 * L1: three pairs, shown first for a moment. L2: four pairs from memory. L3: all six pairs.
 */

export const WORDS_ID = 'ramadan-words';

const i18n = defineNamespace(`game.${WORDS_ID}`, {
  en: {
    title: 'Ramadan Words',
    description: 'Ramadan, sawm, suhoor, iftar, Laylat al-Qadr, Eid al-Fitr – find each Arabic word and its meaning.',
    howTo: 'Turn over two cards. Find each Arabic word and its picture.',
    'play.prompt': 'Find the pairs: the Arabic word and its meaning.',
  },
  de: {
    title: 'Ramadan-Wörter',
    description: 'Ramadan, Saum, Suhur, Iftar, Laylat al-Qadr, Eid al-Fitr – finde jedes arabische Wort und seine Bedeutung.',
    howTo: 'Dreh zwei Karten um. Finde jedes arabische Wort und sein Bild.',
    'play.prompt': 'Finde die Paare: das arabische Wort und seine Bedeutung.',
  },
  bs: {
    title: 'Ramazanske riječi',
    description: 'Ramazan, savm, sehur, iftar, Lejletul-kadr, Ramazanski bajram – pronađi svaku arapsku riječ i njeno značenje.',
    howTo: 'Okreni dvije kartice. Pronađi svaku arapsku riječ i njenu sliku.',
    'play.prompt': 'Pronađi parove: arapsku riječ i njeno značenje.',
  },
});

export const W = {
  ramadan: { id: 'ramadan', a: { arabic: 'رَمَضَان', sub: 'ramaḍān' }, b: { art: 'ramadan.crescent-dusk', label: T('The ninth month', 'Der neunte Monat', 'Deveti mjesec') } },
  sawm: { id: 'sawm', a: { arabic: 'صَوْم', sub: 'ṣawm' }, b: { art: 'ramadan.sky-arc', label: T('Fasting', 'Fasten', 'Post') } },
  suhoor: { id: 'suhoor', a: { arabic: 'سُحُور', sub: 'suḥūr' }, b: { art: 'food.bread', label: T('Meal before dawn', 'Mahlzeit vor der Dämmerung', 'Obrok prije zore') } },
  iftar: { id: 'iftar', a: { arabic: 'إِفْطَار', sub: 'ifṭār' }, b: { art: 'food.dates', label: T('Meal at sunset', 'Mahlzeit bei Sonnenuntergang', 'Obrok o zalasku sunca') } },
  qadr: { id: 'qadr', a: { arabic: 'لَيْلَةُ الْقَدْر', sub: 'laylat al-qadr' }, b: { art: 'ramadan.qadr-sky', label: T('Night of Decree', 'Nacht der Bestimmung', 'Noć kadra') } },
  eid: { id: 'eid', a: { arabic: 'عِيدُ الْفِطْر', sub: 'ʿīd al-fiṭr' }, b: { art: 'ramadan.eid-gift', label: T('Eid al-Fitr', 'Eid al-Fitr', 'Ramazanski bajram') } },
} satisfies Record<string, MemoryPair>;

export interface WordsConfig {
  pairs: MemoryPair[];
  peekMs?: number;
}

function RamadanWordsGame(api: GameApi<WordsConfig>) {
  const { pairs, peekMs } = api.config;
  return (
    <GameBoard api={api}>
      <MemoryPairs pairs={pairs} peekMs={peekMs} columns={pairs.length > 4 ? 3 : 2} prompt={api.t('play.prompt')} onDone={finishWith(api, pairs.length)} />
    </GameBoard>
  );
}

export const ramadanWordsGame = ramadanGame<WordsConfig>({
  id: WORDS_ID,
  i18n,
  coverArt: 'object.lantern-ramadan',
  hintArt: 'kit.cards',
  component: RamadanWordsGame,
  levels: [
    { level: 1, config: { pairs: [W.ramadan, W.suhoor, W.iftar], peekMs: 2500 }, facts: [FACTS.ninthMonth] },
    { level: 2, config: { pairs: [W.sawm, W.suhoor, W.iftar, W.eid] }, facts: [FACTS.suhoor] },
    { level: 3, config: { pairs: [W.ramadan, W.sawm, W.suhoor, W.iftar, W.qadr, W.eid] }, facts: [FACTS.qadr] },
  ],
  teaches: { questionKeys: ['quest:ramadan-meals-match', 'quest:ramadan-memory'] },
  order: 120,
});

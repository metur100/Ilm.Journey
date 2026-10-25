import type { GameApi } from '@/core/games';
import { GameBoard, type MemoryPair, MemoryPairs } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { FACTS, T } from '../shared/facts';

/*
 * Ramadan Words: a memory game of Arabic words (copied with their transliteration from the Learn content –
 * quests/ramadan.json and the salah / akhlaq / quran units) and their pictures and meanings. Every level has its own
 * words: L1 the month (Ramadan, sawm, the Quran), shown first for a moment. L2 the fasting day (suhoor, Fajr,
 * Maghrib, iftar). L3 the last nights and Eid (Laylat al-Qadr, ʿafw, sabr, shukr, Eid al-Fitr).
 */

export const WORDS_ID = 'ramadan-words';

const i18n = defineNamespace(`game.${WORDS_ID}`, {
  en: {
    title: 'Ramadan Words',
    description: 'The words of the month, of the fasting day and of the last nights – find each Arabic word and its meaning.',
    howTo: 'Turn over two cards. Find each Arabic word and its picture.',
    'play.prompt': 'Find the pairs: the Arabic word and its meaning.',
  },
  de: {
    title: 'Ramadan-Wörter',
    description: 'Die Wörter des Monats, des Fastentags und der letzten Nächte – finde jedes arabische Wort und seine Bedeutung.',
    howTo: 'Dreh zwei Karten um. Finde jedes arabische Wort und sein Bild.',
    'play.prompt': 'Finde die Paare: das arabische Wort und seine Bedeutung.',
  },
  bs: {
    title: 'Ramazanske riječi',
    description: 'Riječi mjeseca, dana posta i posljednjih noći – pronađi svaku arapsku riječ i njeno značenje.',
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
  quran: { id: 'quran', a: { arabic: 'الْقُرْآن', sub: 'al-qurʾān' }, b: { art: 'object.quran-stand', label: T('The Quran', 'Der Koran', "Kur'an") } },
  fajr: { id: 'fajr', a: { arabic: 'الْفَجْر', sub: 'al-fajr' }, b: { art: 'sky.dawn', label: T('Dawn – the fast begins', 'Morgendämmerung – das Fasten beginnt', 'Zora – post počinje') } },
  maghrib: { id: 'maghrib', a: { arabic: 'الْمَغْرِب', sub: 'al-maghrib' }, b: { art: 'sky.sunset', label: T('Sunset – the fast ends', 'Sonnenuntergang – das Fasten endet', 'Zalazak sunca – post završava') } },
  afw: { id: 'afw', a: { arabic: 'عَفْو', sub: 'ʿafw' }, b: { art: 'ui.heart', label: T('Forgiveness', 'Vergebung', 'Oprost') } },
  sabr: { id: 'sabr', a: { arabic: 'صَبْر', sub: 'ṣabr' }, b: { art: 'object.hourglass', label: T('Patience', 'Geduld', 'Strpljenje') } },
  shukr: { id: 'shukr', a: { arabic: 'شُكْر', sub: 'shukr' }, b: { art: 'akhlaq.gratitude-jar', label: T('Gratitude', 'Dankbarkeit', 'Zahvalnost') } },
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
    { level: 1, config: { pairs: [W.ramadan, W.sawm, W.quran], peekMs: 2500 }, facts: [FACTS.ninthMonth] },
    { level: 2, config: { pairs: [W.suhoor, W.fajr, W.maghrib, W.iftar] }, facts: [FACTS.suhoor] },
    { level: 3, config: { pairs: [W.qadr, W.afw, W.sabr, W.shukr, W.eid] }, facts: [FACTS.qadr] },
  ],
  teaches: { questionKeys: ['quest:ramadan-meals-match', 'quest:ramadan-memory'] },
  order: 120,
});

import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Messages of the Surahs',
  description: 'Every short surah carries a message. Connect each surah of Juz ʿAmma with what it tells us.',
  howTo: 'Draw a line from a surah to its message. You can also tap the surah, then the message.',
  'play.prompt': 'Connect each surah with its message.',
  'play.promptAyah': 'Connect each message with the ayah that says it.',
  'msg.112': 'Allah is One',
  'msg.103': 'Time, faith and good deeds',
  'msg.114': 'Seeking refuge with Allah',
  'msg.94': 'With hardship comes ease',
  'msg.107': 'Help those in need',
  'msg.99': 'Every atom of good is seen',
  'msg.106': 'Worship the Lord of this House',
  'msg.108': 'Pray to your Lord',
  'msg.93': 'Allah cares for you',
  'msg.110': 'Praise Allah and ask His forgiveness',
  'msg.97': 'A night better than a thousand months',
  'msg.109': 'To you your religion, to me mine',
  'msg.102': 'Do not let wanting more distract you',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Botschaften der Suren',
  description: 'Jede kurze Sure trägt eine Botschaft. Verbinde jede Sure aus Dschuz ʿAmma mit dem, was sie uns sagt.',
  howTo: 'Zieh eine Linie von einer Sure zu ihrer Botschaft. Du kannst auch die Sure und dann die Botschaft antippen.',
  'play.prompt': 'Verbinde jede Sure mit ihrer Botschaft.',
  'play.promptAyah': 'Verbinde jede Botschaft mit dem Vers, der sie sagt.',
  'msg.112': 'Allah ist Einer',
  'msg.103': 'Zeit, Glaube und gute Taten',
  'msg.114': 'Zuflucht bei Allah suchen',
  'msg.94': 'Mit der Erschwernis kommt Erleichterung',
  'msg.107': 'Den Bedürftigen helfen',
  'msg.99': 'Jedes Stäubchen Gutes wird gesehen',
  'msg.106': 'Dem Herrn dieses Hauses dienen',
  'msg.108': 'Bete zu deinem Herrn',
  'msg.93': 'Allah sorgt für dich',
  'msg.110': 'Allah preisen und Ihn um Vergebung bitten',
  'msg.97': 'Eine Nacht besser als tausend Monate',
  'msg.109': 'Euch eure Religion, mir meine',
  'msg.102': 'Lass dich nicht vom Mehr-Haben-Wollen ablenken',
};

const bs: Record<Key, string> = {
  title: 'Poruke sura',
  description: 'Svaka kratka sura nosi poruku. Spoji svaku suru iz Džuz Amme s onim što nam govori.',
  howTo: 'Povuci liniju od sure do njene poruke. Možeš dodirnuti i suru, pa poruku.',
  'play.prompt': 'Spoji svaku suru s njenom porukom.',
  'play.promptAyah': 'Spoji svaku poruku s ajetom koji je kazuje.',
  'msg.112': 'Allah je Jedan',
  'msg.103': 'Vrijeme, vjerovanje i dobra djela',
  'msg.114': 'Traženje utočišta kod Allaha',
  'msg.94': 'S mukom je i olakšanje',
  'msg.107': 'Pomozi potrebnima',
  'msg.99': 'Svaki trun dobra se vidi',
  'msg.106': 'Klanjaj se Gospodaru ovog Hrama',
  'msg.108': 'Moli se svom Gospodaru',
  'msg.93': 'Allah brine o tebi',
  'msg.110': 'Veličaj Allaha i traži Njegov oprost',
  'msg.97': 'Noć bolja od hiljadu mjeseci',
  'msg.109': 'Vama vaša vjera, a meni moja',
  'msg.102': 'Ne daj da te zaokupi gomilanje',
};

export const surahMessagesI18n = defineNamespace('game.surah-messages', { en, de, bs });
export type SurahMessagesKey = Key;

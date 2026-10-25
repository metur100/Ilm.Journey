import { defineNamespace } from '@/core/i18n';

/** Namespace `game.year-of-the-elephant`. The ayah meanings themselves come from the generated Quran data. */
const en = {
  title: 'The Year of the Elephant',
  description: 'Set the scene of Surah al-Fil in the valley of Makkah – the year the Prophet ﷺ was born.',
  howTo: 'Drag each picture into the valley in the order of the surah. Later put the ayahs in order and sort what the Quran says from what the Seerah reports add.',
  'play.build': 'Build the scene in the order of Surah al-Fil.',
  'play.order': 'Put the meanings of the five ayahs of Surah al-Fil in order.',
  'play.sort': 'Is it said in the Quran, or reported in the Seerah books?',
  'reveal.title': 'Surah al-Fil',
  'reveal.caption': 'An army with an elephant came to the Kaʿbah and was turned back.',
  'part.kaaba': 'The Kaʿbah',
  'part.elephant': 'The elephant',
  'part.birds': 'Birds in flocks',
  'part.stones': 'Stones of clay',
  'part.straw': 'Eaten straw',
  'bin.quran': 'In the Quran',
  'bin.seerah': 'Seerah reports',
  'item.companions': 'The companions of the elephant',
  'item.birds': 'Birds in flocks',
  'item.plan': 'Allah made their plan go astray',
  'item.abrahah': 'The leader was Abrahah',
  'item.yemen': 'He was the Abyssinian ruler of Yemen',
  'item.birth': 'The Prophet ﷺ was born that year',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Das Jahr des Elefanten',
  description: 'Stelle die Szene der Sure al-Fil im Tal von Mekka dar – das Jahr, in dem der Prophet ﷺ geboren wurde.',
  howTo: 'Zieh jedes Bild in der Reihenfolge der Sure ins Tal. Später ordnest du die Verse und trennst, was der Koran sagt, von dem, was die Sira-Berichte ergänzen.',
  'play.build': 'Baue die Szene in der Reihenfolge der Sure al-Fil.',
  'play.order': 'Bring die Bedeutungen der fünf Verse der Sure al-Fil in die richtige Reihenfolge.',
  'play.sort': 'Steht es im Koran oder wird es in den Sira-Büchern berichtet?',
  'reveal.title': 'Sure al-Fil',
  'reveal.caption': 'Ein Heer mit einem Elefanten zog zur Kaaba und wurde zurückgeschlagen.',
  'part.kaaba': 'Die Kaaba',
  'part.elephant': 'Der Elefant',
  'part.birds': 'Vögel in Schwärmen',
  'part.stones': 'Steine aus Lehm',
  'part.straw': 'Abgefressene Halme',
  'bin.quran': 'Im Koran',
  'bin.seerah': 'Sira-Berichte',
  'item.companions': 'Die Leute des Elefanten',
  'item.birds': 'Vögel in Schwärmen',
  'item.plan': 'Allah ließ ihre List fehlgehen',
  'item.abrahah': 'Der Anführer war Abraha',
  'item.yemen': 'Er war der abessinische Herrscher Jemens',
  'item.birth': 'Der Prophet ﷺ wurde in diesem Jahr geboren',
};

const bs: Record<Key, string> = {
  title: 'Godina slona',
  description: 'Složi prizor sure el-Fil u dolini Mekke – godine u kojoj je rođen Poslanik ﷺ.',
  howTo: 'Prevuci svaku sliku u dolinu redoslijedom sure. Kasnije poredaj ajete i razvrstaj šta kaže Kur’an, a šta dodaju predaje sire.',
  'play.build': 'Složi prizor redoslijedom sure el-Fil.',
  'play.order': 'Poredaj značenja pet ajeta sure el-Fil.',
  'play.sort': 'Kaže li to Kur’an ili se to prenosi u knjigama sire?',
  'reveal.title': 'Sura el-Fil',
  'reveal.caption': 'Vojska sa slonom krenula je na Kabu i bila je odbijena.',
  'part.kaaba': 'Kaba',
  'part.elephant': 'Slon',
  'part.birds': 'Jata ptica',
  'part.stones': 'Grumenje gline',
  'part.straw': 'Istočeno lišće',
  'bin.quran': 'U Kur’anu',
  'bin.seerah': 'Predaje sire',
  'item.companions': 'Vlasnici slona',
  'item.birds': 'Jata ptica',
  'item.plan': 'Allah je njihovu spletku osujetio',
  'item.abrahah': 'Vođa je bio Ebreha',
  'item.yemen': 'Bio je abesinski vladar Jemena',
  'item.birth': 'Poslanik ﷺ je rođen te godine',
};

export const elephantI18n = defineNamespace('game.year-of-the-elephant', { en, de, bs });

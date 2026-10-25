import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The High Station',
  description: 'What the Quran says about Idris: a man of truth, among the patient, raised by Allah to a high station – each with its lesson.',
  howTo: 'Level 1: sort what is truthful. Level 2: connect each hard moment with the patient way. Level 3: find the star path up to the high station.',
  'play.climb': 'Allah raised Idris to a high station (19:57). Find your way from star to star, up to the highest star.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Der hohe Rang',
  description: 'Was der Koran über Idris sagt: ein Mann der Wahrhaftigkeit, einer der Geduldigen, von Allah zu einem hohen Rang erhoben – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Sortiere, was wahrhaftig ist. Stufe 2: Verbinde jeden schweren Moment mit dem geduldigen Weg. Stufe 3: Finde den Sternenpfad bis zum hohen Rang.',
  'play.climb': 'Allah erhob Idris zu einem hohen Rang (19:57). Finde deinen Weg von Stern zu Stern bis zum höchsten Stern.',
};

const bs: Record<Key, string> = {
  title: 'Visok položaj',
  description: 'Šta Kur’an kaže o Idrisu: iskren čovjek, od strpljivih, kojeg je Allah uzdigao na visoko mjesto – svaki dio sa svojom poukom.',
  howTo: 'Nivo 1: razvrstaj šta je iskreno. Nivo 2: spoji svaki težak trenutak sa strpljivim putem. Nivo 3: pronađi zvjezdanu stazu do visokog položaja.',
  'play.climb': 'Allah je Idrisa uzdigao na visoko mjesto (19:57). Pronađi put od zvijezde do zvijezde, sve do najviše zvijezde.',
};

export const idrisI18n = defineNamespace('game.idris-high-station', { en, de, bs });

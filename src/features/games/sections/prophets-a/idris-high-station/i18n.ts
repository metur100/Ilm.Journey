import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The High Station',
  description: 'Idris was truthful and patient, and Allah raised him to a high station. Climb the star path!',
  howTo: 'Trace the path from star to star up the mountain. On level 3, sort good deeds into "truthful" and "patient".',
  'play.path': 'Trace from the foot of the mountain up to the highest star.',
  'play.pathFree': 'No path this time – find your way from star to star.',
  'play.sort': 'Truthful or patient? Put each deed in its basket.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Der hohe Rang',
  description: 'Idris war wahrhaftig und geduldig, und Allah erhob ihn zu einem hohen Rang. Steig den Sternenpfad hinauf!',
  howTo: 'Fahre den Weg von Stern zu Stern den Berg hinauf nach. In Stufe 3 sortierst du gute Taten in „wahrhaftig“ und „geduldig“.',
  'play.path': 'Fahre vom Fuß des Berges bis zum höchsten Stern.',
  'play.pathFree': 'Diesmal ohne Weg – finde selbst von Stern zu Stern.',
  'play.sort': 'Wahrhaftig oder geduldig? Leg jede Tat in ihren Korb.',
};

const bs: Record<Key, string> = {
  title: 'Visok položaj',
  description: 'Idris je bio iskren i strpljiv, a Allah ga je uzdigao na visok položaj. Popni se zvjezdanom stazom!',
  howTo: 'Prati stazu od zvijezde do zvijezde uz planinu. U 3. nivou razvrstaj dobra djela na „iskren“ i „strpljiv“.',
  'play.path': 'Prati stazu od podnožja planine do najviše zvijezde.',
  'play.pathFree': 'Ovaj put bez staze – sam pronađi put od zvijezde do zvijezde.',
  'play.sort': 'Iskren ili strpljiv? Stavi svako djelo u njegovu korpu.',
};

export const idrisI18n = defineNamespace('game.idris-high-station', { en, de, bs });

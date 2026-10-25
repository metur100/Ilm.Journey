import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The Valley of ʿAd',
  description: 'Three parts of Hud’s story: the gifts Allah gave ʿAd, Hud’s call and their pride, and how Allah saved Hud and the believers – each with its lesson.',
  howTo: 'Level 1: tap the gifts of Allah in the valley. Level 2: sort Hud’s call and their pride. Level 3: put the end of the story in order.',
  'play.find': 'Find the gifts Allah gave ʿAd: livestock, gardens, springs and palms.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Das Tal der ʿAd',
  description: 'Drei Teile von Huds Geschichte: die Gaben Allahs an die ʿAd, Huds Aufruf und ihr Hochmut, und wie Allah Hud und die Gläubigen rettete – jeder mit seiner Lehre.',
  howTo: 'Stufe 1: Tippe die Gaben Allahs im Tal an. Stufe 2: Sortiere Huds Aufruf und ihren Hochmut. Stufe 3: Bring das Ende der Geschichte in die richtige Reihenfolge.',
  'play.find': 'Finde die Gaben, die Allah den ʿAd gab: Vieh, Gärten, Quellen und Palmen.',
};

const bs: Record<Key, string> = {
  title: 'Dolina Ada',
  description: 'Tri dijela Hudove priče: blagodati koje je Allah dao Adu, Hudov poziv i njihova oholost, te kako je Allah spasio Huda i vjernike – svaki sa svojom poukom.',
  howTo: 'Nivo 1: dodirni Allahove blagodati u dolini. Nivo 2: razvrstaj Hudov poziv i njihovu oholost. Nivo 3: poredaj kraj priče.',
  'play.find': 'Pronađi blagodati koje je Allah dao Adu: stoku, bašče, izvore i palme.',
};

export const hudI18n = defineNamespace('game.hud-valley-of-ad', { en, de, bs });

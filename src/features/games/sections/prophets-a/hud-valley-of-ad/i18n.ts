import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The Valley of ʿAd',
  description: 'Allah gave the people of ʿAd many gifts. Find them in the valley – and learn what Hud called his people to.',
  howTo: 'Tap the gifts of Allah in the valley. On level 3, sort: a gift, Hud\'s call, or their pride?',
  'play.find': 'Find the gifts Allah gave ʿAd: livestock, gardens and springs.',
  'play.findOrdered': 'Find the gifts one after another – the tower built for show is not a gift.',
  'play.sort': 'A gift of Allah, Hud\'s call, or their pride? Sort each card.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Das Tal der ʿAd',
  description: 'Allah gab den ʿAd viele Gaben. Finde sie im Tal – und lerne, wozu Hud sein Volk aufrief.',
  howTo: 'Tippe die Gaben Allahs im Tal an. In Stufe 3 sortierst du: eine Gabe, Huds Aufruf oder ihr Hochmut?',
  'play.find': 'Finde die Gaben, die Allah den ʿAd gab: Vieh, Gärten und Quellen.',
  'play.findOrdered': 'Finde die Gaben nacheinander – der Turm zum Angeben ist keine Gabe.',
  'play.sort': 'Eine Gabe Allahs, Huds Aufruf oder ihr Hochmut? Sortiere jede Karte.',
};

const bs: Record<Key, string> = {
  title: 'Dolina Ada',
  description: 'Allah je Adu dao mnoge blagodati. Pronađi ih u dolini – i nauči čemu je Hud pozivao svoj narod.',
  howTo: 'Dodirni Allahove blagodati u dolini. U 3. nivou razvrstaj: blagodat, Hudov poziv ili njihova oholost?',
  'play.find': 'Pronađi blagodati koje je Allah dao Adu: stoku, bašče i izvore.',
  'play.findOrdered': 'Pronađi blagodati jednu za drugom – kula za razmetanje nije blagodat.',
  'play.sort': 'Allahova blagodat, Hudov poziv ili njihova oholost? Razvrstaj svaku kartu.',
};

export const hudI18n = defineNamespace('game.hud-valley-of-ad', { en, de, bs });

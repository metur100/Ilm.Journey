import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Safa and Marwa',
  description: 'Hajar searched between two hills seven times – then Allah sent the spring of Zamzam. Walk her path and care for the water.',
  howTo: 'Level 1: trace the seven runs between Safa and Marwa. Level 2: fill the waterskins. Level 3: build the basin around Zamzam.',
  'play.runs': 'Start on Safa. Trace to Marwa and back – seven runs in all.',
  'play.pour': 'The spring of Zamzam! Hold to fill each waterskin up to its line.',
  'play.site': 'Build a basin around the spring – then watch who comes to the water.',
  'play.reveal': 'Zamzam – water in the valley',
  'play.revealCaption': 'The valley without plants came to life (14:37; Bukhari 3364).',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Safa und Marwa',
  description: 'Hadschar suchte siebenmal zwischen zwei Hügeln – dann schenkte Allah die Quelle Zamzam. Geh ihren Weg und hüte das Wasser.',
  howTo: 'Stufe 1: Fahre die sieben Läufe zwischen Safa und Marwa nach. Stufe 2: Füll die Wasserschläuche. Stufe 3: Bau das Becken um Zamzam.',
  'play.runs': 'Beginne auf Safa. Fahre nach Marwa und zurück – insgesamt sieben Läufe.',
  'play.pour': 'Die Quelle Zamzam! Halte gedrückt, um jeden Wasserschlauch bis zur Linie zu füllen.',
  'play.site': 'Bau ein Becken um die Quelle – und sieh, wer zum Wasser kommt.',
  'play.reveal': 'Zamzam – Wasser im Tal',
  'play.revealCaption': 'Das Tal ohne Pflanzen erwachte zum Leben (14:37; Bukhari 3364).',
};

const bs: Record<Key, string> = {
  title: 'Safa i Merva',
  description: 'Hadžera je sedam puta tražila između dva brežuljka – a onda je Allah dao izvor Zemzem. Pređi njen put i čuvaj vodu.',
  howTo: 'Nivo 1: prati sedam trčanja između Safe i Merve. Nivo 2: napuni mješine. Nivo 3: napravi bazen oko Zemzema.',
  'play.runs': 'Počni na Safi. Prati do Merve i nazad – ukupno sedam trčanja.',
  'play.pour': 'Izvor Zemzem! Drži da napuniš svaku mješinu do njene crte.',
  'play.site': 'Napravi bazen oko izvora – i vidi ko dolazi vodi.',
  'play.reveal': 'Zemzem – voda u dolini',
  'play.revealCaption': 'Dolina bez rastinja je oživjela (14:37; Buhari 3364).',
};

export const ismailI18n = defineNamespace('game.ismail-safa-marwa', { en, de, bs });

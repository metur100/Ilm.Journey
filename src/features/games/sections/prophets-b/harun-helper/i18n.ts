import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Speak & Support',
  description: 'Musa asked Allah for help – and for his brother Harun at his side. Learn the requests of his dua.',
  howTo: 'Flip two cards to find a picture and its request. In level 3, put the whole dua in order and check it.',
  'play.promptMemory': 'Find each request of Musa\'s dua and its picture.',
  'play.promptOrder': 'Put Musa\'s dua in order (Quran 20:25–34) – then check.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Sprechen & Stützen',
  description: 'Musa bat Allah um Hilfe – und um seinen Bruder Harun an seiner Seite. Lerne die Bitten seines Bittgebets.',
  howTo: 'Decke zwei Karten auf, um ein Bild und seine Bitte zu finden. In Level 3 bringst du das ganze Bittgebet in die richtige Reihenfolge und prüfst es.',
  'play.promptMemory': 'Finde jede Bitte aus Musas Bittgebet und ihr Bild.',
  'play.promptOrder': 'Bringe Musas Bittgebet in die richtige Reihenfolge (Koran 20:25–34) – dann prüfen.',
};

const bs: Record<Key, string> = {
  title: 'Govor i podrška',
  description: 'Musa je od Allaha tražio pomoć – i brata Haruna uz sebe. Nauči molbe iz njegove dove.',
  howTo: 'Okreni dvije karte da nađeš sliku i njenu molbu. U 3. nivou poredaj cijelu dovu i provjeri.',
  'play.promptMemory': 'Nađi svaku molbu iz Musaove dove i njenu sliku.',
  'play.promptOrder': "Poredaj Musaovu dovu (Kur'an 20:25–34) – pa provjeri.",
};

export const harunHelperI18n = defineNamespace('game.harun-helper', { en, de, bs });

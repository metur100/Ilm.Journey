import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Listen and Order',
  description: 'Listen to a short surah and put its ayahs back in the right order.',
  howTo: 'Tap Listen to hear the surah. Drag the ayahs up or down until they are in order, then tap Check.',
  'play.prompt': 'Put the ayahs of Surah {name} in order, then tap Check.',
  'play.promptPath': 'Lay the ayahs of Surah {name} on the path, one after another.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Hören und Ordnen',
  description: 'Hör eine kurze Sure und bring ihre Verse wieder in die richtige Reihenfolge.',
  howTo: 'Tippe auf Anhören, um die Sure zu hören. Schieb die Verse nach oben oder unten, bis sie stimmen, dann tippe auf Prüfen.',
  'play.prompt': 'Bring die Verse der Sure {name} in die richtige Reihenfolge und tippe auf Prüfen.',
  'play.promptPath': 'Leg die Verse der Sure {name} nacheinander auf den Weg.',
};

const bs: Record<Key, string> = {
  title: 'Slušaj i poredaj',
  description: 'Poslušaj kratku suru i vrati njene ajete pravilnim redom.',
  howTo: 'Dodirni Slušaj da čuješ suru. Pomjeraj ajete gore ili dolje dok ne budu poredani, pa dodirni Provjeri.',
  'play.prompt': 'Poredaj ajete sure {name}, pa dodirni Provjeri.',
  'play.promptPath': 'Postavi ajete sure {name} na stazu, jedan za drugim.',
};

export const listenAndOrderI18n = defineNamespace('game.listen-and-order', { en, de, bs });

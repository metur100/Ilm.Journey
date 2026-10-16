import { defineNamespace } from '@/core/i18n';

const en = {
  title: "Yusuf's Story Trail",
  description: 'Walk the trail of the best of stories: from the dream and the well to the storehouses of Egypt and forgiveness.',
  howTo: 'Drag each stop of the story onto the next stone of the path. In level 3, put the whole story in order and check it.',
  'play.prompt': 'Which stop of the story comes next? Put it on the glowing stone.',
  'play.promptList': 'Put the whole story of Yusuf in order – from memory – then check.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Yusufs Geschichtenpfad',
  description: 'Geh den Pfad der schönsten Geschichte: vom Traum und Brunnen bis zu den Vorratshäusern Ägyptens und zur Vergebung.',
  howTo: 'Ziehe jede Station der Geschichte auf den nächsten Stein des Pfades. In Level 3 bringst du die ganze Geschichte in die richtige Reihenfolge und prüfst sie.',
  'play.prompt': 'Welche Station kommt als Nächstes? Lege sie auf den leuchtenden Stein.',
  'play.promptList': 'Bringe die ganze Geschichte Yusufs in die richtige Reihenfolge – aus dem Gedächtnis – und prüfe dann.',
};

const bs: Record<Key, string> = {
  title: 'Jusufov put kroz kazivanje',
  description: 'Prođi putem najljepšeg kazivanja: od sna i bunara do riznica Egipta i oprosta.',
  howTo: 'Odvuci svaku stanicu kazivanja na sljedeći kamen puta. U 3. nivou poredaj cijelo kazivanje i provjeri.',
  'play.prompt': 'Koja stanica kazivanja dolazi sljedeća? Stavi je na kamen koji svijetli.',
  'play.promptList': 'Poredaj cijelo kazivanje o Jusufu – napamet – pa provjeri.',
};

export const yusufStoryI18n = defineNamespace('game.yusuf-story-path', { en, de, bs });

import { defineNamespace } from '../i18n';
import type { TopicId } from '../models';
import { isNewGame, levelProgress, totalStars, type GamesData } from './progress';
import type { GameDef } from './types';
import { GAME_LEVELS } from './types';

/**
 * Play tab sections (GAMES-V3 §3): the order of the sections and their cover art. Sufara (letters, harakat, joining and
 * reading syllables) and Arabic (words and their meanings) are separate sections, like the Learn topics; the Sufara
 * section links to the Sufara course of the Learn tab.
 */
export const PLAY_SECTIONS: readonly TopicId[] = ['salah', 'quran', 'sufara', 'arabic', 'prophets', 'seerah', 'akhlaq', 'ramadan', 'history'];

/** Pseudo-section of the development fixtures (kit demos, Star Path) – shown only in development builds. */
export const DEV_SECTION = 'dev';
export type PlaySectionId = TopicId | typeof DEV_SECTION;

export const SECTION_ART: Record<PlaySectionId, string> = {
  salah: 'object.prayer-mat',
  quran: 'object.quran-stand',
  sufara: 'object.inkwell',
  arabic: 'object.book',
  prophets: 'object.ark',
  seerah: 'place.masjid-nabawi-early',
  akhlaq: 'garden.flower-rose',
  ramadan: 'object.lantern-ramadan',
  history: 'object.scroll',
  dev: 'kit.blocks',
};

const en = {
  sections: 'Sections',
  'section.salah': 'Salah',
  'section.quran': 'Quran',
  'section.sufara': 'Sufara',
  'section.arabic': 'Arabic',
  'section.prophets': 'Prophets',
  'section.seerah': 'Seerah',
  'section.akhlaq': 'Akhlaq',
  'section.ramadan': 'Ramadan',
  'section.history': 'History',
  'section.dev': 'Game kit (dev)',
  games: '{count} games',
  gamesOne: '1 game',
  stars: '{count} of {total} stars',
  levels: '{count}/{total} levels',
  new: 'New',
  soon: 'New games for this section are on their way.',
  sufaraTitle: 'Sufara course',
  sufaraBody: 'Learn the letters lesson by lesson in the Learn tab – these games are for extra practice.',
  open: 'Open {section}',
} as const;
type Key = keyof typeof en;
const de: Record<Key, string> = {
  sections: 'Bereiche',
  'section.salah': 'Gebet',
  'section.quran': 'Koran',
  'section.sufara': 'Sufara',
  'section.arabic': 'Arabisch',
  'section.prophets': 'Propheten',
  'section.seerah': 'Sira',
  'section.akhlaq': 'Charakter',
  'section.ramadan': 'Ramadan',
  'section.history': 'Geschichte',
  'section.dev': 'Spiele-Kit (Entwicklung)',
  games: '{count} Spiele',
  gamesOne: '1 Spiel',
  stars: '{count} von {total} Sternen',
  levels: '{count}/{total} Level',
  new: 'Neu',
  soon: 'Neue Spiele für diesen Bereich sind unterwegs.',
  sufaraTitle: 'Sufara-Kurs',
  sufaraBody: 'Lerne die Buchstaben Lektion für Lektion im Bereich Lernen – diese Spiele sind zum zusätzlichen Üben.',
  open: '{section} öffnen',
};
const bs: Record<Key, string> = {
  sections: 'Oblasti',
  'section.salah': 'Namaz',
  'section.quran': 'Kur’an',
  'section.sufara': 'Sufara',
  'section.arabic': 'Arapski',
  'section.prophets': 'Poslanici',
  'section.seerah': 'Sira',
  'section.akhlaq': 'Ahlak',
  'section.ramadan': 'Ramazan',
  'section.history': 'Historija',
  'section.dev': 'Kit igara (razvoj)',
  games: '{count} igara',
  gamesOne: '1 igra',
  stars: '{count} od {total} zvjezdica',
  levels: '{count}/{total} nivoa',
  new: 'Novo',
  soon: 'Nove igre za ovu oblast su na putu.',
  sufaraTitle: 'Sufara – lekcije',
  sufaraBody: 'Harfove uči lekciju po lekciju u dijelu „Uči“ – ove igre su za dodatnu vježbu.',
  open: 'Otvori: {section}',
};

/** Texts of the Play tab sections (namespace `games.play`). */
export const playI18n = defineNamespace('games.play', { en, de, bs });

/** Games of a section, in shelf order (dev fixtures go to the dev section). */
export function sectionGames(section: PlaySectionId, games: readonly GameDef<unknown>[]): GameDef<unknown>[] {
  return games.filter((g) => (section === DEV_SECTION ? !!g.dev : !g.dev && g.topicId === section));
}

export interface SectionStats {
  games: number;
  stars: number;
  maxStars: number;
  levelsDone: number;
  levels: number;
  newGames: number;
}

export function sectionStats(list: readonly GameDef<unknown>[], data: GamesData): SectionStats {
  let stars = 0;
  let maxStars = 0;
  let levelsDone = 0;
  let levels = 0;
  let newGames = 0;
  for (const g of list) {
    stars += totalStars(data, g.id);
    maxStars += g.levels.length * 3;
    levels += g.levels.length;
    levelsDone += GAME_LEVELS.filter((l) => l <= g.levels.length && !!levelProgress(data, g.id, l)).length;
    if (isNewGame(data, g.id)) newGames++;
  }
  return { games: list.length, stars, maxStars, levelsDone, levels, newGames };
}

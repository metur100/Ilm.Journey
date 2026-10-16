import { DEV_SECTION, listGames, PLAY_SECTIONS, playI18n, sectionGames, sectionStats } from '@/core/games';
import { hasArt } from '@/core/art';
import { SECTION_ART } from '@/core/games/sections';
import { translateNs } from '@/core/i18n';
import { registerFeatures } from '@/features';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerFeatures();

describe('Play sections', () => {
  it('follows the GAMES-V3 order with one Arabic / Sufara section', () => {
    expect(PLAY_SECTIONS).toEqual(['salah', 'quran', 'arabic', 'prophets', 'seerah', 'akhlaq', 'ramadan', 'history']);
    expect(translateNs(playI18n, 'en', 'section.arabic')).toBe('Arabic / Sufara');
    expect(translateNs(playI18n, 'bs', 'section.arabic')).toBe('Arapski / Sufara');
    expect(translateNs(playI18n, 'de', 'section.arabic')).toBe('Arabisch / Sufara');
    for (const id of [...PLAY_SECTIONS, DEV_SECTION]) expect(hasArt(SECTION_ART[id])).toBe(true);
  });

  it('puts every game in exactly one section and dev fixtures only in the dev section', () => {
    const games = listGames({ includeDev: true });
    const sections = [...PLAY_SECTIONS, DEV_SECTION] as const;
    for (const g of games) expect(sections.filter((s) => sectionGames(s, games).includes(g))).toHaveLength(1);
    expect(sectionGames(DEV_SECTION, games).every((g) => g.dev)).toBe(true);
  });

  it('sums stars and levels', () => {
    const games = sectionGames(DEV_SECTION, listGames({ includeDev: true })).slice(0, 2);
    const data = { challengeMode: false, games: { [games[0].id]: { levels: { '1': { stars: 2, bestScore: 1, maxScore: 1, plays: 1 } }, plays: 1, lastPlayed: null, introSeen: true } } } as never;
    expect(sectionStats(games, data)).toMatchObject({ games: 2, stars: 2, levelsDone: 1, newGames: 1, maxStars: 18 });
  });
});

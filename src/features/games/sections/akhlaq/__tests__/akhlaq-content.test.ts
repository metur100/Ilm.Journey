import { hasArt } from '@/core/art';
import { allFacts, getGame } from '@/core/games';
import type { Language } from '@/core/models';

import { AKHLAQ_GAMES, registerAkhlaqGames } from '..';

registerAkhlaqGames();

const ART = /^(akhlaq|object|food|animal|garden|place|ui|sky|scene|kit|story|body)\.[a-z0-9-]+$/;
const FORBIDDEN = [/muslims believe/i, /muslime glauben/i, /muslimani vjeruju/i, /for muslims/i, /according to islam/i];
const HADITH = new Set(['Sahih al-Bukhari', 'Sahih Muslim', 'Sunan Abi Dawud', "Jami' at-Tirmidhi"]);

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

describe.each(AKHLAQ_GAMES.map((g) => g.id))('%s content', (id) => {
  const game = () => getGame(id)!;

  it('every fact has a Quran or hadith source with a reference and all three languages', () => {
    for (const fact of allFacts(game())) {
      for (const lang of ['en', 'de', 'bs'] as Language[]) expect(fact.text[lang]?.trim()).toBeTruthy();
      expect(fact.sources.length).toBeGreaterThan(0);
      for (const s of fact.sources) {
        expect(s.sourceName === 'Quran' || HADITH.has(s.sourceName)).toBe(true);
        expect(s.sourceReference).toMatch(/^\d+(:\d+(–\d+)?)?$/);
      }
      if (fact.art) expect(hasArt(fact.art)).toBe(true);
    }
  });

  it('uses only existing art', () => {
    const names = strings(game().levels.map((l) => l.config)).filter((s) => ART.test(s));
    for (const name of [...names, game().coverArt, game().hintArt ?? game().coverArt]) expect([name, hasArt(name)]).toEqual([name, true]);
  });

  it('states truths directly (no "Muslims believe" framing)', () => {
    const dicts = game().i18n.dictionaries as unknown as Record<string, Record<string, string>>;
    const texts = [...strings(dicts), ...strings(allFacts(game()).map((f) => f.text))];
    for (const t of texts) for (const re of FORBIDDEN) expect([t, re.test(t)]).toEqual([t, false]);
  });
});

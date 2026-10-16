/* Test helpers of the Quran section (Jest only – never import from app code). */
import { hasArt } from '@/core/art';
import { type GameDef, type GameLevel, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';
import { listDuas, listSurahs } from '@/features/quran';

const ALL_AYAHS = [...listSurahs().flatMap((s) => s.ayahs.map((a) => a.arabic)), ...listDuas().flatMap((d) => d.ayahs.map((a) => a.arabic))];

/** True when `text` is (part of) an ayah of the generated data. */
export function isQuranText(text: string): boolean {
  return ALL_AYAHS.some((a) => a.includes(text));
}

/** Every `{ arabic, quran: true }` face anywhere in a value (configs, items …). */
export function quranFaces(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => quranFaces(v, out));
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (o.quran === true && typeof o.arabic === 'string') out.push(o.arabic);
    Object.values(o).forEach((v) => quranFaces(v, out));
  }
  return out;
}

/** Every LocalizedText-like object ({ en, de, bs }) that is missing a language. */
export function missingLanguages(value: unknown, path = '', out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v, i) => missingLanguages(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.en === 'string') {
      for (const lang of ['en', 'de', 'bs']) if (typeof o[lang] !== 'string' || !(o[lang] as string).trim()) out.push(`${path}.${lang}`);
      return out;
    }
    for (const [k, v] of Object.entries(o)) if (typeof v !== 'function') missingLanguages(v, `${path}.${k}`, out);
  }
  return out;
}

/** Art names used anywhere in a value (`art`, `sceneArt`, `spotArt`, `map`, `scene` fields). */
export function artNames(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => artNames(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'string' && ['art', 'sceneArt', 'spotArt', 'map', 'scene', 'sky', 'basketArt', 'endArt', 'coverArt', 'hintArt'].includes(k)) out.push(v);
      else if (typeof v === 'object') artNames(v, out);
    }
  }
  return out;
}

/**
 * The standard checks of a Quran game: valid, complete in en / de / bs, every art exists, every Quran face is
 * verified text of the data, facts cite the Quran, and every level plays to completion (3 stars) – and with
 * mistakes gives fewer stars and missed facts.
 */
export function describeQuranGame(def: () => GameDef<any>, options: { mistakeLevel?: GameLevel; skipMistakes?: boolean } = {}): void {
  describe(`game ${def.name || ''}`.trim(), () => {
    it('is valid and complete in en / de / bs', () => {
      const game = def();
      expect(() => validateGame(game)).not.toThrow();
      expect(namespaceProblems(game)).toEqual([]);
      expect(game.topicId).toBe('quran');
    });

    it('uses only existing art', () => {
      const game = def();
      const names = [game.coverArt, game.hintArt, ...artNames(game.levels)].filter((n): n is string => !!n);
      expect(names.filter((n) => !hasArt(n))).toEqual([]);
    });

    it('shows Quran text only from the generated data', () => {
      const faces = quranFaces(def().levels);
      expect(faces.filter((t) => !isQuranText(t))).toEqual([]);
    });

    it('has content in all three languages', () => {
      expect(missingLanguages(def().levels)).toEqual([]);
    });

    it('cites a source on every fact', () => {
      for (const level of def().levels) for (const fact of level.facts) expect(fact.sources.length).toBeGreaterThan(0);
    });

    it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
      const game = await renderGame(def(), level);
      const result = await playToEnd(game);
      expect(result.stars).toBe(3);
      expect(result.mistakes).toBe(0);
      await game.unmount();
    });

    if (!options.skipMistakes) {
      it('reports mistakes gently (fewer stars, a missed fact)', async () => {
        const level = options.mistakeLevel ?? 2;
        const game = await renderGame(def(), level);
        const result = await playToEnd(game, { mistakes: 2 });
        expect(result.mistakes).toBeGreaterThan(0);
        expect(result.stars).toBeLessThan(3);
        expect(result.factsMissed.length).toBeGreaterThan(0);
        const ids = def().levels.flatMap((l) => l.facts.map((f) => f.id));
        for (const id of result.factsMissed) expect(ids).toContain(id);
        await game.unmount();
      });
    }
  });
}

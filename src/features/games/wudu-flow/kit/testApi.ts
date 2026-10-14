import type { GameApi, GameDef, GameLevel, GameResultInput } from '@/core/games';
import { translateNs } from '@/core/i18n';
import type { Language } from '@/core/models';

/**
 * Test helper (used by the Salah games' tests only): a GameApi for rendering a game component outside the GameShell.
 * `results` collects every `onComplete` call.
 */
export function fakeGameApi<C>(
  def: GameDef<C>,
  level: GameLevel,
  options: { language?: Language; reducedMotion?: boolean; challengeMode?: boolean } = {},
): { api: GameApi<C>; results: GameResultInput[]; events: string[] } {
  const language = options.language ?? 'en';
  const levelDef = def.levels[level - 1];
  const results: GameResultInput[] = [];
  const events: string[] = [];
  const api: GameApi<C> = {
    gameId: def.id,
    level,
    config: levelDef.config,
    facts: levelDef.facts,
    onComplete: (r) => results.push(r),
    onExit: () => events.push('exit'),
    playSound: (name) => events.push(`sound:${name}`),
    haptic: (kind) => events.push(`haptic:${kind}`),
    reducedMotion: options.reducedMotion ?? true,
    challengeMode: options.challengeMode ?? false,
    language,
    t: (key, params) => translateNs(def.i18n, language, key, params),
    l: (text) => (text ? text[language] : ''),
  };
  return { api, results, events };
}

/** Keys and `{placeholders}` of every language must match English. Returns the problems found. */
export function namespaceProblems(def: GameDef<unknown>): string[] {
  const dicts = def.i18n.dictionaries as unknown as Record<Language, Record<string, string>>;
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const problems: string[] = [];
  const enKeys = Object.keys(dicts.en).sort();
  for (const lang of ['de', 'bs'] as const) {
    const keys = Object.keys(dicts[lang]).sort();
    if (keys.join('|') !== enKeys.join('|')) problems.push(`${lang}: keys differ`);
    for (const key of enKeys) {
      const value = dicts[lang][key];
      if (!value?.trim()) problems.push(`${lang}.${key}: empty`);
      else if (placeholders(value) !== placeholders(dicts.en[key])) problems.push(`${lang}.${key}: placeholders differ`);
    }
  }
  return problems;
}

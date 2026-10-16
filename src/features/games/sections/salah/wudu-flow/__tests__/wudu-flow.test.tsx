import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';
import { registerLearnFeature } from '@/features/learn/register';

import { FARZ_PARTS, SORT_ITEMS, WUDU_ART, WUDU_FACTS, WUDU_ORDER } from '../content';
import { registerWuduFlowGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerLearnFeature();
registerWuduFlowGame();

const quests = require('@/features/learn/content/quests/salah.json');

describe('wudu-flow', () => {
  const game = getGame('wudu-flow')!;

  it('is valid and complete in en / de / bs', () => {
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(WUDU_ART.filter((a) => !hasArt(a))).toEqual([]);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
    const g = await renderGame(game, level);
    expect((await playToEnd(g)).stars).toBe(3);
    await g.unmount();
  });

  it.each([1, 2, 3] as const)('level %s reports mistakes as missed facts', async (level) => {
    const g = await renderGame(game, level, { language: 'bs' });
    const result = await playToEnd(g, { mistakes: 1 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.factsMissed.length).toBeGreaterThan(0);
    const ids = game.levels.flatMap((l) => l.facts.map((f) => f.id));
    for (const id of result.factsMissed) expect(ids).toContain(id);
    await g.unmount();
  });

  it('keeps the Hanafi farz = the four parts of 5:6', () => {
    expect(FARZ_PARTS).toEqual(['face', 'arms', 'head', 'feet']);
    expect(SORT_ITEMS.filter((i) => i.bin === 'farz')).toHaveLength(4);
    expect(WUDU_ORDER).toHaveLength(8);
  });

  it('copies the content facts unchanged', () => {
    const lesson = quests.lessons.find((l: { id: string }) => l.id === 'salah-wudu');
    expect(WUDU_FACTS.quranParts.text).toEqual(lesson.sections[0].body);
  });
});

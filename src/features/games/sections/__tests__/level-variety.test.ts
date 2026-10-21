import { goodWordTreeGame } from '../akhlaq/good-word-tree/register';
import { calmTheStormGame } from '../akhlaq/calm-the-storm/register';
import { tidyUpGame } from '../akhlaq/tidy-up/register';
import { badrGame } from '../seerah/badr-wells/register';
import { farewellGame } from '../seerah/farewell-sermon/register';
import { hijrahGame } from '../seerah/hijrah-path/register';
import { timelineGame } from '../seerah/seerah-timeline/register';
import { trenchGame } from '../seerah/the-trench/register';

const ids = (items: { id: string }[]) => new Set(items.map((i) => i.id));
const disjoint = (a: Set<string>, b: Set<string>) => [...a].every((id) => !b.has(id));

describe('levels do not repeat the same content', () => {
  it('Clean and Tidy: room, kitchen and masjid have different things', () => {
    const [l1, l2, l3] = tidyUpGame.levels.map((l) => ids((l.config as { items: { id: string }[] }).items));
    expect(disjoint(l1, l2)).toBe(true);
    expect(disjoint(l2, l3)).toBe(true);
    expect(disjoint(l1, l3)).toBe(true);
  });

  it('Good Word Tree: each level has its own words', () => {
    const [l1, l2, l3] = goodWordTreeGame.levels.map((l) => ids((l.config as { words: { id: string }[] }).words));
    expect(disjoint(l1, l2)).toBe(true);
    expect(disjoint(l2, l3)).toBe(true);
    expect(disjoint(l1, l3)).toBe(true);
  });

  it('Calm the Storm: each level has its own reactions', () => {
    const [l1, l2, l3] = calmTheStormGame.levels.map((l) => ids((l.config as { items: { id: string }[] }).items));
    expect(disjoint(l1, l2)).toBe(true);
    expect(disjoint(l2, l3)).toBe(true);
    expect(disjoint(l1, l3)).toBe(true);
  });

  it('Seerah games use a different activity or content in each level', () => {
    expect(badrGame.levels.map((l) => (l.config as { mode: string }).mode)).toEqual(['sequence', 'connect', 'sort']);
    expect(hijrahGame.levels.map((l) => (l.config as { mode: string }).mode)).toEqual(['path', 'connect', 'sequence']);
    expect(trenchGame.levels.map((l) => (l.config as { mode: string }).mode)).toEqual(['build', 'connect', 'memory']);
    const farewell = farewellGame.levels.map((l) => ids((l.config as { pairs?: { id: string }[] }).pairs ?? []));
    expect(disjoint(farewell[0], farewell[1])).toBe(true);
    const timeline = timelineGame.levels.map((l) => ids((l.config as { events: { id: string }[] }).events));
    expect(disjoint(timeline[0], timeline[1])).toBe(true);
    expect(disjoint(timeline[1], timeline[2])).toBe(true);
  });
});

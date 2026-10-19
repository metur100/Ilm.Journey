import { create, act } from 'react-test-renderer';

import { Art, hasArt, svgString } from '@/core/art';
import { PRAYER_POSITIONS, sajdaPoints } from '@/core/art/pieces/sections/salahFigure';
import { type GameDef, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame, type RenderedGame } from '@/core/games/kit/testing';

import { mainPart, partOutline, partSteps, PRAYER_IDS, PRAYERS, rakatPlans, sittingsOf, totalRakats } from '../data/prayers';
import { expectedReading, leadSteps, readsFatiha , GESTURE } from '../logic';
import { PrayerFigure } from '../figure/PrayerFigure';
import { SALAH_PRAYER_GAMES } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describe('prayer data (Hanafi, Bosnian ilmihal)', () => {
  it('has the rakat counts of every prayer', () => {
    const counts = Object.fromEntries(PRAYER_IDS.map((id) => [id, PRAYERS[id].parts.map((p) => `${p.rakats}${p.kind[0]}`).join('+')]));
    expect(counts).toEqual({
      sabah: '2s+2f',
      podne: '4s+4f+2s',
      ikindija: '4s+4f',
      aksam: '3f+2s',
      jacija: '4s+4f+2s+3v',
      vitr: '3v',
      dzuma: '4s+2f+4s',
    });
    expect(PRAYERS.ikindija.parts[0].kind).toBe('sunnah-ghayr');
    expect(PRAYERS.jacija.parts[0].kind).toBe('sunnah-ghayr');
    expect(totalRakats('jacija')).toBe(13);
    // 17 fard rakats a day
    expect((['sabah', 'podne', 'ikindija', 'aksam', 'jacija'] as const).reduce((n, id) => n + mainPart(id).rakats, 0)).toBe(17);
  });

  it('places the sittings, the surah, aloud recitation and kunut', () => {
    const aksam = rakatPlans(mainPart('aksam'));
    expect(aksam.map((r) => r.sitting)).toEqual(['none', 'first', 'last']);
    expect(aksam.map((r) => r.aloud)).toEqual([true, true, false]);
    expect(aksam.map((r) => r.surah)).toEqual([true, true, false]);
    expect(sittingsOf(mainPart('sabah'))).toBe(1);
    expect(sittingsOf(mainPart('podne'))).toBe(2);
    expect(rakatPlans(mainPart('podne')).every((r) => !r.aloud)).toBe(true);
    expect(rakatPlans(mainPart('sabah')).every((r) => r.aloud)).toBe(true);
    const ghayr = rakatPlans(PRAYERS.ikindija.parts[0]);
    expect(ghayr.map((r) => r.subhaneke)).toEqual([true, false, true, false]);
    expect(ghayr[1].fullFirstSitting).toBe(true);
    expect(rakatPlans(PRAYERS.podne.parts[0]).map((r) => r.subhaneke)).toEqual([true, false, false, false]);
    const vitr = rakatPlans(mainPart('vitr'));
    expect(vitr.map((r) => r.kunut)).toEqual([false, false, true]);
    expect(vitr.every((r) => r.surah)).toBe(true);
  });

  it('builds the movement steps of a part', () => {
    const steps = partSteps(mainPart('sabah'));
    expect(steps.map((s) => s.move)).toEqual(['takbir', 'fold', 'bow', 'rise', 'prostrate', 'sit-up', 'prostrate', 'stand-up', 'bow', 'rise', 'prostrate', 'sit-up', 'prostrate', 'sit', 'finger', 'selam-right', 'selam-left']);
    expect(steps.filter((s) => s.position === 'sajda')).toHaveLength(4);
    const vitrMoves = partSteps(mainPart('vitr')).map((s) => s.move);
    expect(vitrMoves.indexOf('kunut-takbir')).toBeLessThan(vitrMoves.lastIndexOf('bow'));
    expect(partOutline(mainPart('podne')).map((o) => o.kind)).toEqual(['takbir', 'rakat', 'rakat', 'sitting', 'rakat', 'rakat', 'sitting', 'selam']);
  });
});

describe('prayer figure', () => {
  it('draws every position for both variants, light and dark', () => {
    for (const p of PRAYER_POSITIONS) {
      for (const v of ['', '-female']) {
        const name = `salah.prayer-${p}${v}`;
        expect(hasArt(name)).toBe(true);
        expect(svgString(name, { dark: true }).length).toBeGreaterThan(500);
      }
    }
    expect(sajdaPoints('male')).toHaveLength(7);
    expect(sajdaPoints('female')).toHaveLength(7);
  });

  it('renders the animated component and moves to a new position', () => {
    let r!: ReturnType<typeof create>;
    act(() => {
      r = create(<PrayerFigure position="qiyam" variant="female" width={300} cues={{ gaze: true }} />);
    });
    act(() => r.update(<PrayerFigure position="sajda" variant="female" width={300} cues={{ points: true }} />));
    expect(r.toJSON()).toBeTruthy();
    act(() => r.update(<Art name="salah.prayer-cover-vitr" size={100} />));
    act(() => r.unmount());
  });
});

async function playAlong(game: RenderedGame, prayer: (typeof SALAH_PRAYER_GAMES)[number]['levels'][number]['config']['prayer']) {
  const steps = partSteps(mainPart(prayer));
  for (const s of steps) {
    await game.press(`move-${s.move}`);
    if (s.firstSajda) {
      for (const id of ['forehead', 'hand-right', 'hand-left', 'knee-right', 'knee-left', 'toes-right', 'toes-left']) await game.press(`point-${id}`);
    }
  }
  await game.wait(900);
}

async function playLead(game: RenderedGame, prayer: (typeof SALAH_PRAYER_GAMES)[number]['levels'][number]['config']['prayer']) {
  const part = mainPart(prayer);
  const steps = leadSteps(part);
  for (const s of steps) {
    await game.press(`opt-${s.move}`);
    if (s.move === 'stand-up') await game.press(`count-${s.rakat}`);
    if (readsFatiha(s)) {
      const want = expectedReading(s, 'male');
      await game.press(want.surah ? 'recite-surah' : 'recite-only');
      if (part.aloud !== 'quiet') await game.press(want.aloud ? 'voice-aloud' : 'voice-quiet');
      await game.press('recite-check');
    }
  }
  await game.wait(900);
}

describe.each(SALAH_PRAYER_GAMES.map((g) => [g.id, g] as const))('%s', (_id, def) => {
  it('is a valid game with complete texts', () => {
    expect(() => validateGame(def as unknown as GameDef<unknown>)).not.toThrow();
    expect(namespaceProblems(def as unknown as GameDef<unknown>)).toEqual([]);
    expect(hasArt(def.coverArt)).toBe(true);
    expect(Object.keys(GESTURE)).toHaveLength(12);
  });

  it('level 1: pray along to the end without mistakes', async () => {
    const game = await renderGame(def, 1);
    await playAlong(game, def.levels[0].config.prayer);
    expect(game.results).toHaveLength(1);
    expect(game.results[0].stars).toBe(3);
    await game.unmount();
  });

  it('level 2: order the prayer', async () => {
    const game = await renderGame(def, 2);
    const result = await playToEnd(game);
    expect(result.stars).toBeGreaterThanOrEqual(1);
    await game.unmount();
  });

  it('level 3: lead it yourself', async () => {
    const game = await renderGame(def, 3);
    await playLead(game, def.levels[2].config.prayer);
    expect(game.results).toHaveLength(1);
    expect(game.results[0].mistakes).toBe(0);
    await game.unmount();
  });
});

it('lets the learner choose the sunnah or the fard part and shows that part’s rakats', async () => {
  const def = SALAH_PRAYER_GAMES.find((g) => g.id === 'salah-podne')!;
  const game = await renderGame(def, 1);
  // Podne = 4 sunnah, 4 fard, 2 sunnah.
  await game.press('part-0');
  expect(game.texts()).toContain('4 sunnah');
  expect(game.texts()).toContain('Rakat 1 of 4');
  await game.press('part-2');
  expect(game.texts()).toContain('2 sunnah');
  expect(game.texts()).toContain('Rakat 1 of 2');
  await game.unmount();
});

it('lead: a wrong choice is a gentle mistake with a missed fact', async () => {
  const def = SALAH_PRAYER_GAMES.find((g) => g.id === 'salah-aksam')!;
  const game = await renderGame(def, 3);
  await game.press('opt-bow');
  expect(game.texts()).toContain('Not yet');
  await playLead(game, 'aksam');
  expect(game.results[0].mistakes).toBe(1);
  expect(game.results[0].factsMissed.length).toBe(1);
  await game.unmount();
});

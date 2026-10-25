import { catalogue, hasArt } from '@/core/art';
import {
  applyEarn,
  canWater,
  createGarden,
  DAILY_WATER_CAP,
  depthScale,
  EARN_TABLE,
  fitsSpot,
  fittingSpots,
  freeSpots,
  GARDEN_ART_NAMES,
  GARDEN_ELEMENTS,
  GARDEN_PERSIST,
  GARDEN_SPOTS,
  gardenLayout,
  getGardenElement,
  type GardenData,
  growthStage,
  maxWidthFraction,
  nextSpotFor,
  MAX_WATER,
  milestoneFromTarget,
  plantElement,
  REMOVED_GARDEN_ELEMENTS,
  removeElement,
  sanitizeGarden,
  skyForHour,
  spotPoint,
  spotsOfKind,
  streakMilestone,
  thirstLevel,
  unlockElement,
  unlockState,
  useGardenStore,
  waterGarden,
} from '@/core/garden';
import { createInitialData } from '@/core/services/engine';
import { migrate } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { addDays, toDayKey } from '@/core/utils/date';

const NOW = '2026-10-14T10:00:00.000Z';
const empty = (): GardenData => ({ ...createGarden(), placed: [], seeds: 0, water: 0 });

describe('earning table', () => {
  it('pays every milestone kind exactly once', () => {
    let data = empty();
    for (const kind of Object.keys(EARN_TABLE.milestones) as (keyof typeof EARN_TABLE.milestones)[]) {
      const first = applyEarn(data, { type: 'milestone', kind, id: 'x' }, '2026-10-14', NOW);
      expect(first.seeds).toBe(EARN_TABLE.milestones[kind].seeds);
      const again = applyEarn(first.data, { type: 'milestone', kind, id: 'x' }, '2026-10-15', NOW);
      expect(again.seeds).toBe(0);
      expect(again.data).toBe(first.data);
      data = first.data;
    }
    const total = Object.values(EARN_TABLE.milestones).reduce((s, m) => s + m.seeds, 0);
    expect(data.seeds).toBe(total);
    expect(data.seedsEarned).toBe(total);
  });

  it('gives water for activity with a daily cap and a can size', () => {
    let data = empty();
    let earned = 0;
    for (let i = 0; i < 10; i++) {
      const r = applyEarn(data, { type: 'activity' }, '2026-10-14', NOW);
      earned += r.water;
      data = r.data;
    }
    expect(earned).toBe(DAILY_WATER_CAP);
    expect(data.lastActivityDay).toBe('2026-10-14');
    // a new day earns again, but never more than the can holds
    for (let d = 15; d < 25; d++) for (let i = 0; i < 5; i++) data = applyEarn(data, { type: 'activity' }, `2026-10-${d}`, NOW).data;
    expect(data.water).toBe(MAX_WATER);
  });

  it('maps completion targets to milestones', () => {
    expect(milestoneFromTarget('learn:unit:salah-wudu')).toEqual({ type: 'milestone', kind: 'unit', id: 'salah-wudu' });
    expect(milestoneFromTarget('learn:master:salah')).toEqual({ type: 'milestone', kind: 'master', id: 'salah' });
    expect(milestoneFromTarget('stories:story:adam')).toEqual({ type: 'milestone', kind: 'story', id: 'adam' });
    expect(milestoneFromTarget('seerah:episode:e01')).toEqual({ type: 'milestone', kind: 'episode', id: 'e01' });
    expect(milestoneFromTarget('quest:salah-wudu')).toEqual({ type: 'milestone', kind: 'quest', id: 'salah-wudu' });
    expect(milestoneFromTarget('game:wudu-flow:2')).toEqual({ type: 'milestone', kind: 'gameLevel', id: 'wudu-flow:2' });
    expect(milestoneFromTarget('game:wudu-flow')).toBeNull(); // "play today's game" is not a milestone
    expect(milestoneFromTarget('game:wudu-flow:7')).toBeNull();
    expect(milestoneFromTarget('stories:lesson:adam-1')).toBeNull();
    expect(milestoneFromTarget('garbage')).toBeNull();
    expect(milestoneFromTarget('a::b')).toBeNull();
  });

  it('pays streak milestones every 7 days', () => {
    expect(streakMilestone(7)).toEqual({ type: 'milestone', kind: 'streak7', id: '7' });
    expect(streakMilestone(14)?.type).toBe('milestone');
    expect(streakMilestone(6)).toBeNull();
    expect(streakMilestone(0)).toBeNull();
  });
});

describe('unlocking and planting', () => {
  it('has unique garden elements whose costs and levels rise sensibly', () => {
    const ids = GARDEN_ELEMENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    for (const removed of Object.keys(REMOVED_GARDEN_ELEMENTS)) expect(ids).not.toContain(removed);
    expect(GARDEN_ELEMENTS.filter((e) => e.minLevel === 1 && e.seedCost === 0).length).toBeGreaterThanOrEqual(3);
    for (const e of GARDEN_ELEMENTS) {
      expect(e.minLevel).toBeGreaterThanOrEqual(1);
      expect(e.seedCost).toBeGreaterThanOrEqual(0);
    }
  });

  it('respects the level and the seed cost', () => {
    const data = { ...empty(), seeds: 3 };
    expect(unlockState(data, 'arch', 1)).toBe('levelLocked');
    expect(unlockState(data, 'sapling', 1)).toBe('available');
    expect(unlockState(data, 'flower-tulip', 1)).toBe('buyable');
    expect(unlockState(data, 'olive', 3)).toBe('tooExpensive');
    expect(unlockElement(data, 'olive', 3)).toBeNull();
    expect(unlockElement(data, 'arch', 1)).toBeNull();
    const bought = unlockElement(data, 'flower-tulip', 1)!;
    expect(bought.seeds).toBe(1);
    expect(unlockState(bought, 'flower-tulip', 1)).toBe('available');
    expect(unlockElement(bought, 'flower-tulip', 1)).toBeNull(); // paid only once
    expect(unlockState(data, 'unknown', 99)).toBe('levelLocked');
  });

  it('plants only available elements on free, valid spots', () => {
    let data = empty();
    expect(plantElement(data, 'flower-tulip', 0, 1, NOW)).toBeNull(); // not unlocked yet
    data = plantElement(data, 'sapling', 3, 1, NOW)!;
    expect(data.placed).toHaveLength(1);
    expect(plantElement(data, 'bush', 3, 1, NOW)).toBeNull(); // taken
    expect(plantElement(data, 'bush', -1, 1, NOW)).toBeNull();
    expect(plantElement(data, 'bush', GARDEN_SPOTS.length, 1, NOW)).toBeNull();
    expect(plantElement(data, 'bush', 1.5, 1, NOW)).toBeNull();
    expect(freeSpots(data)).not.toContain(3);
    expect(freeSpots(data)).toHaveLength(GARDEN_SPOTS.length - 1);
    data = removeElement(data, 3);
    expect(freeSpots(data)).toHaveLength(GARDEN_SPOTS.length);
  });

  it('fills every spot with fitting elements and then refuses', () => {
    let data = { ...empty(), unlocked: GARDEN_ELEMENTS.map((e) => e.id) };
    const filler = { grove: 'palm', water: 'pond', bed: 'flower-rose', path: 'bench', sky: 'bird' } as const;
    for (const [spot, s] of GARDEN_SPOTS.entries()) data = plantElement(data, filler[s.kind], spot, 99, NOW)!;
    expect(data.placed).toHaveLength(GARDEN_SPOTS.length);
    expect(freeSpots(data)).toEqual([]);
    expect(plantElement(data, 'bush', 0, 1, NOW)).toBeNull();
  });

  it('places every element only on a fitting kind of spot', () => {
    const data = { ...empty(), unlocked: GARDEN_ELEMENTS.map((e) => e.id) };
    for (const element of GARDEN_ELEMENTS) {
      expect(element.spots.length).toBeGreaterThan(0);
      for (const [spot, s] of GARDEN_SPOTS.entries()) {
        const planted = plantElement(data, element.id, spot, 99, NOW);
        expect({ id: element.id, spot, ok: !!planted }).toEqual({ id: element.id, spot, ok: element.spots.includes(s.kind) });
      }
    }
  });

  it('never puts a ground element into the sky and never a bird onto the lawn', () => {
    const data = { ...empty(), unlocked: GARDEN_ELEMENTS.map((e) => e.id) };
    const sky = spotsOfKind('sky');
    expect(sky.length).toBeGreaterThan(0);
    for (const element of GARDEN_ELEMENTS.filter((e) => e.motion !== 'fly')) {
      expect(element.spots).not.toContain('sky');
      for (const spot of sky) expect(plantElement(data, element.id, spot, 99, NOW)).toBeNull();
    }
    for (const id of ['fountain', 'pond']) {
      expect(getGardenElement(id)!.spots).toEqual(['water']);
      for (const [spot, s] of GARDEN_SPOTS.entries()) expect(fitsSpot(getGardenElement(id)!, spot)).toBe(s.kind === 'water');
    }
    for (const spot of GARDEN_SPOTS.keys()) expect(fitsSpot(getGardenElement('bird')!, spot)).toBe(GARDEN_SPOTS[spot].kind === 'sky');
  });

  it('never stacks two elements on one spot', () => {
    let data = { ...empty(), unlocked: GARDEN_ELEMENTS.map((e) => e.id) };
    const water = spotsOfKind('water');
    data = plantElement(data, 'fountain', water[0], 99, NOW)!;
    expect(plantElement(data, 'fountain', water[0], 99, NOW)).toBeNull();
    expect(plantElement(data, 'pond', water[0], 99, NOW)).toBeNull();
    data = plantElement(data, 'fountain', water[1], 99, NOW)!;
    // every water spot is taken: no third fountain anywhere
    expect(fittingSpots(getGardenElement('fountain')!, freeSpots(data))).toEqual([]);
    expect(nextSpotFor(getGardenElement('fountain')!, freeSpots(data))).toBeNull();
    expect(new Set(data.placed.map((p) => p.spot)).size).toBe(data.placed.length);
  });

  it('auto-places on the first free spot of a fitting kind, never anywhere', () => {
    const free = GARDEN_SPOTS.map((_, i) => i);
    expect(GARDEN_SPOTS[nextSpotFor(getGardenElement('palm')!, free)!].kind).toBe('grove');
    expect(GARDEN_SPOTS[nextSpotFor(getGardenElement('flower-rose')!, free)!].kind).toBe('bed');
    expect(GARDEN_SPOTS[nextSpotFor(getGardenElement('fountain')!, free)!].kind).toBe('water');
    expect(GARDEN_SPOTS[nextSpotFor(getGardenElement('bird')!, free)!].kind).toBe('sky');
    expect(GARDEN_SPOTS[nextSpotFor(getGardenElement('bench')!, free)!].kind).toBe('path');
    const grove = spotsOfKind('grove');
    expect(nextSpotFor(getGardenElement('palm')!, free.filter((s) => s !== grove[0]))).toBe(grove[1]);
    expect(nextSpotFor(getGardenElement('palm')!, free.filter((s) => !grove.includes(s)))).toBeNull();
  });

  it('keeps neighbouring spots of a row from overlapping', () => {
    const ground = GARDEN_SPOTS.map((s, i) => ({ ...s, i })).filter((s) => s.kind !== 'sky');
    for (const a of ground)
      for (const b of ground) {
        if (a.i >= b.i || Math.abs(a.d - b.d) > 0.1) continue;
        expect({ a: a.i, b: b.i, gap: Math.abs(a.x - b.x) >= (a.maxW + b.maxW) / 2 - 0.011 }).toEqual({ a: a.i, b: b.i, gap: true });
      }
    for (let spot = 0; spot < GARDEN_SPOTS.length; spot++) expect(maxWidthFraction(spot)).toBeLessThanOrEqual(0.22);
  });

  it('scales the back row smaller than the front row', () => {
    expect(depthScale(GARDEN_SPOTS[0])).toBeLessThan(depthScale(GARDEN_SPOTS[15]));
  });
});

describe('scene layout', () => {
  // 360 dp phone (garden screen and Home hero), small phone, tablet portrait, wide tablet hero
  const sizes: [number, number, number][] = [
    [360, 340, 0],
    [328, 340, 0],
    [360, 330, 130],
    [320, 300, 0],
    [736, 456, 0],
    [800, 340, 130],
    [1024, 560, 0],
  ];

  it.each(sizes)('keeps ground spots on the lawn and sky spots above it at %ix%i', (width, height, inset) => {
    const layout = gardenLayout(width, height, inset);
    // the lawn covers the whole width and the bottom of the scene
    expect(layout.lawn.left).toBeLessThanOrEqual(0.5);
    expect(layout.lawn.left + layout.lawn.w).toBeGreaterThanOrEqual(width - 0.5);
    expect(layout.lawn.top + layout.lawn.h).toBeCloseTo(height, 3);
    expect(layout.horizon).toBeGreaterThan(height * 0.35);
    expect(layout.horizon).toBeLessThan(height * 0.7);
    // the hills cover the width too (stretched sideways on wide screens)
    const hillsW = layout.hills.w * layout.hills.scaleX;
    expect(width / 2 - hillsW / 2).toBeLessThanOrEqual(0.5);
    for (const [i, s] of GARDEN_SPOTS.entries()) {
      const p = spotPoint(layout, i);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(width);
      if (s.kind === 'sky') {
        expect(p.y).toBeLessThan(layout.horizon);
        expect(p.y).toBeGreaterThanOrEqual(layout.skyTop);
      } else {
        // feet below the lawn's top contour (it dips at most 10 art units below the horizon line, at the left edge) and inside the scene
        expect(p.y).toBeGreaterThan(layout.horizon + 10 * (layout.lawn.w / 400));
        expect(p.y).toBeLessThanOrEqual(height);
      }
    }
  });
});

describe('watering, growth and thirst', () => {
  it('waters once a day with a drop and grows plants', () => {
    let data = { ...empty(), water: 2 };
    data = plantElement(data, 'sapling', 0, 1, NOW)!;
    data = plantElement(data, 'rock', spotsOfKind('path')[0], 1, NOW)!;
    expect(growthStage(data.placed[0])).toBe(0);
    expect(canWater(data, '2026-10-14')).toBe(true);
    data = waterGarden(data, '2026-10-14')!;
    expect(data.water).toBe(1);
    expect(waterGarden(data, '2026-10-14')).toBeNull(); // once a day
    expect(growthStage(data.placed[0])).toBe(1);
    expect(data.placed[1].waterings).toBe(0); // decorations do not grow
    expect(growthStage(data.placed[1])).toBe(2);
    data = waterGarden(data, '2026-10-15')!;
    expect(waterGarden(data, '2026-10-16')).toBeNull(); // no water left
    data = { ...data, water: 1 };
    data = waterGarden(data, '2026-10-16')!;
    expect(growthStage(data.placed[0])).toBe(2);
  });

  it('gets thirsty but never dies', () => {
    expect(thirstLevel({ lastWatered: null, lastActivityDay: null }, '2026-10-14')).toBe(0);
    expect(thirstLevel({ lastWatered: null, lastActivityDay: '2026-10-13' }, '2026-10-14')).toBe(0);
    expect(thirstLevel({ lastWatered: '2026-10-11', lastActivityDay: null }, '2026-10-14')).toBe(1);
    expect(thirstLevel({ lastWatered: '2026-10-01', lastActivityDay: '2026-10-02' }, '2026-10-14')).toBe(2);
    expect(thirstLevel({ lastWatered: '2020-01-01', lastActivityDay: null }, '2026-10-14')).toBe(2);
    // one activity restores it
    expect(thirstLevel({ lastWatered: '2020-01-01', lastActivityDay: '2026-10-14' }, '2026-10-14')).toBe(0);
  });

  it('chooses the sky by local hour', () => {
    expect(skyForHour(6)).toBe('dawn');
    expect(skyForHour(12)).toBe('day');
    expect(skyForHour(18)).toBe('sunset');
    expect(skyForHour(23)).toBe('night');
    expect(skyForHour(2)).toBe('night');
  });

  it('repairs corrupt stored data', () => {
    expect(sanitizeGarden(null)).toBeNull();
    const repaired = sanitizeGarden({
      placed: [
        { elementId: 'palm', spot: 2 },
        { elementId: 'palm', spot: 2 },
        { elementId: 'dragon', spot: 3 },
        { elementId: 'bush', spot: 99 },
      ],
      unlocked: ['palm', 'palm', 'nope', 4],
      seeds: -5,
      water: 500,
      lastWatered: 'yesterday',
      milestones: { 'unit:a': '2026-01-01', bad: 3 },
    })!;
    // the palm on a water spot moves to the grove, its duplicate to the next grove spot, the bush off the map to a bed
    expect(repaired.placed.map((p) => [p.elementId, GARDEN_SPOTS[p.spot].kind])).toEqual([
      ['palm', 'grove'],
      ['palm', 'grove'],
      ['bush', 'bed'],
    ]);
    expect(new Set(repaired.placed.map((p) => p.spot)).size).toBe(3);
    expect(repaired.unlocked).toEqual(['palm']);
    expect(repaired.seeds).toBe(createGarden().seeds);
    expect(repaired.water).toBe(MAX_WATER);
    expect(repaired.lastWatered).toBeNull();
    expect(repaired.milestones).toEqual({ 'unit:a': '2026-01-01' });
  });

  it('moves elements stored on the wrong kind of spot and drops what does not fit anymore', () => {
    const sky = spotsOfKind('sky');
    const water = spotsOfKind('water');
    const repaired = sanitizeGarden({
      placed: [
        { elementId: 'fountain', spot: sky[0], plantedAt: NOW, waterings: 0 }, // a fountain in the sky
        { elementId: 'fountain', spot: sky[1], plantedAt: NOW, waterings: 0 },
        { elementId: 'fountain', spot: sky[2], plantedAt: NOW, waterings: 0 }, // no third water spot → back to the inventory
        { elementId: 'pond', spot: water[0], plantedAt: NOW, waterings: 0 }, // will be stacked on a fountain → moves on
        { elementId: 'stream', spot: water[1], plantedAt: NOW, waterings: 0 }, // removed element
        { elementId: 'bird', spot: 0, plantedAt: NOW, waterings: 0 }, // a bird on the lawn
      ],
      unlocked: ['fountain', 'pond', 'stream', 'masjid-small', 'bird'],
      seeds: 1,
    })!;
    for (const p of repaired.placed) expect(fitsSpot(getGardenElement(p.elementId)!, p.spot)).toBe(true);
    expect(new Set(repaired.placed.map((p) => p.spot)).size).toBe(repaired.placed.length);
    expect(repaired.placed.filter((p) => GARDEN_SPOTS[p.spot].kind === 'water')).toHaveLength(2);
    expect(repaired.placed.some((p) => p.elementId === 'stream')).toBe(false);
    expect(GARDEN_SPOTS[repaired.placed.find((p) => p.elementId === 'bird')!.spot].kind).toBe('sky');
    // removed elements leave the inventory and their seeds come back
    expect(repaired.unlocked).toEqual(['fountain', 'pond', 'bird']);
    expect(repaired.seeds).toBe(1 + REMOVED_GARDEN_ELEMENTS.stream + REMOVED_GARDEN_ELEMENTS['masjid-small']);
  });

  it('migrates a version-1 garden onto the new spots', () => {
    const v1 = {
      version: 1,
      data: {
        ...createGarden(),
        placed: [
          { elementId: 'sapling', spot: 7, plantedAt: NOW, waterings: 2 },
          { elementId: 'fountain', spot: 1, plantedAt: NOW, waterings: 0 }, // back row of v1 – in the sky on phones
          { elementId: 'stream', spot: 2, plantedAt: NOW, waterings: 0 },
          { elementId: 'minaret', spot: 3, plantedAt: NOW, waterings: 0 },
          { elementId: 'fountain', spot: 4, plantedAt: NOW, waterings: 0 },
          { elementId: 'fountain', spot: 5, plantedAt: NOW, waterings: 0 },
          { elementId: 'bird', spot: 11, plantedAt: NOW, waterings: 0 },
        ],
        unlocked: ['fountain', 'stream', 'minaret', 'bird'],
        seeds: 0,
      },
    };
    const migrated = migrate(v1, GARDEN_PERSIST)!;
    expect(migrated).not.toBeNull();
    expect(migrated.placed.map((p) => [p.elementId, GARDEN_SPOTS[p.spot].kind])).toEqual([
      ['sapling', 'bed'],
      ['fountain', 'water'],
      ['fountain', 'water'],
      ['bird', 'sky'],
    ]);
    expect(migrated.placed[0].waterings).toBe(2);
    expect(migrated.unlocked).toEqual(['fountain', 'bird']);
    expect(migrated.seeds).toBe(REMOVED_GARDEN_ELEMENTS.stream + REMOVED_GARDEN_ELEMENTS.minaret);
    // a fresh garden is valid as it is
    const fresh = createGarden();
    expect(sanitizeGarden(fresh)!.placed).toEqual(fresh.placed);
    expect(fitsSpot(getGardenElement('sapling')!, fresh.placed[0].spot)).toBe(true);
  });

  it('references only art that exists once the art library is filled', () => {
    expect(GARDEN_ART_NAMES.length).toBeGreaterThan(GARDEN_ELEMENTS.length);
    if (Object.keys(catalogue).length > 0) for (const name of GARDEN_ART_NAMES) expect({ name, exists: hasArt(name) }).toEqual({ name, exists: true });
  });
});

describe('earning through the app store', () => {
  beforeEach(() => {
    useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [] });
    useGardenStore.setState({ ...empty() });
  });

  it('waters on learning activity and plants seeds on completions', () => {
    const app = useAppStore.getState();
    app.registerActivity();
    expect(useGardenStore.getState().water).toBe(1);
    app.recordAnswer({ key: 'learn:x', topic: 't', topicArea: 'salah' }, true, 'test');
    expect(useGardenStore.getState().water).toBe(2);
    app.recordAnswer({ key: 'learn:y', topic: 't' }, true, 'practice'); // practice never counts
    expect(useGardenStore.getState().water).toBe(2);

    app.reportQuestEvent({ type: 'complete', target: 'learn:unit:salah-wudu' });
    app.reportQuestEvent({ type: 'complete', target: 'learn:unit:salah-wudu' });
    app.reportQuestEvent({ type: 'complete', target: 'stories:story:adam' });
    expect(useGardenStore.getState().seeds).toBe(EARN_TABLE.milestones.unit.seeds + EARN_TABLE.milestones.story.seeds);
  });

  it('plants seeds when the streak reaches 7 days', () => {
    useAppStore.setState({ streak: { current: 6, longest: 6, lastActiveDay: toDayKey(addDays(new Date(), -1)) } });
    useAppStore.getState().registerActivity();
    expect(useAppStore.getState().streak.current).toBe(7);
    expect(useGardenStore.getState().seeds).toBe(EARN_TABLE.milestones.streak7.seeds);
  });
});

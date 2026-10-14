import { catalogue, hasArt } from '@/core/art';
import {
  applyEarn,
  canWater,
  createGarden,
  DAILY_WATER_CAP,
  depthScale,
  EARN_TABLE,
  freeSpots,
  GARDEN_ART_NAMES,
  GARDEN_ELEMENTS,
  GARDEN_SPOTS,
  type GardenData,
  growthStage,
  MAX_WATER,
  milestoneFromTarget,
  plantElement,
  removeElement,
  sanitizeGarden,
  skyForHour,
  streakMilestone,
  thirstLevel,
  unlockElement,
  unlockState,
  useGardenStore,
  waterGarden,
} from '@/core/garden';
import { createInitialData } from '@/core/services/engine';
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
  it('has ~30 unique elements whose costs and levels rise sensibly', () => {
    const ids = GARDEN_ELEMENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(28);
    expect(GARDEN_ELEMENTS.filter((e) => e.minLevel === 1 && e.seedCost === 0).length).toBeGreaterThanOrEqual(3);
    for (const e of GARDEN_ELEMENTS) {
      expect(e.minLevel).toBeGreaterThanOrEqual(1);
      expect(e.seedCost).toBeGreaterThanOrEqual(0);
    }
  });

  it('respects the level and the seed cost', () => {
    const data = { ...empty(), seeds: 3 };
    expect(unlockState(data, 'masjid-small', 1)).toBe('levelLocked');
    expect(unlockState(data, 'sapling', 1)).toBe('available');
    expect(unlockState(data, 'flower-tulip', 1)).toBe('buyable');
    expect(unlockState(data, 'olive', 3)).toBe('tooExpensive');
    expect(unlockElement(data, 'olive', 3)).toBeNull();
    expect(unlockElement(data, 'masjid-small', 1)).toBeNull();
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

  it('fills all 16 spots and then refuses', () => {
    let data = empty();
    for (const spot of GARDEN_SPOTS.keys()) data = plantElement(data, 'flower-rose', spot, 1, NOW)!;
    expect(freeSpots(data)).toEqual([]);
    expect(plantElement(data, 'bush', 0, 1, NOW)).toBeNull();
  });

  it('scales the back row smaller than the front row', () => {
    expect(depthScale(GARDEN_SPOTS[0])).toBeLessThan(depthScale(GARDEN_SPOTS[15]));
  });
});

describe('watering, growth and thirst', () => {
  it('waters once a day with a drop and grows plants', () => {
    let data = { ...empty(), water: 2 };
    data = plantElement(data, 'sapling', 0, 1, NOW)!;
    data = plantElement(data, 'rock', 1, 1, NOW)!;
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
    expect(repaired.placed).toHaveLength(1);
    expect(repaired.unlocked).toEqual(['palm']);
    expect(repaired.seeds).toBe(createGarden().seeds);
    expect(repaired.water).toBe(MAX_WATER);
    expect(repaired.lastWatered).toBeNull();
    expect(repaired.milestones).toEqual({ 'unit:a': '2026-01-01' });
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

import type { StageLayer, StageSpec } from '@/core/components/scene/stage';

import type { Episode, EpisodeStep, SeerahEvent } from './models';

/*
 * Animated stages of the Seerah (story-fx engine, docs/STORIES-V3.md §8). An episode JSON may carry
 * `"stage"` (its cover: introduction, episode card, finish screen) and `"stages": { "<step>": stage }` for single
 * steps (context, timeline, mainEvent, lesson …); an event JSON may carry `"stage"`. JSON wins over the overlay below.
 *
 * The overlay is written by the Seerah author with the `seerah.*` art (src/core/art/pieces/sections/seerahScenes.tsx):
 * the Makkah valley and the Kaʿbah, the Cave of Hiraʾ with its light, the gardens of Taʾif, the desert trail, the Cave
 * of Thawr, the palm groves of Madinah, the early masjid (`seerah.masjid-*`), the wells of Badr, the trench, the tree
 * of al-Hudaybiyyah, the doors of Makkah, the plain of ʿArafat. Never people – the Prophet ﷺ, his family and
 * companions are never depicted; only places, objects, animals, light and nature.
 */

export interface EpisodeStageFields {
  stage?: StageSpec;
  stages?: Partial<Record<EpisodeStep, StageSpec>>;
}

// ---------- reusable layers ----------

const moon = (x: number, y = 50): StageLayer => ({ art: 'story.moon-crescent', x, y, w: 46, anchor: 'center', anim: 'glow' });
const camel = (x: number, at = 600, enter: StageLayer['enter'] = 'slideLeft'): StageLayer => ({ art: 'animal.camel', x, y: 226, w: 58, enter, at, duration: 2200 });

const MAKKAH_NIGHT: StageSpec = {
  sky: 'night',
  layers: [moon(330), { art: 'seerah.makkah-valley', fill: true, enter: 'fade' }],
  effects: ['stars', { type: 'lanternGlow', x: 200, y: 180, intensity: 1, at: 900 }],
};

const HIRA: StageSpec = {
  sky: 'night',
  mood: 'cool',
  layers: [moon(90, 46), { art: 'seerah.hira-mountain', fill: true }],
  effects: [{ type: 'stars', intensity: 3 }, { type: 'lightBeam', x: 246, intensity: 2, at: 1400 }, { type: 'sparkle', x: 246, y: 84, w: 60, h: 40, intensity: 1, at: 2200 }],
};

const TAIF: StageSpec = {
  sky: 'dusk',
  mood: 'warm',
  layers: [{ art: 'seerah.taif-gardens', fill: true }],
  effects: [{ type: 'leaves', intensity: 1 }, { type: 'birds', intensity: 1, at: 1200 }, { type: 'sunrays', x: 330, y: 60, intensity: 1 }],
};

const THAWR: StageSpec = {
  sky: 'night',
  mood: 'night',
  layers: [moon(320, 44), { art: 'seerah.thawr-cave', fill: true }],
  effects: ['stars', { type: 'sparkle', x: 200, y: 170, w: 70, h: 50, intensity: 1, at: 1600 }, { type: 'dust', intensity: 1 }],
};

const MADINAH_DAY: StageSpec = {
  sky: 'day',
  layers: [{ art: 'seerah.madinah-palms', fill: true }],
  effects: [{ type: 'clouds', intensity: 1 }, { type: 'birds', intensity: 1, at: 800 }, { type: 'leaves', intensity: 1 }],
};

const MASJID: StageSpec = {
  sky: 'day',
  camera: 'slowZoom',
  layers: [
    { art: 'seerah.masjid-sky-morning', fill: true },
    { art: 'seerah.masjid-plot', fill: true },
    { art: 'seerah.masjid-walls', fill: true, enter: 'rise', at: 400 },
    { art: 'seerah.masjid-pillars', fill: true, enter: 'rise', at: 1200 },
    { art: 'seerah.masjid-roof', fill: true, enter: 'fall', at: 2000 },
    { art: 'seerah.masjid-walls-front', fill: true, enter: 'rise', at: 2600 },
    { art: 'seerah.masjid-foreground', fill: true },
  ],
  effects: [{ type: 'birds', intensity: 1, at: 2800 }, { type: 'sparkle', x: 200, y: 140, w: 160, h: 50, intensity: 1, at: 3000 }],
};

const BADR: StageSpec = {
  sky: 'dawn',
  mood: 'dawn',
  layers: [{ art: 'seerah.badr-plain', fill: true }],
  effects: [{ type: 'sunrays', x: 70, y: 70 }, { type: 'sand', intensity: 1 }, { type: 'ripples', x: 110, y: 179, w: 24, intensity: 1 }],
};

const TRENCH: StageSpec = {
  sky: 'dusk',
  mood: 'cool',
  layers: [{ art: 'seerah.trench-plain', fill: true }, { art: 'seerah.trench-dug', fill: true, at: 1200, enter: 'fade', duration: 2400 }],
  effects: [{ type: 'wind', intensity: 2, at: 2600 }, { type: 'dust', intensity: 1 }],
};

const HUDAYBIYYAH: StageSpec = {
  sky: 'day',
  layers: [{ art: 'seerah.hudaybiyyah-camp', fill: true }, camel(70, 900, 'fade')],
  effects: [{ type: 'clouds', intensity: 1 }, { type: 'sparkle', x: 270, y: 150, w: 120, h: 40, intensity: 1, at: 1500 }],
};

const CONQUEST: StageSpec = {
  sky: 'dawn',
  layers: [{ art: 'seerah.makkah-valley', fill: true }],
  effects: [{ type: 'sunrays', x: 200, y: 110, intensity: 2, at: 600 }, { type: 'birds', intensity: 1 }, { type: 'sparkle', x: 200, y: 180, w: 120, h: 40, intensity: 1, at: 1600 }],
};

const DOORS: StageSpec = {
  sky: 'dawn',
  layers: [{ art: 'seerah.makkah-doors-open', fill: true }, { art: 'seerah.makkah-doors', fill: true, at: 1200, enter: 'fade', duration: 1600 }],
  effects: [{ type: 'sunrays', x: 320, y: 60, intensity: 1 }, { type: 'lanternGlow', x: 126, y: 166, intensity: 1, at: 2000 }],
};

const ARAFAT: StageSpec = {
  sky: 'sunset',
  mood: 'golden',
  layers: [{ art: 'seerah.arafat-plain', fill: true }],
  effects: [{ type: 'sunrays', x: 320, y: 90, intensity: 2 }, { type: 'birds', intensity: 1, at: 1200 }],
};

const CARAVAN_NIGHT: StageSpec = {
  sky: 'night',
  layers: [moon(90, 48), { art: 'seerah.caravan-trail', fill: true }, camel(150, 600), camel(200, 1100)],
  effects: ['stars', { type: 'sand', intensity: 1 }],
};

// ---------- episodes ----------

export const EPISODE_STAGES: Record<string, EpisodeStageFields> = {
  'episode-01': {
    stage: MAKKAH_NIGHT,
    stages: {
      context: {
        sky: 'day',
        layers: [{ art: 'seerah.makkah-valley', fill: true }, camel(70, 800, 'slideRight'), camel(30, 1300, 'slideRight')],
        effects: [{ type: 'clouds', intensity: 1 }, { type: 'sand', intensity: 1 }],
      },
      timeline: {
        sky: 'dusk',
        layers: [{ art: 'seerah.elephant-scene', fill: true }],
        effects: [{ type: 'birds', intensity: 2, at: 900 }, { type: 'dust', intensity: 1 }],
      },
      mainEvent: {
        sky: 'night',
        mood: 'golden',
        layers: [moon(330), { art: 'seerah.makkah-valley', fill: true }],
        effects: [{ type: 'stars', intensity: 3 }, { type: 'sparkle', x: 200, y: 150, w: 140, h: 60, intensity: 1, at: 1200 }],
      },
      lesson: {
        sky: 'dawn',
        layers: [{ art: 'seerah.caravan-trail', fill: true }, { art: 'animal.sheep', x: 120, y: 228, w: 44, enter: 'fade', at: 400 }, { art: 'animal.sheep', x: 170, y: 222, w: 38, enter: 'fade', at: 800 }],
        effects: [{ type: 'sunrays', x: 320, y: 80 }],
      },
    },
  },
  'episode-02': {
    stage: HIRA,
    stages: {
      context: { sky: 'night', layers: [moon(320, 44), { art: 'seerah.hira-mountain', fill: true }], effects: ['stars', { type: 'lanternGlow', x: 246, y: 84, intensity: 1 }] },
      mainEvent: HIRA,
      lesson: {
        sky: 'dawn',
        layers: [{ art: 'story.mountains', opacity: 0.8 }, { art: 'object.pen', x: 150, y: 200, w: 70, enter: 'rise', at: 300 }, { art: 'object.book', x: 240, y: 206, w: 90, enter: 'rise', at: 700 }],
        effects: [{ type: 'sunrays', x: 200, y: 90, intensity: 2 }, { type: 'sparkle', x: 200, y: 150, w: 160, h: 60, intensity: 1, at: 1200 }],
      },
    },
  },
  'episode-03': {
    stage: {
      sky: 'dawn',
      layers: [{ art: 'seerah.makkah-valley', fill: true }, { art: 'seerah.safa-hill', x: 76, y: 212, w: 130, enter: 'rise', at: 400 }],
      effects: [{ type: 'sunrays', x: 320, y: 80 }, { type: 'birds', intensity: 1 }],
    },
    stages: {
      context: { sky: 'night', layers: [moon(320), { art: 'seerah.makkah-valley', fill: true }, { art: 'story.lamp', x: 200, y: 232, w: 40 }], effects: ['stars', { type: 'lanternGlow', x: 200, y: 212, intensity: 2 }] },
      mainEvent: {
        sky: 'day',
        layers: [{ art: 'story.mountains', opacity: 0.8 }, { art: 'seerah.safa-hill', x: 200, y: 236, w: 300, enter: 'rise', at: 300 }],
        effects: [{ type: 'sunrays', x: 200, y: 70, intensity: 2 }, { type: 'wind', intensity: 1 }],
      },
    },
  },
  'episode-04': {
    stage: TAIF,
    stages: {
      context: { sky: 'dusk', mood: 'cool', layers: [{ art: 'story.valley' }, { art: 'story.tents', x: 200, y: 220, w: 160 }], effects: [{ type: 'stars', intensity: 1 }, { type: 'sand', intensity: 1 }] },
      timeline: {
        sky: 'sea',
        layers: [{ art: 'story.sea', fill: true }, { art: 'object.boat', x: 130, y: 196, w: 110, anim: 'bob', enter: 'slideLeft', at: 300, duration: 2400 }],
        effects: [{ type: 'waves', y: 196 }, { type: 'birds', intensity: 1 }],
      },
      mainEvent: TAIF,
      lesson: { sky: 'night', layers: [moon(200, 50), { art: 'seerah.makkah-valley', fill: true }], effects: [{ type: 'stars', intensity: 3 }, { type: 'lightBeam', x: 200, intensity: 1, at: 1200 }] },
    },
  },
  'episode-05': {
    stage: CARAVAN_NIGHT,
    stages: {
      context: { sky: 'night', layers: [moon(80), { art: 'seerah.makkah-valley', fill: true }], effects: ['stars', { type: 'mist', intensity: 1 }] },
      timeline: CARAVAN_NIGHT,
      mainEvent: THAWR,
      lesson: { ...MADINAH_DAY, layers: [...(MADINAH_DAY.layers ?? []), camel(200, 600, 'slideLeft')] },
    },
  },
  'episode-06': {
    stage: MASJID,
    stages: {
      context: MADINAH_DAY,
      mainEvent: MASJID,
      lesson: { sky: 'day', layers: [{ art: 'story.hills' }, { art: 'seerah.two-houses', x: 200, y: 232, w: 220, enter: 'rise', at: 300 }], effects: [{ type: 'leaves', intensity: 1 }, { type: 'sparkle', x: 200, y: 110, w: 100, h: 40, intensity: 1, at: 1200 }] },
    },
  },
  'episode-07': {
    stage: BADR,
    stages: {
      context: { sky: 'day', layers: [{ art: 'seerah.caravan-trail', fill: true }, camel(120, 400), camel(170, 800), camel(220, 1200)], effects: [{ type: 'sand', intensity: 2 }] },
      mainEvent: { ...BADR, layers: [...(BADR.layers ?? []), { art: 'story.rain-clouds', y: 70, w: 380, anchor: 'center', enter: 'fade', at: 1000 }], effects: [...(BADR.effects ?? []), { type: 'rain', intensity: 1, at: 1400, until: 6000 }] },
      lesson: { sky: 'dusk', layers: [{ art: 'story.hills' }, { art: 'place.mount-uhud', x: 200, y: 226, w: 300 }], effects: [{ type: 'stars', intensity: 1 }, { type: 'wind', intensity: 1 }] },
    },
  },
  'episode-08': {
    stage: HUDAYBIYYAH,
    stages: {
      context: TRENCH,
      mainEvent: { sky: 'day', layers: [{ art: 'story.hills' }, { art: 'seerah.pledge-tree', x: 200, y: 232, w: 300, enter: 'rise', at: 300 }], effects: [{ type: 'sunrays', x: 200, y: 70, intensity: 2 }, { type: 'leaves', intensity: 1 }] },
      lesson: { sky: 'dawn', layers: [{ art: 'story.desert-flat' }, { art: 'seerah.treaty-scroll', x: 200, y: 232, w: 210, enter: 'zoom', at: 300 }], effects: [{ type: 'sparkle', x: 200, y: 140, w: 140, h: 60, intensity: 1, at: 1200 }] },
    },
  },
  'episode-09': {
    stage: CONQUEST,
    stages: {
      context: { sky: 'night', layers: [moon(320), { art: 'seerah.caravan-trail', fill: true }, camel(140, 400), camel(190, 900), camel(240, 1400)], effects: ['stars', { type: 'fireflies', intensity: 1 }] },
      mainEvent: DOORS,
      lesson: { sky: 'dawn', layers: [{ art: 'seerah.makkah-valley', fill: true }], effects: [{ type: 'lightBeam', x: 200, intensity: 2, at: 600 }, { type: 'sparkle', x: 200, y: 170, w: 100, h: 50, intensity: 2, at: 1400 }] },
    },
  },
  'episode-10': {
    stage: ARAFAT,
    stages: {
      context: { sky: 'day', layers: [{ art: 'seerah.caravan-trail', fill: true }, camel(100, 400), camel(150, 800), camel(200, 1200)], effects: [{ type: 'clouds', intensity: 1 }] },
      mainEvent: ARAFAT,
      lesson: {
        sky: 'night',
        layers: [moon(300), { art: 'seerah.masjid-finished-qibla', fill: true, opacity: 0.95 }],
        effects: [{ type: 'stars', intensity: 2 }, { type: 'lanternGlow', x: 200, y: 160, intensity: 1 }],
      },
    },
  },
};

/** Stages of single events (shown at the top of the event screen). */
export const EVENT_STAGES: Record<string, StageSpec> = {
  elephant: EPISODE_STAGES['episode-01'].stages!.timeline!,
  birth: MAKKAH_NIGHT,
  'kaaba-rebuild': { sky: 'day', layers: [{ art: 'seerah.makkah-valley', fill: true }], effects: [{ type: 'sunrays', x: 200, y: 90, intensity: 1 }, { type: 'birds', intensity: 1 }] },
  'first-revelation': HIRA,
  'public-call': EPISODE_STAGES['episode-03'].stages!.mainEvent!,
  abyssinia: EPISODE_STAGES['episode-04'].stages!.timeline!,
  taif: TAIF,
  'isra-miraj': { sky: 'night', layers: [moon(200, 50), { art: 'seerah.makkah-valley', fill: true }], effects: [{ type: 'stars', intensity: 3 }, { type: 'lightBeam', x: 200, intensity: 2, at: 800 }] },
  hijrah: THAWR,
  quba: { ...MADINAH_DAY, layers: [...(MADINAH_DAY.layers ?? []), camel(220, 500, 'slideLeft')] },
  mosque: MASJID,
  brotherhood: EPISODE_STAGES['episode-06'].stages!.lesson!,
  qibla: { sky: 'sunset', layers: [{ art: 'seerah.masjid-finished-qibla', fill: true }], effects: [{ type: 'sparkle', x: 200, y: 150, w: 160, h: 50, intensity: 1, at: 900 }] },
  badr: BADR,
  uhud: EPISODE_STAGES['episode-07'].stages!.lesson!,
  trench: TRENCH,
  hudaybiyyah: HUDAYBIYYAH,
  conquest: CONQUEST,
  farewell: ARAFAT,
  death: EPISODE_STAGES['episode-10'].stages!.lesson!,
};

type WithStages<T> = T & EpisodeStageFields;

/** Cover stage of an episode (JSON `stage`, else the overlay). */
export function episodeStage(episode: Episode): StageSpec | undefined {
  return (episode as WithStages<Episode>).stage ?? EPISODE_STAGES[episode.id]?.stage;
}

/** Stage of one step of an episode (JSON `stages[step]`, else the overlay), if any. */
export function episodeStepStage(episode: Episode, step: EpisodeStep): StageSpec | undefined {
  return (episode as WithStages<Episode>).stages?.[step] ?? EPISODE_STAGES[episode.id]?.stages?.[step];
}

/** Stage of an event (JSON `stage`, else the overlay), if any. */
export function eventStage(event: SeerahEvent): StageSpec | undefined {
  return (event as SeerahEvent & { stage?: StageSpec }).stage ?? EVENT_STAGES[event.id];
}

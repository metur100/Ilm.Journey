import type { MapPlaceId, StageSpec } from '../models';

/**
 * Stage overlay (owned by the story-fx author, docs/STORIES-V3.md §5): animated stages, symbol art and map places
 * for stories whose JSON does not carry them yet. Merged at load time in `content/index.ts`; values in the story
 * JSON always win. Group authors can move an entry into their JSON (`coverStage`, scene `stage`, `symbolArt`,
 * `mapPlaces`) and drop it here, or ask story-fx to extend this map.
 *
 * Only existing library art is used here (`story.*`, `place.*`, `object.*`, `animal.*`, `garden.*`); the
 * prophet-specific `prophet.*` pieces come from the group authors. Never people.
 */
export interface StoryOverlay {
  cover?: StageSpec;
  scenes?: Record<string, StageSpec>;
  symbolArt?: string;
  mapPlaces?: MapPlaceId[];
}

export const STORY_STAGES: Record<string, StoryOverlay> = {
  adam: {
    symbolArt: 'garden.fig',
    cover: {
      sky: 'dawn',
      layers: [{ art: 'story.garden' }, { art: 'garden.pomegranate', x: 200, y: 214, w: 96, anim: 'breathe', enter: 'rise', at: 300 }],
      effects: [{ type: 'stars', intensity: 1, until: 3000 }, { type: 'sunrays', x: 330, y: 70 }, { type: 'birds', intensity: 1 }, { type: 'leaves', intensity: 1 }],
    },
    scenes: {
      'adam-s1': {
        sky: 'day',
        layers: [
          { art: 'story.hills' },
          { art: 'garden.olive', x: 96, y: 206, w: 80, enter: 'rise', at: 400 },
          { art: 'animal.sheep', x: 290, y: 214, w: 54, enter: 'fade', at: 900 },
          { art: 'animal.dove', x: 250, y: 90, w: 36, anchor: 'center', anim: 'float', enter: 'fade', at: 1400 },
          { art: 'garden.flower-lily', x: 190, y: 228, w: 26, enter: 'rise', at: 1800 },
        ],
        effects: [{ type: 'clouds', intensity: 1 }, { type: 'sparkle', x: 200, y: 150, w: 260, h: 120, intensity: 2, at: 1000 }],
      },
      'adam-s2': {
        sky: 'sunset',
        mood: 'golden',
        layers: [{ art: 'story.garden' }, { art: 'garden.fig', x: 200, y: 218, w: 110, anim: 'sway' }],
        effects: [{ type: 'leaves', intensity: 1 }, { type: 'birds', intensity: 1 }, { type: 'fireflies', intensity: 1, at: 1500 }],
      },
      'adam-s3': {
        sky: 'dawn',
        layers: [
          { art: 'story.sun', x: 200, y: 180, w: 110, anchor: 'center', enter: 'rise', at: 800, duration: 2600 },
          { art: 'story.mountains' },
          { art: 'story.grass', y: 240, w: 400 },
        ],
        effects: [{ type: 'stars', intensity: 2, until: 3000 }, { type: 'sunrays', x: 200, y: 170, intensity: 3, at: 2200 }, { type: 'birds', intensity: 1, at: 3000 }],
      },
    },
  },

  nuh: {
    symbolArt: 'object.ark',
    mapPlaces: ['judi'],
    cover: {
      sky: 'storm',
      camera: 'drift',
      layers: [
        { art: 'story.mountains', opacity: 0.6 },
        { art: 'story.sea-storm' },
        { art: 'object.ark', x: 200, y: 192, w: 150, anim: 'bob' },
        { art: 'story.rain-clouds', y: 96, w: 420 },
      ],
      effects: [{ type: 'rain', intensity: 3 }, { type: 'waves', y: 206, intensity: 1 }],
    },
    scenes: {
      'nuh-s1': {
        sky: 'dusk',
        layers: [
          { art: 'story.moon-crescent', x: 322, y: 52, w: 56, anchor: 'center', anim: 'glow' },
          { art: 'story.city-ancient' },
          { art: 'object.lamp', x: 312, y: 232, w: 50, enter: 'fade', at: 600 },
        ],
        effects: ['stars', { type: 'lanternGlow', x: 325, y: 214, intensity: 1, at: 600 }, { type: 'sand', intensity: 1 }],
      },
      'nuh-s2': {
        sky: 'day',
        layers: [
          { art: 'story.hills' },
          { art: 'object.ark', x: 200, y: 222, w: 180, enter: 'rise', at: 300, duration: 1600 },
          { art: 'story.rocks', x: 60, y: 238, w: 90 },
          { art: 'object.rope', x: 330, y: 234, w: 46, enter: 'fade', at: 1600 },
        ],
        effects: [{ type: 'clouds', intensity: 2 }, { type: 'birds', intensity: 1 }, { type: 'dust', intensity: 1 }],
      },
      'nuh-s3': {
        sky: 'storm',
        layers: [
          { art: 'place.mount-judi', x: 250, y: 190, w: 190, enter: 'fade', at: 4200, duration: 1800 },
          { art: 'story.sea-storm' },
          { art: 'object.ark', x: 190, y: 194, w: 150, anim: 'bob', exitAt: 3800 },
          { art: 'story.rain-clouds', y: 96, w: 420, exitAt: 4200 },
        ],
        effects: [{ type: 'rain', intensity: 3, until: 4500 }, { type: 'waves', y: 206, intensity: 2 }, { type: 'lightBeam', x: 320, intensity: 1, at: 5200 }],
      },
    },
  },

  ibrahim: {
    symbolArt: 'place.kaaba',
    mapPlaces: ['mesopotamia', 'canaan', 'makkah'],
    cover: {
      sky: 'night',
      layers: [
        { art: 'story.moon-full', x: 318, y: 54, w: 70, anchor: 'center', anim: 'glow' },
        { art: 'story.dunes' },
        { art: 'place.kaaba', x: 200, y: 218, w: 124, enter: 'rise', at: 300 },
      ],
      effects: ['stars', { type: 'sand', intensity: 1 }],
    },
    scenes: {
      'ibrahim-s1': {
        sky: 'night',
        layers: [
          { art: 'story.moon-full', x: 120, y: 72, w: 70, anchor: 'center', enter: 'fade', at: 1600, exitAt: 4300 },
          { art: 'story.sun', x: 270, y: 92, w: 96, anchor: 'center', enter: 'rise', at: 4600, duration: 1800, exitAt: 8400 },
          { art: 'story.night-horizon' },
        ],
        effects: [{ type: 'stars', intensity: 3, until: 1800 }, { type: 'sparkle', x: 300, y: 50, w: 30, h: 30, intensity: 1, until: 1800 }, { type: 'sunrays', x: 270, y: 92, at: 5200, until: 8400 }],
      },
      'ibrahim-s2': {
        sky: 'dusk',
        layers: [{ art: 'story.city-ancient' }, { art: 'object.fire', x: 200, y: 224, w: 74, anim: 'breathe' }],
        effects: [{ type: 'flameGlow', x: 200, y: 190, intensity: 2 }, { type: 'sparkle', x: 200, y: 170, w: 160, h: 80, intensity: 1, at: 1500 }, { type: 'stars', intensity: 1 }],
      },
      'ibrahim-s3': {
        sky: 'sunset',
        layers: [{ art: 'story.valley' }, { art: 'place.kaaba', x: 200, y: 224, w: 116, enter: 'rise', at: 400, duration: 1800 }],
        effects: [{ type: 'sunrays', x: 330, y: 60 }, { type: 'birds', intensity: 1 }, { type: 'sparkle', x: 200, y: 160, w: 140, h: 60, intensity: 1, at: 2400 }],
      },
    },
  },

  musa: {
    symbolArt: 'object.staff',
    mapPlaces: ['egypt', 'sinai', 'madyan'],
    cover: {
      sky: 'night',
      layers: [
        { art: 'story.mountains', opacity: 0.85 },
        { art: 'story.shore' },
        { art: 'object.staff', x: 290, y: 226, w: 40, rotate: -8, enter: 'rise', at: 400 },
      ],
      effects: ['stars', { type: 'lightBeam', x: 290, y: 226, intensity: 1, at: 900 }, { type: 'waves', y: 168, intensity: 1 }, { type: 'mist', y: 150, h: 40, intensity: 1 }],
    },
    scenes: {
      'musa-s1': {
        sky: 'day',
        layers: [
          { art: 'story.sun', x: 330, y: 52, w: 80, anchor: 'center' },
          { art: 'story.nile' },
          { art: 'object.basket', x: 210, y: 196, w: 56, anim: 'bob', enter: 'slideLeft', at: 300, duration: 2200 },
          { art: 'story.reeds', x: 56, y: 240, w: 84 },
          { art: 'story.reeds', x: 352, y: 240, w: 76, flip: true },
        ],
        effects: [{ type: 'ripples', x: 210, y: 192, w: 70 }, { type: 'birds', intensity: 1 }],
      },
      'musa-s2': {
        sky: 'dusk',
        layers: [{ art: 'place.mount-sinai', x: 200, y: 232, w: 260 }, { art: 'story.rocks', x: 70, y: 240, w: 100 }],
        effects: ['stars', { type: 'lanternGlow', x: 200, y: 112, intensity: 2, at: 1200 }, { type: 'lightBeam', x: 200, y: 120, intensity: 1, at: 1800 }],
      },
    },
  },

  yusuf: {
    symbolArt: 'object.well',
    mapPlaces: ['canaan', 'egypt'],
    cover: {
      sky: 'night',
      layers: [
        { art: 'story.moon-full', x: 320, y: 50, w: 66, anchor: 'center', anim: 'glow' },
        { art: 'story.dunes' },
        { art: 'object.well', x: 200, y: 222, w: 84 },
      ],
      effects: [{ type: 'stars', intensity: 3 }, { type: 'sparkle', x: 110, y: 60, w: 200, h: 70, intensity: 2, at: 800 }],
    },
    scenes: {
      'yusuf-s1': {
        sky: 'day',
        layers: [{ art: 'story.desert-flat' }, { art: 'object.well', x: 190, y: 222, w: 96 }, { art: 'story.palms', x: 330, y: 220, w: 120 }],
        effects: [{ type: 'sand', intensity: 2 }, { type: 'sunrays', x: 70, y: 50, intensity: 1 }],
      },
      'yusuf-s2': {
        sky: 'sunset',
        layers: [
          { art: 'story.city-ancient', opacity: 0.9 },
          { art: 'story.dunes', y: 268 },
          { art: 'animal.camel', x: 150, y: 222, w: 74, enter: 'slideRight', at: 300, duration: 2000 },
          { art: 'animal.camel', x: 232, y: 226, w: 64, enter: 'slideRight', at: 700, duration: 2000 },
        ],
        effects: [{ type: 'sand', intensity: 2 }, { type: 'birds', intensity: 1 }],
      },
      'yusuf-s3': {
        sky: 'day',
        layers: [
          { art: 'story.sun', x: 330, y: 50, w: 76, anchor: 'center' },
          { art: 'story.nile' },
          { art: 'object.storehouse', x: 150, y: 228, w: 120, enter: 'rise', at: 300 },
          { art: 'object.grain-sack', x: 262, y: 230, w: 46, enter: 'rise', at: 900 },
          { art: 'object.grain-sack', x: 300, y: 232, w: 40, enter: 'rise', at: 1200 },
        ],
        effects: [{ type: 'sunrays', x: 330, y: 50, intensity: 1 }, { type: 'dust', intensity: 1 }, { type: 'birds', intensity: 1 }],
      },
    },
  },

  yunus: {
    symbolArt: 'animal.whale',
    mapPlaces: ['nineveh'],
    cover: {
      sky: 'sea',
      layers: [{ art: 'story.underwater', fill: true }, { art: 'animal.whale', x: 205, y: 128, w: 230, anchor: 'center', anim: 'float' }],
      effects: [{ type: 'bubbles', intensity: 2 }, { type: 'lightBeam', x: 110, intensity: 1 }],
    },
    scenes: {
      'yunus-s1': {
        sky: 'storm',
        camera: 'drift',
        layers: [{ art: 'story.sea-storm' }, { art: 'object.boat', x: 200, y: 182, w: 130, anim: 'bob' }, { art: 'story.rain-clouds', y: 92, w: 420 }],
        effects: [{ type: 'rain', intensity: 2 }, { type: 'waves', y: 204, intensity: 2 }],
      },
      'yunus-s2': {
        sky: 'sea',
        mood: 'night',
        layers: [{ art: 'story.underwater', fill: true }, { art: 'animal.whale', x: 210, y: 132, w: 240, anchor: 'center', anim: 'float' }],
        effects: [{ type: 'bubbles', intensity: 1 }, { type: 'mist', intensity: 2 }, { type: 'lightBeam', x: 210, intensity: 2, at: 3000 }, { type: 'sparkle', x: 210, y: 120, w: 160, h: 60, intensity: 1, at: 3600 }],
      },
      'yunus-s3': {
        sky: 'dawn',
        layers: [{ art: 'story.shore' }, { art: 'story.palms', x: 320, y: 216, w: 130 }],
        effects: [{ type: 'sunrays', x: 80, y: 120 }, { type: 'birds', intensity: 1 }, { type: 'ripples', x: 90, y: 180, w: 70, intensity: 1 }],
      },
    },
  },

  isa: {
    symbolArt: 'garden.palm',
    mapPlaces: ['jerusalem'],
    cover: {
      sky: 'dawn',
      layers: [{ art: 'story.dunes' }, { art: 'story.palms', x: 200, y: 218, w: 150 }, { art: 'object.dates', x: 300, y: 226, w: 46, enter: 'fade', at: 900 }],
      effects: [{ type: 'stars', intensity: 1, until: 2500 }, { type: 'sunrays', x: 70, y: 80, at: 1200 }],
    },
    scenes: {
      'isa-s1': {
        sky: 'day',
        layers: [
          { art: 'story.desert-flat' },
          { art: 'garden.stream', x: 200, y: 244, w: 260, enter: 'fade', at: 700, duration: 1500 },
          { art: 'garden.palm', x: 196, y: 214, w: 120, anim: 'sway' },
          { art: 'object.dates', x: 290, y: 226, w: 44, enter: 'fall', at: 1800 },
        ],
        effects: [{ type: 'ripples', x: 200, y: 226, w: 60, intensity: 1, at: 700 }, { type: 'sparkle', x: 290, y: 200, w: 60, h: 40, intensity: 1, at: 2000 }],
      },
      'isa-s2': {
        sky: 'sunset',
        layers: [{ art: 'story.city-ancient', opacity: 0.85 }, { art: 'story.hills', y: 262 }],
        effects: [{ type: 'birds', intensity: 1 }, { type: 'sparkle', x: 200, y: 120, w: 200, h: 80, intensity: 1, at: 1200 }],
      },
      'isa-s3': {
        sky: 'dusk',
        layers: [{ art: 'story.olive-grove' }, { art: 'object.book', x: 200, y: 214, w: 74, enter: 'rise', at: 500 }],
        effects: ['stars', { type: 'lightBeam', x: 200, y: 214, intensity: 1, at: 900 }, { type: 'sparkle', x: 200, y: 170, w: 120, h: 60, intensity: 2, at: 1400 }],
      },
    },
  },

  muhammad: {
    symbolArt: 'place.masjid-nabawi',
    mapPlaces: ['makkah', 'madinah'],
    cover: {
      sky: 'sunset',
      layers: [{ art: 'story.mountains', opacity: 0.9 }, { art: 'place.masjid-nabawi-early', x: 200, y: 230, w: 230, enter: 'rise', at: 300 }],
      effects: [{ type: 'sunrays', x: 330, y: 64 }, { type: 'birds', intensity: 1 }],
    },
    scenes: {
      'muhammad-s1': {
        sky: 'night',
        layers: [{ art: 'story.night-horizon' }, { art: 'place.cave-hira', x: 200, y: 236, w: 250 }],
        effects: [{ type: 'stars', intensity: 3 }, { type: 'lightBeam', x: 200, y: 200, intensity: 1, at: 1600 }],
      },
      'muhammad-s2': {
        sky: 'dusk',
        layers: [{ art: 'story.dunes' }, { art: 'place.cave-thawr', x: 300, y: 216, w: 150 }, { art: 'animal.camel', x: 110, y: 224, w: 64, enter: 'slideLeft', at: 600, duration: 2000 }],
        effects: ['stars', { type: 'sand', intensity: 1 }],
      },
      'muhammad-s3': {
        sky: 'dawn',
        layers: [{ art: 'story.hills' }, { art: 'place.masjid-nabawi-early', x: 200, y: 234, w: 240, enter: 'rise', at: 300 }],
        effects: [{ type: 'sunrays', x: 70, y: 70 }, { type: 'birds', intensity: 1 }, { type: 'leaves', intensity: 1 }],
      },
    },
  },
};

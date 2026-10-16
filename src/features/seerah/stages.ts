import type { StageSpec } from '@/core/components/scene/stage';

import type { Episode, EpisodeStep, SeerahEvent } from './models';

/*
 * Animated stages of the Seerah (story-fx engine, docs/STORIES-V3.md §8). An episode JSON may carry
 * `"stage"` (its cover: introduction, episode card, finish screen) and `"stages": { "<step>": stage }` for single
 * steps (context, timeline, mainEvent, lesson …); an event JSON may carry `"stage"`. Until the Seerah author adds
 * them, the overlay below gives every episode an animated cover made from existing library art. JSON wins over the
 * overlay. Never people – the Prophet ﷺ, his family and companions are never depicted.
 */

export interface EpisodeStageFields {
  stage?: StageSpec;
  stages?: Partial<Record<EpisodeStep, StageSpec>>;
}

export const EPISODE_STAGES: Record<string, EpisodeStageFields> = {
  'episode-01': {
    stage: {
      sky: 'night',
      layers: [
        { art: 'story.moon-crescent', x: 322, y: 50, w: 56, anchor: 'center', anim: 'glow' },
        { art: 'story.mountains', opacity: 0.85 },
        { art: 'place.makkah-city', x: 200, y: 236, w: 300, enter: 'rise', at: 300 },
      ],
      effects: ['stars', { type: 'lanternGlow', x: 200, y: 190, intensity: 1, at: 1200 }],
    },
  },
  'episode-02': {
    stage: {
      sky: 'night',
      layers: [{ art: 'story.night-horizon' }, { art: 'place.cave-hira', x: 200, y: 236, w: 250 }],
      effects: [{ type: 'stars', intensity: 3 }, { type: 'lightBeam', x: 200, y: 200, intensity: 1, at: 1500 }],
    },
  },
  'episode-03': {
    stage: {
      sky: 'dawn',
      layers: [{ art: 'story.mountains' }, { art: 'place.kaaba', x: 200, y: 222, w: 112, enter: 'rise', at: 300 }],
      effects: [{ type: 'sunrays', x: 320, y: 80 }, { type: 'birds', intensity: 1 }],
    },
  },
  'episode-04': {
    stage: {
      sky: 'dusk',
      layers: [{ art: 'story.mountains', opacity: 0.8 }, { art: 'story.dunes', y: 262 }, { art: 'place.makkah-city', x: 220, y: 214, w: 220 }],
      effects: [{ type: 'stars', intensity: 1 }, { type: 'sand', intensity: 2 }],
    },
  },
  'episode-05': {
    stage: {
      sky: 'night',
      layers: [
        { art: 'story.moon-crescent', x: 90, y: 52, w: 50, anchor: 'center', anim: 'glow' },
        { art: 'story.dunes' },
        { art: 'place.cave-thawr', x: 300, y: 214, w: 150 },
        { art: 'animal.camel', x: 120, y: 224, w: 66, enter: 'slideLeft', at: 600, duration: 2200 },
      ],
      effects: ['stars', { type: 'sand', intensity: 1 }],
    },
  },
  'episode-06': {
    stage: {
      sky: 'day',
      layers: [{ art: 'story.hills' }, { art: 'place.masjid-nabawi-early', x: 200, y: 234, w: 250, enter: 'rise', at: 300 }],
      effects: [{ type: 'clouds', intensity: 1 }, { type: 'birds', intensity: 1 }, { type: 'leaves', intensity: 1 }],
    },
  },
  'episode-07': {
    stage: {
      sky: 'dawn',
      layers: [{ art: 'story.mountains', opacity: 0.85 }, { art: 'place.badr-wells', x: 200, y: 240, w: 300 }],
      effects: [{ type: 'sunrays', x: 70, y: 80 }, { type: 'sand', intensity: 1 }, { type: 'ripples', x: 200, y: 214, w: 30, intensity: 1 }],
    },
  },
  'episode-08': {
    stage: {
      sky: 'day',
      layers: [{ art: 'story.desert-flat' }, { art: 'story.tents', x: 140, y: 216, w: 160 }, { art: 'animal.camel', x: 300, y: 224, w: 64 }],
      effects: [{ type: 'clouds', intensity: 1 }, { type: 'sand', intensity: 1 }],
    },
  },
  'episode-09': {
    stage: {
      sky: 'dawn',
      layers: [{ art: 'story.valley' }, { art: 'place.kaaba', x: 200, y: 226, w: 116, enter: 'rise', at: 400, duration: 1600 }],
      effects: [{ type: 'sunrays', x: 200, y: 120, intensity: 2, at: 800 }, { type: 'birds', intensity: 1 }, { type: 'sparkle', x: 200, y: 160, w: 160, h: 60, intensity: 1, at: 1800 }],
    },
  },
  'episode-10': {
    stage: {
      sky: 'dusk',
      layers: [
        { art: 'story.mountains', opacity: 0.85 },
        { art: 'story.desert-flat', y: 262 },
        { art: 'story.tents', x: 110, y: 222, w: 140 },
        { art: 'place.kaaba', x: 280, y: 224, w: 100 },
      ],
      effects: ['stars', { type: 'lanternGlow', x: 110, y: 200, intensity: 1 }],
    },
  },
};

/** Stages of single events (shown at the top of the event screen). */
export const EVENT_STAGES: Record<string, StageSpec> = {};

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

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

/**
 * Every story JSON now carries its own coverStage, scene stages and symbolArt (and mapPlaces where a source supports a
 * place), so the overlay is empty. Keep it for stories added later without stages.
 */
export const STORY_STAGES: Record<string, StoryOverlay> = {};

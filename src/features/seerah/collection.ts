import type { AchievementKey, CollectionCard } from '@/core/models';
import { registerAchievements, registerCollectionCards } from '@/core/registry';

import { EPISODES, getEpisode, getEvent, getPlace, getSource, resolve } from './content';
import type { Episode } from './models';
import { completedEpisodes } from './services/progress';
import { toSourceRef } from './services/sources';
import { pickSeerah, useSeerahStore } from './store/seerahStore';

/**
 * Collection cards of the Seerah feature: places (name + "why it matters") and events (title + first fact block),
 * each with its own Seerah sources. Texts are copied from the content files – nothing is written new.
 */

/** Places with their art; Jeddah is left out (shown on the map for orientation only, no sources). */
const PLACES: readonly { id: string; art: string }[] = [
  { id: 'makkah', art: 'place.makkah-city' },
  { id: 'hira', art: 'place.cave-hira' },
  { id: 'abyssinia', art: 'place.city-generic' },
  { id: 'taif', art: 'place.taif' },
  { id: 'thawr', art: 'place.cave-thawr' },
  { id: 'quba', art: 'place.masjid-nabawi-early' },
  { id: 'madinah', art: 'place.madinah-city' },
  { id: 'badr', art: 'place.badr-wells' },
  { id: 'uhud', art: 'place.mount-uhud' },
  { id: 'hudaybiyyah', art: 'place.desert-road' },
  { id: 'arafat', art: 'place.valley' },
];

/** Events with an episode and a fact block (battles with casualties and the Prophet's ﷺ death are not used as cards). */
const EVENTS: readonly { id: string; art: string }[] = [
  { id: 'elephant', art: 'animal.elephant' },
  { id: 'first-revelation', art: 'object.scroll' },
  { id: 'public-call', art: 'scene.mountains' },
  { id: 'abyssinia', art: 'place.city-generic' },
  { id: 'hijrah', art: 'animal.camel' },
  { id: 'mosque', art: 'place.masjid-nabawi' },
  { id: 'brotherhood', art: 'ui.heart' },
  { id: 'qibla', art: 'object.compass' },
  { id: 'hudaybiyyah', art: 'object.pen' },
  { id: 'conquest', art: 'place.kaaba' },
  { id: 'farewell', art: 'object.prayer-mat' },
];

const sourceRefs = (ids: readonly string[]) => resolve(ids, getSource).map(toSourceRef);

/** The first episode (in episode order) that lists a place. */
const firstEpisodeAt = (placeId: string): Episode | undefined => EPISODES.find((e) => e.places.includes(placeId));

function placeCards(): CollectionCard[] {
  return PLACES.flatMap(({ id, art }, index) => {
    const place = getPlace(id);
    const episode = firstEpisodeAt(id);
    const sources = place ? sourceRefs(place.sourceIds) : [];
    if (!place || !episode || sources.length === 0) return [];
    return [
      {
        id: `place-${id}`,
        category: 'places' as const,
        art,
        title: place.name,
        arabic: place.arabicName,
        fact: place.whyItMatters,
        sources,
        unlock: `episode:${episode.id}`,
        unlockTitle: episode.title,
        order: episode.order * 10 + index / 100,
      },
    ];
  });
}

function eventCards(): CollectionCard[] {
  return EVENTS.flatMap(({ id, art }) => {
    const event = getEvent(id);
    const episode = event?.episodeId ? getEpisode(event.episodeId) : undefined;
    const fact = event?.summary.find((b) => b.kind === 'fact');
    if (!event || !episode || !fact) return [];
    const sources = sourceRefs(fact.sourceIds.length > 0 ? fact.sourceIds : event.sourceIds);
    if (sources.length === 0) return [];
    return [
      {
        id: `event-${id}`,
        category: 'events' as const,
        art,
        title: event.title,
        subtitle: event.date.label,
        fact: fact.text,
        sources,
        unlock: `episode:${episode.id}`,
        unlockTitle: episode.title,
        order: event.date.sortKey,
      },
    ];
  });
}

/** All Seerah cards (exported for tests). */
export function seerahCollectionCards(): CollectionCard[] {
  return [...placeCards(), ...eventCards()];
}

/** `episode:<id>` for every completed episode. */
export function seerahAchievements(): AchievementKey[] {
  return completedEpisodes(pickSeerah(useSeerahStore.getState())).map((id) => `episode:${id}`);
}

/** Registers the Seerah collection cards and achievements (called from `register.ts`). */
export function registerSeerahCollection(): void {
  registerCollectionCards('seerah', seerahCollectionCards());
  registerAchievements('seerah', seerahAchievements);
}

import { localizedFrom, translateNs } from '@/core/i18n';
import type { AchievementKey, CollectionCard, CollectionCategory, LocalizedText } from '@/core/models';
import { registerAchievements, registerCollectionCards } from '@/core/registry';

import { getStory, STORIES } from './content';
import { storiesI18n } from './i18n';
import type { Story } from './models';
import { useStoriesStore } from './store/storiesStore';

/**
 * Collection cards of the Stories feature: story objects (and Mount Judi). The fact on each card is the text of the
 * story scene the object appears in, with that scene's Quran references – nothing is written new. Titles are plain
 * object names.
 */

interface ObjectSeed {
  id: string;
  storyId: string;
  sceneId: string;
  art: string;
  title: LocalizedText;
  category?: CollectionCategory;
}

const SEEDS: readonly ObjectSeed[] = [
  { id: 'object-tree', storyId: 'adam', sceneId: 'adam-s2', art: 'garden.sapling', title: { en: 'The tree', de: 'Der Baum', bs: 'Drvo' } },
  { id: 'object-ark', storyId: 'nuh', sceneId: 'nuh-s2', art: 'object.ark', title: { en: 'The ark', de: 'Die Arche', bs: 'Lađa' } },
  { id: 'object-fire', storyId: 'ibrahim', sceneId: 'ibrahim-s2', art: 'object.fire', title: { en: 'The fire', de: 'Das Feuer', bs: 'Vatra' } },
  { id: 'object-basket', storyId: 'musa', sceneId: 'musa-s1', art: 'object.basket', title: { en: 'The basket', de: 'Der Korb', bs: 'Korpa' } },
  { id: 'object-staff', storyId: 'musa', sceneId: 'musa-s3', art: 'object.staff', title: { en: 'The staff', de: 'Der Stab', bs: 'Štap' } },
  { id: 'object-well', storyId: 'yusuf', sceneId: 'yusuf-s2', art: 'object.well', title: { en: 'The well', de: 'Der Brunnen', bs: 'Bunar' } },
  { id: 'object-grain', storyId: 'yusuf', sceneId: 'yusuf-s3', art: 'object.grain-sack', title: { en: 'The grain', de: 'Das Getreide', bs: 'Žito' } },
  { id: 'object-fish', storyId: 'yunus', sceneId: 'yunus-s1', art: 'animal.whale', title: { en: 'The big fish', de: 'Der große Fisch', bs: 'Velika riba' } },
  { id: 'object-dates', storyId: 'isa', sceneId: 'isa-s1', art: 'food.dates', title: { en: 'The palm and its dates', de: 'Die Palme und ihre Datteln', bs: 'Palma i njene hurme' } },
  {
    id: 'place-judi',
    storyId: 'nuh',
    sceneId: 'nuh-s3',
    art: 'place.mount-judi',
    category: 'places',
    title: localizedFrom((lang) => translateNs(storiesI18n, lang, 'place.judi')),
  },
];

/** "Nuh: The Great Ark" – the same title the home cards and quests use. */
const storyTitle = (story: Story): LocalizedText =>
  localizedFrom((lang) => `${story.prophetName[lang] || story.prophetName.en}: ${story.title[lang] || story.title.en}`);

/** All Stories cards (exported for tests). */
export function storiesCollectionCards(): CollectionCard[] {
  return SEEDS.flatMap((seed) => {
    const story = getStory(seed.storyId);
    const scene = story?.scenes.find((s) => s.id === seed.sceneId);
    if (!story || !scene) return [];
    const sources = scene.sources && scene.sources.length > 0 ? scene.sources : story.sources;
    return [
      {
        id: seed.id,
        category: seed.category ?? 'objects',
        art: seed.art,
        title: seed.title,
        subtitle: storyTitle(story),
        fact: scene.text,
        sources,
        unlock: `story:${story.id}:complete`,
        unlockTitle: storyTitle(story),
        // Places from the stories come after the Seerah places (which use their episode order 1–10).
        ...(seed.category === 'places' ? { order: 100 + story.order } : { order: story.order }),
      },
    ];
  });
}

/** `story:<id>:complete` for every finished story. */
export function storiesAchievements(): AchievementKey[] {
  const { stories } = useStoriesStore.getState();
  return STORIES.filter((s) => stories[s.id]?.completed).map((s) => `story:${s.id}:complete`);
}

/** Registers the Stories collection cards and achievements (called from `register.ts`). */
export function registerStoriesCollection(): void {
  registerCollectionCards('stories', storiesCollectionCards());
  registerAchievements('stories', storiesAchievements);
}

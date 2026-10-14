import { localize, translateNs } from '@/core/i18n';
import type { Language } from '@/core/models';
import type { SearchResult } from '@/core/registry';

import { STORIES } from '../content';
import { PLACE_IDS } from '../content/places';
import { storiesI18n } from '../i18n';
import { storiesByPlace } from './progress';

/** Search over the stories (prophet name, title, description, place) and the places of the story map. */
export function searchStories(query: string, language: Language): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const stories: SearchResult[] = STORIES.flatMap((story) => {
    const name = localize(story.prophetName, language);
    const title = localize(story.title, language);
    const inTitle = name.toLowerCase().includes(q) || title.toLowerCase().includes(q);
    const inText = [story.description, story.place, story.intro].some((text) => localize(text, language).toLowerCase().includes(q));
    if (!inTitle && !inText) return [];
    return [
      {
        key: `stories:story:${story.id}`,
        feature: 'stories',
        title: `${name}: ${title}`,
        subtitle: translateNs(storiesI18n, language, 'tab.title'),
        icon: 'scroll',
        href: { pathname: '/story/[id]', params: { id: story.id } },
        score: inTitle ? 3 : 1,
      },
    ];
  });
  const byPlace = storiesByPlace(STORIES);
  const places: SearchResult[] = PLACE_IDS.flatMap((id) => {
    const name = translateNs(storiesI18n, language, `place.${id}`);
    if (!name.toLowerCase().includes(q)) return [];
    const related = (byPlace[id] ?? []).map((s) => localize(s.prophetName, language)).join(', ');
    return [
      {
        key: `stories:place:${id}`,
        feature: 'stories',
        title: name,
        subtitle: related ? `${translateNs(storiesI18n, language, 'map.title')} · ${related}` : translateNs(storiesI18n, language, 'map.title'),
        icon: 'pin',
        href: '/story/map',
        score: 2,
      },
    ];
  });
  return [...stories, ...places];
}

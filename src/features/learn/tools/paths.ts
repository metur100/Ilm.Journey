import { localizedFrom } from '@/core/i18n';
import { listSurahs } from '@/features/quran';
import { STORIES } from '@/features/stories/content';
import { useStoriesStore } from '@/features/stories/store/storiesStore';

import { registerPathSource } from '../extensions';
import { learnedCount } from '../quests/services/memorization';
import { useQuestStore } from '../quests/store/questStore';

/**
 * Learn paths that make the complete Juz ʿAmma and all 25 prophets visible as steps in the topic path:
 * every surah opens the ayah-by-ayah reader, every prophet opens his story. A step is completed when all its
 * ayahs are learned / the story is finished.
 */
export function registerLearnContentPaths(): void {
  registerPathSource({
    id: 'quran-surahs',
    order: 60,
    items: (topic) => {
      if (topic !== 'quran') return [];
      const { memorization } = useQuestStore.getState();
      return listSurahs('memorization').map((s) => {
        return {
          kind: 'quest' as const,
          id: `surah-${s.number}`,
          title: localizedFrom((lang) => `${s.number}. ${s.nameTransliterated} – ${s.nameMeaningLocalized?.[lang] ?? s.nameMeaning}`),
          description: localizedFrom((lang) =>
            lang === 'bs'
              ? `${s.ayahCount} ajeta · uči ajet po ajet`
              : lang === 'de'
                ? `${s.ayahCount} Verse · Vers für Vers lernen`
                : `${s.ayahCount} ayahs · learn ayah by ayah`,
          ),
          icon: 'quran',
          href: { pathname: '/tools/quran/[surah]', params: { surah: String(s.number) } },
          completed: learnedCount({ memorization }, s) === s.ayahCount,
          target: `memorization:surah:${s.number}`,
        };
      });
    },
  });

  registerPathSource({
    id: 'prophet-stories',
    order: 65,
    items: (topic) => {
      if (topic !== 'prophets') return [];
      const { stories } = useStoriesStore.getState();
      return STORIES.map((story) => ({
        kind: 'quest' as const,
        id: `prophet-${story.id}`,
        title: localizedFrom((lang) => `${story.prophetName[lang] ?? story.prophetName.en}: ${story.title[lang] ?? story.title.en}`),
        description: localizedFrom((lang) => story.description[lang] ?? story.description.en),
        icon: 'scroll',
        href: { pathname: '/story/[id]', params: { id: story.id } },
        completed: stories[story.id]?.completed === true,
        target: `stories:story:${story.id}`,
      }));
    },
  });
}

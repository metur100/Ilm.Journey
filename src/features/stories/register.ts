import { localizedFrom, translateNs } from '@/core/i18n';
import {
  type CompletedItem,
  type ContinueItem,
  registerDailyPool,
  registerLifecycle,
  registerProfileLink,
  registerProgress,
  registerQuestionRenderer,
  registerQuestions,
  registerQuestProvider,
  registerSearch,
} from '@/core/registry';
import type { QuestCandidate } from '@/core/services/quests';

import { registerStoriesCollection } from './collection';
import { StoryMapQuestion } from './components/StoryMapQuestion';
import { getQuestion, getStory, QUESTIONS, STORIES, STORIES_PREFIX, storiesKey, storyOfQuestion } from './content';
import { storiesI18n } from './i18n';
import type { Story } from './models';
import { runProgress, storiesMetrics } from './services/progress';
import { searchStories } from './services/search';
import { buildStoryFlow } from './services/storyFlow';
import { nextStory, openStories } from './services/unlocking';
import { startStoriesAutoSave, storyTarget, useStoriesStore } from './store/storiesStore';

/** "Nuh: The Ark" style title for home cards and quests. */
const storyTitle = (story: Story) => localizedFrom((lang) => `${story.prophetName[lang] || story.prophetName.en}: ${story.title[lang] || story.title.en}`);
const tabTitle = localizedFrom((lang) => translateNs(storiesI18n, lang, 'tab.title'));

function continueItem(): ContinueItem | null {
  const { run } = useStoriesStore.getState();
  const story = run ? getStory(run.storyId) : undefined;
  if (!run || !story) return null;
  const total = buildStoryFlow(story).length;
  return {
    key: storyTarget(story.id),
    title: storyTitle(story),
    subtitle: localizedFrom((lang) => translateNs(storiesI18n, lang, 'tab.continueStep', { current: run.stepIndex + 1, total })),
    icon: 'scroll',
    topicArea: 'prophets',
    href: { pathname: '/story/play/[id]', params: { id: story.id } },
    updatedAt: run.updatedAt,
    progress: runProgress(story, run.stepIndex),
  };
}

function recentlyCompleted(): CompletedItem[] {
  const { stories } = useStoriesStore.getState();
  return STORIES.flatMap((story) => {
    const progress = stories[story.id];
    if (!progress?.completed || !progress.completedAt) return [];
    return [
      {
        key: storyTarget(story.id),
        title: storyTitle(story),
        subtitle: tabTitle,
        icon: 'scroll',
        topicArea: 'prophets' as const,
        href: { pathname: '/story/[id]', params: { id: story.id } },
        completedAt: progress.completedAt,
      },
    ];
  });
}

function questCandidates(): QuestCandidate[] {
  const state = useStoriesStore.getState();
  const running = state.run ? getStory(state.run.storyId) : undefined;
  const story = running && !state.stories[running.id]?.completed ? running : nextStory(state.stories, STORIES);
  if (!story) return [];
  return [{ id: `stories-${story.id}`, kind: 'story', target: storyTarget(story.id), title: storyTitle(story), topicArea: 'prophets', priority: 5 }];
}

/** Registers the Stories feature with the core registry. Called once from `src/features/index.ts`. */
export function registerStoriesFeature(): void {
  // 1. Questions – the global review centre and daily challenge render them with QuestionView.
  registerQuestions(STORIES_PREFIX, {
    get: getQuestion,
    context: (id) => {
      const story = storyOfQuestion(id);
      return story ? { title: storyTitle(story), topicArea: 'prophets', icon: 'scroll' } : undefined;
    },
  });

  // 2. Map questions need the story places.
  registerQuestionRenderer('map', { Component: StoryMapQuestion });

  // 3. Progress: badge metrics, knowledge radar, home "Continue" + "Recently completed".
  registerProgress('stories', {
    subscribe: (listener) => useStoriesStore.subscribe(listener),
    metrics: () => storiesMetrics(useStoriesStore.getState(), STORIES),
    topicQuestionKeys: () => ({ prophets: QUESTIONS.map((q) => storiesKey(q.id)) }),
    continueItem,
    recentlyCompleted,
  });

  // 4. Daily challenge: questions of the stories the learner can already open (nothing is spoiled).
  registerDailyPool('stories', () =>
    openStories(useStoriesStore.getState().stories, STORIES).flatMap((s) => s.questions.map((q) => ({ key: storiesKey(q.id), question: q }))),
  );
  registerQuestProvider('stories', questCandidates);

  // 5. Search: stories and the places of the story map.
  registerSearch('stories', searchStories);

  // 6. Profile → story map.
  registerProfileLink({
    id: 'stories-map',
    order: 20,
    icon: 'map',
    label: (lang) => translateNs(storiesI18n, lang, 'profile.storyMap'),
    href: '/story/map',
  });

  // 7. Lifecycle: hydrate at start, reset with "Reset progress", auto-save.
  registerLifecycle('stories', {
    hydrate: () => useStoriesStore.getState().hydrate(),
    reset: () => useStoriesStore.getState().reset(),
    autoSave: startStoriesAutoSave,
  });
  registerStoriesCollection();
}

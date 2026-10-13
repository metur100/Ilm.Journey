/**
 * Merged badge list of all four source apps (duplicates merged):
 *
 * - first_lesson      knowledge-rpg first_lesson + islam-quest first_lesson
 * - first_quest       islam-quest
 * - perfect_score     knowledge-rpg first_perfect_quiz + islam-quest perfect_score + stories perfect_story
 * - knowledge_seeker  knowledge-rpg + stories knowledge_seeker
 * - review_champion   islam-quest review_champion + stories review_master
 * - daily_learner     islam-quest + stories daily_learner
 * - streak_7/30       knowledge-rpg learner_7/30 + islam-quest streak_7/30
 * - salah_scholar …   knowledge-rpg master badges + islam-quest world badges (prayer_explorer, akhlaq_hero, …)
 * - topic_explorer    replaces islam-quest world_explorer (all topics are open from the start)
 * - knowledge_master  knowledge-rpg + islam-quest knowledge_master
 * - story_explorer, history_learner, prophet_explorer, sabr_champion   story-of-the-prophets
 * - first_journey … ten_episodes                                       sira
 * (islam-quest story_seeker is dropped: its prophets world is not ported – the Stories tab covers it.)
 */
export type BadgeId =
  // learning journey (global)
  | 'first_lesson'
  | 'first_quest'
  | 'perfect_score'
  | 'knowledge_seeker'
  | 'review_champion'
  | 'daily_learner'
  | 'streak_7'
  | 'streak_30'
  // topics (learn)
  | 'salah_scholar'
  | 'quran_explorer'
  | 'seerah_explorer'
  | 'akhlaq_champion'
  | 'ramadan_learner'
  | 'arabic_beginner'
  | 'topic_explorer'
  | 'knowledge_master'
  // stories
  | 'story_explorer'
  | 'history_learner'
  | 'prophet_explorer'
  | 'sabr_champion'
  // seerah
  | 'first_journey'
  | 'makkah_explorer'
  | 'madinah_explorer'
  | 'timeline_explorer'
  | 'history_seeker'
  | 'reflective_mind'
  | 'seerah_student'
  | 'ten_episodes';

export type BadgeGroup = 'journey' | 'topics' | 'stories' | 'seerah';

/**
 * Numbers badge rules are evaluated on.
 *
 * Core metrics are computed from the global store. Feature metrics are reported by features through
 * `registerProgress({ metrics })`; values with the same name from several features are summed
 * (e.g. every feature adds its own `perfectRuns`). Boolean conditions are reported as 0/1.
 */
export type BadgeMetric =
  // core (computed from useAppStore)
  | 'correctlyAnswered'
  | 'reviewsCorrect'
  | 'dailyCompleted'
  | 'streakLongest'
  // shared – any feature may contribute
  /** Completed lessons: knowledge-rpg units + islam-quest lessons. */
  | 'lessonsCompleted'
  /** Runs finished without a mistake: units, quests, stories, episode quizzes. */
  | 'perfectRuns'
  // learn
  | 'learn.questsCompleted'
  | 'learn.mastered.salah'
  | 'learn.mastered.quran'
  | 'learn.mastered.seerah'
  | 'learn.mastered.akhlaq'
  | 'learn.mastered.ramadan'
  | 'learn.mastered.arabic'
  /** Topics with a passed Master Challenge (0..8). */
  | 'learn.topicsMastered'
  /** Topics with at least one completed path item (0..8). */
  | 'learn.topicsStarted'
  // stories
  | 'stories.completed'
  /** 1 when every story is completed. */
  | 'stories.allCompleted'
  /** 1 when every lesson about sabr is learned. */
  | 'stories.sabrLessonsLearned'
  // seerah
  | 'seerah.episodesCompleted'
  | 'seerah.makkahCompleted'
  | 'seerah.madinahCompleted'
  | 'seerah.timelineCompleted'
  | 'seerah.peopleCompleted'
  | 'seerah.reflections'
  /** Episodes completed with at least 70 % in the quiz. */
  | 'seerah.episodesPassed'
  | 'seerah.allEpisodesCompleted';

export type BadgeMetrics = Partial<Record<BadgeMetric, number>>;

export interface BadgeDefinition {
  id: BadgeId;
  group: BadgeGroup;
  /** Icon name from core/components/ui/Icon. */
  icon: string;
  color: string;
  /** Earned when `metric >= min`. */
  metric: BadgeMetric;
  min: number;
}

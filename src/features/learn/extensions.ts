import type { Href } from 'expo-router';

import type { Language, LocalizedText, TopicId } from '@/core/models';

/**
 * Extension points of the Learn feature for the islam-quest port (beginner quests and topic tools).
 * The islam-quest port registers its items from its own files (e.g. `features/learn/quests/register.ts`)
 * – it does not need to edit the path or the topic screen.
 */

// ---------- Topic path items ----------

/** Built-in knowledge-rpg unit (order 50). */
export interface UnitPathItem {
  kind: 'unit';
  id: string;
  completed: boolean;
}

/** Built-in Master Challenge at the end of every path (order 100). */
export interface MasterPathItem {
  kind: 'master';
  id: string;
  completed: boolean;
}

/**
 * EXTENSION (islam-quest port): a beginner quest (story/lesson/game/memorization steps).
 * Rendered by the topic screen as a path card that opens `href`.
 */
export interface QuestPathItem {
  kind: 'quest';
  /** Unique inside the topic path. */
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  icon?: string;
  href: Href;
  completed: boolean;
  /** Target reported with `reportQuestEvent({ type: 'complete', target })`, e.g. `quest:salah-wudu`. */
  target: string;
}

/** One entry of a topic's single path: beginner quests → units → master challenge. */
export type TopicPathItem = UnitPathItem | MasterPathItem | QuestPathItem;

export interface PathSource {
  id: string;
  /** Position in the path. Units are at 50 and the master challenge at 100 – beginner quests use 10. */
  order: number;
  /** Items of this source for a topic, in their order. Read your own store synchronously. */
  items(topic: TopicId): QuestPathItem[];
}

const pathSources = new Map<string, PathSource>();

/** EXTENSION: adds items (e.g. islam-quest beginner quests) to the topic paths. */
export function registerPathSource(source: PathSource): void {
  pathSources.set(source.id, source);
}

export function getPathSources(): PathSource[] {
  return [...pathSources.values()].sort((a, b) => a.order - b.order);
}

// ---------- Topic tools ----------

/**
 * A tool shown on a topic page next to the path: Quran → memorization (surah list + Quranic duas),
 * Arabic → alphabet & tracing, Ramadan → 30-day calendar, Prophets → Stories, Seerah → Seerah tab.
 */
export interface TopicTool {
  id: string;
  topic: TopicId;
  order: number;
  icon: string;
  label: (language: Language) => string;
  description?: (language: Language) => string;
  href: Href;
}

const topicTools = new Map<string, TopicTool>();

/** EXTENSION: adds a tool card to a topic page. */
export function registerTopicTool(tool: TopicTool): void {
  topicTools.set(tool.id, tool);
}

export function getTopicTools(topic: TopicId): TopicTool[] {
  return [...topicTools.values()].filter((t) => t.topic === topic).sort((a, b) => a.order - b.order);
}

/** Tests only. */
export function clearLearnExtensionsForTests(): void {
  pathSources.clear();
  topicTools.clear();
}

import type { LessonCardSource } from '@/core/components/lesson/cards';

import type { LessonSection, Unit } from '../models';
import type { QuestLesson } from '../quests/models';
import artMap from './art-map.json';

/**
 * Illustration of every lesson section (`art-map.json`): section id → art library name (`category.name`).
 * Ids: `unit:<unitId>#<index>` for knowledge-rpg unit lessons, `lesson:<lessonId>#<index>` for islam-quest lessons.
 * The art-map test checks that every section has an entry and every name exists in the art library.
 */
export const ART_MAP: Readonly<Record<string, string>> = artMap;

export const unitSectionId = (unitId: string, index: number) => `unit:${unitId}#${index}`;
export const questSectionId = (lessonId: string, index: number) => `lesson:${lessonId}#${index}`;

export const sectionArt = (sectionId: string): string | undefined => ART_MAP[sectionId];

const toSource = (id: string, section: LessonSection): LessonCardSource => ({ ...section, id, art: sectionArt(id) });

/** Card sources of a unit's LEARN step. */
export const unitCardSources = (unit: Unit): LessonCardSource[] => unit.lesson.map((s, i) => toSource(unitSectionId(unit.id, i), s));

/** Card sources of an islam-quest lesson. */
export const questCardSources = (lesson: QuestLesson): LessonCardSource[] =>
  lesson.sections.map((s, i) => toSource(questSectionId(lesson.id, i), s));

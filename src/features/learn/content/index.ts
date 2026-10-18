import { questionKey, type Question, type TopicId } from '@/core/models';

import type { Area, Unit } from '../models';

import akhlaq1 from './akhlaq/akhlaq-sabr-shukr.json';
import akhlaq2 from './akhlaq/akhlaq-honesty-trust.json';
import akhlaq3 from './akhlaq/akhlaq-mercy-family.json';
import arabic1 from './arabic/arabic-words.json';
import arabic2 from './arabic/arabic-phrases.json';
import arabic3 from './arabic/arabic-prayer-words.json';
import areas from './areas.json';
import history1 from './history/history-caliphs.json';
import history2 from './history/history-scholars.json';
import history3 from './history/history-golden-age.json';
import prophets1 from './prophets/prophets-adam-nuh.json';
import prophets2 from './prophets/prophets-ibrahim-musa.json';
import prophets3 from './prophets/prophets-yusuf-yunus-isa.json';
import quran1 from './quran/quran-revelation.json';
import quran2 from './quran/quran-structure.json';
import quran3 from './quran/quran-etiquette.json';
import ramadan1 from './ramadan/ramadan-month.json';
import ramadan2 from './ramadan/ramadan-days-nights.json';
import ramadan3 from './ramadan/ramadan-charity-eid.json';
import salah1 from './salah/salah-basics.json';
import salah2 from './salah/salah-times.json';
import salah3 from './salah/salah-wudu.json';
import seerah1 from './seerah/seerah-early.json';
import seerah2 from './seerah/seerah-makkah.json';
import seerah3 from './seerah/seerah-madinah.json';
import sufara1 from './sufara/arabic-letters.json';
import sufara2 from './sufara/arabic-harakat.json';
import sufara3 from './sufara/arabic-marks.json';

// JSON imports are widened by TypeScript; the content test suite verifies the shape.
export const AREAS: readonly Area[] = (areas as unknown as Area[]).slice().sort((a, b) => a.order - b.order);

export const UNITS: readonly Unit[] = [
  salah1, salah2, salah3,
  quran1, quran2, quran3,
  seerah1, seerah2, seerah3,
  prophets1, prophets2, prophets3,
  akhlaq1, akhlaq2, akhlaq3,
  ramadan1, ramadan2, ramadan3,
  history1, history2, history3,
  sufara1, sufara2, sufara3,
  arabic1, arabic2, arabic3,
].map((u) => u as unknown as Unit);

export const QUESTIONS: readonly Question[] = UNITS.flatMap((u) => u.questions);

const areaMap = new Map(AREAS.map((a) => [a.id, a] as const));
const questionUnit = new Map(UNITS.flatMap((u) => u.questions.map((q) => [q.id, u] as const)));
const unitMap = new Map(UNITS.map((u) => [u.id, u] as const));
const questionMap = new Map(QUESTIONS.map((q) => [q.id, q] as const));

export const getArea = (id: string): Area | undefined => areaMap.get(id as TopicId);
export const getUnit = (id: string): Unit | undefined => unitMap.get(id);
export const getQuestion = (id: string): Question | undefined => questionMap.get(id);

/** The unit a question belongs to. */
export const unitOfQuestion = (questionId: string): Unit | undefined => questionUnit.get(questionId);

export const unitsOfArea = (areaId: TopicId): Unit[] =>
  UNITS.filter((u) => u.areaId === areaId).sort((a, b) => a.order - b.order);

/** Scored (test) questions of an area – the pool for its Master Challenge and knowledge stat. */
export const testQuestionsOfArea = (areaId: TopicId): Question[] =>
  unitsOfArea(areaId).flatMap((u) => u.testIds.map((id) => unitMap.get(u.id)!.questions.find((q) => q.id === id)!));

export const CONTENT = { areas: AREAS, units: UNITS };

/** Global question key prefix of knowledge-rpg unit questions. */
export const LEARN_PREFIX = 'learn';

export const learnKey = (questionId: string) => questionKey(LEARN_PREFIX, questionId);

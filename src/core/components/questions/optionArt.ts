import type { Question, SceneElement } from '@/core/models';

/**
 * Illustrations for answer options (v2 "learn by doing", docs/GAMES.md). Pure mapping, no React:
 * - illustrated options (imageChoice / find) map their `element` through `SCENE_ELEMENT_ART`;
 * - text options only get art when their English text is short and clearly names one thing in `OPTION_ART`.
 *
 * Conservative on purpose: a wrong picture is worse than none. Renderers still check `hasArt(name)` at render time and
 * fall back to the previous rendering while the art library does not contain a piece yet.
 */
export const SCENE_ELEMENT_ART: Partial<Record<SceneElement, string>> = {
  stars: 'scene.stars',
  crescent: 'scene.moon',
  fullMoon: 'scene.moon',
  sun: 'scene.sun',
  mountains: 'place.mountains',
  sea: 'scene.sea',
  river: 'scene.river',
  palms: 'scene.palms',
  garden: 'scene.garden',
  mosque: 'place.masjid',
  kaaba: 'place.kaaba',
  lanterns: 'object.lantern',
  ark: 'object.ark',
  fire: 'object.fire',
  well: 'object.well',
  cave: 'place.cave',
  city: 'place.city',
  whale: 'animal.whale',
  book: 'object.book',
  caravan: 'animal.camel',
  basket: 'object.basket',
  grain: 'object.grain-sack',
  dates: 'food.dates',
  prayerMat: 'object.prayer-mat',
};

interface OptionArtRule {
  art: string;
  /** Whole-word phrases (normalised: lower case, no diacritics/apostrophes) that anywhere in a short option name the thing. */
  words?: string[];
  /** Body parts: the whole option must be just the part ("Face", "Wash the face", "Both feet"), so "Face the qibla" never matches. */
  part?: string[];
}

/** Text keywords (English) → art. */
export const OPTION_ART: readonly OptionArtRule[] = [
  { art: 'object.ark', words: ['ark'] },
  { art: 'object.staff', words: ['staff', 'stick', 'walking stick'] },
  { art: 'object.basket', words: ['basket'] },
  { art: 'object.grain-sack', words: ['grain', 'wheat', 'sack of grain', 'sacks of grain'] },
  { art: 'object.lantern', words: ['lantern', 'lanterns', 'lamp', 'lamps'] },
  { art: 'object.quran-stand', words: ['quran', 'quran stand', 'rehal'] },
  { art: 'object.prayer-mat', words: ['prayer mat', 'prayer rug', 'prayer mats', 'prayer rugs'] },
  { art: 'object.compass', words: ['compass'] },
  { art: 'food.dates', words: ['dates'] },
  { art: 'object.water-jug', words: ['water', 'jug', 'water jug', 'wudu'] },
  { art: 'object.well', words: ['the well', 'a well', 'zamzam'] },
  { art: 'object.fire', words: ['fire'] },
  { art: 'object.book', words: ['book', 'books', 'tawrat', 'torah', 'injil', 'zabur'] },
  { art: 'place.kaaba', words: ['kaaba', 'kaba', 'kaabah', 'kabah'] },
  { art: 'place.masjid', words: ['masjid', 'mosque'] },
  { art: 'place.cave', words: ['cave'] },
  { art: 'place.mountains', words: ['mountain', 'mountains', 'mount'] },
  { art: 'place.city', words: ['city'] },
  { art: 'animal.camel', words: ['camel', 'camels', 'she-camel'] },
  { art: 'animal.sheep', words: ['sheep', 'lamb', 'ram'] },
  { art: 'animal.dove', words: ['dove', 'doves', 'pigeon', 'pigeons'] },
  { art: 'animal.whale', words: ['whale', 'big fish'] },
  { art: 'animal.bird', words: ['bird', 'birds'] },
  { art: 'animal.spider-web', words: ['spider', 'spider web', 'spiders web', 'cobweb'] },
  { art: 'animal.hoopoe', words: ['hoopoe'] },
  { art: 'animal.ant', words: ['ant', 'ants'] },
  { art: 'body.hands', part: ['hand', 'hands'] },
  { art: 'body.mouth', part: ['mouth'] },
  { art: 'body.nose', part: ['nose'] },
  { art: 'body.face', part: ['face'] },
  { art: 'body.arms', part: ['arm', 'arms', 'arms up to the elbows', 'arms to the elbows'] },
  { art: 'body.head', part: ['head'] },
  { art: 'body.ears', part: ['ear', 'ears'] },
  { art: 'body.feet', part: ['foot', 'feet', 'feet up to the ankles', 'feet to the ankles'] },
  { art: 'scene.sea', words: ['sea', 'red sea'] },
  { art: 'scene.river', words: ['river', 'nile'] },
  { art: 'scene.palms', words: ['palm', 'palms', 'palm tree', 'palm trees', 'date palm', 'date palms'] },
  { art: 'scene.garden', words: ['garden', 'gardens'] },
  { art: 'scene.stars', words: ['star', 'stars'] },
  { art: 'scene.moon', words: ['moon', 'crescent', 'new moon', 'full moon'] },
  { art: 'scene.sun', words: ['sun'] },
];

/** Longer options are sentences; pictures would only be guesses there. */
const MAX_WORDS = 4;

const BODY_PREFIX = /^(?:(?:wash|washing|wipe|wiping|rinse|rinsing|clean|cleaning)\s+)?(?:(?:the|your|both|right|left|his|her)\s+)*/;

/** Lower case, no diacritics, apostrophes/ayn/hamza marks removed, punctuation → spaces. */
export function normaliseOptionText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[ʿʾ'’‘`´]/g, '')
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function containsPhrase(text: string, phrase: string): boolean {
  return ` ${text} `.includes(` ${phrase} `);
}

/** Art for a free-text option (English), or undefined when it is not clear-cut. Ambiguous text (two arts) → undefined. */
export function artForText(englishText: string): string | undefined {
  const text = normaliseOptionText(englishText);
  if (!text || text.split(' ').length > MAX_WORDS) return undefined;
  const bodyText = text.replace(BODY_PREFIX, '');
  const found = new Set<string>();
  for (const rule of OPTION_ART) {
    if (rule.words?.some((w) => containsPhrase(text, w))) found.add(rule.art);
    if (rule.part?.some((p) => bodyText === p)) found.add(rule.art);
  }
  return found.size === 1 ? [...found][0] : undefined;
}

/** Art for one option / item of a question, or undefined. */
export function artForOption(question: Question, optionId: string): string | undefined {
  switch (question.type) {
    case 'imageChoice': {
      const option = question.options.find((o) => o.id === optionId);
      return option ? SCENE_ELEMENT_ART[option.element] : undefined;
    }
    case 'find': {
      const item = question.items.find((i) => i.id === optionId);
      return item ? SCENE_ELEMENT_ART[item.element] : undefined;
    }
    case 'multipleChoice':
    case 'lessonChoice':
    case 'scenario':
    case 'fillBlank': {
      const options: readonly { id: string; text: { en: string } }[] = question.options;
      const option = options.find((o) => o.id === optionId);
      return option ? artForText(option.text.en) : undefined;
    }
    case 'ordering':
    case 'categorize': {
      const items: readonly { id: string; text: { en: string } }[] = question.items;
      const item = items.find((i) => i.id === optionId);
      return item ? artForText(item.text.en) : undefined;
    }
    default:
      return undefined;
  }
}

/** Every art name this module can return (checked against the art library by a test). */
export const QUESTION_ART_NAMES: string[] = [
  ...new Set([...Object.values(SCENE_ELEMENT_ART).filter((n): n is string => !!n), ...OPTION_ART.map((r) => r.art)]),
].sort();

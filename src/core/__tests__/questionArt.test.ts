import { catalogue, hasArt } from '@/core/art';
import {
  artForOption,
  artForText,
  OPTION_ART,
  QUESTION_ART_NAMES,
  SCENE_ELEMENT_ART,
} from '@/core/components/questions/optionArt';
import type { Question, SceneElement } from '@/core/models';

const text = (en: string) => ({ en, de: en, bs: en });
const base = { id: 'q', topic: 't', prompt: text('?'), explanation: text('.') };

/** Art names agreed with the art library (docs/GAMES.md "Art library"). */
const LIBRARY_NAMES = new Set([
  'object.ark', 'object.staff', 'object.basket', 'object.grain-sack', 'object.lantern', 'object.quran-stand',
  'object.prayer-mat', 'object.compass', 'object.dates', 'object.water-jug', 'object.well', 'object.fire', 'object.book',
  'place.kaaba', 'place.masjid', 'place.cave', 'place.mountains', 'place.city', 'place.well',
  'animal.camel', 'animal.sheep', 'animal.dove', 'animal.whale', 'animal.bird', 'animal.spider-web', 'animal.hoopoe',
  'animal.ant', 'body.hands', 'body.mouth', 'body.nose', 'body.face', 'body.arms', 'body.head', 'body.ears', 'body.feet',
  'food.dates', 'scene.sea', 'scene.river', 'scene.palms', 'scene.garden', 'scene.stars', 'scene.moon', 'scene.sun',
]);

describe('optionArt', () => {
  it('maps illustrated options and find items through their scene element', () => {
    const imageChoice: Question = {
      ...base,
      type: 'imageChoice',
      options: [
        { id: 'a', element: 'ark', label: text('Ark') },
        { id: 'b', element: 'kaaba', label: text('Kaaba') },
        { id: 'c', element: 'clouds', label: text('Clouds') },
      ],
      correctOptionId: 'a',
    };
    expect(artForOption(imageChoice, 'a')).toBe('object.ark');
    expect(artForOption(imageChoice, 'b')).toBe('place.kaaba');
    expect(artForOption(imageChoice, 'c')).toBeUndefined();
    expect(artForOption(imageChoice, 'missing')).toBeUndefined();

    const find: Question = {
      ...base,
      type: 'find',
      items: [
        { id: 'w', element: 'whale', label: text('Whale') },
        { id: 'm', element: 'mosque', label: text('Mosque') },
        { id: 'p', element: 'pattern', label: text('Pattern') },
      ],
      correctIds: ['w'],
    };
    expect(artForOption(find, 'w')).toBe('animal.whale');
    expect(artForOption(find, 'm')).toBe('place.masjid');
    expect(artForOption(find, 'p')).toBeUndefined();
  });

  it('maps every mapped scene element to a library-style name', () => {
    const elements = Object.keys(SCENE_ELEMENT_ART) as SceneElement[];
    expect(elements.length).toBeGreaterThan(10);
    for (const element of elements) expect(SCENE_ELEMENT_ART[element]).toMatch(/^[a-z]+\.[a-z]+(-[a-z]+)*$/);
  });

  it('gives text options art only when they clearly name one thing', () => {
    expect(artForText('The ark')).toBe('object.ark');
    expect(artForText("Noah's Ark")).toBe('object.ark');
    expect(artForText('Kaʿba')).toBe('place.kaaba');
    expect(artForText('Dates')).toBe('food.dates');
    expect(artForText('A camel')).toBe('animal.camel');
    expect(artForText('Prayer mat')).toBe('object.prayer-mat');
    expect(artForText('Face')).toBe('body.face');
    expect(artForText('Wash the face')).toBe('body.face');
    expect(artForText('Both feet')).toBe('body.feet');
    expect(artForText('Cave of Hira')).toBe('place.cave');

    // Not clear-cut → no picture.
    expect(artForText('Face the qibla')).toBeUndefined();
    expect(artForText('Very well')).toBeUndefined();
    expect(artForText('Dates and water')).toBeUndefined();
    expect(artForText('He hid in the cave with his companion')).toBeUndefined();
    expect(artForText('Sunrise')).toBeUndefined();
    expect(artForText('Ramadan')).toBeUndefined();
    expect(artForText('Patience')).toBeUndefined();
    expect(artForText('')).toBeUndefined();
  });

  it('maps text options of choice, fill-in, ordering and categorize questions; unknown types and ids → undefined', () => {
    const options = [
      { id: 'a', text: text('Hands') },
      { id: 'b', text: text('Honesty') },
    ];
    const choice: Question = { ...base, type: 'multipleChoice', options, correctOptionId: 'a' };
    expect(artForOption(choice, 'a')).toBe('body.hands');
    expect(artForOption(choice, 'b')).toBeUndefined();
    expect(artForOption(choice, 'zzz')).toBeUndefined();

    const fill: Question = { ...base, type: 'fillBlank', sentence: text('Nuh built an ___'), options, correctOptionId: 'a' };
    expect(artForOption(fill, 'a')).toBe('body.hands');

    const ordering: Question = { ...base, type: 'ordering', items: [{ id: 'x', text: text('Nose') }] };
    expect(artForOption(ordering, 'x')).toBe('body.nose');

    const categorize: Question = {
      ...base,
      type: 'categorize',
      categories: [{ id: 'c', label: text('Animals') }],
      items: [{ id: 'h', text: text('Hoopoe'), categoryId: 'c' }],
    };
    expect(artForOption(categorize, 'h')).toBe('animal.hoopoe');

    const trueFalse: Question = { ...base, type: 'trueFalse', correct: true };
    expect(artForOption(trueFalse, 'a')).toBeUndefined();
  });

  it('lists every name it can return in QUESTION_ART_NAMES, all from the art library naming list', () => {
    const returnable = new Set([...Object.values(SCENE_ELEMENT_ART), ...OPTION_ART.map((r) => r.art)]);
    for (const name of returnable) expect(QUESTION_ART_NAMES).toContain(name);
    expect(new Set(QUESTION_ART_NAMES).size).toBe(QUESTION_ART_NAMES.length);
    for (const name of QUESTION_ART_NAMES) expect({ name, known: LIBRARY_NAMES.has(name) }).toEqual({ name, known: true });
  });

  it('only uses names that exist in the art library (active once the library has pieces)', () => {
    if (Object.keys(catalogue).length > 0) {
      for (const name of QUESTION_ART_NAMES) expect({ name, exists: hasArt(name) }).toEqual({ name, exists: true });
    }
  });
});

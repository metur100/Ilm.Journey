import { catalogue, hasArt } from '@/core/art';
import { TOPIC_FALLBACK_ART } from '@/core/components/lesson/cards';
import { UNITS } from '@/features/learn/content';
import { ART_MAP, questSectionId, unitSectionId } from '@/features/learn/content/artMap';
import { LESSONS } from '@/features/learn/content/quests';

/** Art names the lesson sections may use (docs/GAMES.md art library naming scheme `category.name`). */
const ALLOWED = new Set([
  'sky.dawn', 'sky.noon', 'sky.sunset', 'sky.night', 'scene.desert', 'place.sea', 'place.river', 'scene.mountains',
  'scene.garden-backdrop', 'scene.city', 'place.kaaba', 'garden.masjid-small', 'place.masjid-nabawi', 'place.cave-hira', 'place.cave-thawr',
  'scene.mountains', 'object.well', 'place.city-generic', 'garden.minaret', 'object.ark', 'object.staff', 'object.basket',
  'object.grain-sack', 'object.lantern', 'object.quran-stand', 'object.prayer-mat', 'object.compass', 'object.dates',
  'object.water-jug', 'object.book', 'object.scroll', 'object.pen', 'object.coins', 'object.lantern-ramadan', 'object.clock',
  'animal.camel', 'animal.sheep', 'animal.dove', 'animal.whale', 'animal.birds', 'object.spider-web', 'animal.hoopoe',
  'animal.ant', 'body.hands', 'body.mouth', 'body.nose', 'body.face', 'body.arms', 'body.head', 'body.ears', 'body.feet',
  'food.dates', 'food.water', 'food.bread', 'ui.star-filled', 'ui.heart', 'pattern.star-tile',
]);

const SECTION_IDS = [
  ...UNITS.flatMap((u) => u.lesson.map((_, i) => unitSectionId(u.id, i))),
  ...LESSONS.flatMap((l) => l.sections.map((_, i) => questSectionId(l.id, i))),
];

describe('lesson art map', () => {
  it('has an illustration for every lesson section', () => {
    expect(SECTION_IDS.filter((id) => !ART_MAP[id])).toEqual([]);
  });

  it('has no stale entries', () => {
    const known = new Set(SECTION_IDS);
    expect(Object.keys(ART_MAP).filter((id) => !known.has(id))).toEqual([]);
  });

  it('uses only names from the allowed art list', () => {
    const names = [...Object.values(ART_MAP), ...Object.values(TOPIC_FALLBACK_ART)];
    expect(names.filter((name) => !ALLOWED.has(name))).toEqual([]);
  });

  it('only references art that exists in the library (once the library is filled)', () => {
    if (Object.keys(catalogue).length > 0) {
      const names = new Set([...Object.values(ART_MAP), ...Object.values(TOPIC_FALLBACK_ART)]);
      expect([...names].filter((name) => !hasArt(name))).toEqual([]);
    }
  });
});

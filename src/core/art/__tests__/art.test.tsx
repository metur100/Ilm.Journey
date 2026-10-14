import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { ArabicLetterCard, Art, artAspect, artNames, catalogue, hasArt, HIJAZ_POINTS, projectWorld, SKY_SUN, svgString } from '../index';

/** Names other features rely on (docs/GAMES.md art library brief). */
const REQUIRED: Record<string, string[]> = {
  garden: ['palm', 'olive', 'fig', 'pomegranate', 'lemon', 'date-palm-young', 'sapling', 'bush', 'flower-rose', 'flower-tulip', 'flower-jasmine', 'flower-lily', 'grass', 'fountain', 'stream', 'pond', 'bench', 'lantern-post', 'arch', 'masjid-small', 'minaret', 'bird', 'dove', 'bee', 'butterfly', 'beehive', 'path-stone', 'rock', 'fence', 'gate', 'sun', 'moon', 'stars', 'cloud', 'watering-can', 'seed', 'water-drop', 'sprout', 'thirsty-plant'],
  place: ['kaaba', 'masjid-haram', 'masjid-nabawi', 'masjid-nabawi-early', 'masjid-aqsa', 'cave-hira', 'cave-thawr', 'mount-judi', 'mount-uhud', 'mount-sinai', 'makkah-city', 'madinah-city', 'taif', 'badr-wells', 'well-zamzam', 'desert-road', 'oasis', 'nile', 'sea', 'river', 'valley', 'city-generic', 'village', 'house', 'market'],
  object: ['ark', 'staff', 'basket', 'grain-sack', 'storehouse', 'scales', 'lantern', 'lamp', 'quran-stand', 'book', 'scroll', 'pen', 'inkwell', 'prayer-mat', 'prayer-beads', 'compass', 'qibla-arrow', 'kaaba-icon', 'clock', 'sundial', 'water-jug', 'cup', 'dates', 'bread', 'milk', 'honey', 'fire', 'tent', 'camel-saddle', 'rope', 'spider-web', 'dove-nest', 'well-bucket', 'coins', 'coin-jar', 'gift', 'envelope', 'key', 'shield', 'crescent', 'star8', 'lantern-ramadan', 'plate', 'bowl'],
  animal: ['camel', 'she-camel', 'sheep', 'goat', 'horse', 'donkey', 'cow', 'lion', 'elephant', 'dove', 'pigeon', 'hoopoe', 'crow', 'ant', 'bee', 'spider', 'fish', 'whale', 'frog', 'cat', 'birds', 'ox', 'rooster'],
  body: ['hands', 'mouth', 'nose', 'face', 'arms', 'head', 'ears', 'feet', 'water-on-hands'],
  pose: ['standing', 'bowing', 'prostrating', 'sitting'],
  food: ['dates', 'water', 'soup', 'bread', 'rice', 'fruit-bowl', 'milk', 'olives'],
  sky: ['dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night'],
  scene: ['desert', 'mountains', 'sea-coast', 'garden-backdrop', 'map-world-simple', 'map-hijaz'],
  ui: ['star-filled', 'star-empty', 'seed', 'water-drop', 'sparkle', 'trophy', 'badge-frame', 'card-frame', 'lock', 'check', 'confetti-piece', 'level-up-ribbon'],
  pattern: ['star-tile', 'arabesque-border', 'mashrabiya', 'geometric-bg'],
};

const NAME = /^(garden|place|object|animal|body|pose|food|sky|scene|ui|pattern)\.[a-z0-9]+(-[a-z0-9]+)*$/;

function render(el: React.ReactElement): ReactTestRenderer {
  let r: ReactTestRenderer | undefined;
  act(() => {
    r = create(el);
  });
  return r as ReactTestRenderer;
}

describe('art library', () => {
  it('has at least 150 pieces and every required name', () => {
    expect(artNames.length).toBeGreaterThanOrEqual(150);
    const missing = Object.entries(REQUIRED).flatMap(([cat, keys]) => keys.map((k) => `${cat}.${k}`)).filter((n) => !hasArt(n));
    expect(missing).toEqual([]);
  });

  it('names follow the category pattern and aspects are sensible', () => {
    for (const name of artNames) {
      expect(name).toMatch(NAME);
      const { aspect } = catalogue[name];
      expect(Number.isFinite(aspect)).toBe(true);
      expect(aspect).toBeGreaterThan(0);
      expect(artAspect(name)).toBe(aspect);
    }
  });

  it('hasArt distinguishes known and unknown names', () => {
    expect(hasArt('object.ark')).toBe(true);
    expect(hasArt('object.nope')).toBe(false);
    expect(hasArt('toString')).toBe(false);
  });

  it.each(artNames)('%s renders in light and dark', (name) => {
    for (const dark of [false, true]) {
      const r = render(<Art name={name} size={96} dark={dark} />);
      expect(r.toJSON()).toBeTruthy();
      act(() => r.unmount());
    }
  });

  it('serialises every piece to SVG without any text element', () => {
    for (const name of artNames) {
      for (const dark of [false, true]) {
        const svg = svgString(name, { dark });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).not.toMatch(/<text|<tspan/);
      }
    }
  });

  it('applies tint and thirsty options', () => {
    expect(svgString('body.hands', { tint: '#123456' })).toContain('#123456');
    expect(svgString('garden.olive', { thirsty: true })).not.toEqual(svgString('garden.olive'));
  });

  it('renders an empty box for unknown names', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const r = render(<Art name="object.unknown-thing" size={40} />);
    const json = r.toJSON();
    expect(json).toBeTruthy();
    expect(Array.isArray(json) ? json : json?.children ?? null).toBeNull();
    warn.mockRestore();
  });

  it('renders the Arabic letter card as text', () => {
    const r = render(<ArabicLetterCard letter="ب" size={100} tone="teal" />);
    expect(JSON.stringify(r.toJSON())).toContain('ب');
  });

  it('exposes geometry helpers for the games', () => {
    expect(SKY_SUN.noon.y).toBeLessThan(SKY_SUN.afternoon.y);
    expect(SKY_SUN.morning.x).toBeLessThan(SKY_SUN.sunset.x);
    expect(HIJAZ_POINTS.madinah.y).toBeLessThan(HIJAZ_POINTS.makkah.y);
    const m = projectWorld(39.8, 21.4);
    expect(m.x).toBeGreaterThan(200);
    expect(m.y).toBeGreaterThan(0);
  });
});

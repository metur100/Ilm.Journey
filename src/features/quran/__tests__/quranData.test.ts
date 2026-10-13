import * as fs from 'fs';
import * as path from 'path';

import {
  audioUrlForAyah,
  ayahWords,
  BASMALA,
  duasByTheme,
  getAyah,
  getSurah,
  listDuas,
  listSurahs,
  QURAN_LANGUAGES,
  QURAN_SOURCE,
} from '@/features/quran';

/** Standard (Hafs) ayah counts — an independent check of what the generator received from the API. */
const EXPECTED_AYAH_COUNTS: Record<number, number> = {
  1: 7,
  78: 40, 79: 46, 80: 42, 81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19,
  88: 26, 89: 30, 90: 20, 91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5,
  98: 8, 99: 8, 100: 11, 101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7,
  108: 3, 109: 6, 110: 3, 111: 5, 112: 4, 113: 5, 114: 6,
};

/** Ayah counts of the surahs the duas come from (standard Hafs numbering). */
const DUA_SURAH_AYAH_COUNTS: Record<number, number> = {
  2: 286, 3: 200, 7: 206, 10: 109, 14: 52, 17: 111, 18: 110, 20: 135, 21: 112, 23: 118, 25: 77,
  27: 93, 28: 88, 46: 35, 59: 24, 66: 12,
};

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SIBLING_SURAHS = path.join(REPO_ROOT, '..', 'islam-quest', 'src', 'data', 'quran', 'surahs.json');
const ISLAM_QUEST_FIELDS = ['number', 'nameArabic', 'nameTransliterated', 'nameMeaning', 'revelationType', 'ayahCount', 'ayahs'] as const;

function expectComplete(label: string, ayah: { arabic: string; transliteration: string; translation: Record<string, string> }) {
  expect({ label, arabic: ayahWords(ayah.arabic).length > 0 }).toEqual({ label, arabic: true });
  expect({ label, transliteration: ayah.transliteration.trim().length > 0 }).toEqual({ label, transliteration: true });
  for (const lang of QURAN_LANGUAGES) {
    expect({ label, lang, ok: (ayah.translation[lang] ?? '').trim().length > 0 }).toEqual({ label, lang, ok: true });
  }
  expect(/\uFEFF/.test(JSON.stringify(ayah))).toBe(false);
}

describe('Quran surahs', () => {
  const surahs = listSurahs();

  it('contains Al-Fatiha and the complete Juz ʿAmma (38 surahs) in mushaf order', () => {
    expect(surahs).toHaveLength(38);
    expect(surahs.map((s) => s.number)).toEqual(Object.keys(EXPECTED_AYAH_COUNTS).map(Number));
  });

  it('has the right number of ayahs, numbered consecutively', () => {
    for (const s of surahs) {
      expect([s.number, s.ayahCount, s.ayahs.length]).toEqual([s.number, EXPECTED_AYAH_COUNTS[s.number], EXPECTED_AYAH_COUNTS[s.number]]);
      s.ayahs.forEach((a, i) => expect(a.numberInSurah).toBe(i + 1));
    }
    expect(surahs.reduce((n, s) => n + s.ayahs.length, 0)).toBe(571);
  });

  it('has consecutive global ayah numbers (Juz ʿAmma = 5673–6236)', () => {
    expect(getAyah(1, 1)?.globalNumber).toBe(1);
    const juzAmma = surahs.filter((s) => s.number >= 78).flatMap((s) => s.ayahs.map((a) => a.globalNumber));
    expect(juzAmma[0]).toBe(5673);
    juzAmma.forEach((g, i) => expect(g).toBe(5673 + i));
    expect(juzAmma[juzAmma.length - 1]).toBe(6236);
  });

  it('has Arabic, transliteration and all three translations for every ayah', () => {
    for (const s of surahs) for (const a of s.ayahs) expectComplete(`${s.number}:${a.numberInSurah}`, a);
  });

  it('keeps the Basmala as ayah 1 of Al-Fatiha only', () => {
    expect(getAyah(1, 1)?.arabic).toBe(BASMALA);
    // Compare words 2–4 only: in a few surahs the source marks the first letter differently (e.g. 95, 97).
    const basmalaTail = BASMALA.split(' ').slice(1).join(' ');
    for (const s of surahs.filter((x) => x.number !== 1)) {
      const startsWithBasmala = s.ayahs[0].arabic.split(' ').slice(1, 4).join(' ') === basmalaTail;
      expect({ surah: s.number, startsWithBasmala }).toEqual({
        surah: s.number,
        startsWithBasmala: false,
      });
    }
  });

  it('has names, metadata and memorisation hints', () => {
    for (const s of surahs) {
      expect(s.nameArabic.length).toBeGreaterThan(0);
      expect(s.nameTransliterated.length).toBeGreaterThan(0);
      expect(s.nameMeaning.length).toBeGreaterThan(0);
      for (const lang of QURAN_LANGUAGES) expect(s.nameMeaningLocalized?.[lang]?.length).toBeGreaterThan(0);
      expect(['makki', 'madani']).toContain(s.revelationType);
      expect(s.juz).toBe(s.number === 1 ? 1 : 30);
      expect(['easy', 'medium', 'hard']).toContain(s.difficulty);
    }
    const order = listSurahs('memorization');
    expect(order.map((s) => s.memorizationOrder)).toEqual(surahs.map((_, i) => i + 1));
    expect(order[0].number).toBe(1);
    expect(QURAN_SOURCE.translations).toEqual({ en: 'Saheeh International', de: 'Frank Bubenheim & Nadeem Elyas', bs: 'Besim Korkut' });
  });

  it('matches islam-quest for the overlapping surahs', () => {
    if (!fs.existsSync(SIBLING_SURAHS)) {
      console.warn(`islam-quest not found at ${SIBLING_SURAHS}; skipping the cross-app check`);
      return;
    }
    const sibling = JSON.parse(fs.readFileSync(SIBLING_SURAHS, 'utf8')) as {
      basmala: string;
      surahs: Record<(typeof ISLAM_QUEST_FIELDS)[number], unknown>[];
    };
    expect(BASMALA).toBe(sibling.basmala);
    expect(sibling.surahs.map((s) => s.number)).toEqual([1, 103, 108, 112, 113, 114]);
    for (const theirs of sibling.surahs) {
      const ours = getSurah(theirs.number as number);
      expect(ours).toBeDefined();
      for (const field of ISLAM_QUEST_FIELDS) {
        expect(JSON.stringify(ours?.[field])).toBe(JSON.stringify(theirs[field]));
      }
    }
  });
});

describe('Quranic duas', () => {
  const duas = listDuas();

  it('has about 25 duas with unique ids', () => {
    expect(duas.length).toBeGreaterThanOrEqual(20);
    expect(duas.length).toBeLessThanOrEqual(30);
    expect(new Set(duas.map((d) => d.id)).size).toBe(duas.length);
    expect(new Set(duas.map((d) => d.ref)).size).toBe(duas.length);
  });

  it('references existing, consecutive ayahs that match the ref', () => {
    for (const d of duas) {
      const max = DUA_SURAH_AYAH_COUNTS[d.surah.number];
      expect({ id: d.id, knownSurah: max !== undefined }).toEqual({ id: d.id, knownSurah: true });
      expect(d.surah.ayahCount).toBe(max);
      expect(d.ayahs.length).toBeGreaterThan(0);
      d.ayahs.forEach((a, i) => {
        expect(a.surah).toBe(d.surah.number);
        expect(a.numberInSurah).toBeGreaterThanOrEqual(1);
        expect(a.numberInSurah).toBeLessThanOrEqual(max);
        if (i > 0) {
          expect(a.numberInSurah).toBe(d.ayahs[i - 1].numberInSurah + 1);
          expect(a.globalNumber).toBe(d.ayahs[i - 1].globalNumber + 1);
        }
        expectComplete(`${d.id} ${a.surah}:${a.numberInSurah}`, a);
      });
      const first = d.ayahs[0].numberInSurah;
      const last = d.ayahs[d.ayahs.length - 1].numberInSurah;
      const ref = first === last ? `${d.surah.number}:${first}` : `${d.surah.number}:${first}-${last}`;
      expect(d.ref).toBe(ref);
      expect(d.sourceName).toBe("Qur'an");
      expect(d.sourceReference).toBe(ref);
    }
  });

  it('has a title and context in all three languages', () => {
    for (const d of duas) {
      for (const lang of QURAN_LANGUAGES) {
        expect({ id: d.id, lang, title: d.title[lang].length > 0 }).toEqual({ id: d.id, lang, title: true });
        expect({ id: d.id, lang, context: d.context[lang].endsWith(`${d.ref}).`) }).toEqual({ id: d.id, lang, context: true });
      }
    }
  });

  it('groups every dua under its theme', () => {
    const groups = duasByTheme();
    expect(Object.values(groups).reduce((n, list) => n + (list?.length ?? 0), 0)).toBe(duas.length);
    for (const d of duas) expect(groups[d.theme]).toContain(d);
  });
});

describe('recitation audio', () => {
  it('uses the same stream as islam-quest', () => {
    expect(audioUrlForAyah(6236)).toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3');
    expect(() => audioUrlForAyah(0)).toThrow(RangeError);
    expect(() => audioUrlForAyah(6237)).toThrow(RangeError);
  });
});

/**
 * Content rule (docs/GAMES-V3.md §2): truths are stated directly. Content never frames them as somebody's
 * opinion ("Muslims believe …", "Muslime glauben …", "Muslimani vjeruju …", "according to Islam", "for Muslims").
 * Historical sentences with "the Muslims" as subject ("The Muslims migrated to Madinah") stay allowed.
 *
 * This test scans every content and i18n file under src/ (JSON and TS/TSX, without tests and without the generated
 * Quran data, whose translations are quoted verbatim) for the forbidden belief-attribution patterns.
 */
import * as fs from 'fs';
import * as path from 'path';

import { findForbiddenPhrases } from '../i18n/phrasing';

const SRC = path.resolve(__dirname, '..', '..');

/** Generated or quoted text that must not be rewritten. */
const SKIP_DIRS = [path.join('features', 'quran', 'data'), '__tests__', '__mocks__'];
/** The pattern definitions themselves (they spell out the phrases they forbid). */
const SKIP_FILES = [path.join('core', 'i18n', 'phrasing.ts')];

function contentFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(SRC, full);
    if (SKIP_DIRS.some((skip) => rel === skip || rel.startsWith(skip + path.sep) || entry.name === skip)) continue;
    if (SKIP_FILES.includes(rel)) continue;
    if (entry.isDirectory()) contentFiles(full, out);
    else if (/\.(json|tsx?)$/.test(entry.name) && !/\.(test|d)\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('content phrasing (GAMES-V3 §2: state truths directly)', () => {
  it('the patterns catch the forbidden phrasings in all three languages', () => {
    const bad = [
      'Muslims believe the Quran is the word of Allah.',
      'For Muslims, the Kaaba is the qibla.',
      'According to Islamic belief, Allah is One.',
      'Islam teaches us to be patient.',
      'Muslime glauben, dass der Koran das Wort Allahs ist.',
      'Für Muslime ist die Kaaba die Qibla.',
      'Nach islamischem Glauben ist Allah einer.',
      'Muslimani vjeruju da je Kur’an Allahov govor.',
      'Za muslimane je Kaba kibla.',
      'Prema islamskom vjerovanju Allah je jedan.',
      'Muslims everywhere face the Kaaba in Makkah when they pray.',
      'Fasting in Ramadan is an obligation for adult Muslims.',
      'Why do Muslims pray?',
      'Muslime geben Sadaqa und teilen den Iftar.',
      'Warum beten Muslime?',
      'Muslimani zajedno klanjaju bajram-namaz.',
      'Post je obaveza za odrasle muslimane.',
    ];
    for (const s of bad) expect({ s, hits: findForbiddenPhrases(s).length > 0 }).toEqual({ s, hits: true });
  });

  it('historical facts and instructions with Muslims as the subject stay allowed', () => {
    const ok = [
      'The Muslims migrated to Madinah in small groups.',
      'The first Muslims believed because they knew him.',
      'In the early years in Madinah, Muslims prayed towards Bayt al-Maqdis.',
      'At Badr the Muslims were few but united.',
      'Die Muslime hoben einen Graben aus.',
      'Die ersten Muslime glaubten, weil sie ihn kannten.',
      'Muslimani su iskopali hendek.',
      'Muslimani su klanjali prema Jerusalemu.',
      'Die Muslime beteten zuerst in Richtung Jerusalem.',
      'Kršćanski kralj zaštitio je progonjene muslimane.',
      'Sahih Muslim 1218',
    ];
    for (const s of ok) expect({ s, hits: findForbiddenPhrases(s) }).toEqual({ s, hits: [] });
  });

  it('no content or i18n file frames a truth as "Muslims believe …"', () => {
    const files = contentFiles(SRC);
    expect(files.length).toBeGreaterThan(50);
    const problems: string[] = [];
    for (const file of files) {
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const hit of findForbiddenPhrases(line)) {
          problems.push(`${path.relative(SRC, file)}:${i + 1} [${hit.lang}] “${hit.match}”`);
        }
      });
    }
    expect(problems).toEqual([]);
  });
});

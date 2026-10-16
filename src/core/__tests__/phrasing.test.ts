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

const SRC = path.resolve(__dirname, '..', '..');

/** Generated or quoted text that must not be rewritten. */
const SKIP_DIRS = [path.join('features', 'quran', 'data'), '__tests__', '__mocks__'];

// `(?<!\p{L})` / `(?!\p{L})` are word boundaries that also work for ü, č, ž …
const B = '(?<!\\p{L})';
const E = '(?!\\p{L})';
const rx = (body: string) => new RegExp(`${B}(?:${body})${E}`, 'iu');

const FORBIDDEN_PHRASES: { lang: 'en' | 'de' | 'bs'; pattern: RegExp }[] = [
  // English
  {
    lang: 'en',
    pattern: rx(
      'muslims? (?:believe|believes|think|thinks|say|says|consider|considers|hold|holds|regard|regards|see|sees|feel|feels|are taught|are told|accept|accepts)',
    ),
  },
  { lang: 'en', pattern: rx('(?:it is|is|are) believed(?: by muslims)?(?: that| to)') },
  { lang: 'en', pattern: rx('for muslims') },
  { lang: 'en', pattern: rx('according to (?:islam|islamic|muslim)(?: belief| tradition| teaching)?') },
  { lang: 'en', pattern: rx('(?:muslim|islamic) (?:belief|faith) (?:says|holds|teaches)') },
  { lang: 'en', pattern: rx('islam teaches') },
  { lang: 'en', pattern: rx('in (?:islamic|muslim) (?:tradition|belief)') },
  { lang: 'en', pattern: rx('in islam,? (?:it is|people) (?:believe|believed|say|said)') },
  // German
  {
    lang: 'de',
    pattern: rx('muslime (?:glauben|sagen|denken|meinen|halten|sehen|betrachten|lernen, dass|sind überzeugt)'),
  },
  { lang: 'de', pattern: rx('(?:ein )?muslim glaubt') },
  { lang: 'de', pattern: rx('für muslime') },
  { lang: 'de', pattern: rx('nach (?:muslimischem|islamischem) (?:glauben|verständnis)') },
  { lang: 'de', pattern: rx('(?:im islam|laut (?:dem )?islam) glaubt man') },
  { lang: 'de', pattern: rx('laut (?:dem )?islam') },
  { lang: 'de', pattern: rx('der islam lehrt') },
  { lang: 'de', pattern: rx('in der (?:islamischen|muslimischen) (?:überlieferung|tradition|glaubenslehre)') },
  // Bosnian
  {
    lang: 'bs',
    pattern: rx('muslimani (?:vjeruju|smatraju|kažu|misle|drže|tvrde|vide)'),
  },
  { lang: 'bs', pattern: rx('musliman (?:vjeruje|smatra|misli)') },
  { lang: 'bs', pattern: rx('za muslimane') },
  { lang: 'bs', pattern: rx('prema (?:islamskom|muslimanskom) (?:vjerovanju|učenju|shvatanju)') },
  { lang: 'bs', pattern: rx('prema islamu|po islamu') },
  { lang: 'bs', pattern: rx('islam (?:nas )?uči') },
  { lang: 'bs', pattern: rx('u (?:islamskoj|muslimanskoj) (?:predaji|tradiciji)') },
  { lang: 'bs', pattern: rx('vjeruje se da') },
  // "Muslims this, Muslims that": present-tense descriptions of practice from the outside. Write "we …" or an
  // impersonal sentence instead. Historical narration in the past tense ("The Muslims prayed / migrated …") stays.
  {
    lang: 'en',
    pattern: rx(
      'muslims (?:all over the world |everywhere |around the world )?(?:pray|face|fast|give|recite|perform|gather|speak up|say|try|celebrate|follow|practise|practice|read|learn|wear)',
    ),
  },
  { lang: 'en', pattern: rx('(?:do|should|must|can) muslims|for (?:adult |all |every )?muslims|(?:a|every) muslim(?:\'s|’s)|the muslim (?:greeting|community lives)') },
  {
    lang: 'de',
    pattern: rx('muslime (?:auf der ganzen welt |überall )?(?:beten|fasten|geben|rezitieren|richten sich|versammeln sich|setzen sich|feiern|lesen|folgen|sprechen|sagen|versuchen)'),
  },
  { lang: 'de', pattern: rx('(?:beten|fasten|wenden sich|versammeln sich) muslime|für (?:erwachsene |alle )?muslime|den tag eines muslims') },
  {
    lang: 'bs',
    pattern: rx('muslimani (?:širom svijeta |svugdje |zajedno )?(?:klanjaju|poste|daju|uče|dijele|se okreću|se okupljaju|se zalažu|prakticiraju|izgovaraju)'),
  },
  { lang: 'bs', pattern: rx('za (?:odrasle |sve )?muslimane|zašto muslimani|dan muslimana') },
];

function contentFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(SRC, full);
    if (SKIP_DIRS.some((skip) => rel === skip || rel.startsWith(skip + path.sep) || entry.name === skip)) continue;
    if (entry.isDirectory()) contentFiles(full, out);
    else if (/\.(json|tsx?)$/.test(entry.name) && !/\.(test|d)\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findForbiddenPhrases(text: string): { lang: string; match: string }[] {
  const hits: { lang: string; match: string }[] = [];
  for (const { lang, pattern } of FORBIDDEN_PHRASES) {
    const m = text.match(pattern);
    if (m) hits.push({ lang, match: m[0] });
  }
  return hits;
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

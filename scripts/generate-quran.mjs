#!/usr/bin/env node
/**
 * Generates the Quran data of Ilm Journey (src/features/quran/data/*.json).
 *
 *   node scripts/generate-quran.mjs               # fetch + verify + write
 *   node scripts/generate-quran.mjs --allow-diff  # write even if islam-quest's overlapping surahs differ
 *
 * Quran text and translations are NEVER typed by hand: everything Arabic/translated comes verbatim from
 * api.alquran.cloud (Tanzil Uthmani text + Saheeh International / Bubenheim & Elyas / Besim Korkut +
 * English transliteration). The only processing is removing the Basmala that the API prefixes to ayah 1 of
 * every surah except Al-Fatiha (where it IS ayah 1) and At-Tawba (which has none) — exactly like the
 * sibling app islam-quest. Bosnian surah-name meanings come from api.quran.com (translated chapter names).
 *
 * Node 22+, no dependencies. Requests are sequential with a small delay and retries.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src', 'features', 'quran', 'data');
const SIBLING_SURAHS = resolve(ROOT, '..', 'islam-quest', 'src', 'data', 'quran', 'surahs.json');
const ALLOW_DIFF = process.argv.includes('--allow-diff');

const API = 'https://api.alquran.cloud/v1';
const EDITIONS = {
  arabic: 'quran-uthmani',
  en: 'en.sahih',
  de: 'de.bubenheim',
  bs: 'bs.korkut',
  transliteration: 'en.transliteration',
};
const EDITION_LIST = Object.values(EDITIONS).join(',');
const DELAY_MS = 350;

/** Al-Fatiha + complete Juz ʿAmma (78–114). */
const SURAH_NUMBERS = [1, ...Array.from({ length: 37 }, (_, i) => 78 + i)];

/** The fields islam-quest's surah objects have (used for the byte-identity check). */
const ISLAM_QUEST_SURAH_FIELDS = ['number', 'nameArabic', 'nameTransliterated', 'nameMeaning', 'revelationType', 'ayahCount', 'ayahs'];

// ---------------------------------------------------------------------------------------------------------
// Quranic duas. Titles and context sentences are our own (not Quran) — the Quran text itself is fetched.
// `context` is completed with " (<surah name> <ref>)." from the API's surah name.
// ---------------------------------------------------------------------------------------------------------
const INSTRUCTED = {
  en: 'A supplication the Quran instructs to be said',
  de: 'Ein Bittgebet, das zu sprechen der Koran anweist',
  bs: "Dova koju Kur'an upućuje da se izgovara",
};

const DUAS = [
  {
    id: 'ibrahim-ismail-acceptance',
    surah: 2, from: 127, to: 128, theme: 'acceptance',
    title: { en: 'Acceptance of good deeds', de: 'Annahme der guten Taten', bs: 'Da nam se prime dobra djela' },
    context: {
      en: 'The supplication of Ibrahim and Ismail while raising the foundations of the House (the Kaaba)',
      de: 'Das Bittgebet von Ibrahim und Ismail, als sie die Grundmauern des Hauses (der Kaaba) errichteten',
      bs: 'Dova Ibrahima i Ismaila dok su podizali temelje Kuće (Kabe)',
    },
  },
  {
    id: 'good-in-both-worlds',
    surah: 2, from: 201, to: 201, theme: 'goodness',
    title: { en: 'Good in this world and the Hereafter', de: 'Gutes im Diesseits und im Jenseits', bs: 'Dobro na ovom i na budućem svijetu' },
    context: {
      en: 'Mentioned after the rites of Hajj as the supplication of those who ask for good in this world and the Hereafter',
      de: 'Nach den Riten der Pilgerfahrt erwähnt als Bittgebet derer, die um Gutes im Diesseits und im Jenseits bitten',
      bs: 'Spomenuta nakon obreda hadža kao dova onih koji traže dobro i na ovom i na budućem svijetu',
    },
  },
  {
    id: 'talut-patience',
    surah: 2, from: 250, to: 250, theme: 'steadfastness',
    title: { en: 'Patience and firm footing', de: 'Geduld und feste Schritte', bs: 'Strpljenje i čvrsti koraci' },
    context: {
      en: 'The supplication of the believers with Talut (Saul) as they went out to face Jalut (Goliath) and his soldiers',
      de: 'Das Bittgebet der Gläubigen mit Talut (Saul), als sie gegen Galut (Goliath) und seine Truppen auszogen',
      bs: 'Dova vjernika s Talutom kada su izašli pred Džaluta i njegovu vojsku',
    },
  },
  {
    id: 'ease-pardon-mercy',
    surah: 2, from: 286, to: 286, theme: 'forgiveness',
    title: { en: 'Ease, pardon and mercy', de: 'Erleichterung, Verzeihung und Erbarmen', bs: 'Olakšanje, oprost i milost' },
    context: {
      en: 'The final ayah of Surah Al-Baqarah, which ends with a supplication for pardon, forgiveness and mercy',
      de: 'Der letzte Vers der Sure al-Baqara, der mit einem Bittgebet um Verzeihung, Vergebung und Erbarmen endet',
      bs: 'Posljednji ajet sure El-Bekare, koji završava dovom za oprost, praštanje i milost',
    },
  },
  {
    id: 'steadfast-hearts',
    surah: 3, from: 8, to: 8, theme: 'guidance',
    title: { en: 'For guidance and steadfast hearts', de: 'Für Rechtleitung und standhafte Herzen', bs: 'Za uputu i postojana srca' },
    context: {
      en: 'A supplication that follows the mention of those firmly grounded in knowledge',
      de: 'Ein Bittgebet, das auf die Erwähnung derer folgt, die im Wissen fest gegründet sind',
      bs: 'Dova koja slijedi nakon spomena onih koji su temeljito upućeni u znanje',
    },
  },
  {
    id: 'forgiveness-and-firm-feet',
    surah: 3, from: 147, to: 147, theme: 'steadfastness',
    title: { en: 'Forgiveness and steadfastness', de: 'Vergebung und Standhaftigkeit', bs: 'Oprost i postojanost' },
    context: {
      en: 'The words of the many devoted followers who fought alongside prophets and did not weaken',
      de: 'Die Worte der vielen Gottergebenen, die an der Seite von Propheten kämpften und nicht schwach wurden',
      bs: 'Riječi mnogih pobožnih koji su se borili uz vjerovjesnike i nisu klonuli',
    },
  },
  {
    id: 'people-of-understanding',
    surah: 3, from: 191, to: 194, theme: 'reflection',
    title: { en: 'Reflecting on creation', de: 'Nachsinnen über die Schöpfung', bs: 'Razmišljanje o stvaranju' },
    context: {
      en: 'The supplication of people of understanding who remember Allah and reflect on the creation of the heavens and the earth',
      de: 'Das Bittgebet der Verständigen, die Allahs gedenken und über die Erschaffung der Himmel und der Erde nachsinnen',
      bs: 'Dova razumom obdarenih koji Allaha spominju i razmišljaju o stvaranju nebesa i Zemlje',
    },
  },
  {
    id: 'adam-repentance',
    surah: 7, from: 23, to: 23, theme: 'forgiveness',
    title: { en: 'Admitting a mistake and seeking forgiveness', de: 'Fehler eingestehen und um Vergebung bitten', bs: 'Priznati grešku i tražiti oprost' },
    context: {
      en: 'The words of Adam and his wife after they had eaten from the tree',
      de: 'Die Worte Adams und seiner Frau, nachdem sie von dem Baum gegessen hatten',
      bs: 'Riječi Adema i njegove žene nakon što su jeli s drveta',
    },
  },
  {
    id: 'magicians-patience',
    surah: 7, from: 126, to: 126, theme: 'steadfastness',
    title: { en: 'Patience under pressure', de: 'Geduld unter Druck', bs: 'Strpljenje pod pritiskom' },
    context: {
      en: "The supplication of Pharaoh's magicians after they had believed and Pharaoh threatened them",
      de: 'Das Bittgebet der Zauberer Pharaos, nachdem sie gläubig geworden waren und Pharao ihnen drohte',
      bs: 'Dova faraonovih čarobnjaka nakon što su povjerovali, a faraon im je prijetio',
    },
  },
  {
    id: 'trust-and-protection',
    surah: 10, from: 85, to: 86, theme: 'protection',
    title: { en: 'Trust in Allah and protection from oppression', de: 'Vertrauen auf Allah und Schutz vor Unterdrückung', bs: 'Oslonac na Allaha i zaštita od nasilja' },
    context: {
      en: "The answer of the believers among Musa's people when he told them to rely on Allah, at a time they feared Pharaoh",
      de: 'Die Antwort der Gläubigen aus dem Volk Musas, als er sie aufforderte, sich auf Allah zu verlassen – in einer Zeit, in der sie Pharao fürchteten',
      bs: 'Odgovor vjernika iz Musaovog naroda kada ih je pozvao da se oslone na Allaha, u vrijeme kada su se bojali faraona',
    },
  },
  {
    id: 'ibrahim-prayer-offspring-parents',
    surah: 14, from: 40, to: 41, theme: 'family',
    title: { en: 'For prayer, offspring and parents', de: 'Für das Gebet, die Nachkommen und die Eltern', bs: 'Za namaz, potomstvo i roditelje' },
    context: {
      en: 'Part of the supplication of Ibrahim',
      de: 'Teil des Bittgebets Ibrahims',
      bs: 'Dio Ibrahimove dove',
    },
  },
  {
    id: 'mercy-for-parents',
    surah: 17, from: 24, to: 24, theme: 'parents',
    title: { en: "Mercy for one's parents", de: 'Erbarmen für die Eltern', bs: 'Milost za roditelje' },
    context: {
      en: "Part of the command to be good to one's parents; the ayah teaches what to say for them",
      de: 'Teil des Gebots, die Eltern gut zu behandeln; der Vers lehrt, was man für sie sagen soll',
      bs: 'Dio naredbe o dobročinstvu prema roditeljima; ajet uči šta za njih reći',
    },
  },
  {
    id: 'good-entrance-good-exit',
    surah: 17, from: 80, to: 80, theme: 'guidance',
    title: { en: 'A good beginning and a good ending', de: 'Ein guter Anfang und ein gutes Ende', bs: 'Dobar ulazak i dobar izlazak' },
    context: INSTRUCTED,
  },
  {
    id: 'youths-of-the-cave',
    surah: 18, from: 10, to: 10, theme: 'guidance',
    title: { en: 'Mercy and right direction', de: 'Erbarmen und der richtige Weg', bs: 'Milost i pravi put' },
    context: {
      en: 'The supplication of the young men who took refuge in the cave',
      de: 'Das Bittgebet der jungen Männer, die in der Höhle Zuflucht suchten',
      bs: 'Dova mladića koji su se sklonili u pećinu',
    },
  },
  {
    id: 'musa-ease-and-speech',
    surah: 20, from: 25, to: 28, theme: 'ease',
    title: { en: 'Confidence and clear speech', de: 'Zuversicht und klare Rede', bs: 'Smirenost i jasan govor' },
    context: {
      en: 'The supplication of Musa when he was sent to Pharaoh',
      de: 'Das Bittgebet Musas, als er zu Pharao gesandt wurde',
      bs: 'Musaova dova kada je poslan faraonu',
    },
  },
  {
    id: 'increase-in-knowledge',
    surah: 20, from: 114, to: 114, theme: 'knowledge',
    title: { en: 'Increase in knowledge', de: 'Mehr Wissen', bs: 'Povećanje znanja' },
    context: {
      en: 'Said to the Prophet in connection with the revelation of the Quran',
      de: 'An den Propheten gerichtet im Zusammenhang mit der Offenbarung des Korans',
      bs: "Upućeno Vjerovjesniku u vezi s objavom Kur'ana",
    },
  },
  {
    id: 'ayyub-hardship',
    surah: 21, from: 83, to: 83, theme: 'relief',
    title: { en: 'When hardship touches you', de: 'Wenn Unheil einen trifft', bs: 'Kada te pogodi nevolja' },
    context: {
      en: 'The call of Ayyub to his Lord when adversity had touched him',
      de: 'Der Ruf Ayyubs (Hiob) zu seinem Herrn, als ihn Unheil getroffen hatte',
      bs: 'Ejjubov zov Gospodaru kada ga je pogodila nevolja',
    },
  },
  {
    id: 'yunus-in-the-darkness',
    surah: 21, from: 87, to: 87, theme: 'relief',
    title: { en: 'From the darkness to relief', de: 'Aus der Dunkelheit zur Rettung', bs: 'Iz tmine ka spasu' },
    context: {
      en: 'The call of Yunus, the man of the fish, from within the darknesses',
      de: 'Der Ruf Yunus’, des Mannes mit dem Fisch, aus den Finsternissen',
      bs: 'Junusov zov, onoga koji je bio u ribi, iz tmina',
    },
  },
  {
    id: 'zakariyya-heir',
    surah: 21, from: 89, to: 89, theme: 'family',
    title: { en: 'For offspring', de: 'Um Nachkommen', bs: 'Za potomstvo' },
    context: {
      en: 'The call of Zakariyya to his Lord; the next ayah tells that Allah answered him and gave him Yahya',
      de: 'Der Ruf Zakariyyas zu seinem Herrn; der nächste Vers berichtet, dass Allah ihn erhörte und ihm Yahya schenkte',
      bs: 'Zekerijjin zov Gospodaru; sljedeći ajet kazuje da mu se Allah odazvao i darovao mu Jahju',
    },
  },
  {
    id: 'refuge-from-devils',
    surah: 23, from: 97, to: 98, theme: 'protection',
    title: { en: 'Refuge from the whispers of the devils', de: 'Zuflucht vor den Einflüsterungen der Satane', bs: 'Zaštita od šejtanskih došaptavanja' },
    context: INSTRUCTED,
  },
  {
    id: 'comfort-of-the-eyes',
    surah: 25, from: 74, to: 74, theme: 'family',
    title: { en: 'Spouses and children as a joy', de: 'Ehepartner und Kinder als Freude', bs: 'Supružnici i djeca kao radost' },
    context: {
      en: 'Among the qualities described of the servants of the Most Merciful',
      de: 'Unter den beschriebenen Eigenschaften der Diener des Allerbarmers',
      bs: 'Među opisanim osobinama robova Milostivog',
    },
  },
  {
    id: 'sulayman-gratitude',
    surah: 27, from: 19, to: 19, theme: 'gratitude',
    title: { en: 'Gratitude and righteous deeds', de: 'Dankbarkeit und gute Taten', bs: 'Zahvalnost i dobra djela' },
    context: {
      en: 'The supplication of Sulayman after he heard the words of an ant',
      de: 'Das Bittgebet Sulaimans, nachdem er die Worte einer Ameise gehört hatte',
      bs: 'Sulejmanova dova nakon što je čuo riječi jednog mrava',
    },
  },
  {
    id: 'musa-in-need',
    surah: 28, from: 24, to: 24, theme: 'provision',
    title: { en: 'In need of every good', de: 'Bedürftig nach allem Guten', bs: 'Potreban svakog dobra' },
    context: {
      en: 'The words of Musa in Madyan, after he had watered the flock for two women',
      de: 'Die Worte Musas in Madyan, nachdem er für zwei Frauen die Herde getränkt hatte',
      bs: 'Musaove riječi u Medjenu, nakon što je napojio stoku dvjema ženama',
    },
  },
  {
    id: 'gratitude-for-parents',
    surah: 46, from: 15, to: 15, theme: 'parents',
    title: { en: "Gratitude for oneself and one's parents", de: 'Dankbarkeit für sich und die Eltern', bs: 'Zahvalnost za sebe i roditelje' },
    context: {
      en: 'Part of the command of kindness to parents: the supplication of one who reaches full strength and forty years',
      de: 'Teil des Gebots der Güte gegenüber den Eltern: das Bittgebet dessen, der seine Vollkraft erreicht und vierzig Jahre alt wird',
      bs: 'Dio naredbe o dobročinstvu prema roditeljima: dova onoga ko dostigne zrelost i navrši četrdeset godina',
    },
  },
  {
    id: 'brothers-and-sisters-in-faith',
    surah: 59, from: 10, to: 10, theme: 'community',
    title: { en: 'For our brothers and sisters in faith', de: 'Für unsere Geschwister im Glauben', bs: 'Za našu braću i sestre u vjeri' },
    context: {
      en: 'The supplication of those who came after the Emigrants and the Helpers',
      de: 'Das Bittgebet derer, die nach den Auswanderern und den Helfern kamen',
      bs: 'Dova onih koji su došli poslije muhadžira i ensarija',
    },
  },
  {
    id: 'perfect-our-light',
    surah: 66, from: 8, to: 8, theme: 'forgiveness',
    title: { en: 'Sincere repentance and complete light', de: 'Aufrichtige Reue und vollkommenes Licht', bs: 'Iskreno pokajanje i potpuno svjetlo' },
    context: {
      en: 'The words of the believers on the Day their light runs before them, within a call to sincere repentance',
      de: 'Die Worte der Gläubigen an dem Tag, an dem ihr Licht vor ihnen hereilt – im Rahmen eines Aufrufs zu aufrichtiger Reue',
      bs: 'Riječi vjernika na Dan kada će njihovo svjetlo ići ispred njih, uz poziv na iskreno pokajanje',
    },
  },
];

// ---------------------------------------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let requestCount = 0;

async function fetchJson(url, attempts = 5) {
  for (let attempt = 1; ; attempt++) {
    if (requestCount++ > 0) await sleep(DELAY_MS);
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'ilm-journey-generate-quran/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      return body;
    } catch (error) {
      if (attempt >= attempts) throw new Error(`${url} failed after ${attempts} attempts: ${error.message}`);
      const wait = 1000 * 2 ** (attempt - 1);
      console.warn(`  retry ${attempt}/${attempts - 1} in ${wait} ms (${error.message}) — ${url}`);
      await sleep(wait);
    }
  }
}

async function fetchAlQuran(path) {
  const body = await fetchJson(`${API}${path}`);
  if (body.code !== 200 || !Array.isArray(body.data)) throw new Error(`Unexpected response for ${path}: ${body.status}`);
  const byEdition = {};
  for (const ed of body.data) byEdition[ed.edition.identifier] = ed;
  for (const id of Object.values(EDITIONS)) if (!byEdition[id]) throw new Error(`Edition ${id} missing in ${path}`);
  return byEdition;
}

// ---------------------------------------------------------------------------------------------------------
// Basmala handling (identical to islam-quest): Al-Fatiha keeps it as ayah 1; for every other surah the API
// prefixes it to ayah 1 and we remove exactly that prefix. Nothing else in the text is changed.
// ---------------------------------------------------------------------------------------------------------
let BASMALA = null; // taken verbatim from the API (Al-Fatiha 1:1) — never typed by hand
const warnings = [];

const stripMarks = (s) => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');

/**
 * The Tanzil source starts with a byte-order mark (U+FEFF) that the API passes through on 1:1. It is a file
 * encoding artefact, not Quran text; islam-quest's data has it removed too. Only a leading U+FEFF is removed.
 */
const stripBom = (s) => {
  if (!s.startsWith('\uFEFF')) return s;
  bomCount++;
  return s.slice(1);
};
let bomCount = 0;

function removeBasmalaPrefix(text, surah) {
  if (BASMALA && text.startsWith(`${BASMALA} `)) return text.slice(BASMALA.length + 1);
  // Defensive: the Tanzil text occasionally carries an assimilation mark on the first letter. Recognise the
  // four Basmala words by their letters only, cut exactly those four words and report it.
  const words = text.split(' ');
  if (BASMALA && words.length > 4 && stripMarks(words.slice(0, 4).join(' ')) === stripMarks(BASMALA)) {
    warnings.push(`Surah ${surah}: Basmala prefix differs in diacritics ("${words.slice(0, 4).join(' ')}"), removed by letters`);
    return words.slice(4).join(' ');
  }
  throw new Error(`Surah ${surah}: ayah 1 does not start with the Basmala — refusing to guess`);
}

function buildAyah(eds, i, surahNumber) {
  const a = eds[EDITIONS.arabic].ayahs[i];
  for (const id of Object.values(EDITIONS)) {
    const other = eds[id].ayahs[i];
    if (other.number !== a.number || other.numberInSurah !== a.numberInSurah) throw new Error(`Ayah mismatch ${surahNumber}:${i + 1} in ${id}`);
  }
  let arabic = stripBom(a.text);
  if (a.numberInSurah === 1 && surahNumber !== 1 && surahNumber !== 9) arabic = removeBasmalaPrefix(arabic, surahNumber);
  if (/^\s|\s$/.test(arabic)) warnings.push(`${surahNumber}:${a.numberInSurah} Arabic has leading/trailing whitespace (kept verbatim)`);
  return {
    numberInSurah: a.numberInSurah,
    globalNumber: a.number,
    arabic,
    transliteration: stripBom(eds[EDITIONS.transliteration].ayahs[i].text),
    translation: {
      en: stripBom(eds[EDITIONS.en].ayahs[i].text),
      de: stripBom(eds[EDITIONS.de].ayahs[i].text),
      bs: stripBom(eds[EDITIONS.bs].ayahs[i].text),
    },
  };
}

const REVELATION = { Meccan: 'makki', Medinan: 'madani' };

/** Memorisation hint based on the number of ayahs. */
function difficultyFor(ayahCount) {
  if (ayahCount <= 8) return 'easy';
  if (ayahCount <= 20) return 'medium';
  return 'hard';
}
const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 };

// ---------------------------------------------------------------------------------------------------------
async function main() {
  console.log(`Generating Quran data into ${OUT_DIR}`);

  // Bosnian surah-name meanings (quran.com translated chapter names). German is not available there, so
  // German falls back to the English meaning (never guessed).
  const bsNames = {};
  try {
    const body = await fetchJson('https://api.quran.com/api/v4/chapters?language=bs');
    for (const c of body.chapters ?? []) {
      if (c.translated_name?.language_name === 'bosnian' && c.translated_name.name) bsNames[c.id] = c.translated_name.name;
    }
  } catch (error) {
    warnings.push(`Bosnian surah names unavailable (${error.message}); falling back to English`);
  }

  const surahs = [];
  for (const n of SURAH_NUMBERS) {
    const eds = await fetchAlQuran(`/surah/${n}/editions/${EDITION_LIST}`);
    const meta = eds[EDITIONS.arabic];
    for (const id of Object.values(EDITIONS)) {
      if (eds[id].ayahs.length !== meta.numberOfAyahs) throw new Error(`Surah ${n}: ${id} has ${eds[id].ayahs.length} ayahs, expected ${meta.numberOfAyahs}`);
    }
    if (n === 1) BASMALA = stripBom(meta.ayahs[0].text);
    if (!REVELATION[meta.revelationType]) throw new Error(`Surah ${n}: unknown revelationType ${meta.revelationType}`);
    const ayahs = meta.ayahs.map((_, i) => buildAyah(eds, i, n));
    const juz = [...new Set(meta.ayahs.map((a) => a.juz))];
    surahs.push({
      number: meta.number,
      nameArabic: meta.name,
      nameTransliterated: meta.englishName,
      nameMeaning: meta.englishNameTranslation,
      nameMeaningLocalized: {
        en: meta.englishNameTranslation,
        de: meta.englishNameTranslation,
        bs: bsNames[n] ?? meta.englishNameTranslation,
      },
      revelationType: REVELATION[meta.revelationType],
      ayahCount: meta.numberOfAyahs,
      juz: juz[0],
      difficulty: difficultyFor(meta.numberOfAyahs),
      memorizationOrder: 0,
      ayahs,
    });
    console.log(`  surah ${String(n).padStart(3)} ${meta.englishName.padEnd(16)} ${meta.numberOfAyahs} ayahs`);
  }

  // Suggested memorisation order: Al-Fatiha first, then by difficulty tier, then from the end of the mushaf
  // backwards within a tier (the traditional An-Nas → An-Naba direction).
  [...surahs]
    .sort((a, b) =>
      a.number === 1 ? -1 : b.number === 1 ? 1 : DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || b.number - a.number,
    )
    .forEach((s, i) => (s.memorizationOrder = i + 1));

  // ---- Compare with islam-quest (must be identical for the overlapping surahs) ----
  const discrepancies = [];
  if (existsSync(SIBLING_SURAHS)) {
    const sibling = JSON.parse(readFileSync(SIBLING_SURAHS, 'utf8'));
    if (sibling.basmala !== BASMALA) discrepancies.push(`basmala: islam-quest "${sibling.basmala}" vs API "${BASMALA}"`);
    for (const theirs of sibling.surahs) {
      const ours = surahs.find((s) => s.number === theirs.number);
      if (!ours) {
        discrepancies.push(`surah ${theirs.number} is in islam-quest but not generated`);
        continue;
      }
      for (const field of ISLAM_QUEST_SURAH_FIELDS) {
        if (JSON.stringify(ours[field]) === JSON.stringify(theirs[field])) continue;
        if (field !== 'ayahs') {
          discrepancies.push(`surah ${theirs.number} ${field}: islam-quest ${JSON.stringify(theirs[field])} vs API ${JSON.stringify(ours[field])}`);
          continue;
        }
        theirs.ayahs.forEach((ta, i) => {
          const oa = ours.ayahs[i];
          if (JSON.stringify(ta) !== JSON.stringify(oa)) {
            discrepancies.push(`ayah ${theirs.number}:${ta.numberInSurah}: islam-quest ${JSON.stringify(ta)} vs API ${JSON.stringify(oa)}`);
          }
        });
        if (ours.ayahs.length !== theirs.ayahs.length) discrepancies.push(`surah ${theirs.number} ayah count differs`);
      }
    }
    console.log(
      discrepancies.length === 0
        ? `islam-quest check: surahs ${sibling.surahs.map((s) => s.number).join(', ')} identical`
        : `islam-quest check: ${discrepancies.length} discrepancies`,
    );
  } else {
    console.log('islam-quest not found next to this repo — skipping the identity check');
  }
  if (discrepancies.length > 0) {
    for (const d of discrepancies) console.error(`  DIFF ${d}`);
    if (!ALLOW_DIFF) {
      console.error('Aborting without writing. Re-run with --allow-diff to write anyway (and report the difference).');
      process.exit(2);
    }
  }

  // ---- Duas ----
  const duas = [];
  for (const spec of DUAS) {
    const ayahs = [];
    let surahMeta = null;
    for (let n = spec.from; n <= spec.to; n++) {
      const eds = await fetchAlQuran(`/ayah/${spec.surah}:${n}/editions/${EDITION_LIST}`);
      const a = eds[EDITIONS.arabic];
      surahMeta = a.surah;
      if (a.surah.number !== spec.surah || a.numberInSurah !== n) throw new Error(`Dua ${spec.id}: got ${a.surah.number}:${a.numberInSurah}`);
      // Reuse the surah-level builder by shaping the single-ayah response like a surah response.
      const asSurah = Object.fromEntries(Object.entries(eds).map(([id, ed]) => [id, { ayahs: [ed] }]));
      const built = buildAyah(asSurah, 0, spec.surah);
      ayahs.push({ surah: spec.surah, ...built });
    }
    const ref = spec.from === spec.to ? `${spec.surah}:${spec.from}` : `${spec.surah}:${spec.from}-${spec.to}`;
    const label = `${surahMeta.englishName} ${ref}`;
    duas.push({
      id: spec.id,
      ref,
      theme: spec.theme,
      title: spec.title,
      context: {
        en: `${spec.context.en} (${label}).`,
        de: `${spec.context.de} (${label}).`,
        bs: `${spec.context.bs} (${label}).`,
      },
      surah: {
        number: surahMeta.number,
        nameArabic: surahMeta.name,
        nameTransliterated: surahMeta.englishName,
        nameMeaning: surahMeta.englishNameTranslation,
        ayahCount: surahMeta.numberOfAyahs,
      },
      ayahs,
      sourceName: "Qur'an",
      sourceReference: ref,
    });
    console.log(`  dua ${ref.padEnd(9)} ${spec.id}`);
  }

  // ---- Write ----
  const generated = new Date().toISOString().slice(0, 10);
  const source = {
    text: 'Tanzil Quran Text (Uthmani), tanzil.net — distributed verbatim via api.alquran.cloud',
    translations: {
      en: 'Saheeh International',
      de: 'Frank Bubenheim & Nadeem Elyas',
      bs: 'Besim Korkut',
    },
    transliteration: 'alquran.cloud English transliteration',
    api: `${API} (editions ${EDITION_LIST})`,
    surahNamesBs: 'api.quran.com v4 chapters (language=bs); German surah-name meanings fall back to English',
    generated,
    generator: 'scripts/generate-quran.mjs',
  };
  mkdirSync(OUT_DIR, { recursive: true });
  const write = (file, data) => {
    const json = `${JSON.stringify(data, null, 2)}\n`;
    writeFileSync(join(OUT_DIR, file), json, 'utf8');
    console.log(`wrote ${file} (${(Buffer.byteLength(json) / 1024).toFixed(1)} KiB)`);
  };
  write('surahs.json', { source, basmala: BASMALA, surahs });
  write('duas.json', {
    source: {
      ...source,
      note: 'Each dua is presented as the full ayah(s); the Quran text is never cut by hand. Titles and context sentences are editorial, not Quran.',
    },
    duas,
  });

  console.log(`${surahs.length} surahs, ${surahs.reduce((n, s) => n + s.ayahs.length, 0)} ayahs, ${duas.length} duas, ${requestCount} requests`);
  if (bomCount) console.log(`removed a leading U+FEFF byte-order mark from ${bomCount} text field(s)`);
  if (warnings.length) for (const w of warnings) console.warn(`WARN ${w}`);
  if (discrepancies.length) console.warn(`WARN written despite ${discrepancies.length} islam-quest discrepancies (--allow-diff)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

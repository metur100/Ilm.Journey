import type { GameFact } from '@/core/games';
import type { ConnectPair, KitItem, MemoryPair } from '@/core/games/kit';
import { localizedFrom } from '@/core/i18n';
import { LANGUAGE_SOURCES, type LocalizedText } from '@/core/models';

/*
 * Vocabulary of the ten "Arabic basics" games of the Play section "Arabic" (topic `arabic`): greetings, numbers,
 * colours, family, body, food, prayer times, opposites, prayer words and phrases.
 *
 * Arabic is written with its short vowels (harakat) and a transliteration; the meanings are given in en / de / bs.
 * The helpers turn a word into a kit pair / sequence item and into a language fact (`kind: 'language'`, source
 * `LANGUAGE_SOURCES.vocabulary`).
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export interface Word {
  /** kebab-case; also the id of its pair and (for most games) of its fact. */
  id: string;
  arabic: string;
  translit: string;
  meaning: LocalizedText;
}

const w = (id: string, arabic: string, translit: string, en: string, de: string, bs: string): Word => ({ id, arabic, translit, meaning: T(en, de, bs) });

/** The words of one level and the words of it that become the level's facts. */
export interface WordLevel {
  words: Word[];
  facts: Word[];
}

export interface NumberWord {
  n: number;
  arabic: string;
  translit: string;
  /** Arabic-Indic numeral (١ … ١٠). */
  numeral: string;
}

export interface OppositeWordPair {
  id: string;
  a: Word;
  b: Word;
}

/** Opposite pairs of one level and the pairs that become its facts. */
export interface OppositeLevel {
  pairs: OppositeWordPair[];
  facts: OppositeWordPair[];
}

// ---------- helpers ----------

/** "السَّلَامُ عَلَيْكُمْ (as-salāmu ʿalaykum) – Peace be upon you." */
export function vocabFact(word: Word, art: string): GameFact {
  return {
    id: word.id,
    kind: 'language',
    text: localizedFrom((l) => `${word.arabic} (${word.translit}) – ${word.meaning[l]}`),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art,
  };
}

/** "كَبِير (kabīr) and صَغِير (ṣaghīr) are opposites: big / small." */
export function oppositeFact(a: Word, b: Word, art: string): GameFact {
  return {
    id: `opp-${a.id}-${b.id}`,
    kind: 'language',
    text: localizedFrom((l) => {
      if (l === 'de') return `${a.arabic} (${a.translit}) und ${b.arabic} (${b.translit}) sind Gegenteile: ${a.meaning.de} / ${b.meaning.de}.`;
      if (l === 'bs') return `${a.arabic} (${a.translit}) i ${b.arabic} (${b.translit}) su suprotnosti: ${a.meaning.bs} / ${b.meaning.bs}.`;
      return `${a.arabic} (${a.translit}) and ${b.arabic} (${b.translit}) are opposites: ${a.meaning.en} / ${b.meaning.en}.`;
    }),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art,
  };
}

/** "The number 1 is وَاحِد (wāḥid)." */
export function numberFact(x: NumberWord, art: string): GameFact {
  return {
    id: `number-${x.n}`,
    kind: 'language',
    text: localizedFrom(
      (l) =>
        ({
          en: `The number ${x.n} is ${x.arabic} (${x.translit}).`,
          de: `Die Zahl ${x.n} ist auf Arabisch ${x.arabic} (${x.translit}).`,
          bs: `Broj ${x.n} je na arapskom ${x.arabic} (${x.translit}).`,
        })[l],
    ),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art,
  };
}

/** Arabic word on the left, meaning + transliteration on the right. */
export function connectPair(word: Word): ConnectPair {
  return {
    id: word.id,
    left: { arabic: word.arabic, a11y: word.translit },
    right: {
      label: word.meaning,
      sub: word.translit,
      a11y: localizedFrom((l) => `${word.translit} – ${word.meaning[l]}`),
    },
  };
}

/** Arabic word (with transliteration) and its meaning. */
export function memoryPair(word: Word): MemoryPair {
  return {
    id: word.id,
    a: { arabic: word.arabic, sub: word.translit, a11y: word.translit },
    b: { label: word.meaning, a11y: localizedFrom((l) => `${word.translit} – ${word.meaning[l]}`) },
    caption: `${word.arabic} – ${word.translit}`,
  };
}

/** Arabic number word and its Arabic-Indic numeral (plus the Western digit). */
export function numberPair(x: NumberWord): MemoryPair {
  return {
    id: `number-${x.n}`,
    a: { arabic: x.arabic, sub: x.translit, a11y: `${x.translit} – ${x.n}` },
    b: { label: `${x.numeral} · ${x.n}`, a11y: `${x.numeral} – ${x.n}` },
    caption: `${x.arabic} – ${x.translit} (${x.n})`,
  };
}

/** Two opposite words; each shows its transliteration and meaning under the Arabic word. */
export function oppositePair(pair: OppositeWordPair): ConnectPair {
  const side = (word: Word) => ({
    arabic: word.arabic,
    sub: localizedFrom((l) => `${word.translit} · ${word.meaning[l]}`),
    a11y: localizedFrom((l) => `${word.translit} – ${word.meaning[l]}`),
  });
  return { id: pair.id, left: side(pair.a), right: side(pair.b) };
}

/** Prayer time as a sequence item: "الْفَجْر · al-fajr" with the meaning as caption. */
export function timeItem(word: Word): KitItem {
  return {
    id: word.id,
    label: `${word.arabic} · ${word.translit}`,
    sub: word.meaning,
    a11y: localizedFrom((l) => `${word.translit} – ${word.meaning[l]}`),
  };
}

// ---------- numbers (1–10) ----------

export const NUMBERS: NumberWord[] = [
  { n: 1, arabic: 'وَاحِد', translit: 'wāḥid', numeral: '١' },
  { n: 2, arabic: 'اِثْنَان', translit: 'ithnān', numeral: '٢' },
  { n: 3, arabic: 'ثَلَاثَة', translit: 'thalātha', numeral: '٣' },
  { n: 4, arabic: 'أَرْبَعَة', translit: 'arbaʿa', numeral: '٤' },
  { n: 5, arabic: 'خَمْسَة', translit: 'khamsa', numeral: '٥' },
  { n: 6, arabic: 'سِتَّة', translit: 'sitta', numeral: '٦' },
  { n: 7, arabic: 'سَبْعَة', translit: 'sabʿa', numeral: '٧' },
  { n: 8, arabic: 'ثَمَانِيَة', translit: 'thamāniya', numeral: '٨' },
  { n: 9, arabic: 'تِسْعَة', translit: 'tisʿa', numeral: '٩' },
  { n: 10, arabic: 'عَشَرَة', translit: 'ʿashara', numeral: '١٠' },
];

// ---------- greetings and everyday phrases ----------

export const GREETINGS: readonly WordLevel[] = [
  {
    words: [
      w('as-salamu-alaykum', 'السَّلَامُ عَلَيْكُمْ', 'as-salāmu ʿalaykum', 'Peace be upon you.', 'Friede sei mit euch.', 'Mir s vama.'),
      w('sabah-al-khayr', 'صَبَاحُ الْخَيْر', 'ṣabāḥ al-khayr', 'Good morning.', 'Guten Morgen.', 'Dobro jutro.'),
      w('masa-al-khayr', 'مَسَاءُ الْخَيْر', 'masāʾ al-khayr', 'Good evening.', 'Guten Abend.', 'Dobro veče.'),
      w('ahlan-wa-sahlan', 'أَهْلًا وَسَهْلًا', 'ahlan wa-sahlan', 'Welcome.', 'Willkommen.', 'Dobro došli.'),
      w('shukran', 'شُكْرًا', 'shukran', 'Thank you.', 'Danke.', 'Hvala.'),
      w('maa-salama', 'مَعَ السَّلَامَة', 'maʿa s-salāma', 'Goodbye.', 'Auf Wiedersehen.', 'Doviđenja.'),
    ],
    facts: [
      w('as-salamu-alaykum', 'السَّلَامُ عَلَيْكُمْ', 'as-salāmu ʿalaykum', 'Peace be upon you.', 'Friede sei mit euch.', 'Mir s vama.'),
      w('sabah-al-khayr', 'صَبَاحُ الْخَيْر', 'ṣabāḥ al-khayr', 'Good morning.', 'Guten Morgen.', 'Dobro jutro.'),
      w('masa-al-khayr', 'مَسَاءُ الْخَيْر', 'masāʾ al-khayr', 'Good evening.', 'Guten Abend.', 'Dobro veče.'),
    ],
  },
  {
    words: [
      w('bismillah', 'بِسْمِ اللَّه', 'bismillāh', 'In the name of Allah.', 'Im Namen Allahs.', 'U ime Allaha.'),
      w('alhamdulillah', 'الْحَمْدُ لِلَّه', 'al-ḥamdu lillāh', 'All praise is for Allah.', 'Alles Lob gebührt Allah.', 'Sva hvala pripada Allahu.'),
      w('inshaallah', 'إِنْ شَاءَ اللَّه', 'in shāʾ Allāh', 'If Allah wills.', 'So Allah will.', 'Ako Allah hoće.'),
      w('naam', 'نَعَمْ', 'naʿam', 'Yes.', 'Ja.', 'Da.'),
      w('la', 'لَا', 'lā', 'No.', 'Nein.', 'Ne.'),
      w('afwan', 'عَفْوًا', 'ʿafwan', "You're welcome.", 'Bitte.', 'Nema na čemu.'),
    ],
    facts: [
      w('bismillah', 'بِسْمِ اللَّه', 'bismillāh', 'In the name of Allah.', 'Im Namen Allahs.', 'U ime Allaha.'),
      w('alhamdulillah', 'الْحَمْدُ لِلَّه', 'al-ḥamdu lillāh', 'All praise is for Allah.', 'Alles Lob gebührt Allah.', 'Sva hvala pripada Allahu.'),
      w('inshaallah', 'إِنْ شَاءَ اللَّه', 'in shāʾ Allāh', 'If Allah wills.', 'So Allah will.', 'Ako Allah hoće.'),
    ],
  },
  {
    words: [
      w('wa-alaykum-as-salam', 'وَعَلَيْكُمُ السَّلَامُ', 'wa-ʿalaykumu s-salām', 'And peace be upon you.', 'Und Friede sei mit euch.', 'I mir s vama.'),
      w('kayfa-haluk', 'كَيْفَ حَالُكَ', 'kayfa ḥāluk', 'How are you?', 'Wie geht es dir?', 'Kako si?'),
      w('ana-bikhayr', 'أَنَا بِخَيْر', 'anā bi-khayr', 'I am fine.', 'Mir geht es gut.', 'Dobro sam.'),
      w('min-fadlik', 'مِنْ فَضْلِكَ', 'min faḍlik', 'Please.', 'Bitte.', 'Molim te.'),
      w('layla-saida', 'لَيْلَة سَعِيدَة', 'layla saʿīda', 'Good night.', 'Gute Nacht.', 'Laku noć.'),
    ],
    facts: [
      w('wa-alaykum-as-salam', 'وَعَلَيْكُمُ السَّلَامُ', 'wa-ʿalaykumu s-salām', 'And peace be upon you.', 'Und Friede sei mit euch.', 'I mir s vama.'),
      w('kayfa-haluk', 'كَيْفَ حَالُكَ', 'kayfa ḥāluk', 'How are you?', 'Wie geht es dir?', 'Kako si?'),
    ],
  },
];

// ---------- colours ----------

export const COLORS: readonly WordLevel[] = [
  {
    words: [
      w('abyad', 'أَبْيَض', 'abyaḍ', 'white', 'weiß', 'bijela'),
      w('aswad', 'أَسْوَد', 'aswad', 'black', 'schwarz', 'crna'),
      w('ahmar', 'أَحْمَر', 'aḥmar', 'red', 'rot', 'crvena'),
      w('azraq', 'أَزْرَق', 'azraq', 'blue', 'blau', 'plava'),
      w('akhdar', 'أَخْضَر', 'akhḍar', 'green', 'grün', 'zelena'),
      w('asfar', 'أَصْفَر', 'aṣfar', 'yellow', 'gelb', 'žuta'),
    ],
    facts: [
      w('abyad', 'أَبْيَض', 'abyaḍ', 'white', 'weiß', 'bijela'),
      w('ahmar', 'أَحْمَر', 'aḥmar', 'red', 'rot', 'crvena'),
      w('akhdar', 'أَخْضَر', 'akhḍar', 'green', 'grün', 'zelena'),
    ],
  },
  {
    words: [
      w('bunni', 'بُنِّيّ', 'bunniyy', 'brown', 'braun', 'smeđa'),
      w('burtuqali', 'بُرْتُقَالِيّ', 'burtuqāliyy', 'orange', 'orange', 'narandžasta'),
      w('banafsaji', 'بَنَفْسَجِيّ', 'banafsajiyy', 'purple', 'lila', 'ljubičasta'),
      w('wardi', 'وَرْدِيّ', 'wardiyy', 'pink', 'rosa', 'roze'),
      w('ramadi', 'رَمَادِيّ', 'ramādiyy', 'grey', 'grau', 'siva'),
      w('dhahabi', 'ذَهَبِيّ', 'dhahabiyy', 'golden', 'golden', 'zlatna'),
    ],
    facts: [
      w('bunni', 'بُنِّيّ', 'bunniyy', 'brown', 'braun', 'smeđa'),
      w('burtuqali', 'بُرْتُقَالِيّ', 'burtuqāliyy', 'orange', 'orange', 'narandžasta'),
      w('banafsaji', 'بَنَفْسَجِيّ', 'banafsajiyy', 'purple', 'lila', 'ljubičasta'),
    ],
  },
  {
    words: [
      w('fiddi', 'فِضِّيّ', 'fiḍḍiyy', 'silver', 'silbern', 'srebrna'),
      w('zaytuni', 'زَيْتُونِيّ', 'zaytūniyy', 'olive', 'olivgrün', 'maslinasta'),
      w('samawi', 'سَمَاوِيّ', 'samāwiyy', 'sky blue', 'himmelblau', 'nebeskoplava'),
      w('qirmizi', 'قِرْمِزِيّ', 'qirmiziyy', 'crimson', 'karmesinrot', 'grimizna'),
      w('fayruzi', 'فَيْرُوزِيّ', 'fayrūziyy', 'turquoise', 'türkis', 'tirkizna'),
      w('unnabi', 'عَنَّابِيّ', 'ʿunnābiyy', 'maroon', 'weinrot', 'bordo'),
    ],
    facts: [
      w('fiddi', 'فِضِّيّ', 'fiḍḍiyy', 'silver', 'silbern', 'srebrna'),
      w('samawi', 'سَمَاوِيّ', 'samāwiyy', 'sky blue', 'himmelblau', 'nebeskoplava'),
      w('fayruzi', 'فَيْرُوزِيّ', 'fayrūziyy', 'turquoise', 'türkis', 'tirkizna'),
    ],
  },
];

// ---------- family ----------

export const FAMILY: readonly WordLevel[] = [
  {
    words: [
      w('ab', 'أَب', 'ab', 'father', 'Vater', 'otac'),
      w('umm', 'أُمّ', 'umm', 'mother', 'Mutter', 'majka'),
      w('ibn', 'اِبْن', 'ibn', 'son', 'Sohn', 'sin'),
      w('bint', 'بِنْت', 'bint', 'daughter', 'Tochter', 'kći'),
      w('akh', 'أَخ', 'akh', 'brother', 'Bruder', 'brat'),
      w('ukht', 'أُخْت', 'ukht', 'sister', 'Schwester', 'sestra'),
    ],
    facts: [
      w('ab', 'أَب', 'ab', 'father', 'Vater', 'otac'),
      w('umm', 'أُمّ', 'umm', 'mother', 'Mutter', 'majka'),
      w('ibn', 'اِبْن', 'ibn', 'son', 'Sohn', 'sin'),
    ],
  },
  {
    words: [
      w('jadd', 'جَدّ', 'jadd', 'grandfather', 'Großvater', 'djed'),
      w('jadda', 'جَدَّة', 'jadda', 'grandmother', 'Großmutter', 'baka'),
      w('amm', 'عَمّ', 'ʿamm', 'paternal uncle', 'Onkel väterlicherseits', 'očev brat (stric)'),
      w('amma', 'عَمَّة', 'ʿamma', 'paternal aunt', 'Tante väterlicherseits', 'očeva sestra (tetka)'),
      w('khal', 'خَال', 'khāl', 'maternal uncle', 'Onkel mütterlicherseits', 'majčin brat (ujak)'),
      w('khala', 'خَالَة', 'khāla', 'maternal aunt', 'Tante mütterlicherseits', 'majčina sestra (tetka)'),
    ],
    facts: [
      w('jadd', 'جَدّ', 'jadd', 'grandfather', 'Großvater', 'djed'),
      w('amm', 'عَمّ', 'ʿamm', 'paternal uncle', 'Onkel väterlicherseits', 'očev brat (stric)'),
      w('khal', 'خَال', 'khāl', 'maternal uncle', 'Onkel mütterlicherseits', 'majčin brat (ujak)'),
    ],
  },
  {
    words: [
      w('zawj', 'زَوْج', 'zawj', 'husband', 'Ehemann', 'muž'),
      w('zawja', 'زَوْجَة', 'zawja', 'wife', 'Ehefrau', 'žena (supruga)'),
      w('hafid', 'حَفِيد', 'ḥafīd', 'grandson', 'Enkel', 'unuk'),
      w('hafida', 'حَفِيدَة', 'ḥafīda', 'granddaughter', 'Enkelin', 'unuka'),
      w('tifl', 'طِفْل', 'ṭifl', 'child', 'Kind', 'dijete'),
      w('usra', 'أُسْرَة', 'usra', 'family', 'Familie', 'porodica'),
    ],
    facts: [
      w('zawj', 'زَوْج', 'zawj', 'husband', 'Ehemann', 'muž'),
      w('zawja', 'زَوْجَة', 'zawja', 'wife', 'Ehefrau', 'žena (supruga)'),
      w('usra', 'أُسْرَة', 'usra', 'family', 'Familie', 'porodica'),
    ],
  },
];

// ---------- body ----------

export const BODY: readonly WordLevel[] = [
  {
    words: [
      w('ras', 'رَأْس', 'raʾs', 'head', 'Kopf', 'glava'),
      w('ayn', 'عَيْن', 'ʿayn', 'eye', 'Auge', 'oko'),
      w('yad', 'يَد', 'yad', 'hand', 'Hand', 'šaka'),
      w('qalb', 'قَلْب', 'qalb', 'heart', 'Herz', 'srce'),
      w('qadam', 'قَدَم', 'qadam', 'foot', 'Fuß', 'stopalo'),
      w('udhun', 'أُذُن', 'udhun', 'ear', 'Ohr', 'uho'),
    ],
    facts: [
      w('ras', 'رَأْس', 'raʾs', 'head', 'Kopf', 'glava'),
      w('ayn', 'عَيْن', 'ʿayn', 'eye', 'Auge', 'oko'),
      w('qalb', 'قَلْب', 'qalb', 'heart', 'Herz', 'srce'),
    ],
  },
  {
    words: [
      w('anf', 'أَنْف', 'anf', 'nose', 'Nase', 'nos'),
      w('fam', 'فَم', 'fam', 'mouth', 'Mund', 'usta'),
      w('shar', 'شَعْر', 'shaʿr', 'hair', 'Haar', 'kosa'),
      w('sinn', 'سِنّ', 'sinn', 'tooth', 'Zahn', 'zub'),
      w('lisan', 'لِسَان', 'lisān', 'tongue', 'Zunge', 'jezik'),
      w('rijl', 'رِجْل', 'rijl', 'leg', 'Bein', 'noga'),
    ],
    facts: [
      w('anf', 'أَنْف', 'anf', 'nose', 'Nase', 'nos'),
      w('fam', 'فَم', 'fam', 'mouth', 'Mund', 'usta'),
      w('sinn', 'سِنّ', 'sinn', 'tooth', 'Zahn', 'zub'),
    ],
  },
  {
    words: [
      w('katif', 'كَتِف', 'katif', 'shoulder', 'Schulter', 'rame'),
      w('batn', 'بَطْن', 'baṭn', 'stomach', 'Bauch', 'trbuh'),
      w('zahr', 'ظَهْر', 'ẓahr', 'back', 'Rücken', 'leđa'),
      w('isba', 'إِصْبَع', 'iṣbaʿ', 'finger', 'Finger', 'prst'),
      w('dhira', 'ذِرَاع', 'dhirāʿ', 'arm', 'Arm', 'ruka'),
      w('rukba', 'رُكْبَة', 'rukba', 'knee', 'Knie', 'koljeno'),
    ],
    facts: [
      w('katif', 'كَتِف', 'katif', 'shoulder', 'Schulter', 'rame'),
      w('batn', 'بَطْن', 'baṭn', 'stomach', 'Bauch', 'trbuh'),
      w('isba', 'إِصْبَع', 'iṣbaʿ', 'finger', 'Finger', 'prst'),
    ],
  },
];

// ---------- food and drink ----------

export const FOOD: readonly WordLevel[] = [
  {
    words: [
      w('khubz', 'خُبْز', 'khubz', 'bread', 'Brot', 'hljeb'),
      w('maa', 'مَاء', 'māʾ', 'water', 'Wasser', 'voda'),
      w('tamr', 'تَمْر', 'tamr', 'dates', 'Datteln', 'hurme'),
      w('halib', 'حَلِيب', 'ḥalīb', 'milk', 'Milch', 'mlijeko'),
      w('asal', 'عَسَل', 'ʿasal', 'honey', 'Honig', 'med'),
      w('samak', 'سَمَك', 'samak', 'fish', 'Fisch', 'riba'),
    ],
    facts: [
      w('khubz', 'خُبْز', 'khubz', 'bread', 'Brot', 'hljeb'),
      w('maa', 'مَاء', 'māʾ', 'water', 'Wasser', 'voda'),
      w('tamr', 'تَمْر', 'tamr', 'dates', 'Datteln', 'hurme'),
    ],
  },
  {
    words: [
      w('aruzz', 'أَرُزّ', 'aruzz', 'rice', 'Reis', 'riža'),
      w('lahm', 'لَحْم', 'laḥm', 'meat', 'Fleisch', 'meso'),
      w('dajaj', 'دَجَاج', 'dajāj', 'chicken', 'Huhn', 'piletina'),
      w('fakiha', 'فَاكِهَة', 'fākiha', 'fruit', 'Obst', 'voće'),
      w('tuffah', 'تُفَّاح', 'tuffāḥ', 'apple', 'Apfel', 'jabuka'),
      w('mawz', 'مَوْز', 'mawz', 'banana', 'Banane', 'banana'),
    ],
    facts: [
      w('aruzz', 'أَرُزّ', 'aruzz', 'rice', 'Reis', 'riža'),
      w('lahm', 'لَحْم', 'laḥm', 'meat', 'Fleisch', 'meso'),
      w('dajaj', 'دَجَاج', 'dajāj', 'chicken', 'Huhn', 'piletina'),
    ],
  },
  {
    words: [
      w('burtuqal', 'بُرْتُقَال', 'burtuqāl', 'orange', 'Orange', 'narandža'),
      w('inab', 'عِنَب', 'ʿinab', 'grapes', 'Weintrauben', 'grožđe'),
      w('zaytun', 'زَيْتُون', 'zaytūn', 'olives', 'Oliven', 'masline'),
      w('jubn', 'جُبْن', 'jubn', 'cheese', 'Käse', 'sir'),
      w('bayd', 'بَيْض', 'bayḍ', 'eggs', 'Eier', 'jaja'),
      w('shay', 'شَاي', 'shāy', 'tea', 'Tee', 'čaj'),
    ],
    facts: [
      w('burtuqal', 'بُرْتُقَال', 'burtuqāl', 'orange', 'Orange', 'narandža'),
      w('jubn', 'جُبْن', 'jubn', 'cheese', 'Käse', 'sir'),
      w('shay', 'شَاي', 'shāy', 'tea', 'Tee', 'čaj'),
    ],
  },
];

// ---------- prayer times (in order) ----------

export const PRAYER_TIMES: readonly Word[] = [
  w('fajr', 'الْفَجْر', 'al-fajr', 'dawn', 'Morgendämmerung', 'zora'),
  w('zuhr', 'الظُّهْر', 'aẓ-ẓuhr', 'midday', 'Mittag', 'podne'),
  w('asr', 'الْعَصْر', 'al-ʿaṣr', 'afternoon', 'Nachmittag', 'poslijepodne'),
  w('maghrib', 'الْمَغْرِب', 'al-maghrib', 'sunset', 'Sonnenuntergang', 'zalazak sunca'),
  w('isha', 'الْعِشَاء', 'al-ʿishāʾ', 'night', 'Nacht', 'noć'),
];

// ---------- opposites ----------

export const OPPOSITES: readonly OppositeLevel[] = [
  {
    pairs: [
      { id: 'big-small', a: w('kabir', 'كَبِير', 'kabīr', 'big', 'groß', 'velik'), b: w('saghir', 'صَغِير', 'ṣaghīr', 'small', 'klein', 'mali') },
      { id: 'day-night', a: w('yawm', 'يَوْم', 'yawm', 'day', 'Tag', 'dan'), b: w('layl', 'لَيْل', 'layl', 'night', 'Nacht', 'noć') },
      { id: 'hot-cold', a: w('harr', 'حَارّ', 'ḥārr', 'hot', 'heiß', 'vruć'), b: w('barid', 'بَارِد', 'bārid', 'cold', 'kalt', 'hladan') },
      { id: 'long-short', a: w('tawil', 'طَوِيل', 'ṭawīl', 'long', 'lang', 'dug'), b: w('qasir', 'قَصِير', 'qaṣīr', 'short', 'kurz', 'kratak') },
      { id: 'new-old', a: w('jadid', 'جَدِيد', 'jadīd', 'new', 'neu', 'nov'), b: w('qadim', 'قَدِيم', 'qadīm', 'old', 'alt', 'star') },
      { id: 'easy-difficult', a: w('sahl', 'سَهْل', 'sahl', 'easy', 'einfach', 'lak'), b: w('saab', 'صَعْب', 'ṣaʿb', 'difficult', 'schwierig', 'težak') },
    ],
    facts: [
      { id: 'big-small', a: w('kabir', 'كَبِير', 'kabīr', 'big', 'groß', 'velik'), b: w('saghir', 'صَغِير', 'ṣaghīr', 'small', 'klein', 'mali') },
      { id: 'hot-cold', a: w('harr', 'حَارّ', 'ḥārr', 'hot', 'heiß', 'vruć'), b: w('barid', 'بَارِد', 'bārid', 'cold', 'kalt', 'hladan') },
      { id: 'new-old', a: w('jadid', 'جَدِيد', 'jadīd', 'new', 'neu', 'nov'), b: w('qadim', 'قَدِيم', 'qadīm', 'old', 'alt', 'star') },
    ],
  },
  {
    pairs: [
      { id: 'many-few', a: w('kathir', 'كَثِير', 'kathīr', 'many', 'viel', 'mnogo'), b: w('qalil', 'قَلِيل', 'qalīl', 'few', 'wenig', 'malo') },
      { id: 'fast-slow', a: w('sari', 'سَرِيع', 'sarīʿ', 'fast', 'schnell', 'brz'), b: w('bati', 'بَطِيء', 'baṭīʾ', 'slow', 'langsam', 'spor') },
      { id: 'strong-weak', a: w('qawiyy', 'قَوِيّ', 'qawiyy', 'strong', 'stark', 'jak'), b: w('dhaif', 'ضَعِيف', 'ḍaʿīf', 'weak', 'schwach', 'slab') },
      { id: 'open-closed', a: w('maftuh', 'مَفْتُوح', 'maftūḥ', 'open', 'offen', 'otvoren'), b: w('mughlaq', 'مُغْلَق', 'mughlaq', 'closed', 'geschlossen', 'zatvoren') },
      { id: 'clean-dirty', a: w('nazif', 'نَظِيف', 'naẓīf', 'clean', 'sauber', 'čist'), b: w('wasikh', 'وَسِخ', 'wasikh', 'dirty', 'schmutzig', 'prljav') },
      { id: 'happy-sad', a: w('said', 'سَعِيد', 'saʿīd', 'happy', 'glücklich', 'sretan'), b: w('hazin', 'حَزِين', 'ḥazīn', 'sad', 'traurig', 'tužan') },
    ],
    facts: [
      { id: 'many-few', a: w('kathir', 'كَثِير', 'kathīr', 'many', 'viel', 'mnogo'), b: w('qalil', 'قَلِيل', 'qalīl', 'few', 'wenig', 'malo') },
      { id: 'fast-slow', a: w('sari', 'سَرِيع', 'sarīʿ', 'fast', 'schnell', 'brz'), b: w('bati', 'بَطِيء', 'baṭīʾ', 'slow', 'langsam', 'spor') },
      { id: 'clean-dirty', a: w('nazif', 'نَظِيف', 'naẓīf', 'clean', 'sauber', 'čist'), b: w('wasikh', 'وَسِخ', 'wasikh', 'dirty', 'schmutzig', 'prljav') },
    ],
  },
  {
    pairs: [
      { id: 'rich-poor', a: w('ghaniyy', 'غَنِيّ', 'ghaniyy', 'rich', 'reich', 'bogat'), b: w('faqir', 'فَقِير', 'faqīr', 'poor', 'arm', 'siromašan') },
      { id: 'near-far', a: w('qarib', 'قَرِيب', 'qarīb', 'near', 'nah', 'blizu'), b: w('baid', 'بَعِيد', 'baʿīd', 'far', 'weit', 'daleko') },
      { id: 'heavy-light', a: w('thaqil', 'ثَقِيل', 'thaqīl', 'heavy', 'schwer', 'težak'), b: w('khafif', 'خَفِيف', 'khafīf', 'light', 'leicht', 'lagan') },
      { id: 'sweet-bitter', a: w('hulw', 'حُلْو', 'ḥulw', 'sweet', 'süß', 'sladak'), b: w('murr', 'مُرّ', 'murr', 'bitter', 'bitter', 'gorak') },
      { id: 'wide-narrow', a: w('wasi', 'وَاسِع', 'wāsiʿ', 'wide', 'breit', 'širok'), b: w('dhayyiq', 'ضَيِّق', 'ḍayyiq', 'narrow', 'eng', 'uzak') },
      { id: 'first-last', a: w('awwal', 'أَوَّل', 'awwal', 'first', 'erster', 'prvi'), b: w('akhir', 'آخِر', 'ākhir', 'last', 'letzter', 'posljednji') },
    ],
    facts: [
      { id: 'rich-poor', a: w('ghaniyy', 'غَنِيّ', 'ghaniyy', 'rich', 'reich', 'bogat'), b: w('faqir', 'فَقِير', 'faqīr', 'poor', 'arm', 'siromašan') },
      { id: 'heavy-light', a: w('thaqil', 'ثَقِيل', 'thaqīl', 'heavy', 'schwer', 'težak'), b: w('khafif', 'خَفِيف', 'khafīf', 'light', 'leicht', 'lagan') },
      { id: 'wide-narrow', a: w('wasi', 'وَاسِع', 'wāsiʿ', 'wide', 'breit', 'širok'), b: w('dhayyiq', 'ضَيِّق', 'ḍayyiq', 'narrow', 'eng', 'uzak') },
    ],
  },
];

// ---------- prayer words ----------

export const PRAYER_WORDS: readonly WordLevel[] = [
  {
    words: [
      w('salah', 'صَلَاة', 'ṣalāh', 'prayer', 'Gebet', 'namaz'),
      w('wudu', 'وُضُوء', 'wuḍūʾ', 'ablution', 'Gebetswaschung', 'abdest'),
      w('masjid', 'مَسْجِد', 'masjid', 'mosque', 'Moschee', 'džamija'),
      w('qibla', 'قِبْلَة', 'qibla', 'qibla (direction of prayer)', 'Qibla (Gebetsrichtung)', 'kible (pravac molitve)'),
      w('imam', 'إِمَام', 'imām', 'imam (prayer leader)', 'Imam (Gebetsleiter)', 'imam (predvodnik namaza)'),
      w('adhan', 'أَذَان', 'adhān', 'call to prayer', 'Gebetsruf', 'ezan (poziv na namaz)'),
    ],
    facts: [
      w('salah', 'صَلَاة', 'ṣalāh', 'prayer', 'Gebet', 'namaz'),
      w('wudu', 'وُضُوء', 'wuḍūʾ', 'ablution', 'Gebetswaschung', 'abdest'),
      w('qibla', 'قِبْلَة', 'qibla', 'qibla (direction of prayer)', 'Qibla (Gebetsrichtung)', 'kible (pravac molitve)'),
    ],
  },
  {
    words: [
      w('iqama', 'إِقَامَة', 'iqāma', 'call to begin the prayer', 'Aufruf zum Gebetsbeginn', 'ikama (poziv na početak namaza)'),
      w('raka', 'رَكْعَة', 'rakʿa', 'unit of prayer', 'Gebetseinheit', "rek'at (jedinica namaza)"),
      w('sujud', 'سُجُود', 'sujūd', 'prostration', 'Niederwerfung', 'sedžda (padanje na tlo)'),
      w('ruku', 'رُكُوع', 'rukūʿ', 'bowing', 'Verbeugung', 'ruku (pregibanje)'),
      w('tashahhud', 'تَشَهُّد', 'tashahhud', 'testimony recited in prayer', 'Taschahhud (Bekenntnis im Gebet)', 'tešehhud (svjedočenje u namazu)'),
      w('taslim', 'تَسْلِيم', 'taslīm', 'closing salutation', 'Abschlussgruß', 'selama (završni pozdrav)'),
    ],
    facts: [
      w('iqama', 'إِقَامَة', 'iqāma', 'call to begin the prayer', 'Aufruf zum Gebetsbeginn', 'ikama (poziv na početak namaza)'),
      w('sujud', 'سُجُود', 'sujūd', 'prostration', 'Niederwerfung', 'sedžda (padanje na tlo)'),
      w('ruku', 'رُكُوع', 'rukūʿ', 'bowing', 'Verbeugung', 'ruku (pregibanje)'),
    ],
  },
  {
    words: [
      w('sajjada', 'سَجَّادَة', 'sajjāda', 'prayer mat', 'Gebetsteppich', 'sedžada (staza za namaz)'),
      w('mihrab', 'مِحْرَاب', 'miḥrāb', 'prayer niche', 'Gebetsnische', 'mihrab (niša u džamiji)'),
      w('minbar', 'مِنْبَر', 'minbar', 'pulpit', 'Kanzel', 'minber'),
      w('muadhdhin', 'مُؤَذِّن', 'muʾadhdhin', 'muezzin (caller to prayer)', 'Muezzin (Gebetsrufer)', 'mujezin (pozivač na namaz)'),
      w('khutba', 'خُطْبَة', 'khuṭba', 'sermon', 'Predigt', 'hutba'),
      w('jumua', 'جُمُعَة', 'jumuʿa', 'Friday (Friday prayer)', 'Freitag (Freitagsgebet)', 'džuma (petak)'),
    ],
    facts: [
      w('sajjada', 'سَجَّادَة', 'sajjāda', 'prayer mat', 'Gebetsteppich', 'sedžada (staza za namaz)'),
      w('minbar', 'مِنْبَر', 'minbar', 'pulpit', 'Kanzel', 'minber'),
      w('khutba', 'خُطْبَة', 'khuṭba', 'sermon', 'Predigt', 'hutba'),
    ],
  },
];

// ---------- common phrases and duas ----------

export const PHRASES: readonly WordLevel[] = [
  {
    words: [
      w('jazaka-llahu-khayran', 'جَزَاكَ اللَّه خَيْرًا', 'jazāka llāhu khayran', 'May Allah reward you with good.', 'Möge Allah dich mit Gutem belohnen.', 'Neka te Allah nagradi dobrom.'),
      w('baraka-llahu-fik', 'بَارَكَ اللَّه فِيك', 'bāraka llāhu fīk', 'May Allah bless you.', 'Möge Allah dich segnen.', 'Neka te Allah blagoslovi.'),
      w('astaghfiru-llah', 'أَسْتَغْفِرُ اللَّه', 'astaghfiru llāh', "I seek Allah's forgiveness.", 'Ich bitte Allah um Vergebung.', 'Tražim oprost od Allaha.'),
      w('subhana-llah', 'سُبْحَانَ اللَّه', 'subḥāna llāh', 'Glory be to Allah.', 'Ehre sei Allah.', 'Slava Allahu.'),
      w('allahu-akbar', 'اللَّه أَكْبَر', 'allāhu akbar', 'Allah is the greatest.', 'Allah ist der Größte.', 'Allah je najveći.'),
      w('la-ilaha-illa-llah', 'لَا إِلَهَ إِلَّا اللَّه', 'lā ilāha illā llāh', 'There is no god but Allah.', 'Es gibt keinen Gott außer Allah.', 'Nema boga osim Allaha.'),
    ],
    facts: [
      w('jazaka-llahu-khayran', 'جَزَاكَ اللَّه خَيْرًا', 'jazāka llāhu khayran', 'May Allah reward you with good.', 'Möge Allah dich mit Gutem belohnen.', 'Neka te Allah nagradi dobrom.'),
      w('baraka-llahu-fik', 'بَارَكَ اللَّه فِيك', 'bāraka llāhu fīk', 'May Allah bless you.', 'Möge Allah dich segnen.', 'Neka te Allah blagoslovi.'),
      w('astaghfiru-llah', 'أَسْتَغْفِرُ اللَّه', 'astaghfiru llāh', "I seek Allah's forgiveness.", 'Ich bitte Allah um Vergebung.', 'Tražim oprost od Allaha.'),
    ],
  },
  {
    words: [
      w('alhamdu-lillah', 'الْحَمْدُ لِلَّه', 'al-ḥamdu lillāh', 'All praise is for Allah.', 'Alles Lob gebührt Allah.', 'Sva hvala pripada Allahu.'),
      w('bismillah', 'بِسْمِ اللَّه', 'bismillāh', 'In the name of Allah.', 'Im Namen Allahs.', 'U ime Allaha.'),
      w('in-shallah', 'إِنْ شَاءَ اللَّه', 'in shāʾ Allāh', 'If Allah wills.', 'So Allah will.', 'Ako Allah hoće.'),
      w('ma-shallah', 'مَا شَاءَ اللَّه', 'mā shāʾ Allāh', 'What Allah has willed.', 'Was Allah gewollt hat.', 'Šta je Allah htio.'),
      w('audhu-billah', 'أَعُوذُ بِاللَّه', 'aʿūdhu billāh', 'I seek refuge in Allah.', 'Ich suche Zuflucht bei Allah.', 'Tražim utočište kod Allaha.'),
      w('tawakkaltu-ala-llah', 'تَوَكَّلْتُ عَلَى اللَّه', 'tawakkaltu ʿalā llāh', 'I put my trust in Allah.', 'Ich vertraue auf Allah.', 'Pouzdajem se u Allaha.'),
    ],
    facts: [
      w('alhamdu-lillah', 'الْحَمْدُ لِلَّه', 'al-ḥamdu lillāh', 'All praise is for Allah.', 'Alles Lob gebührt Allah.', 'Sva hvala pripada Allahu.'),
      w('bismillah', 'بِسْمِ اللَّه', 'bismillāh', 'In the name of Allah.', 'Im Namen Allahs.', 'U ime Allaha.'),
      w('in-shallah', 'إِنْ شَاءَ اللَّه', 'in shāʾ Allāh', 'If Allah wills.', 'So Allah will.', 'Ako Allah hoće.'),
    ],
  },
  {
    words: [
      w('la-hawla-wa-la-quwwata-illa-billah', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه', 'lā ḥawla wa-lā quwwata illā billāh', 'There is no power and no strength except with Allah.', 'Es gibt keine Kraft und keine Stärke außer mit Allah.', 'Nema snage ni moći osim kod Allaha.'),
      w('inna-lillahi-wa-inna-ilayhi-rajiun', 'إِنَّا لِلَّه وَإِنَّا إِلَيْهِ رَاجِعُونَ', 'innā lillāhi wa-innā ilayhi rājiʿūn', 'Indeed we belong to Allah, and to Him we return.', 'Wir gehören Allah, und zu Ihm kehren wir zurück.', 'Mi smo Allahovi i Njemu se vraćamo.'),
      w('sallallahu-alayhi-wa-sallam', 'صَلَّى اللَّه عَلَيْهِ وَسَلَّمَ', 'ṣallā llāhu ʿalayhi wa-sallam', 'May Allah bless him and grant him peace.', 'Möge Allah ihn segnen und ihm Frieden schenken.', 'Neka ga Allah blagoslovi i podari mu mir.'),
      w('rabbi-zidni-ilman', 'رَبِّ زِدْنِي عِلْمًا', 'rabbi zidnī ʿilman', 'My Lord, increase me in knowledge.', 'Mein Herr, mehre mein Wissen.', 'Gospodaru moj, povećaj mi znanje.'),
      w('subhana-llahi-wa-bihamdih', 'سُبْحَانَ اللَّه وَبِحَمْدِهِ', 'subḥāna llāhi wa-bi-ḥamdih', 'Glory be to Allah and praise Him.', 'Ehre sei Allah und Lob sei Ihm.', 'Slava Allahu i hvala Njemu.'),
      w('rahimahu-llah', 'رَحِمَهُ اللَّه', 'raḥimahu llāh', 'May Allah have mercy on him.', 'Möge Allah ihm gnädig sein.', 'Neka mu Allah bude milostiv.'),
    ],
    facts: [
      w('la-hawla-wa-la-quwwata-illa-billah', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه', 'lā ḥawla wa-lā quwwata illā billāh', 'There is no power and no strength except with Allah.', 'Es gibt keine Kraft und keine Stärke außer mit Allah.', 'Nema snage ni moći osim kod Allaha.'),
      w('inna-lillahi-wa-inna-ilayhi-rajiun', 'إِنَّا لِلَّه وَإِنَّا إِلَيْهِ رَاجِعُونَ', 'innā lillāhi wa-innā ilayhi rājiʿūn', 'Indeed we belong to Allah, and to Him we return.', 'Wir gehören Allah, und zu Ihm kehren wir zurück.', 'Mi smo Allahovi i Njemu se vraćamo.'),
      w('rabbi-zidni-ilman', 'رَبِّ زِدْنِي عِلْمًا', 'rabbi zidnī ʿilman', 'My Lord, increase me in knowledge.', 'Mein Herr, mehre mein Wissen.', 'Gospodaru moj, povećaj mi znanje.'),
    ],
  },
];

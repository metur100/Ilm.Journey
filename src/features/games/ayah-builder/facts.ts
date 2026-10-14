import type { GameFact } from '@/core/games';
import { localizedFrom, translate, translateNs } from '@/core/i18n';
import type { LocalizedText, SourceRef } from '@/core/models';
import { getSurah, listSurahs, QURAN_SOURCE, type Surah } from '@/features/quran';

import { ayahBuilderI18n } from './i18n';

/*
 * "You learned" facts of Ayah Builder. Two kinds:
 * - copied verbatim (text + sources) from the Quran quest lessons / facts (`src/features/learn/content/quests/quran.json`);
 *   the test compares them with the content;
 * - composed only from fields of the generated Quran data (name meaning, ayah count, Makki/Madani, juz), with the
 *   same core template as the surah collection cards, citing the ayahs and the Tanzil text.
 */

/** Meaning of a surah name in a language (German falls back to English in the data). */
export function surahMeaning(surah: Surah): LocalizedText {
  return localizedFrom((lang) => surah.nameMeaningLocalized?.[lang] || surah.nameMeaning);
}

/** Sources of a fact composed from the generated data of one surah. */
export function surahSources(surah: Surah): SourceRef[] {
  return [
    { sourceName: 'Quran', sourceReference: `${surah.number}:1–${surah.ayahCount}` },
    { sourceName: QURAN_SOURCE.text, sourceReference: '' },
  ];
}

/** "Surah X means “…”. It has N ayahs and was revealed in Makkah/Madinah." (core template of the collection). */
export function surahFactText(surah: Surah): LocalizedText {
  const meaning = surahMeaning(surah);
  return localizedFrom((lang) =>
    translate(lang, 'collection.surahFact', {
      name: surah.nameTransliterated,
      meaning: meaning[lang],
      count: surah.ayahCount,
      place: translate(lang, surah.revelationType === 'madani' ? 'collection.revelation.madani' : 'collection.revelation.makki'),
    }),
  );
}

const revelation = (lang: 'en' | 'de' | 'bs', type: 'makki' | 'madani') =>
  translate(lang, type === 'madani' ? 'collection.revelation.madani' : 'collection.revelation.makki');

const must = (n: number): Surah => {
  const surah = getSurah(n);
  if (!surah) throw new Error(`Surah ${n} missing from the Quran data`);
  return surah;
};

const NASR = must(110);
const JUZ_AMMA = listSurahs().filter((s) => s.juz === 30);
const FIRST = JUZ_AMMA[0];
const LAST = JUZ_AMMA[JUZ_AMMA.length - 1];

export const AYAH_FACTS = {
  // Quest lesson `quran-falaq-nas`.
  falaqNas: {
    id: 'falaq-nas-before-sleep',
    text: {
      en: 'Al-Falaq and An-Nas are the last two surahs of the Quran. In them we seek refuge with Allah from every harm. The Prophet ﷺ used to recite them, together with Al-Ikhlas, before going to sleep.',
      de: 'Al-Falaq und An-Nas sind die letzten beiden Suren des Korans. In ihnen suchen wir bei Allah Zuflucht vor allem Übel. Der Prophet ﷺ pflegte sie zusammen mit Al-Ichlas vor dem Schlafen zu rezitieren.',
      bs: "El-Felek i En-Nas su posljednje dvije sure Kur'ana. U njima tražimo utočište kod Allaha od svakog zla. Poslanik ﷺ ih je, zajedno s El-Ihlasom, učio prije spavanja.",
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '5017' }],
    art: 'garden.moon',
    reviewKey: 'learn:quran-etiquette-4',
  },
  // Quest lesson `quran-ikhlas`.
  ikhlas: {
    id: 'ikhlas-third',
    text: {
      en: 'Surah Al-Ikhlas describes Allah: He is One, everyone depends on Him, He has no children and no parents, and nothing is like Him. The Prophet ﷺ said it is equal to a third of the Quran.',
      de: 'Sure Al-Ichlas beschreibt Allah: Er ist Einer, alle sind auf Ihn angewiesen, Er hat weder Kinder noch Eltern, und nichts ist Ihm gleich. Der Prophet ﷺ sagte, sie gleiche einem Drittel des Korans.',
      bs: "Sura El-Ihlas opisuje Allaha: On je Jedan, svi ovise o Njemu, nema djece ni roditelja i ništa Mu nije ravno. Poslanik ﷺ je rekao da je ona ravna trećini Kur'ana.",
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '5013' }],
    art: 'object.quran-stand',
  },
  // Quest lesson `quran-fatiha`.
  fatiha: {
    id: 'fatiha-every-prayer',
    text: {
      en: 'Al-Fatiha is the first surah of the Quran and has seven ayahs. The Prophet ﷺ said that there is no prayer for the one who does not recite it. It praises Allah and asks Him for guidance to the straight path.',
      de: 'Al-Fatiha ist die erste Sure des Korans und hat sieben Verse. Der Prophet ﷺ sagte, dass es kein Gebet gibt für den, der sie nicht rezitiert. Sie lobt Allah und bittet Ihn um Rechtleitung auf den geraden Weg.',
      bs: "El-Fatiha je prva sura Kur'ana i ima sedam ajeta. Poslanik ﷺ je rekao da nema namaza onome ko je ne prouči. U njoj se hvali Allah i traži od Njega uputa na pravi put.",
    },
    sources: [
      { sourceName: 'Sahih al-Bukhari', sourceReference: '756' },
      { sourceName: 'Sahih Muslim', sourceReference: '394' },
    ],
    art: 'object.prayer-mat',
    reviewKey: 'learn:quran-structure-3',
  },
  // Composed from the data: An-Nasr is the Madani surah of level 2.
  nasr: {
    id: 'nasr-madani',
    text: surahFactText(NASR),
    sources: surahSources(NASR),
    art: 'place.madinah-city',
    check: {
      type: 'choice',
      prompt: localizedFrom((lang) => translateNs(ayahBuilderI18n, lang, 'fact.whereRevealed', { name: NASR.nameTransliterated })),
      options: [localizedFrom((lang) => revelation(lang, 'makki')), localizedFrom((lang) => revelation(lang, 'madani'))],
      correctIndex: 1,
    },
  },
  // Quest fact `quran-fact-iqra` (Al-Alaq is in the level 3 pool).
  iqra: {
    id: 'first-word-iqra',
    text: {
      en: 'The first word revealed of the Quran was "Iqra" – Read!',
      de: 'Das erste offenbarte Wort des Korans war „Iqra“ – Lies!',
      bs: "Prva objavljena riječ Kur'ana bila je „Ikre'“ – Čitaj!",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '96:1' }],
    art: 'place.cave-hira',
  },
  // Composed from the data (`juz` field): the surahs of Juz ʿAmma.
  juzAmma: {
    id: 'juz-amma',
    text: localizedFrom((lang) =>
      translateNs(ayahBuilderI18n, lang, 'fact.juzAmma', {
        count: JUZ_AMMA.length,
        first: FIRST.nameTransliterated,
        from: FIRST.number,
        last: LAST.nameTransliterated,
        to: LAST.number,
      }),
    ),
    sources: [
      { sourceName: 'Quran', sourceReference: `${FIRST.number}–${LAST.number}` },
      { sourceName: QURAN_SOURCE.text, sourceReference: '' },
    ],
    art: 'object.book',
  },
} satisfies Record<string, GameFact>;

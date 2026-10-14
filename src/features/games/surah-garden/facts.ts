import type { GameFact } from '@/core/games';
import { localizedFrom, translateNs } from '@/core/i18n';
import { getSurah, QURAN_SOURCE, type Surah } from '@/features/quran';

import { surahFactText, surahMeaning, surahSources } from '../ayah-builder/facts';
import { surahGardenI18n } from './i18n';

/*
 * Facts of Surah Garden: about the anchor surahs that are on the board in every play of a level. Copied from the
 * Quran unit question `quran-structure-3`, or composed only from fields of the generated Quran data (meaning,
 * ayah count, Makki/Madani, ayah 1 transliteration + translation) – citing the ayahs and the Tanzil text.
 */

const must = (n: number): Surah => {
  const surah = getSurah(n);
  if (!surah) throw new Error(`Surah ${n} missing from the Quran data`);
  return surah;
};

const FATIHA = must(1);
const IKHLAS = must(112);
const KAWTHAR = must(108);
const NAS = must(114);
const FALAQ = must(113);
const KAFIRUN = must(109);

/** "{name} begins with “{words}” – “{translation}”" from ayah 1 (transliteration + translation of the data). */
function openingFact(surah: Surah) {
  const first = surah.ayahs[0];
  return localizedFrom((lang) =>
    translateNs(surahGardenI18n, lang, 'fact.opening', { name: surah.nameTransliterated, words: first.transliteration, translation: first.translation[lang] }),
  );
}

const same = (text: string) => ({ en: text, de: text, bs: text });

export const GARDEN_FACTS = {
  // Unit question `quran-structure-3` (explanation + sources).
  fatihaOpening: {
    id: 'fatiha-the-opening',
    text: {
      en: 'Al-Fatiha, "The Opening", is the first surah and is recited in every rak\'ah.',
      de: 'Al-Fatiha, „Die Eröffnende“, ist die erste Sure und wird in jeder Rak\'a rezitiert.',
      bs: 'El-Fatiha, „Pristupnica“, prva je sura i uči se u svakom rekatu.',
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '756' }],
    art: 'object.quran-stand',
    reviewKey: 'learn:quran-structure-3',
  },
  ikhlasMeaning: {
    id: 'ikhlas-meaning',
    text: surahFactText(IKHLAS),
    sources: surahSources(IKHLAS),
    art: 'garden.flower-lily',
    check: {
      type: 'choice',
      prompt: localizedFrom((lang) => translateNs(surahGardenI18n, lang, 'fact.meaningOf', { name: IKHLAS.nameTransliterated })),
      options: [surahMeaning(IKHLAS), surahMeaning(NAS), surahMeaning(KAWTHAR)],
      correctIndex: 0,
    },
  },
  kawtharCount: {
    id: 'kawthar-three-ayahs',
    text: surahFactText(KAWTHAR),
    sources: surahSources(KAWTHAR),
    art: 'garden.flower-rose',
    reviewKey: 'learn:quran-structure-4',
  },
  fatihaCount: {
    id: 'fatiha-seven-ayahs',
    text: surahFactText(FATIHA),
    sources: surahSources(FATIHA),
    art: 'garden.flower-tulip',
    check: {
      type: 'choice',
      prompt: localizedFrom((lang) => translateNs(surahGardenI18n, lang, 'fact.countOf', { name: FATIHA.nameTransliterated })),
      options: [same('5'), same(String(FATIHA.ayahCount)), same('4')],
      correctIndex: 1,
    },
  },
  ikhlasOpening: {
    id: 'ikhlas-opening',
    text: openingFact(IKHLAS),
    sources: [{ sourceName: 'Quran', sourceReference: '112:1' }, { sourceName: QURAN_SOURCE.text, sourceReference: '' }],
    art: 'object.book',
    check: {
      type: 'choice',
      prompt: localizedFrom((lang) => translateNs(surahGardenI18n, lang, 'fact.beginsWith', { name: IKHLAS.nameTransliterated })),
      options: [same(IKHLAS.ayahs[0].transliteration), same(FALAQ.ayahs[0].transliteration), same(KAFIRUN.ayahs[0].transliteration)],
      correctIndex: 0,
    },
  },
  fatihaOpeningWords: {
    id: 'fatiha-opening-words',
    text: openingFact(FATIHA),
    sources: [{ sourceName: 'Quran', sourceReference: '1:1' }, { sourceName: QURAN_SOURCE.text, sourceReference: '' }],
    art: 'object.quran-stand',
  },
} satisfies Record<string, GameFact>;

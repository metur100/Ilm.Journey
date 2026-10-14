import type { GameFact } from '@/core/games';
import { localizedFrom, translateNs } from '@/core/i18n';
import { LANGUAGE_SOURCES, type LocalizedText } from '@/core/models';

import { LANTERN_FACTS } from '../letter-lanterns/facts';
import { wordBuilderI18n } from './i18n';
import { type GameWord, getWord } from './words';

/*
 * Language facts (`kind: 'language'`) of Word Builder, copied from the Arabic word lesson and quest facts
 * (src/features/learn/content/quests/arabic.json). Word meanings cite the neutral vocabulary reference.
 */

const must = (id: string): GameWord => {
  const word = getWord(id);
  if (!word) throw new Error(`Word ${id} missing`);
  return word;
};

/** "كِتَاب (kitāb) – Book": the lesson line of a word. */
export const wordLine = (word: GameWord): LocalizedText => localizedFrom((lang) => `${word.arabic} (${word.translit}) – ${word.meaning[lang]}`);

function wordFact(id: string, distractors: readonly string[]): GameFact {
  const word = must(id);
  return {
    id: `word-${id}`,
    kind: 'language',
    text: wordLine(word),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art: word.art,
    check: {
      type: 'choice',
      prompt: localizedFrom((lang) => translateNs(wordBuilderI18n, lang, 'fact.wordMeaning', { word: `${word.arabic} (${word.translit})` })),
      options: [word.meaning, ...distractors.map((d) => must(d).meaning)],
      correctIndex: 0,
    },
  };
}

export const WORD_FACTS = {
  joining: LANTERN_FACTS.joining,
  nur: wordFact('nur', ['kitab', 'masjid']),
  kitab: wordFact('kitab', ['nur', 'masjid']),
  // Quest fact `arabic-fact-masjid`.
  masjid: {
    id: 'masjid-sujud',
    kind: 'language',
    text: {
      en: 'The word "masjid" comes from "sujud" – it means the place of prostration.',
      de: 'Das Wort „Masdschid“ kommt von „Sudschud“ – es bedeutet Ort der Niederwerfung.',
      bs: 'Riječ „mesdžid“ dolazi od „sedžda“ – znači mjesto sedžde.',
    },
    sources: [LANGUAGE_SOURCES.vocabulary],
    art: 'garden.masjid-small',
    reviewKey: 'quest:arabic-masjid-word',
  },
  dots: LANTERN_FACTS.dots,
} satisfies Record<string, GameFact>;

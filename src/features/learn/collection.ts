import { localizedFrom, translate } from '@/core/i18n';
import { type AchievementKey, type CollectionCard, type LocalizedText, TOPIC_IDS } from '@/core/models';
import { registerAchievements, registerCollectionCards } from '@/core/registry';
import { getDua, getSurah, QURAN_SOURCE } from '@/features/quran';

import { getUnit } from './content';
import { ALPHABET } from './content/quests';
import { useQuestStore } from './quests/store/questStore';
import { isMasterPassed } from './services/progression';
import { useLearnStore } from './store/learnStore';

/**
 * Collection cards of the Learn feature (letters, surahs, duas, good deeds). Every text is copied or composed from
 * existing content – lesson sections, generated Quran data and akhlaq units – never written new.
 */

const same = (text: string): LocalizedText => ({ en: text, de: text, bs: text });
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// ---------- Letters (alphabet lessons `arabic-letters-1…4`) ----------

/** Letters the beginner quests trace first (one per lesson group), in alphabet order. */
const LETTERS = ['ا', 'ب', 'ت', 'ج', 'د', 'س', 'ق', 'م'];

function letterCards(): CollectionCard[] {
  // The letter lessons carry no own references; the Learn unit "The Arabic Letters" is the cited source of the topic.
  const sources = getUnit('arabic-letters')?.sources ?? [];
  return LETTERS.flatMap((char) => {
    const letter = ALPHABET.find((l) => l.letter === char);
    if (!letter) return [];
    const name = same(capitalize(letter.name));
    return [
      {
        id: `letter-${letter.position}`,
        category: 'letters' as const,
        art: 'pattern.star-tile',
        title: name,
        arabic: letter.letter,
        fact: letter.description,
        sources,
        unlock: `letter:${letter.letter}:traced`,
        unlockTitle: name,
        order: letter.position,
      },
    ];
  });
}

// ---------- Surahs (generated Quran data) ----------

const SURAHS: readonly { number: number; art: string }[] = [
  { number: 1, art: 'object.quran-stand' },
  { number: 103, art: 'pattern.star-tile' },
  { number: 105, art: 'animal.elephant' },
  { number: 107, art: 'object.coins' },
  { number: 108, art: 'pattern.star-tile' },
  { number: 109, art: 'object.book' },
  { number: 110, art: 'pattern.star-tile' },
  { number: 112, art: 'object.quran-stand' },
  { number: 113, art: 'ui.star-filled' },
  { number: 114, art: 'object.book' },
];

function surahCards(): CollectionCard[] {
  return SURAHS.flatMap(({ number, art }) => {
    const surah = getSurah(number);
    if (!surah) return [];
    const name = same(surah.nameTransliterated);
    const meaning = localizedFrom((lang) => surah.nameMeaningLocalized?.[lang] || surah.nameMeaning);
    return [
      {
        id: `surah-${number}`,
        category: 'surahs' as const,
        art,
        title: name,
        subtitle: meaning,
        arabic: surah.nameArabic,
        // Composed only from generated data fields: name meaning, ayah count, Makki/Madani.
        fact: localizedFrom((lang) =>
          translate(lang, 'collection.surahFact', {
            name: surah.nameTransliterated,
            meaning: meaning[lang],
            count: surah.ayahCount,
            place: translate(lang, surah.revelationType === 'madani' ? 'collection.revelation.madani' : 'collection.revelation.makki'),
          }),
        ),
        sources: [
          { sourceName: 'Quran', sourceReference: `${number}:1–${surah.ayahCount}` },
          { sourceName: QURAN_SOURCE.text, sourceReference: '' },
        ],
        unlock: `surah:${number}:memorised`,
        unlockTitle: name,
        order: number,
      },
    ];
  });
}

// ---------- Duas (Quranic duas with editorial context) ----------

const DUAS: readonly { id: string; art: string }[] = [
  { id: 'ibrahim-ismail-acceptance', art: 'place.kaaba' },
  { id: 'musa-ease-and-speech', art: 'object.staff' },
  { id: 'yunus-in-the-darkness', art: 'animal.whale' },
  { id: 'youths-of-the-cave', art: 'object.lantern' },
  { id: 'increase-in-knowledge', art: 'object.book' },
  { id: 'mercy-for-parents', art: 'ui.heart' },
];

function duaCards(): CollectionCard[] {
  return DUAS.flatMap(({ id, art }) => {
    const dua = getDua(id);
    if (!dua) return [];
    return [
      {
        id: `dua-${id}`,
        category: 'duas' as const,
        art,
        title: dua.title,
        subtitle: same(dua.ref),
        fact: dua.context,
        sources: [{ sourceName: dua.sourceName, sourceReference: dua.sourceReference }],
        unlock: `dua:${id}:learned`,
        unlockTitle: dua.title,
      },
    ];
  });
}

// ---------- Good deeds (akhlaq unit lessons) ----------

const DEEDS: readonly { id: string; unitId: string; section: number; art: string }[] = [
  { id: 'deed-sabr', unitId: 'akhlaq-sabr-shukr', section: 0, art: 'garden.sapling' },
  { id: 'deed-shukr', unitId: 'akhlaq-sabr-shukr', section: 1, art: 'food.dates' },
  { id: 'deed-sidq', unitId: 'akhlaq-honesty-trust', section: 0, art: 'object.scroll' },
  { id: 'deed-amanah', unitId: 'akhlaq-honesty-trust', section: 1, art: 'object.coins' },
  { id: 'deed-rahmah', unitId: 'akhlaq-mercy-family', section: 0, art: 'animal.dove' },
  { id: 'deed-parents', unitId: 'akhlaq-mercy-family', section: 1, art: 'ui.heart' },
  { id: 'deed-forgiveness', unitId: 'akhlaq-mercy-family', section: 2, art: 'pattern.star-tile' },
];

function deedCards(): CollectionCard[] {
  return DEEDS.flatMap(({ id, unitId, section, art }) => {
    const unit = getUnit(unitId);
    const lesson = unit?.lesson[section];
    if (!unit || !lesson?.heading) return [];
    return [
      {
        id,
        category: 'deeds' as const,
        art,
        title: lesson.heading,
        ...(lesson.arabic ? { arabic: lesson.arabic } : {}),
        fact: lesson.body,
        sources: unit.sources,
        unlock: `unit:${unitId}:complete`,
        unlockTitle: unit.title,
      },
    ];
  });
}

/** All Learn cards (exported for tests). */
export function learnCollectionCards(): CollectionCard[] {
  return [...letterCards(), ...surahCards(), ...duaCards(), ...deedCards()];
}

/** Achievement keys earned in Learn: letters, surahs, duas, units, quests, master challenges. */
export function learnAchievements(): AchievementKey[] {
  const quest = useQuestStore.getState();
  const learn = useLearnStore.getState();
  const keys: AchievementKey[] = [];
  for (const letter of quest.tracedLetters) keys.push(`letter:${letter}:traced`);
  for (const [number, memo] of Object.entries(quest.memorization)) {
    const surah = getSurah(Number(number));
    if (!surah) continue;
    const learned = new Set(memo.learned);
    let complete = surah.ayahCount > 0;
    for (let ayah = 1; ayah <= surah.ayahCount && complete; ayah++) complete = learned.has(ayah);
    if (complete) keys.push(`surah:${surah.number}:memorised`);
  }
  for (const id of quest.duasLearned) keys.push(`dua:${id}:learned`);
  for (const [id, progress] of Object.entries(learn.units)) if (progress.completed) keys.push(`unit:${id}:complete`);
  for (const [id, progress] of Object.entries(quest.quests)) if (progress.completed) keys.push(`quest:${id}:complete`);
  for (const topic of TOPIC_IDS) if (isMasterPassed(topic, learn.masters)) keys.push(`master:${topic}:passed`);
  return keys;
}

/** Registers the Learn collection cards and achievements (called from `register.ts`). */
export function registerLearnCollection(): void {
  registerCollectionCards('learn', learnCollectionCards());
  registerAchievements('learn', learnAchievements);
}

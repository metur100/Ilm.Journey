import {
  buildLessonCards,
  type LessonCardSource,
  MAX_SENTENCES_PER_CARD,
  normalizeWhitespace,
  splitIntoCardTexts,
  splitSentences,
  TOPIC_FALLBACK_ART,
} from '@/core/components/lesson/cards';
import { LANGUAGES, type Language, type LocalizedText, TOPIC_IDS } from '@/core/models';
import { UNITS } from '@/features/learn/content';
import { questCardSources, unitCardSources } from '@/features/learn/content/artMap';
import { LESSONS } from '@/features/learn/content/quests';

const lt = (en: string, de = en, bs = en): LocalizedText => ({ en, de, bs });

const ALL_LESSONS: { id: string; sources: LessonCardSource[] }[] = [
  ...UNITS.map((u) => ({ id: `unit:${u.id}`, sources: unitCardSources(u) })),
  ...LESSONS.map((l) => ({ id: `lesson:${l.id}`, sources: questCardSources(l) })),
];

describe('splitSentences – tricky cases', () => {
  const cases: [Language, string, string[]][] = [
    ['en', 'Pray. Then rest.', ['Pray.', 'Then rest.']],
    ['en', 'The Quran (5:6) names the face. Then the arms.', ['The Quran (5:6) names the face.', 'Then the arms.']],
    ['en', 'It is named in the Quran (5:6). Then we wash.', ['It is named in the Quran (5:6).', 'Then we wash.']],
    ['en', 'Use a gentle voice, e.g. When you greet. Next.', ['Use a gentle voice, e.g. When you greet.', 'Next.']],
    ['en', 'The Prophet ﷺ taught it. Allah knows best.', ['The Prophet ﷺ taught it.', 'Allah knows best.']],
    ['en', 'Ali was the Prophet\'s ﷺ cousin. He was brave.', ['Ali was the Prophet\'s ﷺ cousin.', 'He was brave.']],
    ['en', 'The word "Quran" means "recitation". It is read aloud.', ['The word "Quran" means "recitation".', 'It is read aloud.']],
    ['en', '(Surah Al-Alaq, "Read!") came first. After that more.', ['(Surah Al-Alaq, "Read!") came first.', 'After that more.']],
    ['en', 'He said: "Take suhoor." Then he prayed.', ['He said: "Take suhoor."', 'Then he prayed.']],
    ['en', 'Would you not love forgiveness? So we pardon.', ['Would you not love forgiveness?', 'So we pardon.']],
    ['en', 'Isha at night – 4. Altogether 17 rak\'ahs.', ['Isha at night – 4.', 'Altogether 17 rak\'ahs.']],
    ['en', 'It costs 2.5 coins. Fine.', ['It costs 2.5 coins.', 'Fine.']],
    ['en', 'Wait... Then go.', ['Wait...', 'Then go.']],
    ['en', '1. Make the intention.\n2. Wash your hands.', ['1. Make the intention.', '2. Wash your hands.']],
    ['en', '• Greet others with salam.\n• Walk calmly.', ['• Greet others with salam.', '• Walk calmly.']],
    ['de', 'Zum Beispiel z. B. Datteln. Danach Wasser.', ['Zum Beispiel z. B. Datteln.', 'Danach Wasser.']],
    ['de', 'Im Jahr 622 n. Chr. wanderte er aus. Danach kam Medina.', ['Im Jahr 622 n. Chr. wanderte er aus.', 'Danach kam Medina.']],
    ['de', 'Er starb im Jahr 11 n. H. (632 n. Chr.) in Medina. Der Koran nennt ihn das Siegel.', ['Er starb im Jahr 11 n. H. (632 n. Chr.) in Medina.', 'Der Koran nennt ihn das Siegel.']],
    ['de', 'Ahmad (gest. 241 n. H.). Sie achteten einander.', ['Ahmad (gest. 241 n. H.).', 'Sie achteten einander.']],
    ['de', 'Sie wurde im 16. Jahrhundert gegründet. Bis heute.', ['Sie wurde im 16. Jahrhundert gegründet.', 'Bis heute.']],
    ['de', 'Ischa in der Nacht – 4. Zusammen 17 Rak\'as.', ['Ischa in der Nacht – 4.', 'Zusammen 17 Rak\'as.']],
    ['de', 'Er sagte: „Lies!“ Dann ging er.', ['Er sagte: „Lies!“', 'Dann ging er.']],
    ['de', 'Die ersten Verse („Lies!“) kamen in Hira. Danach mehr.', ['Die ersten Verse („Lies!“) kamen in Hira.', 'Danach mehr.']],
    ['de', 'Das heißt d. h. Geduld. Gut.', ['Das heißt d. h. Geduld.', 'Gut.']],
    ['bs', 'Godine 622. Poslanik je preselio. Kalendar broji godine.', ['Godine 622. Poslanik je preselio.', 'Kalendar broji godine.']],
    ['bs', 'Preselio je 11. godine po Hidžri (632.). Kur\'an ga naziva pečatom.', ['Preselio je 11. godine po Hidžri (632.).', 'Kur\'an ga naziva pečatom.']],
    ['bs', 'Malo po malo – npr. pola dana – uz roditelje. Bolesni su oslobođeni.', ['Malo po malo – npr. pola dana – uz roditelje.', 'Bolesni su oslobođeni.']],
    ['bs', 'Imam el-Buhari (umro 256. h.) sastavio je Sahih. Šta je to?', ['Imam el-Buhari (umro 256. h.) sastavio je Sahih.', 'Šta je to?']],
    ['bs', 'Učili su to npr. Čitanjem. Đaci su pamtili.', ['Učili su to npr. Čitanjem.', 'Đaci su pamtili.']],
    ['bs', 'Sukun znači bez samoglasnika – بْ. Šedda udvostručuje harf.', ['Sukun znači bez samoglasnika – بْ.', 'Šedda udvostručuje harf.']],
  ];

  it.each(cases)('[%s] %s', (language, text, expected) => {
    expect(splitSentences(text, language)).toEqual(expected);
  });

  it('keeps a single sentence whole', () => {
    expect(splitSentences('Peace', 'en')).toEqual(['Peace']);
    expect(splitSentences('', 'en')).toEqual([]);
  });
});

describe('splitIntoCardTexts', () => {
  const long = (n: number) => Array.from({ length: n }, (_, i) => `Sentence number ${i + 1} is short.`).join(' ');

  it('puts at most three short sentences on a card and balances the cards', () => {
    expect(splitIntoCardTexts(long(3), 'en')).toHaveLength(1);
    const four = splitIntoCardTexts(long(4), 'en');
    expect(four.map((t) => splitSentences(t, 'en').length)).toEqual([2, 2]);
    const seven = splitIntoCardTexts(long(7), 'en');
    expect(seven).toHaveLength(3);
  });

  it('gives a very long sentence its own card instead of cutting it', () => {
    const longSentence = `This ${'very '.repeat(80)}long sentence never gets cut.`;
    const texts = splitIntoCardTexts(`Short one. ${longSentence} Short two.`, 'en');
    expect(texts).toEqual(['Short one.', longSentence, 'Short two.']);
  });

  it('keeps list lines together on a card with their line breaks', () => {
    const steps = Array.from({ length: 8 }, (_, i) => `${i + 1}. Step ${i + 1}.`).join('\n');
    const texts = splitIntoCardTexts(steps, 'en');
    expect(texts).toHaveLength(3);
    expect(texts[0]).toBe('1. Step 1.\n2. Step 2.\n3. Step 3.');
  });
});

describe('lesson content as cards', () => {
  it('covers every unit and quest lesson', () => {
    expect(ALL_LESSONS.length).toBe(UNITS.length + LESSONS.length);
    expect(ALL_LESSONS.every((l) => l.sources.length > 0)).toBe(true);
  });

  for (const language of LANGUAGES) {
    it(`[${language}] preserves every section text exactly and keeps cards short`, () => {
      const problems: string[] = [];
      for (const lesson of ALL_LESSONS) {
        const cards = buildLessonCards(lesson.sources, { fallbackArt: 'ui.star', language });
        for (const source of lesson.sources) {
          const own = cards.filter((c) => c.sourceId === source.id);
          const original = source.body[language];
          if (normalizeWhitespace(own.map((c) => c.text).join(' ')) !== normalizeWhitespace(original)) problems.push(`${source.id}: text changed`);
          for (const card of own) {
            expect(card.partCount).toBe(own.length);
            const sentences = splitSentences(card.text, language);
            if (sentences.length > MAX_SENTENCES_PER_CARD) problems.push(`${card.id}: ${sentences.length} sentences`);
            // Each card is a run of whole sentences of the original.
            const all = splitSentences(original, language);
            if (!sentences.every((s) => all.includes(s))) problems.push(`${card.id}: cut inside a sentence`);
          }
        }
      }
      expect(problems).toEqual([]);
    });
  }
});

describe('interactions', () => {
  const sections: LessonCardSource[] = [
    { id: 's#0', body: lt('Salah is the prayer.'), arabic: 'صَلَاة', transliteration: 'salah' },
    { id: 's#1', heading: lt('Fajr'), body: lt('Fajr is at dawn. It has 2 rak\'ahs.') },
    { id: 's#2', heading: lt('Dhuhr'), body: lt('Dhuhr is after midday.') },
    { id: 's#3', heading: lt('Asr'), body: lt('Asr is in the afternoon.'), arabic: 'الْعَصْر' },
    { id: 's#4', body: lt('Pray on time.'), art: 'object.clock' },
  ];

  it('chooses flip, reveal, match and none by the documented rules', () => {
    const cards = buildLessonCards(sections, { fallbackArt: 'place.masjid', language: 'en' });
    expect(cards.map((c) => [c.sourceId, c.interaction.kind])).toEqual([
      ['s#0', 'flip'],
      ['s#1', 'reveal'],
      ['s#2', 'match'],
      ['s#3', 'flip'],
      ['s#4', 'none'],
    ]);
    const match = cards[2].interaction;
    if (match.kind !== 'match') throw new Error('expected match');
    expect(match.answer).toBe('Dhuhr');
    expect([...match.options].sort()).toEqual(['Dhuhr', 'Fajr']);
    expect(cards[0].arabic).toBe('صَلَاة');
    expect(cards[0].transliteration).toBe('salah');
    expect(cards[4].art).toBe('object.clock');
    expect(cards[1].art).toBe('place.masjid');
  });

  it('gives continuation cards no interaction and no Arabic', () => {
    const long = Array.from({ length: 6 }, (_, i) => `This is sentence ${i + 1} of a rather long section body.`).join(' ');
    const cards = buildLessonCards([{ id: 'x#0', heading: lt('Title'), body: lt(long), arabic: 'سَلَام' }], { fallbackArt: 'ui.star', language: 'en' });
    expect(cards.length).toBeGreaterThan(1);
    expect(cards[0].interaction.kind).toBe('flip');
    expect(cards.slice(1).every((c) => c.interaction.kind === 'none' && !c.arabic && c.heading === 'Title')).toBe(true);
  });

  it('has no match card with fewer than two different headings', () => {
    const cards = buildLessonCards(
      [
        { id: 'a#0', heading: lt('Example'), body: lt('One.') },
        { id: 'a#1', heading: lt('Example'), body: lt('Two.') },
      ],
      { fallbackArt: 'ui.star', language: 'en' },
    );
    expect(cards.map((c) => c.interaction.kind)).toEqual(['reveal', 'reveal']);
  });

  it('is deterministic and has at most one match card per lesson', () => {
    for (const language of LANGUAGES) {
      for (const lesson of ALL_LESSONS) {
        const a = buildLessonCards(lesson.sources, { fallbackArt: 'ui.star', language });
        const b = buildLessonCards(lesson.sources, { fallbackArt: 'ui.star', language });
        expect(a).toEqual(b);
        const matches = a.filter((c) => c.interaction.kind === 'match');
        expect(matches.length).toBeLessThanOrEqual(1);
        for (const card of a) {
          const source = lesson.sources.find((s) => s.id === card.sourceId)!;
          if (card.part === 0 && source.arabic) expect(card.interaction.kind).toBe('flip');
          if (card.interaction.kind === 'match') {
            expect(card.interaction.options).toContain(card.heading);
            expect(new Set(card.interaction.options).size).toBe(2);
          }
          if (card.interaction.kind === 'reveal') expect(card.heading).toBeTruthy();
        }
      }
    }
  });

  it('has a fallback illustration for every topic', () => {
    for (const topic of TOPIC_IDS) expect(TOPIC_FALLBACK_ART[topic]).toMatch(/^[a-z]+\.[a-z0-9-]+$/);
  });
});

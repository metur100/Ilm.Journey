# Ilm Journey – design

Ilm Journey combines the four Certi Development Islamic learning apps into one app:

| Source app (folder in `../`) | Becomes |
| --- | --- |
| `knowledge-rpg` (base of this repo) | **Learn** topics: units (learn → practice → test) + master challenges, hero, quests, knowledge radar |
| `islam-quest` | **Learn** topics: beginner quests (story/lesson/game/memorization steps), Arabic tracing, Quran recitation & memorization, Ramadan calendar, daily challenge ideas |
| `story-of-the-prophets` | **Stories** tab: 8 interactive prophet stories (INTRO → STORY → INTERACTION → … → QUIZ → REWARD), story map |
| `sira` | **Seerah** tab: 10 episodes, timeline, map, people, places, connections, bookmarks, reflections, search |

The source apps stay untouched. Content JSON is copied, never retyped. Religious-accuracy rules of all four apps apply
unchanged: sources on every lesson/question, no invented verses/hadith/dialogue, prophets never depicted, "scholars
differ" notes, Quran text only from generated data.

## Product

- Name: **Ilm Journey** (store title "Ilm Journey: Learn Islam"). Slug `ilm-journey`, scheme `ilmjourney`,
  bundle/package `com.certidevelopment.ilmjourney`. Author/credit: Medin Turkes · Certi Development.
- Audience: families – children (7+) with parents, teens and adults. One profile per device.
- Free, no ads, no purchases, no accounts, no tracking, fully offline (only optional network use: streaming a Quran
  recitation when the user taps "Listen", as in islam-quest). Languages: Bosnian (`bs`), German (`de`), English (`en`).
- Light and dark mode (system / light / dark), large text, high contrast, reduced motion, screen-reader labels,
  48 dp touch targets.

## Navigation (Expo Router, `src/app/`)

Bottom tabs:

1. **Home** `(tabs)/index` – greeting + hero, "Continue" card (last unit/quest/story/episode), daily challenge,
   today's quests, streak, reviews due, "Today's Seerah", recently completed.
2. **Learn** `(tabs)/learn` – 8 topics (Salah, Quran, Prophets, Seerah, Akhlaq, Ramadan, History, Arabic), all open
   from the start. `topic/[id]` shows ONE path per topic: islam-quest beginner quests (where the topic has them) →
   knowledge-rpg units → master challenge; items unlock in order inside a path. Topic pages also show the topic's
   tools: Quran → memorization (surah list + Quranic duas), Arabic → alphabet & tracing, Ramadan → 30-day calendar,
   Prophets → link to Stories, Seerah → link to the Seerah tab.
3. **Stories** `(tabs)/stories` – the 8 prophet stories (story-of-the-prophets), story map. islam-quest's "prophets"
   world duplicates these stories and is NOT ported as quests; any unique questions may be merged into the stories.
4. **Seerah** `(tabs)/seerah` – sira's journey: episodes list + entry points to timeline, map, people, explore,
   search, bookmarks, reflections.
5. **Profile** `(tabs)/profile` – hero/character, name, level/XP, knowledge radar over the 8 topics, badges, review
   centre, bookmarks, reflections, settings, about/privacy/sources.

## Architecture

```
src/
  app/                      routes (tabs + feature routes below)
  core/                     shared platform – every feature depends only on core, never on another feature
    models/                 Language, LocalizedText, SourceRef, SceneSpec, Question (superset), progress types
    i18n/                   translate()/localize(), dictionaries per namespace (core + one per feature)
    theme/                  palettes light/dark (+ high contrast), topic themes, spacing, fonts, useTheme()
    components/ui|questions|scene|character|game
    services/               xp, levels, streak, review (Leitner), badges, daily, sound, haptics, speech
    store/                  useAppStore: settings, profile, xp, streak, review queue, badges, stats, celebrations
    storage/                AsyncStorage persistence with versioned migration (one key per store)
    registry.ts             content registry: features register question lookups, badge rules, daily items
  features/
    learn/                  knowledge-rpg units/masters/quests + islam-quest quests/tools; own store slice
    stories/                story-of-the-prophets; own store
    seerah/                 sira; own store
    quran/                  surahs + duas data, memorization (used by learn)
```

### Core contract (what features use)

- `useAppStore` (core) owns everything global: `settings` (language, themeMode, sound, haptics, narration,
  reducedMotion, largeText, highContrast, reminders), `profile` (name, character, learner group), `xp`, `streak`,
  `review` (Record<questionKey, ReviewItem>), `correctlyAnswered`, `badges`, `stats`, `dailyCompleted`,
  `celebrations`.
- Question keys are globally unique strings `"<feature>:<questionId>"` (e.g. `learn:salah-wudu-q3`,
  `stories:adam-q2`, `seerah:e01-q4`, `quest:salah-q7`).
- `recordAnswer({ key, topic, topicArea }, correct, mode)` → XP (granted once per key), review queue, stats, streak.
- `awardXp(reason: string, amount)` – idempotent per reason key (e.g. `story:adam:complete`).
- `registerActivity()` – meaningful learning for the streak.
- `registry.registerQuestions(feature, lookup)` so the global review centre and daily challenge can render any
  question with the shared `QuestionView`.
- Badges: one merged badge list in core (union of the four apps, duplicates merged – e.g. "first lesson",
  "7-day learner"), rules evaluated from global stats + feature progress via the registry.
- Feature stores keep only feature progress (units/masters/quests, story runs, episode progress, bookmarks,
  reflections, discoveries, Ramadan deeds) and persist under their own storage key.

### Theme

The playful islam-quest / knowledge-rpg look (Nunito, Noto Naskh Arabic, Amiri Quran, night/gold/teal palette,
topic gradients) is the base. Every screen must work in dark mode (sira already has a dark palette – reuse its
approach). Sira screens adopt the shared design system (Lora may stay for long-form Seerah reading).

## Content

- `src/features/learn/content/` – knowledge-rpg areas/units (as is) + islam-quest worlds/lessons/questions/quests
  (salah, quran, akhlaq, ramadan, arabic; not prophets). Question/lesson ids are prefixed to stay unique.
- `src/features/stories/content/` – story-of-the-prophets `prophets/*.json`, places.
- `src/features/seerah/content/` – sira episodes, events, people, places, routes, questions, sources, themes.
- `src/features/quran/data/` – **new**: complete Juz ʿAmma (surahs 78–114) + Al-Fatiha, and a collection of Quranic
  duas, generated by `scripts/generate-quran.mjs` from api.alquran.cloud (quran-uthmani, en.sahih, de.bubenheim,
  bs.korkut, en.transliteration), the same sources as islam-quest. Basmala handling identical to islam-quest's file.
- A content validation test checks unique ids, cross-references, all three languages and sources everywhere.

## Quality

`npm run verify` (typecheck + lint + jest) must pass; `npx expo export --platform android` must succeed; the app is
run on the Android emulator for screenshots.

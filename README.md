# Ilm Journey: Learn Islam

**Website:** https://metur100.github.io/Islam.Apps.Landing/en/ilm-journey/ · **Privacy policy:** https://metur100.github.io/Islam.Apps.Landing/en/ilm-journey/privacy/ ([de](https://metur100.github.io/Islam.Apps.Landing/de/ilm-journey/privacy/), [bs](https://metur100.github.io/Islam.Apps.Landing/bs/ilm-journey/privacy/))

One Islamic learning app for families – children (7+) with their parents, teenagers and adults. Ilm Journey combines
the four Certi Development learning apps (Knowledge RPG, Islam Quest, Story of the Prophets, Sira) into one journey:
short topic lessons, beginner quests, interactive prophet stories and a source-based journey through the Seerah.

- Free, no ads, no purchases, no accounts, no tracking
- Fully offline (the only optional network use is streaming a Quran recitation when the learner taps “Listen”)
- Bosnian, German and English · light and dark mode · larger text, high contrast, reduced motion, screen-reader labels
- Expo SDK 57 (React Native 0.86) + TypeScript, Expo Router, Zustand, AsyncStorage

Design spec: [`docs/DESIGN.md`](docs/DESIGN.md) · v2 concept: [`docs/GAMES.md`](docs/GAMES.md) · game authors: [`docs/GAMES-FRAMEWORK.md`](docs/GAMES-FRAMEWORK.md) · porting guide: [`docs/FEATURE-PORTING.md`](docs/FEATURE-PORTING.md)

## Tabs

| Tab | What it does |
| --- | --- |
| **Home** | The Ilm Garden (sky follows the real time of day; learning waters it, milestones bring seeds to plant), level and streak, game of the day, “Continue”, today’s quests, reviews due, “Today’s Seerah” |
| **Learn** | Eight topics – Salah, Quran, Prophets, Seerah, Akhlaq, Ramadan, Islamic History, Arabic – all open. Each topic has ONE path (beginner quests → units: learn → practise → test → why it matters → Master Challenge) where steps unlock in order, plus topic tools (Quran memorization, Arabic tracing, Ramadan calendar, links to Stories and Seerah) |
| **Play** | Mini-games on an illustrated shelf grouped by topic, with stars, “New” markers and the game of the day (game framework in `src/core/games`) |
| **Stories** | Segmented: *Prophets* (eight interactive prophet stories and the story map) · *Seerah* (episodes, timeline, map, people, places, search, bookmarks, reflections); `/seerah` opens the Seerah segment |
| **Me** | Hero editor with level wardrobe, level/XP, streak, Ilm Garden, collection album, knowledge radar, 28 badges, statistics, global review centre, settings, about/privacy/sources |

Onboarding: welcome → language → who is learning (child / teen / adult – only changes recommendations) → name →
hero → how it works → start. Settings: language, appearance (system/light/dark), sounds, vibration, narration,
larger text, high contrast, reduced motion, an optional daily reminder, reset progress (with confirmation).

## Religious accuracy

Carried over unchanged from the four source apps:

- Content lives in JSON, separate from code, and is copied from the source apps – never retyped. Every lesson, story,
  episode and question carries its sources (surah:ayah, hadith collection, Ibn Hisham, …).
- No invented Quran verses, hadith, stories, dialogue, dates or rulings. Where details could not be verified they are
  left out; where scholars or sources differ, the app shows a “Scholars differ” note.
- **Quran text is never typed by hand** – it comes only from generated data (`scripts/generate-quran.mjs`, Tanzil
  Uthmani text via api.alquran.cloud with Saheeh International, Bubenheim & Elyas and Besim Korkut translations).
- Prophets (and the Prophet ﷺ) are never depicted: illustrations show only landscapes, architecture, weather and
  objects (`src/core/components/scene/SceneView.tsx`). The customisable hero is the learner, never a real person.
- Seerah statements are labelled as established fact, historical interpretation or reflection; map positions are
  approximate and labelled as such.
- The app is a learning companion: it gives no fatwas and does not replace teachers or formal study.

## Structure

```
src/
  app/            Expo Router routes – thin files; feature screens live in src/features/*
  core/           shared platform (features depend only on core)
    models/       Language, LocalizedText, SourceRef, TopicId, Question superset, progress, badges
    i18n/         translate/localize/useI18n + core dictionaries (en/de/bs) + feature namespaces
    theme/        light/dark/high-contrast palettes, topic themes, tokens, useTheme/makeStyles, contrast checks
    components/   ui/, questions/ (QuestionView for every type), scene/, character/, game/, onboarding/
    services/     xp, streak, review (Leitner), quiz, badges, daily, quests, knowledge, engine, sound, speech, notifications
    store/        useAppStore (global state) + onboarding draft
    storage/      versioned AsyncStorage persistence with migrations (one key per store)
    registry.ts   how features plug in: questions, renderers, progress, daily, quests, search, lifecycle, home/profile
  features/
    learn/        knowledge-rpg units + master challenges (islam-quest quests/tools plug in here)
    stories/      story-of-the-prophets
    seerah/       sira
    quran/        generated Quran data (surahs + Quranic duas)
scripts/          generate-icons.js, generate-sounds.js, check-contrast.mjs, generate-quran.mjs
```

## Scripts

```bash
npm install
npm start                 # Expo dev server
npm run android           # development build on a device/emulator
npm run verify            # typecheck + lint + tests
npm run check:contrast    # WCAG AA check of all palettes and topic headers
npm run generate:icons    # re-render icons (open book + eight-pointed star + crescent)
npm run generate:sounds   # re-synthesise the UI sounds
```

Android release build:

```bash
npx expo prebuild --platform android
cd android && ./gradlew bundleRelease assembleRelease
```

Release builds are signed with the upload key from `~/.gradle/gradle.properties` (see `plugins/withReleaseSigning.js`):
`ILM_JOURNEY_UPLOAD_STORE_FILE`, `ILM_JOURNEY_UPLOAD_STORE_PASSWORD`, `ILM_JOURNEY_UPLOAD_KEY_ALIAS`,
`ILM_JOURNEY_UPLOAD_KEY_PASSWORD`. Without them the build falls back to the debug key. `android/` is generated
(Continuous Native Generation) and not committed.

## Privacy

No data leaves the device. Name, hero and progress are stored locally and can be deleted in Settings → Reset progress.

---

Medin Turkes · Certi Development

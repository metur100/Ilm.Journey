# Feature porting guide (phase 2)

Three ports run in parallel on top of the core platform:

| Port | Source app (read only, `../<app>`) | Feature folder |
| --- | --- | --- |
| **islam-quest** | `islam-quest` | `src/features/learn/quests/**` (+ `src/features/learn/tools/**`, `src/features/learn/content/quests/**`) |
| **stories** | `story-of-the-prophets` | `src/features/stories/**` |
| **seerah** | `sira` | `src/features/seerah/**` |

`src/features/quran/**` (generated Quran data + duas, `scripts/generate-quran.mjs`) belongs to the Quran data work and
is used by the islam-quest port (the only allowed feature → feature import: `learn` may import `@/features/quran`).

Read `docs/DESIGN.md` first. Never modify the four source apps. Copy content JSON – never retype it.

## 1. Ownership – who may touch what

Each port only creates/edits files inside its own folders and its own routes:

| Port | Own files | Own routes (`src/app/…`) |
| --- | --- | --- |
| islam-quest | `src/features/learn/quests/**` (entry: `quests/register.ts`, already called by learn), `src/features/learn/tools/**`, `src/features/learn/content/quests/**`, `src/features/learn/__tests__/quests*.test.ts` | `quest/[id].tsx`, `lesson/[id].tsx`, `tools/**` (e.g. `tools/quran.tsx`, `tools/quran/[surah].tsx`, `tools/duas.tsx`, `tools/arabic.tsx`, `tools/arabic/[letter].tsx`, `tools/ramadan.tsx`) |
| stories | `src/features/stories/**` (entry: `stories/register.ts`, tab screen: `stories/screens/StoriesScreen.tsx`) | `story/[id].tsx`, `story/play/[id].tsx`, `story/map.tsx` |
| seerah | `src/features/seerah/**` (entry: `seerah/register.ts`, tab screen: `seerah/screens/SeerahScreen.tsx`) | `seerah/<screen>.tsx` – e.g. `seerah/episode/[id].tsx`, `seerah/event/[id].tsx`, `seerah/person/[id].tsx`, `seerah/place/[id].tsx`, `seerah/source/[id].tsx`, `seerah/theme/[id].tsx`, `seerah/list/[type].tsx`, `seerah/connections/[type]/[id].tsx`, `seerah/timeline.tsx`, `seerah/map.tsx`, `seerah/explore.tsx`, `seerah/search.tsx`, `seerah/bookmarks.tsx`, `seerah/reflections.tsx` (no `seerah/index.tsx` and no `seerah/_layout.tsx` – `/seerah` is the tab) |

Already wired – **do not edit**:

- `src/app/(tabs)/stories.tsx` → `@/features/stories/screens/StoriesScreen`; `src/app/(tabs)/seerah.tsx` →
  `@/features/seerah/screens/SeerahScreen`. Replace the placeholder *screen files* in your feature instead.
- `src/features/index.ts` already calls `registerLearnFeature()`, `registerStoriesFeature()`, `registerSeerahFeature()`;
  `src/features/learn/register.ts` already calls `registerLearnQuests()` from `src/features/learn/quests/register.ts`.
- Everything in `src/core/**`, `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, the other tab screens, global
  screens (`review`, `daily`, `badges`, `settings`, `character`, `info/[page]`, onboarding), `package.json`,
  `app.json`, other features. The islam-quest port must not edit the existing knowledge-rpg files of `features/learn`
  (`register.ts`, `path.ts`, `extensions.ts`, `store/`, `screens/`, `content/*.json`); it plugs in via
  `extensions.ts`.

**Core files a port may extend: none.** If you find a real core bug or miss an extension point, keep the change
minimal, additive and clearly separated, and mention it in your final report. All packages you need are already
installed (`expo-notifications`, `@expo-google-fonts/lora`, `react-native-svg`, `expo-speech`, `expo-audio`, …).
Feature routes use the root Stack (no extra `_layout.tsx` needed).

Route files are thin re-exports:

```tsx
// src/app/story/[id].tsx
export { default } from '@/features/stories/screens/StoryScreen';
```

## 2. Folder layout of a feature

```
src/features/<feature>/
  register.ts            registerXFeature(): all registry calls (imported once by src/features/index.ts)
  content/               copied JSON + typed loader (index.ts)
  models.ts              feature types (extend core types, e.g. Story, Episode)
  i18n/{en,de,bs}.ts     feature dictionary + i18n/index.ts (defineNamespace)
  store/<feature>Store.ts zustand store + persistence spec
  services/              pure logic (flow, unlocking, progress, search …)
  components/  screens/
  __tests__/             content validation + logic tests
```

## 3. Core API you use

```ts
import { useAppStore } from '@/core/store/appStore';
```

| Action | Use |
| --- | --- |
| `recordAnswer({ key, topic, topicArea }, correct, mode)` | every scored answer; XP once per key; mistakes go to the global review queue; counts for the streak. `mode`: `'test' \| 'quiz' \| 'master' \| 'review' \| 'daily' \| 'practice'` (practice = ignored). Returns XP (incl. quest XP). |
| `awardXp(reason, amount)` | idempotent per reason key, returns granted XP (0 if already granted). Amounts: `XP` in `core/services/xp.ts` (`storyComplete`, `perfectStoryBonus`, `storyLessonLearned`, `questLesson`, `questComplete`, `perfectQuestBonus`, `episodeComplete`, `perfectEpisodeQuizBonus`). |
| `registerActivity()` | meaningful learning finished today (story/episode/quest completed) – streak |
| `reportQuestEvent({ type: 'complete', target })` | completes today's quest with that target, returns quest XP |
| `refreshBadges()` | re-evaluate badges after feature progress changed without an `awardXp` call |
| `setCelebrationsPaused(true/false)` | pause badge/level pop-ups while a player screen is open |
| `settings` / `profile` | `language`, `themeMode`, `sound`, `haptics`, `narration`, `reducedMotion`, `largeText`, `highContrast`; `profile.learnerGroup` (`child`/`teen`/`adult`) – **only** for recommendations/tone, never to lock content |

**Order matters:** update your feature store first, *then* call `awardXp` / `registerActivity` / `reportQuestEvent`
(they evaluate badges with your metrics). See `features/learn/store/learnStore.ts → completeUnit` for the pattern.

### Keys and naming

| What | Format | Examples |
| --- | --- | --- |
| Question key (global) | `"<prefix>:<questionId>"` via `questionKey(prefix, id)` | `learn:salah-wudu-q3`, `quest:salah-q7`, `stories:adam-q2`, `seerah:e01-q4` |
| Prefixes | `learn` (knowledge-rpg units), `quest` (islam-quest), `stories`, `seerah` | |
| XP reason | `<prefix>:<item>:<event>` | `stories:adam:complete`, `stories:adam:perfect`, `quest:salah-wudu:complete`, `seerah:e01:complete` |
| Quest target | `<prefix>:<kind>:<id>` | `stories:story:adam`, `seerah:episode:e01`, `quest:salah-wudu` |
| Storage key | `storageKey('<feature>')` → `ilmjourney:<feature>` | `ilmjourney:stories`, `ilmjourney:seerah`, `ilmjourney:quest` |
| i18n namespace | feature name | `stories`, `seerah`, `quest` |

Question ids must be unique inside their prefix (validate in your content test). Set the topic fields on questions:
`topic` (free text for review weakness), `areaId` (TopicId: islam-quest `worldId` → topic, stories → `prophets`,
seerah → `seerah`), `storyId` / `episodeId`. Sira questions keep `sourceIds` and `kind` (the label pill shows
`q.kind.<kind>`); give them `topic` (e.g. the episode id) when mapping.

## 4. Registering with the core (`src/core/registry.ts`)

```ts
// src/features/stories/register.ts
import { registerDailyPool, registerLifecycle, registerProgress, registerQuestionRenderer, registerQuestions,
  registerQuestProvider, registerSearch } from '@/core/registry';
import { questionKey } from '@/core/models';
import './i18n'; // defines the "stories" namespace (or import something from it)

export function registerStoriesFeature(): void {
  // 1. Questions – the global review centre and daily challenge render them with QuestionView.
  registerQuestions('stories', {
    get: (id) => getStoryQuestion(id),
    context: (id) => ({ title: storyOfQuestion(id)?.title, topicArea: 'prophets', icon: 'scroll' }),
  });

  // 2. Renderer for types that need feature data (stories: 'map'; islam-quest: 'missingWord', 'ayahOrder').
  registerQuestionRenderer('map', { Component: StoryMapQuestion });

  // 3. Progress: badge metrics, knowledge radar pool, home "Continue" + "Recently completed".
  registerProgress('stories', {
    subscribe: (listener) => useStoriesStore.subscribe(listener),
    metrics: () => ({ 'stories.completed': n, 'stories.allCompleted': all ? 1 : 0, 'stories.sabrLessonsLearned': sabr ? 1 : 0, perfectRuns: perfectStories }),
    topicQuestionKeys: () => ({ prophets: quizQuestions.map((q) => questionKey('stories', q.id)) }),
    continueItem: () => (inProgress ? { key, title, subtitle, icon: 'scroll', topicArea: 'prophets', href: { pathname: '/story/play/[id]', params: { id } }, updatedAt, progress } : null),
    recentlyCompleted: () => completed.map((s) => ({ key, title, icon: 'scroll', topicArea: 'prophets', href, completedAt })),
  });

  // 4. Daily challenge pool (self-contained scored questions) and today's quest suggestions.
  registerDailyPool('stories', () => quizQuestions.map((q) => ({ key: questionKey('stories', q.id), question: q })));
  registerQuestProvider('stories', () => (next ? [{ id: `stories-${next.id}`, kind: 'story', target: `stories:story:${next.id}`, title: next.title, topicArea: 'prophets', priority: 5 }] : []));

  // 5. Search (the Seerah search screen can show everything via searchAll()).
  registerSearch('stories', (query, language) => searchStories(query, language));

  // 6. Lifecycle: hydrate at start, reset with "Reset progress", auto-save.
  registerLifecycle('stories', {
    hydrate: () => useStoriesStore.getState().hydrate(),
    reset: () => useStoriesStore.getState().reset(),
    autoSave: startStoriesAutoSave,
  });
}
```

More extension points:

| Function | Used by |
| --- | --- |
| `registerSourceResolver('seerah', (ids, question) => SourceRef[])` | seerah – resolves `sourceIds` for the feedback panel |
| `registerHomeSection({ id: 'todays-seerah', order: 50, Component })` | seerah – "Today's Seerah" card (core cards: continue 10, daily 20, review 30, quests 40, knowledge 60, recent 80) |
| `registerProfileLink({ id, order, icon, label: (lang) => string, href })` | seerah – bookmarks, reflections |
| `searchAll(query, language)` | seerah search screen ("search everything") |
| `getQuestionByKey(key)` | resolving any question |

Learn extension points (`src/features/learn/extensions.ts`, islam-quest port):

```ts
registerPathSource({ id: 'quests', order: 10, items: (topic) => questsOf(topic).map((q) => ({
  kind: 'quest', id: q.id, title: q.title, description: q.description, icon: 'flag',
  href: { pathname: '/quest/[id]', params: { id: q.id } }, completed: isDone(q.id), target: `quest:${q.id}` })) });
registerTopicTool({ id: 'quran-memorization', topic: 'quran', order: 20, icon: 'quran',
  label: (lang) => translateNs(questI18n, lang, 'tools.quran'), description: …, href: '/tools/quran' });
```

Path items unlock in order inside a topic (quests at order 10 → units at 50 → master challenge at 100). The topic
screen re-renders on `registerProgress({ subscribe })` notifications, so register a progress reporter for the quest
store too. islam-quest's "prophets" world is not ported (the Stories tab covers it); worlds map to topics
salah/quran/akhlaq/ramadan/arabic.

## 5. Badge metrics each port must report

The merged badge list is in `src/core/services/badges.ts` (28 badges). Report via `registerProgress(...).metrics()`:

| Port | Metrics |
| --- | --- |
| islam-quest (`registerProgress('quest', …)`) | `lessonsCompleted` (lessons read), `learn.questsCompleted`, `perfectRuns` (quests without a mistake). Do **not** report `learn.topicsStarted` / `learn.mastered.*` (learn computes them from the whole path). |
| stories | `stories.completed`, `stories.allCompleted` (0/1), `stories.sabrLessonsLearned` (0/1), `perfectRuns` (perfect stories) |
| seerah | `seerah.episodesCompleted`, `seerah.makkahCompleted` (0/1), `seerah.madinahCompleted` (0/1), `seerah.timelineCompleted` (0/1), `seerah.peopleCompleted` (0/1), `seerah.reflections`, `seerah.episodesPassed` (≥ 70 % quiz), `seerah.allEpisodesCompleted` (0/1) |

Core computes `correctlyAnswered`, `reviewsCorrect`, `dailyCompleted`, `streakLongest` itself. Shared metrics are summed.

## 6. i18n

Core keys (common, tabs, player labels, question hints, badges, settings, …) are in `src/core/i18n/dictionaries`.
Do not edit them – add your own namespace:

```ts
// src/features/stories/i18n/en.ts
const en = { 'list.title': 'Stories of the Prophets', 'player.exitTitle': 'Pause this story?' } as const;
export type StoriesKey = keyof typeof en;
export default en;
// de.ts / bs.ts: `const de: Record<StoriesKey, string> = { … }` (TypeScript enforces completeness)

// src/features/stories/i18n/index.ts
import { defineNamespace, useNamespace } from '@/core/i18n';
export const storiesI18n = defineNamespace('stories', { en, de, bs });
export const useStoriesI18n = () => useNamespace(storiesI18n); // t() accepts stories keys AND core keys
```

Outside React: `translateNs(storiesI18n, language, key, params)`; composed LocalizedText (e.g. quest titles):
`localizedFrom((lang) => translateNs(…))`. Topic names: `t(topicName('prophets'))`. The i18n test checks every
registered namespace for en/de/bs completeness and identical placeholders – make sure your `register.ts` imports
your i18n module. Bosnian is ijekavian Latin, matching the source apps; copy existing translations from the source
dictionaries. Reuse core keys instead of duplicating them (`common.*`, `q.*`, `player.*`, `a11y.*`, `reward.*`).

## 7. Theme and UI

- Colours only through the theme: `const { c, dark } = useTheme()` and `const useStyles = makeStyles((c) => ({ … }))`.
  No hex literals or static colour imports in styles (exception: illustration artwork such as SceneView/map art).
  Palette keys: `background`, `surface`, `surfaceAlt`, `border`, `text`, `textMuted`, `primary`/`onPrimary`/
  `primaryText`/`primarySoft`, `gold`/`onGold`/`goldText`/`goldSoft`, `night`/`nightSoft`/`onNight`/`onNightMuted`
  (always-dark surfaces), `success`/`error`/`info` (+ `Soft`, `onStatus`), `onAccent` (on topic colours), `locked`.
  Run `npm run check:contrast` if you add colour pairs.
- Topic colours/icons/scenes: `topicThemes[topicId]`. Sira's fact/interpretation/reflection colours: map to
  `info`, `gold`, `primary` tints (or add feature-local colours derived from the palette in your own module).
- Components: `Screen`, `TopBar`, `HeroHeader` (dark header; sets the status bar), `Card` (`tone`), `Button`
  (`variant`), `AppText` (`variant`, incl. `reading` = Lora for long Seerah/story text; `script="quran"` only for
  verified Quran text), `Icon` (incl. the Sira icon set: timeline, compass, search, bookmark, people, pin, kaaba, …),
  `ProgressBar`, `SectionHeader`, `SettingRow` (`ToggleRow`, `LinkRow`, `ChoiceRow`), `States` (`EmptyState`, …),
  `Badge`, `Stars`, `SourceList`/`DifferenceNote`, `AppModal`/`Dialog`, `SceneView`, `RewardAnimation`,
  `QuestionView` (all question types), `SequenceBuilder`, `AnswerOption`.
- Hooks: `useI18n`, `useFeedback` (sound + haptics), `useReducedMotion`, `useStatusBar(onDark)`, `useSummary`,
  `useProgressVersion`. Narration: `deviceNarration.speak(text, language)` from `core/services/speech` when
  `settings.narration` is on.
- Accessibility: 48 dp touch targets (`TOUCH_TARGET`), labels/roles on every control, respect reduced motion.

## 8. Feature stores and persistence

```ts
export const STORIES_PERSIST: PersistSpec<StoriesData> = {
  key: storageKey('stories'), version: 1,
  migrations: {},                       // add step migrations when the shape changes (n → n+1)
  sanitize: (raw) => (raw && typeof raw === 'object' ? withDefaults(EMPTY, raw) : null),
};
hydrate: loadPersisted(STORIES_PERSIST) · reset: clearPersisted(STORIES_PERSIST) + set(EMPTY)
autoSave: () => autoSave(useStoriesStore, STORIES_PERSIST, (s) => (s.hydrated ? pick(s) : undefined))
```

Global things (XP, streak, review, badges, settings, profile) live only in `useAppStore`; feature stores keep only
feature progress (story runs, learned lessons, episode steps, bookmarks, reflections, discoveries, quests, Ramadan
deeds, memorization). Corrupt data must never crash – sanitize everything.

## 9. Tests and verification

Put tests in `src/features/<feature>/__tests__/`: content validation (unique ids, cross-references, all three
languages, sources everywhere, no invented links), flow/progress logic, store + registry integration (see
`features/learn/__tests__/learnStore.test.ts`). Then run:

```bash
npm run typecheck && npm run lint && npm test
npx expo export --platform android --output-dir dist-check   # then delete dist-check
```

## 10. Religious accuracy (unchanged from the source apps)

Sources on every lesson/question/scene, no invented verses/hadith/dialogue/dates, prophets never depicted (only
SceneView landscapes/objects), "scholars differ" notes where relevant, Quran text only from generated data
(`@/features/quran`), map positions approximate and labelled.

## 11. v2 engagement extension points

| What | How |
| --- | --- |
| Garden seeds | Automatic: completion targets reported with `reportQuestEvent({ type: 'complete', target })` that follow `<prefix>:<kind>:<id>` with kind `unit`/`master`/`story`/`episode`, beginner quests `quest:<id>` and game levels `game:<id>:<level>` pay seeds once (`milestoneFromTarget`, `EARN_TABLE` in `core/garden/rules.ts`). Learning activity (`recordAnswer`, `registerActivity`, daily, review) waters the garden. Features never call `earn()` directly. |
| Collection cards | `registerCollectionCards(feature, cards)` with cards built from the feature's own content (fact + sources copied) and `registerAchievements(feature, () => keys)` reporting the earned achievement keys (`story:<id>:complete`, `episode:<id>`, `surah:<n>:memorised`, `dua:<id>:learned`, `letter:<x>:traced`, `unit:<id>:complete`, `quest:<id>:complete`, `master:<topic>:passed`). See `features/*/collection.ts`. |
| Games | `registerGame(def)` – see [GAMES-FRAMEWORK.md](GAMES-FRAMEWORK.md). |
| Review without scoring | `useAppStore.queueReview({ key, topic, topicArea })` |
| Tabs | Home · Learn · Play · Stories (*Prophets* \| *Seerah* segments; `/seerah` and `/(tabs)/stories?segment=seerah` open the Seerah) · Me. |

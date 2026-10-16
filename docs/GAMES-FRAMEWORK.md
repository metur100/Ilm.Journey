# Game framework – guide for game authors

This is the exact contract for every mini-game (v3: [GAMES-V3.md](GAMES-V3.md); principles: [GAMES.md](GAMES.md)).
**New games are built with the casual game kit – see [§11 Kit](#11-kit-casual-game-engines).** Read GAMES.md (principles, catalogue),
DESIGN.md (religious accuracy) and FEATURE-PORTING.md §7 (theme, accessibility) first. A complete, working example is
the demo game in `src/core/games/demo/` ("Star Path", a development fixture hidden in production builds).

## 1. Where things live

```
src/features/games/
  index.ts                 registerGames(): one line per game (called by src/features/index.ts)
  <id>/                    one folder per game, id in kebab-case (e.g. wudu-flow)
    register.ts            export function register<Name>Game() { registerGame(def) }
    i18n.ts                defineNamespace('game.<id>', { en, de, bs })
    <Name>Game.tsx         the game component (receives GameApi)
    logic.ts               pure rules (scoring, shuffling, checks) – unit-tested
    __tests__/<id>.test.ts
src/core/games/            framework (do not edit from a game)
  types.ts                 GameDef, GameLevelDef, GameFact, FactCheck, GameApi, GameResultInput
  registry.ts              registerGame, getGame, listGames, gameOfTheDay, factQuestion, keys
  progress.ts              pure level progress (best stars/score, unlock order, sanitizing)
  store.ts                 useGamesStore (ilmjourney:games) incl. completeLevel()
  hooks.ts                 useGames, useGameOfTheDay, useGameProgress
  shell/                   GameShell (intro → how to play → levels → play → result), GameHeader, GameResult, parts
  kit/                     casual game kit: engines, primitives, demos/, testing.tsx (§11)
  demo/                    the demo game
src/app/game/[id].tsx      route → <GameShell gameId={id} />
```

Games depend only on `@/core/**` (and may read content of other features only through data copied into the game's
own files – keep facts and sources identical to the source content). Never edit `src/core/art/**` from a game.

## 2. Registering a game

```ts
// src/features/games/wudu-flow/register.ts
import { registerGame, type GameDef } from '@/core/games';

import { wuduI18n } from './i18n';
import { type WuduConfig, WuduFlowGame } from './WuduFlowGame';

const game: GameDef<WuduConfig> = {
  id: 'wudu-flow',
  topicId: 'salah',
  i18n: wuduI18n,                 // namespace 'game.wudu-flow' with title, description, howTo (+ own keys)
  coverArt: 'body.water-on-hands',// art library name (see src/core/art/catalogue.ts)
  hintArt: 'body.hands',          // optional, shown in the animated "how to play" hint
  component: WuduFlowGame,
  levels: [
    { level: 1, config: { steps: 4 }, facts: [FACTS.order] },
    { level: 2, config: { sort: true }, facts: [FACTS.fardSunnah] },
    { level: 3, config: { mixed: true }, facts: [FACTS.differ] },
  ],
  cards: [/* optional CollectionCard[] with unlock: 'game:wudu-flow:<level>' */],
  order: 10,                      // order inside the topic's Play section grid
};

export function registerWuduFlowGame(): void {
  registerGame(game);
}
```

Then add `registerWuduFlowGame();` to `src/features/games/index.ts`.

`registerGame` validates and throws on: non-kebab id, namespace not named `game.<id>`, missing `title` /
`description` / `howTo`, not 1–3 levels numbered 1..n in order, a level without 1–3 facts, duplicate or non-kebab
fact ids, facts without sources, invalid `choice` checks, cards whose `unlock` is not `game:<id>:<level>`.

## 3. The GameShell flow

| Phase | What the shell shows | Your part |
| --- | --- | --- |
| Intro | header + big `coverArt` card, topic, description | `i18n` keys `title`, `description` |
| How to play | one animated hint (finger tapping on `hintArt`), `howTo` text | `howTo` (1–2 short sentences) |
| Level select | levels 1–3 (level n opens after n−1), best stars/score, Challenge mode toggle | `levels` |
| Play | the header (close, title, level, **progress bar**), then **your component** | everything inside the play area – **never a title or heading of your own** |
| Result | header, stars burst, score, new best, XP / seeds / water, "You learned" fact cards with sources, new collection cards, review note, next level / replay / levels / back | report the result |

First-time players see intro + how-to; later visits open the level select (the intro stays reachable). Level-up and
badge pop-ups wait while a level is played (`setCelebrationsPaused`). The game never navigates itself.

**One header for all games.** Every phase uses the shell's `GameHeader` (topic gradient, back/close, game title,
subtitle, progress bar while playing). A game component never renders its own title or a heading above its board –
`src/core/games/__tests__/uniformHeader.test.tsx` renders level 1 of every registered game inside the shell and fails
when the game title appears more than once. Instructions belong in the kit's `InlineCaption` under the board.

## 4. GameApi (props of your component)

```ts
interface GameApi<C> {
  gameId: string;
  level: 1 | 2 | 3;
  config: C;                        // the level's config
  facts: GameFact[];                // the level's facts (e.g. reveal them at checkpoints)
  onComplete(result: GameResultInput): void;  // call exactly once per play – the shell shows the result
  onExit(): void;                   // back to the level select without a result
  playSound(name: 'click' | 'success' | 'failure' | 'reward'): void;  // respects the sound setting
  haptic(kind: 'tap' | 'success' | 'warning' | 'selection'): void;    // respects the vibration setting
  reducedMotion: boolean;           // system or in-app setting
  challengeMode: boolean;           // learner opted in: the ONLY case where a timer is allowed
  language: 'bs' | 'de' | 'en';
  t(key: string, params?): string;  // game namespace keys + core keys
  l(text?: LocalizedText): string;  // localize content
  topicId?: TopicId;                // set by the shell – the kit's GameBoard uses it for the topic colours
  setProgress?(done, total): void;  // header progress bar – kit engines report it automatically
}

interface GameResultInput {
  score: number; maxScore: number;
  stars: number;                    // 1–3 (clamped) – there is no failed level
  mistakes: number;
  factsMissed: string[];            // fact ids the learner got wrong → review items
}
```

The component gets the whole play area (`flex: 1`, padded); scroll inside it yourself if needed. A component is
remounted for every play (replay / next level), so local state starts fresh.

## 5. Facts and sources ("You learned")

```ts
const FACTS = {
  order: {
    id: 'wudu-order',                                   // kebab-case, unique in the game
    text: { en: '…', de: '…', bs: '…' },               // copied from existing content – never new claims
    sources: [{ sourceName: 'Quran', sourceReference: '5:6' }],   // ≥ 1, as in the content
    art: 'body.face',                                   // optional illustration on the fact card
    check: { type: 'choice', prompt: {…}, options: [{…}, {…}, {…}], correctIndex: 0 },  // optional
    reviewKey: 'learn:salah-wudu-2',                    // optional existing question to review instead
  },
} satisfies Record<string, GameFact>;
```

- 1–3 facts per level; each is shown after the level with its sources (`SourceList`).
- Language facts (Arabic letters, letter forms, harakat, basic vocabulary) are not religious claims: mark them
  `kind: 'language'` and cite `LANGUAGE_SOURCES.alphabet` / `.vocabulary` (`@/core/models`) – never a Quran verse.
  `validateGame` enforces `factSourceProblem(kind, sources)`; religious facts (default) still need a religious source.
  Collection cards follow the same rule (`CollectionCard.kind`).
- Quran games can read the learner's memorised ayahs with `getMemorizedAyahs()` (`@/core/registry`).
- Copy the text and sources from the existing content (learn units/quests, stories, seerah, quran data). Keep
  "scholars differ" wording where the content has it. Quran text only from `@/features/quran` – never typed.
- **Review keys:** every id in `factsMissed` becomes a review item `game:<gameId>:<factId>` (unless the fact has a
  `reviewKey`, then that existing question is queued). Items are queued without scoring (`useAppStore.queueReview`).
  The review centre renders them through the registry with `factQuestion(game, fact)`:
  - `check.type === 'choice'` → multiple choice, `check.type === 'trueFalse'` → true/false with your statement;
  - no `check` → a true/false question whose statement is the fact itself (always true) – prefer giving a check.
- Only report a fact as missed when the learner really got *that* fact wrong in the game.

## 6. Rewards (handled by the shell – do not award anything yourself)

`useGamesStore.completeLevel(gameId, level, result)` runs, in this order:

1. game progress: best stars and best score are kept (a worse replay never lowers them), plays counted;
2. XP once per level: `awardXp('game:<id>:<level>', XP.gameLevel = 15)` and, for a perfect level (no mistakes, full
   score, no missed facts), once `awardXp('game:<id>:<level>:perfect', XP.gamePerfectBonus = 5)`;
3. `registerActivity()` → streak + water for the Ilm Garden (`EARN_TABLE.activity`, max 3 drops a day);
4. `reportQuestEvent({ type: 'complete', target: 'game:<id>:<level>' })` → garden milestone `gameLevel`
   (+1 seed, once per level) and `reportQuestEvent({ type: 'complete', target: 'game:<id>' })` → "play today's game";
5. missed facts → review queue;
6. newly unlocked collection cards (achievement `game:<id>:<level>`) are listed on the result screen.

All garden amounts are in one table: `EARN_TABLE` in `src/core/garden/rules.ts`. The game of the day
(`gameOfTheDay(day)`) is deterministic and is offered as a daily quest.

## 7. Art

- Use `<Art name="…" size={…} />` from `@/core/art`; names are in `src/core/art/catalogue.ts` (`KnownArtName`
  autocompletes). Useful props: `dark`, `tint` (figures), `fit="cover"`, `thirsty` (garden plants).
- Categories: `scene.*`, `sky.*`, `garden.*`, `place.*` (architecture only), `object.*`, `animal.*`, `body.*` (wudu
  pictograms), `pose.*` (faceless prayer positions), `food.*`, `ui.*`, `pattern.*`.
- Export the list of art names your game uses and test them with `hasArt` (see `src/core/__tests__/garden.test.ts`).
- Never draw people other than the learner's own hero; prophets, companions and angels are never depicted.

## 8. i18n

- Namespace `game.<id>` via `defineNamespace('game.<id>', { en, de, bs })`; keys `title`, `description`, `howTo`
  are required, then your own (`play.*`, `a11y.*`, …). de/bs must have exactly the en keys with the same
  `{placeholders}` (typed as `Record<Key, string>`; checked by `src/core/__tests__/i18n.test.ts` once registered).
- Bosnian is ijekavian Latin. Reuse core keys through `t` (`common.*`, `q.*`, `a11y.*`, `games.*`).
- Shell texts are core keys in `src/core/i18n/dictionaries/segments/engagement.ts` (`games.*`, `play.*`).

## 9. Testing pattern

```ts
// src/features/games/wudu-flow/__tests__/wudu-flow.test.ts
import { getGame, validateGame, useGamesStore } from '@/core/games';
import { registerFeatures } from '@/features';
import { scoreRound } from '../logic';

registerFeatures();

it('registers a valid game', () => expect(() => validateGame(getGame('wudu-flow')!)).not.toThrow());
it('scores deterministically', () => expect(scoreRound([...])).toEqual({ score: 4, maxScore: 4, stars: 3, … }));
it('facts carry the sources of the content', () => { /* compare with the unit / quest JSON */ });
```

- Keep rules pure in `logic.ts` and test them (scoring, star thresholds, which fact is missed when).
- For flows, follow `src/core/__tests__/games.test.ts` (store `completeLevel`) and `gameShell.test.tsx` (render the
  shell with react-test-renderer: intro → levels → play → result).
- `npm run verify` and `npx expo export --platform android` must pass.

## 10. Do / don't (reverence principle)

| Do | Don't |
| --- | --- |
| Calm puzzles: build, order, sort, match, trace, steer gently | Shooting, racing, "lives", game over, punishing sounds |
| Every level ends with 1–3 sourced facts | Quiz-in-disguise without an action |
| Narrate miracles as text with sources | Let the player "perform" a miracle |
| Only landscapes, architecture, objects, animals, pictograms and faceless pose figures | Depict prophets, companions, angels or any real person |
| Quran text only from generated data, shown with care (no dragging of verses onto the floor, no timers on Quran) | Hand-typed verses, Quran words as "targets" to hit |
| Respect `reducedMotion` (fades / instant), `challengeMode` for timers, 48 dp targets, labels on every control | Flashing, fast or large motion without a reduced-motion path |
| Theme colours via `useTheme` / `makeStyles`; dark mode tested | Hex colours in UI styles (artwork excepted) |
| Mistakes are gentle: soft shake, "try again", the fact comes back in review | Mocking feedback, losing progress |

## 11. Kit: casual game engines

`src/core/games/kit` (import from `@/core/games/kit`) is the toolbox every v3 game is built from: polished,
theme-aware, data-driven **engines** (the mechanic), shared **primitives** (board, tile, slot, card, feedback) and
**test helpers** that play a level to completion. Most games are then configuration + content + art. Every engine:

- is data-driven: items with an `id` and a **face** (`label`, `art`, `arabic`), callbacks `onDone`, `onMistake`,
  `onProgress`;
- gives inline feedback only (glow, soft shake, burst, check, caption under the board) – never a modal;
- reports progress to the shell header, measures time (shown only in Challenge mode), respects reduced motion
  (fades instead of movement), light / dark / high contrast, large text, 48 dp targets, 360 dp width;
- can be played without gestures: every draggable is also a button (tap it, then tap its place) – the screen-reader
  path, and the one the low-level test helpers use;
- registers a **probe**, so `playToEnd` can finish it in tests through the same code path as a learner's move.

Dev-only demo games (one per engine, `dev: true`, hidden in production) live in `src/core/games/kit/demos/`. In a
development build the Play tab shows them in the "Game kit (dev)" section – every engine at all three levels.

### 11.1 The board and the common props

```tsx
import { GameBoard, SortBins, kitResult } from '@/core/games/kit';

export function MyGame(api: GameApi<MyConfig>) {
  return (
    <GameBoard api={api}>
      {/* topic-tinted surface + kit context: sound, haptics, motion, texts, header progress */}
      <SortBins … onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: 6, mistakes, factsMissed: … }))} />
    </GameBoard>
  );
}
```

`GameBoard` props: `api` (always pass it in games), `topic?` (override the colours), `padding?` (default 12; 0 for
full-bleed scenes), `decorate?` (faint corner stars, default true), `style?`. Put exactly one board in the play area;
the engine and any custom content (e.g. `ProgressDots` for rounds) go inside.

Shared types (`kit/types.ts`):

| Type | Fields |
| --- | --- |
| `KitText` | `string` (already localized, numbers, Arabic) or `LocalizedText` |
| `KitFace` | `label?`, `art?` (art name), `arabic?` (RTL, app Arabic font), `quran?` (verified Quran text → Quran font), `sub?` (small caption), `a11y?` (screen-reader label) |
| `KitItem` | `KitFace & { id }` – ids become test ids (`tile-<id>` …); use kebab-case |
| `KitDoneInfo` | `{ mistakes, missed: string[] (item ids), ms }` |
| `KitPoint` / `KitBox` | positions as fractions 0..1 of a picture: `{ x, y }` / `{ x, y, w, h }` |

Every engine accepts `EngineProps`:

| Prop | Meaning |
| --- | --- |
| `onDone(info)` | **required** – called once after the success animation. Turn it into `api.onComplete(kitResult(…))`. |
| `onMistake?(itemId)` | every wrong move (map item ids to fact ids for `factsMissed`) |
| `onProgress?({ done, total })` | progress inside the round (the header bar is updated automatically) |
| `hints?` | default `true`: hint pointer after ~6 s idle, the next target glows (guided engines). `false` for harder levels. |
| `prompt?` | instruction shown in the inline caption before the first move |
| `reducedMotion?`, `challenge?`, `seed?`, `testID?` | overrides (default: the learner's settings; seed = game id + level) |

Scoring helpers: `kitResult({ moves, mistakes, factsMissed })` → `GameResultInput` (10 points per move, −3 per
mistake; stars by `kitStars`: 3 without mistakes, 2 with ≤ max(1, 25 % of the moves), else 1).
`kitShuffle(items, seed)` is a deterministic shuffle that never returns the solved order.

### 11.2 Engines

All fifteen engines are ready (✅). The API is stable: later changes are additive only.

**SequenceBoard** ✅ – put things in order.
`items: KitItem[]` (correct order) · `variant?: 'list' | 'path'` · `columns?` (path) · `endArt?` (path, default
`kit.flag`) · `rowHeight?` (list) · `startOrder?: string[]` (list).
`list`: drag rows (UI-thread drag that stays correct on fast drags) or use ↑ / ↓, then **Check** – right rows turn
green, misplaced ones shake (one mistake per failed check; every misplaced id is reported as missed). `path`: numbered
stones along a winding path and a tray of tiles; each drop is checked at once and the next stone glows.
Test ids: `row-<id>`, `up-<id>`, `down-<id>`, `kit-check`; path: `tile-<id>`, `zone-step-<n>` (0-based).

**SortBins** ✅ – drag items into 2–4 illustrated baskets.
`bins: { id, label, art? }[]` (art default `kit.basket`; also `kit.crate`, `kit.jar` or any art) ·
`items: (KitItem & { bin })[]` · `visible?` (tray size, default 4 pictures / 3 words) · `ordered?` (keep the order).
Right: the item drops in, the basket bounces, its counter grows, caption "item → basket". Wrong: a soft shake back.
Test ids: `tile-<id>`, `zone-<binId>`.

**MemoryPairs** ✅ – flip two cards, find the pairs.
`pairs: { id, a: KitFace, b?: KitFace, caption? }[]` (`b` defaults to `a`; e.g. letter ↔ name, word ↔ picture) ·
`peekMs?` (all faces visible at the start – an easy level 1) · `columns?`.
Only forgetting counts as a mistake (a mismatch where one card had been seen before). `caption` appears when found.
Test ids: `card-<pairId>-a`, `card-<pairId>-b`.

**ConnectPairs** ✅ – draw a line from an item to its partner.
`pairs: { id, left: KitFace, right: KitFace }[]` · `shuffleLeft?` · `leftShare?` (left column share, default 0.5).
Drag from either side (live dashed line on the UI thread); right pairs keep a coloured curve, a wrong line fades and
both cards shake. Tap left, then right works too. Test ids: `left-<id>`, `right-<id>`.

**BuildScene** ✅ – build a picture part by part; the scene grows continuously and the finished picture is the payoff.
`scene?` (background art, drawn `cover`) · `aspect?` · `parts: (KitItem & { slot: KitBox, sceneArt?, caption? })[]`
(in building order) · `ordered?` (the next place glows; only it accepts) · `ghosts?` (faint silhouettes, default true)
· `visible?` · `reveal?: { title?, caption? } | false` · `backdrop?` (extra layers over the background).
Each placed part grows in with a burst and its `caption` appears inline (keep the sourced facts for the result screen).
At the end `FinishReveal` shows the whole scene big with a Continue button → `onDone`.
Test ids: `tile-<partId>`, `zone-<partId>`, `built-<partId>`.

**CatchGame** ✅ – items fall gently; collect the right ones in a basket. Calm: no lives, missed right items come
again. `items: (KitItem & { good: boolean })[]` · `goal` (right items to collect) · `lanes?: 3 | 4` ·
`speed?: 'calm' | 'normal'` · `basketArt?` · `sky?` (background art). Drag the basket (or tap a lane / a falling item).
Reduced motion: items appear in place and are tapped. Test ids: `catch-item-<id>`, `catch-lane-<n>`.

**TapScene** ✅ – find things in an illustrated scene. `scene` (art) · `aspect?` ·
`spots: (KitItem & { at: KitBox, target?: boolean })[]` · `ordered?` (asks "Find: …" for one target after another).
Non-target spots count as mistakes; empty areas never do. Test ids: `spot-<id>`.

**JigsawReveal** ✅ – drag picture pieces to rebuild an illustration, then reveal it with a caption. `art` · `rows`,
`cols` · `mode?: 'place' | 'swap'` · `reveal?`. Test ids: `tile-piece-<n>`, `zone-cell-<n>`.

**PathTrace** ✅ – trace a route with the finger through stops in order. `map?` (background art) · `aspect?` ·
`stops: (KitItem & { at: KitPoint, caption? })[]` · `tolerance?` (fraction, default 0.08) · `showRoute?` (dashed
guide, default true). Tapping the stops in order works too. Test ids: `stop-<id>`.

**WordTiles** ✅ – build a word, phrase or ayah from tiles; right-to-left when the tiles are Arabic.
`target: KitItem[]` (reading order) · `distractors?: KitItem[]` · `rtl?` (default: auto) · `quran?` (Quran font –
generated data only). Test ids: `tile-<id>`, `zone-word-<n>`.

**LetterJoin** ✅ – drag Arabic letters into place and watch the joined word form (the font joins them).
`words: { id, letters: string[], word?: string, meaning?: KitText }[]` (one word after another).
Test ids: `tile-<wordId>-<n>`, `zone-join-<n>`.

**TraceShape** ✅ – trace a letter or a shape. `shapes: { id, label?, glyph?: string, strokes?: string[] }[]` –
`strokes` are SVG paths in a 100 × 100 box, traced in order (start dot + arrow); with only a `glyph` (an Arabic letter)
the learner covers the big guide letter. Test ids: `trace-<id>` (+ `kit-trace-auto` for screen readers).

**BalanceScale** ✅ – weigh and balance (a fair measure). `left: (KitItem & { weight })[]` (fixed load) ·
`weights: (KitItem & { weight })[]` (to put on the right pan). The beam tilts with a spring; balanced → done;
overshooting counts as a mistake. Test ids: `tile-<id>` (tap to add / remove).

**TimelineSlider** ✅ – place events on a timeline. `marks: { id, label: KitText }[]` (ticks in order) ·
`events: (KitItem & { mark: string })[]` (one at a time). Drag the marker along the line, then "Place it here"; a
wrong place says "earlier" / "later". Test ids: `timeline-mark-<id>`, `kit-place`.

**PourFill** ✅ – pour or fill to a line (water, milk, grain). `vessels: (KitFace & { id, target: number (0..1),
tolerance? })[]` · `liquid?: 'water' | 'milk' | 'grain'` · `rate?`. Hold to pour, release to stop; in the band →
right; overflow → a gentle "too much" and the vessel empties. Test ids: `pour-<vesselId>`.

### 11.3 Primitives (for custom boards and twists)

| Export | Use |
| --- | --- |
| `Tile` | the tactile tile (raised face on a darker lip). `state`: idle / selected / right / wrong / placed / ghost / disabled; `face` or children; `glow` |
| `FaceView` | draws a `KitFace` (art, Arabic RTL, label + sub) |
| `Slot` | dashed inset drop place (`number`, `ghostArt`, `placeholder`, `state`: empty / next / filled / right / wrong) – a `DropZone` |
| `DragTile` / `DropZone` | drag & drop with the board's zone registry: `onDrop(zoneId) → accepted`; hover glow; tap fallback |
| `FlipCard`, `CardBack` | flip card (scale-X flip; a cross-fade with reduced motion) |
| `Tray` | wrapping row of tiles to place (drawn above the board, so dragged tiles stay on top) |
| `InlineCaption` | the caption under the board (`tone`: info / right / wrong / fact / hint) – instructions and short explanations |
| `ProgressDots` | rounds inside a level |
| `HintPointer`, `useIdleHint` | animated finger (tap, or drag from → to) after the learner waits |
| `Burst`, `Glow`, `CheckBadge`, `Pop`, `GrowIn`, `useShake`, `useFloat` | feedback effects (all reduced-motion safe) |
| `FinishReveal` | the finished-picture payoff inside the board (glow, rays, sparkles, title, caption, Continue) |
| `ChallengeClock`, `useStopwatch` | calm stopwatch for Challenge mode only (counts up, never "time's up") |
| `useKit()`, `useKitColors()` | the board environment (`kt` kit texts, `text()` to localize, `sound`, `haptic`) and the topic colours |

Kit art (`kit.*`): `basket`, `crate`, `jar`, `path-stone`, `flag`, `pin`, `magnifier`, `puzzle`, `cards`, `connect`,
`blocks`, `catch`, `route`, `trace`, `balance`, `timeline`, `pour`, `join`, `tiles`, `steps`.

### 11.4 A complete game (register + i18n + levels + facts + test)

```tsx
// src/features/games/sections/akhlaq/kind-words/KindWordsGame.tsx
import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, SortBins, type SortItem } from '@/core/games/kit';

import { factFor, KIND_WORDS_BINS } from './content';

export interface KindWordsConfig {
  items: SortItem[];
  hints: boolean;
}

export function KindWordsGame(api: GameApi<KindWordsConfig>) {
  const { items, hints } = api.config;
  return (
    <GameBoard api={api}>
      <SortBins
        bins={KIND_WORDS_BINS}
        items={items}
        hints={hints}
        prompt={api.t('play.prompt')}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: items.length, mistakes, factsMissed: missed.map(factFor) }))}
      />
    </GameBoard>
  );
}
```

```ts
// i18n.ts – title / description / howTo + own keys; de and bs have exactly the en keys
export const kindWordsI18n = defineNamespace('game.kind-words', { en: { title: 'Kind Words', description: '…', howTo: '…', 'play.prompt': '…' }, de: { … }, bs: { … } });

// register.ts
const game: GameDef<KindWordsConfig> = {
  id: 'kind-words',
  topicId: 'akhlaq',
  i18n: kindWordsI18n,
  coverArt: 'akhlaq.kind-words',          // your section art file
  component: KindWordsGame,
  levels: [
    { level: 1, config: { items: L1, hints: true }, facts: [FACTS.goodWord] },
    { level: 2, config: { items: L2, hints: false }, facts: [FACTS.smile] },
    { level: 3, config: { items: L3, hints: false }, facts: [FACTS.silence] },
  ],
  order: 40,
};

export function registerKindWordsGame(): void {
  registerGame(game);
}
```

```tsx
// __tests__/kind-words.test.tsx
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { registerKindWordsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerKindWordsGame();

it('is valid and complete in en / de / bs', () => {
  const game = getGame('kind-words')!;
  expect(() => validateGame(game)).not.toThrow();
  expect(namespaceProblems(game)).toEqual([]);
});

it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
  const game = await renderGame(getGame('kind-words')!, level);
  expect((await playToEnd(game)).stars).toBe(3);
  await game.unmount();
});

it('reports mistakes as missed facts', async () => {
  const game = await renderGame(getGame('kind-words')!, 2);
  const result = await playToEnd(game, { mistakes: 2 });
  expect(result.stars).toBeLessThan(3);
  expect(result.factsMissed.length).toBeGreaterThan(0);
  await game.unmount();
});
```

### 11.5 Testing (`@/core/games/kit/testing`, Jest only)

| Helper | What it does |
| --- | --- |
| `renderGame(def, level, { language?, reducedMotion?, challengeMode? })` | renders the level's component with a fake `GameApi`; returns `{ root, results, events, progress, press(testID), has(testID), texts(), wait(ms), unmount() }` |
| `playToEnd(game, { mistakes?, onIdle?, maxSteps? })` | plays every mounted engine through its probe (the learner's code path) until `onComplete`; `mistakes: n` plays n wrong moves first; `onIdle(game)` presses your own controls between rounds |
| `game.press(testID)` | presses a control (or the first pressable inside an element with that test id) |
| `fakeGameApi`, `namespaceProblems`, `renderNode`, `activeProbes` | lower-level pieces |

Engines measure their size with `onLayout`; under Jest a default size is used, so their content always renders. Kit
animations finish within about a second; `playToEnd` waits for them (real or fake timers). Always `unmount()` at the
end of a test (it stops the hint timers).

### 11.6 Design do's and don'ts

| Do | Don't |
| --- | --- |
| One `GameBoard` per screen; let the engine fill it | Your own title or heading above the board (the shell header has it) |
| Instructions and short explanations in `prompt` / `InlineCaption` | Alerts, modals, "Correct! → Continue" after each step |
| Art faces (`<Art>`) on tiles wherever possible – pictures first, words second | Walls of text on tiles (keep labels ≤ 3 words; use `sub` for a year or a reference) |
| `useKitColors()` and theme tokens | Hex colours in UI styles (artwork excepted) |
| Levels that change the play: L1 `hints` + ghosts, L2 more items / no hints, L3 a twist (ordered, from memory, more bins) | Three levels that only add items |
| `arabic` faces for Arabic (RTL, Arabic font), `quran: true` only for generated Quran text | Typing ayahs by hand; Quran words as things to catch or throw |
| Calm motion; trust the engines' reduced-motion paths | Fast, flashing or large motion; timers outside Challenge mode |
| Check 360 dp width, dark mode, high contrast and the length of bs / de texts | Labels that only fit in English |

## 12. Play tab sections

The Play tab shows the game of the day and one card per section in the order of GAMES-V3 §3 (`PLAY_SECTIONS` in
`src/core/games/sections.ts`): Salah, Quran, Arabic / Sufara, Prophets, Seerah, Akhlaq, Ramadan, History. A game's
`topicId` decides its section; `order` sorts it inside the section grid (`/play/[section]`). Arabic and Sufara are one
section (`topicId: 'arabic'`) whose screen also links the Sufara path (`/sufara`). There is no `shelfGroup` any more.
Development fixtures (`dev: true`: the kit demos and Star Path) appear only in development builds, in the
"Game kit (dev)" section.

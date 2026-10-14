# Game framework – guide for game authors

This is the exact contract for the 12 mini-games of [GAMES.md](GAMES.md). Read GAMES.md (principles, catalogue),
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
  shell/                   GameShell (intro → how to play → levels → play → result), GameResult, parts
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
  order: 10,                      // shelf order inside the topic
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
| Intro | topic gradient, big `coverArt`, title, description | `i18n` keys `title`, `description` |
| How to play | one animated hint (finger tapping on `hintArt`), `howTo` text | `howTo` (1–2 short sentences) |
| Level select | levels 1–3 (level n opens after n−1), best stars/score, Challenge mode toggle | `levels` |
| Play | close button + title/level header, then **your component** | everything inside the play area |
| Result | stars burst, score, new best, XP / seeds / water, "You learned" fact cards with sources, new collection cards, review note, next level / replay / levels / back | report the result |

First-time players see intro + how-to; later visits open the level select (the intro stays reachable). Level-up and
badge pop-ups wait while a level is played (`setCelebrationsPaused`). The game never navigates itself.

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

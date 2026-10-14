# Ilm Journey 2 – learn by doing

Feedback on v1: the content is good, but it is mostly "read → quiz → answer". Version 2 turns the app into a place
people *want* to come back to: **small games where you do something and learn something from it**, far more
illustrations, and a world that visibly grows with you. Learning stays the goal; every game teaches a fact with a
source, and all religious-accuracy rules of DESIGN.md stay in force.

## Principles

1. **Do, then learn.** Every activity starts with an action (drag, build, trace, sort, steer, tap, swipe) and ends with
   a short "You learned" card (1–3 facts, source references). No game is a quiz in disguise.
2. **Reverence.** Games around the Quran, salah and the prophets are calm puzzles and building/ordering activities –
   never arcade shooting/racing/losing lives on sacred things. Prophets, companions and angels are never depicted.
   The only person ever drawn is the learner's own hero avatar (and faceless, neutral figures where needed, e.g. a
   prayer-position silhouette). Miracles are narrated, not "played".
3. **Short and replayable.** 1–3 minutes, 3 levels each (easy → harder), stars (1–3), personal best, no lives, no
   timers for children unless the learner picks "Challenge mode".
4. **Pictures everywhere.** Every topic, lesson section, game, card, story step and Seerah event gets an
   illustration from the art library. Lessons become swipeable **lesson cards** (illustration + 2–3 short lines +
   one small interaction: tap-to-reveal, drag, flip) instead of text walls.
5. **A world that grows.** Learning grows the learner's **Ilm Garden** and fills a **collection album**; levels unlock
   hero outfits and garden decorations. Rewards are only for learning – no currency purchases, no random loot boxes.

## Navigation (v2)

Tabs: **Home** · **Learn** · **Play** · **Stories** · **Me**

- **Home** = the Ilm Garden (full-width illustrated scene, sky follows the real time of day) + "Game of the day",
  "Continue", today's quests, streak (watering the garden), reviews due.
- **Learn** = 8 topics, paths now mix lesson cards, quests, **games** and units; tools as before.
- **Play** = all mini-games as an illustrated game shelf, grouped by topic, with stars/best and "new" markers.
- **Stories** = segmented: *Prophets* (the 8 stories) | *Seerah* (episodes, timeline, map, people …). Seerah moves
  here from its own tab; all `seerah/*` routes stay.
- **Me** = hero (wardrobe with unlockable items), level, garden decorations, collection album, badges, radar, review
  centre, bookmarks, reflections, settings.

## Engagement systems (core)

- **Ilm Garden** (`core/garden`): an illustrated scene with ~30 placeable elements (palms, olive/fig/pomegranate
  trees, flowers, fountain, stream, lanterns, arches, a small masjid, birds, bees, butterflies, moon/stars at night).
  Learning earns **water drops** (activity) and **seeds** (milestones: finished game level, quest, unit, story,
  episode). Seeds unlock/plant elements (the learner chooses where from a few spots); water keeps plants lush –
  missing days never kill anything (gentle: plants just look thirsty, one activity restores them).
- **Collection album** (`core/collection`): illustrated cards – Arabic letters, places (Makkah, Madinah, Taʾif, Badr,
  Judi, …), Quran surahs memorised, duas learned, Seerah events, story objects (ark, staff, well, whale, fire, …),
  good deeds. Cards drop from specific achievements (deterministic, never random), each card shows a fact + source.
- **Unlockables**: level N unlocks hero items (kufi/hijab colours, scarves, lanterns, backpack patterns) and garden
  decorations. Shown on level-up.
- **Game of the day** + daily quests include one game. Streak = days with learning; the garden shows it.
- Feedback: sounds/haptics (respect settings), confetti/stars (respect reduced motion).

## Game framework (core)

`core/games`: `registerGame(def)` with id, topic, title/description (i18n), art, levels (1–3), `component`,
`facts` (LocalizedText + sources) and `teaches` (question keys or topic). A **GameShell** provides: illustrated
intro → how to play (1 animated hint) → play → result (stars, best, XP once per level via `awardXp`, seeds/water,
"You learned" facts with sources, card unlock) → replay/next level. Game progress store `ilmjourney:games`
(stars per level, best, plays). Games may also produce review items (`game:<id>:<fact>`) when the learner gets a
fact wrong. Gestures via react-native's PanResponder/Animated or react-native-gesture-handler + reanimated (add via
`npx expo install` if needed; keep Hermes/new-arch compatible).

## Game catalogue v2 (12 games)

| # | Topic | Game | What you do | What you learn (sources from existing content) |
| --- | --- | --- | --- | --- |
| 1 | Salah | **Wudu Flow** | drag water to the body-part icons in order; L2 sort fard/sunnah; L3 fix a mixed-up sequence | steps of wudu (5:6), scholars-differ notes |
| 2 | Salah | **Prayer Sky** | drag the sun across the sky to each prayer's moment; then stack rakʿah blocks per prayer | 5 prayers, their times, rakʿah counts |
| 3 | Salah | **Find the Qibla** | rotate a compass on illustrated maps (Düsseldorf, Sarajevo, London, Jakarta …) to face the Kaaba | qibla (2:144), direction differs by place |
| 4 | Quran | **Ayah Builder** | drag word tiles to rebuild ayahs of memorised surahs; Listen button; hint glow | Juz ʿAmma surahs (generated text only) |
| 5 | Quran | **Surah Garden** | match surah cards (name ↔ meaning ↔ ayah count) to grow flowers | surah names/meanings |
| 6 | Arabic | **Letter Lanterns** | lanterns with letters float up; light the one you hear (TTS) / see in another form | letters, forms, harakat |
| 7 | Arabic | **Word Builder** | connect letters into a word; the word's picture appears | vocabulary from arabic content |
| 8 | Prophets | **Ark of Nuh** | find matching pairs of animals and lead them onto the ark | "two of every kind" (11:40) |
| 9 | Prophets | **Yusuf's Storehouse** | plan grain over 7 good + 7 hard years by moving sacks into the storehouse | 12:47–49 planning & trust |
| 10 | Seerah | **Hijrah Path** | trace the route Makkah → Cave Thawr → Madinah, stop at checkpoints to reveal events | Hijrah facts (sira content) |
| 11 | Seerah | **Build the Masjid** | assemble Masjid an-Nabawi: palm-trunk pillars, palm-leaf roof, suffa, qibla change | sira episode 6 facts |
| 12 | Akhlaq/Ramadan | **A Day of Good Deeds** | an illustrated day (dawn → night): choose actions in little scenes; each good deed plants something; Ramadan variant with suhoor/iftar timing | akhlaq & ramadan lessons |

Existing question types stay for units/master challenges and review, but are visually upgraded (illustrated
options, card flips, drag feedback).

## Art library (`core/art`)

One SVG component library (`<Art name="…" />`, theme-aware, scalable): ~150 named pieces in categories
`scene.*` (skies/landscapes – extends SceneView), `garden.*`, `place.*` (Kaaba, masjids, cave, mountains, wells,
cities – architecture only), `object.*` (ark, staff, basket, grain sack, lantern, Quran stand, prayer mat, compass,
dates, water jug …), `animal.*` (camel, sheep, dove, spider web, whale, birds, ant, hoopoe … – no humans),
`body.*` (wudu icons: hands, mouth, nose, face, arms, head, ears, feet – simple pictograms), `food.*`, `ui.*`
(stars, seeds, water drop, badges frames), `pattern.*` (geometric). Flat, warm, rounded style matching the app;
works on light and dark backgrounds. Every topic/lesson/game/card references art by name; a test checks every
referenced name exists.

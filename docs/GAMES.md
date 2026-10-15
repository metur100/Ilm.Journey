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

## Game catalogue

The Play shelf currently registers 14 games. Every entry exposes at least 10 playable challenge units; the count shown in the app is not a level count.

| # | Topic | Game | Challenges | What you do |
| --- | --- | --- | ---: | --- |
| 1 | Prophets | **Ark of Nuh** | 18 | Match animal pairs and guide them to the ark. |
| 2 | Prophets | **Yusuf Story Trail** | 10 | Put ten sourced events from Yusuf’s story in sequence. |
| 3 | Seerah | **Hijrah Path** | 20 | Follow the route and order sourced Hijrah events. |
| 4 | Seerah | **Build the Masjid** | 12 | Assemble the described early mosque features and practise the qibla change; no undocumented roof or pillar details are presented. |
| 5 | Akhlaq | **A Day of Good Deeds** | 16 | Complete everyday actions and sourced character dilemmas; choices give gentle feedback. |
| 6 | Ramadan | **Ramadan Journey** | 10 | Play ten scenes covering suhoor, fasting, safe practice, iftar, Ramadan nights, and Eid preparation. |
| 7 | Salah | **Wudu Flow** | 25 | Practise the steps, distinguish Quran-named parts from common Sunnah steps, and repair a sequence. |
| 8 | Salah | **Prayer Sky** | 20 | Match prayer times and obligatory rak‘ahs, then order the day. |
| 9 | Salah | **Salah Guide** | 17 | Practise the five prayers’ 17 fard rak‘ahs, including opening takbir, common postures, final sitting, and closing salam. |
| 10 | Salah | **Find the Qibla** | 14 | Turn the compass toward the Kaaba from cities around the world. |
| 11 | Quran | **Ayah Builder** | 13 | Rebuild short Quran passages with word tiles and optional recitation. |
| 12 | Quran | **Surah Garden** | 18 | Match surah names, meanings, ayah counts, and openings. |
| 13 | Arabic | **Letter Lanterns** | 24 | Identify isolated letters, connected forms, and harakat. |
| 14 | Arabic | **Word Builder** | 12 | Build Arabic vocabulary from letter tiles. |

Ramadan Journey uses the authored Ramadan Learn questions and sources. Sufara is a separate Arabic learning path: 28 letters with four recognition and vowel exercises per letter (112 exercises), linked from the Arabic topic.

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

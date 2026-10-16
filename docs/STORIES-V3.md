# Stories v3 – 25 prophets with illustrated, animated scenes

The Stories tab ("Kazivanja") tells the stories of **all 25 prophets named in the Quran**, from Adam to Muhammad ﷺ.
Every story keeps the v2 flow (intro → scenes with interactions → mini-game → quiz → lessons → reward) and now gets
**illustrated, gently animated scenes ("stages")**: layers of art from the art library plus ambient effects such as
waves, rain, wind, stars or sparkles. The same stage engine runs in the Seerah episodes.

This document is for the group authors (A, B, C) and the Seerah author. GAMES-V3.md §1 (reverence) and §2 (content
rules) apply in full. Where this file and GAMES-V3.md differ, GAMES-V3.md wins.

Owner of the engine, screens and this doc: **story-fx author** (`src/features/stories/**` except the story JSONs and
`groupA/B/C.ts`, `src/core/components/scene/**`, the Seerah episode presentation). Ask for engine changes in your
final report.

## 1. The 25 stories

| order | id | prophet | group | list file |
| --- | --- | --- | --- | --- |
| 1 | `adam` | Adam | A | `groupA.ts` |
| 2 | `idris` | Idris | A | |
| 3 | `nuh` | Nuh | A | |
| 4 | `hud` | Hud | A | |
| 5 | `salih` | Salih | A | |
| 6 | `ibrahim` | Ibrahim | A | |
| 7 | `lut` | Lut | A | |
| 8 | `ismail` | Ismail | A | |
| 9 | `ishaq` | Ishaq | A | |
| 10 | `yaqub` | Yaqub | B | `groupB.ts` |
| 11 | `yusuf` | Yusuf | B | |
| 12 | `ayyub` | Ayyub | B | |
| 13 | `shuayb` | Shuayb | B | |
| 14 | `musa` | Musa | B | |
| 15 | `harun` | Harun | B | |
| 16 | `dhulkifl` | Dhul-Kifl | B | |
| 17 | `dawud` | Dawud | B | |
| 18 | `sulayman` | Sulayman | C | `groupC.ts` |
| 19 | `ilyas` | Ilyas | C | |
| 20 | `alyasa` | Al-Yasa | C | |
| 21 | `yunus` | Yunus | C | |
| 22 | `zakariyya` | Zakariyya | C | |
| 23 | `yahya` | Yahya | C | |
| 24 | `isa` | Isa | C | |
| 25 | `muhammad` | Muhammad ﷺ | C | |

- Use exactly these ids. The loader takes `order` from the canonical table `src/features/stories/content/order.ts`
  by id, so the journey is right even before a JSON is renumbered – still set `order` in your JSON to the number
  above (GAMES-V3 §3.4). Orders are unique within 1..25; missing stories are fine (the journey shows the registered
  ones), so groups can land their stories one by one.
- A story is registered by importing its JSON in the group's list file (`groupA.ts`, `groupB.ts`, `groupC.ts`).
  The loader sorts by `order`, so list order does not matter.
- Stories unlock one after another in `order`. Existing progress is kept by story id – never rename `adam`, `nuh`,
  `ibrahim`, `musa`, `yusuf`, `yunus`, `isa`, `muhammad`.

## 2. Story JSON format

Unchanged from v2, plus four optional fields (bold). All text fields are `{ "en", "de", "bs" }`.

```jsonc
{
  "id": "salih",
  "order": 5,
  "prophetName": { "en": "Salih", "de": "Salih", "bs": "Salih" },
  "honorific": "alayhis-salam",                 // "sallallahu-alayhi-wa-sallam" only for Muhammad ﷺ
  "title": { … }, "description": { … }, "place": { … }, "intro": { … },
  "symbol": "well",                             // SceneView element (fallback picture, see §5)
  "symbolArt": "prophet.salih-camel",           // ** art name of the story's symbol on the journey path
  "cover": { "sky": "dusk", "elements": ["stars", "mountains"] },
  "coverStage": { … },                          // ** animated stage of the intro / cover (§3)
  "mapPlaces": ["hijr"],                        // ** places on the story map (§4)
  "scenes": [
    {
      "id": "salih-s1",
      "title": { … }, "text": { … },
      "scene": { "sky": "dusk", "elements": ["mountains", "well"] },   // still required (fallback)
      "stage": { … },                           // ** animated stage of this scene (§3)
      "interactionId": "salih-q1",
      "sources": [{ "sourceName": "Quran", "sourceReference": "26:155–156" }]
    }
  ],
  "miniGameId": "…", "quizIds": ["…"], "lessons": [ … ], "questions": [ … ], "sources": [ … ]
}
```

Rules checked by `src/features/stories/__tests__/content.test.ts`:

- unique ids (stories, scenes, questions, lessons); unique `order` values within 1..25;
- every text in en, de and bs (non-empty);
- **every scene has `sources`** (Quran surah:ayah, or hadith collection + number, or Ibn Kathir);
- every question has sources (questions without their own fall back to the story sources);
- every art name in `symbolArt`, `coverStage` and every scene `stage` exists (`hasArt`), and is never `body.*` or
  `pose.*`; effect / animation / entry names and numbers are valid (`validateStage`);
- at least 3 scenes and 2 lessons per story;
- no "Muslims believe …" phrasing in any story text: not "Muslims believe", "for Muslims", "according to Islam",
  "Muslime glauben", "für Muslime", "laut dem Islam", "Muslimani vjeruju", "za muslimane", "prema islamu".
  State the truth directly ("Allah is One.", "Allah je Jedan.", "Allah ist Einer.") and cite the source.
- map questions only use place ids from §4.

## 3. Stages – illustrated, animated scenes

A stage is plain JSON on a virtual **400 × 240 canvas** (same frame as `SceneView` and the `scene.*` / `story.*`
backdrops). The canvas covers the view; on wide views it crops mostly from the sky, so keep important things below
y ≈ 40 and inside x 30..370.

```jsonc
"stage": {
  "sky": "night",                 // night | dawn | day | sunset | dusk | storm | sea  (gradient behind everything)
  "camera": "slowZoom",           // still | slowZoom (default on big stages) | panLeft | panRight | drift
  "mood": "cool",                 // none | warm | cool | night | golden | dawn – soft colour grade
  "vignette": true,               // darker edges (default true)
  "layers": [
    { "art": "story.moon-crescent", "x": 320, "y": 70, "w": 46, "anchor": "center", "anim": "glow" },
    { "art": "story.mountains" },                                     // full-width backdrops: just the name
    { "art": "story.sea", "fill": true },                              // fill = cover the whole canvas
    { "art": "prophet.nuh-ark", "x": 200, "y": 200, "w": 150, "anim": "bob", "enter": "rise", "at": 300 },
    { "art": "story.rain-clouds", "y": 90, "w": 400, "at": 1200, "enter": "fade" }
  ],
  "effects": ["stars", { "type": "rain", "intensity": 3, "at": 1200 }, { "type": "waves", "y": 196 }]
}
```

### Layers

| field | meaning | default |
| --- | --- | --- |
| `art` | art library name (`story.*`, `place.*`, `object.*`, `animal.*`, `garden.*`, `prophet.*`, `seerah.*` …) | required |
| `fill` | covers the whole canvas (crop to fit); `x/y/w` ignored | `false` |
| `x` | horizontal centre | 200 |
| `y` | bottom edge (`anchor: "bottom"`) or centre (`anchor: "center"`) | 240 / 120 |
| `w` | width in canvas units; height follows the art's aspect | the piece's own viewBox width (so 400 × 240 bands fill the frame) |
| `anchor` | `bottom` (things standing on the ground) or `center` (sky things) | `bottom` |
| `z` | draw order; layers are drawn in array order (z = index × 10 + 10) unless set | |
| `flip`, `rotate`, `opacity` | mirror, degrees, 0..1 | |
| `anim` | idle loop: `float`, `bob` (on water), `sway` (trees, lamps), `drift` (clouds), `pulse`, `glow`, `spin`, `breathe` – or `{ "type": "sway", "amp": 3, "period": 6000 }` | none |
| `enter` | `fade`, `rise`, `fall`, `slideLeft`, `slideRight`, `zoom`, `none` | `fade` if `at` is set |
| `at` | timeline: appears N ms after the stage is shown | 0 |
| `duration` | entry duration in ms | 900 |
| `exitAt` | timeline: fades out at N ms (e.g. the darkness lifts) | – |
| `dark` | draw the art for a dark surface | follows the sky |

### Effect presets

Write an effect as its name (`"rain"`) or as an object (`{ "type": "rain", "intensity": 1, "x": 0, "y": 0, "w": 400,
"h": 240, "color": "#…", "z": 100, "at": 0, "until": 5000 }`). Point effects use `x`/`y` as their centre.

| effect | looks like | good for |
| --- | --- | --- |
| `stars` | twinkling stars in the upper sky (behind layers) | night skies, Ibrahim looking at the stars, Isra' |
| `clouds` | soft clouds drifting (behind layers) | day skies |
| `sunrays` | slowly turning rays from `x`,`y` (behind layers) | dawn, revelation light, mercy |
| `birds` | small flocks gliding across the sky | Dawud's birds glorifying (34:10), Sulayman, open land |
| `waves` | layered rolling waves, band at `y` (default 190) | Nuh, Musa and the sea, Yunus' ship |
| `ripples` | rings spreading on water at `x`,`y` | wells, Zamzam, the Nile, the stream for Ayyub (38:42) |
| `rain` | slanted rain over the region | the flood (narrated), rain as mercy |
| `wind` | streaks of wind | the wind for Sulayman (34:12), the wind of 'Ad (narrated, gentle) |
| `sand` | blowing sand along the ground | deserts, al-Ahqaf |
| `dust` | slow floating motes in warm light | old ruins, caves, storehouses |
| `mist` | soft fog bands drifting | the darkness around Yunus, dawn valleys |
| `bubbles` | rising bubbles | under the sea (Yunus) |
| `sparkle` | soft four-point glints around `x`,`y` | miracles narrated, the table spread, gifts of Allah |
| `fireflies` | small warm lights drifting | night gardens, calm |
| `lanternGlow` | breathing warm glow at `x`,`y` | lamps, the mihrab of Zakariyya, Ramadan nights |
| `flameGlow` | warm flicker inside a cool, safe halo at `x`,`y` | the fire made cool and safe for Ibrahim (21:69) – calm, never scary |
| `leaves` | leaves falling and swaying | gardens, the tree of Yunus (37:146), Maryam's palm (19:25) |
| `lightBeam` | a soft beam of light from above at `x` | guidance, revelation, the burning bush light (narrated) |

Reduced motion (system or app setting) turns every stage into a still composition: all layers in their final place,
effects frozen, no camera motion.

### Art rules

- **Never people.** No `body.*` or `pose.*` art, no faces, no silhouettes of prophets, companions or angels. A
  prophet is shown only through places, objects, animals, nature and light.
- Punishments of past nations are narrated, not shown: use ruins, wind, empty houses, the sea closing gently – never
  bodies, drowning figures or violence. Miracles are calm (sparkle, light), never "special effects" spectacle.
- No idols or crosses drawn as objects of worship; when a story speaks of idols, leave them to the text (show the
  place, the night sky, the fire made cool …).
- Backdrops are in `story.*` (generic, story-fx author). Prophet-specific objects are `prophet.*` (group authors,
  `src/core/art/pieces/sections/prophetA|B|C.tsx`), Seerah art is `seerah.*` (Seerah author).
- New pieces: viewBox sized to the object (≈ 60–200 units), drawn with the kit (`art(w, h, draw)`, `C` palette,
  `Glow`, `Shadow`, `Palm`, `Mountain`, `Cloud`, …). Full-width backdrop bands are 400 × 240 with a transparent sky
  so the stage sky, stars and sun show through. Check `dark` (night skies) – the stage passes `dark` for night,
  dusk, storm and sea skies.

### Generic story backdrops (`story.*`)

Names from `src/core/art/pieces/sections/story.tsx`:
full-width bands (400 × 240, transparent sky) such as `story.dunes`, `story.desert-flat`, `story.sea`,
`story.sea-storm`, `story.underwater`, `story.mountains`, `story.hills`, `story.valley`, `story.nile`,
`story.city-ancient`, `story.ruins`, `story.rock-dwellings`, `story.dead-sea`, `story.olive-grove`, `story.garden`,
`story.cave-mouth`, `story.night-horizon`; sky pieces such as `story.moon-crescent`, `story.moon-full`,
`story.sun`, `story.rain-clouds`, `story.cloud`; foreground and objects such as `story.palms`, `story.reeds`,
`story.rocks`, `story.grass`, `story.lamp`, `story.lanterns`, `story.mihrab`, `story.arch-frame`, `story.tents`,
`story.shore`. The final list is in the art library (`artNames.filter(n => n.startsWith('story.'))`).

## 4. Story map places

`mapPlaces` and map questions (`"type": "map"`, `places`, `correctPlace`) use these ids. Positions are approximate
and stylised (the Levant is drawn larger).

| id | place | typical stories |
| --- | --- | --- |
| `judi` | Mount al-Judi | Nuh (11:44) |
| `nineveh` | Nineveh | Yunus |
| `mesopotamia` | Mesopotamia (Babylon / Ur region) | Ibrahim |
| `canaan` | Canaan (Palestine, Hebron) | Ibrahim, Ishaq, Yaqub |
| `jerusalem` | Bayt al-Maqdis | Dawud, Sulayman, Zakariyya, Yahya, Isa, Isra' |
| `lut` | the cities of Lut near the Dead Sea | Lut |
| `sinai` | Sinai, Mount Tur | Musa, Harun |
| `madyan` | Madyan | Shuayb, Musa |
| `egypt` | Egypt (the Nile) | Yusuf, Musa, Harun |
| `hijr` | al-Hijr | Salih (15:80) |
| `madinah` | Madinah | Muhammad ﷺ |
| `makkah` | Makkah | Ibrahim, Ismail, Muhammad ﷺ |
| `ahqaf` | al-Ahqaf | Hud (46:21) |
| `saba` | Saba' (Yemen) | Sulayman (27:22) |

Only use a place when a source supports it; where the location is not known (e.g. Idris, Dhul-Kifl, Al-Yasa, Ayyub)
leave `mapPlaces` out.

## 5. Where stages live – two options

1. **In the story JSON** (preferred long-term): `coverStage` on the story and `stage` on each scene.
2. **In the overlay map** `src/features/stories/content/stages.ts` (owned by story-fx): `STORY_STAGES[storyId] =
   { cover?, scenes?: { [sceneId]: stage }, symbolArt?, mapPlaces? }`, merged at load time. JSON values win over
   the overlay. The existing 8 stories use the overlay until their group authors move the stages into JSON (then
   delete the overlay entry in your report – story-fx removes it).

Without any stage the player still animates the old `scene` / `cover` (e.g. `rain` and `waves` elements get the
rain and wave effects), so nothing breaks while art is being made.

## 6. Example scene

```jsonc
{
  "id": "yunus-s2",
  "title": { "en": "In the darkness", "de": "In der Dunkelheit", "bs": "U tminama" },
  "text": {
    "en": "In the darkness Yunus called out: \"There is no god but You. Glory be to You! I was one of the wrongdoers.\"",
    "de": "In der Dunkelheit rief Yunus: „Es gibt keinen Gott außer Dir. Preis sei Dir! Ich gehörte zu den Unrechttuenden.“",
    "bs": "U tminama je Junus zavapio: „Nema boga osim Tebe, hvaljen neka si! Ja sam se prema sebi ogriješio.“"
  },
  "scene": { "sky": "sea", "elements": ["whale"] },
  "stage": {
    "sky": "sea",
    "mood": "night",
    "layers": [
      { "art": "story.underwater", "fill": true },
      { "art": "animal.whale", "x": 210, "y": 150, "w": 220, "anchor": "center", "anim": "float" }
    ],
    "effects": ["bubbles", { "type": "lightBeam", "x": 120, "intensity": 1, "at": 1500 }]
  },
  "sources": [{ "sourceName": "Quran", "sourceReference": "21:87–88; 37:139–144" }]
}
```

## 7. Checklist for group authors

- [ ] One JSON per prophet of your group, registered in your `groupX.ts`; `order` = GAMES-V3 §3.4 number.
- [ ] en, de and bs for every text; bs terminology and honorifics as in GAMES-V3 §2 ("a.s.", "s.a.v.s.").
- [ ] Every scene has `sources`; every question has sources or relies on the story sources; nothing invented
      (no dialogue, numbers or details that the sources do not give – when unsure, leave it out).
- [ ] No "Muslims believe / Muslime glauben / Muslimani vjeruju" (and similar) – state the truth directly.
- [ ] Fiqh (Hanafi) is not relevant to these stories – do not add fiqh rulings to story text.
- [ ] Prophets, companions and angels are never depicted; no `body.*` / `pose.*` art; punishments narrated only.
- [ ] `symbolArt` (a `prophet.*` piece from your art file) plus a `coverStage` and a `stage` per scene with
      something specific to that prophet (see GAMES-V3 §3.4 examples).
- [ ] `mapPlaces` only where sources support the place.
- [ ] `npx jest src/features/stories src/core/art` and `npx tsc --noEmit` pass.

## 8. Seerah episodes

Episodes and events use the **same stage format**. Put it in the episode JSON (it wins), or extend the overlay
`src/features/seerah/stages.ts` (`EPISODE_STAGES`, `EVENT_STAGES`), which already gives all 10 episodes an animated
cover made from existing art (replace them with `seerah.*` art when it exists):

```jsonc
{
  "id": "episode-05",
  "scene": { … },                 // unchanged fallback
  "stage": { … },                 // cover of the episode (introduction + episode cards + finish screen)
  "stages": {                     // optional, per step of the episode
    "context": { … }, "timeline": { … }, "mainEvent": { … }, "lesson": { … }
  }
}
```

Where it shows: the cover on the introduction step, the episode card (as a still picture) and the finish screen; a
step stage at the top of that step; an event stage at the top of the event screen. Events
(`content/events/events.json`) may carry `"stage": { … }`. `src/features/seerah/__tests__/stages.test.ts` checks
every Seerah stage like the story stages. Art for the
Seerah lives in `seerah.*` (`src/core/art/pieces/sections/seerah.tsx`). The same rules apply: the Prophet ﷺ, his
family and companions are never depicted – only places, objects, animals, light and nature.

## 9. Tools

- Preview art and stage compositions (layers only, no effects) as HTML:
  `STAGE_SHEET_DIR=<dir> npx jest --testMatch "**/scene/__dev__/stageSheet.gen.tsx"` (set `STAGE_SHEET_PREFIX=prophet.`
  to preview your own pieces), then screenshot `art-light.html`, `art-dark.html` and `stages.html` with headless
  Edge/Chrome.
- Engine: `src/core/components/scene/StoryStage.tsx` (component), `stage.ts` (format + `validateStage`),
  `stageEffects.tsx` (presets), `stageMotion.tsx` (clock, particles), `stageFallback.ts` (old scenes → effects).

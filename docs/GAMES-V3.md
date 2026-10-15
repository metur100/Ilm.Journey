# Ilm Journey 3 – real casual games in every section

Feedback on v2 (from the owner, Medin Turkes): the games are too shallow. Many "games" are quizzes with a new skin.
v3 rule: **casual games first, learning at the end.** Every section has **at least 10 casual mini-games**
(more is welcome), **every game has 3 levels**, and each level ends with what the learner has just learned.

This document is the single spec all authors work from. DESIGN.md (accuracy rules) and GAMES.md (principles)
still apply; where they differ, this file wins.

## 1. Quality bar for a game

- **A real mechanic, not a quiz.** You drag, connect, build, sort, trace, catch, steer, flip, rotate, pour,
  stack, light, plant or join. Multiple-choice screens on their own are **not** a game. Every game uses at
  least one mechanic from the kit (§4) or a custom one, and is clearly different from the other games in its
  section.
- **3 levels that change the play**, not only "more of the same": e.g. L1 guided with hints, L2 more items or
  fewer hints, L3 a twist (order from memory, a mistake to repair, a stricter target, mixed content).
- **Learning at the end.** The result screen shows 1–3 "You learned" facts per level, with sources. Short
  explanations may also appear *during* play as inline captions (never as a modal).
- **No interrupting pop-ups.** Feedback is inline: glow, soft shake, a check mark, particles, a caption under
  the board, a progress bar. There are no "Correct! → Continue" dialogs after each step. Building games build
  continuously, and the finished picture (e.g. the whole masjid) is the payoff at the end.
- **One header for all games.** The GameShell draws the only title bar (back, game title, level, progress).
  Games never draw their own title or heading. Intro, how-to, level select and result screens come only from
  the shell, so every game looks the same around the board while each board stays unique.
- **Design matters most.** Use the kit's board, tiles, slots, cards and feedback. Use the app theme tokens and
  the topic gradient, rounded shapes and the art library; light, dark and high contrast must all work. The
  layout must be readable at 360 dp width, with 48 dp touch targets and no clipped text in bs/de. Motion should
  be smooth with Reanimated, and reduced motion means fades instead of movement.
- **Reverence.** Never arcade shooting, racing or losing lives on sacred things. Prophets, companions and
  angels are never depicted. Punishments of past nations and the miracles are narrated, not played. People
  appear only as the learner's avatar or as faceless neutral figures (e.g. the prayer figure).
- **Short and replayable:** 1–3 minutes per level, stars 1–3, no lives, and a timer only in Challenge mode.

## 2. Content rules (all languages: en, de, bs)

- **State truths directly.** Never write "Muslims believe …", "Muslime glauben …" or "Muslimani vjeruju …"
  (nor "for Muslims", "according to Islam" and similar). Write the statement itself, for example "Allah is One.",
  "The Quran is the word of Allah.", "Kur'an je Allahova riječ.", "Der Koran ist das Wort Allahs." A source
  reference is enough.
- **Every fact has a source:** Quran surah:ayah, or a hadith collection with its number (Bukhari, Muslim, Abu
  Dawud, Tirmidhi …), or Ibn Hisham / Ibn Kathir for Seerah and history. Do not invent hadith, dialogue, numbers
  or details. When unsure, leave it out. Language facts (Arabic letters) use `LANGUAGE_SOURCES`.
- **Fiqh of salah, wudu and fasting:** the practical details follow the **Hanafi school**, as taught in the
  Bosnian ilmihal (Islamska zajednica BiH), because the main audience is Bosnian. Where other schools differ on
  something the learner might notice, add a short neutral note ("Scholars of other schools differ on …").
- **Quran text** comes only from the generated data (`src/features/quran/data`); never type Arabic ayahs by hand.
- **Terminology for bs:** namaz, abdest, gusul, tejemmum, ezan, ikamet, rekat, kijam, ruku', sedžda,
  sjedenje (ka'de), selam, sabah, podne, ikindija, akšam, jacija, vitr, džuma, sufara, harf, hareket, sura,
  ajet, Džuz Amme, poslanik (a.s.), Muhammed a.s. / s.a.v.s. **For de:** Gebet, Gebetswaschung (Wudu),
  Fadschr, Dhuhr, Asr, Maghrib, Ischa, Rakʿa, Koran, Prophet (Friede sei mit ihm). Keep the existing app style
  for honorifics.
- All visible text goes through the game's own i18n namespace (`game.<id>`) in all three languages.

## 3. Sections and ownership

The Play tab shows these sections in this order. **Arabic / Sufara** is a single section; Sufara is no
longer a separate shelf.

| Section | Topic id | Game folder (owner) | Art file `src/core/art/pieces/sections/` | Minimum |
| --- | --- | --- | --- | --- |
| Salah | `salah` | `sections/salah-prayers` (prayers author) + `sections/salah` (salah author) | `salah.tsx` (both; the prayers author owns the prayer figure) | 15 |
| Quran | `quran` | `sections/quran` | `quran.tsx` | 12 |
| Arabic / Sufara | `arabic` | `sections/arabic` | `arabic.tsx` | 12 |
| Prophets | `prophets` | `sections/prophets-a`, `-b`, `-c` (one game per prophet) | `prophetA/B/C.tsx` → `prophet.*` | 25 |
| Seerah | `seerah` | `sections/seerah` | `seerah.tsx` | 12 |
| Akhlaq | `akhlaq` | `sections/akhlaq` | `akhlaq.tsx` | 10 |
| Ramadan | `ramadan` | `sections/ramadan` | `ramadan.tsx` | 10 |
| History | `history` | `sections/history` | `history.tsx` | 10 |

Game folders live under `src/features/games/`. Each section folder has an `index.ts` with
`register<Section>Games()`, which is already wired into `src/features/games/index.ts`. **Only touch your own
folder, your own art file and your own story/content files.** Existing v2 games (`ark-of-nuh`, `wudu-flow`,
`prayer-sky`, `find-qibla`, `ayah-builder`, `surah-garden`, `letter-lanterns`, `word-builder`, `hijrah-path`,
`build-the-masjid`, `good-deeds-day`, `yusuf-storehouse`, `yusuf-story-path`, `ramadan-journey`,
`salah-guide`) belong to the section author of their topic. The author may rework, move, merge or replace
them, but must keep each game id if progress exists, or remove it cleanly.
`topic-arcade.tsx` (Copilot's quiz shelves) is removed by the kit author; section authors replace that
content with real games.

Shared files have a single owner. Anyone else who needs a change there writes it down for that owner in
their final report:

- `src/core/games/**`, the Play tab and the GameShell: **kit author**.
- `src/features/stories/**` (except the story JSON of your group) and `src/core/components/scene/**`:
  **story-fx author**.
- `src/core/services/sound*`, `audioSession`, `speech`: **audio author**.

### 3.1 Salah (≥ 15)

- **salah-prayers:** a new, very clear **prayer figure**. It is faceless, friendly and well proportioned, with
  a male and a female variant (hijab, long clothes). It stands on a prayer mat and draws every position
  clearly: niyyah/qiyam; takbir with hands raised; hands placed; ruku' with a straight back and hands on the
  knees; i'tidal; sajda with the 7 parts on the ground; sitting between the sajdas; ka'da/tashahhud with the
  raised index finger; selam with the head turned right, then left. Small arrows or highlights show what
  moves, and movement is animated between positions. The owner says this is very important, so it must look
  clearly better than the current `pose.*` art.
- **One game per prayer:** Sabah, Podne, Ikindija, Akšam, Jacija. Each covers the sunnah and fard rakats per
  Hanafi, which rakats are read aloud, the first and last sitting and what is recited. L1 is pray along step
  by step; L2 is ordering the positions of the whole prayer; L3 is leading it yourself (choose the next
  movement, the sittings, the rakat count). Also Vitr and Džuma (Jumu'ah).
- **salah:** at least 8 more games. Abdest (wudu) rework, gusul, tejemmum, ezan and ikamet, the five prayer
  times (Prayer Sky rework), qibla, the conditions of salah (šarti namaza), what breaks wudu and what breaks
  salah, the words of salah (Subhaneke, Fatiha, Ettehijjatu, Salavat, Rabbena; text from generated data or
  existing content only), mosque manners and counting rakats.

### 3.2 Quran (≥ 12)

Casual games for **memorising Juz ʿAmma** and **learning the message of surahs**. Examples:

- Ayah Builder and Surah Garden (reworks).
- Ayah rain (catch the next word in order).
- A surah puzzle (jigsaw of an ayah).
- A missing-word game.
- Listen and order.
- Message of the surah (connect a surah to its main message, e.g. al-Ikhlas → Tawhid, al-Asr → time).
- A Juz ʿAmma path map.
- Quran etiquette.
- Makki/Madani sort.
- "The story in the surah" (assemble the scene of al-Fil or Quraysh, narrated).

### 3.3 Arabic / Sufara (≥ 12)

A sufara path: **learn the letters, then practise joining them (spajanje harfova)**.

- Letter intro and tracing.
- Letter Lanterns (rework).
- The 4 letter forms.
- Dots.
- Non-joining letters (ا د ذ ر ز و).
- A **join-the-letters game** (drag letters together and see the joined word form).
- Harakat sounds.
- Sukun, shadda, tanwin and madd.
- Reading syllables and short words line by line with audio.
- Word Builder (rework).

The existing Sufara screen (`/sufara`, `features/learn/sufara`) becomes part of this section.

### 3.4 Prophets – the 25 prophets named in the Quran (25 stories + 25 games)

Canonical order and story `order` field:

1 Adam · 2 Idris · 3 Nuh · 4 Hud · 5 Salih · 6 Ibrahim · 7 Lut · 8 Ismail · 9 Ishaq · 10 Yaqub ·
11 Yusuf · 12 Ayyub · 13 Shuayb · 14 Musa · 15 Harun · 16 Dhul-Kifl · 17 Dawud · 18 Sulayman · 19 Ilyas ·
20 Al-Yasa · 21 Yunus · 22 Zakariyya · 23 Yahya · 24 Isa · 25 Muhammad ﷺ.

| Group | Prophets | Story JSON list | Games folder | Art |
| --- | --- | --- | --- | --- |
| A | 1–9 | `src/features/stories/content/prophets/groupA.ts` | `sections/prophets-a` | `prophetA.tsx` |
| B | 10–17 | `groupB.ts` | `sections/prophets-b` | `prophetB.tsx` |
| C | 18–25 | `groupC.ts` | `sections/prophets-c` | `prophetC.tsx` |

- Every prophet gets a **story** in the existing story JSON format (renumber `order`), with Quran references on
  every scene. The story-fx author adds **illustrated, animated scenes** to the story player: art pieces plus
  animation layers such as waves, rain, wind, sparkle, a floating lantern or birds. Every story uses
  **prophet-specific imagery without people**: the ark and the flood waters for Nuh, the she-camel and the
  well for Salih, the Kaaba's foundations for Ibrahim and Ismail, the scales for Shuayb, the staff and the
  sea for Musa, rings of iron armour for Dawud, the hoopoe, the ants and the throne for Sulayman, the whale
  and the darkness for Yunus, the mihrab for Zakariyya, the table spread for Isa, and so on.
- Every prophet gets **one casual game** (3 levels) themed on his story and its lesson. Some examples, all
  sourced: Shuayb is fair measure on a balance scale (11:84–85). Dawud is linking armour rings (34:10–11). For
  Sulayman, the army walks past the ants' valley without harming them (27:18). Salih is sharing the water days
  (26:155). Ibrahim is raising the Kaaba's walls (2:127). For Ismail it is Hajar's search between Safa and
  Marwa and Zamzam (Bukhari 3364). Nuh is the existing Ark (rework), and Yusuf is the storehouse/story path
  (rework). Where the Quran tells little (Idris, Dhul-Kifl, Al-Yasa, Ilyas), use only what is there and make
  the game about the stated quality (e.g. 19:56–57, 21:85–86, 38:48, 37:123–132).

### 3.5 Seerah (≥ 12)

Hijrah Path (rework) and Build the Masjid (rework, see §5), plus at least 10 more. Examples:

- The Year of the Elephant scene.
- Cave Hira.
- Makkah → Ta'if.
- The Seerah timeline.
- Badr's wells.
- The trench (Khandaq).
- Hudaybiyyah.
- The conquest of Makkah.
- The Farewell Sermon messages.
- Letters to the rulers.
- The map of the journeys.

The Seerah **episodes** also get the same illustrated, animated scenes (story-fx engine; the seerah author
adds the art).

### 3.6 Akhlaq (≥ 10), Ramadan (≥ 10), History (≥ 10)

- **Akhlaq:**
  - A Day of Good Deeds (rework).
  - Honesty at the market.
  - Water for the thirsty animal (Bukhari 2363).
  - Parents.
  - Salam.
  - Sharing food.
  - Promises.
  - Controlling anger.
  - Neighbours.
  - Cleanliness.
  - Kind words.
  - Gratitude.
- **Ramadan:**
  - Ramadan Journey (rework).
  - Suhoor/iftar timing.
  - What breaks the fast.
  - The crescent moon.
  - The 30-lantern path.
  - Laylat al-Qadr in the odd nights.
  - The iftar table and the dua.
  - Zakat al-fitr.
  - Eid preparation.
  - Exemptions from fasting.
  - Taraweeh.
- **History:**
  - The four caliphs in order.
  - Compiling the mushaf.
  - The Hijri calendar.
  - The House of Wisdom.
  - Al-Andalus.
  - Great mosques on a map.
  - Islam in Bosnia (Gazi Husrev-beg Mosque, Stari Most).
  - Scholars and their books.
  - The Golden Age inventions.

## 4. The casual game kit (`src/core/games/kit`)

Built first by the kit author and documented in `docs/GAMES-FRAMEWORK.md`. It provides polished,
theme-aware, data-driven mechanics, so most games are configuration, content and art. The required engines:

- `SequenceBoard`: drag to order, either a vertical list or a horizontal path.
- `SortBins`: drag items into 2–4 illustrated baskets.
- `MemoryPairs`: flip cards.
- `ConnectPairs`: draw a line between matching items.
- `CatchGame`: items float or fall gently; collect the right ones into a basket; calm, with no lives.
- `TapScene`: find or tap the items in an illustrated scene.
- `JigsawReveal`: drag picture pieces or slide tiles to reveal an illustration and a fact.
- `BuildScene`: drop parts onto slots of a scene; the scene grows continuously.
- `PathTrace`: trace a path or route with the finger.
- `WordTiles`: build words or ayahs from tiles, right-to-left aware.
- `LetterJoin`: connect Arabic letters and see the joined form.
- `TraceShape`: trace a letter or shape.
- `BalanceScale`: weigh and balance.
- `TimelineSlider`: place events on a timeline.
- `PourFill`: pour or fill (water, grain).

Shared primitives:

- The game board surface (topic-tinted).
- Tile, slot and card.
- Feedback: glow, shake, burst, check.
- The inline caption, the progress dots and the hint pointer.
- The finished-picture "reveal" moment.
- Test helpers to play a level to completion.

Every engine must look great and coherent (it is the face of the app) and work with RTL Arabic text.

## 5. Specific fixes requested by the owner

1. **Build the Masjid:** no pop-up after every placed part. Build continuously with inline captions; at the
   end the finished masjid appears as a big illustration (with the facts on the result screen). Redesign the
   building scene so it looks good.
2. **Remove the "Muslims believe" phrasing** everywhere, including existing learn, quest, story, seerah, quran
   and game content in all three languages (§2).
3. **Consistent game header** (§1): the kit author enforces this in the shell and adds a test that no game
   renders its own title.
4. **Sound:** in the Android emulator nothing plays: no UI sounds, no Arabic letter speech, no recitation. The
   audio author finds the cause and fixes it (expo-audio session, expo-speech voices, missing Arabic TTS data
   with a graceful fallback, and Quran recitation streaming).

## 6. Engineering rules for every author

- Stack: Expo SDK 57, RN 0.86, expo-router, zustand, Reanimated 4 + gesture handler, react-native-svg,
  jest-expo.
- Follow `docs/GAMES-FRAMEWORK.md`: `registerGame(def)`, the i18n namespace `game.<id>`, `levels` 1..3 with
  `facts` (each with sources) and `coverArt`.
- **Tests:** every game gets a test that renders each level and plays it to completion with the kit's test
  helpers. Content tests check the sources and all 3 languages. Before committing, run `npx tsc --noEmit`
  (fix errors in your files; ignore errors that only exist in other authors' unfinished folders) and
  `npx jest <your folders>`.
- **Git:**
  - Several authors work in the same working tree at the same time. Commit only your own paths, with
    `git commit -m "<msg>" -- <your paths>` after `git add <your new files>`.
  - Never use `git add -A`, `git add .`, `git stash`, `git reset`, `git checkout -- <others' files>` or
    rebase.
  - If `.git/index.lock` exists, wait a few seconds and retry.
  - Commit often in small, working steps. End messages with
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push.
- **Emulator** (only one, `emulator-5554`, Pixel_10_Pro_XL): use it only while holding the lock file
  `C:\Users\TurkesMedin\repos\Medin\Islam\.emulator-lock` (create it with your name; delete it when done; if it
  exists, continue coding and try later). Section authors normally do not need the emulator; the final QA pass
  covers it.

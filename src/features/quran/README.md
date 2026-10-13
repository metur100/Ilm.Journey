# Quran data

Al-Fatiha + the complete Juz ʿAmma (surahs 78–114, 38 surahs / 571 ayahs) and 26 Quranic duas, with English,
German and Bosnian translations and an English transliteration. Loaded through `index.ts`
(`listSurahs`, `getSurah`, `getAyah`, `listDuas`, `getDua`, `duasByTheme`, `ayahWords`, `audioUrlForAyah`).

**The Quran text and translations are never typed or edited by hand.** `data/*.json` is generated.

## Provenance

| What | Source |
| --- | --- |
| Arabic text | Tanzil Quran Text, Uthmani script ([tanzil.net](https://tanzil.net)), edition `quran-uthmani` |
| English translation | Saheeh International, edition `en.sahih` |
| German translation | Frank Bubenheim & Nadeem Elyas, edition `de.bubenheim` |
| Bosnian translation | Besim Korkut, edition `bs.korkut` |
| Transliteration | alquran.cloud English transliteration, edition `en.transliteration` |
| Surah names, juz, revelation type | api.alquran.cloud surah metadata (`Meccan` → `makki`, `Medinan` → `madani`) |
| Bosnian surah-name meanings | api.quran.com v4 `chapters?language=bs` |
| Recitation (streamed, optional) | Mishary Rashid Alafasy, 128 kbps, `cdn.islamic.network/quran/audio/128/ar.alafasy/<global>.mp3` |

All texts are fetched from [api.alquran.cloud](https://alquran.cloud/api) (`/v1/surah/<n>/editions/…` and
`/v1/ayah/<s:a>/editions/…`) — the same sources and editions as islam-quest. Generated on **2026-10-13**
(the date is also stored in `source.generated` of each JSON file).

The only processing applied to the source text:

- **Basmala:** Al-Fatiha keeps it as ayah 1. For every other surah the API prefixes the Basmala to ayah 1;
  exactly those four words are removed (as in islam-quest). In surahs 95 and 97 the source writes the first
  letter with a shadda, so the prefix is recognised by its letters — the generator reports this.
- **Byte-order mark:** the source's leading U+FEFF on 1:1 (a file-encoding artefact) is removed.

For the six surahs shared with islam-quest (1, 103, 108, 112, 113, 114) the generated data is identical to
`islam-quest/src/data/quran/surahs.json`; the generator and the test check this.

Fields added beyond islam-quest's format: `nameMeaningLocalized` (`de` falls back to the English meaning —
no verified German source), `juz`, `difficulty` (ayah count: easy ≤ 8, medium ≤ 20, hard > 20) and
`memorizationOrder` (Al-Fatiha first, then easy → hard, from An-Nas backwards within a tier).

### Duas

Each dua is given as the **full ayah(s)** — the Quran text is not cut, so some entries contain narrative
before or after the supplication itself (e.g. 2:201, 17:24, 46:15). No highlight ranges are stored, because
they cannot be derived robustly for all three translations. `title` and `context` are editorial text written
for this app (not Quran); `context` only states what the surrounding ayahs say and ends with the reference.

## Licence notes

- **Tanzil text:** "Permission is granted to copy and distribute verbatim copies of this text, but changing it
  is not allowed." The source (Tanzil Project) must be clearly indicated with a link to tanzil.net. Show this
  attribution in the app's sources/about screen.
- **Translations** remain the property of their respective translators/publishers (Saheeh International;
  Bubenheim & Elyas; Besim Korkut) and are used as distributed by Tanzil/alquran.cloud; credit them wherever
  the translation is shown.
- Recitation audio is streamed, never bundled.

## Regenerate

```bash
node scripts/generate-quran.mjs               # Node 22+, no dependencies
node scripts/generate-quran.mjs --allow-diff  # write even if islam-quest's overlapping surahs differ
npx jest src/features/quran                   # verify
```

Requests are sequential (≈75, 350 ms apart, with retries). The script aborts without writing if the
overlapping surahs differ from islam-quest (when that repo is next to this one); investigate and report any
difference instead of hand-editing the data. Duas are defined in the `DUAS` list at the top of the script.

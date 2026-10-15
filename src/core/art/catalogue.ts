import type { ArtDef } from './kit';
import { animal } from './pieces/animals';
import { body, pose } from './pieces/body';
import { food } from './pieces/food';
import { garden } from './pieces/garden';
import { object } from './pieces/objects';
import { pattern } from './pieces/patterns';
import { place } from './pieces/places';
import { scene, sky } from './pieces/sky';
import { ui } from './pieces/ui';
import { akhlaq } from './pieces/sections/akhlaq';
import { arabic } from './pieces/sections/arabic';
import { history } from './pieces/sections/history';
import { kit } from './pieces/sections/kit';
import { prophet } from './pieces/sections/prophet';
import { quran } from './pieces/sections/quran';
import { ramadan } from './pieces/sections/ramadan';
import { salah } from './pieces/sections/salah';
import { seerah } from './pieces/sections/seerah';
import { story } from './pieces/sections/story';

/** All art definitions by category; the full name of a piece is `<category>.<key>`. */
export const categories = {
  garden,
  place,
  object,
  animal,
  body,
  pose,
  food,
  sky,
  scene,
  ui,
  pattern,
  // Section art (v3): one file per section, see docs/GAMES-V3.md.
  salah,
  quran,
  arabic,
  prophet,
  seerah,
  akhlaq,
  ramadan,
  history,
  kit,
  // Generic story backdrops for the animated story / Seerah stages (story-fx author, docs/STORIES-V3.md).
  story,
};

export type ArtCategory = keyof typeof categories;

type Names<K extends ArtCategory> = `${K}.${Extract<keyof (typeof categories)[K], string>}`;
/** Every name that exists in the library (for autocompletion; `ArtName` also accepts plain strings). */
export type KnownArtName = { [K in ArtCategory]: Names<K> }[ArtCategory];

export const definitions: Record<string, ArtDef> = Object.fromEntries(
  (Object.keys(categories) as ArtCategory[]).flatMap((cat) =>
    Object.entries(categories[cat] as Record<string, ArtDef>).map(([key, def]) => [`${cat}.${key}`, def]),
  ),
);

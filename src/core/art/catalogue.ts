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

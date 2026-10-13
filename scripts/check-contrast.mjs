/**
 * Prints the WCAG AA contrast check of every text colour pair in all palettes (light, dark and
 * their high-contrast variants) and of white text on the topic gradients.
 *
 *   npm run check:contrast
 *
 * Runs the TypeScript theme sources directly (Node ≥ 22.6 with --experimental-strip-types).
 * The same checks run in the test suite (src/core/__tests__/theme.test.ts).
 */
import { ALL_PALETTES } from '../src/core/theme/palettes.ts';
import { checkPalette, checkTopicTheme } from '../src/core/theme/contrast.ts';
import { topicThemes } from '../src/core/theme/topics.ts';

let failures = 0;

function report(title, results) {
  console.log(`\n${title}`);
  for (const r of results) {
    if (!r.ok) failures++;
    console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${r.ratio.toFixed(2).padStart(5)} (≥ ${r.required})  ${r.pair}`);
  }
}

for (const [name, palette] of Object.entries(ALL_PALETTES)) report(`Palette: ${name}`, checkPalette(palette));
for (const [id, theme] of Object.entries(topicThemes)) report(`Topic: ${id}`, checkTopicTheme(theme));

console.log(failures === 0 ? '\nAll pairs pass WCAG AA.' : `\n${failures} pair(s) below WCAG AA.`);
process.exit(failures === 0 ? 0 : 1);

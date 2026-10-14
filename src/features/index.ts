import { registerEngagement } from '@/core/engagement';

import { registerGames } from './games';
import { registerLearnFeature } from './learn/register';
import { registerSeerahFeature } from './seerah/register';
import { registerStoriesFeature } from './stories/register';

let registered = false;

/**
 * Registers every feature with the core registry. Called once by the root layout (and by tests)
 * before the stores hydrate. Each feature owns its own `register.ts`; this list never needs more
 * than one line per feature. `registerEngagement()` wires the core v2 systems (games, garden, collection).
 */
export function registerFeatures(): void {
  if (registered) return;
  registered = true;
  registerEngagement();
  registerLearnFeature();
  registerStoriesFeature();
  registerSeerahFeature();
  registerGames();
}

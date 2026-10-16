import type { GameDef } from '../../types';
import { buildDemo, connectDemo, memoryDemo, sequenceDemo, sortDemo } from './coreDemos';
import { catchDemo, jigsawDemo, joinDemo, pathDemo, pourDemo, scaleDemo, tapDemo, timelineDemo, traceDemo, wordDemo } from './moreDemos';
import { registerAll } from './shared';

/** Every kit demo game (one per engine; `dev: true`, hidden in production builds). */
export const KIT_DEMOS: GameDef<any>[] = [
  sequenceDemo,
  sortDemo,
  memoryDemo,
  connectDemo,
  buildDemo,
  catchDemo,
  tapDemo,
  jigsawDemo,
  pathDemo,
  wordDemo,
  joinDemo,
  traceDemo,
  scaleDemo,
  timelineDemo,
  pourDemo,
];

/** Registers the kit demo games (called from src/features/games/index.ts). */
export function registerKitDemos(): void {
  registerAll(KIT_DEMOS);
}

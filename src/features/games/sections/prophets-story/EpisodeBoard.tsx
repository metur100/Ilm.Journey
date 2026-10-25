import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard, type KitDoneInfo, kitResult, MemoryPairs, SequenceBoard, SortBins, TapScene } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeMoves } from './episode';

/** Maps the ids of the items the learner got wrong to the fact ids they teach (unknown ids are dropped). */
function factsFor(missed: readonly string[], map: Record<string, string | undefined>): string[] {
  return [...new Set(missed.map((id) => map[id]).filter((x): x is string => !!x))];
}

/** One episode of a prophet's life on the board of the kit engine it names. */
export function EpisodeBoard({ api, episode }: { api: GameApi<unknown>; episode: Episode }) {
  const onDone = ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves: episodeMoves(episode), mistakes, factsMissed: factsFor(missed, episode.factMap) }));
  const common = { prompt: episode.prompt, hints: episode.hints ?? api.level === 1, onDone };
  return (
    <GameBoard api={api}>
      {episode.kind === 'sequence' ? (
        <SequenceBoard {...common} items={episode.items} variant={episode.variant ?? 'list'} endArt={episode.endArt} />
      ) : episode.kind === 'connect' ? (
        <ConnectPairs {...common} pairs={episode.pairs} />
      ) : episode.kind === 'sort' ? (
        <SortBins {...common} bins={episode.bins} items={episode.items} />
      ) : episode.kind === 'memory' ? (
        <MemoryPairs {...common} pairs={episode.pairs} peekMs={episode.peekMs ?? (api.level === 1 ? 2500 : undefined)} />
      ) : (
        <TapScene {...common} scene={episode.scene} spots={episode.spots} ordered={episode.ordered} />
      )}
    </GameBoard>
  );
}

/** A whole game made of episodes (every level config is `{ mode: 'episode', episode }`). */
export function EpisodeGame(api: GameApi<EpisodeConfig>) {
  return <EpisodeBoard api={api as GameApi<unknown>} episode={api.config.episode} />;
}

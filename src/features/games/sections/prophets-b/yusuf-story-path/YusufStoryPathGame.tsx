import type { GameApi } from '@/core/games';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';

/** Yusuf – the best of stories: every level is one episode of his life (the well, the prison, the forgiveness). */
export function YusufStoryPathGame(api: GameApi<EpisodeConfig>) {
  return <EpisodeBoard api={api as GameApi<unknown>} episode={api.config.episode} />;
}

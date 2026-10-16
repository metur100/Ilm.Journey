import { useMemo } from 'react';

import type { GameApi } from '@/core/games';

import { CatchRounds } from '../shared/CatchRounds';
import { DOTS_GROUP } from '../shared/letters';
import { usePlayIndex } from '../shared/voice';
import { buildLanternRounds, type LetterLanternsConfig } from './logic';

/** Letter Lanterns: lanterns with letters float down the night sky; catch the ones with the letter you hear. */
export function LetterLanternsGame(api: GameApi<LetterLanternsConfig>) {
  const playIndex = usePlayIndex(api.gameId, api.level);
  const rounds = useMemo(() => buildLanternRounds(api.config, playIndex, `${api.gameId}:${api.level}`, api.language), [api.config, api.gameId, api.level, api.language, playIndex]);
  const dotsFact = api.facts.find((f) => f.id === 'letter-dots')?.id;
  return (
    <CatchRounds
      api={api as GameApi<unknown>}
      rounds={rounds}
      hints={api.config.hints}
      hidden={api.config.mode === 'sound'}
      listenLabel={api.t('play.listen')}
      prompt={(round) => (api.config.mode === 'sound' ? api.t('play.promptSound') : api.t(`play.prompt.${api.config.mode}`, { name: round.show }))}
      factOf={(_itemId, round) => (dotsFact && DOTS_GROUP.includes(round.say) ? dotsFact : undefined)}
    />
  );
}

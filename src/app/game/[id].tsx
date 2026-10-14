import { useLocalSearchParams } from 'expo-router';

import { GameShell } from '@/core/games/shell/GameShell';

/** Any registered mini-game, framed by the GameShell (intro → how to play → levels → play → result). */
export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <GameShell key={id} gameId={String(id ?? '')} />;
}

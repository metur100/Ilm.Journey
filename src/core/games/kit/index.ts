/**
 * Casual game kit (v3) – polished, theme-aware, data-driven mechanics for the mini-games.
 * Guide with every engine's props and a full example: docs/GAMES-FRAMEWORK.md, chapter "Kit".
 * Test helpers live in `@/core/games/kit/testing` (import them from tests only).
 */
export * from './types';
export { kitI18n, type KitKey } from './i18n';
export { kitColors, type KitColors } from './theme';
export { kitResult, kitShuffle, kitStars, formatClock, type KitResultInput } from './scoring';
export { useKit, useKitColors, localizeKitText, type KitEnv, type DragArena } from './context';
export { DragTile, DropZone, zoneAt, type DragTileProps, type DropZoneProps } from './drag';
export { Burst, CheckBadge, Glow, GrowIn, Pop, useFloat, useShake } from './fx';
export { CardBack, FaceView, faceLabel, FlipCard, Slot, Tile, Tray, type FaceViewProps, type FlipCardProps, type SlotProps, type SlotState, type TileProps, type TileState } from './primitives';
export {
  ChallengeClock,
  FinishReveal,
  GameBoard,
  HintPointer,
  InlineCaption,
  ProgressDots,
  useIdleHint,
  useStopwatch,
  type CaptionTone,
  type FinishRevealProps,
  type GameBoardProps,
} from './board';
export { getKitProbes, type KitProbe } from './probe';

// Engines
export { SequenceBoard, moveItem, misplacedIds, type SequenceBoardProps } from './engines/SequenceBoard';
export { SortBins, isRightBin, type SortBin, type SortBinsProps, type SortItem } from './engines/SortBins';
export { MemoryPairs, type MemoryPair, type MemoryPairsProps } from './engines/MemoryPairs';
export { ConnectPairs, type ConnectPair, type ConnectPairsProps } from './engines/ConnectPairs';
export { BuildScene, type BuildPart, type BuildSceneProps } from './engines/BuildScene';

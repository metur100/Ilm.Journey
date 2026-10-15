import * as Haptics from 'expo-haptics';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { type Params, translateNs, useI18n } from '../../i18n';
import type { Language, TopicId } from '../../models';
import { playSound, type SoundName } from '../../services/sound';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme';
import type { GameApi, HapticKind } from '../types';
import { kitI18n, type KitKey } from './i18n';
import { kitColors, type KitColors } from './theme';
import type { KitText } from './types';

/*
 * Kit environment: everything an engine needs from the game (sound, haptics, reduced motion, challenge mode, texts,
 * the topic colours, the shell's progress bar) plus the drop-zone registry shared by the draggables on one board.
 * `GameBoard` provides it from the GameApi; engines used outside a board fall back to the app settings.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ZoneRect extends Rect {
  id: string;
}

/** Drop zones of one board (measured in window coordinates when a drag starts). */
export interface DragArena {
  register: (id: string, node: View | null) => void;
  /** Measures every zone now (also done automatically when a drag starts). */
  measure: () => void;
  rects: SharedValue<ZoneRect[]>;
  /** Id of the zone under the dragged item ('' = none). */
  hover: SharedValue<string>;
  /** Id of the item being dragged ('' = none). */
  dragging: SharedValue<string>;
}

export interface KitEnv {
  topic: TopicId;
  colors: KitColors;
  dark: boolean;
  reducedMotion: boolean;
  challenge: boolean;
  language: Language;
  /** Kit text (namespace `kit`). */
  kt: (key: KitKey, params?: Params) => string;
  /** Localizes a KitText (string or LocalizedText). */
  text: (value: KitText | undefined) => string;
  sound: (name: SoundName) => void;
  haptic: (kind: HapticKind) => void;
  /** Forwards progress to the shell header (when inside a GameShell). */
  reportProgress: (done: number, total: number) => void;
  /** Default shuffle seed (game id + level). */
  seed: string;
  arena: DragArena;
}

const KitContext = createContext<KitEnv | null>(null);

const HAPTICS: Record<HapticKind, () => Promise<void>> = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  selection: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

export function localizeKitText(value: KitText | undefined, language: Language): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.en ?? '';
}

/** Drop-zone registry (one per board). */
export function useDragArena(): DragArena {
  const nodes = useRef(new Map<string, View>());
  const rects = useSharedValue<ZoneRect[]>([]);
  const hover = useSharedValue('');
  const dragging = useSharedValue('');

  const register = useCallback((id: string, node: View | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const entries = [...nodes.current.entries()];
    if (entries.length === 0) {
      rects.set([]);
      return;
    }
    const out: ZoneRect[] = [];
    let pending = entries.length;
    for (const [id, node] of entries) {
      if (typeof node?.measureInWindow !== 'function') {
        pending--;
        if (pending <= 0) rects.set(out.slice());
        continue;
      }
      node.measureInWindow((x, y, w, h) => {
        if (w > 0 && h > 0) out.push({ id, x, y, w, h });
        pending--;
        if (pending <= 0) rects.set(out.slice());
      });
    }
  }, [rects]);

  return useMemo(() => ({ register, measure, rects, hover, dragging }), [register, measure, rects, hover, dragging]);
}

/** Builds the kit environment from a GameApi (or from the app settings when `api` is missing). */
export function useKitEnvValue(api: Partial<GameApi<unknown>> | undefined, topicOverride?: TopicId, arenaOverride?: DragArena): KitEnv {
  const { c, dark, highContrast } = useTheme();
  const { language: appLanguage } = useI18n();
  const systemReduced = useReducedMotion();
  const soundOn = useAppStore((s) => s.settings.sound);
  const hapticsOn = useAppStore((s) => s.settings.haptics);
  const ownArena = useDragArena();
  const arena = arenaOverride ?? ownArena;

  const topic: TopicId = topicOverride ?? api?.topicId ?? 'salah';
  const language = api?.language ?? appLanguage;
  const reducedMotion = api?.reducedMotion ?? systemReduced;
  const challenge = api?.challengeMode ?? false;
  const apiSound = api?.playSound;
  const apiHaptic = api?.haptic;
  const setProgress = api?.setProgress;
  const seed = api ? `${api.gameId ?? 'game'}:${api.level ?? 1}` : 'kit';

  return useMemo<KitEnv>(
    () => ({
      topic,
      colors: kitColors(c, topic, dark, highContrast),
      dark,
      reducedMotion,
      challenge,
      language,
      kt: (key, params) => translateNs(kitI18n, language, key, params),
      text: (value) => localizeKitText(value, language),
      sound: (name) => {
        if (apiSound) apiSound(name);
        else if (soundOn) playSound(name);
      },
      haptic: (kind) => {
        if (apiHaptic) apiHaptic(kind);
        else if (hapticsOn) HAPTICS[kind]().catch(() => undefined);
      },
      reportProgress: (done, total) => setProgress?.(done, total),
      seed,
      arena,
    }),
    [topic, c, dark, highContrast, reducedMotion, challenge, language, apiSound, soundOn, apiHaptic, hapticsOn, setProgress, seed, arena],
  );
}

export function KitProvider({ value, children }: { value: KitEnv; children: ReactNode }) {
  return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
}

/**
 * The kit environment of the surrounding GameBoard. Outside a board, engines still work: they use the app
 * settings (sound, haptics, reduced motion, language) and the Salah colours.
 */
export function useKit(): KitEnv {
  const ctx = useContext(KitContext);
  const fallback = useKitEnvValue(undefined);
  return ctx ?? fallback;
}

/** Cheap variant for primitives (tiles, slots): the board's environment or null outside a board. */
export function useKitMaybe(): KitEnv | null {
  return useContext(KitContext);
}

/** Kit colours of the surrounding board (or the Salah colours of the current theme outside a board). */
export function useKitColors(): KitColors {
  const ctx = useContext(KitContext);
  const { c, dark, highContrast } = useTheme();
  return ctx?.colors ?? kitColors(c, 'salah', dark, highContrast);
}

/** Engine helper: the effective reduced-motion / challenge flags with the engine's own overrides applied. */
export function useEngineFlags(props: { reducedMotion?: boolean; challenge?: boolean; seed?: string }) {
  const env = useKit();
  return {
    env,
    reduced: props.reducedMotion ?? env.reducedMotion,
    challenge: props.challenge ?? env.challenge,
    seed: props.seed ?? env.seed,
  };
}

/* eslint-disable @typescript-eslint/no-require-imports */
import type React from 'react';

import { translateNs } from '../../i18n';
import type { Language } from '../../models';
import type { GameApi, GameDef, GameLevel, GameResultInput } from '../types';
import { getKitProbes, type KitProbe } from './probe';

/*
 * Test helpers for kit games (Jest only – never import this file from app code).
 *
 *   const game = await renderGame(myGame, 1);
 *   await playToEnd(game);                       // plays every engine through its probe until onComplete
 *   expect(game.results[0].stars).toBe(3);
 *
 * Low-level helpers press controls by test id: `tile-<id>`, `zone-<id>`, `card-<key>`, `left-<id>` / `right-<id>`,
 * `spot-<id>`, `row-<id>` (+ `up-<id>` / `down-<id>`), `kit-check`, … (see docs/GAMES-FRAMEWORK.md, "Kit → Testing").
 */

export interface TestNode {
  type: unknown;
  props: Record<string, any>;
  children?: (TestNode | string)[];
  findAll: (predicate: (node: TestNode) => boolean) => TestNode[];
}

type Act = (callback: () => unknown) => Promise<void>;

function renderer(): { act: Act; create: (element: React.ReactElement) => { root: TestNode; unmount: () => void } } {
  return require('react-test-renderer');
}

/** A GameApi for rendering a game component outside the GameShell; collects results, events and progress. */
export function fakeGameApi<C>(
  def: GameDef<C>,
  level: GameLevel,
  options: { language?: Language; reducedMotion?: boolean; challengeMode?: boolean } = {},
): { api: GameApi<C>; results: GameResultInput[]; events: string[]; progress: { done: number; total: number }[] } {
  const language = options.language ?? 'en';
  const levelDef = def.levels[level - 1];
  const results: GameResultInput[] = [];
  const events: string[] = [];
  const progress: { done: number; total: number }[] = [];
  const api: GameApi<C> = {
    gameId: def.id,
    level,
    config: levelDef.config,
    facts: levelDef.facts,
    topicId: def.topicId,
    onComplete: (r) => results.push(r),
    onExit: () => events.push('exit'),
    playSound: (name) => events.push(`sound:${name}`),
    haptic: (kind) => events.push(`haptic:${kind}`),
    setProgress: (done, total) => progress.push({ done, total }),
    reducedMotion: options.reducedMotion ?? true,
    challengeMode: options.challengeMode ?? false,
    language,
    t: (key, params) => translateNs(def.i18n, language, key, params),
    l: (text) => (text ? (text[language] ?? text.en) : ''),
  };
  return { api, results, events, progress };
}

/** Keys and `{placeholders}` of de / bs must match en. Returns the problems found (empty = fine). */
export function namespaceProblems(def: GameDef<unknown>): string[] {
  const dicts = def.i18n.dictionaries as unknown as Record<Language, Record<string, string>>;
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const problems: string[] = [];
  const enKeys = Object.keys(dicts.en).sort();
  for (const lang of ['de', 'bs'] as const) {
    const keys = Object.keys(dicts[lang]).sort();
    if (keys.join('|') !== enKeys.join('|')) problems.push(`${lang}: keys differ`);
    for (const key of enKeys) {
      const value = dicts[lang][key];
      if (!value?.trim()) problems.push(`${lang}.${key}: empty`);
      else if (placeholders(value) !== placeholders(dicts.en[key])) problems.push(`${lang}.${key}: placeholders differ`);
    }
  }
  return problems;
}

export interface RenderedGame {
  root: TestNode;
  results: GameResultInput[];
  events: string[];
  progress: { done: number; total: number }[];
  /** Presses the control with this test id (throws when missing). */
  press: (testID: string) => Promise<void>;
  /** True when a node with this test id is rendered. */
  has: (testID: string) => boolean;
  /** All visible strings, joined with " | ". */
  texts: () => string;
  /** Advances timers (fake timers) or waits (real timers). */
  wait: (ms?: number) => Promise<void>;
  unmount: () => Promise<void>;
}

function usingFakeTimers(): boolean {
  const st = setTimeout as unknown as { clock?: unknown; _isMockFunction?: boolean };
  return typeof st.clock === 'object' || st._isMockFunction === true;
}

export async function wait(ms = 50): Promise<void> {
  const { act } = renderer();
  if (usingFakeTimers()) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  } else {
    await act(async () => {
      await new Promise((r) => setTimeout(r, ms));
    });
  }
}

/** Renders a node and returns helpers (use `renderGame` for a game level). */
export async function renderNode(element: React.ReactElement, extra: { results?: GameResultInput[]; events?: string[]; progress?: { done: number; total: number }[] } = {}): Promise<RenderedGame> {
  const { act, create } = renderer();
  let tree!: { root: TestNode; unmount: () => void };
  await act(async () => {
    tree = create(element);
  });
  // A test id on a pressable, or on a wrapper around one (e.g. a core Button).
  const byId = (testID: string) =>
    tree.root
      .findAll((n) => n.props.testID === testID)
      .map((n) => (typeof n.props.onPress === 'function' ? n : n.findAll((d) => typeof d.props.onPress === 'function')[0]))
      .filter((n): n is TestNode => !!n);
  return {
    root: tree.root,
    results: extra.results ?? [],
    events: extra.events ?? [],
    progress: extra.progress ?? [],
    press: async (testID: string) => {
      const node = byId(testID)[0];
      if (!node) throw new Error(`No pressable with testID "${testID}"`);
      await act(async () => {
        node.props.onPress();
      });
    },
    has: (testID: string) => tree.root.findAll((n) => n.props.testID === testID).length > 0,
    texts: () =>
      tree.root
        .findAll((n) => typeof n.props.children === 'string' || typeof n.props.children === 'number')
        .map((n) => String(n.props.children))
        .join(' | '),
    wait,
    unmount: async () => {
      await act(async () => tree.unmount());
    },
  };
}

/** Renders level `level` of a game component with a fake GameApi (reduced motion on by default). */
export async function renderGame<C>(def: GameDef<C>, level: GameLevel, options: { language?: Language; reducedMotion?: boolean; challengeMode?: boolean } = {}): Promise<RenderedGame> {
  const React = require('react') as typeof import('react');
  const { api, results, events, progress } = fakeGameApi(def, level, options);
  const Game = def.component;
  return renderNode(React.createElement(Game, api), { results, events, progress });
}

export interface PlayOptions {
  /** Wrong moves to play first (through the engines' probes) – to test stars and missed facts. */
  mistakes?: number;
  /** Safety limit of moves. */
  maxSteps?: number;
  /**
   * Called when no engine has a move left but the level is not finished (e.g. a custom "next round" button).
   * Return true when it did something.
   */
  onIdle?: (game: RenderedGame) => Promise<boolean> | boolean;
}

/** Live probes of the mounted engines that still have moves. */
export function activeProbes(): KitProbe[] {
  return getKitProbes().filter((p) => !p.done());
}

/**
 * Plays the level to completion through the kit engines' probes (the same code path as a learner's drop / tap).
 * Waits for the engines' short finishing animations. Resolves with the first reported result.
 */
export async function playToEnd(game: RenderedGame, options: PlayOptions = {}): Promise<GameResultInput> {
  const { act } = renderer();
  const maxSteps = options.maxSteps ?? 400;
  let mistakes = options.mistakes ?? 0;
  let idleRounds = 0;
  for (let i = 0; i < maxSteps && game.results.length === 0; i++) {
    const probe = activeProbes()[0];
    if (probe) {
      idleRounds = 0;
      if (mistakes > 0 && probe.mistake) {
        let made = false;
        await act(async () => {
          made = probe.mistake!();
        });
        if (made) {
          mistakes--;
          await game.wait(1000);
          continue;
        }
        mistakes = 0;
      }
      await act(async () => {
        probe.step();
      });
      await game.wait(20);
      continue;
    }
    await game.wait(1000);
    if (game.results.length > 0) break;
    idleRounds++;
    if (idleRounds >= 2 && options.onIdle) {
      const did = await options.onIdle(game);
      if (did) idleRounds = 0;
    }
    if (idleRounds > 4) break;
  }
  if (game.results.length === 0) {
    throw new Error(`playToEnd: the level did not finish. Engines: ${getKitProbes().map((p) => `${p.engine}(${p.done() ? 'done' : 'open'})`).join(', ') || 'none mounted'}`);
  }
  return game.results[0];
}

import { type ReactNode, useMemo } from 'react';

import type { GameApi } from '@/core/games';
import {
  BuildScene,
  ConnectPairs,
  GameBoard,
  kitResult,
  type KitDoneInfo,
  type KitItem,
  type KitText,
  MemoryPairs,
  PathTrace,
  SequenceBoard,
  SortBins,
  TapScene,
  TimelineSlider,
  WordTiles,
} from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { missedFacts } from './facts';

/*
 * One data-driven component for the Seerah section: every level picks a kit engine (`mode`) and gives it content.
 * Visible words come from the game's i18n namespace (`key`) or from copied content / generated Quran data (`text`),
 * so every game stays configuration + content + art. Missed items map to fact ids (`factMap`) for the review.
 */

/** Text of a face: an i18n key of the game namespace, or content text (Seerah block, Quran translation). */
export type SText = { key: string } | { text: LocalizedText } | { raw: string };

export interface SFace {
  id: string;
  label?: SText;
  sub?: SText;
  art?: string;
  arabic?: string;
  quran?: boolean;
}

export type SeerahLevelConfig = (
  | {
      mode: 'build';
      scene: string;
      parts: (SFace & { slot: { x: number; y: number; w: number; h: number }; sceneArt?: string; caption?: SText })[];
      ordered?: boolean;
      ghosts?: boolean;
      reveal?: { title: SText; caption?: SText };
    }
  | { mode: 'sequence'; items: SFace[]; variant?: 'list' | 'path'; endArt?: string }
  | { mode: 'sort'; bins: SFace[]; items: (SFace & { bin: string })[] }
  | { mode: 'connect'; pairs: { id: string; left: SFace; right: SFace }[]; leftShare?: number }
  | { mode: 'memory'; pairs: { id: string; a: SFace; b?: SFace; caption?: SText }[]; peekMs?: number; columns?: number }
  | { mode: 'path'; map: string; stops: (SFace & { at: { x: number; y: number }; caption?: SText })[]; showRoute?: boolean; tolerance?: number }
  | { mode: 'timeline'; marks: { id: string; label: SText }[]; events: (SFace & { mark: string })[] }
  | { mode: 'words'; target: SFace[]; distractors?: SFace[]; quran?: boolean; joiner?: string }
  | { mode: 'tap'; scene: string; spots: (SFace & { at: { x: number; y: number; w: number; h: number }; target?: boolean; caption?: SText; spotArt?: string })[]; ordered?: boolean }
) & {
  /** Instruction under the board (i18n key). */
  prompt: string;
  hints?: boolean;
  /** Item id → fact id for missed facts. */
  factMap?: Record<string, string>;
};

/** Number of scored moves of a level (for the result). */
export function levelMoves(c: SeerahLevelConfig): number {
  switch (c.mode) {
    case 'build':
      return c.parts.length;
    case 'sequence':
    case 'sort':
      return c.items.length;
    case 'connect':
    case 'memory':
      return c.pairs.length;
    case 'path':
      return Math.max(1, c.stops.length - 1);
    case 'timeline':
      return c.events.length;
    case 'words':
      return c.target.length;
    case 'tap':
      return c.spots.filter((s) => s.target !== false).length;
  }
}

/** Every art name a level uses (tests check them with `hasArt`). */
export function levelArt(c: SeerahLevelConfig): string[] {
  const faces: SFace[] = [];
  const extra: string[] = [];
  switch (c.mode) {
    case 'build':
      faces.push(...c.parts);
      extra.push(c.scene, ...c.parts.map((p) => p.sceneArt ?? '').filter(Boolean));
      break;
    case 'sequence':
      faces.push(...c.items);
      if (c.endArt) extra.push(c.endArt);
      break;
    case 'sort':
      faces.push(...c.bins, ...c.items);
      break;
    case 'connect':
      c.pairs.forEach((p) => faces.push(p.left, p.right));
      break;
    case 'memory':
      c.pairs.forEach((p) => faces.push(p.a, ...(p.b ? [p.b] : [])));
      break;
    case 'path':
      faces.push(...c.stops);
      extra.push(c.map);
      break;
    case 'timeline':
      faces.push(...c.events);
      break;
    case 'words':
      faces.push(...c.target, ...(c.distractors ?? []));
      break;
    case 'tap':
      faces.push(...c.spots);
      extra.push(c.scene, ...c.spots.map((s) => s.spotArt ?? '').filter(Boolean));
      break;
  }
  return [...faces.map((f) => f.art ?? '').filter(Boolean), ...extra];
}

/** Every SText of a level (tests check the i18n keys exist). */
export function levelTexts(c: SeerahLevelConfig): SText[] {
  const out: SText[] = [{ key: c.prompt }];
  const face = (f: SFace) => {
    if (f.label) out.push(f.label);
    if (f.sub) out.push(f.sub);
  };
  switch (c.mode) {
    case 'build':
      c.parts.forEach((p) => {
        face(p);
        if (p.caption) out.push(p.caption);
      });
      if (c.reveal) out.push(c.reveal.title, ...(c.reveal.caption ? [c.reveal.caption] : []));
      break;
    case 'sequence':
      c.items.forEach(face);
      break;
    case 'sort':
      [...c.bins, ...c.items].forEach(face);
      break;
    case 'connect':
      c.pairs.forEach((p) => [p.left, p.right].forEach(face));
      break;
    case 'memory':
      c.pairs.forEach((p) => {
        face(p.a);
        if (p.b) face(p.b);
        if (p.caption) out.push(p.caption);
      });
      break;
    case 'path':
      c.stops.forEach((s) => {
        face(s);
        if (s.caption) out.push(s.caption);
      });
      break;
    case 'timeline':
      c.marks.forEach((m) => out.push(m.label));
      c.events.forEach(face);
      break;
    case 'words':
      [...c.target, ...(c.distractors ?? [])].forEach(face);
      break;
    case 'tap':
      c.spots.forEach((s) => {
        face(s);
        if (s.caption) out.push(s.caption);
      });
      break;
  }
  return out;
}

export function SeerahGame(api: GameApi<SeerahLevelConfig>) {
  const { config: c, language } = api;
  const text = (s: SText | undefined): KitText | undefined => (!s ? undefined : 'key' in s ? api.t(s.key) : 'text' in s ? s.text : s.raw);
  const item = (f: SFace): KitItem => ({ id: f.id, label: text(f.label), sub: text(f.sub), art: f.art, arabic: f.arabic, quran: f.quran });
  // Resolved once per level and language: the engines shuffle by item identity.
  const data = useMemo(() => {
    switch (c.mode) {
      case 'build':
        return { parts: c.parts.map((p) => ({ ...item(p), slot: p.slot, sceneArt: p.sceneArt, caption: text(p.caption) })) };
      case 'sequence':
        return { items: c.items.map(item) };
      case 'sort':
        return { bins: c.bins.map(item), items: c.items.map((i) => ({ ...item(i), bin: i.bin })) };
      case 'connect':
        return { pairs: c.pairs.map((p) => ({ id: p.id, left: item(p.left), right: item(p.right) })) };
      case 'memory':
        return { pairs: c.pairs.map((p) => ({ id: p.id, a: item(p.a), b: p.b ? item(p.b) : undefined, caption: text(p.caption) })) };
      case 'path':
        return { stops: c.stops.map((s) => ({ ...item(s), at: s.at, caption: text(s.caption) })) };
      case 'timeline':
        return { marks: c.marks.map((m) => ({ id: m.id, label: text(m.label)! })), events: c.events.map((e) => ({ ...item(e), mark: e.mark })) };
      case 'words':
        return { target: c.target.map(item), distractors: c.distractors?.map(item) };
      case 'tap':
        return { spots: c.spots.map((s) => ({ ...item(s), at: s.at, target: s.target, caption: text(s.caption), spotArt: s.spotArt })) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, language]);

  const onDone = ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves: levelMoves(c), mistakes, factsMissed: missedFacts(missed, c.factMap ?? {}) }));
  const common = { onDone, hints: c.hints ?? true, prompt: api.t(c.prompt) };
  const d = data as any; // shaped by the switch above for the current mode

  let engine: ReactNode;
  switch (c.mode) {
    case 'build':
      engine = (
        <BuildScene
          {...common}
          scene={c.scene}
          parts={d.parts}
          ordered={c.ordered}
          ghosts={c.ghosts}
          reveal={c.reveal ? { title: text(c.reveal.title), caption: text(c.reveal.caption) } : undefined}
        />
      );
      break;
    case 'sequence':
      engine = <SequenceBoard {...common} items={d.items} variant={c.variant} endArt={c.endArt} />;
      break;
    case 'sort':
      engine = <SortBins {...common} bins={d.bins} items={d.items} />;
      break;
    case 'connect':
      engine = <ConnectPairs {...common} pairs={d.pairs} leftShare={c.leftShare} shuffleLeft />;
      break;
    case 'memory':
      engine = <MemoryPairs {...common} pairs={d.pairs} peekMs={c.peekMs} columns={c.columns} />;
      break;
    case 'path':
      engine = <PathTrace {...common} map={c.map} stops={d.stops} showRoute={c.showRoute} tolerance={c.tolerance} />;
      break;
    case 'timeline':
      engine = <TimelineSlider {...common} marks={d.marks} events={d.events} />;
      break;
    case 'words':
      engine = <WordTiles {...common} target={d.target} distractors={d.distractors} quran={c.quran} joiner={c.joiner} />;
      break;
    case 'tap':
      engine = <TapScene {...common} scene={c.scene} spots={d.spots} ordered={c.ordered} />;
      break;
  }
  return <GameBoard api={api}>{engine}</GameBoard>;
}

import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, useMeasure } from '@/core/games/kit';

import { F, L } from '../shared/facts';
import { SceneDrop } from '../shared/SceneDrop';
import { goodOrSilentRule, treeRule, treeStage, type Word } from './logic';
import { treeI18n } from './i18n';

/*
 * The Good Word Tree – SceneDrop (14:24–25: a good word is like a good tree). Kind words grow the tree from a sprout
 * to a tree full of fruit; hurtful words are refused. L1: six words, hints. L2: ten words, no hints.
 * L3 (twist, Bukhari 6018 – say good or stay silent): every word has a place – kind ones on the tree, hurtful ones
 * into silence.
 */

export interface TreeConfig {
  prompt: string;
  words: Word[];
  silence: boolean;
  hints: boolean;
  fact: string;
}

const W = (id: string, good: boolean): Word => ({ id, good });
const GOOD = ['please', 'thanks', 'salam', 'welldone', 'sorry', 'jazak', 'help', 'cando'].map((id) => W(id, true));
const BAD = ['stupid', 'away', 'nobody', 'loser', 'shut'].map((id) => W(id, false));

/** Interleaves kind and hurtful words so both kinds are in the tray. */
const mixWords = (good: Word[], bad: Word[]) => good.flatMap((g, i) => (bad[i] ? [g, bad[i]] : [g]));

const FACTS = { tree: F.goodTree(), kind: L.kindness(), silent: F.goodOrSilent() };

function GrowingTree({ stage }: { stage: number }) {
  const { w, h, onLayout } = useMeasure();
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {w > 0 ? (
        <Animated.View key={stage} entering={FadeIn.duration(500)} style={StyleSheet.absoluteFill}>
          <Art name={`akhlaq.word-tree-${stage}`} size={w} height={h} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function GoodWordTreeGame(api: GameApi<TreeConfig>) {
  const { words, silence, hints, prompt, fact } = api.config;
  const goodTotal = words.filter((w) => w.good).length;
  const [grown, setGrown] = useState(0);
  const rule = useMemo(() => (silence ? goodOrSilentRule(words, api.t('toTree'), api.t('toSilent')) : treeRule(words, api.t('hurt'))), [silence, words, api.t]);
  const tree = { id: 'tree', at: silence ? { x: 0.3, y: 0.08, w: 0.66, h: 0.82 } : { x: 0.17, y: 0.08, w: 0.66, h: 0.82 }, label: api.t('target.tree') };
  const silent = { id: 'silent', at: { x: 0.03, y: 0.04, w: 0.26, h: 0.22 }, art: 'akhlaq.quiet-bubble', label: api.t('target.silent') };
  return (
    <GameBoard api={api}>
      <SceneDrop
        scene="akhlaq.word-garden"
        backdrop={<GrowingTree stage={treeStage(grown, goodTotal)} />}
        targets={silence ? [tree, silent] : [tree]}
        items={words.map((w) => ({ id: w.id, label: api.t(`w.${w.id}`) }))}
        rule={rule}
        ordered
        hidePlaced
        hints={hints}
        tileWidth={96}
        prompt={api.t(prompt)}
        rightCaption={(m) => (m.target === 'tree' ? api.t('grew') : undefined)}
        onPlaced={(placed) => setGrown(placed.filter((p) => p.target === 'tree').length)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: rule.total, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const goodWordTreeGame: GameDef<TreeConfig> = {
  id: 'good-word-tree',
  topicId: 'akhlaq',
  i18n: treeI18n,
  coverArt: 'akhlaq.word-tree-4',
  hintArt: 'akhlaq.word-tree-2',
  component: GoodWordTreeGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', words: mixWords(GOOD.slice(0, 4), BAD.slice(0, 2)), silence: false, hints: true, fact: FACTS.tree.id }, facts: [FACTS.tree] },
    { level: 2, config: { prompt: 'play.l2', words: mixWords(GOOD.slice(2, 8), BAD.slice(0, 4)), silence: false, hints: false, fact: FACTS.kind.id }, facts: [FACTS.kind] },
    { level: 3, config: { prompt: 'play.l3', words: mixWords([GOOD[0], GOOD[1], GOOD[4], GOOD[6], GOOD[7]], BAD), silence: true, hints: false, fact: FACTS.silent.id }, facts: [FACTS.silent] },
  ],
  order: 110,
};

export function registerGoodWordTreeGame(): void {
  registerGame(goodWordTreeGame);
}

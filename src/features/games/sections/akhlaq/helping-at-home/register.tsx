import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, TapScene, type KitBox } from '@/core/games/kit';

import { F, L } from '../shared/facts';
import { homeI18n } from './i18n';

/*
 * Helping at Home – TapScene in an illustrated room (no people). L1: find four ways to help, in any order, with
 * hints. L2: one task after another ("Find: …"), no hints, playing on is a distractor. L3 (twist): help, kind
 * words and the dua for parents from 17:24 – while "uff" and playing on are left alone.
 */

interface Spot {
  id: string;
  art: string;
  at: KitBox;
  target: boolean;
}

export interface HomeConfig {
  prompt: string;
  spots: Spot[];
  ordered: boolean;
  hints: boolean;
  fact: string;
}

const S = (id: string, art: string, at: KitBox, target = true): Spot => ({ id, art, at, target });

const BAGS = S('bags', 'akhlaq.shopping-bags', { x: 0.07, y: 0.66, w: 0.19, h: 0.18 });
const DISHES = S('dishes', 'akhlaq.dishes', { x: 0.67, y: 0.36, w: 0.18, h: 0.14 });
const PLANT = S('plant', 'garden.thirsty-plant', { x: 0.11, y: 0.32, w: 0.14, h: 0.18 });
const SHOES = S('shoes', 'akhlaq.shoes', { x: 0.47, y: 0.83, w: 0.2, h: 0.13 });
const LAUNDRY = S('laundry', 'akhlaq.shirt', { x: 0.37, y: 0.53, w: 0.14, h: 0.15 });
const KIND = S('kind', 'akhlaq.salam-bubble', { x: 0.56, y: 0.1, w: 0.16, h: 0.16 });
const DUA = S('dua', 'object.prayer-mat', { x: 0.74, y: 0.8, w: 0.22, h: 0.16 });
const GAME = S('game', 'akhlaq.game-pad', { x: 0.26, y: 0.84, w: 0.14, h: 0.11 }, false);
const UFF = S('uff', 'akhlaq.mean-bubble', { x: 0.77, y: 0.04, w: 0.16, h: 0.16 }, false);

const FACTS = { example: L.parentsExample(), parents: L.parents(), mother: F.motherFirst() };

function HelpingAtHomeGame(api: GameApi<HomeConfig>) {
  const { spots, ordered, hints, prompt, fact } = api.config;
  const targets = spots.filter((s) => s.target).length;
  return (
    <GameBoard api={api}>
      <TapScene
        scene="akhlaq.home-room"
        spots={spots.map((s) => ({
          id: s.id,
          at: s.at,
          spotArt: s.art,
          art: s.art,
          label: api.t(`spot.${s.id}`),
          target: s.target,
          caption: s.target ? api.t(`cap.${s.id}`) : undefined,
        }))}
        ordered={ordered}
        hints={hints}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: targets, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const helpingAtHomeGame: GameDef<HomeConfig> = {
  id: 'helping-at-home',
  topicId: 'akhlaq',
  i18n: homeI18n,
  coverArt: 'akhlaq.home-room',
  hintArt: 'akhlaq.shopping-bags',
  component: HelpingAtHomeGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', spots: [BAGS, DISHES, PLANT, SHOES], ordered: false, hints: true, fact: FACTS.example.id }, facts: [FACTS.example] },
    { level: 2, config: { prompt: 'play.l2', spots: [DISHES, BAGS, LAUNDRY, PLANT, SHOES, GAME], ordered: true, hints: false, fact: FACTS.parents.id }, facts: [FACTS.parents] },
    { level: 3, config: { prompt: 'play.l3', spots: [BAGS, DISHES, LAUNDRY, KIND, DUA, GAME, UFF], ordered: false, hints: false, fact: FACTS.mother.id }, facts: [FACTS.mother] },
  ],
  order: 30,
};

export function registerHelpingAtHomeGame(): void {
  registerGame(helpingAtHomeGame);
}

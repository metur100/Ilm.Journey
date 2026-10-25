import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { ConnectPairs, GameBoard, kitResult } from '@/core/games/kit';

import { F, L } from '../shared/facts';
import { trustI18n } from './i18n';

/*
 * Return the Trust – ConnectPairs. L1: three borrowed things → their owners (pictures on both sides, hints).
 * L2: four other borrowed things (mushaf stand, basket, umbrella, pen), both sides shuffled, no hints. L3 (twist): the four kinds of amanah named in the lesson
 * (a borrowed thing, a secret, a promise, a task) – match each example to its kind.
 */

interface Side {
  key: string;
  art?: string;
}
interface TrustPair {
  id: string;
  left: Side;
  right: Side;
}

export interface TrustConfig {
  prompt: string;
  pairs: TrustPair[];
  shuffleLeft: boolean;
  hints: boolean;
  fact: string;
}

const P = (id: string, left: Side, right: Side): TrustPair => ({ id, left, right });

const BOOK = P('book', { key: 'item.book', art: 'object.book' }, { key: 'owner.library', art: 'akhlaq.library' });
const LADDER = P('ladder', { key: 'item.ladder', art: 'akhlaq.ladder' }, { key: 'owner.neighbour', art: 'place.house' });
const BALL = P('ball', { key: 'item.ball', art: 'akhlaq.ball' }, { key: 'owner.school', art: 'akhlaq.school' });
const MUSHAF = P('mushaf-stand', { key: 'item.mushaf', art: 'object.quran-stand' }, { key: 'owner.masjid', art: 'garden.masjid-small' });
const BASKET = P('basket', { key: 'item.basket', art: 'object.basket' }, { key: 'owner.shop', art: 'place.market' });
const UMBRELLA = P('umbrella', { key: 'item.umbrella', art: 'akhlaq.umbrella' }, { key: 'owner.aunt', art: 'place.house' });
const PEN = P('pen', { key: 'item.pen', art: 'object.pen' }, { key: 'owner.school', art: 'akhlaq.school' });

const KINDS = [
  P('borrowed', { key: 'l3.game', art: 'akhlaq.toy-car' }, { key: 'kind.borrowed' }),
  P('secret', { key: 'l3.secret', art: 'akhlaq.secret-bubble' }, { key: 'kind.secret' }),
  P('promise', { key: 'l3.promise', art: 'object.clock' }, { key: 'kind.promise' }),
  P('task', { key: 'l3.task', art: 'animal.cat' }, { key: 'kind.task' }),
];

const FACTS = { amanah: L.amanah(), example: L.amanahExample(), keep: F.keepTrusts() };

function ReturnTheTrustGame(api: GameApi<TrustConfig>) {
  const { pairs, prompt, shuffleLeft, hints, fact } = api.config;
  const face = (s: Side) => ({ art: s.art, label: api.t(s.key) });
  return (
    <GameBoard api={api}>
      <ConnectPairs
        pairs={pairs.map((p) => ({ id: p.id, left: face(p.left), right: face(p.right) }))}
        shuffleLeft={shuffleLeft}
        hints={hints}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: pairs.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const returnTheTrustGame: GameDef<TrustConfig> = {
  id: 'return-the-trust',
  topicId: 'akhlaq',
  i18n: trustI18n,
  coverArt: 'akhlaq.library',
  hintArt: 'object.book',
  component: ReturnTheTrustGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', pairs: [BOOK, LADDER, BALL], shuffleLeft: false, hints: true, fact: FACTS.amanah.id }, facts: [FACTS.amanah] },
    { level: 2, config: { prompt: 'play.l2', pairs: [MUSHAF, BASKET, UMBRELLA, PEN], shuffleLeft: true, hints: false, fact: FACTS.example.id }, facts: [FACTS.example] },
    { level: 3, config: { prompt: 'play.l3', pairs: KINDS, shuffleLeft: true, hints: false, fact: FACTS.keep.id }, facts: [FACTS.keep] },
  ],
  order: 70,
};

export function registerReturnTheTrustGame(): void {
  registerGame(returnTheTrustGame);
}

import { TOWN_ROUTE } from '@/core/art/pieces/sections/akhlaq';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, PathTrace } from '@/core/games/kit';

import { F } from '../shared/facts';
import { salamI18n } from './i18n';

/*
 * Salam Street – PathTrace along the road of a little town (akhlaq.village-map). Every stop is a salam (Muslim 54;
 * Bukhari 12 – to those you know and those you do not know; 4:86 – answer with a better greeting).
 * Every level walks another part of the road: L1 home → neighbours → shop, with the dashed guide (spread salam).
 * L2 shop → bakery → school: people you know and do not know. L3 school → park → library → masjid without guide
 * (answer with a better greeting).
 */

const STOP_IDS = ['home', 'neighbour', 'shop', 'bakery', 'school', 'park', 'library', 'masjid'] as const;
const STOP_ART: Record<string, string> = { home: 'place.house', masjid: 'garden.masjid-small', library: 'akhlaq.library', school: 'akhlaq.school' };

export interface SalamConfig {
  prompt: string;
  /** Route points `from` … `to` (indices into STOP_IDS / TOWN_ROUTE, inclusive). */
  from: number;
  to: number;
  showRoute: boolean;
  hints: boolean;
  fact: string;
}

const FACTS = { spread: F.spreadSalam(), all: F.salamToAll(), better: F.returnGreeting() };

function SalamStreetGame(api: GameApi<SalamConfig>) {
  const { from, to, showRoute, hints, prompt, fact } = api.config;
  const ids = STOP_IDS.slice(from, to + 1);
  return (
    <GameBoard api={api}>
      <PathTrace
        map="akhlaq.village-map"
        stops={ids.map((id, i) => ({
          id,
          at: { x: TOWN_ROUTE[from + i][0] / 400, y: TOWN_ROUTE[from + i][1] / 300 },
          label: api.t(`stop.${id}`),
          art: STOP_ART[id],
          caption: i > 0 ? api.t(`cap.${id}`) : undefined,
        }))}
        showRoute={showRoute}
        hints={hints}
        tolerance={0.07}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: ids.length - 1, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const salamStreetGame: GameDef<SalamConfig> = {
  id: 'salam-street',
  topicId: 'akhlaq',
  i18n: salamI18n,
  coverArt: 'akhlaq.village-map',
  hintArt: 'akhlaq.salam-bubble',
  component: SalamStreetGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', from: 0, to: 2, showRoute: true, hints: true, fact: FACTS.spread.id }, facts: [FACTS.spread] },
    { level: 2, config: { prompt: 'play.l2', from: 2, to: 4, showRoute: true, hints: false, fact: FACTS.all.id }, facts: [FACTS.all] },
    { level: 3, config: { prompt: 'play.l3', from: 4, to: 7, showRoute: false, hints: false, fact: FACTS.better.id }, facts: [FACTS.better] },
  ],
  order: 40,
};

export function registerSalamStreetGame(): void {
  registerGame(salamStreetGame);
}

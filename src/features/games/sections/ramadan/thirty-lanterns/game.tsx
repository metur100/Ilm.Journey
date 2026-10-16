import type { GameApi } from '@/core/games';
import { GameBoard } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { finishWith, ramadanGame } from '../shared/define';
import { LanternTrail, type TrailLantern } from '../shared/engines/LanternTrail';
import { FACTS, T } from '../shared/facts';

/*
 * Thirty Lanterns: one lantern for every day of Ramadan, lit with a good deed (the deeds of the Ramadan tracker,
 * quests/ramadan.json "goodDeeds"). Trace from lantern to lantern.
 * L1: days 1–10 on a winding path with a guide and hints. L2: days 11–20, no guide. L3: the last ten nights, scattered
 * over the sky – find the next day yourself.
 */

export const LANTERNS_ID = 'thirty-lanterns';

const i18n = defineNamespace(`game.${LANTERNS_ID}`, {
  en: {
    title: 'Thirty Lanterns',
    description: 'Light one lantern for every day of Ramadan – each with a good deed.',
    howTo: 'Trace a line with your finger from lantern to lantern, day after day (or tap the next lantern).',
    'play.prompt': 'Start at day {day} and trace to each next lantern.',
    'play.scatter': 'The last ten nights! Find day {day}, then the next one …',
    lit: 'Day {day}: {deed}',
    lantern: 'Lantern of day {day}',
  },
  de: {
    title: 'Dreißig Laternen',
    description: 'Zünde für jeden Tag des Ramadan eine Laterne an – jede mit einer guten Tat.',
    howTo: 'Zieh mit dem Finger eine Linie von Laterne zu Laterne, Tag für Tag (oder tippe auf die nächste Laterne).',
    'play.prompt': 'Beginne bei Tag {day} und zieh zu jeder nächsten Laterne.',
    'play.scatter': 'Die letzten zehn Nächte! Finde Tag {day}, dann den nächsten …',
    lit: 'Tag {day}: {deed}',
    lantern: 'Laterne von Tag {day}',
  },
  bs: {
    title: 'Trideset fenjera',
    description: 'Upali po jedan fenjer za svaki dan ramazana – svaki s dobrim djelom.',
    howTo: 'Prstom povuci liniju od fenjera do fenjera, dan za danom (ili dodirni sljedeći fenjer).',
    'play.prompt': 'Počni od {day}. dana i povuci do svakog sljedećeg fenjera.',
    'play.scatter': 'Posljednjih deset noći! Pronađi {day}. dan, pa sljedeći …',
    lit: '{day}. dan: {deed}',
    lantern: 'Fenjer {day}. dana',
  },
});

/** The Ramadan good-deed tracker (quests/ramadan.json "goodDeeds"), copied. */
export const DEEDS = [
  T('Prayed on time', 'Pünktlich gebetet', 'Klanjao na vrijeme'),
  T('Read or listened to Quran', 'Koran gelesen oder gehört', "Učio ili slušao Kur'an"),
  T('Helped at home', 'Zu Hause geholfen', 'Pomogao kod kuće'),
  T('Gave charity or shared food', 'Gespendet oder Essen geteilt', 'Dao sadaku ili podijelio hranu'),
  T('Said kind words', 'Freundliche Worte gesagt', 'Rekao lijepe riječi'),
  T("Made dua for others", "Du'a für andere gemacht", 'Uputio dovu za druge'),
  T('Learned something new about Islam', 'Etwas Neues über den Islam gelernt', 'Naučio nešto novo o islamu'),
];

const days = (from: number): TrailLantern[] => Array.from({ length: 10 }, (_, i) => ({ id: `day-${from + i}`, day: from + i, deed: DEEDS[(from + i - 1) % DEEDS.length] }));

export interface LanternsConfig {
  from: number;
  layout: 'path' | 'scatter';
  route: boolean;
  hints: boolean;
}

function ThirtyLanternsGame(api: GameApi<LanternsConfig>) {
  const { from, layout, route, hints } = api.config;
  const lanterns = days(from);
  return (
    <GameBoard api={api}>
      <LanternTrail
        lanterns={lanterns}
        layout={layout}
        showRoute={route}
        hints={hints}
        prompt={api.t(layout === 'scatter' ? 'play.scatter' : 'play.prompt', { day: from })}
        texts={{ lit: (day, deed) => api.t('lit', { day, deed }), lantern: (day) => api.t('lantern', { day }) }}
        onDone={finishWith(api, lanterns.length)}
      />
    </GameBoard>
  );
}

export const thirtyLanternsGame = ramadanGame<LanternsConfig>({
  id: LANTERNS_ID,
  i18n,
  coverArt: 'ramadan.lantern-lit',
  hintArt: 'ramadan.lantern-night',
  component: ThirtyLanternsGame,
  levels: [
    { level: 1, config: { from: 1, layout: 'path', route: true, hints: true }, facts: [FACTS.generous] },
    { level: 2, config: { from: 11, layout: 'path', route: false, hints: false }, facts: [FACTS.quranMonth] },
    { level: 3, config: { from: 21, layout: 'scatter', route: false, hints: false }, facts: [FACTS.sawm] },
  ],
  teaches: { questionKeys: ['quest:ramadan-charity-scenario'] },
  order: 50,
});

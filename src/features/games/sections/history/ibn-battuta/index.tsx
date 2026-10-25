import { regionPoint } from '@/core/art/pieces/sections/history';
import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, type KitItem, PathTrace, type PathStop, SequenceBoard } from '@/core/games/kit';

import { BATTUTA_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * The Journey of Ibn Battuta (his Rihla): trace his first journey, from Tangier (1325) to the Hajj.
 *   Every level has its own content (owner feedback: no level repeats the content of another):
 *   L1 – Tangier → Tunis → Cairo, dashed guide and hints.
 *   L2 – Cairo → Damascus → Madinah → Makkah with the pilgrims’ caravan, no guide, no hints.
 *   L3 – his life of travel in order: from setting out to the book of his journeys, the Rihla (SequenceBoard).
 */

const CITY: Record<string, { lon: number; lat: number; label: ReturnType<typeof T>; caption: ReturnType<typeof T> }> = {
  tangier: { lon: -5.8, lat: 35.77, label: T('Tangier', 'Tanger', 'Tanger'), caption: T('Tangier – his home town. He set out in 1325.', 'Tanger – seine Heimatstadt. Er brach 1325 auf.', 'Tanger – njegov rodni grad. Krenuo je 1325.') },
  tunis: { lon: 10.18, lat: 36.8, label: T('Tunis', 'Tunis', 'Tunis'), caption: T('Along the coast of North Africa to Tunis.', 'Die Küste Nordafrikas entlang nach Tunis.', 'Obalom sjeverne Afrike do Tunisa.') },
  cairo: { lon: 31.24, lat: 30.04, label: T('Cairo', 'Kairo', 'Kairo'), caption: T('Cairo, on the Nile in Egypt.', 'Kairo, am Nil in Ägypten.', 'Kairo, na Nilu u Egiptu.') },
  damascus: { lon: 36.3, lat: 33.51, label: T('Damascus', 'Damaskus', 'Damask'), caption: T('Damascus – from here he joined the pilgrims’ caravan.', 'Damaskus – hier schloss er sich der Pilgerkarawane an.', 'Damask – ovdje se pridružio hadžijskoj karavani.') },
  madinah: { lon: 39.61, lat: 24.47, label: T('Madinah', 'Medina', 'Medina'), caption: T('Madinah, the city of the Prophet ﷺ.', 'Medina, die Stadt des Propheten ﷺ.', 'Medina, Poslanikov ﷺ grad.') },
  makkah: { lon: 39.83, lat: 21.42, label: T('Makkah', 'Mekka', 'Mekka'), caption: T('Makkah – he made the Hajj.', 'Mekka – er vollzog die Hadsch.', 'Mekka – obavio je hadž.') },
};

const stop = (id: string): PathStop => ({ id, label: CITY[id].label, caption: CITY[id].caption, at: regionPoint(CITY[id].lon, CITY[id].lat) });

export type BattutaConfig = { mode: 'trace'; cities: string[]; route: boolean; hints: boolean } | { mode: 'story' };

/** L3 – his life of travel in order (facts: battuta-1325, battuta-rihla). */
const STORY: KitItem[] = [
  { id: 'set-out', art: 'history.journey-cover', label: T('Sets out from Tangier (1325)', 'Bricht von Tanger auf (1325)', 'Kreće iz Tangera (1325)') },
  { id: 'hajj', art: 'object.kaaba-icon', label: T('Makes the Hajj in Makkah', 'Vollzieht die Hadsch in Mekka', 'Obavlja hadž u Mekki') },
  { id: 'thirty-years', art: 'object.compass', label: T('Travels for almost thirty years', 'Reist fast dreißig Jahre lang', 'Putuje skoro trideset godina') },
  { id: 'morocco', art: 'object.tent', label: T('Comes back to Morocco', 'Kehrt nach Marokko zurück', 'Vraća se u Maroko') },
  { id: 'rihla', art: 'history.book-gold', label: T('Ibn Juzayy writes down the Rihla', 'Ibn Dschuzaiy schreibt die Rihla auf', 'Ibn Džuzejj zapisuje Rihlu') },
];
const STORY_FACT: Record<string, string> = { 'set-out': F.set.id, hajj: F.set.id, 'thirty-years': F.rihla.id, morocco: F.rihla.id, rihla: F.rihla.id };

const texts = {
  title: T('The Journey of Ibn Battuta', 'Die Reise des Ibn Battuta', 'Putovanje Ibn Battute'),
  description: T(
    'In 1325 Ibn Battuta left Tangier for the Hajj. Trace his way across North Africa, Egypt and Syria to Makkah.',
    '1325 verließ Ibn Battuta Tanger, um die Hadsch zu vollziehen. Folge seinem Weg durch Nordafrika, Ägypten und Syrien bis nach Mekka.',
    'Ibn Battuta je 1325. godine krenuo iz Tangera na hadž. Prati njegov put preko sjeverne Afrike, Egipta i Sirije do Mekke.',
  ),
  howTo: T(
    'Trace the route with your finger from city to city. At the end, put his life of travel in order.',
    'Fahre die Route mit dem Finger von Stadt zu Stadt nach. Zum Schluss bringst du sein Leben auf Reisen in die richtige Reihenfolge.',
    'Prstom prati put od grada do grada. Na kraju poredaj njegov putnički život.',
  ),
  'play.prompt': T('Trace the journey from city to city.', 'Folge der Reise von Stadt zu Stadt.', 'Prati putovanje od grada do grada.'),
  'play.story': T('Put his life of travel in order.', 'Bring sein Leben auf Reisen in die richtige Reihenfolge.', 'Poredaj njegov putnički život.'),
};

export function IbnBattutaGame(api: GameApi<BattutaConfig>) {
  const { config } = api;
  if (config.mode === 'story') {
    return (
      <GameBoard api={api as GameApi<unknown>}>
        <SequenceBoard
          items={STORY}
          variant="list"
          hints={false}
          prompt={api.t('play.story')}
          onDone={finishWith(api as GameApi<unknown>, STORY.length, (id) => (api.facts.some((f) => f.id === STORY_FACT[id]) ? STORY_FACT[id] : undefined))}
        />
      </GameBoard>
    );
  }
  const stops = config.cities.map(stop);
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <PathTrace map="history.map-region" stops={stops} showRoute={config.route} tolerance={0.07} hints={config.hints} prompt={api.t('play.prompt')} onDone={finishWith(api as GameApi<unknown>, stops.length - 1)} />
    </GameBoard>
  );
}

export const ibnBattutaGame = historyGame<BattutaConfig>({
  id: 'ibn-battuta',
  texts,
  coverArt: 'history.journey-cover',
  hintArt: 'history.map-region',
  component: IbnBattutaGame,
  levels: [
    { config: { mode: 'trace', cities: ['tangier', 'tunis', 'cairo'], route: true, hints: true }, facts: [F.set] },
    { config: { mode: 'trace', cities: ['cairo', 'damascus', 'madinah', 'makkah'], route: false, hints: false }, facts: [F.route] },
    { config: { mode: 'story' }, facts: [F.rihla] },
  ],
  order: 110,
});

export function registerIbnBattutaGame(): void {
  registerGame(ibnBattutaGame);
}

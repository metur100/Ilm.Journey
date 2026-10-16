import { BUBBLE_R, HISTORY_MAP, MOSQUE_BUBBLES, type MosqueBubble } from '@/core/art/pieces/sections/history';
import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, type SceneSpot, SequenceBoard, TapScene } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { MOSQUE_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Great Mosques of the World – a map from Córdoba to Makkah.
 *   L1 – find the three mosques of Bukhari 1189 on the map (the others are there too), hints.
 *   L2 – find all seven mosques, one after another, no hints.
 *   L3 – order them from the oldest to the newest (Bukhari 3366 for the first two).
 */

const MOSQUES: Record<MosqueBubble, { name: LocalizedText; art: string; caption: LocalizedText }> = {
  haram: { name: T('Masjid al-Haram', 'Masdschid al-Haram', 'Mesdžidul-haram'), art: 'place.masjid-haram', caption: T('Masjid al-Haram – Makkah, around the Kaʿba.', 'Masdschid al-Haram – Mekka, rund um die Kaaba.', 'Mesdžidul-haram – Mekka, oko Kabe.') },
  nabawi: { name: T('The Prophet’s Mosque', 'Die Prophetenmoschee', 'Poslanikov mesdžid'), art: 'place.masjid-nabawi', caption: T('The Prophet’s Mosque – Madinah.', 'Die Prophetenmoschee – Medina.', 'Poslanikov mesdžid – Medina.') },
  aqsa: { name: T('Masjid al-Aqsa', 'Masdschid al-Aqsa', 'Mesdžidul-aksa'), art: 'place.masjid-aqsa', caption: T('Masjid al-Aqsa – Jerusalem.', 'Masdschid al-Aqsa – Jerusalem.', 'Mesdžidul-aksa – Jerusalem.') },
  umayyad: { name: T('Umayyad Mosque', 'Umayyaden-Moschee', 'Emevijska džamija'), art: 'history.umayyad', caption: T('The Umayyad Mosque – Damascus.', 'Die Umayyaden-Moschee – Damaskus.', 'Emevijska džamija – Damask.') },
  cordoba: { name: T('Mosque of Córdoba', 'Moschee von Córdoba', 'Džamija u Kordobi'), art: 'history.cordoba-mosque', caption: T('The Great Mosque – Córdoba, al-Andalus.', 'Die Große Moschee – Córdoba, al-Andalus.', 'Velika džamija – Kordoba, el-Andalus.') },
  suleymaniye: { name: T('Süleymaniye Mosque', 'Süleymaniye-Moschee', 'Sulejmanija'), art: 'history.suleymaniye', caption: T('The Süleymaniye Mosque – Istanbul.', 'Die Süleymaniye-Moschee – Istanbul.', 'Sulejmanija džamija – Istanbul.') },
  'gazi-husrev-beg': { name: T('Gazi Husrev-beg Mosque', 'Gazi-Husrev-beg-Moschee', 'Gazi Husrev-begova džamija'), art: 'history.gazi-husrev-beg', caption: T('The Gazi Husrev-beg Mosque – Sarajevo.', 'Die Gazi-Husrev-beg-Moschee – Sarajevo.', 'Gazi Husrev-begova džamija – Sarajevo.') },
};

/** From the oldest to the newest. */
const BY_AGE: MosqueBubble[] = ['haram', 'aqsa', 'nabawi', 'umayyad', 'cordoba', 'gazi-husrev-beg', 'suleymaniye'];
const AGE_SUB: Record<MosqueBubble, LocalizedText | undefined> = {
  haram: undefined,
  aqsa: undefined,
  nabawi: T('622', '622', '622.'),
  umayyad: T('8th c.', '8. Jh.', '8. st.'),
  cordoba: T('785', '785', '785.'),
  'gazi-husrev-beg': T('1531', '1531', '1531.'),
  suleymaniye: T('1557', '1557', '1557.'),
};

const spot = (id: MosqueBubble, target: boolean): SceneSpot => {
  const b = MOSQUE_BUBBLES[id];
  const m = MOSQUES[id];
  const pad = BUBBLE_R - 2;
  return {
    id,
    label: m.name,
    spotArt: m.art,
    caption: m.caption,
    target,
    at: { x: (b.bx - pad) / HISTORY_MAP.w, y: (b.by - pad) / HISTORY_MAP.h, w: (pad * 2) / HISTORY_MAP.w, h: (pad * 2) / HISTORY_MAP.h },
  };
};

export interface MosquesConfig {
  mode: 'three' | 'all' | 'age';
}

const texts = {
  title: T('Great Mosques of the World', 'Große Moscheen der Welt', 'Velike džamije svijeta'),
  description: T(
    'From Makkah to Córdoba and Sarajevo: find the great mosques on the map and learn which is the oldest.',
    'Von Mekka bis Córdoba und Sarajevo: finde die großen Moscheen auf der Karte und erfahre, welche die älteste ist.',
    'Od Mekke do Kordobe i Sarajeva: pronađi velike džamije na karti i saznaj koja je najstarija.',
  ),
  howTo: T('Tap the mosque the caption asks for.', 'Tippe auf die Moschee, nach der gefragt wird.', 'Dodirni džamiju koju tražimo.'),
  'play.find': T('Find the mosques on the map.', 'Finde die Moscheen auf der Karte.', 'Pronađi džamije na karti.'),
  'play.age': T('From the oldest to the newest – put them in order, then tap Check.', 'Von der ältesten zur neuesten – bring sie in die Reihenfolge und tippe auf Prüfen.', 'Od najstarije do najnovije – poredaj ih, pa dodirni Provjeri.'),
};

const THREE: MosqueBubble[] = ['haram', 'nabawi', 'aqsa'];

export function GreatMosquesGame(api: GameApi<MosquesConfig>) {
  const { mode } = api.config;
  let board;
  if (mode === 'age') {
    board = (
      <SequenceBoard
        items={BY_AGE.map((id) => ({ id, label: MOSQUES[id].name, art: MOSQUES[id].art, sub: AGE_SUB[id] }))}
        hints={false}
        prompt={api.t('play.age')}
        onDone={finishWith(api as GameApi<unknown>, BY_AGE.length, (id) => (id === 'haram' || id === 'aqsa' ? F.forty.id : F.gaziHusrevBeg.id))}
      />
    );
  } else {
    const order: MosqueBubble[] = mode === 'three' ? THREE : ['aqsa', 'cordoba', 'haram', 'gazi-husrev-beg', 'umayyad', 'nabawi', 'suleymaniye'];
    const others = (Object.keys(MOSQUE_BUBBLES) as MosqueBubble[]).filter((id) => !order.includes(id));
    const spots = [...order.map((id) => spot(id, true)), ...others.map((id) => spot(id, false))];
    board = (
      <TapScene
        scene="history.map-mosques"
        spots={spots}
        ordered
        hints={mode === 'three'}
        prompt={api.t('play.find')}
        onDone={finishWith(api as GameApi<unknown>, order.length, (id) => {
          if (mode === 'three') return id === 'haram' ? F.firstHouse.id : F.three.id;
          return id === 'suleymaniye' ? F.suleymaniye.id : F.umayyad.id;
        })}
      />
    );
  }
  return <GameBoard api={api as GameApi<unknown>}>{board}</GameBoard>;
}

export const greatMosquesGame = historyGame<MosquesConfig>({
  id: 'great-mosques',
  texts,
  coverArt: 'history.map-mosques',
  hintArt: 'place.masjid-haram',
  component: GreatMosquesGame,
  levels: [
    { config: { mode: 'three' }, facts: [F.three, F.firstHouse] },
    { config: { mode: 'all' }, facts: [F.umayyad, F.suleymaniye] },
    { config: { mode: 'age' }, facts: [F.forty, F.gaziHusrevBeg] },
  ],
  order: 80,
});

export function registerGreatMosquesGame(): void {
  registerGame(greatMosquesGame);
}

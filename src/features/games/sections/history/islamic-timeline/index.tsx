import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, type TimelineEvent, type TimelineMark, TimelineSlider } from '@/core/games/kit';

import { TIMELINE_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Timeline of Islamic History – the kit's TimelineSlider, one era per level.
 *   L1 – the Prophet's ﷺ time: exact years (Seerah events), hints.
 *   L2 – caliphs, al-Andalus and the Golden Age: centuries CE.
 *   L3 – Islam in Bosnia: exact years, no hints.
 */

type Era = 'prophet' | 'golden' | 'bosnia';

const ERAS: Record<Era, { marks: TimelineMark[]; events: TimelineEvent[] }> = {
  prophet: {
    marks: [
      { id: '570', label: T('c. 570', 'um 570', 'oko 570.') },
      { id: '610', label: T('c. 610', 'um 610', 'oko 610.') },
      { id: '622', label: '622' },
      { id: '630', label: '630' },
      { id: '632', label: '632' },
    ],
    events: [
      { id: 'elephant', mark: '570', art: 'animal.elephant', label: T('The Year of the Elephant', 'Das Jahr des Elefanten', 'Godina slona') },
      { id: 'revelation', mark: '610', art: 'place.cave-hira', label: T('The first revelation in the cave of Hira', 'Die erste Offenbarung in der Höhle Hira', 'Prva Objava u pećini Hira') },
      { id: 'hijrah', mark: '622', art: 'place.desert-road', label: T('The Hijra to Madinah', 'Die Hidschra nach Medina', 'Hidžra u Medinu') },
      { id: 'conquest', mark: '630', art: 'place.kaaba', label: T('The conquest of Makkah', 'Die Einnahme Mekkas', 'Oslobođenje Mekke') },
      { id: 'farewell', mark: '632', art: 'place.masjid-haram', label: T('The Farewell Pilgrimage', 'Die Abschiedspilgerfahrt', 'Oprosni hadž') },
    ],
  },
  golden: {
    marks: ['7', '8', '9', '10', '11'].map((n) => ({ id: n, label: T(`${n}th c.`, `${n}. Jh.`, `${n}. st.`) })),
    events: [
      { id: 'abubakr', mark: '7', art: 'history.medallion', label: T('Abu Bakr becomes the first caliph', 'Abu Bakr wird der erste Kalif', 'Ebu Bekr postaje prvi halifa') },
      { id: 'cordoba', mark: '8', art: 'history.cordoba-mosque', label: T('The Great Mosque of Córdoba is begun', 'Die Große Moschee von Córdoba wird begonnen', 'Počinje gradnja Velike džamije u Kordobi') },
      { id: 'qarawiyyin', mark: '9', art: 'history.qarawiyyin', label: T('Al-Qarawiyyin is founded in Fez', 'Al-Qarawiyyin wird in Fès gegründet', 'U Fesu je osnovan el-Karavijjin') },
      { id: 'azhar', mark: '10', art: 'garden.masjid-small', label: T('Al-Azhar Mosque is founded in Cairo', 'Die Al-Azhar-Moschee wird in Kairo gegründet', 'U Kairu je osnovana džamija el-Ezher') },
      { id: 'canon', mark: '11', art: 'history.book-red', label: T('Ibn Sina writes the Canon of Medicine', 'Ibn Sina schreibt den Kanon der Medizin', 'Ibn Sina piše Kanon medicine') },
    ],
  },
  bosnia: {
    marks: ['1462', '1531', '1537', '1566', '1579'].map((y) => ({ id: y, label: y })),
    events: [
      { id: 'isa-beg', mark: '1462', art: 'history.chest', label: T('Isa-beg’s endowment – Sarajevo grows', 'Isa-begs Stiftung – Sarajevo wächst', 'Isa-begov vakuf – Sarajevo raste') },
      { id: 'gazi-mosque', mark: '1531', art: 'history.gazi-husrev-beg', label: T('Gazi Husrev-beg Mosque is completed', 'Die Gazi-Husrev-beg-Moschee ist fertig', 'Završena Gazi Husrev-begova džamija') },
      { id: 'gazi-library', mark: '1537', art: 'history.book-green', label: T('Gazi Husrev-beg’s madrasa and library', 'Gazi Husrev-begs Medresse und Bibliothek', 'Gazi Husrev-begova medresa i biblioteka') },
      { id: 'stari-most', mark: '1566', art: 'history.stari-most', label: T('Stari Most in Mostar is completed', 'Die Stari Most in Mostar ist fertig', 'Završen Stari most u Mostaru') },
      { id: 'ferhadija', mark: '1579', art: 'history.ferhadija', label: T('Ferhadija Mosque in Banja Luka', 'Ferhadija-Moschee in Banja Luka', 'Ferhadija džamija u Banjoj Luci') },
    ],
  },
};

export interface TimelineConfig {
  era: Era;
  hints: boolean;
}

const texts = {
  title: T('Timeline of Islamic History', 'Zeitleiste der islamischen Geschichte', 'Lenta islamske historije'),
  description: T(
    'From the first revelation to the bridges and mosques of Bosnia: place the great events of Islamic history on the timeline.',
    'Von der ersten Offenbarung bis zu den Brücken und Moscheen Bosniens: setz die großen Ereignisse der islamischen Geschichte auf die Zeitleiste.',
    'Od prve Objave do mostova i džamija Bosne: postavi velike događaje islamske historije na vremensku lentu.',
  ),
  howTo: T('Slide the marker to the right time, then tap “Place it here”.', 'Schieb die Markierung zur richtigen Zeit und tippe auf „Hier ablegen“.', 'Pomakni oznaku na pravo vrijeme, pa dodirni „Postavi ovdje“.'),
  'play.prompt': T('When did it happen? Earlier is left, later is right.', 'Wann war das? Früher ist links, später rechts.', 'Kada se to desilo? Ranije je lijevo, kasnije desno.'),
};

const factOf: Record<Era, (id: string) => string> = {
  prophet: (id) => (id === 'elephant' || id === 'revelation' ? F.revelation.id : F.hijrah.id),
  golden: (id) => (id === 'qarawiyyin' || id === 'azhar' || id === 'canon' ? F.qarawiyyin.id : F.cordoba.id),
  bosnia: (id) => (id === 'stari-most' || id === 'ferhadija' ? F.stariMost.id : F.sarajevo.id),
};

export function IslamicTimelineGame(api: GameApi<TimelineConfig>) {
  const { era, hints } = api.config;
  const { marks, events } = ERAS[era];
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <TimelineSlider marks={marks} events={events} hints={hints} prompt={api.t('play.prompt')} onDone={finishWith(api as GameApi<unknown>, events.length, factOf[era])} />
    </GameBoard>
  );
}

export const islamicTimelineGame = historyGame<TimelineConfig>({
  id: 'islamic-timeline',
  texts,
  coverArt: 'kit.timeline',
  hintArt: 'history.medallion',
  component: IslamicTimelineGame,
  levels: [
    { config: { era: 'prophet', hints: true }, facts: [F.revelation, F.hijrah] },
    { config: { era: 'golden', hints: false }, facts: [F.cordoba, F.qarawiyyin] },
    { config: { era: 'bosnia', hints: false }, facts: [F.sarajevo, F.stariMost] },
  ],
  order: 70,
});

export function registerIslamicTimelineGame(): void {
  registerGame(islamicTimelineGame);
}

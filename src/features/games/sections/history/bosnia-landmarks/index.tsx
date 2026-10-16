import { type GameApi, registerGame } from '@/core/games';
import { GameBoard, JigsawReveal } from '@/core/games/kit';

import { BOSNIA_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * Islam in Bosnia – picture puzzles of three landmarks (architecture only).
 *   L1 – Gazi Husrev-beg Mosque, Sarajevo: 6 pieces placed into the frame.
 *   L2 – Stari Most, Mostar: 9 pieces placed into the frame.
 *   L3 – Ferhadija, Banja Luka: the frame is full but mixed up – swap pieces back (9 pieces).
 */

type Landmark = 'gazi' | 'most' | 'ferhadija';
const LANDMARKS: Record<Landmark, { art: string; rows: number; cols: number; mode: 'place' | 'swap'; titleKey: string; captionKey: string }> = {
  gazi: { art: 'history.gazi-husrev-beg', rows: 2, cols: 3, mode: 'place', titleKey: 'reveal.gazi', captionKey: 'caption.gazi' },
  most: { art: 'history.stari-most', rows: 3, cols: 3, mode: 'place', titleKey: 'reveal.most', captionKey: 'caption.most' },
  ferhadija: { art: 'history.ferhadija', rows: 3, cols: 3, mode: 'swap', titleKey: 'reveal.ferhadija', captionKey: 'caption.ferhadija' },
};

export interface BosniaConfig {
  landmark: Landmark;
  hints: boolean;
}

const texts = {
  title: T('Islam in Bosnia', 'Islam in Bosnien', 'Islam u Bosni'),
  description: T(
    'Put together the pictures of three famous landmarks of Bosnia and Herzegovina and learn when they were built.',
    'Setz die Bilder von drei berühmten Bauwerken Bosniens und Herzegowinas zusammen und erfahre, wann sie gebaut wurden.',
    'Složi slike tri poznata spomenika Bosne i Hercegovine i saznaj kada su sagrađeni.',
  ),
  howTo: T('Drag each piece into the frame until the picture is whole.', 'Zieh jedes Teil in den Rahmen, bis das Bild vollständig ist.', 'Prevuci svaki dio u okvir dok slika ne bude cijela.'),
  'play.place': T('Drag the pieces into the frame.', 'Zieh die Teile in den Rahmen.', 'Prevuci dijelove u okvir.'),
  'play.swap': T('The picture is mixed up. Tap two pieces to swap them.', 'Das Bild ist durcheinander. Tippe zwei Teile an, um sie zu tauschen.', 'Slika je izmiješana. Dodirni dva dijela da ih zamijeniš.'),
  'reveal.gazi': T('Gazi Husrev-beg Mosque', 'Gazi-Husrev-beg-Moschee', 'Gazi Husrev-begova džamija'),
  'caption.gazi': T('Sarajevo, built 1530–1531', 'Sarajevo, erbaut 1530–1531', 'Sarajevo, sagrađena 1530–1531.'),
  'reveal.most': T('Stari Most', 'Stari Most (Alte Brücke)', 'Stari most'),
  'caption.most': T('Mostar, completed 1566', 'Mostar, fertiggestellt 1566', 'Mostar, završen 1566.'),
  'reveal.ferhadija': T('Ferhadija Mosque', 'Ferhadija-Moschee', 'Ferhadija džamija'),
  'caption.ferhadija': T('Banja Luka, built 1579', 'Banja Luka, erbaut 1579', 'Banja Luka, sagrađena 1579.'),
};

export function BosniaLandmarksGame(api: GameApi<BosniaConfig>) {
  const { landmark, hints } = api.config;
  const l = LANDMARKS[landmark];
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <JigsawReveal
        art={l.art}
        rows={l.rows}
        cols={l.cols}
        mode={l.mode}
        hints={hints}
        prompt={api.t(l.mode === 'swap' ? 'play.swap' : 'play.place')}
        reveal={{ title: api.t(l.titleKey), caption: api.t(l.captionKey) }}
        onDone={finishWith(api as GameApi<unknown>, l.rows * l.cols)}
      />
    </GameBoard>
  );
}

export const bosniaLandmarksGame = historyGame<BosniaConfig>({
  id: 'bosnia-landmarks',
  texts,
  coverArt: 'history.stari-most',
  hintArt: 'history.gazi-husrev-beg',
  component: BosniaLandmarksGame,
  levels: [
    { config: { landmark: 'gazi', hints: true }, facts: [F.gaziHusrevBeg, F.learning] },
    { config: { landmark: 'most', hints: false }, facts: [F.stariMost] },
    { config: { landmark: 'ferhadija', hints: false }, facts: [F.ferhadija] },
  ],
  order: 90,
});

export function registerBosniaLandmarksGame(): void {
  registerGame(bosniaLandmarksGame);
}

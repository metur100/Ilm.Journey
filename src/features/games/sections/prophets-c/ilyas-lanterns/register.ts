import { type GameDef, registerGame } from '@/core/games';
import type { BuildPart } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Ilyas – "Lanterns of the Call" (37:123–132). Light the lanterns along the hill path, one for each part of Ilyas'
 * call in the order the Quran tells it; the finished, glowing path is the payoff. A gentle BuildScene board.
 */

export const ILYAS_ID = 'ilyas-lanterns';

export interface IlyasConfig {
  parts: BuildPart[];
  ghosts: boolean;
  hints: boolean;
  visible: number;
  prompt: string;
}

export const ilyasI18n = gameTexts(ILYAS_ID, {
  title: T('Lanterns of the Call', 'Laternen des Rufes', 'Fenjeri poziva'),
  description: T(
    "Light the lanterns on the hill path – each one carries a part of Ilyas' call to Allah alone.",
    "Zünde die Laternen am Hügelweg an – jede trägt einen Teil von Ilyas' Ruf zu Allah allein.",
    'Upali fenjere na brdskoj stazi – svaki nosi dio Ilijasovog poziva jedino Allahu.',
  ),
  howTo: T(
    'Drag the right lantern onto the next glowing place on the path, in the order of the story.',
    'Zieh die richtige Laterne auf den nächsten leuchtenden Platz am Weg – in der Reihenfolge der Geschichte.',
    'Prevuci pravi fenjer na sljedeće osvijetljeno mjesto na stazi – redom kako ide kazivanje.',
  ),
  'prompt.guided': T(
    'Light the path: which words come next?',
    'Erleuchte den Weg: Welche Worte kommen als Nächstes?',
    'Osvijetli stazu: koje riječi dolaze sljedeće?',
  ),
  'prompt.memory': T(
    'No outlines now – light the whole call in the right order.',
    'Jetzt ohne Umrisse – erleuchte den ganzen Ruf in der richtigen Reihenfolge.',
    'Sada bez obrisa – osvijetli cijeli poziv pravim redom.',
  ),
  'reveal.title': T('The path is full of light', 'Der Weg ist voller Licht', 'Staza je puna svjetla'),
  'reveal.caption': T('"Peace be upon Ilyas." (37:130)', '„Friede sei auf Ilyas.“ (37:130)', '„Mir Ilijasu!“ (37:130)'),
});

const LANTERN = 'prophet.ilyas-lantern';
/** Base points of the path on the 400 × 240 scene (from the bottom left up to the hilltop). */
const BASES: [number, number][] = [
  [92, 226],
  [150, 212],
  [208, 202],
  [252, 182],
  [296, 162],
  [332, 142],
];
const slot = (i: number, scale = 1): BuildPart['slot'] => {
  const w = 0.085 * scale;
  const h = (w * 400 * (120 / 70)) / 240;
  return { x: BASES[i][0] / 400 - w * 0.35, y: BASES[i][1] / 240 - h, w, h };
};

const CALL = [
  {
    id: 'messenger',
    label: T('A messenger', 'Ein Gesandter', 'Poslanik'),
    caption: T('Ilyas was one of the messengers. (37:123)', 'Ilyas war einer der Gesandten. (37:123)', 'Ilijas je bio jedan od poslanika. (37:123)'),
  },
  {
    id: 'fear',
    label: T('Fear Allah', 'Fürchtet Allah', 'Bojte se Allaha'),
    caption: T('"Will you not fear Allah?" (37:124)', '„Wollt ihr denn nicht gottesfürchtig sein?“ (37:124)', '„Zar se nećete Allaha bojati?“ (37:124)'),
  },
  {
    id: 'baal',
    label: T('Not Baʿl', 'Nicht Baal', "Ne Ba'l"),
    caption: T('"Do you call upon Baʿl…" (37:125)', '„Ruft ihr Baal an…“ (37:125)', "„Zar se Ba'lu molite…“ (37:125)"),
  },
  {
    id: 'creator',
    label: T('Best of creators', 'Bester Schöpfer', 'Najljepši Stvoritelj'),
    caption: T('"…and leave the Best of creators?" (37:125)', '„…und lasst den besten Schöpfer?“ (37:125)', '„…a ostavljate Najljepšeg Stvoritelja?“ (37:125)'),
  },
  {
    id: 'lord',
    label: T('Your Lord', 'Euer Herr', 'Vaš Gospodar'),
    caption: T(
      '"Allah, your Lord and the Lord of your forefathers." (37:126)',
      '„Allah, euer Herr und der Herr eurer Vorväter.“ (37:126)',
      '„Allaha, Gospodara vašeg i Gospodara vaših davnih predaka.“ (37:126)',
    ),
  },
  {
    id: 'peace',
    label: T('Peace on Ilyas', 'Friede auf Ilyas', 'Mir Ilijasu'),
    caption: T('"Peace be upon Ilyas." (37:130)', '„Friede sei auf Ilyas.“ (37:130)', '„Mir Ilijasu!“ (37:130)'),
  },
] as const;

const part = (id: (typeof CALL)[number]['id'], place: number): BuildPart => {
  const c = CALL.find((x) => x.id === id)!;
  return {
    id,
    label: c.label,
    art: LANTERN,
    sceneArt: LANTERN,
    caption: c.caption,
    slot: slot(place, 1 - place * 0.05),
  };
};

const L1 = [part('messenger', 0), part('fear', 2), part('creator', 4), part('peace', 5)];
const ALL = CALL.map((c, i) => part(c.id, i));

export const ILYAS_FACTS = {
  messenger: {
    id: 'ilyas-messenger',
    text: T(
      'Ilyas was one of the messengers. He said to his people: "Will you not fear Allah?"',
      'Ilyas war einer der Gesandten. Er sagte zu seinem Volk: „Wollt ihr denn nicht gottesfürchtig sein?“',
      'Ilijas je bio jedan od poslanika. Rekao je svom narodu: „Zar se nećete Allaha bojati?“',
    ),
    sources: [quran('37:123–124')],
    art: LANTERN,
  },
  creator: {
    id: 'best-of-creators',
    text: T(
      'Ilyas asked: "Do you call upon Baʿl and leave the Best of creators – Allah, your Lord and the Lord of your forefathers?"',
      'Ilyas fragte: „Ruft ihr Baal an und lasst den besten Schöpfer – Allah, euren Herrn und den Herrn eurer Vorväter?“',
      "Ilijas je upitao: „Zar se Ba'lu molite, a ostavljate Najljepšeg Stvoritelja – Allaha, Gospodara vašeg i Gospodara vaših davnih predaka?“",
    ),
    sources: [quran('37:125–126')],
    check: {
      type: 'choice',
      prompt: T('Whom did Ilyas call the Best of creators?', 'Wen nannte Ilyas den besten Schöpfer?', 'Koga je Ilijas nazvao Najljepšim Stvoriteljem?'),
      options: [T('Allah', 'Allah', 'Allaha'), T('Baʿl', 'Baal', "Ba'la"), T('The king', 'Den König', 'Vladara')],
      correctIndex: 0,
    },
  },
  peace: {
    id: 'peace-on-ilyas',
    text: T(
      'Allah kept a good mention of Ilyas among later generations: "Peace be upon Ilyas." This is how Allah rewards those who do good.',
      'Allah bewahrte Ilyas ein gutes Andenken bei den Späteren: „Friede sei auf Ilyas.“ So belohnt Allah die Gutes Tuenden.',
      'Allah je Ilijasu ostavio lijep spomen u kasnijim pokoljenjima: „Mir Ilijasu!“ Tako Allah nagrađuje one koji dobra djela čine.',
    ),
    sources: [quran('37:129–131')],
  },
  righteous: {
    id: 'ilyas-righteous',
    text: T(
      'Zakariyya, Yahya, Isa and Ilyas – each of them was among the righteous.',
      'Zakariyya, Yahya, Isa und Ilyas – jeder von ihnen gehörte zu den Rechtschaffenen.',
      'Zekerijja, Jahja, Isa i Ilijas – svaki od njih bio je od dobrih.',
    ),
    sources: [quran('6:85')],
    check: {
      type: 'trueFalse',
      statement: T('The Quran counts Ilyas among the righteous.', 'Der Koran zählt Ilyas zu den Rechtschaffenen.', "Kur'an ubraja Ilijasa među dobre."),
      correct: true,
    },
  },
} satisfies Facts;

export const ILYAS_MISSED: Record<string, string> = {
  messenger: ILYAS_FACTS.messenger.id,
  fear: ILYAS_FACTS.messenger.id,
  baal: ILYAS_FACTS.creator.id,
  creator: ILYAS_FACTS.creator.id,
  lord: ILYAS_FACTS.creator.id,
  peace: ILYAS_FACTS.peace.id,
};

export const ilyasGame: GameDef<IlyasConfig> = {
  id: ILYAS_ID,
  topicId: 'prophets',
  i18n: ilyasI18n,
  coverArt: 'prophet.ilyas-hill-lanterns',
  hintArt: LANTERN,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IlyasGame') as typeof import('./IlyasGame')).IlyasGame),
  levels: [
    {
      level: 1,
      config: {
        parts: L1,
        ghosts: true,
        hints: true,
        visible: 2,
        prompt: 'prompt.guided',
      },
      facts: [ILYAS_FACTS.messenger],
    },
    {
      level: 2,
      config: {
        parts: ALL,
        ghosts: true,
        hints: false,
        visible: 3,
        prompt: 'prompt.guided',
      },
      facts: [ILYAS_FACTS.creator],
    },
    {
      level: 3,
      config: {
        parts: ALL,
        ghosts: false,
        hints: false,
        visible: 6,
        prompt: 'prompt.memory',
      },
      facts: [ILYAS_FACTS.peace, ILYAS_FACTS.righteous],
    },
  ],
  order: 19,
};

export const ILYAS_ART: string[] = ['prophet.ilyas-hills-map', 'prophet.ilyas-hill-lanterns', LANTERN];

export function registerIlyasGame(): void {
  registerGame(ilyasGame);
}

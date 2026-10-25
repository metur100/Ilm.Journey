import { type GameDef, type GameFact, registerGame } from '@/core/games';
import type { KitItem, SortBin, SortItem } from '@/core/games/kit';

import { nsText } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { type EtiquetteKey, quranEtiquetteI18n } from './i18n';

/*
 * Honouring the Quran. L1 (SortBins): respectful or not. L2 twist (SequenceBoard): get ready to recite – the steps
 * in order. L3 (SortBins, three baskets): other good manners – before, while or after reciting. Texts and facts follow the learn unit
 * `quran-etiquette` (16:98, 7:204, 73:4) and keep its "scholars differ" note on wudu.
 */

export interface EtiquetteConfig {
  mode: 'sort' | 'order';
  bins: SortBin[];
  items: (SortItem | KitItem)[];
  hints: boolean;
  /** Item id → fact id. */
  factOf: Record<string, string>;
}

const L = (key: EtiquetteKey) => nsText(quranEtiquetteI18n, key);

const ART: Record<string, string> = {
  wudu: 'body.water-on-hands',
  shelf: 'quran.etiquette',
  refuge: 'object.lantern',
  basmala: 'quran.one-star',
  listen: 'body.ears',
  slow: 'object.hourglass',
  back: 'object.book',
  take: 'object.quran-stand',
  floor: 'object.prayer-mat',
  talk: 'body.mouth',
  rush: 'object.clock',
  throw: 'object.book',
  quiet: 'quran.lantern-night',
  sit: 'object.prayer-mat',
  beautiful: 'object.star8',
  reflect: 'ui.sparkle',
  close: 'object.book',
};

const item = (id: string, bin?: string) => ({ id, label: L(`item.${id}` as EtiquetteKey), art: ART[id], ...(bin ? { bin } : {}) });
const bin = (id: string, art?: string): SortBin => ({ id, label: L(`bin.${id}` as EtiquetteKey), art });

// Copied from the learn unit `quran-etiquette` (lesson + sources) and its questions.
export const ETIQUETTE_FACTS = {
  manners: {
    id: 'mushaf-manners',
    text: {
      en: 'We keep the Mushaf in a clean place, begin reciting by seeking refuge in Allah from Shaytan, listen quietly when the Quran is recited and recite slowly and beautifully.',
      de: 'Wir bewahren den Mushaf an einem sauberen Ort auf, beginnen die Rezitation mit der Zufluchtnahme bei Allah vor Schaitan, hören still zu, wenn der Koran rezitiert wird, und rezitieren langsam und schön.',
      bs: "Mushaf čuvamo na čistom mjestu, učenje počinjemo traženjem utočišta kod Allaha od šejtana, šutke slušamo kada se uči Kur'an i učimo polahko i lijepo.",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '16:98; 7:204; 73:4' }],
    art: 'quran.etiquette',
    reviewKey: 'learn:quran-etiquette-1',
  },
  refuge: {
    id: 'istiadha-first',
    text: {
      en: "Quran 16:98 teaches the isti'adha before reciting.",
      de: "Koran 16:98 lehrt die Isti'adha vor der Rezitation.",
      bs: "Kur'an 16:98 uči istiazu prije učenja.",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '16:98' }],
    art: 'object.lantern',
    reviewKey: 'learn:quran-etiquette-2',
  },
  listen: {
    id: 'listen-quietly',
    text: {
      en: 'Quran 7:204 tells us to listen and pay attention.',
      de: 'Koran 7:204 fordert uns auf zuzuhören und aufmerksam zu sein.',
      bs: "Kur'an 7:204 nam naređuje da slušamo i pažljivo pratimo.",
    },
    sources: [{ sourceName: 'Quran', sourceReference: '7:204' }],
    art: 'body.ears',
    reviewKey: 'learn:quran-etiquette-p',
  },
  wudu: {
    id: 'wudu-mushaf',
    text: {
      en: 'Many scholars say wudu is required before touching the Mushaf. Scholars differ on whether wudu is required for touching the Mushaf and on reciting from memory without wudu.',
      de: 'Viele Gelehrte sagen, dass vor dem Berühren des Mushaf Wudu nötig ist. Gelehrte sind sich uneinig, ob Wudu zum Berühren des Mushaf Pflicht ist und ob man ohne Wudu auswendig rezitieren darf.',
      bs: 'Mnogi učenjaci kažu da je za dodirivanje mushafa potreban abdest. Učenjaci se razilaze je li abdest obavezan za dodirivanje mushafa i o učenju napamet bez abdesta.',
    },
    sources: [{ sourceName: 'Quran', sourceReference: '56:79' }],
    art: 'body.water-on-hands',
  },
} satisfies Record<string, GameFact>;

const F = ETIQUETTE_FACTS;

export const quranEtiquetteGame: GameDef<EtiquetteConfig> = {
  id: 'quran-etiquette',
  topicId: 'quran',
  i18n: quranEtiquetteI18n,
  coverArt: 'quran.etiquette',
  hintArt: 'kit.basket',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./EtiquetteGame') as typeof import('./EtiquetteGame')).EtiquetteGame),
  levels: [
    {
      level: 1,
      config: {
        mode: 'sort',
        hints: true,
        bins: [bin('honour', 'kit.basket'), bin('not', 'kit.crate')],
        items: [item('shelf', 'honour'), item('listen', 'honour'), item('slow', 'honour'), item('floor', 'not'), item('talk', 'not'), item('throw', 'not')],
        factOf: { listen: F.listen.id, talk: F.listen.id },
      },
      facts: [F.listen],
    },
    {
      level: 2,
      config: {
        mode: 'order',
        hints: false,
        bins: [],
        items: [item('wudu'), item('take'), item('refuge'), item('basmala'), item('slow'), item('back')],
        factOf: { refuge: F.refuge.id, wudu: F.wudu.id, take: F.wudu.id },
      },
      facts: [F.refuge, F.wudu],
    },
    {
      level: 3,
      config: {
        mode: 'sort',
        hints: false,
        bins: [bin('before', 'kit.basket'), bin('while', 'kit.jar'), bin('after', 'kit.crate')],
        items: [item('quiet', 'before'), item('sit', 'before'), item('beautiful', 'while'), item('reflect', 'while'), item('close', 'after'), item('back', 'after')],
        factOf: { quiet: F.manners.id, sit: F.manners.id, beautiful: F.manners.id, reflect: F.manners.id, close: F.manners.id, back: F.manners.id },
      },
      facts: [F.manners],
    },
  ],
  teaches: { questionKeys: ['learn:quran-etiquette-1', 'learn:quran-etiquette-2', 'learn:quran-etiquette-p'] },
  order: 90,
};

export function registerQuranEtiquetteGame(): void {
  registerGame(quranEtiquetteGame);
}

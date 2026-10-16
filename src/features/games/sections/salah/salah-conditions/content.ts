import type { GameFact } from '@/core/games';

import { BUKHARI, choice, fact, ILMIHAL, L, Q } from '../shared/content';

/*
 * The conditions of salah (šarti namaza) and the twelve farz of the prayer – Hanafi, as in the Bosnian ilmihal:
 * six conditions before the prayer (hadesten taharet, nedžasetten taharet, setri avret, istikbali kible, vakat,
 * nijjet) and six pillars inside it (iftitahi tekbir, kijam, kiraet, ruku', sedžda, ka'de-i ahire).
 */

export type Box = { x: number; y: number; w: number; h: number };

/** Spots in `salah.basics-prayer-room` (400 × 300). */
export const ROOM_SPOTS: { id: string; target: boolean; at: Box; spotArt?: string }[] = [
  { id: 'purity', target: true, at: { x: 0.05, y: 0.49, w: 0.17, h: 0.27 } },
  { id: 'clean', target: true, at: { x: 0.27, y: 0.69, w: 0.38, h: 0.24 } },
  { id: 'awrah', target: true, at: { x: 0.78, y: 0.29, w: 0.16, h: 0.32 } },
  { id: 'qibla', target: true, at: { x: 0.09, y: 0.14, w: 0.13, h: 0.14 } },
  { id: 'time', target: true, at: { x: 0.68, y: 0.1, w: 0.14, h: 0.18 } },
  { id: 'niyyah', target: true, at: { x: 0.42, y: 0.5, w: 0.12, h: 0.15 }, spotArt: 'salah.basics-niyyah' },
  { id: 'ball', target: false, at: { x: 0.7, y: 0.83, w: 0.09, h: 0.13 } },
  { id: 'plant', target: false, at: { x: 0.57, y: 0.31, w: 0.11, h: 0.22 } },
  { id: 'window', target: false, at: { x: 0.37, y: 0.11, w: 0.18, h: 0.32 } },
];

/** L2: before the prayer (šarti) or inside it (erkan). */
export const FARZ_ITEMS: { id: string; bin: 'sart' | 'rukn'; art: string }[] = [
  { id: 'purity', bin: 'sart', art: 'salah.basics-ibrik' },
  { id: 'clean', bin: 'sart', art: 'salah.basics-mat' },
  { id: 'awrah', bin: 'sart', art: 'salah.basics-garment' },
  { id: 'qibla', bin: 'sart', art: 'salah.basics-qibla-sign' },
  { id: 'time', bin: 'sart', art: 'salah.basics-clock' },
  { id: 'niyyah', bin: 'sart', art: 'salah.basics-niyyah' },
  { id: 'takbir', bin: 'rukn', art: 'salah.prayer-takbir' },
  { id: 'qiyam', bin: 'rukn', art: 'salah.prayer-qiyam' },
  { id: 'qiraat', bin: 'rukn', art: 'object.quran-stand' },
  { id: 'ruku', bin: 'rukn', art: 'salah.prayer-ruku' },
  { id: 'sajda', bin: 'rukn', art: 'salah.prayer-sajda' },
  { id: 'sitting', bin: 'rukn', art: 'salah.prayer-tashahhud' },
];

export const CONDITION_FACTS = {
  six: fact(
    'salah-six-conditions',
    L(
      'Before the prayer six conditions must be fulfilled: purity from hadath (wudu, or gusul when needed), cleanliness of body, clothes and place, covering the ʿawrah, facing the qibla, the time of the prayer and the intention.',
      'Vor dem Gebet müssen sechs Bedingungen erfüllt sein: Reinheit von Hadath (Wudu, wenn nötig Ghusl), Sauberkeit von Körper, Kleidung und Gebetsplatz, Bedecken der ʿAura, Ausrichtung zur Qibla, die Gebetszeit und die Absicht.',
      'Prije namaza mora se ispuniti šest šarta: čistoća od hadesa (abdest, a kad treba i gusul), čistoća tijela, odjeće i mjesta, pokrivanje avreta, okretanje prema kibli, nastupanje vremena i nijjet.',
    ),
    [Q('5:6'), Q('74:4'), Q('7:31'), Q('2:144'), Q('4:103'), ILMIHAL('Namaski šarti')],
    'salah.basics-prayer-room',
    choice(L('How many conditions (šarti) come before the prayer?', 'Wie viele Bedingungen gehen dem Gebet voraus?', 'Koliko je namaskih šarta?'), [L('4', '4', '4'), L('6', '6', '6'), L('12', '12', '12')], 1),
  ),
  intention: fact(
    'salah-intention',
    L(
      'The Prophet ﷺ said: actions are only by intentions. The niyyah is the decision in the heart which prayer you are about to pray.',
      'Der Prophet ﷺ sagte: Die Taten werden nur nach den Absichten bewertet. Die Niyya ist der Entschluss im Herzen, welches Gebet man jetzt betet.',
      'Poslanik ﷺ je rekao: djela se vrednuju samo prema nijjetima. Nijjet je odluka u srcu koji namaz upravo klanjaš.',
    ),
    [BUKHARI('1')],
    'salah.basics-niyyah',
  ),
  twelve: fact(
    'salah-twelve-farz',
    L(
      'The prayer has 12 farz: the six conditions before it and six pillars inside it – the opening takbir, standing (qiyam), recitation, ruku‘, sajda and the last sitting.',
      'Das Gebet hat 12 Pflichtteile: die sechs Bedingungen davor und sechs Säulen darin – der Eröffnungs-Takbir, das Stehen (Qiyam), die Rezitation, Ruku‘, Sadschda und das letzte Sitzen.',
      'Namaz ima 12 farzova: šest šarta prije njega i šest rukna u njemu – početni tekbir, kijam, kiraet, ruku‘, sedžda i posljednje sjedenje.',
    ),
    [ILMIHAL('Namaski farzovi'), Q('2:238'), Q('22:77')],
    'salah.prayer-ruku',
    choice(L('How many farz does the prayer have in all?', 'Wie viele Pflichtteile hat das Gebet insgesamt?', 'Koliko ukupno farzova ima namaz?'), [L('6', '6', '6'), L('12', '12', '12'), L('17', '17', '17')], 1),
  ),
  awrah: fact(
    'salah-awrah',
    L(
      'For the prayer a man covers at least from the navel to below the knees; a woman covers her whole body except the face, the hands and the feet.',
      'Für das Gebet bedeckt ein Mann mindestens den Bereich vom Nabel bis unter die Knie; eine Frau bedeckt ihren ganzen Körper außer Gesicht, Händen und Füßen.',
      'Za namaz muškarac pokriva barem od pupka do ispod koljena; žena pokriva cijelo tijelo osim lica, šaka i stopala.',
    ),
    [Q('7:31'), ILMIHAL('Setri avret')],
    'salah.basics-garment',
  ),
  clean: fact(
    'salah-clean-clothes',
    L('The Quran says: “And your clothing purify.” Body, clothes and the place of prayer are kept clean.', 'Der Koran sagt: „Und deine Kleidung reinige.“ Körper, Kleidung und Gebetsplatz werden sauber gehalten.', 'Kur‘an kaže: „I odjeću svoju očisti.“ Tijelo, odjeća i mjesto namaza drže se čistim.'),
    [Q('74:4'), ILMIHAL('Namaski šarti')],
    'salah.basics-mat',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  purity: CONDITION_FACTS.six.id,
  clean: CONDITION_FACTS.clean.id,
  awrah: CONDITION_FACTS.awrah.id,
  qibla: CONDITION_FACTS.six.id,
  time: CONDITION_FACTS.six.id,
  niyyah: CONDITION_FACTS.intention.id,
  ball: CONDITION_FACTS.six.id,
  plant: CONDITION_FACTS.six.id,
  window: CONDITION_FACTS.six.id,
  takbir: CONDITION_FACTS.twelve.id,
  qiyam: CONDITION_FACTS.twelve.id,
  qiraat: CONDITION_FACTS.twelve.id,
  ruku: CONDITION_FACTS.twelve.id,
  sajda: CONDITION_FACTS.twelve.id,
  sitting: CONDITION_FACTS.twelve.id,
};

export const CONDITIONS_ART = ['salah.basics-prayer-room', ...FARZ_ITEMS.map((i) => i.art), 'kit.basket', 'kit.crate'];

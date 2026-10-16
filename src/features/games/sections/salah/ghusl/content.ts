import type { GameFact } from '@/core/games';

import { BUKHARI, choice, fact, ILMIHAL, L, Q } from '../shared/content';

/*
 * Gusul (ghusl, the full ritual bath) – Hanafi practice as taught in the Bosnian ilmihal (chapter "Gusul").
 * L1 rub water over every part (the three farz), L2 the way the Prophet ﷺ made gusul (Bukhari 248), L3 when gusul
 * is needed, when wudu is enough and when it is sunnah.
 */

/** L1: the parts to cover with water (mouth and nose are farz in the Hanafi school, then the whole body). */
export const BODY_PARTS: { id: string; art: string; caption?: boolean }[] = [
  { id: 'mouth', art: 'body.mouth', caption: true },
  { id: 'nose', art: 'body.nose', caption: true },
  { id: 'head', art: 'body.head' },
  { id: 'ears', art: 'body.ears' },
  { id: 'arms', art: 'body.arms' },
  { id: 'hands', art: 'body.hands' },
  { id: 'torso', art: 'salah.basics-torso', caption: true },
  { id: 'legs', art: 'salah.basics-legs' },
  { id: 'feet', art: 'body.feet' },
];

/** L2: the steps of the Prophet's gusul (Bukhari 248; right before left: Bukhari 168). */
export const STEPS: { id: string; art: string }[] = [
  { id: 'step-hands', art: 'body.hands' },
  { id: 'step-wudu', art: 'body.water-on-hands' },
  { id: 'step-head', art: 'body.head' },
  { id: 'step-right', art: 'salah.basics-shower' },
  { id: 'step-left', art: 'salah.basics-torso' },
];

/** L3: wudu is enough / gusul is farz / gusul is sunnah. */
export const WHEN_ITEMS: { id: string; bin: 'wudu' | 'gusul' | 'sunnah'; art?: string }[] = [
  { id: 'sleep', bin: 'wudu', art: 'salah.basics-sleep' },
  { id: 'toilet', bin: 'wudu', art: 'salah.basics-wc' },
  { id: 'blood', bin: 'wudu', art: 'salah.basics-plaster' },
  { id: 'janabah', bin: 'gusul', art: 'salah.basics-shower' },
  { id: 'hayd', bin: 'gusul', art: 'salah.basics-shower' },
  { id: 'nifas', bin: 'gusul', art: 'salah.basics-shower' },
  { id: 'friday', bin: 'sunnah', art: 'salah.basics-masjid-door' },
];

export const GHUSL_FACTS = {
  farz: fact(
    'ghusl-three-farz',
    L(
      'Gusul has three farz: rinsing the mouth, rinsing the nose and washing the whole body so that no dry spot remains – not even under a ring, behind the ears or at the roots of the hair.',
      'Der Ghusl hat drei Pflichtteile (Fard): den Mund spülen, die Nase spülen und den ganzen Körper waschen, sodass keine trockene Stelle bleibt – auch nicht unter einem Ring, hinter den Ohren oder an den Haarwurzeln.',
      'Gusul ima tri farza: isprati usta, isprati nos i oprati cijelo tijelo tako da ne ostane nijedno suho mjesto – ni ispod prstena, ni iza ušiju, ni u korijenu kose.',
    ),
    [Q('5:6'), ILMIHAL('Gusul')],
    'salah.basics-shower',
    choice(L('How many farz does gusul have?', 'Wie viele Pflichtteile hat der Ghusl?', 'Koliko farzova ima gusul?'), [L('3', '3', '3'), L('4', '4', '4'), L('7', '7', '7')], 0),
  ),
  schools: fact(
    'ghusl-schools-differ',
    L(
      'Scholars of other schools differ: in the Shafi‘i and Maliki schools rinsing the mouth and the nose in gusul is sunnah; washing the whole body is farz for all.',
      'Gelehrte anderer Rechtsschulen sind sich uneinig: In der schafiitischen und malikitischen Schule ist das Spülen von Mund und Nase beim Ghusl Sunna; das Waschen des ganzen Körpers ist für alle Pflicht.',
      'Učenjaci drugih mezheba se razilaze: u šafijskom i malikijskom mezhebu ispiranje usta i nosa pod gusulom je sunnet; pranje cijelog tijela je farz za sve.',
    ),
    [ILMIHAL('Gusul')],
    'body.mouth',
  ),
  prophet: fact(
    'ghusl-prophet-way',
    L(
      'When the Prophet ﷺ made gusul, he first washed his hands, then made wudu as for the prayer, then ran his wet fingers through the roots of his hair, poured water over his head three times and then over his whole body.',
      'Wenn der Prophet ﷺ den Ghusl machte, wusch er zuerst seine Hände, machte dann die Gebetswaschung wie für das Gebet, fuhr mit nassen Fingern durch die Haarwurzeln, goss dreimal Wasser über den Kopf und dann über den ganzen Körper.',
      'Kada je Poslanik ﷺ uzimao gusul, prvo je oprao ruke, zatim uzeo abdest kao za namaz, prošao mokrim prstima kroz korijen kose, tri puta polio glavu vodom, a zatim cijelo tijelo.',
    ),
    [BUKHARI('248')],
    'body.head',
  ),
  right: fact(
    'ghusl-right-first',
    L(
      'The Prophet ﷺ liked to begin with the right side – also when purifying himself. So in gusul the right side is washed before the left.',
      'Der Prophet ﷺ begann gern mit der rechten Seite – auch bei der Reinigung. Darum wird beim Ghusl die rechte Seite vor der linken gewaschen.',
      'Poslanik ﷺ je volio počinjati desnom stranom – i pri čišćenju. Zato se pod gusulom desna strana pere prije lijeve.',
    ),
    [BUKHARI('168')],
    'salah.basics-shower',
  ),
  when: fact(
    'ghusl-when-farz',
    L(
      'Gusul is farz after major impurity (janabah) and, for women, at the end of the monthly period (hayd) and of the bleeding after childbirth (nifas). After sleep, the toilet or bleeding, wudu is enough.',
      'Der Ghusl ist Pflicht nach großer Unreinheit (Dschanaba) und für Frauen am Ende der Monatsblutung (Haid) und der Blutung nach einer Geburt (Nifas). Nach dem Schlaf, der Toilette oder einer Blutung genügt die Gebetswaschung.',
      'Gusul je farz nakon džunupluka, a ženama i po završetku hajza (mjesečnog pranja) i nifasa (krvarenja nakon poroda). Nakon spavanja, nužde ili krvarenja dovoljan je abdest.',
    ),
    [Q('5:6'), Q('2:222'), ILMIHAL('Gusul')],
    'salah.basics-shower',
  ),
  friday: fact(
    'ghusl-friday-sunnah',
    L(
      'The Prophet ﷺ said: when one of you comes to the Friday prayer, let him take a bath. Gusul for džuma is sunnah.',
      'Der Prophet ﷺ sagte: Wenn einer von euch zum Freitagsgebet kommt, soll er ein Bad nehmen. Der Ghusl für das Freitagsgebet ist Sunna.',
      'Poslanik ﷺ je rekao: kada neko od vas dolazi na džumu, neka se okupa. Gusul za džumu je sunnet.',
    ),
    [BUKHARI('877')],
    'salah.basics-masjid-door',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  mouth: GHUSL_FACTS.farz.id,
  nose: GHUSL_FACTS.farz.id,
  'step-hands': GHUSL_FACTS.prophet.id,
  'step-wudu': GHUSL_FACTS.prophet.id,
  'step-head': GHUSL_FACTS.prophet.id,
  'step-right': GHUSL_FACTS.right.id,
  'step-left': GHUSL_FACTS.right.id,
  sleep: GHUSL_FACTS.when.id,
  toilet: GHUSL_FACTS.when.id,
  blood: GHUSL_FACTS.when.id,
  janabah: GHUSL_FACTS.when.id,
  hayd: GHUSL_FACTS.when.id,
  nifas: GHUSL_FACTS.when.id,
  friday: GHUSL_FACTS.friday.id,
};

export const GHUSL_ART = [...BODY_PARTS.map((p) => p.art), ...STEPS.map((s) => s.art), 'salah.basics-sleep', 'salah.basics-wc', 'salah.basics-plaster', 'salah.basics-masjid-door', 'salah.basics-ibrik', 'kit.basket'];

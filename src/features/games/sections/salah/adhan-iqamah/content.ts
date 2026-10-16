import type { GameFact } from '@/core/games';

import { ABU_DAWUD, BUKHARI, choice, fact, ILMIHAL, L } from '../shared/content';

/*
 * Ezan & ikamet – the phrases in transliteration with their meaning (no Arabic script is typed by hand). Hanafi
 * practice as in the Bosnian ilmihal (chapter "Ezan i ikamet"): the ezan has 15 phrases, Sabah adds "as-salatu
 * khayrun mina-n-nawm" twice, and the ikamet repeats the phrases like the ezan with "qad qamati-s-salah" twice.
 */

export interface Phrase {
  id: string;
  /** How many times it is said. */
  times: number;
}

export const EZAN: Phrase[] = [
  { id: 'takbir', times: 4 },
  { id: 'shahada', times: 2 },
  { id: 'risalah', times: 2 },
  { id: 'salah', times: 2 },
  { id: 'falah', times: 2 },
  { id: 'takbir-end', times: 2 },
  { id: 'tawhid', times: 1 },
];

/** The ezan of Sabah: "as-salatu khayrun mina-n-nawm" after hayya ʿala-l-falah. */
export const EZAN_SABAH: Phrase[] = [...EZAN.slice(0, 5), { id: 'khayr', times: 2 }, ...EZAN.slice(5)];

/** L3: only in the ezan / only in the ikamet / in both. */
export const WHICH_ITEMS: { id: string; bin: 'ezan' | 'ikamet' | 'both'; art?: string }[] = [
  { id: 'khayr', bin: 'ezan' },
  { id: 'minaret', bin: 'ezan', art: 'salah.basics-minaret' },
  { id: 'qad', bin: 'ikamet' },
  { id: 'rows', bin: 'ikamet', art: 'salah.prayer-qiyam' },
  { id: 'takbir', bin: 'both' },
  { id: 'falah', bin: 'both' },
  { id: 'tawhid', bin: 'both' },
];

export const ADHAN_FACTS = {
  call: fact(
    'adhan-call',
    // content: quests/arabic.json › questions › arabic-adhan › explanation
    L(
      'The adhan is the call to prayer, announcing that the time of prayer has come.',
      'Der Adhan ist der Gebetsruf, der ankündigt, dass die Gebetszeit gekommen ist.',
      'Ezan je poziv na namaz koji objavljuje da je nastupilo vrijeme namaza.',
    ),
    [BUKHARI('604'), ILMIHAL('Ezan i ikamet')],
    'salah.basics-minaret',
  ),
  words: fact(
    'adhan-fifteen',
    L(
      'The ezan has 15 phrases: Allahu akbar four times, each shahada twice, hayya ʿala-s-salah and hayya ʿala-l-falah twice each, Allahu akbar twice and la ilaha illallah once.',
      'Der Adhan hat 15 Sätze: viermal Allahu akbar, jedes Glaubensbekenntnis zweimal, Hayya ʿala-s-salah und Hayya ʿala-l-falah je zweimal, zweimal Allahu akbar und einmal La ilaha illallah.',
      'Ezan ima 15 rečenica: četiri puta Allahu ekber, svaki šehadet po dva puta, hajje ale-s-salah i hajje ale-l-felah po dva puta, dva puta Allahu ekber i jednom la ilahe illallah.',
    ),
    [ABU_DAWUD('499'), ILMIHAL('Ezan i ikamet')],
    'salah.basics-ezan-scene',
    choice(L('How many times is “Allahu akbar” said at the start of the ezan?', 'Wie oft wird „Allahu akbar“ am Anfang des Adhan gesagt?', 'Koliko puta se na početku ezana kaže „Allahu ekber“?'), [L('2', '2', '2'), L('4', '4', '4'), L('7', '7', '7')], 1),
  ),
  sabah: fact(
    'adhan-sabah',
    L(
      'In the ezan of Sabah “as-salatu khayrun mina-n-nawm” – prayer is better than sleep – is said twice after hayya ʿala-l-falah.',
      'Im Adhan zum Fadschr wird nach Hayya ʿala-l-falah zweimal „as-salatu khairun mina-n-naum“ gesagt – das Gebet ist besser als der Schlaf.',
      'U sabahskom ezanu se nakon hajje ale-l-felah dva puta kaže „es-salatu hajrun mine-n-nevm“ – namaz je bolji od sna.',
    ),
    [ABU_DAWUD('500'), ILMIHAL('Ezan i ikamet')],
    'sky.dawn',
  ),
  answer: fact(
    'adhan-answer',
    L(
      'The Prophet ﷺ said: when you hear the call, say what the caller (muezzin) says.',
      'Der Prophet ﷺ sagte: Wenn ihr den Ruf hört, sagt, was der Rufer (Muezzin) sagt.',
      'Poslanik ﷺ je rekao: kada čujete ezan, govorite ono što govori mujezin.',
    ),
    [BUKHARI('611'), { sourceName: 'Sahih Muslim', sourceReference: '383' }],
    'salah.basics-minaret',
  ),
  iqamah: fact(
    'iqamah-hanafi',
    L(
      'The ikamet is said just before the fard begins. In the Hanafi school its phrases are said like those of the ezan, with “qad qamati-s-salah” – the prayer has begun – twice after hayya ʿala-l-falah. Scholars of other schools differ: they say most phrases of the ikamet once.',
      'Die Iqama wird direkt vor dem Fard-Gebet gesagt. In der hanafitischen Schule werden ihre Sätze wie im Adhan gesagt, mit zweimal „qad qamati-s-salah“ – das Gebet hat begonnen – nach Hayya ʿala-l-falah. Gelehrte anderer Rechtsschulen sind sich uneinig: Sie sagen die meisten Sätze der Iqama nur einmal.',
      'Ikamet se uči neposredno prije farza. U hanefijskom mezhebu njegove rečenice se uče kao u ezanu, uz „kad kameti-s-salah“ – namaz je počeo – dva puta nakon hajje ale-l-felah. Učenjaci drugih mezheba se razilaze: većinu rečenica ikameta uče jednom.',
    ),
    [ILMIHAL('Ezan i ikamet'), BUKHARI('605')],
    'salah.prayer-qiyam',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  takbir: ADHAN_FACTS.words.id,
  shahada: ADHAN_FACTS.words.id,
  risalah: ADHAN_FACTS.words.id,
  salah: ADHAN_FACTS.words.id,
  falah: ADHAN_FACTS.words.id,
  'takbir-end': ADHAN_FACTS.words.id,
  tawhid: ADHAN_FACTS.words.id,
  khayr: ADHAN_FACTS.sabah.id,
  minaret: ADHAN_FACTS.iqamah.id,
  qad: ADHAN_FACTS.iqamah.id,
  rows: ADHAN_FACTS.iqamah.id,
};

export const ADHAN_ART = ['salah.basics-minaret', 'salah.basics-ezan-scene', 'salah.prayer-qiyam', 'sky.dawn', 'kit.basket'];

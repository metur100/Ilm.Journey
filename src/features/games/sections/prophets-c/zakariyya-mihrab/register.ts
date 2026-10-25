import { type GameDef, registerGame } from '@/core/games';
import type { SceneSpot } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Zakariyya – three events of his life (3:37–41, 19:2–11), each with its lesson:
 * L1 caring for Maryam: the provision Allah gave her in the mihrab (3:37) – find it in the room (TapScene);
 * L2 his quiet dua for a child (19:2–6) – put the words of the dua in order (episode: sequence);
 * L3 the glad tidings of Yahya and the sign of three days (3:39–41, 19:7–11) – sort them (episode: sort).
 */

export const ZAKARIYYA_ID = 'zakariyya-mihrab';

export interface MihrabConfig {
  spots: SceneSpot[];
  ordered: boolean;
  hints: boolean;
  prompt: string;
}

export type ZakariyyaConfig = MihrabConfig | EpisodeConfig;

export const zakariyyaI18n = gameTexts(ZAKARIYYA_ID, {
  title: T('The Mihrab', 'Der Mihrab', 'Mihrab'),
  description: T(
    'Three events of Zakariyya’s life: the provision in Maryam’s mihrab, his quiet dua and the glad tidings of Yahya – each with its lesson.',
    'Drei Ereignisse aus Zakariyyas Leben: die Versorgung in Maryams Mihrab, sein leises Du’a und die frohe Botschaft von Yahya – jedes mit seiner Lehre.',
    'Tri događaja iz Zekerijjina života: opskrba u Merjeminom mihrabu, njegova tiha dova i radosna vijest o Jahji – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: find the provision in the mihrab. Level 2: put the words of the dua in order. Level 3: sort the glad tidings and the sign.',
    'Stufe 1: Finde die Versorgung im Mihrab. Stufe 2: Bring die Worte des Du’a in die richtige Reihenfolge. Stufe 3: Sortiere die frohe Botschaft und das Zeichen.',
    'Nivo 1: pronađi opskrbu u mihrabu. Nivo 2: poredaj riječi dove. Nivo 3: razvrstaj radosnu vijest i znak.',
  ),
  'prompt.provision': T(
    'Every time Zakariyya came in, he found provision. Find all of it!',
    'Jedes Mal, wenn Zakariyya hereinkam, fand er Versorgung. Finde sie alle!',
    'Kad god bi Zekerijja ušao, nalazio je opskrbu. Pronađi je svu!',
  ),
});

const BOX = {
  ledge: { x: 0.41, y: 0.5, w: 0.18, h: 0.18 },
  shelfL: { x: 0.07, y: 0.56, w: 0.2, h: 0.17 },
  shelfR: { x: 0.73, y: 0.56, w: 0.2, h: 0.17 },
};

const SPOT: Record<string, SceneSpot> = {
  provision: {
    id: 'provision',
    at: BOX.ledge,
    spotArt: 'prophet.zakariyya-provision',
    label: T('Provision', 'Versorgung', 'Opskrba'),
    caption: T('"It is from Allah," said Maryam. (3:37)', '„Es ist von Allah“, sagte Maryam. (3:37)', '„Od Allaha je“, rekla je Merjema. (3:37)'),
  },
  fruit: {
    id: 'fruit',
    at: BOX.shelfL,
    spotArt: 'food.fruit-bowl',
    label: T('Fruit', 'Obst', 'Voće'),
    caption: T(
      'Allah provides for whom He wills without measure. (3:37)',
      'Allah versorgt, wen Er will, ohne zu rechnen. (3:37)',
      'Allah daje onome kome hoće bez računa. (3:37)',
    ),
  },
  dates: {
    id: 'dates',
    at: BOX.shelfR,
    spotArt: 'object.dates',
    label: T('Dates', 'Datteln', 'Hurme'),
    caption: T('Provision from Allah.', 'Versorgung von Allah.', 'Opskrba od Allaha.'),
  },
};

export const ZAKARIYYA_FACTS = {
  provision: {
    id: 'mihrab-provision',
    text: T(
      'Every time Zakariyya came to Maryam in the mihrab, he found provision with her. She said: "It is from Allah. Allah provides for whom He wills without measure."',
      'Jedes Mal, wenn Zakariyya zu Maryam in den Mihrab kam, fand er Versorgung bei ihr. Sie sagte: „Es ist von Allah. Allah versorgt, wen Er will, ohne zu rechnen.“',
      'Kad god bi Zekerijja ušao Merjemi u mihrab, kod nje bi našao hrane. Ona bi rekla: „Od Allaha je. Allah daje u izobilju onome kome hoće, bez računa.“',
    ),
    sources: [quran('3:37')],
    art: 'prophet.zakariyya-provision',
    check: {
      type: 'choice',
      prompt: T(
        'Where did Maryam say her provision came from?',
        'Woher kam Maryams Versorgung nach ihren Worten?',
        'Odakle je, po Merjeminim riječima, njena opskrba?',
      ),
      options: [T('From Allah', 'Von Allah', 'Od Allaha'), T('From the market', 'Vom Markt', 'S pijace'), T('From Zakariyya', 'Von Zakariyya', 'Od Zekerijje')],
      correctIndex: 0,
    },
  },
  provisionLesson: lessonFact(
    'provision-from-allah',
    T(
      'Every provision is from Allah. Like Maryam, say about your food, home and family: "It is from Allah" – and thank Him.',
      'Alle Versorgung ist von Allah. Sag wie Maryam über dein Essen, dein Zuhause und deine Familie: „Es ist von Allah“ – und danke Ihm.',
      'Svaka opskrba je od Allaha. Kao Merjema, reci za svoju hranu, dom i porodicu: „Od Allaha je“ – i zahvali Mu.',
    ),
    [quran('3:37')],
    { art: 'prophet.zakariyya-provision' },
  ),
  dua: {
    id: 'quiet-dua',
    text: T(
      'Zakariyya called upon his Lord in a quiet voice: "My Lord, my bones have grown weak and my hair is white, and I have never been disappointed in calling upon You. Grant me from Yourself an heir."',
      'Zakariyya rief seinen Herrn mit leiser Stimme an: „Mein Herr, meine Knochen sind schwach geworden und mein Haar ist weiß, und nie war ich enttäuscht, wenn ich Dich anrief. Schenke mir von Dir einen Nachfolger.“',
      'Zekerijja je tihim glasom zamolio svoga Gospodara: „Gospodaru moj, kosti su mi oslabile i kosa mi je sijeda, a nikad nisam bio razočaran kada sam Te molio. Podari mi od Sebe nasljednika.“',
    ),
    sources: [quran('19:2–6'), quran('3:38')],
    art: 'prophet.zakariyya-mihrab',
  },
  neverStop: lessonFact(
    'never-stop-asking',
    T(
      'Never stop asking Allah. Zakariyya was old, yet he made dua full of hope – nothing is too hard for Allah.',
      'Hör nie auf, Allah zu bitten. Zakariyya war alt und bat doch voller Hoffnung – für Allah ist nichts zu schwer.',
      'Nikad ne prestaj moliti Allaha. Zekerijja je bio star, a ipak je dovu upućivao pun nade – Allahu ništa nije teško.',
    ),
    [quran('19:4'), quran('19:9')],
  ),
  tidings: {
    id: 'glad-tidings-yahya',
    text: T(
      'While Zakariyya stood praying in the mihrab, the angels called to him: Allah gives you the glad tidings of a son named Yahya – a name Allah had given to no one before him.',
      'Während Zakariyya im Mihrab stand und betete, riefen ihm die Engel zu: Allah verkündet dir einen Sohn namens Yahya – einen Namen, den Allah vor ihm niemandem gegeben hatte.',
      'Dok je Zekerijja stajao u mihrabu i klanjao, meleki su ga zovnuli: Allah ti javlja radosnu vijest o sinu po imenu Jahja – imenu koje Allah prije nikome nije dao.',
    ),
    sources: [quran('3:39'), quran('19:7')],
  },
  sign: {
    id: 'three-days',
    text: T(
      'His sign was that he would not speak to people for three days except by signs. "Remember your Lord much and glorify Him in the evening and the morning."',
      'Sein Zeichen war, dass er drei Tage lang nicht zu den Menschen sprechen würde, außer durch Zeichen. „Gedenke deines Herrn viel und preise Ihn am Abend und am Morgen.“',
      'Njegov znak je bio da tri dana neće govoriti s ljudima osim znakovima. „Spominji mnogo svoga Gospodara i hvali Ga navečer i ujutro.“',
    ),
    sources: [quran('3:41; 19:10–11')],
    check: {
      type: 'trueFalse',
      statement: T(
        'For three days Zakariyya spoke to people only by signs.',
        'Drei Tage lang sprach Zakariyya nur durch Zeichen zu den Menschen.',
        'Tri dana je Zekerijja s ljudima govorio samo znakovima.',
      ),
      correct: true,
    },
  },
  remember: lessonFact(
    'remember-allah',
    T(
      'Remember Allah much, in the morning and the evening. Even when Zakariyya could not speak to people, he glorified Allah.',
      'Gedenke Allahs viel, morgens und abends. Selbst als Zakariyya nicht zu den Menschen sprechen konnte, pries er Allah.',
      'Spominji Allaha mnogo, ujutro i navečer. Čak i kada Zekerijja nije mogao govoriti s ljudima, slavio je Allaha.',
    ),
    [quran('3:41'), quran('19:11')],
    { art: 'prophet.zakariyya-morning' },
  ),
} satisfies Facts;

/** L2 – the quiet dua of Zakariyya, in the order of the ayahs (19:3–6). */
const DUA: Episode = {
  kind: 'sequence',
  prompt: T('Put the dua of Zakariyya in order, as the Quran tells it – then check.', 'Bring das Du’a von Zakariyya in die Reihenfolge, wie der Koran es erzählt – und prüfe.', 'Poredaj Zekerijjinu dovu kako je Kur’an kazuje – pa provjeri.'),
  hints: false,
  items: [
    { id: 'quiet-call', art: 'prophet.zakariyya-mihrab', label: T('He called his Lord in a quiet voice', 'Er rief seinen Herrn mit leiser Stimme', 'Tihim glasom je zovnuo svog Gospodara'), sub: '19:3' },
    { id: 'weak-bones', art: 'object.staff', label: T('"My bones have grown weak, my hair is white"', '„Meine Knochen sind schwach, mein Haar ist weiß“', '„Kosti su mi oslabile, kosa mi je sijeda“'), sub: '19:4' },
    { id: 'never-disappointed', art: 'object.prayer-mat', label: T('"I have never been disappointed in calling upon You"', '„Nie war ich enttäuscht, wenn ich Dich anrief“', '„Nikad nisam bio razočaran kada sam Te molio“'), sub: '19:4' },
    { id: 'grant-heir', art: 'garden.sapling', label: T('"Grant me from Yourself an heir"', '„Schenke mir von Dir einen Nachfolger“', '„Podari mi od Sebe nasljednika“'), sub: '19:5' },
    { id: 'make-pleasing', art: 'ui.heart', label: T('"And make him, my Lord, pleasing to You"', '„Und mach ihn, mein Herr, Dir wohlgefällig“', '„I učini ga, Gospodaru moj, Tebi dragim“'), sub: '19:6' },
  ],
  factMap: { 'quiet-call': 'quiet-dua', 'weak-bones': 'quiet-dua', 'never-disappointed': 'lesson-never-stop-asking', 'grant-heir': 'quiet-dua', 'make-pleasing': 'quiet-dua' },
};

/** L3 – the glad tidings and the sign (3:39–41, 19:7–11). */
const TIDINGS: Episode = {
  kind: 'sort',
  prompt: T('Allah answered the dua. Sort: what was the glad tidings – and what was the sign?', 'Allah erhörte das Du’a. Sortiere: Was war die frohe Botschaft – und was war das Zeichen?', 'Allah je uslišao dovu. Razvrstaj: šta je bila radosna vijest – a šta znak?'),
  hints: false,
  bins: [
    { id: 'bin-tidings', art: 'prophet.zakariyya-mihrab', label: T('The glad tidings', 'Die frohe Botschaft', 'Radosna vijest') },
    { id: 'bin-sign', art: 'prophet.zakariyya-evening', label: T('The sign', 'Das Zeichen', 'Znak') },
  ],
  items: [
    { id: 'son-yahya', bin: 'bin-tidings', label: T('A son named Yahya', 'Ein Sohn namens Yahya', 'Sin po imenu Jahja'), sub: '19:7' },
    { id: 'new-name', bin: 'bin-tidings', label: T('A name given to no one before', 'Ein Name, den vorher niemand trug', 'Ime koje prije niko nije nosio'), sub: '19:7' },
    { id: 'while-praying', bin: 'bin-tidings', label: T('Called while he prayed in the mihrab', 'Gerufen, als er im Mihrab betete', 'Zovnut dok je klanjao u mihrabu'), sub: '3:39' },
    { id: 'no-speech', bin: 'bin-sign', label: T('Not speaking to people for three days', 'Drei Tage nicht zu den Menschen sprechen', 'Tri dana ne govoriti s ljudima'), sub: '19:10' },
    { id: 'by-gestures', bin: 'bin-sign', label: T('Speaking only by signs', 'Nur durch Zeichen sprechen', 'Govoriti samo znakovima'), sub: '3:41' },
    { id: 'glorify', bin: 'bin-sign', label: T('Glorify Allah morning and evening', 'Allah morgens und abends preisen', 'Slaviti Allaha ujutro i navečer'), sub: '19:11' },
  ],
  factMap: { 'son-yahya': 'glad-tidings-yahya', 'new-name': 'glad-tidings-yahya', 'while-praying': 'glad-tidings-yahya', 'no-speech': 'three-days', 'by-gestures': 'three-days', glorify: 'lesson-remember-allah' },
};

export const ZAKARIYYA_MISSED: Record<string, string> = {
  provision: ZAKARIYYA_FACTS.provision.id,
  fruit: ZAKARIYYA_FACTS.provisionLesson.id,
  dates: ZAKARIYYA_FACTS.provisionLesson.id,
};

export const zakariyyaGame: GameDef<ZakariyyaConfig> = {
  id: ZAKARIYYA_ID,
  topicId: 'prophets',
  i18n: zakariyyaI18n,
  coverArt: 'prophet.zakariyya-mihrab',
  hintArt: 'prophet.zakariyya-provision',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./ZakariyyaGame') as typeof import('./ZakariyyaGame')).ZakariyyaGame),
  levels: [
    {
      level: 1,
      config: { spots: [SPOT.provision, SPOT.fruit, SPOT.dates], ordered: false, hints: true, prompt: 'prompt.provision' },
      facts: [ZAKARIYYA_FACTS.provision, ZAKARIYYA_FACTS.provisionLesson],
    },
    { level: 2, config: { mode: 'episode', episode: DUA }, facts: [ZAKARIYYA_FACTS.dua, ZAKARIYYA_FACTS.neverStop] },
    { level: 3, config: { mode: 'episode', episode: TIDINGS }, facts: [ZAKARIYYA_FACTS.tidings, ZAKARIYYA_FACTS.sign, ZAKARIYYA_FACTS.remember] },
  ],
  order: 22,
};

export const ZAKARIYYA_ART: string[] = ['prophet.zakariyya-room', ...Object.values(SPOT).flatMap((s) => (s.spotArt ? [s.spotArt] : [])), ...episodeArt(DUA), ...episodeArt(TIDINGS)];

export function registerZakariyyaGame(): void {
  registerGame(zakariyyaGame);
}

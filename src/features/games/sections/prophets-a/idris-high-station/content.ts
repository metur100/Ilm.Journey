import type { GameFact } from '@/core/games';
import type { PathStop } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { bukhari, quran, T } from '../shared';

/*
 * Idris – The High Station. The Quran tells only a little about Idris (19:56–57, 21:85–86); the game stays with
 * exactly that, one facet per level: L1 a man of truth and a prophet (19:56), L2 among the patient, in Allah's mercy
 * (21:85–86), L3 raised to a high station (19:57; met in the fourth heaven on the Mi'raj, Bukhari 3207).
 */

export const IDRIS_FACTS = {
  truthful: {
    id: 'idris-man-of-truth',
    text: T('The Quran says: Idris was a man of truth and a prophet.', 'Der Koran sagt: Idris war ein Mann der Wahrhaftigkeit und ein Prophet.', 'Kur’an kaže: Idris je bio iskren čovjek i poslanik.'),
    sources: [quran('19:56')],
    art: 'prophet.idris-star',
    reviewKey: 'stories:idris-truthful',
  },
  truth: lessonFact(
    'truth',
    T(
      'Always tell the truth and keep your word, even when it is hard – Allah praised Idris as a man of truth.',
      'Sag immer die Wahrheit und halte dein Wort, auch wenn es schwer ist – Allah lobte Idris als Mann der Wahrhaftigkeit.',
      'Uvijek govori istinu i drži riječ, i kad je teško – Allah je pohvalio Idrisa kao iskrenog čovjeka.',
    ),
    [quran('19:56')],
    { art: 'object.scroll' },
  ),
  patient: {
    id: 'idris-among-patient',
    text: T(
      'Ismail, Idris and Dhul-Kifl – all of them were among the patient. Allah admitted them into His mercy; they were among the righteous.',
      'Ismail, Idris und Dhul-Kifl – alle gehörten zu den Geduldigen. Allah ließ sie in Seine Barmherzigkeit eingehen; sie gehörten zu den Rechtschaffenen.',
      'Ismail, Idris i Zul-Kifl – svi su bili od strpljivih. Allah ih je uveo u Svoju milost; bili su od dobrih.',
    ),
    sources: [quran('21:85–86')],
    art: 'story.lamp',
    reviewKey: 'stories:idris-with',
    check: {
      type: 'trueFalse',
      statement: T('Allah admitted Idris into His mercy.', 'Allah ließ Idris in Seine Barmherzigkeit eingehen.', 'Allah je Idrisa uveo u Svoju milost.'),
      correct: true,
    },
  },
  patience: lessonFact(
    'patience',
    T(
      'Be patient (sabr): wait calmly, keep trying and stay kind when things are hard. Patience in doing good is never lost with Allah.',
      'Sei geduldig (Sabr): Warte ruhig, versuch es weiter und bleib freundlich, wenn es schwer ist. Geduld im Guten geht bei Allah nie verloren.',
      'Budi strpljiv (sabur): mirno čekaj, pokušavaj dalje i ostani ljubazan kad je teško. Strpljenje u dobru kod Allaha se nikad ne gubi.',
    ),
    [quran('21:85–86')],
    { art: 'object.hourglass' },
  ),
  high: {
    id: 'idris-high-station',
    text: T('Allah says about Idris: "And We raised him to a high station."', 'Allah sagt über Idris: „Und Wir erhoben ihn zu einem hohen Rang.“', 'Allah o Idrisu kaže: „I Mi smo ga na visoko mjesto uzdigli.“'),
    sources: [quran('19:57')],
    art: 'prophet.idris-high-place',
    reviewKey: 'stories:idris-high',
  },
  heaven: {
    id: 'idris-fourth-heaven',
    text: T(
      'On the night of the Mi’raj, the Prophet Muhammad ﷺ met Idris in the fourth heaven.',
      'In der Nacht der Mi’radsch traf der Prophet Muhammad ﷺ Idris im vierten Himmel.',
      'U noći Miradža Poslanik Muhammed, s.a.v.s., susreo je Idrisa na četvrtom nebu.',
    ),
    sources: [bukhari('3207')],
    art: 'prophet.idris-sky-steps',
  },
  raised: lessonFact(
    'raised',
    T(
      'Truthfulness and patience raise a person in Allah’s sight – Allah raised Idris to a high station.',
      'Wahrhaftigkeit und Geduld erheben einen Menschen bei Allah – Allah erhob Idris zu einem hohen Rang.',
      'Iskrenost i strpljivost uzdižu čovjeka kod Allaha – Allah je Idrisa uzdigao na visoko mjesto.',
    ),
    [quran('19:56–57'), quran('21:85')],
    { art: 'prophet.idris-star' },
  ),
} satisfies Record<string, GameFact>;

/** L1 – a man of truth (19:56): sort what a truthful person does. */
export const TRUTH_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Idris was a man of truth (19:56). Sort: what is truthful – and what is not?',
    'Idris war ein Mann der Wahrhaftigkeit (19:56). Sortiere: Was ist wahrhaftig – und was nicht?',
    'Idris je bio iskren čovjek (19:56). Razvrstaj: šta je iskreno – a šta nije?',
  ),
  hints: true,
  bins: [
    { id: 'true', art: 'object.scroll', label: T('Truthful', 'Wahrhaftig', 'Iskreno') },
    { id: 'untrue', art: 'kit.basket', label: T('Not truthful', 'Nicht wahrhaftig', 'Nije iskreno') },
  ],
  items: [
    { id: 'admit', bin: 'true', label: T('Admit a mistake', 'Einen Fehler zugeben', 'Priznati grešku') },
    { id: 'promise', bin: 'true', label: T('Keep a promise', 'Ein Versprechen halten', 'Održati obećanje') },
    { id: 'change', bin: 'true', label: T('Give back extra change', 'Zu viel Wechselgeld zurückgeben', 'Vratiti višak kusura'), art: 'object.coins' },
    { id: 'blame', bin: 'untrue', label: T('Blame someone else', 'Einem anderen die Schuld geben', 'Okriviti drugoga') },
    { id: 'break-word', bin: 'untrue', label: T('Break your word', 'Sein Wort brechen', 'Pogaziti riječ') },
    { id: 'pretend', bin: 'untrue', label: T('Say you did homework you did not do', 'Sagen, du hättest Hausaufgaben gemacht, die du nicht gemacht hast', 'Reći da si uradio zadaću koju nisi') },
  ],
  factMap: { admit: 'lesson-truth', promise: 'lesson-truth', change: 'lesson-truth', blame: 'idris-man-of-truth', 'break-word': 'idris-man-of-truth', pretend: 'idris-man-of-truth' },
};

/** L2 – among the patient (21:85–86): connect a hard moment with the patient answer. */
export const PATIENCE_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Idris was among the patient (21:85). Connect each hard moment with the patient way.',
    'Idris gehörte zu den Geduldigen (21:85). Verbinde jeden schweren Moment mit dem geduldigen Weg.',
    'Idris je bio od strpljivih (21:85). Spoji svaki težak trenutak sa strpljivim putem.',
  ),
  hints: false,
  pairs: [
    { id: 'queue', left: { label: T('A long queue', 'Eine lange Schlange', 'Dug red') }, right: { label: T('Wait for your turn', 'Warten, bis du dran bist', 'Sačekati svoj red') } },
    { id: 'hard-lesson', left: { label: T('A hard lesson', 'Eine schwere Lektion', 'Težak dio za učenje'), art: 'object.book' }, right: { label: T('Keep practising', 'Weiter üben', 'Nastaviti vježbati') } },
    { id: 'upset', left: { label: T('Someone upsets you', 'Jemand ärgert dich', 'Neko te naljuti') }, right: { label: T('Stay calm and kind', 'Ruhig und freundlich bleiben', 'Ostati miran i ljubazan') } },
    { id: 'fasting', left: { label: T('Hungry before iftar', 'Hungrig vor dem Iftar', 'Gladan prije iftara'), art: 'food.dates' }, right: { label: T('Wait calmly', 'Ruhig warten', 'Mirno čekati') } },
  ],
  factMap: { queue: 'lesson-patience', 'hard-lesson': 'lesson-patience', upset: 'idris-among-patient', fasting: 'idris-among-patient' },
};

const STAR = 'prophet.idris-star';

/** L3 – the star path up to the high station (positions on the 300 × 400 `prophet.idris-sky-steps`). */
export const HIGH_PATH: PathStop[] = [
  { id: 'start', label: T('Start', 'Start', 'Početak'), art: 'garden.path-stone', at: { x: 0.2, y: 0.92 } },
  { id: 'truthful', label: T('Truthful', 'Wahrhaftig', 'Iskren'), art: STAR, at: { x: 0.62, y: 0.82 }, caption: IDRIS_FACTS.truthful.text },
  { id: 'prophet', label: T('A prophet', 'Ein Prophet', 'Poslanik'), art: STAR, at: { x: 0.82, y: 0.64 }, caption: T('Idris was a prophet (19:56).', 'Idris war ein Prophet (19:56).', 'Idris je bio poslanik (19:56).') },
  { id: 'patient', label: T('Patient', 'Geduldig', 'Strpljiv'), art: STAR, at: { x: 0.42, y: 0.56 }, caption: T('Among the patient (21:85).', 'Unter den Geduldigen (21:85).', 'Od strpljivih (21:85).') },
  { id: 'righteous', label: T('Righteous', 'Rechtschaffen', 'Dobar'), art: STAR, at: { x: 0.14, y: 0.4 }, caption: T('Among the righteous (21:86).', 'Unter den Rechtschaffenen (21:86).', 'Od dobrih (21:86).') },
  { id: 'fourth', label: T('Fourth heaven', 'Vierter Himmel', 'Četvrto nebo'), art: STAR, at: { x: 0.5, y: 0.27 }, caption: IDRIS_FACTS.heaven.text },
  { id: 'high', label: T('High station', 'Hoher Rang', 'Visok položaj'), art: STAR, at: { x: 0.82, y: 0.1 }, caption: IDRIS_FACTS.high.text },
];

/** Stop → fact taught there (a wrong move at a stop sends that fact to review). */
export const STOP_FACT: Record<string, string> = {
  truthful: IDRIS_FACTS.raised.id,
  prophet: IDRIS_FACTS.raised.id,
  patient: IDRIS_FACTS.raised.id,
  righteous: IDRIS_FACTS.raised.id,
  fourth: IDRIS_FACTS.heaven.id,
  high: IDRIS_FACTS.high.id,
};

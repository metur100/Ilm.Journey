import type { GameFact } from '@/core/games';
import type { KitItem, MemoryPair } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, lessonFact } from '../../prophets-story/episode';
import { quran, T } from '../shared/kit';

/*
 * Harun – three events of his life, each with its lesson:
 *  L1 Musa's dua for a helper – Harun, his brother (20:25–36): memory pairs picture ↔ request (objects only).
 *  L2 Sent together to Fir'awn – the eloquent brother, gentle words (28:34–35, 20:42–46): connect (episode).
 *  L3 Harun among the people while Musa was on the mountain – the calf (7:142, 20:88–91): order (episode).
 */
export const REQUESTS: (KitItem & { ref: string })[] = [
  { id: 'chest', art: 'prophet.harun-bloom', label: T('Expand my chest', 'Weite meine Brust', 'Proširi mi prsa'), ref: '20:25' },
  { id: 'task', art: 'prophet.harun-path', label: T('Ease my task', 'Erleichtere meine Aufgabe', 'Olakšaj mi zadatak'), ref: '20:26' },
  { id: 'tongue', art: 'prophet.harun-knot', label: T('Untie my tongue', 'Löse meine Zunge', 'Odriješi mi jezik'), ref: '20:27' },
  { id: 'helper', art: 'prophet.harun-lanterns', label: T('Harun, my helper', 'Harun, mein Helfer', 'Harun, moj pomagač'), ref: '20:29–30' },
  { id: 'strength', art: 'prophet.harun-pillars', label: T('Strengthen me', 'Stärke mich', 'Osnaži me'), ref: '20:31' },
  { id: 'share', art: 'prophet.harun-oars', label: T('Share my task', 'Teile meine Aufgabe', 'Dijeli moj zadatak'), ref: '20:32' },
];

export interface HarunConfig {
  mode: 'memory';
  ids: string[];
  peekMs?: number;
  hints: boolean;
}

export type HarunGameConfig = HarunConfig | EpisodeConfig;

export function memoryPairs(ids: string[]): MemoryPair[] {
  return ids
    .map((id) => REQUESTS.find((r) => r.id === id)!)
    .map((r) => ({ id: r.id, a: { art: r.art, a11y: r.label }, b: { label: r.label, sub: r.ref }, caption: r.label }));
}

/** L1 – the requests of the dua. */
export const DUA: HarunConfig = { mode: 'memory', ids: REQUESTS.map((r) => r.id), peekMs: 2500, hints: true };

/** L2 – sent together to Fir'awn. */
export const SENT_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Allah sent Musa and Harun together to Fir’awn. Connect what was said with how it goes on.',
    'Allah sandte Musa und Harun gemeinsam zu Pharao. Verbinde das Gesagte mit seiner Fortsetzung.',
    'Allah je poslao Musaa i Haruna zajedno faraonu. Spoji ono što je rečeno s njegovim nastavkom.',
  ),
  hints: false,
  pairs: [
    { id: 'eloquent', left: { art: 'prophet.harun-voice', label: T('"Harun is more eloquent than me"', '„Harun ist redegewandter als ich“', '„Harun je rječitiji od mene“') }, right: { label: T('send him with me as a helper', 'sende ihn mit mir als Helfer', 'pošalji ga sa mnom kao pomagača'), sub: '28:34' } },
    { id: 'arm', left: { art: 'prophet.harun-pillars', label: T('"We will strengthen your arm"', '„Wir werden deinen Arm stärken“', '„Osnažit ćemo tvoju mišicu“') }, right: { label: T('through your brother', 'durch deinen Bruder', 'bratom tvojim'), sub: '28:35' } },
    { id: 'gentle', left: { art: 'object.lantern', label: T('"Speak to him with gentle words"', '„Sprecht zu ihm mit sanften Worten“', '„Govorite mu blagim riječima“') }, right: { label: T('perhaps he will remember or fear', 'vielleicht lässt er sich ermahnen', 'ne bi li se urazumio'), sub: '20:44' } },
    { id: 'with-you', left: { art: 'prophet.harun-lanterns', label: T('"Do not fear"', '„Fürchtet euch nicht“', '„Ne bojte se“') }, right: { label: T('I am with you both – I hear and I see', 'Ich bin mit euch beiden – Ich höre und sehe', 'Ja sam s vama – sve čujem i vidim'), sub: '20:46' } },
  ],
  factMap: { eloquent: 'harun-eloquent', arm: 'harun-eloquent', gentle: 'gentle-words', 'with-you': 'gentle-words' },
};

/** L3 – Harun among the people while Musa was on the mountain. */
export const CALF_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'Musa went to the mountain and left Harun with the people. Put what happened in order.',
    'Musa ging zum Berg und ließ Harun beim Volk. Bring das Geschehen in die richtige Reihenfolge.',
    'Musa je otišao na brdo i ostavio Haruna s narodom. Poredaj šta se dogodilo.',
  ),
  hints: false,
  items: [
    { id: 'forty', art: 'place.mount-sinai', label: T('Musa goes to the mountain for forty nights', 'Musa geht für vierzig Nächte zum Berg', 'Musa odlazi na brdo na četrdeset noći'), sub: '7:142' },
    { id: 'take-place', art: 'prophet.harun-lanterns', label: T('"Take my place among my people"', '„Vertritt mich bei meinem Volk“', '„Zamijeni me u narodu mome“'), sub: '7:142' },
    { id: 'calf', art: 'animal.cow', label: T('Some people worship a calf', 'Einige beten ein Kalb an', 'Neki obožavaju tele'), sub: '20:88' },
    { id: 'follow-me', art: 'prophet.harun-voice', label: T('Harun: "Your Lord is the Most Merciful – follow me"', 'Harun: „Euer Herr ist der Allerbarmer – folgt mir“', 'Harun: „Gospodar vaš je Milostivi – slijedite mene“'), sub: '20:90' },
  ],
  factMap: { forty: 'harun-takes-place', 'take-place': 'harun-takes-place', calf: 'lesson-harun-stand-firm', 'follow-me': 'lesson-harun-stand-firm' },
};

export const HARUN_FACTS = {
  dua: {
    id: 'musa-dua',
    text: T(
      'Musa prayed: "My Lord, expand my chest, ease my task and untie the knot from my tongue, so they understand my speech."',
      'Musa betete: „Mein Herr, weite mir meine Brust, erleichtere mir meine Aufgabe und löse den Knoten von meiner Zunge, damit sie meine Rede verstehen.“',
      'Musa je zamolio: „Gospodaru moj, prostranim učini prsa moja, olakšaj zadatak moj i odriješi uzao s jezika moga da bi razumjeli govor moj.“',
    ),
    sources: quran('20:25–28'),
    art: 'prophet.harun-bloom',
    reviewKey: 'stories:harun-dua',
  },
  helper: {
    id: 'harun-helper',
    text: T(
      'Musa asked: "Give me a helper from my family – Harun, my brother. Strengthen me through him and let him share my task." Allah answered: "Your request is granted, O Musa."',
      'Musa bat: „Gib mir einen Helfer aus meiner Familie – Harun, meinen Bruder. Stärke mich durch ihn und lass ihn an meiner Aufgabe teilhaben.“ Allah antwortete: „Deine Bitte ist dir gewährt, o Musa.“',
      'Musa je zamolio: „Podaj mi pomagača iz porodice moje – Haruna, brata mog. Osnaži me njime i učini ga sudionikom u zadatku mome.“ Allah je odgovorio: „Ispunjena ti je molba, o Musa.“',
    ),
    sources: quran('20:29–32', '20:36'),
    art: 'prophet.harun-lanterns',
    check: {
      type: 'choice',
      prompt: T('Whom did Musa ask for as his helper?', 'Wen erbat Musa als Helfer?', 'Koga je Musa tražio za pomagača?'),
      options: [T('His brother Harun', 'Seinen Bruder Harun', 'Brata Haruna'), T('A king', 'Einen König', 'Jednog kralja'), T('Nobody', 'Niemanden', 'Nikoga')],
      correctIndex: 0,
    },
  },
  eloquent: {
    id: 'harun-eloquent',
    text: T(
      'Musa said: "My brother Harun is more eloquent than me in speech, so send him with me as a helper who confirms me."',
      'Musa sagte: „Mein Bruder Harun ist redegewandter als ich, so sende ihn mit mir als Helfer, der mich bestätigt.“',
      'Musa je rekao: „Brat moj Harun je rječitiji od mene, pa ga pošalji sa mnom kao pomagača koji će me potvrditi.“',
    ),
    sources: quran('28:34'),
    art: 'prophet.harun-voice',
    reviewKey: 'stories:harun-eloquent',
  },
  gentle: {
    id: 'gentle-words',
    text: T(
      'Allah said to Musa and Harun: "Go, both of you, to Fir’awn – he has gone too far. Speak to him with gentle words." And: "Do not fear. I am with you both – I hear and I see."',
      'Allah sprach zu Musa und Harun: „Geht beide zu Pharao – er hat das Maß überschritten. Sprecht zu ihm mit sanften Worten.“ Und: „Fürchtet euch nicht. Ich bin mit euch beiden – Ich höre und sehe.“',
      'Allah je rekao Musau i Harunu: „Idite vas dvojica faraonu – on se uistinu osilio. Govorite mu blagim riječima.“ I: „Ne bojte se, Ja sam s vama – sve čujem i vidim.“',
    ),
    sources: quran('20:43–46'),
    art: 'object.lantern',
    reviewKey: 'stories:harun-gentle',
  },
  takesPlace: {
    id: 'harun-takes-place',
    text: T(
      'When Musa went to the mountain for forty nights, he told Harun: "Take my place among my people and do what is right." When some began to worship a calf, Harun told them: "You are only being tested by it. Your Lord is the Most Merciful – so follow me."',
      'Als Musa für vierzig Nächte zum Berg ging, sagte er zu Harun: „Vertritt mich bei meinem Volk und handle recht.“ Als einige ein Kalb anzubeten begannen, sagte Harun: „Ihr werdet damit nur geprüft. Euer Herr ist der Allerbarmer – so folgt mir.“',
      'Kada je Musa otišao na brdo na četrdeset noći, rekao je Harunu: „Zamijeni me u narodu mome i čini dobro.“ Kada su neki počeli obožavati tele, Harun im je rekao: „Vi ste time samo stavljeni na iskušenje. Gospodar vaš je Milostivi – zato slijedite mene.“',
    ),
    sources: quran('7:142', '20:90'),
    art: 'place.mount-sinai',
  },
  lessonTogether: lessonFact(
    'harun-together',
    T(
      'We are stronger together. Asking Allah for help and helping others in good things is a strength, not a weakness.',
      'Gemeinsam sind wir stärker. Allah um Hilfe zu bitten und anderen im Guten zu helfen ist eine Stärke, keine Schwäche.',
      'Zajedno smo jači. Tražiti od Allaha pomoć i pomagati drugima u dobru je snaga, a ne slabost.',
    ),
    quran('20:29–32'),
    { art: 'prophet.harun-oars', reviewKey: 'stories:harun-lesson' },
  ),
  lessonGentle: lessonFact(
    'harun-gentle',
    T(
      'Speak gently, even to someone who is unkind. Allah told Musa and Harun to use gentle words – kind words open hearts.',
      'Sprich sanft, auch mit jemandem, der unfreundlich ist. Allah befahl Musa und Harun sanfte Worte – freundliche Worte öffnen Herzen.',
      'Govori blago, i s onim ko je neljubazan. Allah je naredio Musau i Harunu blage riječi – lijepe riječi otvaraju srca.',
    ),
    quran('20:44'),
    { art: 'object.lantern' },
  ),
  lessonFirm: lessonFact(
    'harun-stand-firm',
    T(
      'Stay with the truth when others go the wrong way, and call them back kindly – as Harun reminded the people that their Lord is the Most Merciful.',
      'Bleib bei der Wahrheit, wenn andere den falschen Weg gehen, und ruf sie freundlich zurück – so wie Harun das Volk erinnerte, dass ihr Herr der Allerbarmer ist.',
      'Ostani uz istinu kad drugi krenu pogrešnim putem i lijepo ih pozovi nazad – kao što je Harun podsjetio narod da je njihov Gospodar Milostivi.',
    ),
    quran('20:90'),
    { art: 'prophet.harun-voice' },
  ),
} satisfies Record<string, GameFact>;

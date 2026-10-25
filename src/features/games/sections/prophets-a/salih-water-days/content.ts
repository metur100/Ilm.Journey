import type { GameFact } from '@/core/games';
import type { PourVessel } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { quran, T } from '../shared';

/*
 * Salih – Water Days, three events (story salih.json): L1 Thamud's homes in the mountains and Salih's call
 * (7:73–74, 26:146–152), L2 the she-camel, a sign, and the shared water (7:73, 26:155–156, 54:28), L3 they harmed
 * the she-camel, and Allah saved Salih and the believers (7:77–79, 11:65–68) – the punishment is narrated, not played.
 */

export const SALIH_FACTS = {
  homes: {
    id: 'salih-homes-in-mountains',
    text: T(
      'Thamud built palaces on the plains and carved homes out of the mountains. Salih said: "Remember the favours of Allah and do not spread corruption on the earth."',
      'Die Thamud bauten Paläste in den Ebenen und meißelten Häuser aus den Bergen. Salih sagte: „Gedenkt der Wohltaten Allahs und stiftet kein Unheil auf der Erde.“',
      'Semud je gradio dvorce u ravnicama i klesao kuće u planinama. Salih je rekao: „Sjetite se Allahovih blagodati i ne činite nered na Zemlji.“',
    ),
    sources: [quran('7:74')],
    art: 'prophet.salih-rock-houses',
  },
  favours: lessonFact(
    'favours',
    T(
      'Remember who gave you everything you have and thank Him – and never use His gifts to do wrong.',
      'Denk daran, wer dir alles gegeben hat, was du hast, und danke Ihm – und nutze Seine Gaben nie für Unrecht.',
      'Sjeti se Ko ti je dao sve što imaš i zahvali Mu – i nikad ne koristi Njegove darove za zlo.',
    ),
    [quran('7:74'), quran('26:146–152')],
    { art: 'garden.palm' },
  ),
  sign: {
    id: 'salih-camel-sign',
    text: T(
      'Salih said: "This is the she-camel of Allah, a sign for you. Let her eat on Allah’s earth and do not touch her with harm."',
      'Salih sagte: „Dies ist die Kamelstute Allahs, ein Zeichen für euch. Lasst sie auf Allahs Erde weiden und tut ihr nichts Böses an.“',
      'Salih je rekao: „Ovo je Allahova kamila, znak vama. Pustite je neka pase po Allahovoj zemlji i ne dirajte je zlom.“',
    ),
    sources: [quran('7:73')],
    art: 'prophet.salih-camel',
    check: {
      type: 'trueFalse',
      statement: T('Salih allowed the people to harm the she-camel.', 'Salih erlaubte den Leuten, der Kamelstute zu schaden.', 'Salih je dozvolio ljudima da naude kamili.'),
      correct: false,
    },
  },
  turns: {
    id: 'salih-water-turns',
    text: T(
      'Salih said: "She has a turn to drink, and you have a turn to drink, each on a known day." The water was shared between them.',
      'Salih sagte: „Sie hat einen Tag zum Trinken, und ihr habt einen Tag zum Trinken, jeder an einem bestimmten Tag.“ Das Wasser wurde zwischen ihnen geteilt.',
      'Salih je rekao: „Ona ima svoj dan pojenja, a vi imate svoj dan pojenja, svako u određeni dan.“ Voda je bila podijeljena između njih.',
    ),
    sources: [quran('26:155'), quran('54:28')],
    art: 'prophet.salih-well',
    reviewKey: 'stories:salih-share',
  },
  fair: lessonFact(
    'fair',
    T(
      'Share fairly and keep your turn: everyone gets their right – people and animals.',
      'Teile gerecht und halte die Reihe ein: Jeder bekommt sein Recht – Menschen und Tiere.',
      'Dijeli pravedno i poštuj red: svako dobija svoje pravo – i ljudi i životinje.',
    ),
    [quran('26:155'), quran('54:28')],
    { art: 'prophet.salih-jar' },
  ),
  harmed: {
    id: 'salih-camel-harmed',
    text: T(
      'The proud among them harmed the she-camel against Allah’s command. Salih said: "Enjoy yourselves in your homes for three days."',
      'Die Hochmütigen unter ihnen taten der Kamelstute gegen Allahs Befehl Gewalt an. Salih sagte: „Genießt noch drei Tage in euren Häusern.“',
      'Oholi među njima naudili su kamili protivno Allahovoj naredbi. Salih je rekao: „Uživajte u svojim kućama još tri dana.“',
    ),
    sources: [quran('7:77'), quran('11:65')],
    art: 'prophet.salih-rock-houses',
  },
  saved: {
    id: 'salih-saved-by-mercy',
    text: T('Allah saved Salih and those who believed with him, by His mercy.', 'Allah rettete Salih und die, die mit ihm glaubten, durch Seine Barmherzigkeit.', 'Allah je Svojom milošću spasio Saliha i one koji su s njim vjerovali.'),
    sources: [quran('11:66')],
    art: 'story.sun',
    reviewKey: 'stories:salih-saved',
  },
  animals: lessonFact(
    'animals',
    T(
      'Never hurt an animal: animals are a trust from Allah – we feed them, give them water and keep them from harm.',
      'Tu nie einem Tier weh: Tiere sind ein anvertrautes Gut Allahs – wir füttern sie, geben ihnen Wasser und schützen sie vor Schaden.',
      'Nikad ne povrijedi životinju: životinje su Allahov emanet – hranimo ih, pojimo i čuvamo od zla.',
    ),
    [quran('7:73'), quran('11:64')],
    { art: 'prophet.salih-camel' },
  ),
} satisfies Record<string, GameFact>;

/** L1 – Allah's gifts to Thamud and Salih's call (7:73–74, 11:61, 26:146–152). */
export const CALL_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Sort: what had Allah given Thamud – and what did Salih call them to?',
    'Sortiere: Was hatte Allah den Thamud gegeben – und wozu rief Salih sie auf?',
    'Razvrstaj: šta je Allah dao Semudu – a čemu ih je Salih pozivao?',
  ),
  hints: true,
  bins: [
    { id: 'gifts', art: 'prophet.salih-rock-houses', label: T('Allah’s gifts', 'Allahs Gaben', 'Allahove blagodati') },
    { id: 'call', art: 'object.lamp', label: T('Salih’s call', 'Salihs Aufruf', 'Salihov poziv') },
  ],
  items: [
    { id: 'rock-homes', bin: 'gifts', label: T('Homes carved in the mountains', 'Häuser in den Bergen', 'Kuće isklesane u planinama'), sub: '26:149' },
    { id: 'springs', bin: 'gifts', label: T('Gardens and springs', 'Gärten und Quellen', 'Bašče i izvori'), sub: '26:147' },
    { id: 'palms', bin: 'gifts', label: T('Crops and palm trees', 'Felder und Palmen', 'Usjevi i palme'), art: 'garden.palm', sub: '26:148' },
    { id: 'one-god', bin: 'call', label: T('Worship Allah alone', 'Allah allein dienen', 'Robovati samo Allahu'), sub: '7:73' },
    { id: 'forgiveness', bin: 'call', label: T('Ask Him for forgiveness', 'Bittet Ihn um Vergebung', 'Tražite od Njega oprost'), sub: '11:61' },
    { id: 'no-corruption', bin: 'call', label: T('Do not spread corruption', 'Stiftet kein Unheil', 'Ne činite nered'), sub: '7:74' },
  ],
  factMap: { 'rock-homes': 'salih-homes-in-mountains', springs: 'lesson-favours', palms: 'lesson-favours', 'one-god': 'salih-homes-in-mountains', forgiveness: 'salih-homes-in-mountains', 'no-corruption': 'lesson-favours' },
};

const JAR = 'prophet.salih-jar';

/** L2 – the people's day at the water: everyone takes only their share. */
export const JARS: PourVessel[] = [
  { id: 'jar-1', art: JAR, label: T('Jar 1', 'Krug 1', 'Ćup 1'), target: 0.6, tolerance: 0.08 },
  { id: 'jar-2', art: JAR, label: T('Jar 2', 'Krug 2', 'Ćup 2'), target: 0.45, tolerance: 0.08 },
  { id: 'jar-3', art: JAR, label: T('Jar 3', 'Krug 3', 'Ćup 3'), target: 0.75, tolerance: 0.08 },
];

export const JAR_FACT: Record<string, string> = Object.fromEntries(JARS.map((j) => [j.id, SALIH_FACTS.turns.id]));

/** L3 – the warning and the rescue in order (7:77–79, 11:65–68). */
export const RESCUE_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'What happened after the she-camel was harmed? Put it in order, then tap Check.',
    'Was geschah, nachdem der Kamelstute Gewalt angetan wurde? Bring es in die richtige Reihenfolge und tippe auf Prüfen.',
    'Šta se desilo nakon što su naudili kamili? Poredaj, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'harm', art: 'prophet.salih-camel', label: T('The proud harmed the she-camel', 'Die Hochmütigen taten der Kamelstute Gewalt an', 'Oholi su naudili kamili'), sub: '7:77' },
    { id: 'three-days', art: 'object.hourglass', label: T('"Enjoy your homes for three days"', '„Genießt drei Tage in euren Häusern“', '„Uživajte u kućama tri dana“'), sub: '11:65' },
    { id: 'rescue', art: 'story.sun', label: T('Allah saved Salih and the believers', 'Allah rettete Salih und die Gläubigen', 'Allah je spasio Saliha i vjernike'), sub: '11:66' },
    { id: 'empty-homes', art: 'story.rock-dwellings', label: T('The carved houses stood empty', 'Die gemeißelten Häuser standen leer', 'Isklesane kuće ostale su prazne'), sub: '11:68' },
    { id: 'advice', art: 'object.lamp', label: T('"I gave you sincere advice"', '„Ich habe euch aufrichtig geraten“', '„Iskreno sam vas savjetovao“'), sub: '7:79' },
  ],
  factMap: { harm: 'lesson-animals', 'three-days': 'salih-camel-harmed', rescue: 'salih-saved-by-mercy', 'empty-homes': 'salih-camel-harmed', advice: 'salih-saved-by-mercy' },
};

import type { GameFact } from '@/core/games';
import type { BuildPart } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { quran, T } from '../shared';

/*
 * Ishaq – Glad Tidings, three events (story ishaq.json): L1 the honoured guests of Ibrahim (11:69, 51:24–27), L2 the
 * glad tidings of Ishaq and Yaqub (11:70–73), L3 Ishaq the prophet and the family of prophets (37:112–113,
 * 21:72–73, 2:132–133).
 */

export const ISHAQ_FACTS = {
  guests: {
    id: 'ishaq-honoured-guests',
    text: T(
      'Ibrahim greeted his guests with salam and quickly brought them a roasted calf.',
      'Ibrahim grüßte seine Gäste mit Salam und brachte ihnen schnell ein gebratenes Kalb.',
      'Ibrahim je goste pozdravio selamom i brzo im donio pečeno tele.',
    ),
    sources: [quran('11:69'), quran('51:24–27')],
    art: 'prophet.ishaq-platter',
    reviewKey: 'stories:ishaq-salam',
  },
  welcome: lessonFact(
    'welcome',
    T(
      'Welcome your guests warmly: greet them with salam and offer them the best you have, as Ibrahim did.',
      'Empfange deine Gäste herzlich: Grüß sie mit Salam und biete ihnen das Beste an, was du hast – wie Ibrahim.',
      'Lijepo dočekaj goste: pozdravi ih selamom i ponudi im najbolje što imaš – kao Ibrahim.',
    ),
    [quran('51:24–27')],
    { art: 'prophet.ishaq-rug' },
  ),
  tidings: {
    id: 'ishaq-and-yaqub',
    text: T(
      'The guests gave the glad tidings of Ishaq – and after Ishaq, of Yaqub. Sarah said: "How can I have a child when I am old?" They said: "The mercy of Allah and His blessings are upon you, people of the house."',
      'Die Gäste verkündeten Ishaq – und nach Ishaq Yaqub. Sara sagte: „Wie soll ich ein Kind bekommen, wo ich doch alt bin?“ Sie sagten: „Die Barmherzigkeit Allahs und Seine Segnungen sind über euch, ihr Leute des Hauses.“',
      'Gosti su obradovali Ishakom – a poslije Ishaka Jakubom. Sara je rekla: „Kako ću roditi kad sam starica?“ Rekli su: „Allahova milost i Njegovi blagoslovi neka su na vama, ukućani.“',
    ),
    sources: [quran('11:71–73')],
    art: 'prophet.ishaq-tent',
    reviewKey: 'stories:ishaq-after',
  },
  hope: lessonFact(
    'hope',
    T(
      'Nothing is too hard for Allah. Never lose hope in His mercy – make dua and trust Him.',
      'Nichts ist zu schwer für Allah. Gib die Hoffnung auf Seine Barmherzigkeit nie auf – mach Dua und vertraue Ihm.',
      'Allahu ništa nije teško. Nikad ne gubi nadu u Njegovu milost – uči dovu i pouzdaj se u Njega.',
    ),
    [quran('11:72–73')],
    { art: 'story.sun' },
  ),
  prophet: {
    id: 'ishaq-prophet-righteous',
    text: T(
      'Ishaq was a prophet from among the righteous. Allah made Ishaq and Yaqub leaders who guided by His command and inspired them to do good, to pray and to give zakah.',
      'Ishaq war ein Prophet unter den Rechtschaffenen. Allah machte Ishaq und Yaqub zu Vorbildern, die nach Seinem Befehl leiteten, und gab ihnen ein, Gutes zu tun, zu beten und Zakat zu geben.',
      'Ishak je bio poslanik od dobrih. Allah je Ishaka i Jakuba učinio predvodnicima koji su upućivali po Njegovoj naredbi i nadahnuo ih da čine dobro, klanjaju namaz i daju zekat.',
    ),
    sources: [quran('37:112–113'), quran('21:72–73')],
    art: 'story.sun',
    reviewKey: 'stories:ishaq-prophet',
  },
  family: {
    id: 'ishaq-family',
    text: T(
      'Ibrahim said: "Praise be to Allah, who gave me Ismail and Ishaq in my old age." Ishaq’s son was Yaqub, and Yaqub’s son was Yusuf.',
      'Ibrahim sagte: „Lob sei Allah, der mir im Alter Ismail und Ishaq geschenkt hat.“ Ishaqs Sohn war Yaqub, und Yaqubs Sohn war Yusuf.',
      'Ibrahim je rekao: „Hvala Allahu koji mi je u starosti darovao Ismaila i Ishaka.“ Ishakov sin bio je Jakub, a Jakubov sin Jusuf.',
    ),
    sources: [quran('14:39'), quran('12:6')],
    art: 'prophet.ishaq-tent',
    check: {
      type: 'choice',
      prompt: T('Who was the son of Ishaq?', 'Wer war der Sohn von Ishaq?', 'Ko je bio Ishakov sin?'),
      options: [T('Yaqub', 'Yaqub', 'Jakub'), T('Ismail', 'Ismail', 'Ismail'), T('Nuh', 'Nuh', 'Nuh')],
      correctIndex: 0,
    },
  },
  legacy: lessonFact(
    'legacy',
    T(
      'Pass the good on in your family: Ibrahim and Yaqub advised their children to hold on to the religion of Allah.',
      'Gib das Gute in deiner Familie weiter: Ibrahim und Yaqub rieten ihren Kindern, an der Religion Allahs festzuhalten.',
      'Prenosi dobro u svojoj porodici: Ibrahim i Jakub savjetovali su svoju djecu da se drže Allahove vjere.',
    ),
    [quran('2:132–133')],
    { art: 'object.book' },
  ),
} satisfies Record<string, GameFact>;

/** L1: prepare the welcome in front of the tent (`prophet.ishaq-tent-site`, 400 × 300). */
const box = (x: number, y: number, w: number, h: number) => ({ x: x / 400, y: y / 300, w: w / 400, h: h / 300 });
export const WELCOME: BuildPart[] = [
  { id: 'rug', art: 'prophet.ishaq-rug', label: T('Rug', 'Teppich', 'Ćilim'), slot: box(100, 236, 200, 40), caption: T('A place ready for the honoured guests (51:24).', 'Ein Platz für die geehrten Gäste (51:24).', 'Mjesto za ugledne goste (51:24).') },
  { id: 'cushion-left', art: 'prophet.ishaq-cushion', label: T('Cushion', 'Kissen', 'Jastuk'), slot: box(84, 214, 70, 40), caption: T('"Salam!" – "Salam!" (11:69)', '„Salam!“ – „Salam!“ (11:69)', '„Selam!“ – „Selam!“ (11:69)') },
  { id: 'cushion-right', art: 'prophet.ishaq-cushion', label: T('Cushion', 'Kissen', 'Jastuk'), slot: box(246, 214, 70, 40), caption: T('Every guest is welcome.', 'Jeder Gast ist willkommen.', 'Svaki gost je dobrodošao.') },
  { id: 'platter', art: 'prophet.ishaq-platter', label: T('Roasted calf', 'Gebratenes Kalb', 'Pečeno tele'), slot: box(140, 200, 120, 66), caption: T('Ibrahim quickly brought a roasted calf (11:69).', 'Ibrahim brachte schnell ein gebratenes Kalb (11:69).', 'Ibrahim je brzo donio pečeno tele (11:69).') },
];

export const WELCOME_FACT: Record<string, string> = {
  rug: ISHAQ_FACTS.welcome.id,
  'cushion-left': ISHAQ_FACTS.guests.id,
  'cushion-right': ISHAQ_FACTS.welcome.id,
  platter: ISHAQ_FACTS.guests.id,
};

/** L2 – the glad tidings, in order (11:70–73). */
export const TIDINGS_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'The guests did not eat. What happened next? Put it in order, then tap Check.',
    'Die Gäste aßen nicht. Was geschah dann? Bring es in die richtige Reihenfolge und tippe auf Prüfen.',
    'Gosti nisu jeli. Šta se zatim desilo? Poredaj, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'no-eat', label: T('The guests did not eat', 'Die Gäste aßen nicht', 'Gosti nisu jeli'), sub: '11:70' },
    { id: 'no-fear', label: T('"Do not be afraid – we are sent to the people of Lut"', '„Fürchte dich nicht – wir sind zum Volk Luts gesandt“', '„Ne boj se – poslani smo Lutovom narodu“'), sub: '11:70' },
    { id: 'tidings-ishaq', art: 'prophet.ishaq-tent', label: T('Glad tidings of Ishaq, and after him Yaqub', 'Frohe Botschaft von Ishaq und nach ihm Yaqub', 'Radosna vijest o Ishaku, a poslije njega Jakubu'), sub: '11:71' },
    { id: 'amazed', label: T('"How can I have a child when I am old?"', '„Wie soll ich ein Kind bekommen, wo ich alt bin?“', '„Kako ću roditi kad sam starica?“'), sub: '11:72' },
    { id: 'mercy', art: 'story.sun', label: T('"Allah’s mercy and blessings are upon you"', '„Allahs Barmherzigkeit und Segen sind über euch“', '„Allahova milost i blagoslovi su na vama“'), sub: '11:73' },
  ],
  factMap: { 'no-eat': 'ishaq-and-yaqub', 'no-fear': 'ishaq-and-yaqub', 'tidings-ishaq': 'ishaq-and-yaqub', amazed: 'lesson-hope', mercy: 'lesson-hope' },
};

/** L3 – the family of prophets (14:39, 12:6, 37:112–113). */
export const FAMILY_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Connect each prophet with his place in the family of Ibrahim.',
    'Verbinde jeden Propheten mit seinem Platz in der Familie Ibrahims.',
    'Spoji svakog poslanika s njegovim mjestom u Ibrahimovoj porodici.',
  ),
  hints: false,
  pairs: [
    { id: 'f-ismail', left: { label: T('Ismail', 'Ismail', 'Ismail') }, right: { label: T('Son of Ibrahim and Hajar', 'Sohn von Ibrahim und Hadschar', 'Sin Ibrahima i Hadžere') } },
    { id: 'f-ishaq', left: { label: T('Ishaq', 'Ishaq', 'Ishak') }, right: { label: T('Son of Ibrahim and Sarah', 'Sohn von Ibrahim und Sara', 'Sin Ibrahima i Sare') } },
    { id: 'f-yaqub', left: { label: T('Yaqub', 'Yaqub', 'Jakub') }, right: { label: T('Son of Ishaq', 'Sohn von Ishaq', 'Ishakov sin') } },
    { id: 'f-yusuf', left: { label: T('Yusuf', 'Yusuf', 'Jusuf') }, right: { label: T('Son of Yaqub', 'Sohn von Yaqub', 'Jakubov sin') } },
  ],
  factMap: { 'f-ismail': 'ishaq-family', 'f-ishaq': 'ishaq-prophet-righteous', 'f-yaqub': 'ishaq-family', 'f-yusuf': 'ishaq-family' },
};

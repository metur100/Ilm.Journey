import type { GameFact } from '@/core/games';
import type { PathStop } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { bukhari, quran, T } from '../shared';

/*
 * Ismail – three events (story ismail.json): L1 Hajar and the baby in the valley – the seven runs between Safa and
 * Marwa and the spring of Zamzam (14:37, 2:158; Bukhari 3364), L2 the dream and the great sacrifice (37:101–107),
 * L3 raising the House with Ibrahim and being true to his promise (2:127, 19:54–55).
 */

export const ISMAIL_FACTS = {
  seven: {
    id: 'ismail-seven-runs',
    text: T(
      'Hajar went between the hills of Safa and Marwa seven times looking for help. The Prophet ﷺ said: "That is the sa’y that people make between them."',
      'Hadschar ging siebenmal zwischen den Hügeln Safa und Marwa hin und her, um Hilfe zu suchen. Der Prophet ﷺ sagte: „Das ist der Sa’y, den die Menschen zwischen ihnen machen.“',
      'Hadžera je sedam puta prešla između brežuljaka Safe i Merve tražeći pomoć. Poslanik, s.a.v.s., rekao je: „To je sa’j koji ljudi čine između njih.“',
    ),
    sources: [bukhari('3364')],
    art: 'prophet.ismail-hill',
    reviewKey: 'stories:ismail-seven',
  },
  zamzam: {
    id: 'ismail-zamzam-spring',
    text: T(
      'By Allah’s mercy the spring of Zamzam came forth in the valley; Hajar filled her waterskin.',
      'Durch Allahs Barmherzigkeit entsprang im Tal die Quelle Zamzam; Hadschar füllte ihren Wasserschlauch.',
      'Allahovom milošću u dolini je potekao izvor Zemzem; Hadžera je napunila svoju mješinu.',
    ),
    sources: [bukhari('3364')],
    art: 'prophet.ismail-zamzam',
    reviewKey: 'stories:ismail-zamzam',
  },
  tawakkul: lessonFact(
    'tawakkul',
    T(
      'Trust Allah and still do your best (tawakkul). Hajar said: "Then He will not leave us" – and she still ran and searched.',
      'Vertraue Allah und gib trotzdem dein Bestes (Tawakkul). Hadschar sagte: „Dann wird Er uns nicht im Stich lassen“ – und sie lief und suchte trotzdem.',
      'Pouzdaj se u Allaha i ipak daj sve od sebe (tevekkul). Hadžera je rekla: „Onda nas On neće napustiti“ – i ipak je trčala i tražila.',
    ),
    [bukhari('3364'), quran('14:37')],
    { art: 'prophet.ismail-valley', reviewKey: 'stories:ismail-trust' },
  ),
  sacrifice: {
    id: 'ismail-great-sacrifice',
    text: T(
      'Ismail said to his father: "Do as you are commanded. You will find me, if Allah wills, among the patient." Allah ransomed him with a great sacrifice.',
      'Ismail sagte zu seinem Vater: „Tu, was dir befohlen wird. Du wirst mich, so Allah will, unter den Geduldigen finden.“ Allah löste ihn mit einem großen Opfer aus.',
      'Ismail je rekao ocu: „Učini ono što ti se naređuje. Naći ćeš me, ako Allah da, među strpljivima.“ Allah ga je otkupio velikom žrtvom.',
    ),
    sources: [quran('37:102'), quran('37:107')],
    art: 'animal.ram',
  },
  patience: lessonFact(
    'patience',
    T(
      'Be patient and obey Allah even when it is hard – and know that Allah is merciful. We remember this every Eid al-Adha.',
      'Sei geduldig und gehorche Allah, auch wenn es schwer ist – und wisse, dass Allah barmherzig ist. Daran denken wir an jedem Opferfest.',
      'Budi strpljiv i pokoran Allahu i kad je teško – i znaj da je Allah milostiv. Toga se sjećamo svakog Kurban-bajrama.',
    ),
    [quran('37:102–107')],
    { art: 'animal.ram' },
  ),
  promise: {
    id: 'ismail-true-to-promise',
    text: T(
      'Ismail helped raise the Kaaba. Allah praised him: he was true to his promise, a messenger and a prophet; he told his family to pray and give zakah.',
      'Ismail half, die Kaaba zu errichten. Allah lobte ihn: Er hielt sein Versprechen, war ein Gesandter und ein Prophet; er hielt seine Familie zum Gebet und zur Zakat an.',
      'Ismail je pomagao podići Kabu. Allah ga je pohvalio: bio je dosljedan u obećanju, poslanik i vjerovjesnik; naređivao je porodici namaz i zekat.',
    ),
    sources: [quran('2:127'), quran('19:54–55')],
    art: 'place.kaaba',
    reviewKey: 'stories:ismail-promise',
  },
  word: lessonFact(
    'word',
    T(
      'Keep your promises, in small things and big things – Allah praised Ismail as true to his promise.',
      'Halte deine Versprechen, im Kleinen wie im Großen – Allah lobte Ismail, weil er sein Versprechen hielt.',
      'Drži svoja obećanja, u malim i velikim stvarima – Allah je pohvalio Ismaila jer je bio dosljedan u obećanju.',
    ),
    [quran('19:54')],
    { art: 'object.scroll' },
  ),
} satisfies Record<string, GameFact>;

const SAFA = T('Safa', 'Safa', 'Safa');
const MARWA = T('Marwa', 'Marwa', 'Merva');

/** L1 – start on Safa, then seven runs, ending on Marwa (positions on `prophet.ismail-safa-marwa`, 400 × 240). */
export const RUNS: PathStop[] = Array.from({ length: 8 }, (_, i) => {
  const onSafa = i % 2 === 0;
  const name = onSafa ? SAFA : MARWA;
  return {
    id: i === 0 ? 'start' : `run-${i}`,
    label: i === 0 ? name : { en: `${i} · ${name.en}`, de: `${i} · ${name.de}`, bs: `${i} · ${name.bs}` },
    sub: i === 0 ? undefined : `${i}/7`,
    at: { x: onSafa ? 0.15 : 0.86, y: 0.42 + i * 0.045 },
    caption:
      i === 7
        ? T('Seven runs – then, by Allah’s mercy, the spring of Zamzam (Bukhari 3364).', 'Sieben Läufe – dann, durch Allahs Barmherzigkeit, die Quelle Zamzam (Bukhari 3364).', 'Sedam trčanja – a zatim, Allahovom milošću, izvor Zemzem (Buhari 3364).')
        : undefined,
  };
});

export const RUN_FACT: Record<string, string> = Object.fromEntries(RUNS.map((r) => [r.id, ISMAIL_FACTS.seven.id]));

/** L2 – the dream and the great sacrifice, in order (37:101–107). */
export const SACRIFICE_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'The dream of Ibrahim and the patience of Ismail: put it in order, then tap Check.',
    'Der Traum Ibrahims und die Geduld Ismails: Bring es in die richtige Reihenfolge und tippe auf Prüfen.',
    'Ibrahimov san i Ismailova strpljivost: poredaj, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'walk', label: T('Ismail grew old enough to walk with his father', 'Ismail war alt genug, mit seinem Vater zu gehen', 'Ismail je odrastao da ide s ocem'), sub: '37:102' },
    { id: 'dream', art: 'story.moon-crescent', label: T('Ibrahim told him about his dream', 'Ibrahim erzählte ihm von seinem Traum', 'Ibrahim mu je kazao svoj san'), sub: '37:102' },
    { id: 'do-as', label: T('"Do as you are commanded – I will be patient"', '„Tu, was dir befohlen wird – ich werde geduldig sein“', '„Učini šta ti se naređuje – bit ću strpljiv“'), sub: '37:102' },
    { id: 'submitted', art: 'object.prayer-mat', label: T('Both submitted to Allah', 'Beide ergaben sich Allah', 'Obojica su se predali Allahu'), sub: '37:103' },
    { id: 'fulfilled', label: T('"You have fulfilled the dream"', '„Du hast den Traum erfüllt“', '„Ispunio si san“'), sub: '37:105' },
    { id: 'ram', art: 'animal.ram', label: T('Ransomed with a great sacrifice', 'Ausgelöst mit einem großen Opfer', 'Otkupljen velikom žrtvom'), sub: '37:107' },
  ],
  factMap: { walk: 'ismail-great-sacrifice', dream: 'ismail-great-sacrifice', 'do-as': 'lesson-patience', submitted: 'lesson-patience', fulfilled: 'ismail-great-sacrifice', ram: 'ismail-great-sacrifice' },
};

/** L3 – what Allah praised in Ismail (2:127, 19:54–55): find each picture and its meaning. */
export const PROMISE_EPISODE: Episode = {
  kind: 'memory',
  prompt: T(
    'Allah praised Ismail. Flip two cards: find each picture and what it tells about him.',
    'Allah lobte Ismail. Dreh zwei Karten um: Finde jedes Bild und was es über ihn erzählt.',
    'Allah je pohvalio Ismaila. Okreni dvije karte: pronađi svaku sliku i šta govori o njemu.',
  ),
  hints: false,
  pairs: [
    { id: 'house', a: { art: 'place.kaaba', a11y: T('The Kaaba', 'Die Kaaba', 'Kaba') }, b: { label: T('Helped raise the House', 'Half, das Haus zu errichten', 'Pomagao podići Kuću'), sub: '2:127' }, caption: T('Ismail helped his father raise the Kaaba (2:127).', 'Ismail half seinem Vater, die Kaaba zu errichten (2:127).', 'Ismail je pomagao ocu podići Kabu (2:127).') },
    { id: 'kept-word', a: { art: 'object.scroll', a11y: T('A promise', 'Ein Versprechen', 'Obećanje') }, b: { label: T('True to his promise', 'Hielt sein Versprechen', 'Dosljedan u obećanju'), sub: '19:54' }, caption: T('He was true to his promise (19:54).', 'Er hielt sein Versprechen (19:54).', 'Bio je dosljedan u obećanju (19:54).') },
    { id: 'prayer', a: { art: 'object.prayer-mat', a11y: T('A prayer mat', 'Ein Gebetsteppich', 'Serdžada') }, b: { label: T('Told his family to pray', 'Hielt seine Familie zum Gebet an', 'Naređivao porodici namaz'), sub: '19:55' }, caption: T('He told his family to pray (19:55).', 'Er hielt seine Familie zum Gebet an (19:55).', 'Naređivao je porodici namaz (19:55).') },
    { id: 'zakah', a: { art: 'object.coins', a11y: T('Coins', 'Münzen', 'Novčići') }, b: { label: T('… and to give zakah', '… und zur Zakat', '… i zekat'), sub: '19:55' }, caption: T('… and to give zakah (19:55).', '… und zur Zakat (19:55).', '… i zekat (19:55).') },
  ],
  factMap: { house: 'ismail-true-to-promise', 'kept-word': 'lesson-word', prayer: 'ismail-true-to-promise', zakah: 'ismail-true-to-promise' },
};

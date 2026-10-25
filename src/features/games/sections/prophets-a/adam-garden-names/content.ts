import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { quran, T } from '../shared';

/*
 * Adam – three events (story adam.json): L1 Allah teaches Adam the names (2:31–33), L2 Iblis refuses to prostrate
 * out of arrogance (2:34, 7:11–12), L3 the tree, the mistake and the repentance (2:35–37, 7:19–23).
 */

export interface NameThing {
  id: string;
  art: string;
  name: LocalizedText;
}

export const THINGS: NameThing[] = [
  { id: 'sun', art: 'garden.sun', name: T('Sun', 'Sonne', 'Sunce') },
  { id: 'moon', art: 'garden.moon', name: T('Moon', 'Mond', 'Mjesec') },
  { id: 'water', art: 'garden.water-drop', name: T('Water', 'Wasser', 'Voda') },
  { id: 'palm', art: 'garden.palm', name: T('Palm tree', 'Palme', 'Palma') },
  { id: 'camel', art: 'animal.camel', name: T('Camel', 'Kamel', 'Deva') },
];

export const ADAM_FACTS = {
  names: {
    id: 'taught-the-names',
    text: T('Allah taught Adam the names – all of them.', 'Allah lehrte Adam die Namen – alle.', 'Allah je poučio Adema imenima – svim.'),
    sources: [quran('2:31')],
    art: 'prophet.adam-names',
    reviewKey: 'stories:adam-names',
  },
  angels: {
    id: 'angels-knowledge',
    text: T(
      'The angels said: "Glory be to You! We know nothing except what You have taught us." Then Adam told them the names.',
      'Die Engel sagten: „Preis sei Dir! Wir wissen nur, was Du uns gelehrt hast.“ Dann nannte Adam ihnen die Namen.',
      'Meleki su rekli: „Hvaljen neka si! Mi znamo samo ono čemu si nas Ti poučio.“ Tada im je Adem kazao imena.',
    ),
    sources: [quran('2:32–33')],
    art: 'prophet.adam-tree',
    check: {
      type: 'trueFalse',
      statement: T(
        'The angels said that they knew the names without being taught.',
        'Die Engel sagten, sie kennten die Namen, ohne sie gelernt zu haben.',
        'Meleki su rekli da znaju imena i bez poučavanja.',
      ),
      correct: false,
    },
  },
  knowledge: lessonFact(
    'knowledge',
    T(
      'All knowledge is a gift from Allah. Learn gladly and say, like the angels: "We know only what You have taught us."',
      'Alles Wissen ist ein Geschenk Allahs. Lerne gern und sag wie die Engel: „Wir wissen nur, was Du uns gelehrt hast.“',
      'Svako znanje je Allahov dar. Uči rado i reci kao meleki: „Mi znamo samo ono čemu si nas Ti poučio.“',
    ),
    [quran('2:31–32')],
    { art: 'prophet.adam-names' },
  ),
  iblis: {
    id: 'iblis-refused',
    text: T(
      'Allah commanded the angels to prostrate to Adam, and they prostrated – except Iblis. He refused out of arrogance and said: "I am better than him."',
      'Allah befahl den Engeln, sich vor Adam niederzuwerfen, und sie warfen sich nieder – außer Iblis. Er weigerte sich aus Hochmut und sagte: „Ich bin besser als er.“',
      'Allah je naredio melekima da se poklone Ademu, i oni su se poklonili – osim Iblisa. On je to odbio iz oholosti i rekao: „Ja sam bolji od njega.“',
    ),
    sources: [quran('2:34'), quran('7:11–12')],
    art: 'object.fire',
    check: {
      type: 'choice',
      prompt: T('Why did Iblis refuse?', 'Warum weigerte sich Iblis?', 'Zašto je Iblis odbio?'),
      options: [T('Out of arrogance', 'Aus Hochmut', 'Iz oholosti'), T('He was tired', 'Er war müde', 'Bio je umoran'), T('He did not hear', 'Er hörte es nicht', 'Nije čuo')],
      correctIndex: 0,
    },
  },
  humility: lessonFact(
    'humility',
    T(
      'Be humble, not arrogant. Iblis thought he was better than others, and his pride led him astray.',
      'Sei bescheiden, nicht hochmütig. Iblis hielt sich für besser als andere, und sein Hochmut führte ihn in die Irre.',
      'Budi skroman, a ne ohol. Iblis je mislio da je bolji od drugih i oholost ga je odvela u zabludu.',
    ),
    [quran('2:34'), quran('7:12–13')],
    { art: 'garden.sprout' },
  ),
  repent: {
    id: 'adam-repented',
    text: T(
      'Adam and his wife said: "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers." Allah accepted the repentance.',
      'Adam und seine Frau sagten: „Unser Herr, wir haben uns selbst Unrecht getan. Wenn Du uns nicht vergibst und Dich unser nicht erbarmst, gehören wir gewiss zu den Verlierern.“ Allah nahm die Reue an.',
      'Adem i njegova žena rekli su: „Gospodaru naš, sami smo sebi nepravdu učinili. Ako nam Ti ne oprostiš i ne smiluješ nam se, sigurno ćemo biti od izgubljenih.“ Allah je primio pokajanje.',
    ),
    sources: [quran('7:23'), quran('2:37')],
    art: 'prophet.adam-tree',
  },
  tawbah: lessonFact(
    'tawbah',
    T(
      'When you make a mistake, admit it, feel sorry and ask Allah for forgiveness (tawbah) – He accepts repentance and is the Most Merciful.',
      'Wenn du einen Fehler machst, gib ihn zu, bereue ihn und bitte Allah um Vergebung (Tawba) – Er nimmt die Reue an und ist der Barmherzige.',
      'Kad pogriješiš, priznaj, pokaj se i zatraži od Allaha oprost (tevba) – On prima pokajanje i Milostiv je.',
    ),
    [quran('2:37'), quran('7:23')],
    { art: 'garden.sapling' },
  ),
} satisfies Record<string, GameFact>;

/** L2 – Iblis refuses (2:34, 7:11–12, 15:30): what the angels did and what Iblis did. */
export const IBLIS_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Allah commanded: "Prostrate to Adam." Sort: what did the angels do – and what did Iblis do?',
    'Allah befahl: „Werft euch vor Adam nieder.“ Sortiere: Was taten die Engel – und was tat Iblis?',
    'Allah je naredio: „Poklonite se Ademu.“ Razvrstaj: šta su učinili meleki – a šta Iblis?',
  ),
  hints: false,
  bins: [
    { id: 'angels', art: 'garden.stars', label: T('The angels', 'Die Engel', 'Meleki') },
    { id: 'iblis', art: 'object.fire', label: T('Iblis', 'Iblis', 'Iblis') },
  ],
  items: [
    { id: 'prostrated', bin: 'angels', label: T('They prostrated', 'Sie warfen sich nieder', 'Poklonili su se'), sub: '2:34' },
    { id: 'all-together', bin: 'angels', label: T('All of them together', 'Alle zusammen', 'Svi zajedno'), sub: '15:30' },
    { id: 'obeyed', bin: 'angels', label: T('Obeyed Allah’s command', 'Gehorchten Allahs Befehl', 'Poslušali Allahovu naredbu'), sub: '2:34' },
    { id: 'refused', bin: 'iblis', label: T('Refused', 'Weigerte sich', 'Odbio je'), sub: '2:34' },
    { id: 'better', bin: 'iblis', label: T('"I am better than him"', '„Ich bin besser als er“', '„Ja sam bolji od njega“'), sub: '7:12' },
    { id: 'fire-clay', bin: 'iblis', label: T('"Me from fire, him from clay"', '„Mich aus Feuer, ihn aus Lehm“', '„Mene od vatre, njega od ilovače“'), sub: '7:12' },
  ],
  factMap: { prostrated: 'iblis-refused', 'all-together': 'iblis-refused', obeyed: 'iblis-refused', refused: 'lesson-humility', better: 'lesson-humility', 'fire-clay': 'lesson-humility' },
};

/** L3 – the tree, the mistake and the repentance in order (2:35–37, 7:19–23). */
export const TREE_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'list',
  prompt: T(
    'What happened in the Garden? Put it in order, then tap Check.',
    'Was geschah im Garten? Bring es in die richtige Reihenfolge und tippe auf Prüfen.',
    'Šta se desilo u Džennetu? Poredaj, pa dodirni Provjeri.',
  ),
  hints: false,
  items: [
    { id: 'dwell', art: 'story.garden', label: T('Live in the Garden, eat freely', 'Wohnt im Garten, esst frei', 'Stanujte u Džennetu, jedite slobodno'), sub: '2:35' },
    { id: 'not-near', art: 'prophet.adam-tree', label: T('"Do not come near this tree"', '„Nähert euch nicht diesem Baum“', '„Ne približujte se ovom drvetu“'), sub: '2:35' },
    { id: 'whisper', label: T('Shaytan whispered to them', 'Der Satan flüsterte ihnen ein', 'Šejtan im je došaptavao'), sub: '7:20' },
    { id: 'ate', label: T('They ate from the tree', 'Sie aßen von dem Baum', 'Jeli su s drveta'), sub: '7:22' },
    { id: 'wronged', label: T('"Our Lord, we have wronged ourselves"', '„Unser Herr, wir haben uns selbst Unrecht getan“', '„Gospodaru naš, sami smo sebi nepravdu učinili“'), sub: '7:23' },
    { id: 'accepted', art: 'garden.sapling', label: T('Allah accepted the repentance', 'Allah nahm die Reue an', 'Allah je primio pokajanje'), sub: '2:37' },
  ],
  factMap: { dwell: 'adam-repented', 'not-near': 'adam-repented', whisper: 'adam-repented', ate: 'adam-repented', wronged: 'lesson-tawbah', accepted: 'lesson-tawbah' },
};

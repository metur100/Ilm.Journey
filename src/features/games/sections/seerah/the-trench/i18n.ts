import { defineNamespace } from '@/core/i18n';

/** Namespace `game.the-trench`. The trench is dug and the city kept – no fighting is played. */
const en = {
  title: 'The Trench',
  description: 'Dig the trench across the open plain before Madinah, section by section – and remember the years of Madinah.',
  howTo: 'Drag each trench section onto its place across the plain. In level 3 flip the cards and match each event with its year.',
  'play.l1': 'Dig the trench from west to east – the glowing place is next.',
  'play.l2': 'A longer trench, no outlines – find the place of every section.',
  'play.l3': 'Match each event of the Madinan years with its year.',
  'reveal.title': 'The trench is dug',
  'reveal.caption': 'After weeks of siege the confederates withdrew. (Quran 33:9–11)',
  section: 'Trench section',
  'event.badr': 'Badr',
  'event.uhud': 'Uhud',
  'event.trench': 'The Trench',
  'event.hudaybiyyah': 'al-Hudaybiyyah',
  'event.conquest': 'Conquest of Makkah',
  'year.2': '2 AH',
  'year.3': '3 AH',
  'year.5': '5 AH',
  'year.6': '6 AH',
  'year.8': '8 AH',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Der Graben',
  description: 'Hebe den Graben quer über die offene Ebene vor Medina aus, Abschnitt für Abschnitt – und merke dir die Jahre in Medina.',
  howTo: 'Zieh jeden Grabenabschnitt an seinen Platz quer über die Ebene. In Stufe 3 deckst du Karten auf und ordnest jedem Ereignis sein Jahr zu.',
  'play.l1': 'Hebe den Graben von Westen nach Osten aus – der leuchtende Platz ist der nächste.',
  'play.l2': 'Ein längerer Graben, ohne Umrisse – finde den Platz jedes Abschnitts.',
  'play.l3': 'Ordne jedem Ereignis der Jahre in Medina sein Jahr zu.',
  'reveal.title': 'Der Graben ist ausgehoben',
  'reveal.caption': 'Nach Wochen der Belagerung zogen die Verbündeten ab. (Koran 33:9–11)',
  section: 'Grabenabschnitt',
  'event.badr': 'Badr',
  'event.uhud': 'Uhud',
  'event.trench': 'Der Graben',
  'event.hudaybiyyah': 'al-Hudaibiya',
  'event.conquest': 'Einnahme Mekkas',
  'year.2': '2 n. H.',
  'year.3': '3 n. H.',
  'year.5': '5 n. H.',
  'year.6': '6 n. H.',
  'year.8': '8 n. H.',
};

const bs: Record<Key, string> = {
  title: 'Hendek',
  description: 'Iskopaj hendek preko otvorene ravnice ispred Medine, dio po dio – i zapamti medinske godine.',
  howTo: 'Prevuci svaki dio hendeka na njegovo mjesto preko ravnice. U 3. nivou okreći karte i spoji svaki događaj s njegovom godinom.',
  'play.l1': 'Kopaj hendek od zapada prema istoku – svijetleće mjesto je sljedeće.',
  'play.l2': 'Duži hendek, bez obrisa – pronađi mjesto svakog dijela.',
  'play.l3': 'Spoji svaki događaj medinskih godina s njegovom godinom.',
  'reveal.title': 'Hendek je iskopan',
  'reveal.caption': 'Nakon sedmica opsade saveznici su se povukli. (Kur’an 33:9–11)',
  section: 'Dio hendeka',
  'event.badr': 'Bedr',
  'event.uhud': 'Uhud',
  'event.trench': 'Hendek',
  'event.hudaybiyyah': 'Hudejbija',
  'event.conquest': 'Oslobođenje Mekke',
  'year.2': '2. g. po H.',
  'year.3': '3. g. po H.',
  'year.5': '5. g. po H.',
  'year.6': '6. g. po H.',
  'year.8': '8. g. po H.',
};

export const trenchI18n = defineNamespace('game.the-trench', { en, de, bs });

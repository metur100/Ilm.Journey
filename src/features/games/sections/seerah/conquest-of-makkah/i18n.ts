import { defineNamespace } from '@/core/i18n';

/** Namespace `game.conquest-of-makkah`. Mercy and safety – no battle is played. */
const en = {
  title: 'Makkah: Mercy and Safety',
  description: 'The return to Makkah in 8 AH: safety for whoever closed their door, the idols removed, and Surah al-Nasr.',
  howTo: 'Find the doors and the house of safety in the street, put the day in order, then build the first ayah of Surah al-Nasr.',
  'play.l1': 'Safety was announced. Find every door in the street – and the house of Abu Sufyan.',
  'play.l2': 'Put the events of the conquest of Makkah in order, then check.',
  'play.l3': 'Build al-Nasr 110:1 from the Quran word tiles, from right to left.',
  'spot.door': 'A closed door',
  'spot.abu-sufyan': 'The house of Abu Sufyan',
  'caption.door': 'Whoever closed their door was safe.',
  'step.broken': 'Allies of Quraysh break the truce',
  'step.march': 'March in Ramadan 8 AH',
  'step.abu-sufyan': 'Abu Sufyan accepts Islam',
  'step.safety': 'Safety is announced',
  'step.enter': 'The city is entered with very little fighting',
  'step.idols': 'The idols around the Kaʿbah are removed',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Mekka: Barmherzigkeit und Sicherheit',
  description: 'Die Rückkehr nach Mekka im Jahr 8 n. H.: Sicherheit für jeden, der seine Tür schloss, die Götzen entfernt, und die Sure an-Nasr.',
  howTo: 'Finde die Türen und das Haus der Sicherheit in der Gasse, bring den Tag in die richtige Reihenfolge und setze dann den ersten Vers der Sure an-Nasr zusammen.',
  'play.l1': 'Sicherheit wurde ausgerufen. Finde jede Tür in der Gasse – und das Haus von Abu Sufyan.',
  'play.l2': 'Bring die Ereignisse der Einnahme Mekkas in die richtige Reihenfolge und prüfe.',
  'play.l3': 'Setze an-Nasr 110:1 aus den Koran-Wortkarten zusammen, von rechts nach links.',
  'spot.door': 'Eine geschlossene Tür',
  'spot.abu-sufyan': 'Das Haus von Abu Sufyan',
  'caption.door': 'Wer seine Tür schloss, war sicher.',
  'step.broken': 'Verbündete der Quraisch brechen die Waffenruhe',
  'step.march': 'Aufbruch im Ramadan 8 n. H.',
  'step.abu-sufyan': 'Abu Sufyan nimmt den Islam an',
  'step.safety': 'Sicherheit wird ausgerufen',
  'step.enter': 'Die Stadt wird fast ohne Kampf betreten',
  'step.idols': 'Die Götzen um die Kaaba werden entfernt',
};

const bs: Record<Key, string> = {
  title: 'Mekka: milost i sigurnost',
  description: 'Povratak u Mekku 8. g. po H.: sigurnost za svakoga ko zatvori svoja vrata, uklonjeni kipovi i sura en-Nasr.',
  howTo: 'Pronađi vrata i kuću sigurnosti u ulici, poredaj događaje dana, pa složi prvi ajet sure en-Nasr.',
  'play.l1': 'Proglašena je sigurnost. Pronađi sva vrata u ulici – i kuću Ebu Sufjana.',
  'play.l2': 'Poredaj događaje oslobođenja Mekke, pa provjeri.',
  'play.l3': 'Složi en-Nasr 110:1 od kur’anskih riječi, s desna na lijevo.',
  'spot.door': 'Zatvorena vrata',
  'spot.abu-sufyan': 'Kuća Ebu Sufjana',
  'caption.door': 'Ko je zatvorio svoja vrata, bio je siguran.',
  'step.broken': 'Saveznici Kurejšija krše primirje',
  'step.march': 'Polazak u ramazanu 8. g. po H.',
  'step.abu-sufyan': 'Ebu Sufjan prima islam',
  'step.safety': 'Proglašava se sigurnost',
  'step.enter': 'U grad se ulazi gotovo bez borbe',
  'step.idols': 'Kipovi oko Kabe se uklanjaju',
};

export const conquestI18n = defineNamespace('game.conquest-of-makkah', { en, de, bs });

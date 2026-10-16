import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Raising the House',
  description: 'Follow Ibrahim from the night sky to the valley of Makkah, raise the walls of the Kaaba with Ismail and learn their dua.',
  howTo: 'Level 1: order the sky. Level 2: raise the walls stone row by stone row. Level 3: put the dua in order.',
  'play.sky': 'What did Ibrahim see set, one after another? Put the path in order.',
  'play.walls': 'Raise the House row by row – drag each part to its glowing place.',
  'play.reveal': 'The House is raised',
  'play.revealCaption': '"Our Lord, accept this from us. You are the All-Hearing, the All-Knowing." (2:127)',
  'play.dua': 'Put the dua of Ibrahim and Ismail in order, then tap Check.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Das Haus errichten',
  description: 'Folge Ibrahim vom Nachthimmel ins Tal von Mekka, errichte mit Ismail die Mauern der Kaaba und lerne ihr Bittgebet.',
  howTo: 'Stufe 1: Ordne den Himmel. Stufe 2: Errichte die Mauern Reihe für Reihe. Stufe 3: Bring das Bittgebet in die richtige Reihenfolge.',
  'play.sky': 'Was sah Ibrahim nacheinander untergehen? Bring den Weg in die richtige Reihenfolge.',
  'play.walls': 'Errichte das Haus Reihe für Reihe – zieh jedes Teil an seinen leuchtenden Platz.',
  'play.reveal': 'Das Haus steht',
  'play.revealCaption': '„Unser Herr, nimm es von uns an. Du bist der Allhörende, der Allwissende.“ (2:127)',
  'play.dua': 'Bring das Bittgebet von Ibrahim und Ismail in die richtige Reihenfolge und tippe auf Prüfen.',
};

const bs: Record<Key, string> = {
  title: 'Podizanje Kuće',
  description: 'Prati Ibrahima od noćnog neba do doline Mekke, podigni s Ismailom zidove Kabe i nauči njihovu dovu.',
  howTo: 'Nivo 1: poredaj nebo. Nivo 2: podiži zidove red po red. Nivo 3: poredaj dovu.',
  'play.sky': 'Šta je Ibrahim vidio kako zalazi, jedno za drugim? Poredaj stazu.',
  'play.walls': 'Podiži Kuću red po red – prevuci svaki dio na njegovo svijetleće mjesto.',
  'play.reveal': 'Kuća je podignuta',
  'play.revealCaption': '„Gospodaru naš, primi od nas. Ti si Onaj koji sve čuje i sve zna.“ (2:127)',
  'play.dua': 'Poredaj dovu Ibrahima i Ismaila, pa dodirni Provjeri.',
};

export const ibrahimI18n = defineNamespace('game.ibrahim-kaaba-walls', { en, de, bs });

import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Dawud – Patience, Iron and Praise',
  description: 'Three events of Dawud’s life: the battle against Jalut, the iron Allah made soft for him, and the mountains and birds that glorified Allah with him – each with its lesson.',
  howTo: 'Level 1: put the story of Jalut in order. Level 2: link rings of the right size into a coat of mail. Level 3: connect each gift of Allah with its meaning.',
  'play.prompt': 'Allah made the iron soft. Link the next ring – the faint outline shows its size (34:11).',
  'play.linked': 'Linked!',
  'play.wrongSize': 'This ring does not fit here – measure again.',
  'play.size.s': 'Small ring',
  'play.size.m': 'Middle ring',
  'play.size.l': 'Large ring',
  'play.count': '{done} of {total} links',
  'play.doneTitle': 'A coat of mail',
  'play.doneText': '"Make full coats of mail and measure the links well, and do good" (Quran 34:11).',
  'a11y.place': 'Place {number}: {state}',
  'a11y.empty': 'empty',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Dawud – Geduld, Eisen und Lobpreis',
  description: 'Drei Ereignisse aus Dawuds Leben: der Kampf gegen Dschalut, das Eisen, das Allah für ihn weich machte, und die Berge und Vögel, die mit ihm Allah priesen – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Bring die Geschichte von Dschalut in die richtige Reihenfolge. Stufe 2: Verbinde Ringe der richtigen Größe zu einem Panzerhemd. Stufe 3: Verbinde jede Gabe Allahs mit ihrer Bedeutung.',
  'play.prompt': 'Allah machte das Eisen weich. Hänge den nächsten Ring ein – der zarte Umriss zeigt seine Größe (34:11).',
  'play.linked': 'Eingehängt!',
  'play.wrongSize': 'Dieser Ring passt hier nicht – miss noch einmal.',
  'play.size.s': 'Kleiner Ring',
  'play.size.m': 'Mittlerer Ring',
  'play.size.l': 'Großer Ring',
  'play.count': '{done} von {total} Ringen',
  'play.doneTitle': 'Ein Panzerhemd',
  'play.doneText': '„Fertige volle Panzerhemden an und miss die Ringe gut ab, und tut Gutes“ (Koran 34:11).',
  'a11y.place': 'Stelle {number}: {state}',
  'a11y.empty': 'leer',
};

const bs: Record<Key, string> = {
  title: 'Davud – strpljenje, željezo i slavljenje',
  description: 'Tri događaja iz Davudova života: borba protiv Džaluta, željezo koje mu je Allah omekšao, te planine i ptice koje su s njim slavile Allaha – svaki sa svojom poukom.',
  howTo: 'Nivo 1: poredaj priču o Džalutu. Nivo 2: spajaj karike prave veličine u oklop. Nivo 3: spoji svaki Allahov dar s njegovim značenjem.',
  'play.prompt': 'Allah je omekšao željezo. Spoji sljedeću kariku – blagi obris pokazuje njenu veličinu (34:11).',
  'play.linked': 'Spojeno!',
  'play.wrongSize': 'Ova karika ovdje ne pristaje – izmjeri ponovo.',
  'play.size.s': 'Mala karika',
  'play.size.m': 'Srednja karika',
  'play.size.l': 'Velika karika',
  'play.count': '{done} od {total} karika',
  'play.doneTitle': 'Oklop',
  'play.doneText': "„Pravi široke oklope i pravilno spajaj karike, i dobra djela činite“ (Kur'an 34:11).",
  'a11y.place': 'Mjesto {number}: {state}',
  'a11y.empty': 'prazno',
};

export const dawudArmourI18n = defineNamespace('game.dawud-armour', { en, de, bs });

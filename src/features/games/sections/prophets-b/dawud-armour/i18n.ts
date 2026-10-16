import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Rings of Armour',
  description: 'Allah made iron soft for Dawud and told him to measure the links well. Link ring after ring into a coat of mail.',
  howTo: 'Tap the ring of the right size to link it into the next place. Measure well – a ring of the wrong size does not fit.',
  'play.prompt': 'Link the next ring – the faint outline shows its size.',
  'play.promptSizes': 'Three sizes now – measure each link before you add it.',
  'play.promptPattern': 'Continue the pattern of the first rings – measure the links well (Quran 34:11).',
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
  title: 'Ringe der Rüstung',
  description: 'Allah machte das Eisen für Dawud weich und befahl ihm, die Ringe gut abzumessen. Verbinde Ring um Ring zu einem Panzerhemd.',
  howTo: 'Tippe auf den Ring in der richtigen Größe, um ihn an der nächsten Stelle einzuhängen. Miss gut – ein Ring der falschen Größe passt nicht.',
  'play.prompt': 'Hänge den nächsten Ring ein – der zarte Umriss zeigt seine Größe.',
  'play.promptSizes': 'Jetzt drei Größen – miss jeden Ring, bevor du ihn einhängst.',
  'play.promptPattern': 'Setze das Muster der ersten Ringe fort – miss die Ringe gut ab (Koran 34:11).',
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
  title: 'Karike oklopa',
  description: 'Allah je Davudu omekšao željezo i naredio mu da pravilno spaja karike. Spajaj kariku po kariku u oklop.',
  howTo: 'Dodirni kariku prave veličine da je spojiš na sljedeće mjesto. Dobro izmjeri – karika pogrešne veličine ne pristaje.',
  'play.prompt': 'Spoji sljedeću kariku – blagi obris pokazuje njenu veličinu.',
  'play.promptSizes': 'Sada tri veličine – izmjeri svaku kariku prije nego što je dodaš.',
  'play.promptPattern': "Nastavi uzorak prvih karika – pravilno spajaj karike (Kur'an 34:11).",
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

import { defineNamespace } from '@/core/i18n';

/** Namespace `game.people-of-the-seerah`. Names and roles come from the Seerah content; no portraits. */
const en = {
  title: 'People of the Seerah',
  description: 'Who was who? Match the people around the Prophet ﷺ with their roles – names only, never pictures of people.',
  howTo: 'Connect each name with its role, then flip the cards and find the pairs.',
  'play.l1': 'Connect each name with its role in the Seerah.',
  'play.l2': 'Look closely, then the cards turn: find each name and how they were related to him ﷺ.',
  'play.l3': 'From memory: find each name with its role.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Menschen der Sira',
  description: 'Wer war wer? Ordne den Menschen um den Propheten ﷺ ihre Rollen zu – nur Namen, niemals Bilder von Menschen.',
  howTo: 'Verbinde jeden Namen mit seiner Rolle, dann deck die Karten auf und finde die Paare.',
  'play.l1': 'Verbinde jeden Namen mit seiner Rolle in der Sira.',
  'play.l2': 'Schau genau hin, dann drehen sich die Karten um: finde jeden Namen und seine Beziehung zu ihm ﷺ.',
  'play.l3': 'Aus dem Gedächtnis: finde jeden Namen mit seiner Rolle.',
};

const bs: Record<Key, string> = {
  title: 'Ljudi sire',
  description: 'Ko je bio ko? Spoji ljude oko Poslanika ﷺ s njihovim ulogama – samo imena, nikad slike ljudi.',
  howTo: 'Spoji svako ime s njegovom ulogom, pa okreći karte i pronađi parove.',
  'play.l1': 'Spoji svako ime s njegovom ulogom u siri.',
  'play.l2': 'Pogledaj pažljivo, pa se karte okrenu: pronađi svako ime i njegovu vezu s njim ﷺ.',
  'play.l3': 'Napamet: pronađi svako ime s njegovom ulogom.',
};

export const peopleI18n = defineNamespace('game.people-of-the-seerah', { en, de, bs });

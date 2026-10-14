import { defineNamespace } from '../../i18n';

/** Namespace of the demo game – the pattern every game follows: `game.<id>` with title, description, howTo. */
const en = {
  title: 'Star Path',
  description: 'A tiny test game: tap the stars in the right order.',
  howTo: 'Tap the stars one after another, starting with number 1.',
  'play.next': 'Next star: {number}',
  'play.star': 'Star {number}',
  'play.found': 'Star {number}, already tapped',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Sternenpfad',
  description: 'Ein kleines Testspiel: Tippe die Sterne in der richtigen Reihenfolge an.',
  howTo: 'Tippe die Sterne nacheinander an, beginnend mit Nummer 1.',
  'play.next': 'Nächster Stern: {number}',
  'play.star': 'Stern {number}',
  'play.found': 'Stern {number}, schon angetippt',
};

const bs: Record<Key, string> = {
  title: 'Staza zvijezda',
  description: 'Mala probna igra: dodirni zvijezde pravilnim redoslijedom.',
  howTo: 'Dodiruj zvijezde jednu za drugom, počevši od broja 1.',
  'play.next': 'Sljedeća zvijezda: {number}',
  'play.star': 'Zvijezda {number}',
  'play.found': 'Zvijezda {number}, već dodirnuta',
};

export const demoI18n = defineNamespace('game.demo-stars', { en, de, bs });

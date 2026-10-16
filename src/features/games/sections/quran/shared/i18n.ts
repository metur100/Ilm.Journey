import { defineNamespace, translateNs } from '@/core/i18n';
import type { Language } from '@/core/models';

/** Texts shared by the Quran section's games (listen chip, ayah labels, credits). */
const en = {
  listen: 'Listen',
  stop: 'Stop',
  loading: 'Loading…',
  offline: 'The recitation needs internet – you can keep playing without it.',
  ayah: 'Ayah {number}',
  surahAyah: '{name} · ayah {number}',
  credit: 'Arabic text: Tanzil (tanzil.net) · Translation: {translator}',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  listen: 'Anhören',
  stop: 'Stopp',
  loading: 'Lädt …',
  offline: 'Die Rezitation braucht Internet – du kannst ohne sie weiterspielen.',
  ayah: 'Vers {number}',
  surahAyah: '{name} · Vers {number}',
  credit: 'Arabischer Text: Tanzil (tanzil.net) · Übersetzung: {translator}',
};

const bs: Record<Key, string> = {
  listen: 'Slušaj',
  stop: 'Zaustavi',
  loading: 'Učitava se …',
  offline: 'Za učenje (recitaciju) treba internet – možeš nastaviti igrati i bez njega.',
  ayah: 'Ajet {number}',
  surahAyah: '{name} · {number}. ajet',
  credit: 'Arapski tekst: Tanzil (tanzil.net) · Prijevod: {translator}',
};

export const quranGamesI18n = defineNamespace('quran-games', { en, de, bs });

export function qt(language: Language, key: Key, params?: Record<string, string | number>): string {
  return translateNs(quranGamesI18n, language, key, params);
}

export const listenLabels = (language: Language) => ({
  listen: qt(language, 'listen'),
  stop: qt(language, 'stop'),
  loading: qt(language, 'loading'),
  offline: qt(language, 'offline'),
});

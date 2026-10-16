import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Lamps of Patience',
  description: 'Light the lamps one by one – but only a steady, patient hand can light them. Learn what the Quran says about Dhul-Kifl.',
  howTo: 'Press and hold a lamp until its ring is full. Letting go too early does not light it – be patient.',
  'play.prompt': 'Hold the glowing lamp until it is lit.',
  'play.promptAny': 'Light all the lamps – each one needs a longer, steady hold.',
  'play.promptOrder': 'Remember the order of the numbers – they will disappear. Then light the lamps in that order.',
  'play.early': 'A little longer – patience lights the lamp.',
  'play.lit': 'Lit: {word}',
  'play.notThis': 'Not this lamp yet – keep to the order.',
  'play.already': 'This lamp is already shining.',
  'play.doneTitle': 'Every lamp is shining',
  'play.doneText': '"And Ismail, Idris and Dhul-Kifl – all were of the patient. We admitted them into Our mercy" (Quran 21:85–86).',
  'a11y.lamp': 'Lamp {number}. Hold to light it.',
  'a11y.lampLit': 'Lamp {number}, lit: {word}',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Lampen der Geduld',
  description: 'Zünde die Lampen eine nach der anderen an – doch nur eine ruhige, geduldige Hand kann sie entzünden. Lerne, was der Koran über Dhul-Kifl sagt.',
  howTo: 'Halte eine Lampe gedrückt, bis ihr Ring voll ist. Wer zu früh loslässt, zündet sie nicht an – sei geduldig.',
  'play.prompt': 'Halte die leuchtende Lampe, bis sie brennt.',
  'play.promptAny': 'Zünde alle Lampen an – jede braucht ein längeres, ruhiges Halten.',
  'play.promptOrder': 'Merke dir die Reihenfolge der Zahlen – sie verschwinden gleich. Dann zünde die Lampen in dieser Reihenfolge an.',
  'play.early': 'Noch etwas länger – Geduld zündet die Lampe an.',
  'play.lit': 'Entzündet: {word}',
  'play.notThis': 'Diese Lampe noch nicht – halte dich an die Reihenfolge.',
  'play.already': 'Diese Lampe leuchtet schon.',
  'play.doneTitle': 'Jede Lampe leuchtet',
  'play.doneText': '„Und Ismail, Idris und Dhul-Kifl – alle gehörten zu den Geduldigen. Wir ließen sie in Unsere Barmherzigkeit eingehen“ (Koran 21:85–86).',
  'a11y.lamp': 'Lampe {number}. Gedrückt halten zum Anzünden.',
  'a11y.lampLit': 'Lampe {number}, leuchtet: {word}',
};

const bs: Record<Key, string> = {
  title: 'Svjetiljke strpljenja',
  description: "Upali svjetiljke jednu po jednu – ali samo mirna, strpljiva ruka ih može upaliti. Nauči šta Kur'an kaže o Zul-Kiflu.",
  howTo: 'Pritisni i drži svjetiljku dok se njen krug ne napuni. Ako pustiš prerano, neće se upaliti – budi strpljiv.',
  'play.prompt': 'Drži svjetiljku koja sija dok se ne upali.',
  'play.promptAny': 'Upali sve svjetiljke – svaka traži duže, mirno držanje.',
  'play.promptOrder': 'Zapamti redoslijed brojeva – uskoro će nestati. Zatim upali svjetiljke tim redom.',
  'play.early': 'Još malo – strpljenje pali svjetiljku.',
  'play.lit': 'Upaljeno: {word}',
  'play.notThis': 'Ne ova svjetiljka još – drži se redoslijeda.',
  'play.already': 'Ova svjetiljka već svijetli.',
  'play.doneTitle': 'Svaka svjetiljka svijetli',
  'play.doneText': "„I Ismail, i Idris, i Zul-Kifl – svi su oni bili strpljivi. I Mi smo ih milošću Našom obasuli“ (Kur'an 21:85–86).",
  'a11y.lamp': 'Svjetiljka {number}. Drži da je upališ.',
  'a11y.lampLit': 'Svjetiljka {number}, svijetli: {word}',
};

export const dhulkiflLampsI18n = defineNamespace('game.dhulkifl-lanterns', { en, de, bs });

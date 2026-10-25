import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Dhul-Kifl – Lamps of Patience',
  description: 'The Quran tells only a little about Dhul-Kifl: he was patient, he was in Allah’s mercy and among the best. Learn exactly what it says – each level with its lesson.',
  howTo: 'Level 1: press and hold a lamp until its ring is full – letting go too early does not light it. Level 2: connect each ayah with its ending. Level 3: sort what the Quran tells and what it does not tell.',
  'play.prompt': 'Hold the glowing lamp until it is lit.',
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
  title: 'Dhul-Kifl – Lampen der Geduld',
  description: 'Der Koran erzählt nur wenig über Dhul-Kifl: Er war geduldig, in Allahs Barmherzigkeit und unter den Besten. Lerne genau, was er sagt – jede Stufe mit ihrer Lehre.',
  howTo: 'Stufe 1: Halte eine Lampe gedrückt, bis ihr Ring voll ist – wer zu früh loslässt, zündet sie nicht an. Stufe 2: Verbinde jeden Vers mit seinem Ende. Stufe 3: Sortiere, was der Koran erzählt und was nicht.',
  'play.prompt': 'Halte die leuchtende Lampe, bis sie brennt.',
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
  title: 'Zul-Kifl – svjetiljke strpljenja',
  description: 'Kur’an malo kazuje o Zul-Kiflu: bio je strpljiv, u Allahovoj milosti i među najboljima. Nauči tačno šta kaže – svaki nivo sa svojom poukom.',
  howTo: 'Nivo 1: pritisni i drži svjetiljku dok se njen krug ne napuni – ako pustiš prerano, neće se upaliti. Nivo 2: spoji svaki ajet s njegovim krajem. Nivo 3: razvrstaj šta Kur’an kazuje, a šta ne kazuje.',
  'play.prompt': 'Drži svjetiljku koja sija dok se ne upali.',
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

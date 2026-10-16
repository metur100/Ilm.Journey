import type { GameFact } from '@/core/games';
import type { KitItem, MemoryPair } from '@/core/games/kit';

import { quran, T } from '../shared/kit';

/*
 * Speak & Support (Harun) – the requests of Musa's dua (Quran 20:25–34), each with a picture (objects only).
 * L1–L2: memory pairs picture ↔ request; L3: put the dua in order from memory.
 */
export const REQUESTS: (KitItem & { ref: string })[] = [
  { id: 'chest', art: 'prophet.harun-bloom', label: T('Expand my chest', 'Weite meine Brust', 'Proširi mi prsa'), ref: '20:25' },
  { id: 'task', art: 'prophet.harun-path', label: T('Ease my task', 'Erleichtere meine Aufgabe', 'Olakšaj mi zadatak'), ref: '20:26' },
  { id: 'tongue', art: 'prophet.harun-knot', label: T('Untie my tongue', 'Löse meine Zunge', 'Odriješi mi jezik'), ref: '20:27' },
  { id: 'speech', art: 'prophet.harun-voice', label: T('That they understand', 'Damit sie verstehen', 'Da me razumiju'), ref: '20:28' },
  { id: 'helper', art: 'prophet.harun-lanterns', label: T('Harun, my helper', 'Harun, mein Helfer', 'Harun, moj pomagač'), ref: '20:29–30' },
  { id: 'strength', art: 'prophet.harun-pillars', label: T('Strengthen me', 'Stärke mich', 'Osnaži me'), ref: '20:31' },
  { id: 'share', art: 'prophet.harun-oars', label: T('Share my task', 'Teile meine Aufgabe', 'Dijeli moj zadatak'), ref: '20:32' },
  { id: 'remember', art: 'object.prayer-beads', label: T('Remember You much', 'Viel an Dich denken', 'Mnogo Te spominjati'), ref: '20:33–34' },
];

export type HarunMode = 'memory' | 'order';

export interface HarunConfig {
  mode: HarunMode;
  ids: string[];
  peekMs?: number;
  hints: boolean;
}

const pick = (ids: string[]) => ids.map((id) => REQUESTS.find((r) => r.id === id)!);

export function memoryPairs(ids: string[]): MemoryPair[] {
  return pick(ids).map((r) => ({ id: r.id, a: { art: r.art, a11y: r.label }, b: { label: r.label, sub: r.ref }, caption: r.label }));
}

export function orderItems(ids: string[]): KitItem[] {
  return pick(ids).map((r) => ({ id: r.id, art: r.art, label: r.label, sub: r.ref }));
}

export const LEVEL_1: HarunConfig = { mode: 'memory', ids: ['chest', 'task', 'tongue', 'helper'], peekMs: 2500, hints: true };
export const LEVEL_2: HarunConfig = { mode: 'memory', ids: ['chest', 'task', 'tongue', 'helper', 'strength', 'share'], hints: false };
export const LEVEL_3: HarunConfig = { mode: 'order', ids: ['chest', 'task', 'tongue', 'speech', 'helper', 'strength', 'share', 'remember'], hints: false };

export const HARUN_FACTS = {
  dua: {
    id: 'musa-dua',
    text: T(
      'Musa prayed: "My Lord, expand my chest, ease my task and untie the knot from my tongue, so they understand my speech."',
      'Musa betete: „Mein Herr, weite mir meine Brust, erleichtere mir meine Aufgabe und löse den Knoten von meiner Zunge, damit sie meine Rede verstehen.“',
      'Musa je zamolio: „Gospodaru moj, prostranim učini prsa moja, olakšaj zadatak moj i odriješi uzao s jezika moga da bi razumjeli govor moj.“',
    ),
    sources: quran('20:25–28'),
    art: 'prophet.harun-bloom',
    reviewKey: 'stories:harun-dua',
  },
  helper: {
    id: 'harun-helper',
    text: T(
      'Musa asked: "Give me a helper from my family – Harun, my brother. Strengthen me through him and let him share my task." Allah answered: "Your request is granted, O Musa."',
      'Musa bat: „Gib mir einen Helfer aus meiner Familie – Harun, meinen Bruder. Stärke mich durch ihn und lass ihn an meiner Aufgabe teilhaben.“ Allah antwortete: „Deine Bitte ist dir gewährt, o Musa.“',
      'Musa je zamolio: „Podaj mi pomagača iz porodice moje – Haruna, brata mog. Osnaži me njime i učini ga sudionikom u zadatku mome.“ Allah je odgovorio: „Ispunjena ti je molba, o Musa.“',
    ),
    sources: quran('20:29–32', '20:36'),
    art: 'prophet.harun-lanterns',
    check: {
      type: 'choice',
      prompt: T('Whom did Musa ask for as his helper?', 'Wen erbat Musa als Helfer?', 'Koga je Musa tražio za pomagača?'),
      options: [T('His brother Harun', 'Seinen Bruder Harun', 'Brata Haruna'), T('A king', 'Einen König', 'Jednog kralja'), T('Nobody', 'Niemanden', 'Nikoga')],
      correctIndex: 0,
    },
  },
  eloquent: {
    id: 'harun-eloquent',
    text: T(
      'Musa said: "My brother Harun is more eloquent than me in speech, so send him with me as a helper who confirms me."',
      'Musa sagte: „Mein Bruder Harun ist redegewandter als ich, so sende ihn mit mir als Helfer, der mich bestätigt.“',
      'Musa je rekao: „Brat moj Harun je rječitiji od mene, pa ga pošalji sa mnom kao pomagača koji će me potvrditi.“',
    ),
    sources: quran('28:34'),
    art: 'prophet.harun-voice',
    reviewKey: 'stories:harun-eloquent',
  },
  remember: {
    id: 'glorify-much',
    text: T(
      'Musa asked for his brother\'s help "so that we glorify You much and remember You much".',
      'Musa bat um die Hilfe seines Bruders, „damit wir Dich viel preisen und viel an Dich denken“.',
      'Musa je tražio bratovu pomoć „da bismo Te mnogo hvalili i mnogo Te spominjali“.',
    ),
    sources: quran('20:33–34'),
    art: 'object.prayer-beads',
  },
} satisfies Record<string, GameFact>;

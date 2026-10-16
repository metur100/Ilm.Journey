import type { GameFact } from '@/core/games';
import type { LocalizedText, SourceRef } from '@/core/models';
import salahQuest from '@/features/learn/content/quests/salah.json';

import { BUKHARI, fact, L, MUSLIM } from '../shared/content';

/*
 * Masjid manners (adab of the džamija). Texts marked "content" come from the Learn lesson "salah-masjid"
 * (quests/salah.json) and stay identical; the others are sourced hadith.
 */

type Lesson = { id: string; sections: { body: LocalizedText }[]; sources?: SourceRef[] };
const lesson = (salahQuest.lessons as unknown as Lesson[]).find((l) => l.id === 'salah-masjid');
if (!lesson) throw new Error('masjid-manners: lesson salah-masjid missing');
const MASJID = lesson;

/** L1: situation ↔ the right manner. */
export const PAIRS: { id: string; leftArt: string; rightArt?: string }[] = [
  { id: 'enter', leftArt: 'salah.basics-masjid-door' },
  { id: 'shoes', leftArt: 'salah.basics-shoe-rack' },
  { id: 'sit', leftArt: 'salah.prayer-qiyam' },
  { id: 'praying', leftArt: 'salah.prayer-ruku' },
  { id: 'phone', leftArt: 'salah.basics-phone-silent' },
  { id: 'leave', leftArt: 'kit.flag' },
];

/** L2: good manners or not in the masjid. */
export const DO_ITEMS: { id: string; bin: 'do' | 'dont'; art?: string }[] = [
  { id: 'salam', bin: 'do', art: 'salah.basics-talk' },
  { id: 'clothes', bin: 'do', art: 'salah.basics-garment' },
  { id: 'rack', bin: 'do', art: 'salah.basics-shoe-rack' },
  { id: 'silent', bin: 'do', art: 'salah.basics-phone-silent' },
  { id: 'onion', bin: 'dont', art: 'salah.basics-onion' },
  { id: 'shout', bin: 'dont', art: 'salah.basics-laugh' },
  { id: 'pass', bin: 'dont', art: 'salah.basics-turn-away' },
  { id: 'run', bin: 'dont', art: 'salah.basics-moves' },
];

/** L3: a visit to the masjid, in order. */
export const VISIT: { id: string; art: string }[] = [
  { id: 'wudu', art: 'salah.basics-ibrik' },
  { id: 'walk', art: 'salah.basics-masjid-door' },
  { id: 'shoes', art: 'salah.basics-shoe-rack' },
  { id: 'dua-in', art: 'salah.basics-niyyah' },
  { id: 'tahiyyah', art: 'salah.prayer-ruku' },
  { id: 'rows', art: 'salah.prayer-qiyam' },
  { id: 'dua-out', art: 'kit.flag' },
];

export const MASJID_FACTS = {
  place: fact('masjid-special-place', MASJID.sections[0].body, MASJID.sources ?? [BUKHARI('444')], 'salah.basics-masjid-door'),
  manners: fact('masjid-good-manners', MASJID.sections[1].body, MASJID.sources ?? [BUKHARI('444')], 'salah.basics-shoe-rack'),
  dua: fact(
    'masjid-entering-dua',
    L(
      'The Prophet ﷺ taught: when you enter the masjid, say “Allahumma-ftah li abwaba rahmatik” (O Allah, open for me the gates of Your mercy), and when you leave, “Allahumma inni as’aluka min fadlik” (O Allah, I ask You of Your bounty).',
      'Der Prophet ﷺ lehrte: Wenn du die Moschee betrittst, sag „Allahumma-ftah li abwaba rahmatik“ (O Allah, öffne mir die Tore Deiner Barmherzigkeit), und wenn du sie verlässt, „Allahumma inni as’aluka min fadlik“ (O Allah, ich bitte Dich um Deine Huld).',
      'Poslanik ﷺ je poučio: kada ulaziš u džamiju, reci „Allahumme-ftah li ebvabe rahmetik“ (Allahu, otvori mi vrata Svoje milosti), a kada izlaziš, „Allahumme inni es’eluke min fadlik“ (Allahu, molim Te od Tvoje dobrote).',
    ),
    [MUSLIM('713')],
    'salah.basics-masjid-door',
  ),
  passing: fact(
    'masjid-do-not-pass',
    L(
      'The Prophet ﷺ said that if the one who passes in front of a praying person knew how serious it is, standing and waiting forty would be better for him than passing.',
      'Der Prophet ﷺ sagte: Wüsste der, der vor einem Betenden vorbeigeht, wie schwer das wiegt, wäre es für ihn besser, vierzig zu warten, als vorbeizugehen.',
      'Poslanik ﷺ je rekao da kad bi onaj ko prolazi ispred onoga ko klanja znao koliko je to teško, bilo bi mu bolje da stoji i čeka četrdeset nego da prođe.',
    ),
    [BUKHARI('510'), MUSLIM('507')],
    'salah.basics-turn-away',
  ),
  onion: fact(
    'masjid-onion-garlic',
    L(
      'The Prophet ﷺ said that whoever has eaten raw onion or garlic should keep away from the masjid – so its smell does not disturb others.',
      'Der Prophet ﷺ sagte, wer rohe Zwiebeln oder Knoblauch gegessen hat, soll der Moschee fernbleiben – damit der Geruch niemanden stört.',
      'Poslanik ﷺ je rekao da onaj ko je jeo sirov luk ili bijeli luk neka se kloni džamije – da njegov miris ne smeta drugima.',
    ),
    [MUSLIM('564')],
    'salah.basics-onion',
  ),
  tahiyyah: { ...fact('masjid-tahiyyah', MASJID.sections[2].body, [BUKHARI('444'), MUSLIM('714')], 'salah.prayer-ruku'), reviewKey: 'quest:salah-tahiyyah' },
  rows: fact(
    'masjid-straight-rows',
    L(
      'The Prophet ﷺ said: straighten your rows, for straightening the rows is part of establishing the prayer. And: when you hear the ikamet, walk to the prayer calmly.',
      'Der Prophet ﷺ sagte: Begradigt eure Reihen, denn das Begradigen der Reihen gehört zur Verrichtung des Gebets. Und: Wenn ihr die Iqama hört, geht ruhig zum Gebet.',
      'Poslanik ﷺ je rekao: poravnajte saffove, jer je poravnavanje saffova dio obavljanja namaza. I: kada čujete ikamet, idite na namaz smireno.',
    ),
    [BUKHARI('723'), BUKHARI('636')],
    'salah.prayer-qiyam',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  enter: MASJID_FACTS.dua.id,
  leave: MASJID_FACTS.dua.id,
  shoes: MASJID_FACTS.manners.id,
  sit: MASJID_FACTS.place.id,
  praying: MASJID_FACTS.place.id,
  phone: MASJID_FACTS.manners.id,
  salam: MASJID_FACTS.passing.id,
  clothes: MASJID_FACTS.passing.id,
  rack: MASJID_FACTS.passing.id,
  silent: MASJID_FACTS.passing.id,
  onion: MASJID_FACTS.onion.id,
  shout: MASJID_FACTS.passing.id,
  pass: MASJID_FACTS.passing.id,
  run: MASJID_FACTS.passing.id,
  wudu: MASJID_FACTS.rows.id,
  walk: MASJID_FACTS.rows.id,
  'dua-in': MASJID_FACTS.tahiyyah.id,
  tahiyyah: MASJID_FACTS.tahiyyah.id,
  rows: MASJID_FACTS.rows.id,
  'dua-out': MASJID_FACTS.rows.id,
};

export const MASJID_ART = [...new Set([...PAIRS.map((p) => p.leftArt), ...DO_ITEMS.map((i) => i.art!), ...VISIT.map((v) => v.art)]), 'salah.basics-ezan-scene'];

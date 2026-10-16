import { definitions } from '@/core/art/catalogue';
import { LANGUAGES } from '@/core/models';
import quest from '@/features/learn/content/quests/ramadan.json';
import month from '@/features/learn/content/ramadan/ramadan-month.json';

import { CONTENT, FACTS } from '../shared/facts';
import { RAMADAN_GAMES } from '../games';

type L = Record<string, string>;
const lessons = quest.lessons as unknown as { id: string; sections: { body: L }[]; differenceNote?: L }[];
const questions = quest.questions as unknown as { id: string; explanation: L }[];
const facts = quest.facts as unknown as { id: string; text: L }[];
const section = (id: string, i: number) => lessons.find((l) => l.id === id)!.sections[i].body;

/** Where each copied text comes from. */
const ORIGIN: Record<keyof typeof CONTENT, L> = {
  ninthMonth: section('ramadan-what', 0),
  moonNote: lessons.find((l) => l.id === 'ramadan-what')!.differenceNote!,
  sawm: section('ramadan-fasting', 0),
  whoFasts: section('ramadan-fasting', 1),
  staySafe: section('ramadan-fasting', 2),
  suhoor: section('ramadan-suhoor-iftar', 0),
  iftar: section('ramadan-suhoor-iftar', 1),
  fastTime: questions.find((q) => q.id === 'ramadan-fast-time')!.explanation,
  taraweeh: section('ramadan-nights', 0),
  quranMonth: section('ramadan-nights', 1),
  qadr: section('ramadan-nights', 2),
  generous: facts.find((f) => f.id === 'ramadan-fact-generous')!.text,
  zakatFitr: section('ramadan-charity-eid', 1),
  eid: section('ramadan-charity-eid', 2),
  makeUp: (month.questions as unknown as { id: string; explanation: L }[]).find((q) => q.id === 'ramadan-month-4')!.explanation,
};

const BANNED = [/muslims? (believe|do|say)/i, /for muslims/i, /according to islam/i, /muslime glauben/i, /muslimani vjeruju/i, /laut dem islam/i];

describe('Ramadan content', () => {
  it.each(Object.keys(ORIGIN) as (keyof typeof CONTENT)[])('%s is copied word for word from the Learn content', (key) => {
    for (const lang of LANGUAGES) expect(CONTENT[key][lang]).toBe(ORIGIN[key][lang]);
  });

  it('every fact has a source, all three languages and no "Muslims believe" framing', () => {
    const all = [...Object.values(FACTS), ...RAMADAN_GAMES.flatMap((g) => g.levels.flatMap((l) => l.facts))];
    for (const fact of all) {
      expect(fact.sources.length).toBeGreaterThan(0);
      for (const s of fact.sources) expect(s.sourceName.trim()).not.toBe('');
      for (const lang of LANGUAGES) {
        expect(fact.text[lang].trim()).not.toBe('');
        for (const re of BANNED) expect(fact.text[lang]).not.toMatch(re);
      }
    }
  });

  it('hadith references are the ones the section relies on', () => {
    const refs = new Set(Object.values(FACTS).flatMap((f) => f.sources.map((s) => `${s.sourceName} ${s.sourceReference}`)));
    for (const r of refs) expect(r).toMatch(/^(Quran \d+:\d+(–\d+)?|Sahih al-Bukhari (6|8|37|953|1503|1909|1923|1933|1957|1990|2017)|Sahih Muslim (1095|1137)|Sunan Abi Dawud 2356|Ilmihal \(IZ BiH\) .+)$/);
  });

  it('game texts never use the "Muslims believe" framing', () => {
    for (const game of RAMADAN_GAMES) {
      const dicts = game.i18n.dictionaries as unknown as Record<string, L>;
      for (const lang of LANGUAGES) for (const v of Object.values(dicts[lang])) for (const re of BANNED) expect(v).not.toMatch(re);
    }
  });

  it('section art exists', () => {
    expect(Object.keys(definitions).filter((n) => n.startsWith('ramadan.')).length).toBeGreaterThanOrEqual(20);
  });
});

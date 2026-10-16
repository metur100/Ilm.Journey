import { EPISODES, EVENTS, PEOPLE, SOURCES } from '@/features/seerah/content';
import { toSourceRef } from '@/features/seerah/services/sources';

import { SEERAH_BLOCKS, SEERAH_EVENTS, SEERAH_PEOPLE, SEERAH_SOURCE_REFS } from '../seerahContent';

/** The copied Seerah content of the games is identical to the Seerah JSON (nothing new, nothing changed). */
describe('seerah games: copied content', () => {
  it('blocks match the episodes and events', () => {
    for (const ep of EPISODES) {
      const n = ep.id.slice(-2);
      ep.context.forEach((b, i) => expect(SEERAH_BLOCKS[`e${n}.ctx${i}`]).toEqual(b));
      ep.mainEvent.forEach((b, i) => expect(SEERAH_BLOCKS[`e${n}.main${i}`]).toEqual(b));
      ep.lessons.forEach((b, i) => expect(SEERAH_BLOCKS[`e${n}.lesson${i}`].text).toEqual(b.text));
    }
    for (const ev of EVENTS) ev.summary.forEach((b, i) => expect(SEERAH_BLOCKS[`ev.${ev.id}.${i}`]).toEqual(b));
  });

  it('events and people match', () => {
    for (const ev of SEERAH_EVENTS) {
      const src = EVENTS.find((e) => e.id === ev.id)!;
      expect({ title: ev.title, date: ev.date, sourceIds: ev.sourceIds }).toEqual({ title: src.title, date: src.date, sourceIds: src.sourceIds });
    }
    for (const p of SEERAH_PEOPLE) {
      const src = PEOPLE.find((x) => x.id === p.id)!;
      expect({ name: p.name, role: p.role, relationship: p.relationship }).toEqual({ name: src.name, role: src.role, relationship: src.relationship });
    }
  });

  it('source refs name the Seerah sources', () => {
    for (const s of SOURCES) {
      const ref = SEERAH_SOURCE_REFS[s.id];
      expect(`${ref.sourceName} ${ref.sourceReference}`.trim()).toBe(toSourceRef(s).sourceName);
    }
  });
});

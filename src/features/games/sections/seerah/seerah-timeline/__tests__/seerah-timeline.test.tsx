import { SEERAH_EVENTS } from '../../shared/seerahContent';
import { describeSeerahGame } from '../../shared/testing';
import { registerSeerahTimelineGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('seerah-timeline', registerSeerahTimelineGame);

it('marks follow the order of the Seerah timeline', () => {
  const order = (id: string) => SEERAH_EVENTS.find((e) => e.id === id)!.date.sortKey;
  const l3 = ['first-revelation', 'public-call', 'abyssinia', 'taif', 'aqabah', 'hijrah'].map(order);
  expect([...l3].sort((a, b) => a - b)).toEqual(l3);
});

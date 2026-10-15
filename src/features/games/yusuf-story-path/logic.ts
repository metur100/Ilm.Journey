import type { GameResultInput } from '@/core/games';

import { YUSUF_EVENTS, type YusufEvent } from './content';

export interface YusufPathConfig {
  events: string[];
  missedFactId: string;
}

export interface YusufEventChoice {
  event: YusufEvent;
  correct: boolean;
}

/** A deterministic 3-card choice: the next story event plus two plausible timeline distractors. */
export function nextEventChoices(eventIds: readonly string[], step: number): YusufEventChoice[] {
  const expectedId = eventIds[step];
  const expected = YUSUF_EVENTS.find((event) => event.id === expectedId);
  if (!expected) return [];
  const distractors = YUSUF_EVENTS.filter((event) => event.id !== expectedId && !eventIds.slice(0, step).includes(event.id));
  const first = distractors[(step * 2) % distractors.length];
  const second = distractors[(step * 2 + 3) % distractors.length];
  const cards = [expected, first, second];
  const offset = step % cards.length;
  return cards.map((_, index) => cards[(index + offset) % cards.length]!).map((event) => ({ event, correct: event.id === expectedId }));
}

export function storyPathResult(config: YusufPathConfig, mistakes: number): GameResultInput {
  const maxScore = config.events.length * 10;
  const score = Math.max(0, maxScore - mistakes * 2);
  const ratio = maxScore === 0 ? 1 : score / maxScore;
  return {
    score,
    maxScore,
    stars: ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1,
    mistakes,
    factsMissed: mistakes > 0 ? [config.missedFactId] : [],
  };
}
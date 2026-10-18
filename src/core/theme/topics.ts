import type { SceneSpec, TopicId } from '../models';

export interface TopicTheme {
  /** Header gradient; white text is readable on it in light and dark mode. */
  gradient: [string, string];
  /** Accent for icon circles, progress bars and radar points (white icons on top). */
  accent: string;
  icon: string;
  /** Symbolic illustration (never people). */
  scene: SceneSpec;
}

/** Topic themes reuse the knowledge-rpg / islam-quest gradients. */
export const topicThemes: Record<TopicId, TopicTheme> = {
  salah: { gradient: ['#1F4E6B', '#3F8E9C'], accent: '#2F7E8C', icon: 'mosque', scene: { sky: 'dawn', elements: ['stars', 'crescent', 'hills', 'mosque'] } },
  quran: { gradient: ['#17306B', '#2F5AA8'], accent: '#2F5AA8', icon: 'quran', scene: { sky: 'night', elements: ['stars', 'crescent', 'book', 'lanterns'] } },
  prophets: { gradient: ['#4A3270', '#7E5AA8'], accent: '#6E4AA0', icon: 'scroll', scene: { sky: 'dusk', elements: ['stars', 'mountains', 'ark'] } },
  seerah: { gradient: ['#7A3B1C', '#B8662F'], accent: '#A9572A', icon: 'kaaba', scene: { sky: 'sunset', elements: ['mountains', 'city', 'palms', 'mosque'] } },
  akhlaq: { gradient: ['#1F6B4C', '#3E8F5A'], accent: '#2F8A5A', icon: 'heart', scene: { sky: 'day', elements: ['sun', 'garden', 'tree', 'river'] } },
  ramadan: { gradient: ['#33195F', '#6E43AE'], accent: '#5E36A0', icon: 'moon', scene: { sky: 'dusk', elements: ['stars', 'crescent', 'dunes', 'lanterns'] } },
  history: { gradient: ['#5B4A1E', '#8C7230'], accent: '#7D6320', icon: 'shield', scene: { sky: 'day', elements: ['clouds', 'city', 'pattern'] } },
  sufara: { gradient: ['#6B3A12', '#A8642A'], accent: '#9A5A22', icon: 'letter', scene: { sky: 'sunset', elements: ['sun', 'book', 'pattern'] } },
  arabic: { gradient: ['#7D2A44', '#B44A47'], accent: '#B0434F', icon: 'quote', scene: { sky: 'sunset', elements: ['sun', 'city', 'book'] } },
};

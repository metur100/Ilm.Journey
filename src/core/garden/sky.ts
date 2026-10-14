/** Sky of the garden by the learner's real local time. */
export type GardenSky = 'dawn' | 'day' | 'sunset' | 'night';

export function skyForHour(hour: number): GardenSky {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'sunset';
  return 'night';
}

export function skyForDate(date: Date): GardenSky {
  return skyForHour(date.getHours());
}

/**
 * Sky gradients (illustration artwork – like SceneView, these colours are part of the picture, not UI chrome).
 * They stay the same in light and dark mode because the sky follows the real time of day.
 */
export const SKY_GRADIENTS: Record<GardenSky, [string, string]> = {
  dawn: ['#F6B89A', '#FCE6C4'],
  day: ['#7EC8E8', '#D6F0F7'],
  sunset: ['#E9825B', '#F7C98B'],
  night: ['#141A44', '#2D3577'],
};

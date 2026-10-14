import { useMemo } from 'react';

import { canWater, freeSpots, thirstLevel, useGardenStore } from '@/core/garden';
import { type CoreKey, useI18n } from '@/core/i18n';
import { useAppStore } from '@/core/store/appStore';
import { toDayKey } from '@/core/utils/date';

export const gardenElementName = (id: string): CoreKey => `garden.el.${id}` as CoreKey;

/** Derived garden values for screens: thirst, watering, free spots, a screen-reader description. */
export function useGarden() {
  const { t } = useI18n();
  const garden = useGardenStore();
  const level = useAppStore((s) => s.level);
  const today = toDayKey(new Date());

  return useMemo(() => {
    const thirst = thirstLevel(garden, today);
    const state = t(thirst === 0 ? 'garden.state.lush' : thirst === 1 ? 'garden.state.dry' : 'garden.state.thirsty');
    return {
      garden,
      level,
      today,
      thirst,
      stateLabel: state,
      canWater: canWater(garden, today),
      wateredToday: garden.lastWatered === today,
      free: freeSpots(garden),
      a11y: t('garden.a11y', { count: garden.placed.length, state }),
    };
  }, [garden, level, today, t]);
}

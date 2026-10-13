import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

import { playSound, type SoundName } from '../services/sound';
import { useAppStore } from '../store/appStore';

const HAPTIC: Record<SoundName, () => Promise<void>> = {
  click: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  failure: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  reward: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

/** Sound + haptic feedback that respects the learner's settings. */
export function useFeedback() {
  const soundEnabled = useAppStore((s) => s.settings.sound);
  const hapticsEnabled = useAppStore((s) => s.settings.haptics);

  return useMemo(() => {
    const fire = (name: SoundName) => {
      if (soundEnabled) playSound(name);
      if (hapticsEnabled) HAPTIC[name]().catch(() => undefined);
    };
    return {
      tap: () => fire('click'),
      success: () => fire('success'),
      failure: () => fire('failure'),
      reward: () => fire('reward'),
    };
  }, [soundEnabled, hapticsEnabled]);
}

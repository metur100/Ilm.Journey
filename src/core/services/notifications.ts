import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { translate } from '../i18n/translate';
import type { Language } from '../models';

const CHANNEL_ID = 'learning-reminders';

export { DEFAULT_REMINDER_HOUR, REMINDER_HOURS } from './notifications.constants';

export function configureNotificationHandler(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Not available (e.g. in tests) – reminders are optional.
  }
}

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

export async function ensurePermission(language: Language): Promise<PermissionResult> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: translate(language, 'notif.channel'),
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'denied';
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** One optional daily learning reminder. Learning never depends on it. */
export async function syncReminder(enabled: boolean, hour: number, language: Language): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    if ((await ensurePermission(language)) !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: { title: translate(language, 'notif.title'), body: translate(language, 'notif.body') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: CHANNEL_ID },
    });
  } catch {
    // Reminders are optional; failures must never affect the app.
  }
}

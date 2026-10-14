import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';
import { Lora_400Regular, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import { DarkTheme, DefaultTheme, type ErrorBoundaryProps, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrationOverlay } from '@/core/components/game/CelebrationOverlay';
import { ErrorState } from '@/core/components/ui/States';
import { languageFromLocale, translate } from '@/core/i18n';
import { startFeatureAutoSaves } from '@/core/registry';
import { configureNotificationHandler, syncReminder } from '@/core/services/notifications';
import { startAppAutoSave, useAppStore } from '@/core/store/appStore';
import { useTheme } from '@/core/theme';
import { registerFeatures } from '@/features';

// Features register their content, progress, i18n and lifecycle before anything hydrates.
registerFeatures();
configureNotificationHandler();
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
    AmiriQuran_400Regular,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
  });
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const refreshQuests = useAppStore((s) => s.refreshQuests);
  const language = useAppStore((s) => s.settings.language);
  const reminderEnabled = useAppStore((s) => s.settings.reminderEnabled);
  const reminderHour = useAppStore((s) => s.settings.reminderHour);
  const { c, dark } = useTheme();

  useEffect(() => {
    const stopApp = startAppAutoSave();
    const stopFeatures = startFeatureAutoSaves();
    hydrate(languageFromLocale(getLocales()[0]?.languageCode)).catch(() => undefined);
    return () => {
      stopApp();
      stopFeatures();
    };
  }, [hydrate]);

  // A new day brings a new quest log, also when the app was left open overnight.
  useEffect(() => {
    if (!hydrated) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshQuests();
    });
    return () => sub.remove();
  }, [hydrated, refreshQuests]);

  // Keep the optional reminder in sync with the settings and the current language.
  useEffect(() => {
    if (hydrated) void syncReminder(reminderEnabled, reminderHour, language);
  }, [hydrated, reminderEnabled, reminderHour, language]);

  // Root view colour behind screens (visible during transitions and keyboard animations).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.background).catch(() => undefined);
  }, [c.background]);

  const navigationTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, background: c.background, card: c.surface, text: c.text, border: c.border, primary: c.primary, notification: c.gold },
    };
  }, [c, dark]);

  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.night }} />;

  return (
    <ThemeProvider value={navigationTheme}>
      <SafeAreaProvider>
        {/* No root <StatusBar>: its props would override the per-screen style set by useStatusBar (dark onboarding/hero headers). */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background }, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="unit/[id]" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="master/[id]" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="daily" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="review" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        <CelebrationOverlay />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

/** Shown if a screen crashes; progress is stored separately and stays safe. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const language = useAppStore.getState().settings.language;
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ErrorState
        title={translate(language, 'error.title')}
        body={translate(language, 'error.body')}
        actionLabel={translate(language, 'common.retry')}
        onAction={retry}
      />
    </View>
  );
}

import { Stack } from 'expo-router';

import { useTheme } from '@/core/theme';

export default function OnboardingLayout() {
  const { c } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.night }, animation: 'slide_from_right' }} />;
}

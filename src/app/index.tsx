import { Redirect } from 'expo-router';

import { useAppStore } from '@/core/store/appStore';

export default function Index() {
  const onboarded = useAppStore((s) => s.onboarded);
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}

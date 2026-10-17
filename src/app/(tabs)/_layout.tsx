import { Tabs } from 'expo-router/js-tabs';

import { BottomNavigation } from '@/core/components/ui/BottomNavigation';
import { useI18n } from '@/core/i18n';

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation state={props.state} navigation={props.navigation} />}
      // The root stack already paints `c.background` behind every screen, so tab scenes and screen roots stay transparent:
      // each extra full-screen fill costs GPU time on every frame.
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="learn" options={{ title: t('tabs.learn') }} />
      <Tabs.Screen name="play" options={{ title: t('tabs.play') }} />
      <Tabs.Screen name="stories" options={{ title: t('tabs.stories') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.me') }} />
    </Tabs>
  );
}

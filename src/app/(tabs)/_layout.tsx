import { Tabs } from 'expo-router/js-tabs';

import { BottomNavigation } from '@/core/components/ui/BottomNavigation';
import { useI18n } from '@/core/i18n';
import { useTheme } from '@/core/theme';

export default function TabsLayout() {
  const { t } = useI18n();
  const { c } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation state={props.state} navigation={props.navigation} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.background } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="learn" options={{ title: t('tabs.learn') }} />
      <Tabs.Screen name="stories" options={{ title: t('tabs.stories') }} />
      <Tabs.Screen name="seerah" options={{ title: t('tabs.seerah') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}

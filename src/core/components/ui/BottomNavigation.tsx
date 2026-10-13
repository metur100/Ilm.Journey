import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeedback } from '@/core/hooks/useFeedback';
import { type CoreKey, useI18n } from '@/core/i18n';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const TABS: Record<string, { icon: IconName; label: CoreKey }> = {
  index: { icon: 'home', label: 'tabs.home' },
  learn: { icon: 'book', label: 'tabs.learn' },
  stories: { icon: 'scroll', label: 'tabs.stories' },
  seerah: { icon: 'kaaba', label: 'tabs.seerah' },
  profile: { icon: 'user', label: 'tabs.profile' },
};

interface BottomNavigationProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

const useStyles = makeStyles((c) => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: c.night,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center' },
  // A background on both states keeps Android from dropping the rounded corners when the tab becomes active.
  iconWrap: { width: 52, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: c.gold },
}));

/** Custom tab bar (always night-coloured): large touch targets, labels always visible. */
export function BottomNavigation({ state, navigation }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const focused = state.index === index;
        const label = t(config.label);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                feedback.tap();
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, focused && styles.iconActive]}>
              <Icon name={config.icon} size={24} color={focused ? c.onGold : c.onNightMuted} />
            </View>
            <AppText variant="tiny" color={focused ? c.gold : c.onNightMuted} numberOfLines={1}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

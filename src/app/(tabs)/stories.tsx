import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';
import SeerahScreen from '@/features/seerah/screens/SeerahScreen';
import StoriesScreen from '@/features/stories/screens/StoriesScreen';

type Segment = 'prophets' | 'seerah';

const SEGMENTS: readonly Segment[] = ['prophets', 'seerah'];

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  bar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  track: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: radius.pill, padding: 4 },
  option: { flex: 1, minHeight: TOUCH_TARGET - 4, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: c.gold },
  content: { flex: 1 },
}));

/**
 * Stories tab (v2): a segmented control *Prophets | Seerah*. Prophets = the eight prophet stories (stories feature),
 * Seerah = the Seerah journey (seerah feature, formerly its own tab). `/seerah` and `?segment=seerah` open the Seerah.
 * The bar takes the safe-area top inset; the screens below get top = 0 so their hero headers sit right under it.
 */
export default function StoriesTab() {
  const params = useLocalSearchParams<{ segment?: string }>();
  const requested: Segment | null = params.segment === 'seerah' || params.segment === 'prophets' ? params.segment : null;
  const [segment, setSegment] = useState<Segment>(requested ?? 'prophets');
  // A new `?segment=` (e.g. a link to the Seerah while the tab is mounted) switches the segment.
  const [lastRequested, setLastRequested] = useState(requested);
  if (requested !== lastRequested) {
    setLastRequested(requested);
    if (requested) setSegment(requested);
  }
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();

  const background = topicThemes[segment === 'seerah' ? 'seerah' : 'prophets'].gradient[0];

  return (
    <View style={styles.root}>
      <View style={[styles.bar, { paddingTop: insets.top + spacing.sm, backgroundColor: background }]}>
        <View style={styles.track} accessibilityRole="tablist">
          {SEGMENTS.map((s) => {
            const selected = s === segment;
            const label = t(s === 'seerah' ? 'tabs.seerah' : 'stories.segment.prophets');
            return (
              <Pressable
                key={s}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
                onPress={() => {
                  if (selected) return;
                  feedback.tap();
                  setSegment(s);
                }}
                style={[styles.option, selected && styles.active]}
              >
                <AppText variant="bodyBold" color={selected ? c.onGold : c.onNight}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
        <View style={styles.content}>{segment === 'seerah' ? <SeerahScreen /> : <StoriesScreen />}</View>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

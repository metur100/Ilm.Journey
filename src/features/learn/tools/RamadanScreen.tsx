import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { SourceList } from '@/core/components/ui/SourceList';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';

import { factsOf, GOOD_DEEDS } from '../content/quests';
import { useQuestI18n } from '../quests/i18n';
import { totalRamadanDeeds } from '../quests/services/progress';
import { useQuestStore } from '../quests/store/questStore';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  heroText: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  day: {
    width: '15%',
    flexGrow: 1,
    aspectRatio: 1,
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  deed: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
  check: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: c.success, borderColor: c.success },
}));

/**
 * Ramadan Journey (islam-quest): a 30-day calendar with a personal good-deed tracker. It never tracks or
 * pushes fasting itself; the safety note is framed for the learner group (child / teen / adult).
 */
export default function RamadanScreen() {
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const learnerGroup = useAppStore((s) => s.profile.learnerGroup);
  const deeds = useQuestStore((s) => s.ramadanDeeds);
  const toggle = useQuestStore((s) => s.toggleRamadanDeed);
  const [day, setDay] = useState(1);
  const theme = topicThemes.ramadan;
  const total = totalRamadanDeeds(deeds);
  const tips = factsOf('ramadan', 'akhlaq');
  const tip = tips[(day - 1) % tips.length];
  const selected = deeds[String(day)] ?? [];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={theme.gradient}>
        <TopBar dark />
        <View style={styles.heroText}>
          <AppText variant="display" color={c.onNight} accessibilityRole="header">
            {t('ramadan.title')}
          </AppText>
          <AppText variant="body" color={c.onNight}>
            {t('ramadan.intro')}
          </AppText>
        </View>
        <SceneView scene={{ sky: 'dusk', elements: ['stars', 'crescent', 'dunes', 'mosque', 'lanterns'] }} height={120} />
        <AppText variant="bodyBold" color={c.onNight}>
          {t('ramadan.total', { count: total })}
        </AppText>
      </HeroHeader>

      <View style={styles.body}>
        <Card tone="primary">
          <View style={styles.row}>
            <Icon name="shield" size={22} color={c.primaryText} />
            <AppText variant="small" style={styles.flex}>
              {t(`ramadan.safety.${learnerGroup}`)}
            </AppText>
          </View>
        </Card>

        <SectionHeader title={t('ramadan.calendar')} />
        <View style={styles.grid}>
          {DAYS.map((d) => {
            const count = deeds[String(d)]?.length ?? 0;
            const active = d === day;
            return (
              <Pressable
                key={d}
                onPress={() => {
                  feedback.tap();
                  setDay(d);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t('ramadan.dayDeeds', { day: d, count })}
                style={[styles.day, count > 0 && { backgroundColor: c.primarySoft, borderColor: theme.accent }, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}
              >
                <AppText variant="bodyBold" color={active ? c.onAccent : c.text}>
                  {d}
                </AppText>
                {count > 0 ? (
                  <View style={styles.dots}>
                    {Array.from({ length: Math.min(count, 4) }, (_, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: active ? c.onAccent : c.primaryText }]} />
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title={t('ramadan.deedsFor', { day })} />
        <Card>
          {GOOD_DEEDS.map((deed) => {
            const checked = selected.includes(deed.id);
            return (
              <Pressable
                key={deed.id}
                onPress={() => {
                  if (checked) feedback.tap();
                  else feedback.success();
                  toggle(day, deed.id);
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={l(deed.label)}
                style={styles.deed}
              >
                <View style={[styles.check, checked && styles.checkOn]}>{checked ? <Icon name="check" size={18} color={c.onStatus} strokeWidth={3} /> : null}</View>
                <AppText variant="body" style={styles.flex}>
                  {l(deed.label)}
                </AppText>
              </Pressable>
            );
          })}
        </Card>

        {tip ? (
          <Card tone="gold">
            <AppText variant="label" color={c.goldText}>
              {t('ramadan.tip').toUpperCase()}
            </AppText>
            <AppText variant="body">{l(tip.text)}</AppText>
            <SourceList sources={tip.sources} />
          </Card>
        ) : null}

        <Button label={t('ramadan.learnMore')} icon="moon" variant="secondary" onPress={() => router.navigate({ pathname: '/topic/[id]', params: { id: 'ramadan' } })} />
      </View>
    </ScrollView>
  );
}

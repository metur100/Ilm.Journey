import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { useProgressVersion, useSummary } from '@/core/hooks/useProgress';
import { TOPIC_IDS } from '@/core/models';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { TopicCard } from '../components/TopicCard';
import { useLearnI18n } from '../i18n';
import { pathProgress } from '../path';
import { isMasterPassed } from '../services/progression';
import { useLearnStore } from '../store/learnStore';

const useStyles = makeStyles(() => ({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
}));

/** Learn tab: the nine topics, all open from the start. */
export default function LearnScreen() {
  const { t } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const units = useLearnStore((s) => s.units);
  const masters = useLearnStore((s) => s.masters);
  const learnerGroup = useAppStore((s) => s.profile.learnerGroup);
  const summary = useSummary();
  const version = useProgressVersion();

  const topics = useMemo(
    () =>
      TOPIC_IDS.map((id) => ({
        id,
        ...pathProgress(id, { units, masters }),
        knowledge: summary.topics.find((k) => k.id === id)?.knowledge ?? 0,
        mastered: isMasterPassed(id, masters),
      })),
    // `version` re-runs the path when extension sources (beginner quests) change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units, masters, summary.topics, version],
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={c.onNight} accessibilityRole="header">
          {t('tab.title')}
        </AppText>
        <AppText variant="body" color={c.onNightMuted}>
          {t('tab.subtitle')}
        </AppText>
      </HeroHeader>
      <View style={styles.body}>
        <Card tone="gold">
          <View style={styles.row}>
            <Icon name="sparkle" size={24} color={c.goldText} />
            <View style={styles.flex}>
              <AppText variant="label" color={c.goldText}>
                {t('tab.recommended').toUpperCase()}
              </AppText>
              <AppText variant="body">{t(`tab.recommended.${learnerGroup}`)}</AppText>
            </View>
          </View>
        </Card>
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic.id}
            completed={topic.completed}
            total={topic.total}
            knowledge={topic.knowledge}
            mastered={topic.mastered}
            onPress={() => router.push({ pathname: '/topic/[id]', params: { id: topic.id } })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useProgressVersion, useSummary } from '@/core/hooks/useProgress';
import { topicName } from '@/core/i18n';
import { isTopicId } from '@/core/models';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { PathCard } from '../components/PathCard';
import { getArea } from '../content';
import { getTopicTools } from '../extensions';
import { useLearnI18n } from '../i18n';
import { buildTopicPath, pathItemHref } from '../path';
import { useLearnStore } from '../store/learnStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  knowledge: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  toolIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
}));

/** A topic: its tools and ONE path (beginner quests → units → Master Challenge). */
export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l, language } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const units = useLearnStore((s) => s.units);
  const masters = useLearnStore((s) => s.masters);
  const visit = useLearnStore((s) => s.visit);
  const summary = useSummary();
  const version = useProgressVersion();
  const topic = isTopicId(id) ? id : null;

  const path = useMemo(
    () => (topic ? buildTopicPath(topic, { units, masters }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topic, units, masters, version],
  );

  if (!topic) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="map" title={t('topic.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const theme = topicThemes[topic];
  const area = getArea(topic);
  const knowledge = summary.topics.find((k) => k.id === topic)?.knowledge ?? 0;
  const tools = getTopicTools(topic);
  let unitNumber = 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader gradient={theme.gradient}>
        <TopBar dark />
        <SceneView scene={area?.scene ?? theme.scene} height={150} />
        <AppText variant="display" color={c.onNight} accessibilityRole="header">
          {t(topicName(topic))}
        </AppText>
        <AppText variant="body" color={c.onNight}>
          {l(area?.description)}
        </AppText>
        <View style={styles.knowledge}>
          <AppText variant="small" color={c.onNight}>
            {t('topic.knowledge', { percent: knowledge })}
          </AppText>
          <ProgressBar progress={knowledge / 100} color={c.gold} trackColor="rgba(255,255,255,0.2)" />
        </View>
      </HeroHeader>

      <View style={styles.body}>
        {tools.length > 0 ? (
          <>
            <SectionHeader title={t('topic.tools')} />
            {tools.map((tool) => (
              <Card key={tool.id} tone="primary" onPress={() => router.push(tool.href)} accessibilityLabel={tool.label(language)}>
                <View style={styles.row}>
                  <View style={[styles.toolIcon, { backgroundColor: theme.accent }]}>
                    <Icon name={tool.icon} size={22} color={c.onAccent} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{tool.label(language)}</AppText>
                    {tool.description ? (
                      <AppText variant="small" color={c.textMuted}>
                        {tool.description(language)}
                      </AppText>
                    ) : null}
                  </View>
                  <Icon name="chevron" size={20} color={c.textMuted} />
                </View>
              </Card>
            ))}
          </>
        ) : null}

        <SectionHeader title={t('topic.path')} />
        {path.map((entry) => {
          if (entry.item.kind === 'unit') unitNumber++;
          return (
            <PathCard
              key={`${entry.item.kind}-${entry.item.id}`}
              topic={topic}
              entry={entry}
              number={entry.item.kind === 'unit' ? unitNumber : entry.index + 1}
              onPress={() => {
                visit(topic, entry.item.id);
                router.push(pathItemHref(topic, entry.item));
              }}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

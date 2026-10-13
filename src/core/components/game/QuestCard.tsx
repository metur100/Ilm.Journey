import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { type CoreKey, topicName, useI18n } from '@/core/i18n';
import type { Quest, QuestKind } from '@/core/models';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

const ICONS: Record<QuestKind, IconName> = {
  daily: 'sun',
  learning: 'book',
  knowledge: 'sparkle',
  review: 'refresh',
  challenge: 'trophy',
  story: 'scroll',
  episode: 'kaaba',
};

/** Human-readable quest description. */
export function useQuestText() {
  const { t, l } = useI18n();
  return (quest: Quest): string => {
    const goal = quest.goal;
    switch (goal.type) {
      case 'dailyChallenge':
        return t('quests.daily');
      case 'complete':
        return t(quest.kind === 'challenge' ? 'quests.challenge' : 'quests.complete', { title: l(goal.title) });
      case 'correctAnswers':
        return t('quests.knowledge', { count: goal.count, topic: t(topicName(goal.topicArea)) });
      case 'reviewAnswers':
        return t('quests.review', { count: goal.count });
    }
  };
}

const useStyles = makeStyles((c) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: spacing.md,
  },
  done: { backgroundColor: c.successSoft, borderColor: c.success },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconDone: { backgroundColor: c.success },
  texts: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  bar: { flex: 1, width: undefined },
}));

export function QuestCard({ quest }: { quest: Quest }) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const describe = useQuestText();
  const text = describe(quest);
  const status = quest.completed ? t('quests.done') : `${quest.progress}/${quest.target}`;
  const kindLabel = t(`quests.kind.${quest.kind}` as CoreKey);

  return (
    <View style={[styles.card, quest.completed && styles.done]} accessible accessibilityLabel={`${kindLabel}: ${text}. ${status}. +${quest.xp} XP`}>
      <View style={[styles.icon, quest.completed && styles.iconDone]}>
        <Icon name={quest.completed ? 'check' : ICONS[quest.kind]} size={22} color={quest.completed ? c.onStatus : c.primaryText} />
      </View>
      <View style={styles.texts}>
        <AppText variant="label" color={c.goldText}>
          {kindLabel.toUpperCase()}
        </AppText>
        <AppText variant="bodyBold">{text}</AppText>
        <View style={styles.row}>
          <ProgressBar progress={quest.progress / quest.target} color={quest.completed ? c.success : c.primary} style={styles.bar} />
          <AppText variant="tiny" color={c.textMuted}>
            {status}
          </AppText>
        </View>
      </View>
      <AppText variant="small" color={c.goldText}>
        +{quest.xp}
      </AppText>
    </View>
  );
}

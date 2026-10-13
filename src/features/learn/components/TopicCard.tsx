import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { topicName } from '@/core/i18n';
import type { TopicId } from '@/core/models';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { getArea } from '../content';
import { useLearnI18n } from '../i18n';

interface TopicCardProps {
  topic: TopicId;
  completed: number;
  total: number;
  knowledge: number;
  mastered: boolean;
  onPress: () => void;
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  texts: { flex: 1, gap: 2 },
  bar: { marginTop: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

/** One of the eight topics on the Learn tab. */
export function TopicCard({ topic, completed, total, knowledge, mastered, onPress }: TopicCardProps) {
  const { t, l } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const theme = topicThemes[topic];
  const name = t(topicName(topic));
  const steps = t('tab.steps', { completed, total });

  return (
    <Card onPress={onPress} accessibilityLabel={`${name}. ${steps}. ${t('topic.knowledge', { percent: knowledge })}${mastered ? `. ${t('tab.mastered')}` : ''}`}>
      <View style={styles.row}>
        <LinearGradient colors={theme.gradient} style={styles.icon}>
          <Icon name={theme.icon} size={28} color={c.onAccent} />
        </LinearGradient>
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <AppText variant="heading">{name}</AppText>
            {mastered ? <Icon name="trophy" size={18} color={c.goldText} /> : null}
          </View>
          <AppText variant="small" color={c.textMuted} numberOfLines={2}>
            {l(getArea(topic)?.description)}
          </AppText>
          <AppText variant="tiny" color={c.goldText}>
            {steps} · {t('topic.knowledge', { percent: knowledge })}
          </AppText>
          <ProgressBar progress={total ? completed / total : 0} color={theme.accent} height={8} style={styles.bar} />
        </View>
        <Icon name="chevron" size={22} color={c.textMuted} />
      </View>
    </Card>
  );
}

import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import type { TopicId } from '@/core/models';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { getUnit, testQuestionsOfArea } from '../content';
import { useLearnI18n } from '../i18n';
import type { PathEntry } from '../path';
import { MASTER_PASS_PERCENT, MASTER_QUESTIONS } from '../services/progression';
import { useLearnStore } from '../store/learnStore';

const useStyles = makeStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  number: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  locked: { opacity: 0.7 },
}));

interface PathCardProps {
  topic: TopicId;
  entry: PathEntry;
  /** Position among the units (1-based) – shown in the circle. */
  number: number;
  onPress: () => void;
}

/** One step of a topic path: beginner quest, unit or Master Challenge. */
export function PathCard({ topic, entry, number, onPress }: PathCardProps) {
  const { t, l } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const units = useLearnStore((s) => s.units);
  const masters = useLearnStore((s) => s.masters);
  const theme = topicThemes[topic];
  const { item, status } = entry;
  const locked = status === 'locked';
  const done = status === 'completed';

  let title = '';
  let subtitle = '';
  let meta = '';
  let icon = 'book';
  let label = '';
  if (item.kind === 'unit') {
    const unit = getUnit(item.id);
    title = l(unit?.title);
    subtitle = l(unit?.description);
    const best = units[item.id]?.bestScore;
    meta = `${t('topic.difficulty', { level: unit?.difficulty ?? 1 })}${done && best !== undefined ? ` · ${t('topic.best', { score: best })}` : ''}`;
    label = t('topic.unit');
  } else if (item.kind === 'master') {
    const master = masters[topic];
    const poolSize = Math.min(MASTER_QUESTIONS, testQuestionsOfArea(topic).length);
    title = t('master.title');
    subtitle = done && master ? t('master.passed', { score: master.bestScore }) : t('master.body', { count: poolSize, percent: MASTER_PASS_PERCENT });
    icon = 'trophy';
    label = t('master.title');
  } else {
    title = l(item.title);
    subtitle = l(item.description);
    icon = item.icon ?? 'flag';
    label = t('topic.quest');
  }

  const circleColor = locked ? c.locked : done ? c.success : item.kind === 'master' ? c.gold : theme.accent;
  const circleFg = item.kind === 'master' && !locked && !done ? c.onGold : c.onAccent;
  const stateText = locked ? t('topic.locked') : done ? t('topic.done') : subtitle;

  return (
    <Card
      onPress={locked ? undefined : onPress}
      disabled={locked}
      tone={item.kind === 'master' && !locked ? 'gold' : 'default'}
      style={locked && styles.locked}
      accessibilityLabel={`${label} ${number}. ${title}. ${stateText}`}
    >
      <View style={styles.row}>
        <View style={[styles.number, { backgroundColor: circleColor }]}>
          {locked ? (
            <Icon name="lock" size={20} color={c.onAccent} />
          ) : done ? (
            <Icon name="check" size={22} color={c.onStatus} strokeWidth={3} />
          ) : item.kind === 'unit' ? (
            <AppText variant="heading" color={c.onAccent}>
              {number}
            </AppText>
          ) : (
            <Icon name={icon} size={22} color={circleFg} />
          )}
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyBold">{title}</AppText>
          <AppText variant="small" color={c.textMuted} numberOfLines={3}>
            {locked ? t('topic.locked') : subtitle}
          </AppText>
          {meta ? (
            <AppText variant="tiny" color={c.goldText}>
              {meta}
            </AppText>
          ) : null}
        </View>
        {!locked ? <Icon name="chevron" size={20} color={c.textMuted} /> : null}
      </View>
    </Card>
  );
}

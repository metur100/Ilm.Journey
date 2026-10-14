import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { makeStyles, spacing, useTheme } from '@/core/theme';
import { toDayKey } from '@/core/utils/date';

import { EVENTS } from '../content';
import { useSeerahI18n } from '../i18n';
import { openNode } from '../navigation';
import { todaysEvent } from '../services/daily';

const useStyles = makeStyles(() => ({
  card: { gap: spacing.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
}));

/** "Today's Seerah": one event per calendar day (dark card in both schemes). */
export function TodaysSeerahCard() {
  const { t, l } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [day] = useState(() => toDayKey(new Date()));
  const today = todaysEvent(day, EVENTS);
  if (!today) return null;
  return (
    <Card tone="dark" style={styles.card} onPress={() => openNode('event', today.id)} accessibilityLabel={`${t('home.today')}: ${l(today.title)}, ${l(today.date.label)}`}>
      <AppText variant="label" color={c.gold}>
        {t('home.today').toUpperCase()}
      </AppText>
      <AppText variant="small" color={c.onNightMuted}>
        {t(`home.todayIntro.${today.era}`)}
      </AppText>
      <AppText variant="title" color={c.onNight}>
        {l(today.title)}
      </AppText>
      <AppText variant="small" color={c.gold}>
        {l(today.date.label)}
      </AppText>
      <AppText variant="body" color={c.onNightMuted} numberOfLines={3}>
        {l(today.summary[0]?.text)}
      </AppText>
      <View style={styles.inline}>
        <AppText variant="bodyBold" color={c.gold}>
          {t('home.learnMore')}
        </AppText>
        <Icon name="chevron" size={18} color={c.gold} />
      </View>
    </Card>
  );
}

/** Home section registered with `registerHomeSection` (order 50). */
export default function TodaysSeerahSection() {
  return <TodaysSeerahCard />;
}

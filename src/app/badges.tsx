import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Badge } from '@/core/components/ui/Badge';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { TopBar } from '@/core/components/ui/TopBar';
import { badgeDescription, badgeName, type CoreKey, LOCALE_TAGS, useI18n } from '@/core/i18n';
import { BADGE_GROUPS, BADGES } from '@/core/services/badges';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

const useStyles = makeStyles(() => ({
  group: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  locked: { opacity: 0.75 },
  texts: { flex: 1, gap: 2 },
}));

/** All badges of the app, grouped (learning journey, topics, stories, Seerah). */
export default function BadgesScreen() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const badges = useAppStore((s) => s.badges);
  const earnedCount = BADGES.filter((b) => badges[b.id]).length;

  return (
    <Screen header={<TopBar title={t('badges.title')} />}>
      <AppText variant="small" color={c.textMuted} align="center">
        {t('badges.count', { earned: earnedCount, total: BADGES.length })}
      </AppText>
      {BADGE_GROUPS.map((group) => (
        <View key={group} style={styles.group}>
          <SectionHeader title={t(`badges.group.${group}` as CoreKey)} />
          {BADGES.filter((b) => b.group === group).map((b) => {
            const earnedAt = badges[b.id];
            return (
              <Card key={b.id} style={!earnedAt && styles.locked}>
                <View style={styles.row}>
                  <Badge id={b.id} earned={!!earnedAt} size={56} showLabel={false} />
                  <View style={styles.texts}>
                    <AppText variant="bodyBold">{t(badgeName(b.id))}</AppText>
                    <AppText variant="small" color={c.textMuted}>
                      {t(badgeDescription(b.id))}
                    </AppText>
                    <AppText variant="tiny" color={earnedAt ? c.success : c.textMuted}>
                      {earnedAt ? t('badges.earnedOn', { date: new Date(earnedAt).toLocaleDateString(LOCALE_TAGS[language]) }) : t('badges.locked')}
                    </AppText>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

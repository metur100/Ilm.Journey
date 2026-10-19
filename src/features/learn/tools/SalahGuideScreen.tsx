import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { SourceList } from '@/core/components/ui/SourceList';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';

import { useLearnI18n } from '../i18n';
import { PRAYER_ROWS, SALAH_GUIDE, SALAH_GUIDE_INTRO, SALAH_GUIDE_PRACTICE, SALAH_GUIDE_TABLE, SALAH_GUIDE_TITLE } from './salahGuide';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: 120 },
  hero: { gap: spacing.sm },
  body: { padding: spacing.lg, gap: spacing.md },
  bullets: { gap: spacing.xs },
  bullet: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.primary, marginTop: 8 },
  prayerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  parts: { borderRadius: radius.pill, backgroundColor: c.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  table: { gap: spacing.sm },
}));

export default function SalahGuideScreen() {
  const { t, l } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const theme = topicThemes.salah;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={theme.gradient}>
        <TopBar dark />
        <View style={styles.hero}>
          <AppText variant="display" color={c.onNight} accessibilityRole="header">
            {l(SALAH_GUIDE_TITLE)}
          </AppText>
          <AppText variant="body" color={c.onNight}>
            {l(SALAH_GUIDE_INTRO)}
          </AppText>
        </View>
      </HeroHeader>
      <View style={styles.body}>
        {SALAH_GUIDE.map((section) => (
          <Card key={section.id}>
            <AppText variant="heading" accessibilityRole="header">
              {l(section.title)}
            </AppText>
            {section.body ? <AppText variant="body">{l(section.body)}</AppText> : null}
            {section.bullets ? (
              <View style={styles.bullets}>
                {section.bullets.map((b) => (
                  <View key={l(b)} style={styles.bullet}>
                    <View style={styles.dot} />
                    <AppText variant="body" style={{ flex: 1 }}>
                      {l(b)}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ))}

        <Card>
          <AppText variant="heading" accessibilityRole="header">
            {l(SALAH_GUIDE_TABLE)}
          </AppText>
          <View style={styles.table}>
            {PRAYER_ROWS.map((prayer) => (
              <View key={prayer.id} style={{ gap: 2 }}>
                <View style={styles.prayerHead}>
                  <AppText variant="bodyBold">{l(prayer.name)}</AppText>
                  <View style={styles.parts}>
                    <AppText variant="tiny" color={c.primaryText}>
                      {prayer.parts}
                    </AppText>
                  </View>
                </View>
                <AppText variant="small" color={c.textMuted}>
                  {l(prayer.time)}
                </AppText>
                <AppText variant="small">{l(prayer.note)}</AppText>
              </View>
            ))}
          </View>
        </Card>

        <Button label={l(SALAH_GUIDE_PRACTICE)} icon="play" variant="gold" onPress={() => router.push('/(tabs)/play')} />
        <SourceList
          sources={[
            { sourceName: 'Quran', sourceReference: '4:103' },
            { sourceName: 'Sahih al-Bukhari', sourceReference: '8' },
            { sourceName: 'Sahih Muslim', sourceReference: '16' },
            { sourceName: 'Ilmihal – Islamska zajednica u BiH', sourceReference: 'Namaz' },
          ]}
        />
        <AppText variant="tiny" color={c.textMuted}>
          {t('salahGuide.teacher')}
        </AppText>
      </View>
    </ScrollView>
  );
}

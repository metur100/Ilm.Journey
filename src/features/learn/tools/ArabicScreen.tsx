import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';

import { ALPHABET } from '../content/quests';
import { useQuestI18n } from '../quests/i18n';
import { useQuestStore } from '../quests/store/questStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  heroText: { gap: spacing.xs },
  // Grids read left to right, top to bottom, like every list in the app (elif first, top left).
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start' },
  tile: {
    width: '22%',
    flexGrow: 1,
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tileDone: { borderColor: c.success, backgroundColor: c.successSoft },
  check: { position: 'absolute', top: 4, left: 4 },
}));

/** Arabic alphabet tool: all 28 letters (from the Arabic letter lessons) – tap to hear and trace. */
export default function ArabicScreen() {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const traced = useQuestStore((s) => s.tracedLetters);
  const tracedCount = ALPHABET.filter((a) => traced.includes(a.letter)).length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={topicThemes.sufara.gradient}>
        <TopBar dark />
        <View style={styles.heroText}>
          <AppText variant="display" color={c.onNight} accessibilityRole="header">
            {t('alphabet.title')}
          </AppText>
          <AppText variant="body" color={c.onNight}>
            {t('alphabet.intro')}
          </AppText>
        </View>
        <AppText variant="small" color={c.onNight}>
          {t('alphabet.traced', { count: tracedCount, total: ALPHABET.length })}
        </AppText>
        <ProgressBar progress={tracedCount / ALPHABET.length} color={c.gold} trackColor="rgba(255,255,255,0.2)" />
      </HeroHeader>

      <View style={styles.body}>
        <View style={styles.grid}>
          {ALPHABET.map((a) => {
            const done = traced.includes(a.letter);
            return (
              <Pressable
                key={a.position}
                onPress={() => router.push({ pathname: '/tools/arabic/[letter]', params: { letter: String(a.position) } })}
                accessibilityRole="button"
                accessibilityLabel={`${t('alphabet.letter', { position: a.position, total: ALPHABET.length, name: a.name })}${done ? `, ${t('alphabet.tracedBadge')}` : ''}`}
                style={({ pressed }) => [styles.tile, done && styles.tileDone, pressed && { opacity: 0.8 }]}
              >
                {done ? (
                  <View style={styles.check}>
                    <Icon name="check" size={14} color={c.success} strokeWidth={3} />
                  </View>
                ) : null}
                <AppText variant="title" script="arabic">
                  {a.letter}
                </AppText>
                <AppText variant="tiny" color={c.textMuted}>
                  {a.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="tiny" color={c.textMuted}>
          {t('alphabet.ttsNote')}
        </AppText>
      </View>
    </ScrollView>
  );
}

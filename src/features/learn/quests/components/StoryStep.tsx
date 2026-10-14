import { View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { SourceList } from '@/core/components/ui/SourceList';
import type { LocalizedText, SceneSpec, SourceRef } from '@/core/models';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';
import type { LearnedValue } from '../models';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  textCard: { backgroundColor: c.goldSoft, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: c.goldBorder },
  valueCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'flex-start',
  },
  valueNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  valueTexts: { flex: 1, gap: 2 },
}));

interface StoryStepProps {
  title?: LocalizedText;
  body: LocalizedText;
  scene: SceneSpec;
  sources?: SourceRef[];
  intro?: boolean;
}

/** Intro / story step: a symbolic illustration (never a depiction of a prophet) and narration text. */
export function StoryStep({ title, body, scene, sources, intro }: StoryStepProps) {
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <SceneView scene={scene} height={intro ? 230 : 190} />
      <View style={styles.textCard}>
        <AppText variant="label" color={c.goldText}>
          {t('player.story').toUpperCase()}
        </AppText>
        {title ? (
          <AppText variant="title" accessibilityRole="header">
            {l(title)}
          </AppText>
        ) : null}
        <AppText variant="reading">{l(body)}</AppText>
      </View>
      <SourceList sources={sources} />
    </View>
  );
}

/** "What did we learn?" summary. */
export function LearnedStep({ values }: { values: LearnedValue[] }) {
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('player.learnedTitle')}
      </AppText>
      {values.map((value, index) => (
        <View key={index} style={styles.valueCard} accessible accessibilityLabel={`${index + 1}. ${l(value.title)}. ${l(value.body)}`}>
          <View style={styles.valueNumber}>
            <AppText variant="bodyBold" color={c.onGold}>
              {index + 1}
            </AppText>
          </View>
          <View style={styles.valueTexts}>
            <AppText variant="heading">{l(value.title)}</AppText>
            <AppText variant="body" color={c.textMuted}>
              {l(value.body)}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

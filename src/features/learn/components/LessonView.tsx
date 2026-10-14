import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { buildLessonCards, TOPIC_FALLBACK_ART } from '@/core/components/lesson/cards';
import { LessonCards } from '@/core/components/lesson/LessonCards';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { DifferenceNote, SourceList } from '@/core/components/ui/SourceList';
import { deviceNarration, stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { unitCardSources } from '../content/artMap';
import { useLearnI18n } from '../i18n';
import type { Unit } from '../models';

const useStyles = makeStyles(() => ({
  root: { gap: spacing.lg },
  titleBlock: { gap: spacing.xs },
}));

/** LEARN step: a short lesson as swipeable lesson cards, with optional narration and Arabic pronunciation. */
export function LessonView({ unit }: { unit: Unit }) {
  const { t, l, language } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const narration = useAppStore((s) => s.settings.narration);
  const theme = topicThemes[unit.areaId];
  const cards = useMemo(
    () => buildLessonCards(unitCardSources(unit), { fallbackArt: TOPIC_FALLBACK_ART[unit.areaId], language }),
    [unit, language],
  );

  useEffect(() => () => stopSpeaking(), []);

  const readAloud = () =>
    deviceNarration.speak([l(unit.title), ...unit.lesson.map((s) => `${s.heading ? `${l(s.heading)}. ` : ''}${l(s.body)}`)].join('. '), language);

  return (
    <View style={styles.root}>
      <SceneView scene={theme.scene} height={140} />
      <View style={styles.titleBlock}>
        <AppText variant="label" color={c.goldText}>
          {t('unit.learn').toUpperCase()}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {l(unit.title)}
        </AppText>
        <AppText variant="body" color={c.textMuted}>
          {l(unit.description)}
        </AppText>
      </View>
      {narration ? <Button label={t('unit.readAloud')} icon="speaker" variant="secondary" onPress={readAloud} /> : null}

      <LessonCards cards={cards} accent={theme.accent} fallbackScene={theme.scene} />
      <DifferenceNote note={unit.differenceNote} />
      <SourceList sources={unit.sources} />
    </View>
  );
}

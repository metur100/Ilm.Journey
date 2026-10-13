import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { DifferenceNote, SourceList } from '@/core/components/ui/SourceList';
import { deviceNarration, speakArabic, stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';

import { useLearnI18n } from '../i18n';
import type { Unit } from '../models';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  titleBlock: { gap: spacing.xs },
  section: { gap: spacing.sm, backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: c.border },
  arabicRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.goldSoft, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  speak: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
}));

/** LEARN step: a short lesson with optional narration and Arabic pronunciation. */
export function LessonView({ unit }: { unit: Unit }) {
  const { t, l, language } = useLearnI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const narration = useAppStore((s) => s.settings.narration);

  useEffect(() => () => stopSpeaking(), []);

  const readAloud = () =>
    deviceNarration.speak([l(unit.title), ...unit.lesson.map((s) => `${s.heading ? `${l(s.heading)}. ` : ''}${l(s.body)}`)].join('. '), language);

  return (
    <View style={styles.root}>
      <SceneView scene={topicThemes[unit.areaId].scene} height={140} />
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

      {unit.lesson.map((section, index) => (
        <View key={index} style={styles.section}>
          {section.heading ? (
            <AppText variant="heading" color={c.primaryText}>
              {l(section.heading)}
            </AppText>
          ) : null}
          {section.arabic ? (
            <View style={styles.arabicRow}>
              <View style={styles.flex}>
                <AppText variant="title" script="arabic" align="center">
                  {section.arabic}
                </AppText>
                {section.transliteration ? (
                  <AppText variant="small" color={c.textMuted} align="center">
                    {section.transliteration}
                  </AppText>
                ) : null}
              </View>
              <Pressable onPress={() => speakArabic(section.arabic ?? '')} accessibilityRole="button" accessibilityLabel={t('a11y.speak')} style={styles.speak}>
                <Icon name="speaker" size={22} color={c.primaryText} />
              </Pressable>
            </View>
          ) : null}
          <AppText variant="body">{l(section.body)}</AppText>
        </View>
      ))}
      <DifferenceNote note={unit.differenceNote} />
      <SourceList sources={unit.sources} />
    </View>
  );
}

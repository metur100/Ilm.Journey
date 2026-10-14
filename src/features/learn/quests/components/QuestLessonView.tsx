import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { DifferenceNote, SourceList } from '@/core/components/ui/SourceList';
import { deviceNarration, speakArabic, stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';
import type { QuestLesson } from '../models';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  titleBlock: { gap: spacing.xs },
  section: { gap: spacing.sm, backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: c.border },
  arabicRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.goldSoft, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  speak: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: TOUCH_TARGET / 2,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/** Reader for a short islam-quest lesson: sections, optional Arabic word with pronunciation, notes and sources. */
export function QuestLessonView({ lesson }: { lesson: QuestLesson }) {
  const { t, l, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const narration = useAppStore((s) => s.settings.narration);
  const theme = topicThemes[lesson.worldId];

  useEffect(() => () => stopSpeaking(), []);

  const readAloud = () =>
    deviceNarration.speak(
      [l(lesson.title), l(lesson.summary), ...lesson.sections.map((s) => `${s.heading ? `${l(s.heading)}. ` : ''}${l(s.body)}`)].join('. '),
      language,
    );

  return (
    <View style={styles.root}>
      <SceneView scene={lesson.scene ?? theme.scene} height={140} />
      <View style={styles.titleBlock}>
        <AppText variant="label" color={c.goldText}>
          {t('lesson.label').toUpperCase()}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {l(lesson.title)}
        </AppText>
        <AppText variant="body" color={c.textMuted}>
          {l(lesson.summary)}
        </AppText>
      </View>
      {narration ? <Button label={t('lesson.readAloud')} icon="speaker" variant="secondary" onPress={readAloud} /> : null}

      {lesson.sections.map((section, index) => (
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
              <Pressable
                onPress={() => speakArabic(section.arabic ?? '')}
                accessibilityRole="button"
                accessibilityLabel={`${t('a11y.speak')}: ${section.transliteration ?? ''}`}
                style={styles.speak}
                hitSlop={6}
              >
                <Icon name="speaker" size={22} color={c.primaryText} />
              </Pressable>
            </View>
          ) : null}
          <AppText variant="body">{l(section.body)}</AppText>
        </View>
      ))}

      <DifferenceNote note={lesson.differenceNote} />
      <SourceList sources={lesson.sources} />
    </View>
  );
}

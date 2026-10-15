import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { YUSUF_EVENTS } from './content';
import { nextEventChoices, storyPathResult, type YusufPathConfig } from './logic';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.md },
  progress: { gap: spacing.xs },
  stage: { minHeight: 200, borderRadius: radius.lg, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md },
  trail: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
  stop: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  stopDone: { borderColor: c.success, backgroundColor: c.success },
  choices: { gap: spacing.sm },
  choice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 72, padding: spacing.sm, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border },
  choiceArt: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  choiceText: { flex: 1 },
  feedback: { minHeight: 24 },
}));

export function YusufStoryPathGame({ config, onComplete, playSound, haptic, t, l }: GameApi<YusufPathConfig>) {
  const styles = useStyles();
  const { c } = useTheme();
  const [placed, setPlaced] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState('');
  const finished = useRef(false);
  const step = placed.length;
  const choices = nextEventChoices(config.events, step);
  const complete = step >= config.events.length;
  const lastEvent = step > 0 ? YUSUF_EVENTS.find((event) => event.id === placed[step - 1]) : undefined;

  const choose = (eventId: string) => {
    if (complete || finished.current) return;
    const choice = choices.find((item) => item.event.id === eventId);
    if (!choice) return;
    if (!choice.correct) {
      setMistakes((count) => count + 1);
      setFeedback(t('play.tryAgain'));
      haptic('warning');
      playSound('failure');
      return;
    }
    const next = [...placed, eventId];
    setPlaced(next);
    setFeedback(t('play.correct'));
    haptic('success');
    playSound(next.length === config.events.length ? 'reward' : 'success');
    if (next.length === config.events.length) {
      finished.current = true;
      onComplete(storyPathResult(config, mistakes));
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.progress}>
        <AppText variant="label" color={c.goldText}>{t('play.progress', { current: Math.min(step + 1, config.events.length), total: config.events.length })}</AppText>
        <ProgressBar progress={step / config.events.length} color={c.gold} />
      </View>
      <View style={styles.stage}>
        <AppText variant="heading" align="center">{t('play.prompt')}</AppText>
        <View style={styles.trail}>
          {config.events.map((id, index) => <View key={id} style={[styles.stop, index < step && styles.stopDone]} />)}
        </View>
        {lastEvent ? <AppText variant="small" color={c.textMuted} align="center">{l(lastEvent.text)}</AppText> : null}
      </View>
      <ScrollView contentContainerStyle={styles.choices}>
        {choices.map(({ event }) => (
          <Pressable key={event.id} onPress={() => choose(event.id)} accessibilityRole="button" accessibilityLabel={l(event.title)} style={styles.choice}>
            <View style={styles.choiceArt}><Art name={event.art} size={52} /></View>
            <View style={styles.choiceText}>
              <AppText variant="bodyBold">{l(event.title)}</AppText>
              <AppText variant="tiny" color={c.textMuted} numberOfLines={2}>{l(event.text)}</AppText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <AppText variant="small" color={c.goldText} accessibilityLiveRegion="polite">{feedback}</AppText>
    </View>
  );
}
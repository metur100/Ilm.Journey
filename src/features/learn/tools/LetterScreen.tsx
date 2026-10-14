import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { speakArabic, stopSpeaking } from '@/core/services/speech';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { ALPHABET, getLetter } from '../content/quests';
import { TracingPad } from '../quests/components/TracingPad';
import { useQuestI18n } from '../quests/i18n';
import { useQuestStore } from '../quests/store/questStore';

const useStyles = makeStyles(() => ({
  header: { alignItems: 'center', gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
}));

/** One letter: pronunciation (device TTS, offline) and tracing. */
export default function LetterScreen() {
  const { letter: param } = useLocalSearchParams<{ letter: string }>();
  const { t, l } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  useStatusBar(false);
  const markLetterTraced = useQuestStore((s) => s.markLetterTraced);
  const traced = useQuestStore((s) => s.tracedLetters);
  const letter = getLetter(Number(param));

  useEffect(() => () => stopSpeaking(), []);

  if (!letter) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="letter" title={t('alphabet.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const go = (position: number) => router.replace({ pathname: '/tools/arabic/[letter]', params: { letter: String(position) } });
  const prev = letter.position > 1 ? letter.position - 1 : null;
  const next = letter.position < ALPHABET.length ? letter.position + 1 : null;

  return (
    <Screen header={<TopBar title={t('alphabet.title')} />}>
      <View style={styles.header}>
        <AppText variant="label" color={c.goldText}>
          {t('alphabet.letter', { position: letter.position, total: ALPHABET.length, name: letter.name }).toUpperCase()}
        </AppText>
        <AppText variant="display" script="arabic" accessibilityRole="header" accessibilityLabel={letter.name}>
          {letter.letter}
        </AppText>
        <AppText variant="heading">{letter.name}</AppText>
      </View>
      <Card tone="gold">
        <AppText variant="body">{l(letter.description)}</AppText>
      </Card>
      <Button label={t('alphabet.listen')} icon="speaker" variant="secondary" onPress={() => speakArabic(letter.letter)} />

      <AppText variant="heading" accessibilityRole="header">
        {t('tracing.title')}
      </AppText>
      <AppText variant="small" color={c.textMuted}>
        {t('tracing.hint')}
        {traced.includes(letter.letter) ? ` · ${t('alphabet.tracedBadge')} ✓` : ''}
      </AppText>
      <TracingPad key={letter.position} letter={letter.letter} onTraced={() => markLetterTraced(letter.letter)} />

      <View style={styles.row}>
        <View style={styles.cell}>{prev ? <Button label={t('alphabet.prev')} icon="back" variant="ghost" onPress={() => go(prev)} /> : null}</View>
        <View style={styles.cell}>{next ? <Button label={t('alphabet.next')} iconRight="chevron" variant="primary" onPress={() => go(next)} /> : null}</View>
      </View>
      <AppText variant="tiny" color={c.textMuted}>
        {t('alphabet.ttsNote')}
      </AppText>
    </Screen>
  );
}

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { ProgressDots, useKitColors } from '@/core/games/kit';
import type { Language } from '@/core/models';
import { fonts, radius, spacing } from '@/core/theme';

import { listenLabels, qt } from './i18n';
import { ayah, surahName } from './quran';
import { ListenChip } from './recitation';

export interface AyahCardProps {
  surah: number;
  ayah: number;
  language: Language;
  /** Rounds of the level (dots). */
  round?: { index: number; total: number };
  /** Show the translation (default true). */
  meaning?: boolean;
  /** Show the Arabic ayah (verified data text). */
  arabic?: boolean;
  /** Offer the streamed recitation (default true). */
  listen?: boolean;
}

/**
 * The calligraphy card above a Quran board: surah and ayah number, the translation of the data, optionally the
 * Arabic text and a Listen chip. Never a title of its own – the shell header has the game title.
 */
export function AyahCard({ surah: s, ayah: a, language, round, meaning = true, arabic, listen = true }: AyahCardProps) {
  const k = useKitColors();
  const data = ayah(s, a);
  return (
    <View style={[styles.card, { backgroundColor: k.tileFace, borderColor: k.goldEdge }]} testID="ayah-card">
      <View style={styles.top}>
        <AppText variant="tiny" color={k.accentText} style={{ fontFamily: fonts.heavy }}>
          {qt(language, 'surahAyah', { name: surahName(s), number: a })}
        </AppText>
        {round ? <ProgressDots total={round.total} done={round.index} /> : null}
      </View>
      {arabic ? (
        <AppText script="quran" align="center" color={k.text} style={{ fontFamily: fonts.quran, fontSize: 24, lineHeight: 46, writingDirection: 'rtl' }}>
          {data.arabic}
        </AppText>
      ) : null}
      {meaning ? (
        <AppText variant="small" align="center" color={k.textMuted}>
          {`“${data.translation[language]}”`}
        </AppText>
      ) : null}
      {listen ? <ListenChip ayahs={[data.globalNumber]} labels={listenLabels(language)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.sm, gap: spacing.xs },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: 20 },
});

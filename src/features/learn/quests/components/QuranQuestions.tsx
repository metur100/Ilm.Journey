import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AnswerOption, type OptionState } from '@/core/components/game/AnswerOption';
import { SequenceBuilder } from '@/core/components/questions/SequenceBuilder';
import { AppText } from '@/core/components/ui/AppText';
import { useI18n } from '@/core/i18n';
import type { AyahOrderQuestion as AyahOrder, MissingWordQuestion as MissingWord } from '@/core/models';
import type { QuestionComponentProps } from '@/core/registry';
import { evaluateAnswer } from '@/core/services/quiz';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';
import { getAyah, getSurah } from '@/features/quran';

import { missingWordPuzzle } from '../services/memorization';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  ayahBox: { backgroundColor: c.goldSoft, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: c.goldBorder },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%', flexGrow: 1 },
}));

/** Shows a verified ayah (from `@/features/quran`) with one word hidden; the learner picks the missing word. */
export function MissingWordQuestion({ question, onAnswered, locked }: QuestionComponentProps<MissingWord>) {
  const { t, l } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [picked, setPicked] = useState<string | null>(null);
  const puzzle = useMemo(
    () => missingWordPuzzle(question.surahNumber, question.ayahNumber, question.missingWordIndex),
    [question.surahNumber, question.ayahNumber, question.missingWordIndex],
  );
  const ayah = getAyah(question.surahNumber, question.ayahNumber);
  const choices = useMemo(() => (puzzle ? shuffle(puzzle.choices, seededRandom(hashString(question.id))) : []), [puzzle, question.id]);
  if (!puzzle || !ayah) return null;

  const choose = (word: string) => {
    if (picked || locked) return;
    setPicked(word);
    onAnswered({ correct: evaluateAnswer(question, { type: 'word', word }, { missingWord: puzzle.answer }), correctAnswer: puzzle.answer });
  };

  const stateFor = (word: string): OptionState => {
    if (!picked) return 'idle';
    if (word === puzzle.answer) return 'correct';
    if (word === picked) return 'incorrect';
    return 'dimmed';
  };

  const display = puzzle.words.map((w, i) => (i === question.missingWordIndex ? (picked ? puzzle.answer : '﴾ … ﴿') : w)).join(' ');

  return (
    <View style={styles.root}>
      <View style={styles.ayahBox}>
        <AppText variant="title" script="quran" align="center">
          {display}
        </AppText>
        <AppText variant="small" align="center" color={c.textMuted}>
          {ayah.transliteration}
        </AppText>
        <AppText variant="small" align="center" color={c.textMuted}>
          “{l(ayah.translation)}” ({question.surahNumber}:{question.ayahNumber})
        </AppText>
      </View>
      <AppText variant="small" color={c.textMuted}>
        {t('q.missingWord.hint')}
      </AppText>
      <View style={styles.grid}>
        {choices.map((word) => (
          <View key={word} style={styles.cell}>
            <AnswerOption label={word} script="quran" state={stateFor(word)} onPress={() => choose(word)} disabled={!!picked || locked} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Ayah ordering for memorisation, built from the verified Quran text. */
export function AyahOrderQuestion({ question, onAnswered, locked }: QuestionComponentProps<AyahOrder>) {
  const { t } = useI18n();
  const surah = getSurah(question.surahNumber);
  const items = useMemo(() => (surah ? surah.ayahs.map((a) => ({ id: String(a.numberInSurah), label: a.arabic })) : []), [surah]);
  if (!surah) return null;
  return (
    <SequenceBuilder
      items={items}
      seedKey={question.id}
      hint={t('q.ayahOrder.hint')}
      locked={locked}
      script="quran"
      revealCorrect
      onSubmit={(ids) =>
        onAnswered({
          correct: evaluateAnswer(question, { type: 'order', ids }, { ayahCount: surah.ayahCount }),
          correctAnswer: surah.nameTransliterated,
        })
      }
    />
  );
}

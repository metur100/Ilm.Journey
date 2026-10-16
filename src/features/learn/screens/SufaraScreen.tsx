import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { SourceList } from '@/core/components/ui/SourceList';
import { TopBar } from '@/core/components/ui/TopBar';
import { Icon } from '@/core/components/ui/Icon';
import { getGame, useGamesStore } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { useAppStore } from '@/core/store/appStore';
import { XP } from '@/core/services/xp';
import { speakArabic } from '@/core/services/speech';
import { LETTER_POSITIONS, letterForm } from '@/features/games/sections/arabic/shared/script';
import { HARAKA_NAMES, LETTERS } from '@/features/games/sections/arabic/shared/letters';
import { LANGUAGE_SOURCES, type Language } from '@/core/models';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { gameStars, HARAKA_VOWEL, letterChoices, SUFARA_PATH, type SufaraStage, vowelChoices } from '../sufara/logic';

type Copy = {
  title: string;
  intro: string;
  progress: (done: number) => string;
  exercise: (number: number) => string;
  identify: (name: string) => string;
  vowel: (name: string, sound: string) => string;
  form: Record<(typeof LETTER_POSITIONS)[number], string>;
  haraka: Record<(typeof HARAKA_NAMES)[number], string>;
  listenLetter: string;
  listenSyllable: string;
  correct: string;
  tryAgain: string;
  next: string;
  complete: string;
  allComplete: string;
  restart: string;
  source: string;
  pathTitle: string;
  pathIntro: string;
  practiceTitle: string;
  stage: Record<SufaraStage, string>;
  stars: (n: number) => string;
};

const COPY: Record<Language, Copy> = {
  bs: {
    title: 'Sufara',
    intro: '28 harfova, njihovi oblici u riječi i kratke vježbe s fethom, kesrom i dammom. Za pravilan izgovor uči i s kvalifikovanim učiteljem.',
    progress: (done) => `${done} od 28 harfova završeno`,
    exercise: (number) => `Vježba ${number} od 4`,
    identify: (name) => `Pronađi harf: ${name}`,
    vowel: (name, sound) => `Izaberi slog s ${name}: ${sound}`,
    form: { isolated: 'Samostalno', initial: 'Na početku', medial: 'U sredini', final: 'Na kraju' },
    haraka: { fatha: 'fetha', kasra: 'kesra', damma: 'damma' },
    listenLetter: 'Poslušaj harf',
    listenSyllable: 'Poslušaj slog',
    correct: 'Tačno',
    tryAgain: 'Pokušaj ponovo',
    next: 'Sljedeći harf',
    complete: 'Završio si vježbe za ovaj harf.',
    allComplete: 'Prešao si svih 28 harfova.',
    restart: 'Ponovi od početka',
    source: 'Izvor: standardno arapsko pismo; lekcija Arapski harfovi i hareketi.',
    pathTitle: 'Put sufare',
    pathIntro: 'Igre iz sekcije Arapski / Sufara, redom: harfovi, oblici, spajanje harfova, hareketi i čitanje.',
    practiceTitle: 'Vježba harf po harf',
    stage: { letters: '1 · Harfovi', shapes: '2 · Tačke i oblici', joining: '3 · Spajanje harfova', harakat: '4 · Hareketi', reading: '5 · Čitanje' },
    stars: (n) => `${n} od 9 zvjezdica`,
  },
  de: {
    title: 'Sufara',
    intro: '28 Buchstaben, ihre Wortformen und kurze Übungen zu Fatha, Kasra und Damma. Für die richtige Aussprache übe auch mit einer qualifizierten Lehrkraft.',
    progress: (done) => `${done} von 28 Buchstaben abgeschlossen`,
    exercise: (number) => `Übung ${number} von 4`,
    identify: (name) => `Finde den Buchstaben: ${name}`,
    vowel: (name, sound) => `Wähle die Silbe mit ${name}: ${sound}`,
    form: { isolated: 'Einzeln', initial: 'Am Anfang', medial: 'In der Mitte', final: 'Am Ende' },
    haraka: { fatha: 'Fatha', kasra: 'Kasra', damma: 'Damma' },
    listenLetter: 'Buchstaben anhören',
    listenSyllable: 'Silbe anhören',
    correct: 'Richtig',
    tryAgain: 'Versuche es noch einmal',
    next: 'Nächster Buchstabe',
    complete: 'Du hast die Übungen für diesen Buchstaben abgeschlossen.',
    allComplete: 'Du hast alle 28 Buchstaben geübt.',
    restart: 'Von vorn wiederholen',
    source: 'Quelle: standardarabische Schrift; Lektionen Arabische Buchstaben und Harakat.',
    pathTitle: 'Der Sufara-Pfad',
    pathIntro: 'Die Spiele des Bereichs Arabisch / Sufara der Reihe nach: Buchstaben, Formen, Verbinden, Harakat und Lesen.',
    practiceTitle: 'Übung Buchstabe für Buchstabe',
    stage: { letters: '1 · Buchstaben', shapes: '2 · Punkte und Formen', joining: '3 · Buchstaben verbinden', harakat: '4 · Harakat', reading: '5 · Lesen' },
    stars: (n) => `${n} von 9 Sternen`,
  },
  en: {
    title: 'Sufara',
    intro: 'Learn all 28 letters, their word forms, and short exercises with fatha, kasra and damma. Practise pronunciation with a qualified teacher too.',
    progress: (done) => `${done} of 28 letters completed`,
    exercise: (number) => `Exercise ${number} of 4`,
    identify: (name) => `Find the letter: ${name}`,
    vowel: (name, sound) => `Choose the syllable with ${name}: ${sound}`,
    form: { isolated: 'Alone', initial: 'At the start', medial: 'In the middle', final: 'At the end' },
    haraka: { fatha: 'fatha', kasra: 'kasra', damma: 'damma' },
    listenLetter: 'Listen to letter',
    listenSyllable: 'Listen to syllable',
    correct: 'Correct',
    tryAgain: 'Try again',
    next: 'Next letter',
    complete: 'You finished the exercises for this letter.',
    allComplete: 'You practised all 28 letters.',
    restart: 'Review from the start',
    source: 'Source: standard Arabic script; Arabic Letters and Harakat lessons.',
    pathTitle: 'The sufara path',
    pathIntro: 'The games of Arabic / Sufara in order: letters, shapes, joining the letters, harakat and reading.',
    practiceTitle: 'Letter-by-letter practice',
    stage: { letters: '1 · Letters', shapes: '2 · Dots and shapes', joining: '3 · Joining the letters', harakat: '4 · Harakat', reading: '5 · Reading' },
    stars: (n) => `${n} of 9 stars`,
  },
};

const useStyles = makeStyles((c) => ({
  body: { gap: spacing.md },
  summary: { gap: spacing.sm },
  letterStrip: { gap: spacing.xs, paddingRight: spacing.lg },
  letterChip: { minWidth: 48, minHeight: 48, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  complete: { borderColor: c.success, backgroundColor: c.successSoft },
  letter: { alignItems: 'center', gap: spacing.xs },
  arabic: { fontSize: 72, lineHeight: 104, textAlign: 'center', writingDirection: 'rtl' },
  forms: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  form: { minWidth: 64, alignItems: 'center', gap: 2 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  choice: { minWidth: 84, minHeight: 76, padding: spacing.sm, borderWidth: 1.5, borderColor: c.border, borderRadius: radius.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  choiceArabic: { fontSize: 40, lineHeight: 56, writingDirection: 'rtl' },
  feedback: { minHeight: 24 },
  path: { gap: spacing.sm },
  stage: { gap: spacing.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  stepText: { flex: 1, gap: 2 },
  stepDone: { borderColor: c.success },
}));

export default function SufaraScreen() {
  const { c } = useTheme();
  const styles = useStyles();
  const settings = useAppStore((s) => s.settings);
  const xpAwards = useAppStore((s) => s.xpAwards);
  const games = useGamesStore((s) => s.games);
  const awardXp = useAppStore((s) => s.awardXp);
  const registerActivity = useAppStore((s) => s.registerActivity);
  const language = settings.language;
  const copy = COPY[language];
  const [position, setPosition] = useState(1);
  const [stage, setStage] = useState<'identify' | 'vowel' | 'complete'>('identify');
  const [vowelIndex, setVowelIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const current = LETTERS[position - 1];
  const done = LETTERS.filter((item) => !!xpAwards[`sufara:letter:${item.position}`]).length;
  const letterOptions = letterChoices(position, language);
  const vowels = vowelChoices(current.letter, vowelIndex + 1);
  const challengeNumber = stage === 'identify' ? 1 : stage === 'vowel' ? vowelIndex + 2 : 4;

  const finishLetter = () => {
    const earned = awardXp(`sufara:letter:${position}`, XP.reviewCorrect);
    if (earned > 0) registerActivity();
    setStage('complete');
    setFeedback(copy.complete);
  };

  const chooseLetter = (letter: string) => {
    if (letter !== current.letter) {
      setFeedback(copy.tryAgain);
      return;
    }
    setFeedback(copy.correct);
    setStage('vowel');
    setVowelIndex(0);
  };

  const chooseVowel = (haraka: string) => {
    if (haraka !== vowels.target) {
      setFeedback(copy.tryAgain);
      return;
    }
    setFeedback(copy.correct);
    if (vowelIndex + 1 >= HARAKA_NAMES.length) finishLetter();
    else setVowelIndex((index) => index + 1);
  };

  const nextLetter = () => {
    setFeedback('');
    setVowelIndex(0);
    if (position === LETTERS.length) {
      setPosition(1);
      setStage('identify');
      return;
    }
    setPosition((index) => index + 1);
    setStage('identify');
  };

  return (
    <Screen header={<TopBar title={copy.title} />} contentStyle={styles.body}>
      <View style={styles.summary}>
        <AppText variant="small" color={c.textMuted}>{copy.intro}</AppText>
        <AppText variant="label" color={c.goldText}>{copy.progress(done)}</AppText>
        <ProgressBar progress={done / LETTERS.length} color={c.gold} />
      </View>

      <View style={styles.path}>
        <AppText variant="heading">{copy.pathTitle}</AppText>
        <AppText variant="small" color={c.textMuted}>{copy.pathIntro}</AppText>
        {SUFARA_PATH.map(({ stage, games: ids }) => (
          <View key={stage} style={styles.stage}>
            <AppText variant="label" color={c.goldText}>{copy.stage[stage]}</AppText>
            {ids.map((id) => {
              const game = getGame(id);
              if (!game) return null;
              const stars = gameStars(games[id]?.levels);
              const title = translateNs(game.i18n, language, 'title');
              return (
                <Pressable
                  key={id}
                  onPress={() => router.push({ pathname: '/game/[id]', params: { id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${title}, ${copy.stars(stars)}`}
                  testID={`sufara-game-${id}`}
                  style={[styles.step, stars >= 9 && styles.stepDone]}
                >
                  <View style={styles.stepText}>
                    <AppText variant="bodyBold">{title}</AppText>
                    <AppText variant="tiny" color={c.textMuted}>{copy.stars(stars)}</AppText>
                  </View>
                  <Icon name="chevron" size={20} color={c.textMuted} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <AppText variant="heading">{copy.practiceTitle}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.letterStrip}>
        {LETTERS.map((item) => {
          const selected = item.position === position;
          const finished = !!xpAwards[`sufara:letter:${item.position}`];
          return (
            <Pressable
              key={item.letter}
              onPress={() => { setPosition(item.position); setStage(finished ? 'complete' : 'identify'); setVowelIndex(0); setFeedback(''); }}
              accessibilityRole="button"
              accessibilityLabel={`${item.name[language]} ${copy.progress(finished ? 1 : 0)}`}
              style={[styles.letterChip, selected && styles.selected, finished && styles.complete]}
            >
              <AppText variant="bodyBold">{item.letter}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card>
        <View style={styles.letter}>
          <AppText variant="tiny" color={c.textMuted}>{copy.exercise(challengeNumber)}</AppText>
          {stage === 'identify' ? (
            <>
              <AppText variant="heading" align="center">{copy.identify(current.name[language])}</AppText>
              <Button label={copy.listenLetter} variant="secondary" icon="speaker" onPress={() => speakArabic(current.letter)} size="md" />
              <View style={styles.choices}>
                {letterOptions.map((option) => (
                  <Pressable key={option.letter} onPress={() => chooseLetter(option.letter)} accessibilityRole="button" accessibilityLabel={option.name} style={styles.choice}>
                    <AppText style={styles.choiceArabic}>{option.letter}</AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : stage === 'vowel' ? (
            <>
              <AppText style={styles.arabic}>{current.letter}</AppText>
              <AppText variant="heading" align="center">{copy.vowel(copy.haraka[vowels.target], HARAKA_VOWEL[vowels.target].vowel[language])}</AppText>
              <Button label={copy.listenSyllable} variant="secondary" icon="speaker" onPress={() => speakArabic(vowels.choices.find((choice) => choice.correct)!.text)} size="md" />
              <View style={styles.choices}>
                {vowels.choices.map((choice) => (
                  <Pressable key={choice.haraka} onPress={() => chooseVowel(choice.haraka)} accessibilityRole="button" accessibilityLabel={copy.haraka[choice.haraka]} style={styles.choice}>
                    <AppText style={styles.choiceArabic}>{choice.text}</AppText>
                  </Pressable>
                ))}
              </View>
              <View style={styles.forms}>
                {LETTER_POSITIONS.map((form) => (
                  <View key={form} style={styles.form}>
                    <AppText variant="tiny" color={c.textMuted}>{copy.form[form]}</AppText>
                    <AppText variant="bodyBold">{letterForm(current.letter, form)}</AppText>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <AppText style={styles.arabic}>{current.letter}</AppText>
              <AppText variant="heading" align="center">{current.name[language]}</AppText>
              <AppText variant="body" align="center">{copy.complete}</AppText>
              <View style={styles.forms}>
                {LETTER_POSITIONS.map((form) => (
                  <View key={form} style={styles.form}>
                    <AppText variant="tiny" color={c.textMuted}>{copy.form[form]}</AppText>
                    <AppText variant="bodyBold">{letterForm(current.letter, form)}</AppText>
                  </View>
                ))}
              </View>
              <Button label={position === LETTERS.length ? copy.restart : copy.next} iconRight="chevron" onPress={nextLetter} />
            </>
          )}
          <AppText variant="small" color={feedback === copy.correct ? c.success : c.goldText} style={styles.feedback} accessibilityLiveRegion="polite">
            {feedback}
          </AppText>
        </View>
      </Card>
      <SourceList sources={[LANGUAGE_SOURCES.alphabet]} />
    </Screen>
  );
}
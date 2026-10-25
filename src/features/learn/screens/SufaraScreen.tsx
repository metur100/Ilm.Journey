import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SourceList } from '@/core/components/ui/SourceList';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { LANGUAGE_SOURCES } from '@/core/models';
import { speakArabic, stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';
import { LETTER_POSITIONS, letterForm } from '@/features/games/sections/arabic/shared/script';

import { buildTopicPath, pathItemHref } from '../path';
import { TracingPad, useScreenReader } from '../quests/components/TracingPad';
import { useQuestStore } from '../quests/store/questStore';
import { useLearnStore } from '../store/learnStore';
import { COURSE_LETTERS, courseLetter, FORM_LETTERS, getSufaraLesson, LAM_ELIF, lessonExercises, lessonReading, markExamples, SUFARA_LESSONS, type SufaraExercise, type SufaraLesson } from '../sufara/course';
import { lessonExplanation, lessonTitle, SUFARA_COPY } from '../sufara/copy';
import type { ReadingRow } from '../sufara/reading';
import { sufaraTarget } from '../sufara/register';

type Step = { kind: 'letter'; letter: string } | { kind: 'trace'; letter: string } | { kind: 'explain' } | { kind: 'read'; rows: ReadingRow[] } | { kind: 'exercise'; exercise: SufaraExercise } | { kind: 'done' };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
  center: { alignItems: 'center', gap: spacing.xs },
  big: { fontSize: 88, lineHeight: 150, textAlign: 'center', writingDirection: 'rtl' },
  show: { fontSize: 64, lineHeight: 120, textAlign: 'center', writingDirection: 'rtl' },
  forms: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  form: { minWidth: 70, alignItems: 'center', gap: 2, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
  formText: { fontSize: 34, lineHeight: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  example: { minWidth: 76, minHeight: 76, padding: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  exampleText: { fontSize: 32, lineHeight: 58 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  choice: { minWidth: 92, minHeight: 76, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 2, borderColor: c.border, borderRadius: radius.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  choiceRight: { borderColor: c.success, backgroundColor: c.successSoft },
  choiceWrong: { borderColor: c.error, backgroundColor: c.errorSoft, opacity: 0.7 },
  choiceArabic: { fontSize: 38, lineHeight: 70 },
  readRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.xs, borderBottomWidth: 1, borderColor: c.border },
  readItem: { minWidth: 64, minHeight: 64, paddingHorizontal: spacing.sm, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  readItemOpen: { backgroundColor: c.surfaceAlt },
  readText: { fontSize: 34, lineHeight: 62 },
  feedback: { minHeight: 24 },
}));

/** Route `/sufara?lesson=…`: one lesson of the Sufara course. Without a lesson it opens the Sufara topic. */
export default function SufaraScreen() {
  const { lesson: param } = useLocalSearchParams<{ lesson?: string }>();
  if (!param) return <Redirect href={{ pathname: '/topic/[id]', params: { id: 'sufara' } }} />;
  // Keyed by id so "next lesson" starts with fresh state.
  return <LessonGate key={param} id={param} />;
}

function useCopy() {
  const language = useAppStore((s) => s.settings.language);
  return { language, copy: SUFARA_COPY[language] };
}

function LessonGate({ id }: { id: string }) {
  const { copy, language } = useCopy();
  const styles = useStyles();
  useStatusBar(false);
  const lesson = getSufaraLesson(id);
  const [status] = useState(() => (lesson ? (buildTopicPath('sufara', useLearnStore.getState()).find((e) => e.item.id === lesson.id)?.status ?? 'locked') : 'locked'));

  if (!lesson) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar />
        <EmptyState icon="letter" title={copy.notFound} />
      </SafeAreaView>
    );
  }
  if (status === 'locked') {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar title={lessonTitle(lesson)[language]} />
        <View style={styles.content}>
          <LockedContent message={copy.locked} />
          <Button label={copy.backToTopic} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }
  return <LessonPlayer lesson={lesson} />;
}

/** Steps of a lesson: each new letter (meet it, write it) or the explanation, the reading page, then the practice, then the end. */
function lessonSteps(lesson: SufaraLesson, exercises: SufaraExercise[], rows: ReadingRow[]): Step[] {
  const intro: Step[] = lesson.kind === 'letters' ? lesson.letters.flatMap((letter): Step[] => [{ kind: 'letter', letter }, { kind: 'trace', letter }]) : [{ kind: 'explain' }];
  const reading: Step[] = rows.length ? [{ kind: 'read', rows }] : [];
  return [...intro, ...reading, ...exercises.map((exercise): Step => ({ kind: 'exercise', exercise })), { kind: 'done' }];
}

function LessonPlayer({ lesson }: { lesson: SufaraLesson }) {
  const { copy, language } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const visit = useLearnStore((s) => s.visit);
  const steps = useMemo(() => lessonSteps(lesson, lessonExercises(lesson, language), lessonReading(lesson, language)), [lesson, language]);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const step = steps[Math.min(index, steps.length - 1)];
  const theme = topicThemes.sufara;

  useEffect(() => {
    visit('sufara', lesson.id);
  }, [lesson.id, visit]);
  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/topic/[id]', params: { id: 'sufara' } }));
  const total = steps.length - 1;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TopBar backIcon="close" onBack={close} title={copy.lesson(lesson.number)} />
        <View style={styles.progressRow}>
          <ProgressBar progress={Math.min(index, total) / total} color={theme.accent} style={styles.flex} accessibilityLabel={copy.step(Math.min(index + 1, total), total)} />
          <AppText variant="tiny" color={c.textMuted}>
            {Math.min(index + 1, total)}/{total}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step.kind === 'letter' ? <LetterStep key={`l-${index}`} letter={step.letter} onNext={next} /> : null}
        {step.kind === 'trace' ? <TraceStep key={`t-${index}`} letter={step.letter} onNext={next} /> : null}
        {step.kind === 'explain' ? <ExplainStep lesson={lesson} onNext={next} /> : null}
        {step.kind === 'read' ? <ReadStep key={`r-${index}`} rows={step.rows} onNext={next} /> : null}
        {step.kind === 'exercise' ? <ExerciseStep key={`e-${index}`} exercise={step.exercise} onNext={next} /> : null}
        {step.kind === 'done' ? <DoneStep lesson={lesson} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/** The forms of a letter in a word (lam-elif: alone and at the end, the only places it can stand). */
function LetterForms({ letter }: { letter: string }) {
  const { copy } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const positions = letter === LAM_ELIF ? (['isolated', 'final'] as const) : LETTER_POSITIONS;
  return (
    <View style={styles.forms}>
      {positions.map((position) => (
        <View key={position} style={styles.form}>
          <AppText script="arabic" style={styles.formText}>
            {letterForm(letter, position)}
          </AppText>
          <AppText variant="tiny" color={c.textMuted}>
            {copy.position[position]}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function LetterStep({ letter, onNext }: { letter: string; onNext: () => void }) {
  const { copy, language } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const info = courseLetter(letter);

  useEffect(() => {
    speakArabic(letter);
  }, [letter]);

  return (
    <>
      <View style={styles.center}>
        <AppText variant="label" color={c.goldText}>
          {copy.meet.toUpperCase()}
        </AppText>
        <AppText script="arabic" style={styles.big} accessibilityLabel={info.name[language]}>
          {letter}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {info.name[language]}
        </AppText>
      </View>
      <Card tone="gold">
        <AppText variant="body">{info.line[language]}</AppText>
      </Card>
      <Button label={copy.listen} icon="speaker" variant="secondary" onPress={() => speakArabic(letter)} />
      <AppText variant="heading">{copy.forms}</AppText>
      <LetterForms letter={letter} />
      <AppText variant="tiny" color={c.textMuted}>
        {copy.teacher}
      </AppText>
      <Button label={copy.next} iconRight="chevron" onPress={onNext} />
    </>
  );
}

function TraceStep({ letter, onNext }: { letter: string; onNext: () => void }) {
  const { copy } = useCopy();
  const { c } = useTheme();
  const feedback = useFeedback();
  const screenReader = useScreenReader();
  const markLetterTraced = useQuestStore((s) => s.markLetterTraced);
  const [traced, setTraced] = useState(false);

  return (
    <>
      <AppText variant="title" accessibilityRole="header">
        {copy.traceTitle}
      </AppText>
      <AppText variant="body" color={c.textMuted}>
        {copy.traceHint}
      </AppText>
      <TracingPad
        letter={letter}
        onChange={setTraced}
        onTraced={() => {
          feedback.success();
          markLetterTraced(letter);
        }}
      />
      <Button label={copy.next} iconRight="chevron" onPress={onNext} disabled={!traced && !screenReader} />
    </>
  );
}

function ExplainStep({ lesson, onNext }: { lesson: SufaraLesson; onNext: () => void }) {
  const { copy, language } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const explanation = lessonExplanation(lesson, language);
  const examples = markExamples(lesson.kind, language);

  return (
    <>
      <AppText variant="title" accessibilityRole="header">
        {lessonTitle(lesson)[language]}
      </AppText>
      {explanation?.mark ? (
        <AppText script="arabic" style={styles.show}>
          {explanation.mark}
        </AppText>
      ) : null}
      {explanation ? (
        <Card tone="gold">
          <AppText variant="body">{explanation.text}</AppText>
        </Card>
      ) : null}
      {lesson.kind === 'review' ? (
        <View style={styles.grid}>
          {COURSE_LETTERS.map((letter) => (
            <Pressable key={letter} onPress={() => speakArabic(letter)} accessibilityRole="button" accessibilityLabel={courseLetter(letter).name[language]} style={styles.example}>
              <AppText script="arabic" style={styles.exampleText}>
                {letter}
              </AppText>
              <AppText variant="tiny" color={c.textMuted}>
                {courseLetter(letter).name[language]}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {lesson.kind === 'forms'
        ? FORM_LETTERS.slice(0, 3).map((letter) => (
            <View key={letter} style={styles.center}>
              <AppText variant="bodyBold">{courseLetter(letter).name[language]}</AppText>
              <LetterForms letter={letter} />
            </View>
          ))
        : null}
      {examples.length > 0 ? (
        <>
          <AppText variant="heading">{copy.examples}</AppText>
          <View style={styles.grid}>
            {examples.map((example) => (
              <Pressable key={example.text} onPress={() => speakArabic(example.text)} accessibilityRole="button" accessibilityLabel={example.reading} style={styles.example}>
                <AppText script="arabic" style={styles.exampleText}>
                  {example.text}
                </AppText>
                <AppText variant="small" color={c.textMuted}>
                  {example.reading}
                </AppText>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      <Button label={copy.start} iconRight="chevron" onPress={onNext} />
    </>
  );
}

/** The reading page: rows of syllables and words, read right to left; a tap says a syllable and shows its reading. */
function ReadStep({ rows, onNext }: { rows: ReadingRow[]; onNext: () => void }) {
  const { copy } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const [showAll, setShowAll] = useState(false);
  const [opened, setOpened] = useState<string[]>([]);

  const tap = (text: string) => {
    speakArabic(text);
    setOpened((o) => (o.includes(text) ? o : [...o, text]));
  };

  return (
    <>
      <AppText variant="title" accessibilityRole="header">
        {copy.readTitle}
      </AppText>
      <AppText variant="body" color={c.textMuted}>
        {copy.readHint}
      </AppText>
      <Card>
        {rows.map((row, r) => (
          <View key={r} style={styles.readRow}>
            {row.items.map((item) => {
              const open = showAll || opened.includes(item.text);
              return (
                <Pressable key={item.text} onPress={() => tap(item.text)} accessibilityRole="button" accessibilityLabel={item.reading} style={[styles.readItem, open && styles.readItemOpen]}>
                  <AppText script="arabic" style={styles.readText}>
                    {item.text}
                  </AppText>
                  {open ? (
                    <AppText variant="small" color={c.textMuted}>
                      {item.reading}
                    </AppText>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </Card>
      <Button label={showAll ? copy.hideReading : copy.showReading} variant="secondary" size="md" onPress={() => setShowAll((v) => !v)} />
      <AppText variant="tiny" color={c.textMuted}>
        {copy.teacher}
      </AppText>
      <Button label={copy.start} iconRight="chevron" onPress={onNext} />
    </>
  );
}

function ExerciseStep({ exercise, onNext }: { exercise: SufaraExercise; onNext: () => void }) {
  const { copy } = useCopy();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const params = exercise.kind === 'findForm' ? { ...exercise.params, position: copy.positionIn[exercise.params.position as keyof typeof copy.positionIn] } : exercise.params;

  const choose = (i: number) => {
    if (solved) return;
    if (i === exercise.answer) {
      feedback.success();
      setSolved(true);
      // Hearing the right answer once more connects the shape with the sound.
      speakArabic(exercise.say);
    } else {
      feedback.failure();
      setWrong((w) => (w.includes(i) ? w : [...w, i]));
    }
  };

  return (
    <>
      {exercise.review ? (
        <AppText variant="label" color={c.goldText}>
          {copy.review.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="title" accessibilityRole="header">
        {copy.prompt[exercise.kind](params)}
      </AppText>
      {exercise.show ? (
        <AppText script="arabic" style={styles.show}>
          {exercise.show}
        </AppText>
      ) : null}
      <Button label={copy.listen} icon="speaker" variant="secondary" size="md" onPress={() => speakArabic(exercise.say)} />
      <View style={styles.choices}>
        {exercise.choices.map((choice, i) => {
          const isWrong = wrong.includes(i);
          const isRight = solved && i === exercise.answer;
          return (
            <Pressable
              key={`${i}-${choice.text}`}
              onPress={() => choose(i)}
              disabled={solved || isWrong}
              accessibilityRole="button"
              accessibilityState={{ disabled: solved || isWrong, selected: isRight }}
              style={[styles.choice, isRight && styles.choiceRight, isWrong && styles.choiceWrong]}
            >
              {choice.arabic ? (
                <AppText script="arabic" style={styles.choiceArabic}>
                  {choice.text}
                </AppText>
              ) : (
                <AppText variant="heading">{choice.text}</AppText>
              )}
            </Pressable>
          );
        })}
      </View>
      <AppText variant="bodyBold" align="center" color={solved ? c.success : c.goldText} style={styles.feedback} accessibilityLiveRegion="polite">
        {solved ? copy.correct : wrong.length > 0 ? copy.tryAgain : ''}
      </AppText>
      {solved ? <Button label={copy.next} iconRight="chevron" onPress={onNext} /> : null}
    </>
  );
}

function DoneStep({ lesson }: { lesson: SufaraLesson }) {
  const { copy } = useCopy();
  const styles = useStyles();
  const completeLesson = useQuestStore((s) => s.completeLesson);
  const finished = useRef(false);
  const [nextHref, setNextHref] = useState<ReturnType<typeof pathItemHref> | null>(null);

  useEffect(() => {
    if (finished.current) return;
    finished.current = true;
    completeLesson(lesson.id);
    useAppStore.getState().reportQuestEvent({ type: 'complete', target: sufaraTarget(lesson.id) });
    const next = buildTopicPath('sufara', useLearnStore.getState()).find((e) => e.status === 'available');
    setNextHref(next ? pathItemHref('sufara', next.item) : null);
  }, [completeLesson, lesson.id]);

  const last = lesson.number === SUFARA_LESSONS.length;
  return (
    <>
      <View style={styles.center}>
        <AppText variant="display" align="center" accessibilityRole="header">
          {copy.doneTitle}
        </AppText>
      </View>
      <Card tone="gold">
        <AppText variant="body">{last ? copy.courseDone : copy.doneBody}</AppText>
      </Card>
      {nextHref ? <Button label={copy.nextLesson} iconRight="chevron" onPress={() => router.replace(nextHref)} /> : null}
      <Button label={copy.backToTopic} variant={nextHref ? 'ghost' : 'primary'} onPress={() => router.dismissTo({ pathname: '/topic/[id]', params: { id: 'sufara' } })} />
      <SourceList sources={[LANGUAGE_SOURCES.alphabet]} />
    </>
  );
}

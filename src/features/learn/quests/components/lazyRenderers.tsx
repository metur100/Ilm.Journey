import type { AyahOrderQuestion as AyahOrder, MissingWordQuestion as MissingWord } from '@/core/models';
import type { QuestionComponentProps } from '@/core/registry';

/**
 * Renderers registered from `register.ts`. The real components use AnswerOption / SequenceBuilder, which pull in
 * the sound service (expo-audio). They are required lazily on first render so the register import chain stays free
 * of native audio modules (jest tests call `registerFeatures()`).
 */
type QuranQuestionsModule = typeof import('./QuranQuestions');

function load(): QuranQuestionsModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./QuranQuestions') as QuranQuestionsModule;
}

export function LazyMissingWordQuestion(props: QuestionComponentProps<MissingWord>) {
  const { MissingWordQuestion } = load();
  return <MissingWordQuestion {...props} />;
}

export function LazyAyahOrderQuestion(props: QuestionComponentProps<AyahOrder>) {
  const { AyahOrderQuestion } = load();
  return <AyahOrderQuestion {...props} />;
}

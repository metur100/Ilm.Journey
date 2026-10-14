import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { QuestionView } from '@/core/components/questions/QuestionView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { LOCALE_TAGS } from '@/core/i18n';
import { parseQuestionKey, type ReviewItem } from '@/core/models';
import { isDue } from '@/core/services/review';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { ConnectionCard } from '../components/Cards';
import { ChapterHeader, FilterChip } from '../components/Controls';
import { EPISODES, episodeOfQuestion, getQuestion, seerahKey } from '../content';
import { useSeerahI18n } from '../i18n';
import type { SeerahQuestion } from '../models';
import { seerahReviewCenter } from '../services/review';
import { useSeerahStore } from '../store/seerahStore';

type Tab = 'needs' | 'mastered' | 'recent';
const SESSION_SIZE = 8;
const RECENT_DAYS = 14;

const questionOf = (item: ReviewItem) => {
  const id = parseQuestionKey(item.key)?.id;
  return id ? getQuestion(id) : undefined;
};

const useStyles = makeStyles(() => ({
  tabs: { gap: spacing.sm },
  list: { gap: spacing.md },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  card: { gap: spacing.xs },
}));

/**
 * Seerah review: sira's Review Center (Needs review · Mastered · Recently learned) as a filtered
 * view of the global review queue. Sessions only contain Seerah questions; scoring, XP and
 * scheduling go through the core store, so the global review centre stays in sync.
 */
export default function ReviewScreen() {
  const { t } = useSeerahI18n();
  const styles = useStyles();
  const [tab, setTab] = useState<Tab>('needs');
  const [session, setSession] = useState<SeerahQuestion[] | null>(null);

  if (session) return <ReviewSession questions={session} onClose={() => setSession(null)} />;

  return (
    <Screen header={<TopBar title={t('review.title')} />}>
      <ChapterHeader title={t('review.title')} subtitle={t('review.subtitle')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        <FilterChip label={t('review.needs')} selected={tab === 'needs'} onPress={() => setTab('needs')} />
        <FilterChip label={t('review.mastered')} selected={tab === 'mastered'} onPress={() => setTab('mastered')} />
        <FilterChip label={t('review.recent')} selected={tab === 'recent'} onPress={() => setTab('recent')} />
      </ScrollView>
      {tab === 'needs' ? <NeedsReview onStart={setSession} /> : null}
      {tab === 'mastered' ? <Mastered /> : null}
      {tab === 'recent' ? <RecentlyLearned /> : null}
      <Button label={t('review.all')} variant="secondary" icon="refresh" onPress={() => router.push('/review')} />
    </Screen>
  );
}

function ItemRow({ item }: { item: ReviewItem }) {
  const { t, l, language } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const q = questionOf(item);
  const ep = q ? episodeOfQuestion(q.id) : undefined;
  const due = isDue(item, new Date().toISOString());
  if (!q) return null;
  const status = item.mastered
    ? t('review.mastered')
    : due
      ? t('review.dueNow')
      : t('review.nextOn', { date: new Date(item.nextReviewDate).toLocaleDateString(LOCALE_TAGS[language], { day: 'numeric', month: 'short' }) });
  return (
    <Card style={styles.card} accessibilityLabel={`${l(q.prompt)}. ${status}. ${t('review.missed', { count: item.incorrectCount })}`}>
      <AppText variant="tiny" color={c.goldText}>
        {ep ? `${t('episode.label', { number: ep.order })} · ${l(ep.title)}` : ''}
      </AppText>
      <AppText variant="bodyBold">{l(q.prompt)}</AppText>
      <View style={styles.meta}>
        <AppText variant="tiny" color={due ? c.goldText : c.textMuted}>
          {status}
        </AppText>
        <AppText variant="tiny" color={c.textMuted}>
          {t('review.missed', { count: item.incorrectCount })}
        </AppText>
      </View>
    </Card>
  );
}

function NeedsReview({ onStart }: { onStart: (qs: SeerahQuestion[]) => void }) {
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const review = useAppStore((s) => s.review);
  const center = seerahReviewCenter(review, new Date().toISOString());
  const start = () =>
    onStart(
      center.due
        .slice(0, SESSION_SIZE)
        .map(questionOf)
        .filter((q): q is SeerahQuestion => q !== undefined),
    );
  if (center.needsReview.length === 0) return <EmptyState icon="check" title={t('review.needs')} body={t('review.emptyNeeds')} />;
  return (
    <View style={styles.list}>
      {center.due.length > 0 ? (
        <Button label={t('review.start', { count: Math.min(center.due.length, SESSION_SIZE) })} icon="play" onPress={start} />
      ) : (
        <AppText variant="small" color={c.textMuted}>
          {t('review.nothingDue')}
        </AppText>
      )}
      {center.needsReview.map((i) => (
        <ItemRow key={i.key} item={i} />
      ))}
    </View>
  );
}

function Mastered() {
  const { t } = useSeerahI18n();
  const styles = useStyles();
  const review = useAppStore((s) => s.review);
  const mastered = seerahReviewCenter(review, new Date().toISOString()).mastered;
  if (mastered.length === 0) return <EmptyState icon="star" title={t('review.mastered')} body={t('review.emptyMastered')} />;
  return (
    <View style={styles.list}>
      {mastered.map((i) => (
        <ItemRow key={i.key} item={i} />
      ))}
    </View>
  );
}

function RecentlyLearned() {
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const episodes = useSeerahStore((s) => s.episodes);
  const discoveredEvents = useSeerahStore((s) => s.discovered.event);
  const [since] = useState(() => Date.now() - RECENT_DAYS * 86_400_000);
  const recentEpisodes = EPISODES.filter((e) => {
    const done = episodes[e.id]?.completedAt;
    return done && new Date(done).getTime() >= since;
  });
  const recentEvents = Object.entries(discoveredEvents)
    .filter(([, at]) => new Date(at).getTime() >= since)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([id]) => id);
  if (recentEpisodes.length === 0 && recentEvents.length === 0) return <EmptyState icon="book" title={t('review.recent')} body={t('review.emptyRecent')} />;
  return (
    <View style={styles.list}>
      {recentEpisodes.length ? (
        <AppText variant="label" color={c.textMuted}>
          {t('explore.episodes').toUpperCase()}
        </AppText>
      ) : null}
      {recentEpisodes.map((e) => (
        <ConnectionCard key={e.id} type="episode" id={e.id} />
      ))}
      {recentEvents.length ? (
        <AppText variant="label" color={c.textMuted}>
          {t('explore.events').toUpperCase()}
        </AppText>
      ) : null}
      {recentEvents.map((id) => (
        <ConnectionCard key={id} type="event" id={id} />
      ))}
    </View>
  );
}

function ReviewSession({ questions, onClose }: { questions: SeerahQuestion[]; onClose: () => void }) {
  const { t } = useSeerahI18n();
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const completeSession = useAppStore((s) => s.completeReviewSession);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const done = index >= questions.length;

  return (
    <Screen header={<TopBar title={t('review.title')} backIcon="close" backLabel={t('a11y.close')} onBack={onClose} />}>
      {done ? (
        <>
          <ChapterHeader title={t('review.doneTitle')} subtitle={t('review.doneBody', { correct: results.filter(Boolean).length, total: results.length })} />
          <Button label={t('common.done')} onPress={onClose} />
        </>
      ) : (
        <>
          <ProgressBar progress={index / questions.length} height={6} />
          <AppText variant="label">{t('quiz.question', { current: index + 1, total: questions.length }).toUpperCase()}</AppText>
          <QuestionView
            key={questions[index].id}
            question={questions[index]}
            label="review"
            showReviewNote={false}
            onResult={(correct) => {
              const q = questions[index];
              setResults((r) => [...r, correct]);
              recordAnswer({ key: seerahKey(q.id), topic: q.topic, topicArea: 'seerah' }, correct, 'review');
            }}
            onContinue={() => {
              if (index + 1 >= questions.length) completeSession();
              setIndex(index + 1);
            }}
          />
        </>
      )}
    </Screen>
  );
}

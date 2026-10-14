import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Art } from '../../art';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { ToggleRow } from '../../components/ui/SettingRow';
import { Stars } from '../../components/ui/Stars';
import { EmptyState } from '../../components/ui/States';
import { TopBar } from '../../components/ui/TopBar';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useStatusBar } from '../../hooks/useStatusBar';
import { type CoreKey, localize, type Params, topicName, translateNs, useI18n } from '../../i18n';
import type { LocalizedText } from '../../models';
import { playSound, type SoundName } from '../../services/sound';
import { useAppStore } from '../../store/appStore';
import { makeStyles, radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '../../theme';
import { useGameProgress } from '../hooks';
import { getGame } from '../registry';
import { type LevelSummary, useGamesStore } from '../store';
import { type GameApi, type GameLevel, type GameResultInput, type HapticKind } from '../types';
import { GameResult } from './GameResult';
import { HowToHint } from './parts';

type Phase = 'intro' | 'howto' | 'levels' | 'play' | 'result';

/** Plays that already reported a result. */
const finishedPlays = new WeakSet<object>();

const HAPTICS: Record<HapticKind, () => Promise<void>> = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  selection: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: spacing.md, alignItems: 'center' },
  heroTop: { alignSelf: 'stretch' },
  coverCircle: { width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  pill: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  levelBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  playBody: { flex: 1, padding: spacing.lg },
  playHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, minHeight: 56, gap: spacing.sm },
  iconButton: { width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
}));

/**
 * GameShell – the frame around every mini-game: illustrated intro → animated "how to play" hint → level select →
 * play (renders the game component with a typed `GameApi`) → result (stars, best, XP once per level, seeds/water,
 * "You learned" facts with sources, collection cards, review items) → replay / next level / back.
 * Route: `/game/[id]`. Games never navigate themselves – they call `api.onComplete` or `api.onExit`.
 */
export function GameShell({ gameId }: { gameId: string }) {
  const def = getGame(gameId);
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const soundOn = useAppStore((s) => s.settings.sound);
  const hapticsOn = useAppStore((s) => s.settings.haptics);
  const setPaused = useAppStore((s) => s.setCelebrationsPaused);
  const progress = useGameProgress(gameId);
  const challengeMode = useGamesStore((s) => s.challengeMode);
  const setChallengeMode = useGamesStore((s) => s.setChallengeMode);
  const markIntroSeen = useGamesStore((s) => s.markIntroSeen);
  const completeLevel = useGamesStore((s) => s.completeLevel);

  const [phase, setPhase] = useState<Phase>(() => (progress.progress.introSeen ? 'levels' : 'intro'));
  const [level, setLevel] = useState<GameLevel>(1);
  const [playKey, setPlayKey] = useState(0);
  const [summary, setSummary] = useState<LevelSummary | null>(null);
  // One token per play: a game reporting the same play twice is ignored (see `finishedPlays`).
  const [playToken, setPlayToken] = useState<object>(() => ({}));

  useStatusBar(phase === 'intro');

  // Level-up and badge pop-ups wait while a level is being played.
  useEffect(() => {
    setPaused(phase === 'play');
  }, [phase, setPaused]);
  useEffect(() => () => setPaused(false), [setPaused]);

  // Android back steps back inside the game (play / result → levels, how to play → intro) instead of leaving it.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'play' || phase === 'result') setPhase('levels');
      else if (phase === 'howto') setPhase('intro');
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [phase]);

  const gt = useCallback(
    (key: string, params?: Params) => (def ? translateNs(def.i18n, language, key, params) : key),
    [def, language],
  );
  const l = useCallback((text: LocalizedText | undefined) => localize(text, language), [language]);

  const start = useCallback((next: GameLevel) => {
    setPlayToken({});
    setLevel(next);
    setSummary(null);
    setPlayKey((k) => k + 1);
    setPhase('play');
  }, []);

  const levelDef = def?.levels.find((x) => x.level === level);

  const api = useMemo((): GameApi<unknown> | null => {
    if (!def || !levelDef) return null;
    return {
      gameId: def.id,
      level,
      config: levelDef.config,
      facts: levelDef.facts,
      language,
      t: gt,
      l,
      reducedMotion: reduced,
      challengeMode,
      playSound: (name: SoundName) => {
        if (soundOn) playSound(name);
      },
      haptic: (kind: HapticKind) => {
        if (hapticsOn) HAPTICS[kind]().catch(() => undefined);
      },
      onExit: () => setPhase('levels'),
      onComplete: (result: GameResultInput) => {
        if (finishedPlays.has(playToken)) return;
        finishedPlays.add(playToken);
        const next = completeLevel(def.id, level, result);
        setSummary(next);
        setPhase('result');
        AccessibilityInfo.announceForAccessibility(t('a11y.stars', { count: next.stars }));
      },
    };
  }, [challengeMode, completeLevel, def, gt, hapticsOn, l, language, level, levelDef, playToken, reduced, soundOn, t]);

  if (!def) {
    return (
      <SafeAreaView style={styles.root}>
        <TopBar />
        <EmptyState icon="info" title={t('games.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </SafeAreaView>
    );
  }

  const theme = topicThemes[def.topicId];
  const title = gt('title');
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/play'));

  if (phase === 'intro' || phase === 'howto') {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <LinearGradient colors={theme.gradient} style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.heroTop}>
            <TopBar dark onBack={phase === 'howto' ? () => setPhase('intro') : leave} />
          </View>
          <View style={styles.coverCircle}>
            <Art name={def.coverArt} size={190} />
          </View>
          <View style={styles.pill}>
            <AppText variant="label" color={c.onAccent}>
              {t('games.topic', { topic: t(topicName(def.topicId)) }).toUpperCase()}
            </AppText>
          </View>
          <AppText variant="display" color={c.onAccent} align="center" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" color={c.onAccent} align="center">
            {gt('description')}
          </AppText>
        </LinearGradient>
        <View style={styles.body}>
          {phase === 'intro' ? (
            <>
              <Button label={t('games.letsPlay')} icon="play" variant="gold" onPress={() => setPhase('howto')} />
              {progress.progress.introSeen ? <Button label={t('games.chooseLevel')} variant="secondary" onPress={() => setPhase('levels')} /> : null}
            </>
          ) : (
            <>
              <AppText variant="heading" accessibilityRole="header">
                {t('games.howToTitle')}
              </AppText>
              <HowToHint art={def.hintArt ?? def.coverArt} reduced={reduced} />
              <AppText variant="body">{gt('howTo')}</AppText>
              <Button
                label={t('games.gotIt')}
                iconRight="chevron"
                onPress={() => {
                  markIntroSeen(def.id);
                  setPhase('levels');
                }}
              />
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  if (phase === 'play' && api) {
    const Game = def.component;
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.playHeader}>
          <Pressable onPress={() => setPhase('levels')} accessibilityRole="button" accessibilityLabel={t('games.exit')} style={styles.iconButton} hitSlop={8}>
            <Icon name="close" size={26} color={c.text} />
          </Pressable>
          <View style={styles.flex}>
            <AppText variant="bodyBold" numberOfLines={1} accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="tiny" color={c.textMuted}>
              {`${t('common.level', { level })} · ${t(`games.difficulty.${level}` as CoreKey)}`}
            </AppText>
          </View>
        </View>
        <View style={styles.playBody}>
          <Game key={playKey} {...api} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'result' && summary && levelDef) {
    const nextLevel = def.levels.find((x) => x.level === level + 1)?.level;
    return (
      <GameResult
        title={title}
        level={level}
        summary={summary}
        facts={levelDef.facts}
        accent={theme.accent}
        onReplay={() => start(level)}
        onNext={nextLevel ? () => start(nextLevel) : undefined}
        onBack={() => setPhase('levels')}
        onLeave={leave}
      />
    );
  }

  // Level select
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar title={title} onBack={leave} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card tone="alt" onPress={() => setPhase('intro')} accessibilityLabel={`${title}. ${t('games.howToTitle')}`}>
          <View style={styles.levelCard}>
            <Art name={def.coverArt} size={72} />
            <View style={styles.flex}>
              <AppText variant="bodyBold">{gt('description')}</AppText>
              <AppText variant="small" color={c.primaryText}>
                {t('games.howToTitle')}
              </AppText>
            </View>
          </View>
        </Card>
        <AppText variant="heading" accessibilityRole="header">
          {t('games.chooseLevel')}
        </AppText>
        {def.levels.map(({ level: n }) => {
          const unlocked = progress.isUnlocked(n);
          const best = progress.level(n);
          const label = `${t('common.level', { level: n })} · ${t(`games.difficulty.${n}` as CoreKey)}`;
          const status = !unlocked
            ? t('games.lockedLevel', { level: n - 1 })
            : best
              ? t('games.best', { score: best.bestScore, max: best.maxScore })
              : t('games.notPlayed');
          return (
            <Card key={n} onPress={unlocked ? () => start(n) : undefined} disabled={!unlocked} tone={unlocked ? 'default' : 'alt'} accessibilityLabel={`${label}. ${status}${best ? `. ${t('a11y.stars', { count: best.stars })}` : ''}`}>
              <View style={styles.levelCard}>
                <View style={[styles.levelBadge, { backgroundColor: unlocked ? theme.accent : c.locked }]}>
                  {unlocked ? (
                    <AppText variant="title" color={c.onAccent}>
                      {n}
                    </AppText>
                  ) : (
                    <Icon name="lock" size={24} color={c.onAccent} />
                  )}
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{label}</AppText>
                  <AppText variant="small" color={c.textMuted}>
                    {status}
                  </AppText>
                </View>
                {unlocked ? <Stars count={best?.stars ?? 0} size={20} /> : null}
              </View>
            </Card>
          );
        })}
        <Card padded={false}>
          <ToggleRow icon="flame" label={t('games.challenge')} description={t('games.challengeDesc')} value={challengeMode} onChange={setChallengeMode} />
        </Card>
        <AppText variant="tiny" color={c.textMuted} align="center">
          {t('games.totalStars', { count: progress.totalStars, total: def.levels.length * 3 })}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

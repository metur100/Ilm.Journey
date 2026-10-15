import { useMemo, useRef, useState } from 'react';
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { type GameApi, useGamesStore } from '@/core/games';
import { getMemorizedAyahs } from '@/core/registry';
import { fonts, makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';
import { hashString, seededRandom } from '@/core/utils/random';
import { QURAN_SOURCE } from '@/features/quran';

import { useAyahRecitation } from './audio';
import { surahFactText, surahMeaning } from './facts';
import { DraggableTile, Glow, GrowIn, inside, measure, type Point, type Rect, SparkleBurst } from './kit';
import { type AyahBuilderConfig, ayahResult, fitsNext, HINT_AFTER, planAyahs, scatter } from './logic';

/** Right-to-left line direction that also holds when the app runs in an RTL layout. */
const RTL_ROW = I18nManager.isRTL ? 'row' : 'row-reverse';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerText: { flex: 1, gap: 2 },
  listen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: c.primarySoft,
  },
  listenActive: { backgroundColor: c.primary },
  line: {
    minHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: c.goldBorder,
    backgroundColor: c.goldSoft,
    padding: spacing.md,
    justifyContent: 'center',
  },
  lineWords: { flexDirection: RTL_ROW, flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, rowGap: spacing.sm },
  placed: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  slot: { width: 38, height: 30, borderRadius: radius.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.goldText, opacity: 0.45 },
  tray: { flexDirection: RTL_ROW, flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  tile: {
    minHeight: 56,
    minWidth: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  note: { minHeight: 22 },
  panel: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: c.border },
  center: { alignItems: 'center', gap: spacing.md },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.track },
  dotDone: { backgroundColor: c.gold },
}));

type Phase = 'intro' | 'build' | 'meaning' | 'done';

/**
 * Ayah Builder: word tiles of an ayah lie in a tray; the learner drags (or taps) them into the right-to-left line in
 * order. Correct words lock in with a soft glow; a wrong word only gets a gentle nudge (no fail sound on Quran words)
 * and after two nudges the next word glows. When the ayah is complete its meaning appears in the UI language.
 */
export function AyahBuilderGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, language, t }: GameApi<AyahBuilderConfig>) {
  const { c, scale } = useTheme();
  const styles = useStyles();
  const [memorized] = useState(() => getMemorizedAyahs());
  const [playIndex] = useState(() => useGamesStore.getState().games[gameId]?.levels[`${level}`]?.plays ?? 0);
  const plan = useMemo(() => planAyahs(config, memorized, playIndex), [config, memorized, playIndex]);
  const recitation = useAyahRecitation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [nudges, setNudges] = useState(0);
  const [nudgeTile, setNudgeTile] = useState<{ index: number; n: number }>({ index: -1, n: 0 });
  const [burst, setBurst] = useState(0);
  const [message, setMessage] = useState<'nudge' | 'hint' | null>(null);
  const lineRef = useRef<View>(null);
  const lineRect = useRef<Rect | null>(null);

  const current = plan?.rounds[round];
  const tiles = useMemo(() => current?.tiles ?? [], [current]);
  const order = useMemo(() => (current ? scatter(tiles, seededRandom(hashString(`${gameId}:${level}:${playIndex}:${current.ayah.globalNumber}`))) : []), [current, gameId, level, playIndex, tiles]);
  // Tiles still in the tray: a placed word removes the first tray tile carrying that word.
  const [used, setUsed] = useState<number[]>([]);
  const tray = order.filter((i) => !used.includes(i));
  const totalTiles = useMemo(() => plan?.rounds.reduce((sum, r) => sum + r.tiles.length, 0) ?? 0, [plan]);

  if (!plan || !current) return null;
  const surah = plan.surah;
  const learning = (memorized[surah.number]?.length ?? 0) > 0;
  const wordSize = Math.round(26 * scale);

  const place = (index: number): boolean => {
    if (phase !== 'build') return false;
    if (!fitsNext(tiles, placed, tiles[index])) {
      setMistakes((m) => m + 1);
      const next = nudges + 1;
      setNudges(next);
      setNudgeTile((s) => ({ index, n: s.n + 1 }));
      setMessage(next >= HINT_AFTER ? 'hint' : 'nudge');
      haptic('selection');
      return false;
    }
    haptic('tap');
    playSound('click');
    setUsed((u) => [...u, index]);
    setNudges(0);
    setMessage(null);
    const count = placed + 1;
    setPlaced(count);
    if (count === tiles.length) {
      setBurst((b) => b + 1);
      playSound('success');
      haptic('success');
      setPhase('meaning');
    }
    return true;
  };

  const drop = (index: number, center: Point): boolean => {
    const rect = lineRect.current;
    if (!rect || !inside(center, rect, 24)) return false;
    return place(index);
  };

  const nextAyah = () => {
    recitation.stop();
    if (round + 1 < plan.rounds.length) {
      setRound(round + 1);
      setPlaced(0);
      setUsed([]);
      setNudges(0);
      setMessage(null);
      setPhase('build');
    } else {
      setPhase('done');
    }
  };

  const hintIndex = nudges >= HINT_AFTER ? tray.find((i) => tiles[i] === tiles[placed]) : undefined;
  const translator = QURAN_SOURCE.translations[language];

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.panel, styles.center]}>
          <GrowIn reducedMotion={reducedMotion}>
            <Art name="object.quran-stand" size={150} />
          </GrowIn>
          <AppText variant="title" script="arabic" align="center">
            {surah.nameArabic}
          </AppText>
          <AppText variant="heading" align="center">
            {t('play.introTitle', { name: surah.nameTransliterated })}
          </AppText>
          <AppText variant="body" align="center" color={c.textMuted}>
            {`“${surahMeaning(surah)[language]}”`}
          </AppText>
          <AppText variant="body" align="center">
            {t('play.introBody', { count: plan.rounds.length })}
          </AppText>
          {learning ? (
            <AppText variant="small" align="center" color={c.primaryText}>
              {t('play.introLearning')}
            </AppText>
          ) : null}
          <Button label={t('common.start')} icon="play" onPress={() => setPhase('build')} fullWidth />
        </View>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.panel, styles.center]}>
          <GrowIn reducedMotion={reducedMotion}>
            <Art name="object.book" size={130} />
          </GrowIn>
          <AppText variant="title" script="arabic" align="center">
            {surah.nameArabic}
          </AppText>
          <AppText variant="heading" align="center">
            {plan.rounds.length === surah.ayahCount
              ? t('play.doneTitle', { name: surah.nameTransliterated })
              : t('play.donePart', { name: surah.nameTransliterated, count: plan.rounds.length })}
          </AppText>
          <AppText variant="body" align="center">
            {surahFactText(surah)[language]}
          </AppText>
          <AppText variant="tiny" align="center" color={c.textMuted}>
            {`Quran ${surah.number}:1–${surah.ayahCount} · ${QURAN_SOURCE.text}`}
          </AppText>
          <Button label={t('play.finish')} icon="sparkle" onPress={() => onComplete(ayahResult(totalTiles, mistakes))} fullWidth />
        </View>
      </ScrollView>
    );
  }

  const ayah = current.ayah;
  const listenLabel = recitation.state === 'playing' ? t('play.stop') : recitation.state === 'loading' ? t('play.loading') : t('play.listen');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="bodyBold">{surah.nameTransliterated}</AppText>
          <AppText variant="small" color={c.textMuted}>
            {t('play.ayahOf', { number: ayah.numberInSurah, index: round + 1, total: plan.rounds.length })}
          </AppText>
        </View>
        {recitation.state !== 'unavailable' ? (
          <Pressable
            onPress={() => recitation.toggle(ayah.globalNumber)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.listen', { number: ayah.numberInSurah })}
            accessibilityState={{ selected: recitation.state === 'playing' }}
            style={[styles.listen, recitation.state === 'playing' && styles.listenActive]}
          >
            <Icon name={recitation.state === 'playing' ? 'stop' : 'speaker'} size={18} color={recitation.state === 'playing' ? c.onPrimary : c.primaryText} />
            <AppText variant="small" color={recitation.state === 'playing' ? c.onPrimary : c.primaryText}>
              {listenLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {recitation.state === 'unavailable' ? (
        <AppText variant="tiny" color={c.textMuted}>
          {t('play.offline')}
        </AppText>
      ) : null}

      <View style={styles.dots} importantForAccessibility="no-hide-descendants">
        {plan.rounds.map((r, i) => (
          <View key={r.ayah.globalNumber} style={[styles.dot, (i < round || (i === round && phase === 'meaning')) && styles.dotDone]} />
        ))}
      </View>

      <View
        ref={lineRef}
        collapsable={false}
        style={styles.line}
        accessible
        accessibilityLabel={t('a11y.line', { count: placed, total: tiles.length })}
        onLayout={() => measure(lineRef.current, (rect) => (lineRect.current = rect))}
      >
        <View style={styles.lineWords}>
          {tiles.slice(0, placed).map((word, i) => (
            <GrowIn key={`${ayah.globalNumber}-${i}`} reducedMotion={reducedMotion} style={styles.placed}>
              <Glow color={c.gold} active={i === placed - 1 && phase === 'build'} reducedMotion={reducedMotion} radius={radius.sm} />
              <Text allowFontScaling={false} style={{ fontFamily: fonts.quran, fontSize: wordSize, lineHeight: wordSize * 2.4, color: c.text, writingDirection: 'rtl' }}>
                {word}
              </Text>
            </GrowIn>
          ))}
          {phase === 'build' ? tiles.slice(placed).map((_, i) => <View key={`slot-${i}`} style={styles.slot} />) : null}
        </View>
        {placed === 0 ? (
          <AppText variant="tiny" align="center" color={c.goldText}>
            {t('play.lineHint')}
          </AppText>
        ) : null}
        <SparkleBurst trigger={burst} reducedMotion={reducedMotion} distance={70} />
      </View>

      {phase === 'build' ? (
        <>
          <View style={styles.note} accessibilityLiveRegion="polite">
            {message ? (
              <AppText variant="small" align="center" color={c.textMuted}>
                {t(message === 'hint' ? 'play.hint' : 'play.nudge')}
              </AppText>
            ) : null}
          </View>
          <View style={styles.tray}>
            {tray.map((i) => (
              <DraggableTile
                key={`${ayah.globalNumber}-${i}`}
                label={t('a11y.tile', { word: tiles[i] })}
                hint={t('a11y.tileHint')}
                reducedMotion={reducedMotion}
                onTap={() => place(i)}
                onDragStart={() => measure(lineRef.current, (rect) => (lineRect.current = rect))}
                onDrop={(center) => drop(i, center)}
                nudge={nudgeTile.index === i ? nudgeTile.n : 0}
              >
                <View style={styles.tile}>
                  <Glow color={c.gold} active={hintIndex === i} reducedMotion={reducedMotion} radius={radius.md} />
                  <Text allowFontScaling={false} style={{ fontFamily: fonts.quran, fontSize: wordSize, lineHeight: wordSize * 2.4, color: c.text, writingDirection: 'rtl' }}>
                    {tiles[i]}
                  </Text>
                </View>
              </DraggableTile>
            ))}
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <GrowIn reducedMotion={reducedMotion}>
            <View style={styles.panel}>
              <AppText variant="label" color={c.textMuted}>
                {t('play.meaning').toUpperCase()}
              </AppText>
              <AppText variant="small" color={c.textMuted}>
                {ayah.transliteration}
              </AppText>
              <AppText variant="body">{`“${ayah.translation[language]}” (${surah.number}:${ayah.numberInSurah})`}</AppText>
              <AppText variant="tiny" color={c.textMuted}>
                {t('play.credit', { translator })}
              </AppText>
            </View>
          </GrowIn>
          <Button label={round + 1 < plan.rounds.length ? t('play.nextAyah') : t('common.continue')} iconRight="chevron" onPress={nextAyah} fullWidth />
        </ScrollView>
      )}
    </View>
  );
}

import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { type GameApi, useGamesStore } from '@/core/games';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';
import type { Surah } from '@/features/quran';

import { surahMeaning } from '../ayah-builder/facts';
import { DraggableTile, Glow, GrowIn, inside, measure, type Point, type Rect, SparkleBurst } from '../ayah-builder/kit';
import { flowerFor, gardenResult, isMatch, missedFacts, openingLength, openingText, pickSurahs, type SurahGardenConfig } from './logic';

const CARD_MIN = 60;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  garden: { height: 96, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.primarySoft, justifyContent: 'flex-end' },
  gardenRow: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: 8, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  lawn: { position: 'absolute', left: 0, bottom: 0 },
  spot: { width: 44, height: 70, alignItems: 'center', justifyContent: 'flex-end' },
  board: { flex: 1, flexDirection: 'row', gap: spacing.sm },
  column: { flex: 1, gap: spacing.sm },
  card: {
    minHeight: CARD_MIN,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  nameCard: { backgroundColor: c.surface, borderColor: c.primaryBorder },
  answerCard: { backgroundColor: c.goldSoft, borderColor: c.goldBorder },
  selected: { borderColor: c.primary, borderWidth: 3 },
  matched: { backgroundColor: c.successSoft, borderColor: c.success, opacity: 0.85 },
  matchedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  note: { minHeight: 20 },
  panel: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  flowers: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
}));

type Phase = 'intro' | 'play' | 'done';

/**
 * Surah Garden: surah name cards (Arabic + transliteration) are matched with their meaning, ayah count or opening
 * words (all from the generated data). Each right pair grows a flower in the garden strip.
 * Drag a name card onto its partner, or tap the name and then the partner (accessible alternative).
 */
export function SurahGardenGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, language, t }: GameApi<SurahGardenConfig>) {
  const { c, scale } = useTheme();
  const styles = useStyles();
  const [playIndex] = useState(() => useGamesStore.getState().games[gameId]?.levels[`${level}`]?.plays ?? 0);
  const surahs = useMemo(() => pickSurahs(config, `${gameId}:${level}:${playIndex}`), [config, gameId, level, playIndex]);
  // Answer column in its own (seeded) order, so a name never sits next to its partner by construction.
  const answers = useMemo(() => [...surahs].sort((a, b) => ((a.number * 37 + playIndex * 11) % 101) - ((b.number * 37 + playIndex * 11) % 101)), [surahs, playIndex]);
  const opening = useMemo(() => openingLength(surahs), [surahs]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<Set<number>>(() => new Set());
  const [nudge, setNudge] = useState<{ surah: number; n: number }>({ surah: 0, n: 0 });
  const [message, setMessage] = useState<'nudge' | 'matched' | null>(null);
  const [burst, setBurst] = useState(0);
  const [gardenWidth, setGardenWidth] = useState(360);
  const answerRefs = useRef(new Map<number, View | null>());
  const answerRects = useRef(new Map<number, Rect>());

  const answerText = (surah: Surah): string => {
    if (config.mode === 'meaning') return surahMeaning(surah)[language];
    if (config.mode === 'ayahCount') return t('play.ayahs', { count: surah.ayahCount });
    const o = openingText(surah, opening);
    return o.more ? `${o.text} …` : o.text;
  };

  const tryMatch = (name: number, answer: number): boolean => {
    if (matched.includes(answer) || matched.includes(name)) return false;
    if (isMatch(name, answer)) {
      const next = [...matched, name];
      setMatched(next);
      setSelected(null);
      setMessage('matched');
      setBurst((b) => b + 1);
      haptic('success');
      playSound(next.length === surahs.length ? 'success' : 'click');
      if (next.length === surahs.length) setPhase('done');
      return true;
    }
    setMistakes((m) => m + 1);
    setSelected(null);
    setWrong((w) => new Set([...w, name, answer]));
    setNudge((s) => ({ surah: name, n: s.n + 1 }));
    setMessage('nudge');
    haptic('warning');
    return false;
  };

  const measureAnswers = () => {
    for (const [n, view] of answerRefs.current) measure(view, (rect) => answerRects.current.set(n, rect));
  };

  const drop = (name: number, center: Point): boolean => {
    for (const [answer, rect] of answerRects.current) {
      if (!matched.includes(answer) && inside(center, rect, 6)) {
        tryMatch(name, answer);
        return isMatch(name, answer);
      }
    }
    return false;
  };

  const finish = () => onComplete(gardenResult(surahs.length, mistakes, missedFacts(config.factSurahs, wrong)));

  const garden = (
    <View style={styles.garden} onLayout={(e) => setGardenWidth(Math.max(1, Math.round(e.nativeEvent.layout.width)))} accessible accessibilityLabel={t('a11y.garden', { count: matched.length, total: surahs.length })}>
      <Art name="scene.garden-lawn" size={gardenWidth} height={96} fit="cover" style={styles.lawn} />
      <View style={styles.gardenRow}>
        {surahs.map((s, i) => (
          <View key={s.number} style={styles.spot}>
            {i < matched.length ? (
              <GrowIn reducedMotion={reducedMotion}>
                <Art name={flowerFor(i)} size={40} />
              </GrowIn>
            ) : (
              <Art name="ui.seed" size={20} style={{ opacity: 0.55 }} />
            )}
          </View>
        ))}
      </View>
      <SparkleBurst trigger={burst} reducedMotion={reducedMotion} distance={60} />
    </View>
  );

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.panel}>
          <View style={styles.flowers}>
            {[0, 1, 2, 3].map((i) => (
              <GrowIn key={i} reducedMotion={reducedMotion} delay={i * 120}>
                <Art name={flowerFor(i)} size={56} />
              </GrowIn>
            ))}
          </View>
          <AppText variant="title" align="center">
            {t(`play.intro.${config.mode}`)}
          </AppText>
          <AppText variant="body" align="center">
            {t('play.introBody', { count: surahs.length })}
          </AppText>
          <Button label={t('common.start')} icon="play" onPress={() => setPhase('play')} fullWidth />
        </View>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        {garden}
        <View style={styles.panel}>
          <GrowIn reducedMotion={reducedMotion}>
            <Art name="garden.butterfly" size={90} />
          </GrowIn>
          <AppText variant="title" align="center">
            {t('play.doneTitle')}
          </AppText>
          <AppText variant="body" align="center">
            {t('play.doneBody', { count: surahs.length })}
          </AppText>
          <Button label={t('play.finish')} icon="sparkle" onPress={finish} fullWidth />
        </View>
      </ScrollView>
    );
  }

  const selectedSurah = surahs.find((s) => s.number === selected);
  const quranSize = Math.round(19 * scale);

  return (
    <View style={styles.root}>
      {garden}
      <View style={styles.note} accessibilityLiveRegion="polite">
        <AppText variant="small" align="center" color={c.textMuted}>
          {message === 'nudge'
            ? t('play.nudge')
            : message === 'matched'
              ? t('play.matched')
              : selectedSurah
                ? t('play.selected', { name: selectedSurah.nameTransliterated })
                : t('play.instruction')}
        </AppText>
      </View>
      <View style={styles.board}>
        {/* Partner cards (static targets). Rendered first so the dragged name card is drawn above them. */}
        <View style={styles.column}>
          {answers.map((s) => {
            const done = matched.includes(s.number);
            const text = answerText(s);
            return (
              <View
                key={s.number}
                ref={(view) => {
                  answerRefs.current.set(s.number, view);
                }}
                collapsable={false}
              >
                <Pressable
                  onPress={() => (selected !== null && !done ? tryMatch(selected, s.number) : undefined)}
                  disabled={done}
                  accessibilityRole="button"
                  accessibilityLabel={done ? t('a11y.matched', { name: s.nameTransliterated, text }) : t('a11y.answer', { text })}
                  accessibilityState={{ disabled: done }}
                  style={[styles.card, styles.answerCard, done && styles.matched]}
                >
                  {config.mode === 'opening' ? (
                    <Text allowFontScaling={false} style={{ fontFamily: fonts.quran, fontSize: quranSize, lineHeight: quranSize * 2.4, color: c.text, textAlign: 'center', writingDirection: 'rtl' }}>
                      {text}
                    </Text>
                  ) : (
                    <AppText variant={config.mode === 'ayahCount' ? 'heading' : 'small'} align="center">
                      {text}
                    </AppText>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
        {/* Surah name cards (draggable). */}
        <View style={styles.column}>
          {surahs.map((s) => {
            const done = matched.includes(s.number);
            const card = (
              <View style={[styles.card, styles.nameCard, selected === s.number && styles.selected, done && styles.matched]}>
                <Glow color={c.gold} active={selected === s.number} reducedMotion={reducedMotion} radius={radius.md} />
                <Text allowFontScaling={false} style={{ fontFamily: fonts.arabic, fontSize: 17 * scale, lineHeight: 17 * scale * 1.7, color: c.text, writingDirection: 'rtl' }}>
                  {s.nameArabic}
                </Text>
                <View style={styles.matchedRow}>
                  {done ? <Icon name="check" size={14} color={c.success} /> : null}
                  <AppText variant="small" color={done ? c.text : c.primaryText}>
                    {s.nameTransliterated}
                  </AppText>
                </View>
              </View>
            );
            if (done) {
              return (
                <View key={s.number} accessible accessibilityLabel={t('a11y.matched', { name: s.nameTransliterated, text: answerText(s) })}>
                  {card}
                </View>
              );
            }
            return (
              <DraggableTile
                key={s.number}
                label={t('a11y.surah', { name: s.nameTransliterated })}
                hint={t('a11y.surahHint')}
                reducedMotion={reducedMotion}
                onTap={() => {
                  haptic('selection');
                  setMessage(null);
                  setSelected(selected === s.number ? null : s.number);
                }}
                onDragStart={() => {
                  setSelected(null);
                  setMessage(null);
                  measureAnswers();
                }}
                onDrop={(center) => drop(s.number, center)}
                nudge={nudge.surah === s.number ? nudge.n : 0}
              >
                {card}
              </DraggableTile>
            );
          })}
        </View>
      </View>
    </View>
  );
}

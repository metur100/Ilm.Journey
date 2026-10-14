import { useMemo, useRef, useState } from 'react';
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { type GameApi, useGamesStore } from '@/core/games';
import { fonts, makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';
import { hashString, seededRandom } from '@/core/utils/random';

import { DraggableTile, GrowIn, inside, measure, type Point, type Rect, SparkleBurst, useArabicVoice } from '../ayah-builder/kit';
import { formsInWord, partialWord } from '../letter-lanterns/script';
import { fitsSlot, missingIndex, missingOptions, pickWords, type WordBuilderConfig, wordLetters, type WordMistake, wordResult, wordTiles } from './logic';

const RTL_ROW = I18nManager.isRTL ? 'row' : 'row-reverse';
const SLOT_W = 58;
const SLOT_H = 72;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerText: { flex: 1, gap: 2 },
  speaker: { width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft },
  preview: { minHeight: 92, borderRadius: radius.lg, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  slots: { flexDirection: RTL_ROW, justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  slot: { width: SLOT_W, height: SLOT_H, borderRadius: radius.md, borderWidth: 2, borderStyle: 'dashed', borderColor: c.border, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface },
  slotNext: { borderColor: c.primary, borderStyle: 'solid' },
  slotFilled: { borderStyle: 'solid', borderColor: c.success, backgroundColor: c.successSoft },
  tray: { flexDirection: RTL_ROW, flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  tile: {
    width: 64,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  note: { minHeight: 20 },
  panel: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  forms: { flexDirection: RTL_ROW, flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
  formChip: { minWidth: 48, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: c.surfaceAlt, alignItems: 'center' },
  pictures: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  pictureItem: { alignItems: 'center', gap: 2, width: 90 },
  clue: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
}));

type Phase = 'intro' | 'play' | 'word' | 'done';

/**
 * Word Builder: letter tiles of an Arabic word go into the slots from right to left (drag or tap); the word is shown
 * joined live as it grows. When it is complete, its picture appears with the meaning and the offline pronunciation.
 * L3 hides one letter: the learner picks it among look-alike letters.
 */
export function WordBuilderGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<WordBuilderConfig>) {
  const { c, scale } = useTheme();
  const styles = useStyles();
  const { available: hasVoice, speak } = useArabicVoice();
  const [playIndex] = useState(() => useGamesStore.getState().games[gameId]?.levels[`${level}`]?.plays ?? 0);
  const words = useMemo(() => pickWords(config, playIndex, `${gameId}:${level}`), [config, gameId, level, playIndex]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<WordMistake[]>([]);
  const [slotMistakes, setSlotMistakes] = useState(0);
  const [nudge, setNudge] = useState<{ key: string; n: number }>({ key: '', n: 0 });
  const [message, setMessage] = useState<'nudge' | 'ghost' | null>(null);
  const [burst, setBurst] = useState(0);
  const slotsRef = useRef<View>(null);
  const slotsRect = useRef<Rect | null>(null);

  const word = words[index];
  const letters = useMemo(() => (word ? wordLetters(word) : []), [word]);
  const forms = useMemo(() => (word ? formsInWord(word.arabic) : []), [word]);
  const random = useMemo(() => seededRandom(hashString(`${gameId}:${level}:${playIndex}:${index}`)), [gameId, level, playIndex, index]);
  const tiles = useMemo(() => (word && config.mode === 'build' ? wordTiles(word, random) : []), [config.mode, random, word]);
  const options = useMemo(() => (word && config.mode === 'missing' ? missingOptions(word, config.options ?? 4, random) : []), [config.mode, config.options, random, word]);
  const missing = word && config.mode === 'missing' ? missingIndex(word) : null;
  const points = useMemo(() => words.reduce((sum, w) => sum + (config.mode === 'missing' ? 1 : wordLetters(w).length), 0), [config.mode, words]);

  if (!word) return null;
  const slot = config.mode === 'missing' ? (missing ?? 0) : placed;
  const complete = config.mode === 'missing' ? placed > 0 : placed >= letters.length;
  const isFilled = (i: number) => (config.mode === 'missing' ? i !== missing || complete : i < placed);
  const showGhost = (i: number) => !isFilled(i) && (config.ghosts || (i === slot && slotMistakes >= 2));
  const arabicSize = Math.round(30 * scale);

  const finishWord = () => {
    setBurst((b) => b + 1);
    playSound('success');
    haptic('success');
    if (hasVoice) speak(word.arabic);
    setMessage(null);
    setPhase('word');
  };

  const place = (base: string, tileKey: string, tileIndex?: number): boolean => {
    if (phase !== 'play' || complete) return false;
    if (!fitsSlot(word, slot, base)) {
      setMistakes((m) => [...m, { word: word.id, expected: letters[slot]?.base ?? '', chosen: base }]);
      setSlotMistakes((n) => n + 1);
      setNudge((s) => ({ key: tileKey, n: s.n + 1 }));
      setMessage(slotMistakes + 1 >= 2 && !config.ghosts && config.mode === 'build' ? 'ghost' : 'nudge');
      haptic('warning');
      return false;
    }
    haptic('tap');
    playSound('click');
    setSlotMistakes(0);
    setMessage(null);
    if (tileIndex !== undefined) setUsed((u) => [...u, tileIndex]);
    if (config.mode === 'missing') {
      setPlaced(1);
      finishWord();
      return true;
    }
    const next = placed + 1;
    setPlaced(next);
    if (next >= letters.length) finishWord();
    return true;
  };

  const drop = (center: Point, base: string, tileKey: string, tileIndex?: number): boolean => {
    const rect = slotsRect.current;
    if (!rect || !inside(center, rect, 28)) return false;
    return place(base, tileKey, tileIndex);
  };

  const nextWord = () => {
    if (index + 1 < words.length) {
      setIndex(index + 1);
      setPlaced(0);
      setUsed([]);
      setSlotMistakes(0);
      setMessage(null);
      setPhase('play');
    } else {
      setPhase('done');
    }
  };

  const measureSlots = () => measure(slotsRef.current, (rect) => (slotsRect.current = rect));

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.panel}>
          <View style={styles.pictures}>
            {words.slice(0, 3).map((w, i) => (
              <GrowIn key={w.id} reducedMotion={reducedMotion} delay={i * 120}>
                <Art name={config.mode === 'missing' ? w.art : i === 1 ? 'object.inkwell' : 'object.pen'} size={70} />
              </GrowIn>
            ))}
          </View>
          <AppText variant="title" align="center">
            {t(`play.intro.${config.mode}`)}
          </AppText>
          <AppText variant="body" align="center">
            {t(config.mode === 'missing' ? 'play.introBody.missing' : config.ghosts ? 'play.introBody.ghosts' : 'play.introBody.build')}
          </AppText>
          <Button label={t('common.start')} icon="play" onPress={() => setPhase('play')} fullWidth />
        </View>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.panel}>
          <View style={styles.pictures}>
            {words.map((w, i) => (
              <GrowIn key={w.id} reducedMotion={reducedMotion} delay={i * 90} style={styles.pictureItem}>
                <Art name={w.art} size={64} label={t('a11y.picture', { meaning: l(w.meaning) })} />
                <Text allowFontScaling={false} style={{ fontFamily: fonts.arabicBold, fontSize: 22, lineHeight: 38, color: c.text }}>
                  {w.arabic}
                </Text>
              </GrowIn>
            ))}
          </View>
          <AppText variant="title" align="center">
            {t('play.doneTitle', { count: words.length })}
          </AppText>
          <Button label={t('play.finish')} icon="sparkle" onPress={() => onComplete(wordResult(points, mistakes, config.factRules))} fullWidth />
        </View>
      </ScrollView>
    );
  }

  const previewText = config.mode === 'missing' ? (complete ? word.arabic : '') : partialWord(word.arabic, placed);
  const trayItems =
    config.mode === 'build'
      ? tiles.filter((tile) => !used.includes(tile.index)).map((tile) => ({ key: `t${tile.index}`, base: tile.base, tileIndex: tile.index as number | undefined }))
      : options.map((base) => ({ key: `o${base}`, base, tileIndex: undefined as number | undefined }));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="small" color={c.textMuted}>
            {t('play.wordOf', { index: index + 1, total: words.length })}
          </AppText>
          <AppText variant="bodyBold">{config.mode === 'missing' ? l(word.meaning) : t('play.sounds', { translit: word.translit })}</AppText>
        </View>
        {hasVoice ? (
          <Pressable onPress={() => speak(word.arabic)} accessibilityRole="button" accessibilityLabel={t('play.listen')} style={styles.speaker}>
            <Icon name="speaker" size={22} color={c.primaryText} />
          </Pressable>
        ) : null}
      </View>

      {config.mode === 'missing' && phase === 'play' ? (
        <View style={styles.clue}>
          <Art name={word.art} size={84} label={t('a11y.picture', { meaning: l(word.meaning) })} />
          <AppText variant="small" color={c.textMuted} style={{ flex: 1 }}>
            {`${word.translit} · ${t('play.missing')}`}
          </AppText>
        </View>
      ) : null}

      <View style={styles.preview} accessible accessibilityLabel={previewText || t('play.startRight')}>
        {previewText ? (
          <Text allowFontScaling={false} style={{ fontFamily: fonts.arabicBold, fontSize: Math.round(44 * scale), lineHeight: Math.round(44 * scale * 1.75), color: c.text, writingDirection: 'rtl' }}>
            {previewText}
          </Text>
        ) : (
          <AppText variant="small" color={c.goldText}>
            {t('play.startRight')}
          </AppText>
        )}
        <SparkleBurst trigger={burst} reducedMotion={reducedMotion} distance={70} />
      </View>

      <View ref={slotsRef} collapsable={false} style={styles.slots} accessible accessibilityLabel={t('a11y.slots', { count: letters.filter((_, i) => isFilled(i)).length, total: letters.length })} onLayout={measureSlots}>
        {letters.map((_, i) => {
          const filled = isFilled(i);
          const next = !complete && i === slot;
          return (
            <View key={`${word.id}-${i}`} style={[styles.slot, next && styles.slotNext, filled && styles.slotFilled]}>
              {filled ? (
                <GrowIn reducedMotion={reducedMotion}>
                  <Text allowFontScaling={false} style={{ fontFamily: fonts.arabic, fontSize: arabicSize, lineHeight: arabicSize * 1.7, color: c.text }}>
                    {forms[i]}
                  </Text>
                </GrowIn>
              ) : showGhost(i) ? (
                <Text allowFontScaling={false} style={{ fontFamily: fonts.arabic, fontSize: arabicSize, lineHeight: arabicSize * 1.7, color: c.textMuted, opacity: 0.35 }}>
                  {forms[i]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {phase === 'play' ? (
        <>
          <View style={styles.note} accessibilityLiveRegion="polite">
            {message ? (
              <AppText variant="small" align="center" color={c.textMuted}>
                {t(message === 'ghost' ? 'play.ghost' : 'play.nudge')}
              </AppText>
            ) : null}
          </View>
          <View style={styles.tray}>
            {trayItems.map((item) => (
              <DraggableTile
                key={`${word.id}-${item.key}`}
                label={t('a11y.tile', { letter: item.base })}
                hint={t('a11y.tileHint')}
                reducedMotion={reducedMotion}
                onTap={() => place(item.base, item.key, item.tileIndex)}
                onDragStart={measureSlots}
                onDrop={(center) => drop(center, item.base, item.key, item.tileIndex)}
                nudge={nudge.key === item.key ? nudge.n : 0}
              >
                <View style={styles.tile}>
                  <Text allowFontScaling={false} style={{ fontFamily: fonts.arabicBold, fontSize: Math.round(32 * scale), lineHeight: Math.round(32 * scale * 1.7), color: c.text }}>
                    {item.base}
                  </Text>
                </View>
              </DraggableTile>
            ))}
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.panel}>
            <GrowIn reducedMotion={reducedMotion}>
              <Art name={word.art} size={120} label={t('a11y.picture', { meaning: l(word.meaning) })} />
            </GrowIn>
            <AppText variant="heading" align="center">
              {`${t('play.wordDone')} ${l(word.meaning)}`}
            </AppText>
            <AppText variant="small" color={c.textMuted}>
              {word.translit}
            </AppText>
            <AppText variant="label" color={c.textMuted}>
              {t('play.forms').toUpperCase()}
            </AppText>
            <View style={styles.forms}>
              {forms.map((form, i) => (
                <View key={`${word.id}-f${i}`} style={styles.formChip}>
                  <Text allowFontScaling={false} style={{ fontFamily: fonts.arabic, fontSize: 24, lineHeight: 40, color: c.text }}>
                    {form}
                  </Text>
                  <Text allowFontScaling={false} style={{ fontFamily: fonts.arabic, fontSize: 14, lineHeight: 24, color: c.textMuted }}>
                    {letters[i].base}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Button label={index + 1 < words.length ? t('play.nextWord') : t('common.continue')} iconRight="chevron" onPress={nextWord} fullWidth />
        </ScrollView>
      )}
    </View>
  );
}

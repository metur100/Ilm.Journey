import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, runOnJS } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art } from '@/core/art';
import type { PrayerPosition, PrayerVariant } from '@/core/art/pieces/sections/salahFigure';
import { SKIN_TONES } from '@/core/components/character/Avatar';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { HintPointer, Tile, useKitColors, type TileState } from '@/core/games/kit';
import { speakArabic } from '@/core/services/speech';
import { useRecitation } from '@/features/games/sections/quran/shared/recitation';
import { useAppStore } from '@/core/store/appStore';
import { radius, spacing } from '@/core/theme';

import type { CaptionLine } from './captions';
import type { PrayerDef } from './data/prayers';
import { PrayerFigure, STAGE_VIEW, type FigureView } from './figure/PrayerFigure';
import { swipeOf, type Gesture as Swipe } from './logic';

type T = (key: string, params?: Record<string, string | number>) => string;

/** The learner's figure: the hero's hijab / abaya → female, otherwise male; skin tone of the hero. */
export function useHeroFigure(): { variant: PrayerVariant; tint: string | undefined } {
  const character = useAppStore((s) => s.profile.character);
  return useMemo(
    () => ({
      variant: character?.headwear === 'hijab' || character?.outfit === 'abaya' ? 'female' : 'male',
      tint: character ? SKIN_TONES[character.skinTone] : undefined,
    }),
    [character],
  );
}

const DARK_SKIES = new Set(['dawn', 'sunset', 'night']);

export interface StageProps {
  prayer: PrayerDef;
  position: PrayerPosition;
  variant: PrayerVariant;
  tint?: string;
  width: number;
  height: number;
  reducedMotion: boolean;
  cues?: { gaze?: boolean; points?: boolean; arrows?: boolean; highlight?: boolean };
  /** Swipes / taps on the stage (pray along). */
  onGesture?: (g: Swipe) => void;
  /** Hint of the expected gesture (a finger moving over the stage). */
  hint?: Swipe | null;
  onSettled?: (p: PrayerPosition) => void;
  label?: string;
  /** Overlays inside the figure box (positioned with figurePoint). */
  children?: (figure: { width: number; view: FigureView; left: number; top: number }) => ReactNode;
}

/** The prayer place: time-of-day sky, the mat and the moving figure; swipes and taps on it are the prayer moves. */
export function Stage({ prayer, position, variant, tint, width, height, reducedMotion, cues, onGesture, hint, onSettled, label, children }: StageProps) {
  const k = useKitColors();
  const view = STAGE_VIEW;
  const figW = Math.min(width, (height * view[2]) / view[3]);
  const figH = (figW * view[3]) / view[2];
  const left = (width - figW) / 2;
  const top = height - figH;
  const dark = DARK_SKIES.has(prayer.sky);

  const gesture = useMemo(() => {
    const send = (g: Swipe) => onGesture?.(g);
    const swipe = (dx: number, dy: number) => {
      const g = swipeOf(dx, dy);
      if (g) send(g);
    };
    const pan = Gesture.Pan()
      .minDistance(14)
      .onEnd((e) => {
        runOnJS(swipe)(e.translationX, e.translationY);
      });
    const tap = Gesture.Tap().onEnd((_e, ok) => {
      if (ok) runOnJS(send)('tap');
    });
    return Gesture.Exclusive(pan, tap);
  }, [onGesture]);

  const cx = width / 2;
  const cy = height * 0.45;
  const d = Math.min(width, height) * 0.22;
  const hintTo = hint === 'up' ? { x: cx, y: cy - d } : hint === 'down' ? { x: cx, y: cy + d } : hint === 'left' ? { x: cx - d, y: cy } : hint === 'right' ? { x: cx + d, y: cy } : undefined;

  const body = (
    <View style={[styles.stage, { width, height, borderColor: k.boardBorder }]} accessible={!!label} accessibilityLabel={label} testID="prayer-stage">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Art name={`sky.${prayer.sky}`} size={width} height={height} fit="cover" />
      </View>
      <View style={{ position: 'absolute', left, top, width: figW, height: figH }} pointerEvents="box-none">
        <PrayerFigure position={position} variant={variant} tint={tint} width={figW} view={view} cues={cues} reducedMotion={reducedMotion} dark={dark} onSettled={onSettled} />
        {children?.({ width: figW, view, left, top })}
      </View>
      {hint ? <HintPointer from={{ x: cx, y: cy }} to={hintTo} visible size={40} /> : null}
    </View>
  );
  return onGesture ? <GestureDetector gesture={gesture}>{body}</GestureDetector> : body;
}

/** Chips of the prayer's parts (e.g. 4 sunnah · 4 fard · 2 sunnah) with the current one highlighted. */
export function PartsRow({ prayer, current, t }: { prayer: PrayerDef; current: number; t: T }) {
  const k = useKitColors();
  const items: { key: string; label: string; active: boolean }[] = [];
  prayer.parts.forEach((p, i) => {
    if (prayer.khutbahBefore === i) items.push({ key: 'khutbah', label: t('khutbah'), active: false });
    items.push({ key: p.id, label: t(`kind.${p.kind}`, { n: p.rakats }), active: i === current });
  });
  return (
    <View style={styles.parts} accessibilityRole="summary">
      {items.map((it) => (
        <View key={it.key} style={[styles.part, { backgroundColor: it.active ? k.accent : k.tileFace, borderColor: it.active ? k.accent : k.tileBorder }]}>
          <AppText variant="tiny" color={it.active ? k.onAccent : k.textMuted}>
            {it.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Rakat beads of the current part (filled = done / current). */
export function RakatBeads({ total, current, label }: { total: number; current: number; label: string }) {
  const k = useKitColors();
  return (
    <View style={styles.beads} accessible accessibilityLabel={label}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.bead, { backgroundColor: i < current ? k.gold : 'transparent', borderColor: i < current ? k.goldEdge : k.slotBorder }]} />
      ))}
    </View>
  );
}

export function VariantToggle({ variant, onChange, t }: { variant: PrayerVariant; onChange: (v: PrayerVariant) => void; t: T }) {
  const k = useKitColors();
  return (
    <View style={styles.toggle} accessibilityLabel={t('variant.label')}>
      {(['male', 'female'] as const).map((v) => (
        <Pressable
          key={v}
          onPress={() => onChange(v)}
          accessibilityRole="radio"
          accessibilityState={{ selected: v === variant }}
          accessibilityLabel={t(`variant.${v}`)}
          testID={`variant-${v}`}
          style={[styles.toggleItem, { backgroundColor: v === variant ? k.accentSoft : 'transparent', borderColor: v === variant ? k.accent : k.tileBorder }]}
        >
          <AppText variant="tiny" color={v === variant ? k.accentText : k.textMuted}>
            {t(`variant.${v}`)}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * What to do and what to say in the position: the movement in plain words, then every recitation with its Arabic,
 * transliteration and meaning (all lines, in full – the card scrolls); loud / quiet badge, "3×" for the tasbihs and a
 * speaker to hear the Arabic formulas (device voice; Quran text is not read by the speech engine).
 */
export function ReciteCard({ title, lines, voice, how, howLabel, t }: { title: string; lines: CaptionLine[]; voice?: string; how?: string; howLabel?: string; t?: T }) {
  const k = useKitColors();
  return (
    <Animated.View key={title + lines.map((l) => l.key).join()} entering={FadeIn.duration(220)} style={[styles.card, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]} accessibilityLiveRegion="polite" testID="recite-card">
      <View style={styles.cardHead}>
        <AppText variant="bodyBold" color={k.text} style={styles.flex}>
          {title}
        </AppText>
        {voice ? (
          <View style={[styles.badge, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]}>
            <AppText variant="tiny" color={k.text}>
              {voice}
            </AppText>
          </View>
        ) : null}
      </View>
      {how ? (
        <View style={[styles.how, { backgroundColor: k.accentSoft }]} testID="recite-how">
          {howLabel ? (
            <AppText variant="tiny" color={k.accentText}>
              {howLabel}
            </AppText>
          ) : null}
          <AppText variant="small" color={k.text}>
            {how}
          </AppText>
        </View>
      ) : null}
      {lines.map((line) => (
        <View key={line.key} style={styles.line}>
          <View style={styles.lineHead}>
            <AppText variant="small" color={k.accentText} style={styles.flex}>
              {line.name}
              {line.times && t ? `  ·  ${t('times', { n: line.times })}` : ''}
              {line.ref ? `  (${line.ref})` : ''}
            </AppText>
            {line.ayahs?.length ? (
              <ReciterButton ayahs={line.ayahs} label={line.name} testID={`listen-${line.key}`} />
            ) : line.arabic && line.script === 'arabic' ? (
              <Pressable onPress={() => speakArabic(line.arabic ?? '')} accessibilityRole="button" accessibilityLabel={line.translit ?? line.name} hitSlop={6} testID={`listen-${line.key}`} style={({ pressed }) => [styles.listen, { borderColor: k.tileBorder, opacity: pressed ? 0.7 : 1 }]}>
                <Icon name="speaker" size={18} color={k.accent} />
              </Pressable>
            ) : null}
          </View>
          {line.arabic ? (
            <AppText variant="heading" script={line.script ?? 'arabic'} align="right" color={k.text}>
              {line.arabic}
            </AppText>
          ) : null}
          {line.translit ? (
            <AppText variant="small" color={k.text} style={styles.italic}>
              {line.translit}
            </AppText>
          ) : null}
          {line.meaning ? (
            <AppText variant="tiny" color={k.textMuted}>
              {line.meaning}
            </AppText>
          ) : null}
        </View>
      ))}
    </Animated.View>
  );
}

/** Quran parts are recited by a reciter (streamed, Mishary Alafasy) – not by the device voice. Tap again to stop. */
function ReciterButton({ ayahs, label, testID }: { ayahs: number[]; label: string; testID: string }) {
  const k = useKitColors();
  const { state, toggle } = useRecitation();
  const busy = state === 'loading' || state === 'playing';
  if (state === 'unavailable') return <Icon name="speaker" size={18} color={k.textMuted} />;
  return (
    <Pressable onPress={() => toggle(ayahs)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy }} hitSlop={6} testID={testID} style={({ pressed }) => [styles.listen, { borderColor: busy ? k.gold : k.tileBorder, backgroundColor: busy ? k.goldSoft : 'transparent', opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={busy ? 'stop' : 'speaker'} size={18} color={k.accent} />
    </Pressable>
  );
}

/** A big tappable tile with a test id (choices, the move button). */
export function ChoiceButton({ testID, label, art, artTint, onPress, state = 'idle', width, sub, glow }: { testID: string; label: string; art?: string; artTint?: string; onPress: () => void; state?: TileState; width?: number; sub?: string; glow?: boolean }) {
  const k = useKitColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={width ? { width } : styles.flex}>
      <Tile state={state} glow={glow} minHeight={48} padding={spacing.xs}>
        <View style={styles.choice}>
          {art ? <Art name={art} size={Math.min(110, (width ?? 110) - 12)} tint={artTint} /> : null}
          <AppText variant="small" align="center" color={k.tileText}>
            {label}
          </AppText>
          {sub ? (
            <AppText variant="tiny" align="center" color={k.textMuted}>
              {sub}
            </AppText>
          ) : null}
        </View>
      </Tile>
    </Pressable>
  );
}

/** Thin leader line from a bubble to a point (sajda points overlay). */
export function Leader({ width, height, lines, color }: { width: number; height: number; lines: { x1: number; y1: number; x2: number; y2: number; on: boolean }[]; color: string }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((l, i) => (
        <Path key={i} d={`M${l.x1} ${l.y1}L${l.x2} ${l.y2}`} stroke={color} strokeWidth={l.on ? 2 : 1.2} strokeDasharray={l.on ? undefined : '3 4'} opacity={l.on ? 0.95 : 0.7} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stage: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, alignSelf: 'center' },
  parts: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  part: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1 },
  beads: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  bead: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  toggle: { flexDirection: 'row', gap: 4 },
  toggleItem: { minHeight: 32, paddingHorizontal: 10, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1 },
  card: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 4 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  line: { gap: 2, paddingTop: 4 },
  lineHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  how: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 6, gap: 2 },
  listen: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  italic: { fontStyle: 'italic' },
  choice: { alignItems: 'center', gap: 2 },
});

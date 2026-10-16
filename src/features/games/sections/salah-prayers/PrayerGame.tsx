import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { sajdaPoints, type PrayerPosition, type PrayerVariant, type SajdaPointId } from '@/core/art/pieces/sections/salahFigure';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { GameBoard, InlineCaption, kitResult, SequenceBoard, useIdleHint, useKitColors, type CaptionTone, type KitItem } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { captionLine, stepCaption } from './captions';
import { mainPart, partOutline, type PrayerId, prayerDef, type PrayerStep, partSteps, RAKAT_ORDER, type Move } from './data/prayers';
import { figurePoint } from './figure/PrayerFigure';
import { expectedReading, GESTURE, leadOptions, leadSteps, MOVE_POSITION, readsFatiha, type Gesture } from './logic';
import { ChoiceButton, Leader, PartsRow, RakatBeads, ReciteCard, Stage, useHeroFigure, VariantToggle } from './parts';

export type PlayMode = 'along' | 'order' | 'lead';
export type RoundKind = 'rakat' | 'outline' | 'parts' | 'sitting' | 'kunut';

export interface PrayerGameConfig {
  prayer: PrayerId | 'guide';
  mode: PlayMode;
  /** Order mode: the rounds (each a SequenceBoard). */
  rounds?: RoundKind[];
}

type Api = GameApi<PrayerGameConfig>;

/** Fact ids that a mistake on a movement points to (the first one present in the level is reported). */
const MOVE_FACTS: Record<Move, string[]> = {
  takbir: ['takbir-hands'],
  'kunut-takbir': ['vitr-kunut', 'takbir-hands'],
  fold: ['hands-folded'],
  bow: ['ruku-level-back'],
  rise: ['calm-positions'],
  prostrate: ['sajda-seven'],
  'sit-up': ['calm-positions', 'sitting-hanafi'],
  'stand-up': ['two-sittings'],
  sit: ['two-sittings', 'sitting-hanafi'],
  finger: ['tashahhud-finger'],
  'selam-right': ['selam-sides'],
  'selam-left': ['selam-sides'],
};

export const figArt = (position: PrayerPosition, variant: PrayerVariant) => `salah.prayer-${position}${variant === 'female' ? '-female' : ''}`;

function useMissed(api: Api) {
  const ids = useMemo(() => new Set(api.facts.map((f) => f.id)), [api.facts]);
  const missed = useRef<string[]>([]);
  const add = useCallback(
    (candidates: string[]) => {
      const id = candidates.find((c) => ids.has(c)) ?? api.facts[0]?.id;
      if (id && !missed.current.includes(id)) missed.current.push(id);
    },
    [ids, api.facts],
  );
  return { missed, add };
}

/**
 * One game of the salah-prayers section. The level decides the play:
 * - `along`: pray along with the moving figure – every movement is a gesture on the prayer place;
 * - `order`: put the positions / rakats / parts of the prayer in order (SequenceBoard);
 * - `lead`: lead the prayer yourself – choose each movement, sit or stand, count the rakats, choose what to recite.
 */
export function PrayerGame(api: Api) {
  const hero = useHeroFigure();
  const [variant, setVariant] = useState<PrayerVariant>(hero.variant);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.w) > 1 || Math.abs(height - size.h) > 1) setSize({ w: width, h: height });
  };
  const w = size.w || 340;
  const h = size.h || 620;
  const props = { api, variant, tint: hero.tint, w, h };
  return (
    <GameBoard api={api as GameApi<unknown>} topic="salah" padding={spacing.sm}>
      <View style={styles.root} onLayout={onLayout}>
        {api.config.mode === 'order' ? (
          <OrderPlay {...props} onVariant={setVariant} />
        ) : api.config.mode === 'lead' ? (
          <LeadPlay {...props} onVariant={setVariant} />
        ) : (
          <AlongPlay {...props} onVariant={setVariant} />
        )}
      </View>
    </GameBoard>
  );
}

interface PlayProps {
  api: Api;
  variant: PrayerVariant;
  tint?: string;
  w: number;
  h: number;
  onVariant: (v: PrayerVariant) => void;
}

const stageHeight = (w: number, h: number, share: number) => Math.round(Math.max(180, Math.min(h * share, w * 0.82)));

function TopRow({ api, variant, onVariant, rakat, total, counted }: { api: Api; variant: PrayerVariant; onVariant: (v: PrayerVariant) => void; rakat?: number; total?: number; counted?: number }) {
  const prayer = prayerDef(api.config.prayer);
  const k = useKitColors();
  return (
    <View style={styles.gap4}>
      <View style={styles.row}>
        <PartsRow prayer={prayer} current={prayer.main} t={api.t} />
        <VariantToggle variant={variant} onChange={onVariant} t={api.t} />
      </View>
      {total ? (
        <View style={styles.row}>
          <RakatBeads total={total} current={counted ?? rakat ?? 0} label={api.t('rakat', { n: rakat ?? 0, total })} />
          {rakat ? (
            <AppText variant="tiny" color={k.textMuted}>
              {api.t('rakat', { n: rakat, total })}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const voiceOf = (step: PrayerStep | null, variant: PrayerVariant, t: Api['t']): string | undefined => {
  if (!step || !step.recite.includes('fatiha')) return undefined;
  if (variant === 'female') return t('quiet.female');
  return step.aloud ? t('aloud') : t('quiet');
};

function titleOf(position: PrayerPosition, step: PrayerStep | null, t: Api['t']): string {
  const base = t(`pos.${position}`);
  return step?.sitting && (step.move === 'sit' || step.move === 'finger') ? `${base} · ${t(`sitting.${step.sitting}`)}` : base;
}

// ---------------------------------------------------------------------------------------------------------------
// L1 – pray along

function AlongPlay({ api, variant, tint, w, h, onVariant }: PlayProps) {
  const prayer = prayerDef(api.config.prayer);
  const part = mainPart(api.config.prayer);
  const steps = useMemo(() => partSteps(part), [part]);
  const k = useKitColors();
  const [idx, setIdx] = useState(-1);
  const [points, setPoints] = useState<SajdaPointId[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; tone: CaptionTone } | null>(null);
  const mistakes = useRef(0);
  const done = useRef(false);
  const { missed, add } = useMissed(api);
  const cur = idx >= 0 ? steps[idx] : null;
  const next = steps[idx + 1];
  const position: PrayerPosition = cur ? cur.position : 'qiyam';
  const pointsActive = !!cur?.firstSajda && points.length < 7;
  const finished = idx === steps.length - 1;
  const idle = useIdleHint(!finished && !pointsActive, idx * 10 + points.length, 3500);
  const showHint = !finished && !pointsActive && (idx < 1 || idle);

  useEffect(() => {
    api.setProgress?.(idx + 1, steps.length);
  }, [api, idx, steps.length]);

  const complete = useCallback(() => {
    if (done.current) return;
    done.current = true;
    api.playSound('success');
    api.onComplete(kitResult({ moves: steps.length + 7, mistakes: mistakes.current, factsMissed: missed.current }));
  }, [api, steps.length, missed]);

  const perform = useCallback(
    (g: Gesture) => {
      if (finished || pointsActive || !next) return;
      if (g === GESTURE[next.move]) {
        setFeedback(null);
        api.haptic('tap');
        setIdx((i) => i + 1);
      } else {
        mistakes.current += 1;
        add(MOVE_FACTS[next.move]);
        api.haptic('warning');
        setFeedback({ text: api.t('tryAgain'), tone: 'wrong' });
      }
    },
    [finished, pointsActive, next, api, add],
  );

  const onSettled = useCallback(() => {
    if (finished) setTimeout(complete, 700);
  }, [finished, complete]);

  const tapPoint = (id: SajdaPointId) => {
    if (points.includes(id)) return;
    api.playSound('click');
    api.haptic('selection');
    const nextPoints = [...points, id];
    setPoints(nextPoints);
    setFeedback({ text: `${api.t(`pt.${id}`)} · ${api.t('points.count', { n: nextPoints.length })}`, tone: nextPoints.length === 7 ? 'right' : 'info' });
  };

  const stageH = stageHeight(w, h, 0.46);
  const lines = cur ? stepCaption(cur, api.t, api.l) : [captionLine('niyyah', { rakat: 1 }, api.t, api.l)];
  const caption = feedback ?? (finished ? { text: api.t('along.done', { part: api.t(`kind.${part.kind}`, { n: part.rakats }) }), tone: 'right' as const } : pointsActive ? { text: api.t('points.prompt'), tone: 'hint' as const } : next ? { text: api.t(`move.${next.move}`), tone: 'info' as const } : null);
  const sajdaPts = useMemo(() => sajdaPoints(variant), [variant]);

  return (
    <View style={styles.play}>
      <TopRow api={api} variant={variant} onVariant={onVariant} rakat={cur?.rakat ?? 1} total={part.rakats} />
      <Stage
        prayer={prayer}
        position={position}
        variant={variant}
        tint={tint}
        width={w}
        height={stageH}
        reducedMotion={api.reducedMotion}
        cues={{ gaze: true, points: !pointsActive, arrows: true, highlight: true }}
        onGesture={perform}
        hint={showHint && next ? GESTURE[next.move] : null}
        onSettled={onSettled}
        label={titleOf(position, cur, api.t)}
      >
        {(fig) =>
          pointsActive ? (
            <SajdaBubbles points={sajdaPts} tapped={points} onTap={tapPoint} width={fig.width} view={fig.view} t={api.t} color={k.gold} />
          ) : null
        }
      </Stage>
      <ReciteCard title={titleOf(position, cur, api.t)} lines={lines} voice={voiceOf(cur, variant, api.t)} compact={h < 600} />
      <InlineCaption text={caption?.text} tone={caption?.tone} />
      {next && !pointsActive ? (
        <ChoiceButton testID={`move-${next.move}`} label={api.t(`do.${next.move}`)} onPress={() => perform(GESTURE[next.move])} glow={idle} />
      ) : null}
    </View>
  );
}

const POINT_ORDER: SajdaPointId[] = ['toes-left', 'toes-right', 'knee-left', 'knee-right', 'hand-left', 'forehead', 'hand-right'];

/** The 7 points of sajda as bubbles in a row above the figure, each with a leader line to its place on the body. */
function SajdaBubbles({ points, tapped, onTap, width, view, t, color }: { points: { id: SajdaPointId; x: number; y: number }[]; tapped: SajdaPointId[]; onTap: (id: SajdaPointId) => void; width: number; view: [number, number, number, number]; t: Api['t']; color: string }) {
  const k = useKitColors();
  const size = 36;
  const gap = (width - size) / (POINT_ORDER.length - 1);
  const top = 6;
  const items = POINT_ORDER.map((id, i) => {
    const p = points.find((q) => q.id === id)!;
    const at = figurePoint(p.x, p.y, width, view);
    return { id, bx: i * gap + size / 2, by: top + size / 2 + (i % 2) * 14, px: at.left, py: at.top, on: tapped.includes(id) };
  });
  const height = (width * view[3]) / view[2];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Leader width={width} height={height} color={color} lines={items.map((it) => ({ x1: it.bx, y1: it.by, x2: it.px, y2: it.py, on: it.on }))} />
      {items.map((it) =>
        it.on ? <View key={`g${it.id}`} pointerEvents="none" style={[styles.glowDot, { left: it.px - 8, top: it.py - 8, backgroundColor: k.gold, borderColor: k.goldEdge }]} /> : null,
      )}
      {items.map((it) => (
        <Pressable
          key={it.id}
          onPress={() => onTap(it.id)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t(`pt.${it.id}`)}
          accessibilityState={{ selected: it.on }}
          testID={`point-${it.id}`}
          style={[styles.bubble, { left: it.bx - size / 2, top: it.by - size / 2, width: size, height: size, backgroundColor: it.on ? k.gold : k.tileFace, borderColor: it.on ? k.goldEdge : k.gold }]}
        >
          <AppText variant="tiny" color={it.on ? k.onGold : k.text}>
            {it.on ? String(tapped.indexOf(it.id) + 1) : '·'}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// L3 – lead it yourself

type LeadPhase = 'move' | 'counter' | 'recite';

function LeadPlay({ api, variant, tint, w, h, onVariant }: PlayProps) {
  const prayer = prayerDef(api.config.prayer);
  const part = mainPart(api.config.prayer);
  const steps = useMemo(() => leadSteps(part), [part]);
  const [idx, setIdx] = useState(-1);
  const [phase, setPhase] = useState<LeadPhase>('move');
  const [counted, setCounted] = useState(0);
  const [surahPick, setSurahPick] = useState<boolean | null>(null);
  const [voicePick, setVoicePick] = useState<boolean | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: CaptionTone } | null>(null);
  const mistakes = useRef(0);
  const decisions = useRef(0);
  const done = useRef(false);
  const { missed, add } = useMissed(api);
  const cur = idx >= 0 ? steps[idx] : null;
  const next = steps[idx + 1];
  const position: PrayerPosition = cur ? cur.position : 'qiyam';
  const finished = idx === steps.length - 1;
  const options = useMemo(() => (next ? leadOptions(steps, idx + 1, `${api.gameId}:${api.level}`) : []), [steps, idx, next, api.gameId, api.level]);
  const askVoice = part.aloud !== 'quiet';

  useEffect(() => {
    api.setProgress?.(idx + 1, steps.length);
  }, [api, idx, steps.length]);

  const complete = useCallback(() => {
    if (done.current) return;
    done.current = true;
    api.playSound('success');
    api.onComplete(kitResult({ moves: decisions.current, mistakes: mistakes.current, factsMissed: missed.current }));
  }, [api, missed]);

  const onSettled = useCallback(() => {
    if (finished) setTimeout(complete, 700);
  }, [finished, complete]);

  const miss = (facts: string[], key: string) => {
    mistakes.current += 1;
    add(facts);
    api.haptic('warning');
    setWrong(key);
    setFeedback({ text: api.t('lead.wrong'), tone: 'wrong' });
  };
  const right = () => {
    decisions.current += 1;
    api.haptic('tap');
    setWrong(null);
    setFeedback({ text: api.t('lead.right'), tone: 'right' });
  };

  const choose = (move: Move) => {
    if (!next || phase !== 'move') return;
    if (move !== next.move) return miss(MOVE_FACTS[next.move], move);
    right();
    setIdx((i) => i + 1);
    if (next.move === 'fold' && next.rakat === 1 && counted === 0) setCounted(1);
    if (next.move === 'stand-up') setPhase('counter');
    else if (readsFatiha(next)) {
      setSurahPick(null);
      setVoicePick(null);
      setPhase('recite');
    }
  };

  const count = (n: number) => {
    if (!cur) return;
    if (n !== cur.rakat) return miss(['two-sittings', `${api.config.prayer}-parts`], `count-${n}`);
    right();
    setCounted(n);
    setSurahPick(null);
    setVoicePick(null);
    setPhase(readsFatiha(cur) ? 'recite' : 'move');
  };

  const recite = () => {
    if (!cur) return;
    const want = expectedReading(cur, variant);
    const voiceOk = !askVoice || voicePick === want.aloud;
    if (surahPick !== want.surah || !voiceOk) {
      setSurahPick(null);
      setVoicePick(null);
      return miss(surahPick !== want.surah ? ['fard-fatiha-only', `${api.config.prayer}-parts`] : [`${api.config.prayer}-aloud`, `${api.config.prayer}-parts`], 'recite');
    }
    right();
    setPhase('move');
  };

  const stageH = stageHeight(w, h, phase === 'move' ? 0.36 : 0.4);
  const tileW = Math.floor((w - spacing.sm * 2) / 3);
  const lines = cur && phase === 'move' ? stepCaption(cur, api.t, api.l) : [];
  const prompt = finished ? api.t('along.done', { part: api.t(`kind.${part.kind}`, { n: part.rakats }) }) : phase === 'counter' ? api.t('lead.counter') : phase === 'recite' ? api.t('lead.recite') : api.t('lead.next');

  return (
    <View style={styles.play}>
      <TopRow api={api} variant={variant} onVariant={onVariant} total={part.rakats} counted={counted} />
      <Stage prayer={prayer} position={position} variant={variant} tint={tint} width={w} height={stageH} reducedMotion={api.reducedMotion} cues={{ arrows: true, highlight: true }} onSettled={onSettled} label={titleOf(position, cur, api.t)} />
      {phase === 'move' && cur && lines.length ? <ReciteCard title={titleOf(position, cur, api.t)} lines={lines} voice={voiceOf(cur, variant, api.t)} compact /> : null}
      <InlineCaption text={feedback?.text ?? prompt} tone={feedback?.tone ?? 'info'} />
      {!finished && phase === 'move' ? (
        <View style={styles.choices}>
          {options.map((m) => (
            <ChoiceButton key={m} testID={`opt-${m}`} width={tileW} art={figArt(MOVE_POSITION[m], variant)} artTint={tint} label={api.t(`do.${m}`)} state={wrong === m ? 'wrong' : 'idle'} onPress={() => choose(m)} />
          ))}
        </View>
      ) : null}
      {!finished && phase === 'counter' ? (
        <View style={styles.choices}>
          {Array.from({ length: part.rakats }, (_, i) => i + 1).map((n) => (
            <ChoiceButton key={n} testID={`count-${n}`} label={api.t('out.rakat', { n })} state={wrong === `count-${n}` ? 'wrong' : 'idle'} onPress={() => count(n)} />
          ))}
        </View>
      ) : null}
      {!finished && phase === 'recite' ? (
        <View style={styles.gap8}>
          <View style={styles.choices}>
            <ChoiceButton testID="recite-surah" label={api.t('lead.fatihaSurah')} state={surahPick === true ? 'selected' : 'idle'} onPress={() => setSurahPick(true)} />
            <ChoiceButton testID="recite-only" label={api.t('lead.fatihaOnly')} state={surahPick === false ? 'selected' : 'idle'} onPress={() => setSurahPick(false)} />
          </View>
          {askVoice ? (
            <View style={styles.choices}>
              <ChoiceButton testID="voice-aloud" label={api.t('aloud')} state={voicePick === true ? 'selected' : 'idle'} onPress={() => setVoicePick(true)} />
              <ChoiceButton testID="voice-quiet" label={variant === 'female' ? api.t('quiet.female') : api.t('quiet')} state={voicePick === false ? 'selected' : 'idle'} onPress={() => setVoicePick(false)} />
            </View>
          ) : null}
          <ChoiceButton testID="recite-check" label={api.t('lead.check')} state={surahPick !== null && (!askVoice || voicePick !== null) ? 'right' : 'disabled'} onPress={() => surahPick !== null && (!askVoice || voicePick !== null) && recite()} />
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// L2 – put it in order

function roundItems(kind: RoundKind, api: Api, variant: PrayerVariant): { items: KitItem[]; prompt: string } {
  const prayer = prayerDef(api.config.prayer);
  const part = mainPart(api.config.prayer);
  const t = api.t;
  const art = (p: PrayerPosition) => figArt(p, variant);
  const partLabel = t(`kind.${part.kind}`, { n: part.rakats });
  switch (kind) {
    case 'rakat':
      return {
        prompt: t('order.rakat'),
        items: RAKAT_ORDER.map((r, i) => ({ id: `${r.position}-${i}`, art: art(r.position), label: i === 5 ? t('pos.sajda2') : t(`pos.${r.position}`) })),
      };
    case 'outline':
      return {
        prompt: t('order.outline', { part: partLabel }),
        items: partOutline(part).map((o, i) => {
          if (o.kind === 'takbir') return { id: 'takbir', art: art('takbir'), label: t('out.takbir') };
          if (o.kind === 'rakat') return { id: `rakat-${o.n}`, art: art('folded'), label: t('out.rakat', { n: o.n }) };
          if (o.kind === 'sitting') return { id: `sitting-${o.which}`, art: art('tashahhud'), label: t(`sitting.${o.which}`) };
          if (o.kind === 'kunut') return { id: 'kunut', art: art('takbir'), label: t('out.kunut') };
          return { id: `selam-${i}`, art: art('selam-right'), label: t('out.selam') };
        }),
      };
    case 'parts': {
      const items: KitItem[] = [];
      prayer.parts.forEach((p, i) => {
        if (prayer.khutbahBefore === i) items.push({ id: 'khutbah', art: 'object.quran-stand', label: t('khutbah') });
        items.push({ id: `part-${p.id}`, art: p.kind === 'fard' ? art('ruku') : p.kind === 'vitr' ? art('takbir') : art('folded'), label: t(`kind.${p.kind}`, { n: p.rakats }) });
      });
      return { prompt: t('order.parts', { prayer: t(`prayer.${prayer.id}`) }), items };
    }
    case 'sitting':
      return {
        prompt: t('order.sitting'),
        items: [
          { id: 'tashahhud', art: art('tashahhud'), label: t('say.tashahhud') },
          { id: 'salavat', art: art('jalsa'), label: t('say.salavat') },
          { id: 'rabbena', art: art('dua'), label: captionLine('rabbena', { rakat: 1 }, t, api.l).name },
          { id: 'selam-right', art: art('selam-right'), label: t('pos.selam-right') },
          { id: 'selam-left', art: art('selam-left'), label: t('pos.selam-left') },
        ],
      };
    case 'kunut':
      return {
        prompt: t('order.kunut'),
        items: [
          { id: 'fatiha', art: art('folded'), label: t('say.fatiha') },
          { id: 'surah', art: art('folded'), label: t('out.surah') },
          { id: 'kunut-takbir', art: art('takbir'), label: t('out.kunutTakbir') },
          { id: 'kunut', art: art('folded'), label: t('say.kunut') },
          { id: 'ruku', art: art('ruku'), label: t('pos.ruku') },
        ],
      };
  }
}

const ROUND_FACTS: Record<RoundKind, (prayer: string) => string[]> = {
  rakat: () => ['sajda-seven', 'ruku-level-back', 'calm-positions'],
  outline: (p) => ['two-sittings', `${p}-parts`],
  parts: (p) => [`${p}-parts`],
  sitting: () => ['two-sittings', 'tashahhud-finger', 'selam-sides'],
  kunut: () => ['vitr-kunut'],
};

function OrderPlay({ api, variant, onVariant }: PlayProps) {
  const rounds = api.config.rounds ?? ['rakat'];
  const [round, setRound] = useState(0);
  const mistakes = useRef(0);
  const moves = useRef(0);
  const { missed, add } = useMissed(api);
  const { items, prompt } = useMemo(() => roundItems(rounds[round], api, variant), [rounds, round, api, variant]);
  const k = useKitColors();

  const onDone = (info: { mistakes: number }) => {
    mistakes.current += info.mistakes;
    moves.current += items.length;
    if (info.mistakes > 0) add(ROUND_FACTS[rounds[round]](api.config.prayer));
    if (round + 1 < rounds.length) setRound(round + 1);
    else api.onComplete(kitResult({ moves: moves.current, mistakes: mistakes.current, factsMissed: missed.current }));
  };

  return (
    <View style={styles.play}>
      <TopRow api={api} variant={variant} onVariant={onVariant} />
      <AppText variant="tiny" color={k.textMuted} align="center">
        {`${round + 1} / ${rounds.length}`}
      </AppText>
      <View style={styles.flex}>
        <SequenceBoard key={`${round}-${variant}`} items={items} prompt={prompt} onDone={onDone} seed={`${api.gameId}:${api.level}:${round}`} testID={`order-${rounds[round]}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  play: { flex: 1, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'space-between' },
  gap4: { gap: 4 },
  gap8: { gap: spacing.sm },
  choices: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  bubble: { position: 'absolute', borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  glowDot: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
});

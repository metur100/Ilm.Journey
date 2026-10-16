import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, FinishReveal, GameBoard, Glow, InlineCaption, kitResult, ProgressDots, Tile, useKitColors, useShake } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

import { useEngineCore, useKitProbe, useMeasure } from '../shared/kit';
import { addPiece, bestPiece, piecesNeeded, type ScaleConfig, sum, tilt } from './logic';

const PAN_W = 112;

/** A piece on a pan or in the tray: art + its number. */
function Piece({ art, count, size }: { art: string; count?: number; size: number }) {
  const k = useKitColors();
  return (
    <View style={styles.piece}>
      <Art name={art} size={size} />
      {count !== undefined ? (
        <View style={[styles.badge, { backgroundColor: k.accent, borderColor: k.tileFace }]}>
          <AppText variant="tiny" color={k.onAccent} style={{ fontFamily: fonts.heavy }}>
            {String(count)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function Scale({ cfg, t, onDone, missFact }: { cfg: ScaleConfig; t: GameApi<ScaleConfig>['t']; onDone: (mistakes: number) => void; missFact: string }) {
  const moves = useMemo(() => cfg.rounds.reduce((a, r) => a + piecesNeeded(r.load, cfg.pieces), 0), [cfg]);
  const prompt = cfg.mode === 'measure' ? 'play.promptMeasure' : cfg.showLoad ? 'play.promptWeigh' : 'play.promptBlind';
  const core = useEngineCore({ onDone: ({ mistakes }) => onDone(mistakes), prompt: t(prompt), hints: cfg.hints, testID: 'shuayb-scales' }, moves);
  const k = core.k;
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [balanced, setBalanced] = useState(false);
  const [finished, setFinished] = useState(false);
  const [doneMoves, setDoneMoves] = useState(0);
  const [pop, setPop] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { style: shakeStyle, shake } = useShake();
  const area = useMeasure();
  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  const load = cfg.rounds[round]?.load ?? 0;
  const added = sum(placed);
  // weigh: the load (grain) is on the left; measure: the load (weights) is on the right.
  const left = cfg.mode === 'weigh' ? load : added;
  const right = cfg.mode === 'weigh' ? added : load;
  const deg = tilt(left, right);

  const angle = useSharedValue(deg);
  useEffect(() => {
    angle.set(core.reduced ? withTiming(deg, { duration: 120 }) : withSpring(deg, { damping: 9, stiffness: 90 }));
  }, [deg, angle, core.reduced]);
  const beamW = Math.min(300, Math.max(220, area.w - 24));
  const half = beamW / 2 - 18;
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const leftPan = useAnimatedStyle(() => ({ transform: [{ translateY: -Math.sin((angle.value * Math.PI) / 180) * half }] }));
  const rightPan = useAnimatedStyle(() => ({ transform: [{ translateY: Math.sin((angle.value * Math.PI) / 180) * half }] }));

  const add = (piece: number) => {
    if (balanced || finished || core.finishedRef.current) return;
    const result = addPiece(load, placed, piece);
    if (result === 'over') {
      shake();
      core.wrong(missFact, t('play.over'));
      return;
    }
    const next = [...placed, piece];
    setPlaced(next);
    setPop((p) => p + 1);
    const nextMoves = doneMoves + 1;
    setDoneMoves(nextMoves);
    core.progress(Math.min(moves, nextMoves));
    if (result === 'balanced') {
      setBalanced(true);
      core.right({ caption: t('play.balanced') });
      timer.current = setTimeout(
        () => {
          setBalanced(false);
          setPlaced([]);
          if (round + 1 < cfg.rounds.length) setRound(round + 1);
          else {
            core.progress(moves);
            setFinished(true);
          }
        },
        core.reduced ? 200 : 1100,
      );
    } else {
      core.touch();
      core.setCaption({ text: t('play.more'), tone: 'info' });
    }
  };

  const remove = (index: number) => {
    if (balanced || finished) return;
    setPlaced(placed.filter((_, i) => i !== index));
    core.touch();
  };

  useKitProbe({
    engine: 'ShuaybScales',
    testID: 'shuayb-scales',
    step: () => {
      if (core.finishedRef.current) return false;
      if (finished) {
        core.finish(0);
        return true;
      }
      if (balanced) return true; // the next customer is coming
      const p = bestPiece(load, placed, cfg.pieces);
      if (p !== null) add(p);
      else remove(placed.length - 1);
      return true;
    },
    mistake: () => {
      if (balanced || finished) return false;
      const rest = load - added;
      const big = cfg.pieces.find((p) => p > rest);
      if (big === undefined) return false;
      add(big);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const pieceArt = cfg.mode === 'weigh' ? 'prophet.shuayb-weight' : 'prophet.shuayb-measure';
  const pieceLabel = (n: number) => t(cfg.mode === 'weigh' ? 'play.weight' : 'play.scoop', { count: n });
  const fixed = (
    <Piece art={cfg.mode === 'weigh' ? 'object.grain-sack' : 'prophet.shuayb-weight'} count={cfg.showLoad || cfg.mode === 'measure' ? load : undefined} size={52} />
  );
  const addedPieces = (
    <View style={styles.panPieces}>
      {placed.map((n, i) => (
        <Pressable key={`${round}-${i}`} onPress={() => remove(i)} accessibilityRole="button" accessibilityLabel={t('a11y.remove', { piece: pieceLabel(n) })} testID={`pan-${i}`}>
          <Piece art={pieceArt} count={n} size={26} />
        </Pressable>
      ))}
    </View>
  );
  const beamState = deg === 0 ? t('a11y.level') : deg < 0 ? t('a11y.leftDown') : t('a11y.rightDown');
  const nextHint = cfg.hints ? bestPiece(load, placed, cfg.pieces) : null;

  return (
    <View style={styles.root}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <ProgressDots total={cfg.rounds.length} done={finished ? cfg.rounds.length : round} label={t('play.round', { number: Math.min(round + 1, cfg.rounds.length), total: cfg.rounds.length })} />
      <View style={styles.scaleArea} onLayout={area.onLayout} accessible accessibilityLabel={t('a11y.beam', { state: beamState })}>
        <Animated.View style={[styles.scale, { width: beamW }, shakeStyle]}>
          <View style={[styles.post, { backgroundColor: k.tileEdge }]} />
          <View style={[styles.base, { backgroundColor: k.tileEdge }]} />
          <Animated.View style={[styles.beam, { width: beamW, backgroundColor: k.gold }, beamStyle]}>
            <View style={[styles.pivot, { backgroundColor: k.goldEdge }]} />
          </Animated.View>
          <Animated.View style={[styles.pan, { left: 0 }, leftPan]}>
            <View style={styles.panContent}>{cfg.mode === 'weigh' ? fixed : addedPieces}</View>
            <View style={[styles.dish, { backgroundColor: k.gold, borderColor: k.goldEdge }]} />
          </Animated.View>
          <Animated.View style={[styles.pan, { right: 0 }, rightPan]}>
            <View style={styles.panContent}>{cfg.mode === 'weigh' ? addedPieces : fixed}</View>
            <View style={[styles.dish, { backgroundColor: k.gold, borderColor: k.goldEdge }]} />
          </Animated.View>
          <View style={styles.burst}>
            <Burst trigger={balanced ? pop : 0} distance={70} />
          </View>
        </Animated.View>
      </View>
      <View style={styles.tray}>
        {cfg.pieces.map((n) => (
          <Pressable key={n} onPress={() => add(n)} accessibilityRole="button" accessibilityLabel={pieceLabel(n)} testID={`tile-p${n}`}>
            <Tile state={balanced ? 'disabled' : 'idle'} width={76} minHeight={76}>
              {nextHint === n ? <Glow active radius={radius.md} spread={3} /> : null}
              <Piece art={pieceArt} count={n} size={40} />
            </Tile>
          </Pressable>
        ))}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={finished} art="prophet.shuayb-scales" title={t('play.doneTitle')} caption={t('play.doneText')} onContinue={() => core.finish(0)} artSize={180} />
    </View>
  );
}

/** Fair Measure (Shuayb, Quran 7:85, 11:84–85, 26:181–183): balance the scales exactly, round after round. */
export function ShuaybScalesGame(api: GameApi<ScaleConfig>) {
  const moves = useMemo(() => api.config.rounds.reduce((a, r) => a + piecesNeeded(r.load, api.config.pieces), 0), [api.config]);
  const fact = api.facts[0]?.id ?? 'full-measure';
  return (
    <GameBoard api={api}>
      <Scale cfg={api.config} t={api.t} missFact={fact} onDone={(mistakes) => api.onComplete(kitResult({ moves, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  scaleArea: { flex: 1, minHeight: 230, alignItems: 'center', justifyContent: 'center' },
  scale: { height: 220, alignItems: 'center' },
  post: { position: 'absolute', top: 40, width: 10, height: 160, borderRadius: 5 },
  base: { position: 'absolute', bottom: 0, width: 110, height: 16, borderRadius: 8 },
  beam: { position: 'absolute', top: 36, height: 9, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  pivot: { width: 18, height: 18, borderRadius: 9 },
  pan: { position: 'absolute', top: 40, width: PAN_W, alignItems: 'center' },
  panContent: { minHeight: 90, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 2 },
  panPieces: { flexDirection: 'row', flexWrap: 'wrap-reverse', justifyContent: 'center', maxWidth: PAN_W, gap: 2 },
  dish: { width: PAN_W, height: 16, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, borderWidth: 1.5 },
  piece: { alignItems: 'center', justifyContent: 'center', minWidth: 30, minHeight: 30 },
  badge: { position: 'absolute', right: -6, top: -6, minWidth: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  burst: { position: 'absolute', top: 40, left: 0, right: 0, height: 1, alignItems: 'center' },
  tray: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
});

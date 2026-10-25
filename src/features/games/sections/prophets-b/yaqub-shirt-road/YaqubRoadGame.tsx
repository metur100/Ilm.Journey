import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, CheckBadge, FinishReveal, GameBoard, Glow, InlineCaption, kitResult, useKitColors, useShake } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { useEngineCore, useKitProbe, useMeasure } from '../shared/kit';
import { cellOf, classifyTap, nextOnSolution, type RoadConfig, solveRoad, type YaqubConfig } from './logic';

type Look = 'sand' | 'rock' | 'road' | 'head' | 'start' | 'goal' | 'well' | 'wellDone';

function Cell({ size, look, glow, nudge, label, onPress, testID, burst }: { size: number; look: Look; glow: boolean; nudge: number; label: string; onPress: () => void; testID: string; burst: number }) {
  const { style, shake } = useShake();
  useEffect(() => {
    if (nudge > 0) shake();
  }, [nudge, shake]);
  const art: Record<Look, string | null> = {
    sand: null,
    rock: 'garden.rock',
    road: null,
    head: 'animal.camel',
    start: 'prophet.yusuf-granary',
    goal: 'prophet.yaqub-home',
    well: 'object.well',
    wellDone: 'object.well',
  };
  const name = art[look];
  return (
    <Animated.View style={[{ width: size, height: size, padding: 2 }, style]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={styles.cellPress}>
        <CellFace look={look} glow={glow}>
          {name ? <Art name={name} size={size * (look === 'start' || look === 'goal' ? 0.92 : 0.7)} /> : null}
          {look === 'wellDone' ? <CheckBadge show size={18} /> : null}
          <Burst trigger={burst} distance={size * 0.6} size={10} />
        </CellFace>
      </Pressable>
    </Animated.View>
  );
}

function CellFace({ look, glow, children }: { look: Look; glow: boolean; children: ReactNode }) {
  const k = useKitColors();
  const onRoad = look === 'road' || look === 'head' || look === 'wellDone' || look === 'start';
  const bg = look === 'goal' ? k.rightSoft : onRoad ? k.goldSoft : look === 'rock' ? k.slotFill : k.tileFace;
  const border = look === 'goal' ? k.right : onRoad ? k.goldEdge : k.tileBorder;
  return (
    <View style={[styles.cell, { backgroundColor: bg, borderColor: border, borderStyle: look === 'sand' || look === 'well' ? 'dashed' : 'solid' }]}>
      {glow ? <Glow active radius={radius.sm} spread={2} /> : null}
      {children}
    </View>
  );
}

interface RoadBoardProps {
  cfg: RoadConfig;
  t: GameApi<RoadConfig>['t'];
  onDone: (info: { mistakes: number; missed: string[] }) => void;
}

/** The road board: a desert grid, the road as a gold line, the camel at its end. */
function RoadBoard({ cfg, t, onDone }: RoadBoardProps) {
  const solution = useMemo(() => solveRoad(cfg) ?? [cfg.start, cfg.goal], [cfg]);
  const total = solution.length - 1;
  const core = useEngineCore({ onDone, hints: cfg.hints, prompt: t(cfg.wells.length ? 'play.promptWells' : 'play.prompt'), testID: 'yaqub-road' }, total);
  const { k } = core;
  const [path, setPath] = useState<number[]>([cfg.start]);
  const [arrived, setArrived] = useState(false);
  const [nudge, setNudge] = useState<Record<number, number>>({});
  const [burst, setBurst] = useState<Record<number, number>>({});
  const area = useMeasure();

  const tap = (cell: number) => {
    if (arrived || core.finishedRef.current) return;
    const kind = classifyTap(cfg, path, cell);
    switch (kind) {
      case 'undo':
        setPath(path.slice(0, -1));
        core.touch();
        return;
      case 'rock':
        setNudge((n) => ({ ...n, [cell]: (n[cell] ?? 0) + 1 }));
        core.wrong('rock', t('play.rock'));
        return;
      case 'wellsFirst':
        setNudge((n) => ({ ...n, [cell]: (n[cell] ?? 0) + 1 }));
        core.wrong('wells', t('play.wellsFirst'));
        return;
      case 'far':
      case 'used':
        core.setCaption({ text: t(kind === 'far' ? 'play.far' : 'play.used'), tone: 'hint' });
        core.touch();
        return;
      case 'extend':
      case 'arrive': {
        const next = [...path, cell];
        setPath(next);
        setBurst((b) => ({ ...b, [cell]: (b[cell] ?? 0) + 1 }));
        core.progress(Math.min(total, next.length - 1));
        core.right({ caption: cfg.wells.includes(cell) ? t('play.well') : t('play.step'), tone: cfg.wells.includes(cell) ? 'fact' : 'right' });
        if (kind === 'arrive') {
          core.progress(total);
          setArrived(true);
        }
      }
    }
  };

  useKitProbe({
    engine: 'YaqubRoad',
    testID: 'yaqub-road',
    step: () => {
      if (core.finishedRef.current) return false;
      if (arrived) {
        core.finish(0);
        return true;
      }
      const next = nextOnSolution(solution, path);
      tap(next ?? path[path.length - 2]);
      return true;
    },
    mistake: () => {
      if (arrived || !cfg.rocks.length) return false;
      tap(cfg.rocks[0]);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const gap = 0;
  const size = Math.max(36, Math.floor(Math.min((area.w - gap) / cfg.cols, (area.h - gap) / cfg.rows)));
  const gridW = size * cfg.cols;
  const gridH = size * cfg.rows;
  const centre = (i: number) => {
    const { c, r } = cellOf(cfg, i);
    return [c * size + size / 2, r * size + size / 2];
  };
  const line = path.map((i, n) => `${n ? 'L' : 'M'}${centre(i).join(' ')}`).join('');
  const head = path[path.length - 1];
  const glowCell = cfg.hints ? nextOnSolution(solution, path) : null;

  const look = (i: number): Look => {
    if (i === cfg.start) return 'start';
    if (i === cfg.goal) return 'goal';
    if (cfg.rocks.includes(i)) return 'rock';
    if (cfg.wells.includes(i)) return path.includes(i) ? 'wellDone' : 'well';
    if (i === head) return 'head';
    return path.includes(i) ? 'road' : 'sand';
  };
  const label = (i: number) => {
    const l = look(i);
    return t(l === 'start' ? 'a11y.start' : l === 'goal' ? 'a11y.goal' : l === 'rock' ? 'a11y.rock' : l === 'head' ? 'a11y.head' : l === 'road' ? 'a11y.road' : l === 'well' || l === 'wellDone' ? 'a11y.well' : 'a11y.sand');
  };

  return (
    <View style={styles.root}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        <View style={{ width: gridW, height: gridH }}>
          <View style={styles.grid}>
            {Array.from({ length: cfg.cols * cfg.rows }, (_, i) => (
              <Cell key={i} size={size} look={look(i)} glow={glowCell === i} nudge={nudge[i] ?? 0} burst={burst[i] ?? 0} label={label(i)} onPress={() => tap(i)} testID={`cell-${i}`} />
            ))}
          </View>
          <Svg width={gridW} height={gridH} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path d={line} stroke={k.gold} strokeWidth={Math.max(4, size * 0.12)} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.75} strokeDasharray={`${size * 0.14} ${size * 0.12}`} />
          </Svg>
        </View>
      </View>
      <AppText variant="tiny" color={k.textMuted} align="center">
        {t('play.steps', { count: path.length - 1 })}
      </AppText>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={arrived} art="prophet.yaqub-shirt" title={t('play.arrived')} caption={t('play.arrivedText')} onContinue={() => core.finish(0)} artSize={150} />
    </View>
  );
}

/** Yaqub: L1 and L2 are episodes of his life; L3 (Quran 12:93–96) lays the road for the caravan with Yusuf's shirt. */
export function YaqubRoadGame(api: GameApi<YaqubConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return <Road api={{ ...api, config }} />;
}

function Road({ api }: { api: GameApi<RoadConfig> }) {
  const factId = api.facts[0]?.id ?? 'shirt-sight';
  const moves = useMemo(() => (solveRoad(api.config)?.length ?? 2) - 1, [api.config]);
  return (
    <GameBoard api={api}>
      <RoadBoard cfg={api.config} t={api.t} onDone={({ mistakes }) => api.onComplete(kitResult({ moves, mistakes, factsMissed: mistakes > 0 ? [factId] : [] }))} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  cellPress: { flex: 1 },
  cell: { flex: 1, borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
});

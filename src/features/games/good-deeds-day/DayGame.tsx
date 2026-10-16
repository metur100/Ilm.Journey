import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, kitShuffle, ProgressDots, useKitColors } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { SceneDrop } from '../sections/akhlaq/shared/SceneDrop';
import { choice, FLOWERS, type Moment } from './content';
import { momentRule, wholeDayRule } from './logic';

export interface DeedsConfig {
  mode: 'moments' | 'whole-day';
  moments: Moment[];
  hints: boolean;
  /** Fact id reported for review when a moment needed a second try, per moment id. */
  facts: Record<string, string>;
}

const SKY_ART: Record<Moment['time'], string> = {
  dawn: 'sky.dawn',
  morning: 'sky.morning',
  noon: 'sky.noon',
  afternoon: 'sky.afternoon',
  evening: 'sky.sunset',
  night: 'sky.night',
};

/** The garden strip above the board: one flower per good deed. */
function Garden({ count, total, label }: { count: number; total: number; label: string }) {
  const k = useKitColors();
  return (
    <View style={[styles.garden, { backgroundColor: k.rightSoft, borderColor: k.boardBorder }]} accessible accessibilityLabel={label}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={styles.flower}>
          {i < count ? (
            <Animated.View entering={ZoomIn.springify().damping(12)}>
              <Art name={FLOWERS[i % FLOWERS.length]} size={38} />
            </Animated.View>
          ) : (
            <View style={{ opacity: 0.35 }}>
              <Art name="garden.sprout" size={26} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function MomentsDay(api: GameApi<DeedsConfig>) {
  const { moments, hints, facts } = api.config;
  const [index, setIndex] = useState(0);
  const missed = useRef<string[]>([]);
  const mistakes = useRef(0);
  const moment = moments[Math.min(index, moments.length - 1)];
  const q = useMemo(() => choice(moment.question), [moment.question]);
  const optionIds = useMemo(() => q.options.map((_, i) => `option-${i}`), [q]);
  const rule = useMemo(() => momentRule(optionIds, q.correctIndex, (i) => api.l(q.options[i]?.feedback) || api.t('wrongMoment')), [optionIds, q, api]);
  const order = useMemo(() => kitShuffle(optionIds, `${api.gameId}:${api.level}:${index}`), [optionIds, api.gameId, api.level, index]);
  const k = useKitColors();
  return (
    <>
      <Garden count={index} total={moments.length} label={api.t('garden.label', { count: index, total: moments.length })} />
      <View style={styles.head}>
        <Art name={SKY_ART[moment.time]} size={44} height={28} fit="cover" style={styles.sky} />
        <AppText variant="small" color={k.textMuted}>
          {api.t(`time.${moment.time}`)}
        </AppText>
        <ProgressDots total={moments.length} done={index} style={styles.dots} />
      </View>
      <SceneDrop
        key={moment.id}
        testID={`scene-drop-${index}`}
        scene={SKY_ART[moment.time]}
        aspect={4 / 3}
        targets={[{ id: 'moment', at: { x: 0.25, y: 0.1, w: 0.5, h: 0.8 }, art: moment.art }]}
        items={order.map((id) => ({ id, label: api.l(q.options[Number(id.slice(7))].text) }))}
        rule={rule}
        ordered
        visible={3}
        tileWidth={140}
        hints={hints}
        prompt={api.l(q.prompt)}
        rightCaption={() => api.l(q.options[q.correctIndex].feedback)}
        onMistake={() => {
          if (!missed.current.includes(moment.id)) missed.current.push(moment.id);
        }}
        onDone={({ mistakes: m }) => {
          mistakes.current += m;
          if (index + 1 < moments.length) {
            setIndex(index + 1);
            return;
          }
          const factsMissed = missed.current.map((id) => facts[id]).filter((f): f is string => !!f);
          api.onComplete(kitResult({ moves: moments.length, mistakes: mistakes.current, factsMissed }));
        }}
      />
    </>
  );
}

function WholeDay(api: GameApi<DeedsConfig>) {
  const { moments, hints, facts } = api.config;
  const [placed, setPlaced] = useState(0);
  const rule = useMemo(() => wholeDayRule(moments.map((m) => m.id), api.t('wrongMoment')), [moments, api]);
  const boxes = [
    { x: 0.03, y: 0.04, w: 0.44, h: 0.42 },
    { x: 0.53, y: 0.04, w: 0.44, h: 0.42 },
    { x: 0.03, y: 0.54, w: 0.44, h: 0.42 },
    { x: 0.53, y: 0.54, w: 0.44, h: 0.42 },
  ];
  return (
    <>
      <Garden count={placed} total={moments.length} label={api.t('garden.label', { count: placed, total: moments.length })} />
      <SceneDrop
        aspect={1}
        targets={moments.map((m, i) => ({ id: m.id, at: boxes[i], art: m.art, label: api.t(`moment.${m.id}`) }))}
        items={moments.map((m) => {
          const q = choice(m.question);
          return { id: `deed-${m.id}`, label: api.l(q.options[q.correctIndex].text) };
        })}
        rule={rule}
        hints={hints}
        hidePlaced
        tileWidth={140}
        visible={2}
        prompt={api.t('play.l3')}
        onPlaced={(p) => setPlaced(p.length)}
        onDone={({ mistakes, missed }) =>
          api.onComplete(kitResult({ moves: moments.length, mistakes, factsMissed: missed.map((id) => facts[id.replace('deed-', '')]).filter((f): f is string => !!f) }))
        }
      />
    </>
  );
}

/** A Day of Good Deeds – SceneDrop moments of one day (L1, L2) and the whole day at once (L3). */
export function GoodDeedsDayGame(api: GameApi<DeedsConfig>) {
  return <GameBoard api={api}>{api.config.mode === 'whole-day' ? <WholeDay {...api} /> : <MomentsDay {...api} />}</GameBoard>;
}

const styles = StyleSheet.create({
  garden: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderRadius: radius.lg, borderWidth: 1, paddingVertical: 4, minHeight: 50, marginBottom: spacing.xs },
  flower: { width: 44, alignItems: 'center', justifyContent: 'flex-end' },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  sky: { borderRadius: radius.sm, overflow: 'hidden' },
  dots: { flex: 1, justifyContent: 'flex-end' },
});


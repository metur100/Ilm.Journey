import { type ReactNode, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, DragTile, DropZone, FinishReveal, GameBoard, InlineCaption, Pop, Tile, Tray } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { useEngineCore, useKitProbe } from '../shared/kit';
import { YUSUF_FACTS } from './facts';
import {
  checkYear,
  type Destination,
  emptyStore,
  GOOD_YEARS,
  HARD_YEARS,
  type HardYear,
  hardYear,
  harvestItems,
  type HarvestItem,
  type Placements,
  type StorehouseConfig,
  storehouseResult,
  storeTotal,
  storeYear,
  targetFor,
  totalNeed,
  type YusufStoreConfig,
} from './logic';
import { GrainItem, type SceneMode, Timeline, YusufScene } from './parts';

export type { StorehouseConfig } from './logic';

type Phase = 'good' | 'hard' | 'empty' | 'relief';
const ITEM = 52;
const TOTAL_STEPS = GOOD_YEARS + HARD_YEARS + 1;

/** The learner's plan for one year: eat the little (loose grain first), store the rest. */
function planFor(items: HarvestItem[], minEat: number): Placements {
  const sorted = [...items].sort((a, b) => (a.form === b.form ? 0 : a.form === 'loose' ? -1 : 1));
  return Object.fromEntries(sorted.map((item, i) => [item.id, i < minEat ? 'eat' : 'store'])) as Placements;
}

function Storehouse({ api }: { api: GameApi<StorehouseConfig> }) {
  const { config, t, reducedMotion } = api;
  const attemptsRef = useRef(1);
  const spoiledRef = useRef(false);
  const core = useEngineCore(
    {
      onDone: () =>
        api.onComplete(
          storehouseResult({ attempts: attemptsRef.current, spoiledEver: spoiledRef.current, planFactId: YUSUF_FACTS.plan.id, earsFactId: config.spoilage ? YUSUF_FACTS.ears.id : undefined }),
        ),
      prompt: t(config.spoilage ? 'play.rule' : 'play.dream'),
      hints: config.hints,
      testID: 'yusuf-storehouse',
    },
    TOTAL_STEPS,
  );
  const { k } = core;

  const [phase, setPhase] = useState<Phase>('good');
  const [year, setYear] = useState(0);
  const [hardIndex, setHardIndex] = useState(0);
  const [placements, setPlacements] = useState<Placements>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [store, setStore] = useState(emptyStore);
  const [attempts, setAttempts] = useState(1);
  const [lastHard, setLastHard] = useState<HardYear | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pops, setPops] = useState<Record<Destination, number>>({ eat: 0, store: 0 });
  const [width, setWidth] = useState(0);
  const mistakePlayed = useRef(false);

  const items = useMemo(() => harvestItems(year, config.harvests[year] ?? { ears: 0, loose: 0 }), [year, config.harvests]);
  const check = checkYear(items, placements, config.minEat);
  const unplaced = items.filter((i) => !placements[i.id]);
  const need = totalNeed(config);
  const itemName = (item: HarvestItem) => (config.spoilage ? t(item.form === 'ears' ? 'item.ears' : 'item.loose') : t('item.sack'));
  const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const storedText = config.spoilage ? t('play.storedSplit', { ears: store.ears, loose: store.loose }) : t('play.stored', { count: storeTotal(store) });

  // ---------- good years ----------

  const place = (item: HarvestItem | undefined, to: Destination): boolean => {
    if (!item || phase !== 'good' || placements[item.id]) return false;
    const next = { ...placements, [item.id]: to };
    setPlacements(next);
    setSelected(null);
    setPops((p) => ({ ...p, [to]: p[to] + 1 }));
    api.playSound('click');
    core.touch();
    const after = checkYear(items, next, config.minEat);
    core.setCaption(
      after.needsFood
        ? { text: t('play.keepLittle'), tone: 'hint' }
        : { text: t('play.placed', { item: cap(itemName(item)), place: t(to === 'eat' ? 'play.eat' : 'play.store') }), tone: 'info' },
    );
    return true;
  };

  const unplace = (item: HarvestItem) => {
    const next = { ...placements };
    delete next[item.id];
    setPlacements(next);
    core.touch();
  };

  const nextYear = () => {
    if (!check.ready) return;
    setStore(storeYear(store, items, placements));
    setPlacements({});
    setSelected(null);
    core.progress(year + 1);
    if (year + 1 < GOOD_YEARS) {
      setYear(year + 1);
      core.right({ caption: false });
    } else {
      setPhase('hard');
      setHardIndex(0);
      setLastHard(null);
      core.right({ caption: t('play.goodOver'), tone: 'fact' });
    }
  };

  // ---------- hard years ----------

  const share = () => {
    if (phase !== 'hard') return;
    const result = hardYear(store, hardIndex, config.needs[hardIndex], config.spoilage);
    setStore(result.after);
    setLastHard(result);
    if (result.spoiled > 0) spoiledRef.current = true;
    if (!result.covered) {
      setPhase('empty');
      core.wrong('plan', `${result.spoiled ? `${t('play.spoiled')} ` : ''}${t('play.emptyText', { number: result.year + 1 })}`);
      return;
    }
    core.progress(GOOD_YEARS + hardIndex + 1);
    core.right({ caption: `${t('play.shared', { count: result.given })}${result.spoiled ? ` ${t('play.spoiled')}` : ''}`, tone: result.spoiled ? 'fact' : 'right' });
    if (hardIndex + 1 >= HARD_YEARS) {
      setHardIndex(HARD_YEARS);
      core.progress(TOTAL_STEPS);
      setPhase('relief');
      api.playSound('reward');
    } else {
      setHardIndex(hardIndex + 1);
    }
  };

  const planAgain = () => {
    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);
    setStore(emptyStore);
    setYear(0);
    setHardIndex(0);
    setPlacements({});
    setLastHard(null);
    setPhase('good');
    core.progress(0);
    core.setCaption({ text: t('play.dream'), tone: 'info' });
  };

  useKitProbe({
    engine: 'YusufStorehouse',
    testID: 'yusuf-storehouse',
    step: () => {
      if (core.finishedRef.current) return false;
      if (phase === 'good') {
        if (unplaced.length) {
          const plan = planFor(items, config.minEat);
          const item = items.filter((i) => !placements[i.id]).sort((a, b) => (plan[a.id] === plan[b.id] ? 0 : plan[a.id] === 'eat' ? -1 : 1))[0];
          place(item, plan[item.id]);
        } else nextYear();
      } else if (phase === 'hard') share();
      else if (phase === 'empty') planAgain();
      else core.finish(0);
      return true;
    },
    mistake: () => {
      if (mistakePlayed.current || phase !== 'good' || year !== 0 || Object.keys(placements).length) return false;
      mistakePlayed.current = true;
      // Eat the whole first harvest: the storehouse will run short in the last hard year.
      const all = Object.fromEntries(items.map((i) => [i.id, 'eat'])) as Placements;
      setPlacements(all);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  // ---------- render ----------

  const mode: SceneMode = phase === 'hard' || phase === 'empty' ? 'hard' : phase === 'relief' ? 'relief' : 'good';
  const timelineIndex = phase === 'relief' ? 14 : mode === 'hard' ? GOOD_YEARS + Math.min(hardIndex, HARD_YEARS - 1) : year;
  const heading =
    phase === 'relief' ? t('play.reliefYear') : mode === 'hard' ? t('play.hardYear', { number: Math.min(hardIndex, HARD_YEARS - 1) + 1 }) : t('play.goodYear', { number: year + 1 });
  const target = config.hints ? targetFor(config, year) : null;
  const sceneLabel = t(mode === 'hard' ? 'a11y.hardScene' : mode === 'relief' ? 'a11y.reliefScene' : 'a11y.goodScene');

  const zone = (to: Destination) => {
    const placed = items.filter((i) => placements[i.id] === to);
    const isStore = to === 'store';
    return (
      <DropZone
        id={to}
        testID={`zone-${to}`}
        onPress={selected || unplaced.length ? () => place(items.find((i) => i.id === selected && !placements[i.id]) ?? unplaced[0], to) : undefined}
        accessibilityLabel={t(isStore ? 'a11y.zoneStore' : 'a11y.zoneEat', { count: placed.length })}
        style={[styles.zone, { backgroundColor: k.slotFill, borderColor: selected || dragging ? k.gold : k.slotBorder }]}
        hoverStyle={{ borderRadius: radius.lg + 3, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
      >
        <Pop trigger={pops[to]} style={styles.zoneInner}>
          <View style={[styles.zoneLabel, { backgroundColor: k.accent }]}>
            <AppText variant="small" color={k.onAccent} align="center">
              {t(isStore ? 'play.store' : 'play.eat')}
            </AppText>
          </View>
          <Art name={isStore ? 'prophet.yusuf-granary' : 'object.basket'} size={isStore ? 96 : 70} />
          {target ? (
            <AppText variant="tiny" color={k.textMuted}>
              {`${placed.length} / ${isStore ? target.store : target.eat}`}
            </AppText>
          ) : null}
          <View style={styles.placedRow}>
            {placed.map((item) => (
              <DropZoneChip key={item.id} label={cap(t(isStore ? 'a11y.placedStore' : 'a11y.placedEat', { item: itemName(item) }))} onPress={() => unplace(item)} reduced={reducedMotion}>
                <GrainItem form={config.spoilage ? item.form : 'loose'} size={28} />
              </DropZoneChip>
            ))}
          </View>
          <Burst trigger={pops[to]} distance={46} />
        </Pop>
      </DropZone>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} scrollEnabled={!dragging}>
        {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
        <View style={styles.headRow}>
          <AppText variant="bodyBold" color={k.text} style={styles.flex}>
            {heading}
          </AppText>
          {target && phase === 'good' ? (
            <View style={[styles.chip, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]}>
              <AppText variant="tiny" color={k.text}>
                {t('play.target', { store: target.store, eat: target.eat })}
              </AppText>
            </View>
          ) : null}
        </View>
        <Timeline index={timelineIndex} label={t('a11y.timeline', { number: timelineIndex + 1 })} />
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <YusufScene width={width} mode={mode} shareKey={`${attempts}-${lastHard?.year ?? -1}`} given={phase === 'hard' || phase === 'relief' ? (lastHard?.given ?? 0) : 0} reducedMotion={reducedMotion} label={sceneLabel} />
        </View>

        {phase === 'good' ? (
          <>
            <Tray style={styles.tray}>
              {unplaced.map((item) => (
                <Animated.View key={`${attempts}-${item.id}`} entering={reducedMotion ? FadeIn.duration(120) : ZoomIn.springify().damping(14)}>
                  <DragTile
                    id={item.id}
                    selected={selected === item.id}
                    accessibilityLabel={cap(t('a11y.item', { item: itemName(item) }))}
                    onLift={() => setDragging(true)}
                    onPress={() => setSelected(selected === item.id ? null : item.id)}
                    onDrop={(z) => {
                      setDragging(false);
                      return z === 'eat' || z === 'store' ? place(item, z) : false;
                    }}
                  >
                    <Tile state={selected === item.id ? 'selected' : 'idle'} width={ITEM + 12} height={ITEM + 12} padding={2}>
                      <GrainItem form={config.spoilage ? item.form : 'loose'} size={ITEM} />
                    </Tile>
                  </DragTile>
                </Animated.View>
              ))}
            </Tray>
            <View style={styles.zones}>
              {zone('eat')}
              {zone('store')}
            </View>
            <AppText variant="small" color={k.textMuted}>
              {config.hints ? `${storedText} · ${t('play.needTotal', { need })}` : storedText}
            </AppText>
            <Button label={t('play.nextYear')} icon="chevron" variant="gold" disabled={!check.ready} onPress={nextYear} />
          </>
        ) : null}

        {phase === 'hard' ? (
          <View style={styles.hard}>
            <AppText variant="bodyBold" color={k.text}>
              {t('play.need', { need: config.needs[hardIndex] })}
            </AppText>
            <AppText variant="small" color={k.textMuted}>
              {storedText}
            </AppText>
            <Button label={t('play.share')} icon="chevron" variant="gold" onPress={share} />
          </View>
        ) : null}

        {phase === 'empty' ? <Button label={t('play.retry')} icon="refresh" variant="gold" onPress={planAgain} /> : null}
      </ScrollView>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={phase === 'relief'} art="prophet.yusuf-granary" title={t('play.reliefTitle')} caption={t('play.reliefText')} onContinue={() => core.finish(0)} artSize={170} />
    </View>
  );
}

/** A placed sack inside a zone (tap to take it back). */
function DropZoneChip({ label, onPress, reduced, children }: { label: string; onPress: () => void; reduced: boolean; children: ReactNode }) {
  return (
    <Animated.View entering={reduced ? undefined : ZoomIn.springify().damping(12)}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.chipItem}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Yusuf's Storehouse (Quran 12:43–49): sort each good year's harvest into "eat now" or "store", then share the stored
 * grain out in the hard years. A short storehouse is said gently in the caption and the plan can be made again; L3
 * adds the rule of 12:47 (grain in the ear keeps, loose grain spoils a little). The finished picture is the year of rain.
 */
export function YusufStorehouseGame(api: GameApi<YusufStoreConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return (
    <GameBoard api={api}>
      <Storehouse api={{ ...api, config }} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.xs },
  flex: { flex: 1 },
  content: { gap: spacing.sm, paddingBottom: spacing.md },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  tray: { minHeight: 72, alignItems: 'center' },
  zones: { flexDirection: 'row', gap: spacing.sm },
  zone: { flex: 1, minHeight: 170, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', padding: spacing.sm },
  zoneInner: { flex: 1, alignItems: 'center', gap: 4 },
  zoneLabel: { alignSelf: 'stretch', borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: spacing.xs },
  placedRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 },
  chipItem: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  hard: { gap: spacing.sm },
});

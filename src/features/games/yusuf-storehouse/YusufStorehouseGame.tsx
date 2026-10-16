import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { DragToken, useDropZones } from './drag';
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
} from './logic';
import { GrainItem, type SceneMode, Timeline, YusufScene } from './parts';

export type { StorehouseConfig } from './logic';

type Phase = 'rule' | 'good' | 'hard' | 'empty' | 'relief';

const ITEM = 60;

const useStyles = makeStyles((c) => ({
  scroll: { flex: 1 },
  content: { gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder },
  info: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
  flex: { flex: 1 },
  field: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder, zIndex: 3 },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, minHeight: ITEM + 8, alignItems: 'center' },
  item: { width: ITEM + 8, height: ITEM + 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  zones: { flexDirection: 'row', gap: spacing.md },
  zone: {
    flex: 1,
    minHeight: 168,
    alignItems: 'center',
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  zoneActive: { borderColor: c.primary, backgroundColor: c.primarySoft },
  placedRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 },
  placed: { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  storeRow: { gap: 6 },
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  cardTitle: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  status: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
}));

/**
 * Yusuf's Storehouse (Quran 12:43–49): sort each good year's harvest into "eat now" or "store", then share the stored
 * grain out in the hard years. A short storehouse is shown gently ("the storehouse is empty") and the plan can be made
 * again; L3 adds the 12:47 rule card (grain in the ear keeps, loose grain spoils a little).
 */
export function YusufStorehouseGame({ config, onComplete, playSound, haptic, reducedMotion, t }: GameApi<StorehouseConfig>) {
  const styles = useStyles();
  const { c } = useTheme();
  const zones = useDropZones();

  const [phase, setPhase] = useState<Phase>(config.spoilage ? 'rule' : 'good');
  const [year, setYear] = useState(0);
  const [hardIndex, setHardIndex] = useState(0);
  const [placements, setPlacements] = useState<Placements>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [store, setStore] = useState(emptyStore);
  const [attempts, setAttempts] = useState(1);
  const [spoiledEver, setSpoiledEver] = useState(false);
  const [lastHard, setLastHard] = useState<HardYear | null>(null);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(0);
  const finished = useRef(false);

  const items = useMemo(() => harvestItems(year, config.harvests[year] ?? { ears: 0, loose: 0 }), [year, config.harvests]);
  const check = checkYear(items, placements, config.minEat);
  const unplaced = items.filter((i) => !placements[i.id]);
  const need = totalNeed(config);

  const itemName = (item: HarvestItem) => (config.spoilage ? t(item.form === 'ears' ? 'item.ears' : 'item.loose') : t('item.sack'));
  const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  // ---------- good years ----------

  const place = (item: HarvestItem | undefined, to: Destination): boolean => {
    if (!item || phase !== 'good') return false;
    setPlacements((p) => ({ ...p, [item.id]: to }));
    setSelected(null);
    haptic('tap');
    playSound('click');
    return true;
  };

  const tapZone = (to: Destination) => place(items.find((i) => i.id === selected && !placements[i.id]) ?? unplaced[0], to);

  const unplace = (item: HarvestItem) => {
    setPlacements((p) => {
      const next = { ...p };
      delete next[item.id];
      return next;
    });
    haptic('selection');
  };

  const nextYear = () => {
    if (!check.ready) return;
    const next = storeYear(store, items, placements);
    setStore(next);
    setPlacements({});
    setSelected(null);
    playSound('success');
    if (year + 1 < GOOD_YEARS) {
      setYear(year + 1);
    } else {
      setPhase('hard');
      setHardIndex(0);
      setLastHard(null);
    }
  };

  // ---------- hard years ----------

  const share = () => {
    if (phase !== 'hard') return;
    const result = hardYear(store, hardIndex, config.needs[hardIndex], config.spoilage);
    setStore(result.after);
    setLastHard(result);
    if (result.spoiled > 0) setSpoiledEver(true);
    if (!result.covered) {
      haptic('warning');
      setPhase('empty');
      return;
    }
    haptic('success');
    playSound('success');
    if (hardIndex + 1 >= HARD_YEARS) {
      setHardIndex(HARD_YEARS);
      setPhase('relief');
      playSound('reward');
    } else {
      setHardIndex(hardIndex + 1);
    }
  };

  const planAgain = () => {
    setAttempts((a) => a + 1);
    setStore(emptyStore);
    setYear(0);
    setHardIndex(0);
    setPlacements({});
    setLastHard(null);
    setPhase('good');
    haptic('tap');
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onComplete(
      storehouseResult({ attempts, spoiledEver, planFactId: YUSUF_FACTS.plan.id, earsFactId: config.spoilage ? YUSUF_FACTS.ears.id : undefined }),
    );
  };

  // ---------- render ----------

  const mode: SceneMode = phase === 'hard' || phase === 'empty' ? 'hard' : phase === 'relief' ? 'relief' : 'good';
  const timelineIndex = phase === 'relief' ? 14 : mode === 'hard' ? GOOD_YEARS + Math.min(hardIndex, HARD_YEARS - 1) : year;
  const heading =
    phase === 'relief'
      ? t('play.reliefYear')
      : mode === 'hard'
        ? t('play.hardYear', { number: Math.min(hardIndex, HARD_YEARS - 1) + 1 })
        : t('play.goodYear', { number: year + 1 });
  const target = config.hints ? targetFor(config, year) : null;
  const storedText = config.spoilage ? t('play.storedSplit', { ears: store.ears, loose: store.loose }) : t('play.stored', { count: storeTotal(store) });
  const sceneLabel = t(mode === 'hard' ? 'a11y.hardScene' : mode === 'relief' ? 'a11y.reliefScene' : 'a11y.goodScene');

  const zone = (to: Destination) => {
    const placed = items.filter((i) => placements[i.id] === to);
    const isStore = to === 'store';
    return (
      <Pressable
        ref={zones.ref(to)}
        collapsable={false}
        onPress={() => tapZone(to)}
        disabled={phase !== 'good' || unplaced.length === 0}
        accessibilityRole="button"
        accessibilityLabel={t(isStore ? 'a11y.zoneStore' : 'a11y.zoneEat', { count: placed.length })}
        style={[styles.zone, dragging && styles.zoneActive]}
      >
        <Art name={isStore ? 'object.storehouse' : 'object.basket'} size={isStore ? 92 : 80} />
        <AppText variant="bodyBold">{t(isStore ? 'play.store' : 'play.eat')}</AppText>
        {target ? (
          <AppText variant="tiny" color={c.textMuted}>
            {`${placed.length} / ${isStore ? target.store : target.eat}`}
          </AppText>
        ) : null}
        <View style={styles.placedRow}>
          {placed.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => unplace(item)}
              accessibilityRole="button"
              accessibilityLabel={cap(t(isStore ? 'a11y.placedStore' : 'a11y.placedEat', { item: itemName(item) }))}
              style={styles.placed}
            >
              <Animated.View entering={reducedMotion ? undefined : ZoomIn.springify().damping(12)}>
                <GrainItem form={config.spoilage ? item.form : 'loose'} size={34} />
              </Animated.View>
            </Pressable>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} scrollEnabled={!dragging}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText variant="bodyBold" style={styles.flex}>
            {heading}
          </AppText>
          {target && phase === 'good' ? (
            <View style={styles.chip}>
              <Icon name="sparkle" size={14} color={c.goldText} />
              <AppText variant="tiny" color={c.goldText}>
                {t('play.target', { store: target.store, eat: target.eat })}
              </AppText>
            </View>
          ) : null}
        </View>
        <Timeline index={timelineIndex} label={t('a11y.timeline', { number: timelineIndex + 1 })} />
      </View>

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <YusufScene
          width={width}
          mode={mode}
          shareKey={`${attempts}-${lastHard?.year ?? -1}`}
          given={phase === 'hard' || phase === 'relief' ? (lastHard?.given ?? 0) : 0}
          reducedMotion={reducedMotion}
          label={sceneLabel}
        />
      </View>

      {phase === 'rule' ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)} style={styles.card}>
          <View style={styles.cardTitle}>
            <GrainItem form="ears" size={44} />
            <AppText variant="heading" style={styles.flex}>
              {t('play.ruleTitle')}
            </AppText>
          </View>
          <AppText variant="body">{t('play.ruleText')}</AppText>
          <Button label={t('play.ruleOk')} icon="check" onPress={() => setPhase('good')} />
        </Animated.View>
      ) : null}

      {phase === 'good' ? (
        <>
          {year === 0 && attempts === 1 ? (
            <View style={styles.info}>
              <Art name="object.grain-sack" size={30} />
              <AppText variant="small" style={styles.flex}>
                {t('play.dream')}
              </AppText>
            </View>
          ) : null}

          <View style={styles.field}>
            <AppText variant="bodyBold">{unplaced.length ? t('play.harvest') : t('play.harvestDone')}</AppText>
            <View style={styles.fieldRow}>
              {unplaced.map((item, i) => (
                <Animated.View key={`${attempts}-${item.id}`} entering={reducedMotion ? undefined : FadeInDown.delay(i * 90).springify()}>
                  <DragToken
                    zones={zones}
                    reducedMotion={reducedMotion}
                    onPickUp={() => {
                      setDragging(true);
                      haptic('selection');
                    }}
                    onRelease={() => setDragging(false)}
                    onDrop={(z) => (z === 'eat' || z === 'store' ? place(item, z) : false)}
                  >
                    <Pressable
                      onPress={() => setSelected(selected === item.id ? null : item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={cap(t('a11y.item', { item: itemName(item) }))}
                      accessibilityState={{ selected: selected === item.id }}
                      style={[styles.item, selected === item.id && { backgroundColor: c.primarySoft }]}
                    >
                      <GrainItem form={config.spoilage ? item.form : 'loose'} size={ITEM} />
                    </Pressable>
                  </DragToken>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.zones}>
            {zone('eat')}
            {zone('store')}
          </View>

          <View style={styles.storeRow}>
            <AppText variant="small" color={c.textMuted}>
              {storedText}
            </AppText>
            {config.hints ? (
              <>
                <ProgressBar progress={need > 0 ? storeTotal(store) / need : 1} color={c.gold} height={8} accessibilityLabel={storedText} />
                <AppText variant="tiny" color={c.textMuted}>
                  {t('play.needTotal', { need })}
                </AppText>
              </>
            ) : null}
          </View>

          <View style={styles.status} accessibilityLiveRegion="polite">
            {check.needsFood ? (
              <AppText variant="bodyBold" align="center" color={c.goldText}>
                {t('play.keepLittle')}
              </AppText>
            ) : null}
          </View>
          <Button label={t('play.nextYear')} icon="chevron" variant="gold" disabled={!check.ready} onPress={nextYear} />
        </>
      ) : null}

      {phase === 'hard' ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)} style={styles.card}>
          <AppText variant="body">{hardIndex === 0 && !lastHard ? t('play.goodOver') : t('play.shared', { count: lastHard?.given ?? 0 })}</AppText>
          {lastHard?.spoiled ? (
            <AppText variant="small" color={c.goldText}>
              {t('play.spoiled')}
            </AppText>
          ) : null}
          <AppText variant="bodyBold">{t('play.need', { need: config.needs[hardIndex] })}</AppText>
          <AppText variant="small" color={c.textMuted}>
            {storedText}
          </AppText>
          <Button label={t('play.share')} icon="chevron" variant="gold" onPress={share} />
        </Animated.View>
      ) : null}

      {phase === 'empty' ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(500)} style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardTitle}>
            <Art name="object.storehouse" size={56} />
            <AppText variant="heading" style={styles.flex}>
              {t('play.emptyTitle')}
            </AppText>
          </View>
          {lastHard?.spoiled ? (
            <AppText variant="small" color={c.goldText}>
              {t('play.spoiled')}
            </AppText>
          ) : null}
          <AppText variant="body">{t('play.emptyText', { number: (lastHard?.year ?? 0) + 1 })}</AppText>
          <Button label={t('play.retry')} icon="refresh" variant="gold" onPress={planAgain} />
        </Animated.View>
      ) : null}

      {phase === 'relief' ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(700)} style={styles.card} accessibilityLiveRegion="polite">
          <AppText variant="heading" accessibilityRole="header">
            {t('play.reliefTitle')}
          </AppText>
          <AppText variant="body">{t('play.reliefText')}</AppText>
          <Button label={t('play.finish')} icon="check" variant="gold" onPress={finish} />
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

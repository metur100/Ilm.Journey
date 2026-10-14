import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';
import { hashString, seededRandom } from '@/core/utils/random';

import { ArkScene, type Walker } from './ArkScene';
import { DragToken, useDropZones } from './drag';
import { ARK_FACTS } from './facts';
import { FlipCard } from './FlipCard';
import {
  type AnimalKind,
  animalArt,
  type ArkConfig,
  arkFill,
  arkResult,
  bringToGate,
  closeOpen,
  emptyGate,
  flipCard,
  initialMemory,
  isFaceUp,
  leaveGate,
  type LooseAnimal,
  makeDeck,
  makeMeadow,
  memoryDone,
  pickKinds,
  stormLevel,
} from './logic';

export type { ArkConfig } from './logic';

type Phase = 'memory' | 'sort' | 'calm';

const COLUMNS = 4;
const GAP = spacing.sm;
const MISMATCH_MS = 1000;

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const useStyles = makeStyles((c) => ({
  scroll: { flex: 1 },
  content: { gap: spacing.md, paddingBottom: spacing.xl },
  status: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
  aboardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aboardIcons: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  rule: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder },
  flex: { flex: 1 },
  gate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.primaryBorder,
    backgroundColor: c.primarySoft,
  },
  gateActive: { borderColor: c.primary },
  slot: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.primaryBorder,
  },
  meadow: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'center', zIndex: 2 },
  animal: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  calmCard: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
}));

/**
 * Ark of Nuh: memory pairs of animals walk up the ramp into the ark while the rain gets heavier; L3 ends with
 * leading loose animals to the ark gate two by two. When the ark is full the rain stops above Mount Judi.
 */
export function ArkOfNuhGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, t }: GameApi<ArkConfig>) {
  const styles = useStyles();
  const { c } = useTheme();
  const zones = useDropZones();
  const total = config.pairs + config.sortPairs;

  // A new deal for every play (the component is remounted per play).
  const [setup] = useState(() => {
    const random = seededRandom(hashString(`${gameId}:${level}:${Date.now()}`));
    const kinds = pickKinds(config.pairs, config.sortPairs, random);
    return { deck: makeDeck(kinds.memory, random), meadow: makeMeadow(kinds.sort, random) };
  });

  const [stage, setStage] = useState<'memory' | 'sort'>('memory');
  const [boarded, setBoarded] = useState<AnimalKind[]>([]);
  // The ark is full → the rain stops (calm sky over Mount Judi).
  const calm = boarded.length >= total;
  const phase: Phase = calm ? 'calm' : stage;
  const [memory, setMemory] = useState(() => initialMemory(setup.deck));
  const [shakes, setShakes] = useState<Record<number, number>>({});
  const [meadow, setMeadow] = useState<LooseAnimal[]>(setup.meadow);
  const [gate, setGate] = useState(emptyGate);
  const [dragging, setDragging] = useState(false);
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [message, setMessage] = useState(() => t('play.findPairs'));
  const [width, setWidth] = useState(0);
  const finished = useRef(false);
  const walkerId = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const name = useCallback((kind: AnimalKind) => t(`animal.${kind}`), [t]);

  const walking = useRef(new Map<string, AnimalKind>());

  const sendAboard = (kind: AnimalKind) => {
    walkerId.current += 1;
    const id = `w${walkerId.current}`;
    walking.current.set(id, kind);
    setWalkers((w) => [...w, { id, kind }]);
  };

  const aboard = useRef(0);

  /** A pair reached the door of the ark. The last pair makes the ark full: the rain stops (calm sky over Judi). */
  const onArrive = useCallback(
    (id: string) => {
      const kind = walking.current.get(id);
      if (!kind) return;
      walking.current.delete(id);
      aboard.current += 1;
      setWalkers((list) => list.filter((w) => w.id !== id));
      setBoarded((b) => [...b, kind]);
      if (aboard.current === total) {
        playSound('reward');
        haptic('success');
      }
    },
    [total, playSound, haptic],
  );

  // ---------- memory ----------

  const tapCard = (index: number) => {
    if (phase !== 'memory') return;
    const { state, event } = flipCard(memory, index);
    if (event === 'ignored') return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMemory(state);
    const kind = state.cards[index].kind;
    if (event === 'flip') {
      haptic('selection');
      playSound('click');
      setMessage(t('play.findPairs'));
    } else if (event === 'match') {
      haptic('success');
      playSound('success');
      setMessage(cap(t('play.match', { animal: name(kind) })));
      sendAboard(kind);
      if (memoryDone(state)) {
        if (config.sortPairs > 0) {
          setStage('sort');
          setMessage(t('play.sortStart'));
        }
      }
    } else {
      haptic('warning');
      setMessage(t('play.mismatch'));
      setShakes((s) => ({ ...s, [state.open[0]]: (s[state.open[0]] ?? 0) + 1, [index]: (s[index] ?? 0) + 1 }));
      const open = state.open;
      closeTimer.current = setTimeout(() => setMemory((m) => (m.open === open ? closeOpen(m) : m)), MISMATCH_MS);
    }
  };

  // ---------- sorting (L3) ----------

  const gateShake = useSharedValue(0);
  const gateStyle = useAnimatedStyle(() => ({ transform: [{ translateX: gateShake.value }] }));

  const toGate = (animal: LooseAnimal): boolean => {
    if (phase !== 'sort') return false;
    const { gate: next, event } = bringToGate(gate, animal);
    if (event === 'wrong') {
      haptic('warning');
      playSound('failure');
      setMessage(cap(t('play.wrongKind', { animal: name(animal.kind), other: name(gate.waiting!.kind) })));
      if (!reducedMotion) gateShake.set(withSequence(withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }), withTiming(0, { duration: 60 })));
      setGate(next);
      return false;
    }
    setGate(next);
    setMeadow((m) => m.filter((a) => a.id !== animal.id));
    if (event === 'pair') {
      haptic('success');
      playSound('success');
      setMessage(cap(t('play.match', { animal: name(animal.kind) })));
      sendAboard(animal.kind);
    } else {
      haptic('tap');
      playSound('click');
      setMessage(t('play.gateWaiting', { animal: name(animal.kind) }));
    }
    return true;
  };

  const sendBack = () => {
    if (!gate.waiting) return;
    const animal = gate.waiting;
    setGate(leaveGate(gate));
    setMeadow((m) => [...m, animal]);
    haptic('tap');
    setMessage(t('play.sortHint'));
  };

  // ---------- finish ----------

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onComplete(
      arkResult({ pairs: config.pairs, sortPairs: config.sortPairs, mismatches: memory.mismatches, wrongDrops: gate.wrongDrops, kindFactId: ARK_FACTS.eachKind.id }),
    );
  };

  // ---------- layout ----------

  const cardW = width > 0 ? Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS) : 0;
  const cardH = Math.round(cardW * (memory.cards.length > 8 ? 1.05 : 1.2));

  const storm = calm ? 0 : stormLevel(boarded.length + walkers.length * 0.5, total);
  const fill = arkFill(boarded.length, total);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} scrollEnabled={!dragging}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <ArkScene
          width={width}
          storm={storm}
          fill={fill}
          calm={calm}
          walkers={walkers}
          onArrive={onArrive}
          reducedMotion={reducedMotion}
          label={calm ? t('a11y.calmScene') : t('a11y.scene', { count: boarded.length, total })}
        />
      </View>

      <View style={styles.aboardRow}>
        <View style={styles.aboardIcons}>
          {boarded.map((kind, i) => (
            <Animated.View key={`${kind}-${i}`} entering={reducedMotion ? undefined : ZoomIn.springify()}>
              <Art name={animalArt(kind)} size={26} height={22} />
            </Animated.View>
          ))}
        </View>
        <AppText variant="small" color={c.textMuted}>
          {t('play.aboard', { count: boarded.length, total })}
        </AppText>
      </View>
      <ProgressBar progress={fill} color={c.gold} height={8} accessibilityLabel={t('play.aboard', { count: boarded.length, total })} />

      <View style={styles.status} accessibilityLiveRegion="polite">
        <AppText variant="bodyBold" align="center">
          {calm ? t('play.calmTitle') : message}
        </AppText>
      </View>

      {phase === 'memory' && cardW > 0 ? (
        <View style={styles.grid}>
          {memory.cards.map((card) => {
            const up = isFaceUp(memory, card.index);
            const matched = memory.matched.includes(card.index);
            const number = card.index + 1;
            const label = matched
              ? t('a11y.cardFound', { number, animal: name(card.kind) })
              : up
                ? t('a11y.cardUp', { number, animal: name(card.kind) })
                : t('a11y.cardDown', { number });
            return (
              <FlipCard
                key={card.index}
                kind={card.kind}
                name={name(card.kind)}
                faceUp={up}
                matched={matched}
                shake={shakes[card.index] ?? 0}
                width={cardW}
                height={cardH}
                label={label}
                reducedMotion={reducedMotion}
                onPress={() => tapCard(card.index)}
              />
            );
          })}
        </View>
      ) : null}

      {phase === 'sort' ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)} style={{ gap: spacing.md }}>
          <View style={styles.rule}>
            <Art name="object.ark" size={44} />
            <View style={styles.flex}>
              <AppText variant="bodyBold">{t('play.sortTitle')}</AppText>
              <AppText variant="small" color={c.textMuted}>
                {t('play.sortRule')}
              </AppText>
            </View>
          </View>

          <Animated.View style={gateStyle}>
            <View ref={zones.ref('gate')} collapsable={false} style={[styles.gate, dragging && styles.gateActive]}>
              <Pressable
                onPress={sendBack}
                disabled={!gate.waiting}
                accessibilityRole="button"
                accessibilityLabel={gate.waiting ? t('a11y.waiting', { animal: cap(name(gate.waiting.kind)) }) : t('play.gateEmpty')}
                style={styles.slot}
              >
                {gate.waiting ? (
                  <Animated.View key={gate.waiting.id} entering={reducedMotion ? undefined : ZoomIn.springify()}>
                    <Art name={animalArt(gate.waiting.kind)} size={60} height={52} />
                  </Animated.View>
                ) : (
                  <Icon name="plus" size={22} color={c.primaryText} />
                )}
              </Pressable>
              <View style={styles.slot}>
                <Icon name="plus" size={22} color={c.primaryText} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyBold" color={c.primaryText}>
                  {t('play.gate')}
                </AppText>
                <AppText variant="tiny" color={c.textMuted}>
                  {gate.waiting ? t('play.gateWaiting', { animal: name(gate.waiting.kind) }) : t('play.sortHint')}
                </AppText>
              </View>
            </View>
          </Animated.View>

          <View style={styles.meadow}>
            {meadow.map((animal) => (
              <DragToken
                key={animal.id}
                zones={zones}
                reducedMotion={reducedMotion}
                onPickUp={() => {
                  setDragging(true);
                  haptic('selection');
                }}
                onRelease={() => setDragging(false)}
                onDrop={(zone) => (zone === 'gate' ? toGate(animal) : false)}
              >
                <Pressable
                  onPress={() => toGate(animal)}
                  accessibilityRole="button"
                  accessibilityLabel={cap(t('a11y.loose', { animal: name(animal.kind) }))}
                  style={styles.animal}
                >
                  <Art name={animalArt(animal.kind)} size={62} height={50} />
                  <AppText variant="tiny" color={c.textMuted}>
                    {name(animal.kind)}
                  </AppText>
                </Pressable>
              </DragToken>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {calm ? (
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(700)} style={styles.calmCard}>
          <AppText variant="heading" accessibilityRole="header">
            {t('play.calmTitle')}
          </AppText>
          <AppText variant="body">{t('play.calmText')}</AppText>
          <Button label={t('play.finish')} icon="check" variant="gold" onPress={finish} />
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

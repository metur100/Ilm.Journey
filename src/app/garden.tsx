import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Art } from '@/core/art';
import { GardenScene } from '@/core/components/garden/GardenScene';
import { gardenElementName, useGarden } from '@/core/components/garden/useGarden';
import { AppText } from '@/core/components/ui/AppText';
import { Dialog } from '@/core/components/ui/AppModal';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { Icon } from '@/core/components/ui/Icon';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { TopBar } from '@/core/components/ui/TopBar';
import {
  DAILY_WATER_CAP,
  EARN_TABLE,
  fittingSpots,
  GARDEN_ELEMENTS,
  type GardenElement,
  getGardenElement,
  type MilestoneKind,
  type PlacedElement,
  unlockState,
  useGardenStore,
} from '@/core/garden';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { type CoreKey, useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

type Step = 'idle' | 'choose' | 'spot' | 'edit';

const MILESTONES: MilestoneKind[] = ['gameLevel', 'quest', 'unit', 'story', 'episode', 'master', 'streak7'];

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: spacing.sm, minHeight: 56 },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '31.5%', flexGrow: 1, alignItems: 'center', gap: 4, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface, minHeight: 128 },
  tileLocked: { backgroundColor: c.surfaceAlt },
  tileArt: { height: 64, justifyContent: 'flex-end' },
  dim: { opacity: 0.35 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  can: { position: 'absolute', right: spacing.lg, top: spacing.lg },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
}));

/** The Ilm Garden: plant elements on free spots, water after a learning day, see how the garden grows. */
export default function GardenScreen() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const reduced = useReducedMotion();
  const view = useGarden();
  const { garden, level } = view;
  const unlock = useGardenStore((s) => s.unlock);
  const plant = useGardenStore((s) => s.plant);
  const remove = useGardenStore((s) => s.remove);
  const waterPlants = useGardenStore((s) => s.waterPlants);

  const [step, setStep] = useState<Step>('idle');
  const [chosen, setChosen] = useState<GardenElement | null>(null);
  const scroll = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  // A taller scene on tablets, so the garden keeps its proportions instead of becoming a thin strip.
  const sceneHeight = Math.round(Math.min(560, Math.max(340, (windowWidth - spacing.lg * 2) * 0.62)));
  const [growSpot, setGrowSpot] = useState<number | null>(null);
  const [removing, setRemoving] = useState<PlacedElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pour = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  const name = (id: string) => t(gardenElementName(id));

  const choose = (element: GardenElement) => {
    const state = unlockState(garden, element.id, level);
    if (state === 'levelLocked' || state === 'tooExpensive') {
      feedback.failure();
      setMessage(state === 'levelLocked' ? t('garden.needsLevel', { level: element.minLevel }) : t('garden.needsSeeds', { count: element.seedCost }));
      return;
    }
    if (state === 'buyable' && !unlock(element.id, level)) return;
    if (state === 'buyable') setMessage(t('garden.unlocked', { name: name(element.id) }));
    // Only places of the right kind are offered: water spots for a fountain, the grove for trees, the sky for birds.
    const spots = fittingSpots(element, view.free);
    if (spots.length === 0) {
      feedback.failure();
      setMessage(t('garden.noPlace', { name: name(element.id) }));
      setStep('idle');
      return;
    }
    if (spots.length === 1) {
      plantOn(element, spots[0]);
      return;
    }
    feedback.tap();
    setChosen(element);
    setStep('spot');
    // The spot markers are in the scene at the top – bring it into view.
    scroll.current?.scrollTo({ y: 0, animated: !reduced });
  };

  const plantOn = (element: GardenElement, spot: number) => {
    if (plant(element.id, spot, level)) {
      feedback.success();
      setGrowSpot(spot);
      setMessage(t('garden.planted', { name: name(element.id) }));
    } else {
      feedback.failure();
    }
    setChosen(null);
    setStep('idle');
  };

  const water = () => {
    if (!waterPlants()) {
      feedback.failure();
      setMessage(view.wateredToday ? t('garden.wateredAlready') : t('garden.noWater'));
      return;
    }
    feedback.success();
    setMessage(t('garden.watered'));
    if (!reduced) {
      pour.setValue(0);
      Animated.sequence([
        Animated.timing(pour, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(700),
        Animated.timing(pour, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  };

  const canRotate = pour.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-35deg'] });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar title={t('garden.title')} />
      <ScrollView ref={scroll} contentContainerStyle={styles.body}>
        <GardenScene
          placed={garden.placed}
          thirst={view.thirst}
          height={sceneHeight}
          mode={step === 'spot' ? 'pickSpot' : step === 'edit' ? 'edit' : 'view'}
          freeSpots={chosen ? fittingSpots(chosen, view.free) : []}
          onPickSpot={(spot) => chosen && plantOn(chosen, spot)}
          onPressElement={(p) => setRemoving(p)}
          growSpot={growSpot}
          elementLabel={name}
          accessibilityLabel={view.a11y}
        >
          {!reduced ? (
            <Animated.View pointerEvents="none" style={[styles.can, { opacity: pour, transform: [{ rotate: canRotate }] }]}>
              <Art name="garden.watering-can" size={96} />
            </Animated.View>
          ) : null}
        </GardenScene>

        <View style={styles.stats}>
          <View style={styles.stat} accessible accessibilityLabel={t('garden.seedsCount', { count: garden.seeds })}>
            <Art name="garden.seed" size={32} />
            <AppText variant="bodyBold">{t('garden.seedsCount', { count: garden.seeds })}</AppText>
          </View>
          <View style={styles.stat} accessible accessibilityLabel={t('garden.waterCount', { count: garden.water })}>
            <Art name="garden.water-drop" size={26} />
            <AppText variant="bodyBold">{t('garden.waterCount', { count: garden.water })}</AppText>
          </View>
        </View>

        <Card tone={view.thirst === 0 ? 'primary' : 'gold'}>
          <View style={styles.hint}>
            <Icon name={view.thirst === 0 ? 'sparkle' : 'sun'} size={22} color={view.thirst === 0 ? c.primaryText : c.goldText} />
            <AppText variant="small" style={styles.flex}>
              {message ?? (view.thirst === 0 ? t('garden.lushHint') : t('garden.thirstyHint'))}
            </AppText>
          </View>
        </Card>

        {step === 'spot' && chosen ? (
          <Card tone="gold">
            <View style={styles.hint}>
              <Art name={`garden.${chosen.id}`} size={40} />
              <AppText variant="bodyBold" style={styles.flex}>
                {t('garden.pickSpot', { name: name(chosen.id) })}
              </AppText>
            </View>
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => {
                setChosen(null);
                setStep('idle');
              }}
            />
          </Card>
        ) : null}

        {step === 'idle' || step === 'edit' ? (
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={t('garden.plant')} icon="plus" onPress={() => setStep('choose')} disabled={step === 'edit'} />
            </View>
            <View style={styles.action}>
              <Button label={t('garden.water')} icon="refresh" variant="gold" onPress={water} disabled={step === 'edit'} accessibilityHint={view.canWater ? undefined : t('garden.noWater')} />
            </View>
          </View>
        ) : null}
        {step === 'idle' || step === 'edit' ? (
          <Button
            label={step === 'edit' ? t('common.done') : t('garden.arrange')}
            icon={step === 'edit' ? 'check' : 'pencil'}
            variant="secondary"
            onPress={() => setStep(step === 'edit' ? 'idle' : 'edit')}
            accessibilityHint={t('garden.arrangeHint')}
          />
        ) : null}
        {step === 'edit' ? (
          <AppText variant="small" color={c.textMuted}>
            {t('garden.arrangeHint')}
          </AppText>
        ) : null}

        {step === 'choose' ? (
          <View style={{ gap: spacing.md }}>
            <SectionHeader title={t('garden.choose')} actionLabel={t('common.cancel')} onAction={() => setStep('idle')} />
            <View style={styles.grid}>
              {GARDEN_ELEMENTS.map((element) => {
                const state = unlockState(garden, element.id, level);
                const locked = state === 'levelLocked';
                const status =
                  state === 'available'
                    ? t('garden.available')
                    : state === 'levelLocked'
                      ? t('common.level', { level: element.minLevel })
                      : t('garden.cost', { count: element.seedCost });
                return (
                  <Pressable
                    key={element.id}
                    onPress={() => choose(element)}
                    accessibilityRole="button"
                    accessibilityLabel={`${name(element.id)}, ${status}`}
                    accessibilityState={{ disabled: locked }}
                    style={({ pressed }) => [styles.tile, locked && styles.tileLocked, pressed && { opacity: 0.85 }]}
                  >
                    <View style={[styles.tileArt, locked && styles.dim]}>
                      <Art name={`garden.${element.id}`} size={56} />
                    </View>
                    <AppText variant="small" align="center" numberOfLines={2}>
                      {name(element.id)}
                    </AppText>
                    <View style={styles.costRow}>
                      {locked ? <Icon name="lock" size={14} color={c.textMuted} /> : state !== 'available' ? <Art name="garden.seed" size={16} /> : <Icon name="check" size={14} color={c.success} />}
                      <AppText variant="tiny" color={state === 'tooExpensive' || locked ? c.textMuted : c.primaryText}>
                        {status}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <SectionHeader title={t('garden.howTitle')} />
        <Card>
          <View style={styles.ruleRow}>
            <AppText variant="small" style={styles.flex}>
              {t('garden.rule.water', { count: EARN_TABLE.activity.water, max: DAILY_WATER_CAP })}
            </AppText>
            <Art name="garden.water-drop" size={18} />
          </View>
          {MILESTONES.map((kind) => (
            <View key={kind} style={styles.ruleRow} accessible accessibilityLabel={`${t(`garden.rule.${kind}` as CoreKey)}: ${t('garden.cost', { count: EARN_TABLE.milestones[kind].seeds })}`}>
              <AppText variant="small" style={styles.flex}>
                {t(`garden.rule.${kind}` as CoreKey)}
              </AppText>
              <View style={styles.costRow}>
                <AppText variant="bodyBold" color={c.goldText}>
                  {`+${EARN_TABLE.milestones[kind].seeds}`}
                </AppText>
                <Art name="garden.seed" size={18} />
              </View>
            </View>
          ))}
          <AppText variant="tiny" color={c.textMuted} style={{ marginTop: spacing.sm }}>
            {t('garden.never')}
          </AppText>
        </Card>
      </ScrollView>

      <Dialog
        visible={!!removing}
        title={t('garden.removeTitle', { name: removing ? name(removing.elementId) : '' })}
        body={t('garden.removeBody')}
        confirmLabel={t('garden.remove')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing && getGardenElement(removing.elementId)) remove(removing.spot);
          setRemoving(null);
        }}
      />
    </SafeAreaView>
  );
}

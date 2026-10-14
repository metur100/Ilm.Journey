import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { challengeBonus, ChallengeClock, ProgressDots, Sparkles, useShake, useStopwatch } from '../wudu-flow/kit';
import { Compass } from './Compass';
import {
  angleDiff,
  CITIES,
  compassPoint,
  compassPointBearing,
  normalizeDeg,
  PAR_MS,
  playOrder,
  qiblaBearing,
  qiblaResult,
  roundPoints,
  type CityId,
  type QiblaConfig,
} from './logic';
import { QiblaMap } from './QiblaMap';

export type { QiblaConfig } from './logic';

const useStyles = makeStyles((c) => ({
  scroll: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  instruction: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: spacing.md, gap: 2 },
  compassRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  turn: {
    width: TOUCH_TARGET + 4,
    height: TOUCH_TARGET + 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  reading: { alignItems: 'center' },
  result: { backgroundColor: c.goldSoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: c.goldBorder },
  stars: { flexDirection: 'row', gap: 2 },
}));

/** Find the Qibla: turn the compass towards the Kaaba from cities around the world; the great-circle path is revealed. */
export function FindQiblaGame(api: GameApi<QiblaConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const { t, haptic, playSound, reducedMotion, config } = api;
  const [cities] = useState<CityId[]>(() => playOrder(config));
  const [round, setRound] = useState(0);
  const [angle, setAngle] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [checked, setChecked] = useState<{ error: number; bearing: number } | null>(null);
  const [sparkle, setSparkle] = useState(0);
  const [width, setWidth] = useState(0);
  const { style: shakeStyle, shake } = useShake(reducedMotion);
  const watch = useStopwatch(api.challengeMode);
  const finished = useRef(false);

  const city = cities[round];
  const cityName = t(`city.${city}`);
  const bearing = qiblaBearing(city);
  const reading = normalizeDeg(Math.round(angle));
  const dir = (deg: number) => t(`dir.${compassPoint(deg)}`);
  const last = round === cities.length - 1;
  const compassSize = Math.max(170, Math.min(240, Math.round((width || 320) * 0.6)));

  const onChange = useCallback((value: number) => setAngle(value), []);
  const turn = (delta: number) => {
    if (checked) return;
    haptic('tap');
    setAngle((a) => Math.round(a) + delta);
  };

  const check = () => {
    if (checked) return;
    const error = Math.round(angleDiff(reading, bearing));
    const points = roundPoints(error);
    setChecked({ error, bearing });
    setErrors((e) => [...e, error]);
    if (points >= 2) {
      haptic('success');
      playSound('success');
      setSparkle((s) => s + 1);
    } else {
      haptic('warning');
      playSound(points === 1 ? 'click' : 'failure');
      shake();
    }
  };

  const next = () => {
    if (last) {
      if (finished.current) return;
      finished.current = true;
      const bonus = api.challengeMode ? { points: challengeBonus(watch.elapsed(), PAR_MS[config.mode]), max: 10 } : undefined;
      api.onComplete(qiblaResult(errors, bonus));
      return;
    }
    setRound((r) => r + 1);
    setChecked(null);
  };

  const points = checked ? roundPoints(checked.error) : 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={!!checked} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {api.challengeMode ? <ChallengeClock ms={watch.ms} label={t('play.time')} /> : null}
      <ProgressDots total={cities.length} done={round + (checked ? 1 : 0)} label={t('play.progress', { done: round + (checked ? 1 : 0), total: cities.length })} />
      <View style={styles.instruction}>
        <AppText variant="bodyBold" accessibilityRole="header">
          {t('play.turn', { city: cityName })}
        </AppText>
        <AppText variant="small" color={c.textMuted}>
          {config.hint ? t('play.hint', { direction: t(`dirAt.${compassPoint(bearing)}`) }) : t('play.noHint')}
        </AppText>
      </View>
      <QiblaMap
        width={width}
        city={CITIES[city]}
        cityName={cityName}
        makkahName={t('play.makkah')}
        showPath={!!checked}
        reducedMotion={reducedMotion}
        label={t('play.map', { city: cityName })}
      />
      <Animated.View style={[styles.compassRow, shakeStyle]}>
        <Pressable style={styles.turn} onPress={() => turn(-5)} disabled={!!checked} accessibilityRole="button" accessibilityLabel={t('play.left')}>
          <Icon name="back" size={22} color={checked ? c.textMuted : c.primaryText} />
        </Pressable>
        <View>
          <Compass
            size={compassSize}
            angle={angle}
            onChange={onChange}
            onTick={() => haptic('selection')}
            hintBearing={config.hint && !checked ? compassPointBearing(compassPoint(bearing)) : null}
            answerBearing={checked ? checked.bearing : null}
            disabled={!!checked}
            reducedMotion={reducedMotion}
            letters={{ n: t('letter.n'), e: t('letter.e'), s: t('letter.s'), w: t('letter.w') }}
            label={t('play.compass')}
            valueText={t('play.compassValue', { deg: reading, direction: dir(reading) })}
          />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Sparkles trigger={sparkle} reducedMotion={reducedMotion} size={compassSize} />
          </View>
        </View>
        <Pressable style={styles.turn} onPress={() => turn(5)} disabled={!!checked} accessibilityRole="button" accessibilityLabel={t('play.right')}>
          <Icon name="chevron" size={22} color={checked ? c.textMuted : c.primaryText} />
        </Pressable>
      </Animated.View>
      <View style={styles.reading}>
        <AppText variant="heading" color={c.primaryText} accessibilityLiveRegion="polite">
          {t('play.reading', { deg: reading, direction: dir(reading) })}
        </AppText>
      </View>
      {checked ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <View style={styles.stars} accessible accessibilityLabel={t('play.roundStars', { count: points })}>
            {[1, 2, 3].map((i) => (
              <Icon key={i} name={i <= points ? 'star' : 'starOutline'} size={22} color={c.gold} />
            ))}
          </View>
          <AppText variant="bodyBold">{t(`play.rating.${points}`)}</AppText>
          <AppText variant="small">{t('play.answer', { city: cityName, deg: Math.round(checked.bearing), direction: dir(checked.bearing), error: checked.error })}</AppText>
          <AppText variant="small" color={c.textMuted}>
            {t('play.path')}
          </AppText>
          {city === 'new-york' ? (
            <AppText variant="small" color={c.goldText}>
              {t('play.pathNY')}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {checked ? (
        last ? (
          <Button label={t('play.finish')} icon="check" variant="gold" onPress={next} />
        ) : (
          <Button label={t('play.next')} iconRight="chevron" onPress={next} />
        )
      ) : (
        <Button label={t('play.check')} icon="compass" variant="gold" onPress={check} />
      )}
    </ScrollView>
  );
}

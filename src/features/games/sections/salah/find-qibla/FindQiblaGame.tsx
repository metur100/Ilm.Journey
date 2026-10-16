import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, GameBoard, InlineCaption, kitShuffle, ProgressDots, Tile, useKitColors, useShake } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useMeasure } from '@/core/games/kit/layout';
import { useKitProbe } from '@/core/games/kit/probe';
import { fonts, radius, spacing } from '@/core/theme';

import { Compass } from './Compass';
import { angleDiff, CITIES, compassPoint, compassPointBearing, normalizeDeg, qiblaBearing, qiblaResult, roundPoints, type CityId, type QiblaConfig } from './logic';
import { QiblaMap } from './QiblaMap';

export type { QiblaConfig } from './logic';

/** Find the Qibla: turn the compass towards the Kaaba from cities around the world; the great-circle path is revealed. */
export function FindQiblaGame(api: GameApi<QiblaConfig>) {
  return (
    <GameBoard api={api} padding={spacing.sm}>
      <QiblaBoard api={api} />
    </GameBoard>
  );
}

function QiblaBoard({ api }: { api: GameApi<QiblaConfig> }) {
  const { t, config } = api;
  const cities = useMemo<CityId[]>(() => (config.shuffle ? kitShuffle(config.cities, `${api.gameId}:${api.level}:cities`) : [...config.cities]), [config, api.gameId, api.level]);
  const errorsRef = useRef<number[]>([]);
  const core = useEngineCore(
    {
      prompt: undefined,
      hints: config.hint,
      onDone: () => api.onComplete(qiblaResult(errorsRef.current, api.facts[0]?.id)),
    },
    cities.length,
  );
  const { reduced } = core;
  const k = useKitColors();
  const area = useMeasure();
  const [round, setRound] = useState(0);
  const [angle, setAngle] = useState(0);
  const [checked, setChecked] = useState<{ error: number; bearing: number } | null>(null);
  const { style: shakeStyle, shake } = useShake(reduced);
  const scroll = useRef<ScrollView>(null);

  const city = cities[round];
  const cityName = t(`city.${city}`);
  const bearing = qiblaBearing(city);
  const reading = normalizeDeg(Math.round(angle));
  const dir = (deg: number) => t(`dir.${compassPoint(deg)}`);
  const last = round === cities.length - 1;
  const width = area.w || 300;
  const compassSize = Math.max(160, Math.min(230, Math.round(width * 0.58)));

  const onChange = useCallback((value: number) => setAngle(value), []);
  const turn = (delta: number) => {
    if (checked) return;
    core.touch();
    setAngle((a) => Math.round(a) + delta);
  };

  const check = (at: number = reading) => {
    if (checked || core.finishedRef.current) return;
    const error = Math.round(angleDiff(at, bearing));
    const points = roundPoints(error);
    setAngle(at);
    setChecked({ error, bearing });
    errorsRef.current = [...errorsRef.current, error];
    core.progress(errorsRef.current.length);
    const text = `${t(`play.rating.${points}`)} ${t('play.answer', { city: cityName, deg: Math.round(bearing), direction: dir(bearing), error })}`;
    if (points >= 2) core.right({ caption: text, tone: 'right' });
    else {
      core.wrong(city, text);
      shake();
    }
    setTimeout(() => scroll.current?.scrollToEnd({ animated: !reduced }), 80);
  };

  const next = () => {
    if (!checked) return;
    if (last) {
      core.finish(0);
      return;
    }
    setRound((r) => r + 1);
    setChecked(null);
    core.setCaption(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  useKitProbe({
    engine: 'QiblaCompass',
    testID: 'qibla-board',
    step: () => {
      if (core.finishedRef.current) return false;
      if (checked) next();
      else check(Math.round(bearing));
      return true;
    },
    mistake: () => {
      if (checked || core.finishedRef.current) return false;
      check(normalizeDeg(Math.round(bearing) + 120));
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const points = checked ? roundPoints(checked.error) : 0;
  const caption = core.caption?.text ?? `${t('play.turn', { city: cityName })} ${config.hint ? t('play.hint', { direction: t(`dirAt.${compassPoint(bearing)}`) }) : t('play.noHint')}`;

  return (
    <ScrollView ref={scroll} contentContainerStyle={styles.scroll} testID="qibla-board">
      <View onLayout={area.onLayout} style={styles.gap}>
        {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
        <ProgressDots total={cities.length} done={round + (checked ? 1 : 0)} label={t('play.progress', { done: round + (checked ? 1 : 0), total: cities.length })} />
        <View style={[styles.map, { borderColor: k.boardBorder }]}>
          <QiblaMap width={width - 4} city={CITIES[city]} cityName={cityName} makkahName={t('play.makkah')} showPath={!!checked} reducedMotion={reduced} label={t('play.map', { city: cityName })} />
        </View>
        <Animated.View style={[styles.compassRow, shakeStyle]}>
          <TurnButton icon="back" label={t('play.left')} disabled={!!checked} onPress={() => turn(-5)} />
          <View>
            <Compass
              size={compassSize}
              angle={angle}
              onChange={onChange}
              onTick={() => api.haptic('selection')}
              hintBearing={config.hint && !checked ? compassPointBearing(compassPoint(bearing)) : null}
              answerBearing={checked ? checked.bearing : null}
              disabled={!!checked}
              reducedMotion={reduced}
              letters={{ n: t('letter.n'), e: t('letter.e'), s: t('letter.s'), w: t('letter.w') }}
              label={t('play.compass')}
              valueText={t('play.compassValue', { deg: reading, direction: dir(reading) })}
            />
            {checked && points >= 2 ? <Burst trigger={round + 1} distance={compassSize * 0.55} size={16} /> : null}
          </View>
          <TurnButton icon="chevron" label={t('play.right')} disabled={!!checked} onPress={() => turn(5)} />
        </Animated.View>
        <AppText variant="bodyBold" align="center" color={k.accentText} accessibilityLiveRegion="polite">
          {t('play.reading', { deg: reading, direction: dir(reading) })}
        </AppText>
        <InlineCaption text={caption} tone={core.caption?.tone ?? 'info'} />
        {checked ? (
          <AppText variant="small" color={k.textMuted}>
            {`${t('play.path')}${city === 'new-york' ? ` ${t('play.pathNY')}` : ''}`}
          </AppText>
        ) : null}
        <Pressable
          onPress={checked ? next : () => check()}
          accessibilityRole="button"
          accessibilityLabel={checked ? t(last ? 'play.finish' : 'play.next') : t('play.check')}
          testID={checked ? 'qibla-next' : 'qibla-check'}
          style={({ pressed }) => [styles.action, { backgroundColor: pressed ? k.goldEdge : k.gold }]}
        >
          <Icon name={checked ? (last ? 'check' : 'chevron') : 'mosque'} size={20} color={k.onGold} />
          <AppText variant="bodyBold" color={k.onGold} style={{ fontFamily: fonts.heavy }}>
            {checked ? t(last ? 'play.finish' : 'play.next') : t('play.check')}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function TurnButton({ icon, label, disabled, onPress }: { icon: 'back' | 'chevron'; label: string; disabled: boolean; onPress: () => void }) {
  const k = useKitColors();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Tile width={52} minHeight={52} state={disabled ? 'disabled' : 'idle'} radius={26}>
        <Icon name={icon} size={22} color={k.accentText} />
      </Tile>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  gap: { gap: spacing.sm },
  map: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden', alignSelf: 'center' },
  compassRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  action: { minHeight: 56, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { Burst, ChallengeClock, FinishReveal, GameBoard, Glow, GrowIn, InlineCaption, kitResult, Tile, useKitColors, useShake } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { useEngineCore, useKitProbe, useMeasure } from '../shared/kit';
import { type ArmourConfig, type DawudConfig, RING_SCALE, type RingSize } from './content';

function Place({ size, ring, filled, ghost, next, glow, label, burst }: { size: number; ring: RingSize; filled: boolean; ghost: boolean; next: boolean; glow: boolean; label: string; burst: number }) {
  const k = useKitColors();
  const d = size * RING_SCALE[ring];
  return (
    <View style={[styles.place, { width: size, height: size }]} accessible accessibilityLabel={label}>
      {glow ? <Glow active radius={size / 2} spread={0} /> : null}
      {filled ? (
        <GrowIn>
          <Art name="prophet.dawud-ring" size={d} />
        </GrowIn>
      ) : ghost ? (
        <View style={{ width: d * 0.86, height: d * 0.86, borderRadius: d, borderWidth: 2, borderStyle: 'dashed', borderColor: next ? k.gold : k.slotBorder }} />
      ) : (
        <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: next ? k.goldSoft : k.slotFill, borderWidth: 1, borderColor: next ? k.gold : k.slotBorder }} />
      )}
      <Burst trigger={burst} distance={size * 0.5} size={10} />
    </View>
  );
}

function Armour({ api }: { api: GameApi<ArmourConfig> }) {
  const cfg = api.config;
  const { t } = api;
  const toBuild = cfg.links.length - cfg.given;
  const fact = api.facts[0]?.id ?? 'iron-made-soft';
  const core = useEngineCore({ onDone: ({ mistakes }) => api.onComplete(kitResult({ moves: toBuild, mistakes, factsMissed: mistakes > 0 ? [fact] : [] })), prompt: t('play.prompt'), hints: cfg.hints, testID: 'dawud-armour' }, toBuild);
  const [built, setBuilt] = useState(cfg.given);
  const [burst, setBurst] = useState<Record<number, number>>({});
  const { style: shakeStyle, shake } = useShake();
  const area = useMeasure();
  const done = built >= cfg.links.length;

  const add = (ring: RingSize) => {
    if (done || core.finishedRef.current) return;
    if (cfg.links[built] !== ring) {
      shake();
      core.wrong(`ring-${ring}`, t('play.wrongSize'));
      return;
    }
    setBurst((b) => ({ ...b, [built]: (b[built] ?? 0) + 1 }));
    core.progress(built + 1 - cfg.given);
    core.right({ caption: t('play.linked') });
    setBuilt(built + 1);
  };

  useKitProbe({
    engine: 'DawudArmour',
    testID: 'dawud-armour',
    step: () => {
      if (core.finishedRef.current) return false;
      if (done) core.finish(0);
      else add(cfg.links[built]);
      return true;
    },
    mistake: () => {
      if (done) return false;
      const other = cfg.sizes.find((s) => s !== cfg.links[built]);
      if (!other) return false;
      add(other);
      return true;
    },
    done: () => core.finishedRef.current,
  });

  const rows = Math.ceil(cfg.links.length / cfg.perRow);
  const size = Math.max(40, Math.min(64, Math.floor((area.w - 8) / cfg.perRow)));

  return (
    <View style={styles.root}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        <Animated.View style={shakeStyle}>
          {Array.from({ length: rows }, (_, r) => (
            <View key={r} style={[styles.row, r % 2 ? { marginLeft: size / 2 } : null]}>
              {cfg.links.slice(r * cfg.perRow, (r + 1) * cfg.perRow).map((ring, c) => {
                const i = r * cfg.perRow + c;
                return (
                  <Place
                    key={i}
                    size={size}
                    ring={ring}
                    filled={i < built}
                    ghost={cfg.ghosts}
                    next={i === built}
                    glow={cfg.hints && i === built}
                    burst={burst[i] ?? 0}
                    label={t('a11y.place', { number: i + 1, state: i < built ? t(`play.size.${ring}`) : t('a11y.empty') })}
                  />
                );
              })}
            </View>
          ))}
        </Animated.View>
      </View>
      <AppText variant="tiny" align="center" color={core.k.textMuted}>
        {t('play.count', { done: built - cfg.given, total: toBuild })}
      </AppText>
      <View style={styles.tray}>
        {cfg.sizes.map((s) => (
          <Pressable key={s} onPress={() => add(s)} accessibilityRole="button" accessibilityLabel={t(`play.size.${s}`)} testID={`tile-ring-${s}`}>
            <Tile width={84} height={84} padding={4}>
              <View style={styles.ringTile}>
                <Art name="prophet.dawud-ring" size={60 * RING_SCALE[s]} />
              </View>
            </Tile>
          </Pressable>
        ))}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <FinishReveal visible={done} art="prophet.dawud-armour" title={t('play.doneTitle')} caption={t('play.doneText')} onContinue={() => core.finish(0)} artSize={160} />
    </View>
  );
}

/** Dawud: L1 and L3 are episodes of his life; L2 (34:10–11, 21:80) links rings of the right size into a coat of mail. */
export function DawudArmourGame(api: GameApi<DawudConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return (
    <GameBoard api={api}>
      <Armour api={{ ...api, config }} />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 160 },
  row: { flexDirection: 'row', marginTop: -6 },
  place: { alignItems: 'center', justifyContent: 'center', marginHorizontal: -2, borderRadius: radius.pill },
  tray: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  ringTile: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

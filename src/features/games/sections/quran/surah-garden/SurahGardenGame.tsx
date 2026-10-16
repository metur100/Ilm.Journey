import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Art } from '@/core/art';
import type { GameApi } from '@/core/games';
import { GameBoard, GrowIn, MemoryPairs, useKitColors } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';

import { finishWith } from '../shared/game';
import type { SurahGardenConfig } from './register';

const FLOWERS = ['garden.flower-rose', 'garden.flower-tulip', 'garden.flower-jasmine', 'garden.flower-lily'] as const;

/** The garden row: one flower grows for every pair found; empty soil spots wait for the rest. */
function GardenRow({ grown, total, label }: { grown: number; total: number; label: string }) {
  const k = useKitColors();
  return (
    <View style={[styles.row, { backgroundColor: k.accentSoft, borderColor: k.boardBorder }]} accessible accessibilityLabel={label} testID="surah-garden-row">
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={styles.spot}>
          {i < grown ? (
            <GrowIn from={0.2}>
              <Art name={FLOWERS[i % FLOWERS.length]} size={34} />
            </GrowIn>
          ) : (
            <Art name="garden.seed" size={16} style={{ opacity: 0.45 }} />
          )}
          <View style={[styles.soil, { backgroundColor: k.tileEdge }]} />
        </View>
      ))}
    </View>
  );
}

export function SurahGardenGame(api: GameApi<SurahGardenConfig>) {
  const { pairs, peekMs, hints, mode, factOf } = api.config;
  const [grown, setGrown] = useState(0);
  return (
    <GameBoard api={api}>
      <View style={styles.root}>
        <GardenRow grown={grown} total={pairs.length} label={api.t('a11y.garden', { count: grown, total: pairs.length })} />
        <MemoryPairs
          pairs={pairs}
          peekMs={peekMs}
          hints={hints}
          columns={mode === 'opening' ? 3 : undefined}
          prompt={api.t(`play.prompt.${mode}`)}
          onProgress={({ done }) => setGrown(done)}
          onDone={finishWith(api, pairs.length, (id) => factOf[id] ?? api.facts[0]?.id)}
        />
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderRadius: radius.lg, borderWidth: 1, paddingTop: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 56 },
  spot: { alignItems: 'center', justifyContent: 'flex-end', minWidth: 36, height: 50 },
  soil: { width: 30, height: 5, borderRadius: 3, opacity: 0.6 },
});

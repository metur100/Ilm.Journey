import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Burst, ChallengeClock, DragTile, FaceView, faceLabel, InlineCaption, kitShuffle, ProgressDots, Slot, Tile, Tray, type EngineProps, type KitItem, type SlotState } from '@/core/games/kit';
// Engine internals (not exported by the kit index yet – requested from the kit author): shared bookkeeping + test probe.
import { useEngineCore } from '@/core/games/kit/engine';
import { useKitProbe } from '@/core/games/kit/probe';
import { spacing } from '@/core/theme';

/*
 * PlaceRounds – a small local engine of the Arabic section (built on the kit's primitives): in every round one tile of
 * the tray belongs on one place of a custom stage (dots above / below a letter body, a mark on a letter, the madd letter
 * after a syllable). Drag the tile there, or tap it and then the place (a single place takes the tapped tile at once).
 * Right: the stage shows the finished form; wrong: a soft shake and a gentle caption. Rounds follow one another.
 */

export interface PlaceRound {
  id: string;
  /** Tiles in the tray (the right one included). */
  tiles: KitItem[];
  /** Places on the stage (ids). */
  zones: string[];
  answer: { tile: string; zone: string };
  /** Caption after the right move (e.g. "ت – two dots above"). */
  done?: string;
  /** Caption for a wrong move (default: the kit's "try again"). */
  wrongText?: string;
}

export interface PlaceStage {
  round: PlaceRound;
  solved: boolean;
  /** Renders the drop place `id` (a kit Slot) – put it where it belongs on the stage. */
  zone: (id: string, style?: object, label?: string) => ReactNode;
}

export interface PlaceRoundsProps extends EngineProps {
  rounds: PlaceRound[];
  renderStage: (stage: PlaceStage) => ReactNode;
  /** Called when a new round starts (e.g. to say it). */
  onRound?: (round: PlaceRound, index: number) => void;
  /** Height of the tray tiles. */
  tileHeight?: number;
}

export function PlaceRounds(props: PlaceRoundsProps) {
  const { rounds, renderStage, onRound } = props;
  const core = useEngineCore(props, rounds.length);
  const { env, reduced } = core;
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [wrongZone, setWrongZone] = useState<string | null>(null);
  const round = rounds[Math.min(index, rounds.length - 1)];
  const tiles = useMemo(() => kitShuffle(round.tiles, `${core.seed}:${round.id}`), [round, core.seed]);
  const last = index >= rounds.length - 1;
  const testID = props.testID ?? 'place-rounds';

  useEffect(() => {
    onRound?.(round, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const advance = () => {
    if (last) return;
    setIndex((i) => i + 1);
    setSolved(false);
    setSelected(null);
    setWrongZone(null);
  };

  const put = (tileId: string, zoneId: string): boolean => {
    if (solved || core.finishedRef.current) return false;
    if (tileId !== round.answer.tile || zoneId !== round.answer.zone) {
      core.wrong(round.id, round.wrongText);
      setNudge((n) => ({ ...n, [tileId]: (n[tileId] ?? 0) + 1 }));
      setWrongZone(zoneId);
      setSelected(null);
      return false;
    }
    setSolved(true);
    setSelected(null);
    setWrongZone(null);
    core.progress(index + 1);
    core.right({ caption: round.done, tone: round.done ? 'fact' : 'right' });
    if (last) core.finish(reduced ? 500 : 1400);
    else setTimeout(advance, reduced ? 900 : 1500);
    return true;
  };

  useKitProbe({
    engine: 'PlaceRounds',
    testID,
    step: () => {
      if (core.finishedRef.current) return false;
      if (solved) {
        advance();
        return true;
      }
      put(round.answer.tile, round.answer.zone);
      return true;
    },
    mistake: () => {
      if (solved) return false;
      const wrongTile = round.tiles.find((t) => t.id !== round.answer.tile);
      const wrongZoneId = round.zones.find((z) => z !== round.answer.zone);
      if (wrongTile) put(wrongTile.id, round.answer.zone);
      else if (wrongZoneId) put(round.answer.tile, wrongZoneId);
      else return false;
      return true;
    },
    done: () => last && solved,
  });

  const zone = (id: string, style?: object, label?: string) => {
    const state: SlotState = solved && id === round.answer.zone ? 'right' : wrongZone === id ? 'wrong' : core.hintsOn && core.idle && id === round.answer.zone ? 'next' : 'empty';
    return (
      <Slot
        key={id}
        id={id}
        testID={`zone-${id}`}
        state={state}
        accessibilityLabel={label ?? id}
        onPress={selected ? () => put(selected, id) : undefined}
        style={[{ minWidth: 56, minHeight: 48 }, style]}
      />
    );
  };

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {rounds.length > 1 ? <ProgressDots total={rounds.length} done={index + (solved ? 1 : 0)} /> : null}
      <Animated.View key={round.id} entering={FadeIn.duration(reduced ? 150 : 350)} style={styles.stage}>
        {renderStage({ round, solved, zone })}
        {solved ? <Burst trigger={index + 1} distance={80} size={16} /> : null}
      </Animated.View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.tray}>
        {tiles.map((t) => (
          <Animated.View key={`${round.id}-${t.id}`} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
            <DragTile
              id={t.id}
              nudge={nudge[t.id] ?? 0}
              selected={selected === t.id}
              disabled={solved}
              accessibilityLabel={env.kt('a11y.tile', { label: faceLabel(t, env.text) })}
              onLift={core.touch}
              onPress={() => {
                if (round.zones.length === 1) put(t.id, round.zones[0]);
                else {
                  core.touch();
                  setSelected(t.id);
                  core.setCaption({ text: env.kt('fb.selected', { label: faceLabel(t, env.text) }), tone: 'hint' });
                }
              }}
              onDrop={(z) => (round.zones.includes(z) ? put(t.id, z) : false)}
            >
              <Tile state={selected === t.id ? 'selected' : solved && t.id === round.answer.tile ? 'placed' : 'idle'} minHeight={props.tileHeight ?? 64} style={{ minWidth: 64 }} padding={spacing.sm}>
                <FaceView face={t} arabicSize={30} variant="bodyBold" numberOfLines={1} />
              </Tile>
            </DragTile>
          </Animated.View>
        ))}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  tray: { minHeight: 72 },
});

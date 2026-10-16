import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, InlineCaption, ProgressDots, useKitColors, useShake, type EngineProps, type KitText } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useKitProbe } from '@/core/games/kit/probe';
import { fonts, radius, spacing } from '@/core/theme';

import type { PrayerId } from './content';
import { phaseAt, PRAYER_SKY, PRAYER_SPOT, prayerAt, sunDirection } from './logic';
import { SkyStage } from './SkyStage';

/*
 * SunDial – the Prayer Sky board (custom engine of the salah section, built on the kit's engine core and feedback):
 * drag the sun along its arc, the sky changes live, then confirm "Time for …". A right answer snaps the sun to the
 * prayer's moment and shows the lesson sentence inline; a wrong one says "earlier" / "later".
 */

export interface SunDialProps extends EngineProps {
  /** Prayers to find, in the order they are asked. */
  prayers: PrayerId[];
  name: (p: PrayerId) => string;
  /** Inline caption after a right answer (the lesson sentence). */
  explain: (p: PrayerId) => string;
  /** Describe the sky phase while dragging (L1); off = only the sky itself. */
  describe: boolean;
  phaseText: (phase: string) => string;
  findText: (prayer: string) => string;
  confirmText: (prayer: string) => string;
  earlierText: KitText;
  laterText: KitText;
  skyLabel: (phase: string) => string;
}

export function SunDial(props: SunDialProps) {
  const { prayers, name } = props;
  const core = useEngineCore(props, prayers.length);
  const { env, reduced } = core;
  const k = useKitColors();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(0.02);
  const [solved, setSolved] = useState(false);
  const [found, setFound] = useState(0);
  const { style: shakeStyle, shake } = useShake(reduced);
  const prayer = prayers[Math.min(index, prayers.length - 1)];
  const done = found >= prayers.length;
  const testID = props.testID ?? 'sun-dial';

  const onChange = useCallback((v: number) => setValue(v), []);

  const confirm = (at: number = value) => {
    if (core.finishedRef.current || solved || done) return;
    if (prayerAt(at) !== prayer) {
      core.wrong(prayer, env.text(sunDirection(at, prayer) === 'earlier' ? props.earlierText : props.laterText));
      shake();
      return;
    }
    setValue(PRAYER_SPOT[prayer]);
    setSolved(true);
    const count = found + 1;
    setFound(count);
    core.progress(count);
    core.right({ caption: props.explain(prayer), tone: 'fact' });
    if (count >= prayers.length) core.finish(reduced ? 400 : 1600);
    else
      setTimeout(
        () => {
          setIndex((i) => i + 1);
          setSolved(false);
          core.setCaption({ text: props.findText(name(prayers[count])), tone: 'info' });
        },
        reduced ? 600 : 1800,
      );
  };

  useKitProbe({
    engine: 'SunDial',
    testID,
    step: () => {
      if (done || solved) return false;
      confirm(PRAYER_SPOT[prayer]);
      return true;
    },
    mistake: () => {
      if (done || solved) return false;
      const wrong = (PRAYER_SPOT[prayer] + 0.35) % 1;
      confirm(prayerAt(wrong) === prayer ? (wrong + 0.3) % 1 : wrong);
      return true;
    },
    done: () => done,
  });

  const phase = phaseAt(value);
  const caption = props.describe ? props.phaseText(phase) : name(prayer);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <ProgressDots total={prayers.length} done={found} />
      <Animated.View style={[styles.stage, shakeStyle]}>
        <SkyStage value={value} onChange={onChange} caption={caption} label={props.skyLabel(props.phaseText(phase))} disabled={solved || done} reducedMotion={reduced} />
        {solved ? <Burst trigger={found} distance={80} size={16} /> : null}
      </Animated.View>
      <InlineCaption text={core.caption?.text ?? props.findText(name(prayer))} tone={core.caption?.tone ?? 'info'} />
      <Pressable
        onPress={() => confirm()}
        disabled={solved || done}
        accessibilityRole="button"
        accessibilityLabel={props.confirmText(name(prayer))}
        testID="sun-confirm"
        style={({ pressed }) => [styles.confirm, { backgroundColor: pressed ? k.goldEdge : k.gold, opacity: solved || done ? 0.55 : 1 }]}
      >
        <Art name={PRAYER_SKY[prayer]} size={34} />
        <AppText variant="bodyBold" color={k.onGold} style={{ fontFamily: fonts.heavy }}>
          {props.confirmText(name(prayer))}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm, justifyContent: 'center' },
  stage: { borderRadius: radius.lg, overflow: 'hidden' },
  confirm: { minHeight: 56, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
});

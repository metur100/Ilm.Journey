import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { AppText } from '../../../components/ui/AppText';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { DragTile } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, Pop } from '../fx';
import { useMeasure } from '../layout';
import { FaceView, faceLabel, Slot, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitItem } from '../types';

export interface WordTilesProps extends EngineProps {
  /** Tiles in reading order (Arabic: right-to-left reading order). */
  target: KitItem[];
  /** Extra tiles that do not belong. */
  distractors?: KitItem[];
  /** Lay the slots right-to-left (default: auto when the tiles are Arabic). */
  rtl?: boolean;
  /** The text is verified Quran text from the generated data (Quran font). */
  quran?: boolean;
  /** Joins the built text in the preview (default ' '; use '' for letters / syllables). */
  joiner?: string;
  /** Show the text built so far above the slots (default true). */
  preview?: boolean;
}

const isArabic = (s?: string) => !!s && /[؀-ۿ]/.test(s);

/**
 * WordTiles – build a word, phrase or ayah from tiles. Tap a tile to put it in the next place, or drag it onto a
 * place. Right-to-left for Arabic, with the joined text growing above the places.
 */
export function WordTiles(props: WordTilesProps) {
  const { target } = props;
  const core = useEngineCore(props, target.length);
  const { env, k, reduced } = core;
  const rtl = props.rtl ?? target.every((t) => isArabic(t.arabic));
  const pool = useMemo(() => kitShuffle([...target, ...(props.distractors ?? [])], `${core.seed}:words`), [target, props.distractors, core.seed]);
  const [placed, setPlaced] = useState<(string | null)[]>(() => target.map(() => null));
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [pop, setPop] = useState(0);
  const measure = useMeasure();
  const testID = props.testID ?? 'word-tiles';
  const next = placed.findIndex((p) => p === null);
  const done = next < 0;
  const label = (i: KitItem) => faceLabel(i, env.text);

  const put = (itemId: string, slot: number): boolean => {
    if (core.finishedRef.current || slot < 0 || placed[slot]) return false;
    if (target[slot].id !== itemId) {
      core.wrong(itemId);
      setNudge((n) => ({ ...n, [itemId]: (n[itemId] ?? 0) + 1 }));
      return false;
    }
    const nextPlaced = placed.map((p, i) => (i === slot ? itemId : p));
    setPlaced(nextPlaced);
    setPop((p) => p + 1);
    const count = nextPlaced.filter(Boolean).length;
    core.progress(count);
    core.right({ caption: false });
    if (count === target.length) {
      core.setCaption({ text: env.kt('fb.done'), tone: 'right' });
      core.finish(reduced ? 300 : 1100);
    }
    return true;
  };

  useKitProbe({
    engine: 'WordTiles',
    testID,
    step: () => {
      if (done) return false;
      put(target[next].id, next);
      return true;
    },
    mistake: () => {
      if (done) return false;
      const wrong = pool.find((p) => p.id !== target[next].id && !placed.includes(p.id));
      if (!wrong) return false;
      put(wrong.id, next);
      return true;
    },
    done: () => done,
  });

  const quran = props.quran ?? target.some((t) => t.quran);
  const joiner = props.joiner ?? ' ';
  const builtText = placed
    .map((id) => target.find((t) => t.id === id))
    .filter((t): t is KitItem => !!t)
    .map((t) => t.arabic ?? env.text(t.label))
    .join(joiner);
  const n = target.length;
  const gap = spacing.sm;
  const perRow = Math.min(n, measure.w > 0 && measure.w < 340 ? 4 : 5);
  const slotW = measure.w > 0 ? Math.floor((measure.w - gap * (perRow - 1)) / perRow) : 64;
  const anyArabic = pool.some((p) => isArabic(p.arabic));
  const slotH = anyArabic ? 64 : 52;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.stage} onLayout={measure.onLayout}>
        {props.preview !== false ? (
          <Pop trigger={pop} style={[styles.preview, { backgroundColor: k.tileFace, borderColor: done ? k.right : k.tileBorder }]}>
            <AppText
              script={anyArabic ? (quran ? 'quran' : 'arabic') : 'auto'}
              align="center"
              color={builtText ? k.text : k.textMuted}
              style={anyArabic ? { fontFamily: quran ? fonts.quran : fonts.arabicBold, fontSize: 30, lineHeight: quran ? 58 : 48, writingDirection: 'rtl' } : { fontFamily: fonts.heavy, fontSize: 22, lineHeight: 30 }}
              accessibilityLiveRegion="polite"
            >
              {builtText || '…'}
            </AppText>
            {done ? <Burst trigger={1} distance={80} size={16} /> : null}
          </Pop>
        ) : null}
        <View style={[styles.slots, { flexDirection: rtl ? 'row-reverse' : 'row', gap }]}>
          {target.map((t, i) => {
            const filled = placed[i];
            return (
              <View key={t.id} style={{ width: slotW, height: slotH }}>
                <Slot
                  id={`word-${i}`}
                  testID={`zone-word-${i}`}
                  state={filled ? 'filled' : core.hintsOn && i === next ? 'next' : 'empty'}
                  accessibilityLabel={filled ? env.kt('a11y.slotFilled', { number: i + 1, label: label(t) }) : env.kt('word.slot', { number: i + 1 })}
                  style={{ flex: 1 }}
                >
                  {filled ? (
                    <Animated.View entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(12)} style={{ flex: 1, alignSelf: 'stretch' }}>
                      <Tile state="placed" height={slotH} padding={2}>
                        <FaceView face={t} artSize={28} arabicSize={quran ? 22 : 24} variant="small" numberOfLines={1} />
                      </Tile>
                    </Animated.View>
                  ) : null}
                </Slot>
              </View>
            );
          })}
        </View>
        {core.hintsOn && core.idle && !done ? <HintPointer from={{ x: measure.w / 2, y: measure.h - 20 }} /> : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={env.kt('tray')} style={[styles.tray, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {pool
          .filter((p) => !placed.includes(p.id))
          .map((item) => (
            <Animated.View key={item.id} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
              <DragTile
                id={item.id}
                nudge={nudge[item.id] ?? 0}
                accessibilityLabel={env.kt('a11y.tile', { label: label(item) })}
                onLift={core.touch}
                onPress={() => put(item.id, next)}
                onDrop={(zone) => (zone.startsWith('word-') ? put(item.id, Number(zone.slice(5))) : false)}
              >
                <Tile minHeight={slotH} style={{ minWidth: 56 }} padding={spacing.sm}>
                  <FaceView face={item} artSize={30} arabicSize={quran ? 24 : 26} variant="bodyBold" numberOfLines={1} />
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
  stage: { flex: 1, justifyContent: 'center', gap: spacing.lg, minHeight: 160 },
  preview: { borderRadius: radius.lg, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.md, minHeight: 72, justifyContent: 'center' },
  slots: { flexWrap: 'wrap', justifyContent: 'center' },
  tray: { minHeight: 64 },
});

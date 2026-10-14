import { useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { BlockCard } from './BlockCard';
import { Draggable } from './Draggable';
import { checkPlacement, masjidResult, nextPart, PARTS, type PartId, SITE } from './logic';
import { PartArt, thumbSize } from './Parts';
import { QiblaTurn } from './QiblaTurn';

export interface MasjidConfig {
  /** `build`: assemble the parts (levels 1–2); `qibla`: prayer rows and the change of the qibla (level 3). */
  mode: 'build' | 'qibla';
  parts: PartId[];
  /** Level 1: the next part glows and its place is outlined. */
  guided: boolean;
}

const TRAY_GAP = 8;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 64 },
  flex: { flex: 1, gap: 2 },
  target: { width: 96, alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingVertical: 4 },
  board: { flex: 1 },
  stage: { position: 'absolute', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.surfaceAlt },
  partCard: { flex: 1, borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center', padding: 4, gap: 2 },
  glow: { borderColor: c.gold, backgroundColor: c.goldSoft },
  ghostLabel: { position: 'absolute', backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1, borderWidth: 1, borderColor: c.goldBorder },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  feedback: { minHeight: 22 },
}));

/**
 * Build the Masjid: assemble the early Masjid an-Nabawi from its parts (the ground, brick walls, the qibla wall, the
 * palm grove of the oasis). Each placed part reveals a Seerah fact; level 3 turns the qibla from Jerusalem to the Kaʿbah.
 */
export function BuildTheMasjidGame(api: GameApi<MasjidConfig>) {
  if (api.config.mode === 'qibla') return <QiblaTurn {...api} />;
  return <BuildSite {...api} />;
}

function BuildSite({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<MasjidConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const tray = useMemo(
    () => (config.guided ? config.parts : shuffle(config.parts, seededRandom(hashString(`${gameId}:${level}`)))),
    [config.guided, config.parts, gameId, level],
  );
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [placed, setPlaced] = useState<PartId[]>([]);
  const [card, setCard] = useState<PartId | null>(null);
  const [message, setMessage] = useState<{ tone: 'hint' | 'good'; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [withMistakes, setWithMistakes] = useState<PartId[]>([]);
  const finished = useRef(false);
  const name = (id: PartId) => t(`part.${id}`);
  const guidedNext = config.guided ? nextPart(config.parts, placed) : null;
  const done = placed.length === config.parts.length;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 1 || Math.abs(size.h - height) > 1) setSize({ w: width, h: height });
  };

  // Layout: the site on top, the tray of parts below.
  const cardSize = size ? Math.min(92, (size.w - TRAY_GAP * (config.parts.length - 1)) / config.parts.length) : 80;
  const trayH = cardSize + 6;
  const stageW = size ? Math.min(size.w, ((size.h - trayH - 12) * SITE.w) / SITE.h) : 300;
  const scale = stageW / SITE.w;
  const stageH = SITE.h * scale;
  const stageX = size ? (size.w - stageW) / 2 : 0;
  const trayY = stageH + 12;
  const trayX = size ? (size.w - (cardSize * config.parts.length + TRAY_GAP * (config.parts.length - 1))) / 2 : 0;

  const mistake = (id: PartId, text: string) => {
    setMistakes((m) => m + 1);
    setWithMistakes((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMessage({ tone: 'hint', text });
    haptic('warning');
  };

  const explain = (id: PartId, res: ReturnType<typeof checkPlacement>) => {
    if (res.ok || res.reason === 'placed') return;
    if (res.reason === 'needs-first') mistake(id, t('play.needsFirst', { part: name(res.missing) }));
    else mistake(id, t('play.wrongSpot', { part: name(id) }));
  };

  const place = (id: PartId) => {
    setPlaced((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCard(id);
    setMessage({ tone: 'good', text: t('play.placed', { part: name(id) }) });
    playSound(placed.length + 1 === config.parts.length ? 'reward' : 'success');
    haptic('success');
  };

  const closeCard = () => {
    setCard(null);
    haptic('tap');
    if (done && !finished.current) {
      finished.current = true;
      onComplete(masjidResult({ parts: config.parts.length, partsWithMistakes: withMistakes.length, buildMistakes: mistakes }));
    }
  };

  const ghost = guidedNext ? PARTS[guidedNext].slot : null;
  const instruction = done ? t('play.complete') : guidedNext ? t('play.next', { part: name(guidedNext) }) : t('play.drag');

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <View style={styles.flex} accessibilityLiveRegion="polite">
          <AppText variant="heading">{instruction}</AppText>
        </View>
        <View style={styles.target}>
          <Art name="place.masjid-nabawi-early" size={84} label={t('play.target')} />
          <AppText variant="tiny" color={c.textMuted} align="center">
            {t('play.target')}
          </AppText>
        </View>
      </View>

      <View style={styles.board} onLayout={onLayout}>
        {size ? (
          <>
            <View style={[styles.stage, { left: stageX, top: 0, width: stageW, height: stageH }]} accessible accessibilityLabel={t('a11y.site')}>
              <Art name="sky.morning" size={stageW} height={stageH} fit="cover" />
              {ghost && !card ? (
                <>
                  <Svg width={stageW} height={stageH} viewBox={`0 0 ${SITE.w} ${SITE.h}`} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
                    <Rect x={ghost.x} y={ghost.y} width={ghost.w} height={ghost.h} rx={6} fill={c.gold} fillOpacity={0.16} stroke={c.gold} strokeWidth={2} strokeDasharray="6 4" />
                  </Svg>
                  <View style={[styles.ghostLabel, { left: ghost.x * scale + 6, top: ghost.y * scale + 4 }]} pointerEvents="none">
                    <AppText variant="tiny" color={c.goldText}>
                      {name(guidedNext!)}
                    </AppText>
                  </View>
                </>
              ) : null}
              {[...placed]
                .sort((a, b) => PARTS[a].z - PARTS[b].z)
                .map((id) => {
                  const s = PARTS[id].slot;
                  return (
                    <Animated.View
                      key={id}
                      entering={reducedMotion ? undefined : id === 'plot' ? FadeIn.duration(350) : ZoomIn.springify().damping(13)}
                      style={{ position: 'absolute', left: s.x * scale, top: s.y * scale, width: s.w * scale, height: s.h * scale }}
                      pointerEvents="none"
                    >
                      <PartArt id={id} width={s.w * scale} height={s.h * scale} />
                    </Animated.View>
                  );
                })}
            </View>

            {tray.map((id, k) => {
              if (placed.includes(id)) return null;
              const thumb = thumbSize(id, cardSize - 26);
              const glow = id === guidedNext;
              return (
                <Draggable
                  key={id}
                  x={trayX + k * (cardSize + TRAY_GAP)}
                  y={trayY}
                  width={cardSize}
                  height={cardSize}
                  reducedMotion={reducedMotion}
                  disabled={card !== null}
                  label={t('a11y.part', { part: name(id) })}
                  onLift={() => haptic('selection')}
                  onDrop={(cx, cy) => {
                    if (cy > stageH + 4) return null;
                    const res = checkPlacement(id, placed, { x: (cx - stageX) / scale, y: cy / scale });
                    if (!res.ok) {
                      explain(id, res);
                      return null;
                    }
                    const s = PARTS[id].slot;
                    return { x: stageX + (s.x + s.w / 2) * scale - cardSize / 2, y: (s.y + s.h / 2) * scale - cardSize / 2 };
                  }}
                  onSnapped={() => place(id)}
                  onTap={() => {
                    const res = checkPlacement(id, placed, null);
                    if (res.ok) place(id);
                    else explain(id, res);
                  }}
                  style={[styles.partCard, glow && styles.glow]}
                >
                  <PartArt id={id} width={thumb.w} height={thumb.h} thumb />
                  <AppText variant="tiny" align="center" numberOfLines={1}>
                    {name(id)}
                  </AppText>
                </Draggable>
              );
            })}
          </>
        ) : null}

        {card && size ? (
          <Animated.View style={styles.overlay} entering={reducedMotion ? undefined : FadeInDown.duration(280)}>
            <BlockCard
              eyebrow={t('play.placed', { part: name(card) })}
              title={name(card)}
              art={PARTS[card].art}
              block={PARTS[card].block}
              date={PARTS[card].date}
              maxHeight={size.h * 0.85}
              onContinue={closeCard}
              t={t}
              l={l}
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.feedback} accessibilityLiveRegion="polite">
        {message ? (
          <AppText variant="small" color={message.tone === 'good' ? c.success : c.goldText}>
            {message.text}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

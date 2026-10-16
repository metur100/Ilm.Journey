import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art, hasArt } from '../../art';
import { star8Path } from '../../art/kit';
import { AppText, type TextVariant } from '../../components/ui/AppText';
import { fonts, radius as R, spacing } from '../../theme';
import { localizeKitText, useKitColors, useKitMaybe } from './context';
import { DropZone, type DropZoneProps } from './drag';
import { Glow } from './fx';
import type { KitFace, KitText } from './types';

/*
 * Visual building blocks of every engine: the face of an item, the tactile tile (a raised face on a darker lip, so
 * it reads as something you can pick up), the slot (an inset, dashed place to drop on), the flip card and the tray.
 */

function useText() {
  const env = useKitMaybe();
  return (value: KitText | undefined) => (env ? env.text(value) : localizeKitText(value, 'en'));
}

/** Accessible label of a face (label, else Arabic, else the art name). */
export function faceLabel(face: KitFace, text: (v: KitText | undefined) => string): string {
  return text(face.a11y) || text(face.label) || face.arabic || '';
}

export function useFaceLabel() {
  const text = useText();
  return (face: KitFace) => faceLabel(face, text);
}

export interface FaceViewProps {
  face: KitFace;
  /** Art size in dp (default 44). */
  artSize?: number;
  /** Arabic font size (default 30). */
  arabicSize?: number;
  /** Text variant of the label (default `small`). */
  variant?: TextVariant;
  /** Lay art and label side by side. */
  row?: boolean;
  color?: string;
  mutedColor?: string;
  align?: 'center' | 'left';
  numberOfLines?: number;
}

/** Draws a KitFace: art, Arabic (RTL, app Arabic / Quran font) and label + sub caption. */
export function FaceView({ face, artSize = 44, arabicSize = 30, variant = 'small', row, color, mutedColor, align = 'center', numberOfLines = 3 }: FaceViewProps) {
  const k = useKitColors();
  const text = useText();
  const label = text(face.label);
  const sub = text(face.sub);
  return (
    <View style={[styles.face, row && styles.faceRow, align === 'left' && !row && { alignItems: 'flex-start' }]} importantForAccessibility="no-hide-descendants">
      {face.art && hasArt(face.art) ? <Art name={face.art} size={artSize} height={artSize} /> : null}
      {face.arabic ? (
        <AppText
          script={face.quran ? 'quran' : 'arabic'}
          color={color ?? k.tileText}
          align="center"
          style={{ fontFamily: face.quran ? fonts.quran : fonts.arabicBold, fontSize: arabicSize, lineHeight: arabicSize * (face.quran ? 1.9 : 1.55), writingDirection: 'rtl' }}
        >
          {face.arabic}
        </AppText>
      ) : null}
      {label || sub ? (
        <View style={[styles.faceText, row && { flex: 1 }, align === 'left' && { alignItems: 'flex-start' }]}>
          {label ? (
            <AppText variant={variant} color={color ?? k.tileText} align={row || align === 'left' ? 'left' : 'center'} numberOfLines={numberOfLines}>
              {label}
            </AppText>
          ) : null}
          {sub ? (
            <AppText variant="tiny" color={mutedColor ?? k.textMuted} align={row || align === 'left' ? 'left' : 'center'} numberOfLines={2}>
              {sub}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export type TileState = 'idle' | 'selected' | 'right' | 'wrong' | 'placed' | 'disabled' | 'ghost';

export interface TileProps {
  children?: ReactNode;
  /** Shortcut: render a face (instead of children). */
  face?: KitFace;
  state?: TileState;
  /** Depth of the lip under the face (default 4). */
  depth?: number;
  radius?: number;
  width?: number;
  height?: number;
  minHeight?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  /** Face props when `face` is used. */
  faceProps?: Omit<FaceViewProps, 'face'>;
  /** Pulsing glow (hint). */
  glow?: boolean;
}

/** The tactile tile: a raised face on a darker lip. Purely visual – wrap it in a DragTile / Pressable. */
export function Tile({ children, face, state = 'idle', depth = 4, radius = R.md, width, height, minHeight = 48, padding = spacing.sm, style, faceStyle, faceProps, glow }: TileProps) {
  const k = useKitColors();
  const look =
    state === 'selected'
      ? { face: k.goldSoft, edge: k.goldEdge, border: k.gold, width: 2.5 }
      : state === 'right' || state === 'placed'
        ? { face: k.rightSoft, edge: k.rightEdge, border: k.right, width: 2 }
        : state === 'wrong'
          ? { face: k.wrongSoft, edge: k.wrong, border: k.wrong, width: 2 }
          : state === 'ghost'
            ? { face: 'transparent', edge: 'transparent', border: k.slotBorder, width: 1.5 }
            : { face: k.tileFace, edge: k.tileEdge, border: k.tileBorder, width: 1.5 };
  const d = state === 'ghost' || state === 'disabled' ? 0 : depth;
  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: look.edge, paddingBottom: d, opacity: state === 'disabled' ? 0.45 : 1 }, styles.tileShadow, { shadowColor: k.shadow }, style]}>
      {glow ? <Glow active radius={radius} /> : null}
      <View
        style={[
          styles.tileFace,
          { borderRadius: radius, backgroundColor: look.face, borderColor: look.border, borderWidth: look.width, minHeight: height ? undefined : minHeight - d, padding, borderStyle: state === 'ghost' ? 'dashed' : 'solid' },
          height ? { flex: 1 } : null,
          faceStyle,
        ]}
      >
        {face ? <FaceView face={face} {...faceProps} /> : children}
      </View>
    </View>
  );
}

export type SlotState = 'empty' | 'next' | 'filled' | 'right' | 'wrong';

export interface SlotProps extends Omit<DropZoneProps, 'children' | 'hoverStyle'> {
  state?: SlotState;
  /** Number badge (ordered slots). */
  number?: number;
  /** Faint silhouette of what belongs here (art name). */
  ghostArt?: string;
  ghostSize?: number;
  /** Placeholder text inside an empty slot. */
  placeholder?: string;
  radius?: number;
  children?: ReactNode;
}

/** A place to drop a tile on: inset, dashed, glowing while hovered, numbered when ordered. */
export function Slot({ state = 'empty', number, ghostArt, ghostSize = 40, placeholder, radius = R.md, children, style, ...zone }: SlotProps) {
  const k = useKitColors();
  const filled = state === 'filled' || state === 'right';
  return (
    <DropZone
      {...zone}
      disabled={zone.disabled || filled}
      style={[
        styles.slot,
        {
          borderRadius: radius,
          backgroundColor: filled ? 'transparent' : state === 'wrong' ? k.wrongSoft : k.slotFill,
          borderColor: state === 'next' ? k.gold : state === 'wrong' ? k.wrong : k.slotBorder,
          borderWidth: filled ? 0 : 2,
          borderStyle: filled ? 'solid' : 'dashed',
        },
        style,
      ]}
      hoverStyle={{ borderRadius: radius + 3, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
    >
      {state === 'next' ? <Glow active radius={radius} spread={3} /> : null}
      <View style={styles.slotInner}>
        {filled ? (
          children
        ) : (
          <>
            {ghostArt && hasArt(ghostArt) ? (
              <View style={{ opacity: 0.22 }} importantForAccessibility="no-hide-descendants">
                <Art name={ghostArt} size={ghostSize} />
              </View>
            ) : null}
            {placeholder ? (
              <AppText variant="tiny" color={k.textMuted} align="center" numberOfLines={2}>
                {placeholder}
              </AppText>
            ) : null}
            {children}
          </>
        )}
      </View>
      {number !== undefined ? (
        <View style={[styles.slotNumber, { backgroundColor: filled ? k.right : state === 'next' ? k.gold : k.accent }]} pointerEvents="none">
          <AppText variant="tiny" color={state === 'next' ? k.onGold : k.onAccent} style={{ fontFamily: fonts.heavy }}>
            {String(number)}
          </AppText>
        </View>
      ) : null}
    </DropZone>
  );
}

/** Card back pattern: the topic gradient with an eight-pointed star. */
export function CardBack({ radius = R.md }: { radius?: number }) {
  const k = useKitColors();
  return (
    <LinearGradient colors={k.cardBack} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius, alignItems: 'center', justifyContent: 'center' }]}>
      <Svg width="70%" height="70%" viewBox="0 0 100 100">
        <Path d={star8Path(50, 50, 40)} fill="none" stroke={k.onAccent} strokeOpacity={0.35} strokeWidth={4} />
        <Path d={star8Path(50, 50, 22)} fill={k.gold} fillOpacity={0.85} />
      </Svg>
    </LinearGradient>
  );
}

export interface FlipCardProps {
  faceUp: boolean;
  front: ReactNode;
  back?: ReactNode;
  onPress?: () => void;
  width: number;
  height: number;
  matched?: boolean;
  accessibilityLabel: string;
  testID?: string;
  reducedMotion?: boolean;
  disabled?: boolean;
}

/** Card that flips between back and front (scale-X flip, no backface tricks; a cross-fade with reduced motion). */
export function FlipCard({ faceUp, front, back, onPress, width, height, matched, accessibilityLabel, testID, reducedMotion, disabled }: FlipCardProps) {
  const env = useKitMaybe();
  const reduced = reducedMotion ?? env?.reducedMotion ?? false;
  const k = useKitColors();
  const p = useSharedValue(faceUp ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(faceUp ? 1 : 0, { duration: reduced ? 160 : 320, easing: Easing.inOut(Easing.quad) }));
  }, [faceUp, p, reduced]);
  const frontStyle = useAnimatedStyle(() => {
    const v = p.value;
    if (reduced) return { opacity: v };
    return { opacity: v >= 0.5 ? 1 : 0, transform: [{ scaleX: Math.max(0.001, Math.abs(Math.cos(v * Math.PI))) }] };
  });
  const backStyle = useAnimatedStyle(() => {
    const v = p.value;
    if (reduced) return { opacity: 1 - v };
    return { opacity: v < 0.5 ? 1 : 0, transform: [{ scaleX: Math.max(0.001, Math.abs(Math.cos(v * Math.PI))) }] };
  });
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: !!disabled }} testID={testID} style={{ width, height }}>
      <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
        <View style={[styles.cardShell, { backgroundColor: k.tileEdge, shadowColor: k.shadow }]}>
          <View style={{ flex: 1, borderRadius: R.md, overflow: 'hidden' }}>{back ?? <CardBack />}</View>
        </View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
        <View style={[styles.cardShell, { backgroundColor: matched ? k.rightEdge : k.tileEdge, shadowColor: k.shadow }]}>
          <View style={[styles.cardFront, { backgroundColor: matched ? k.rightSoft : k.tileFace, borderColor: matched ? k.right : k.tileBorder }]}>{front}</View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Wrapping row for tiles waiting to be placed (always drawn above the board so dragged tiles stay on top). */
export function Tray({ children, style, label }: { children: ReactNode; style?: StyleProp<ViewStyle>; label?: string }) {
  return (
    <View style={[styles.tray, style]} accessibilityLabel={label}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  faceRow: { flexDirection: 'row', gap: spacing.sm },
  faceText: { alignItems: 'center', gap: 1 },
  tileShadow: { shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  tileFace: { alignItems: 'center', justifyContent: 'center' },
  slot: { minHeight: 48, minWidth: 48 },
  slotInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  slotNumber: { position: 'absolute', top: -9, left: -9, minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  cardShell: { flex: 1, borderRadius: R.md, paddingBottom: 4, shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardFront: { flex: 1, borderRadius: R.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', padding: 4 },
  tray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, zIndex: 10, elevation: 10 },
});

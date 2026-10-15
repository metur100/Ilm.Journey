import { Pressable, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { makeStyles, radius, TOUCH_TARGET, useTheme } from '@/core/theme';

import { type LabelSide, PLACES } from '../content/places';
import type { MapPlaceId } from '../models';

/** Map artwork colours (illustration – allowed outside the palette), softened in dark mode. */
const ART = {
  light: { water: '#BFE0EE', waterLine: '#9CCBE0', land: '#EBD3A0', land2: '#E2C48A', green: '#B9CF8E', river: '#4FA3D1', mountain: '#B49870', dune: '#D9B47A', pinStroke: '#FFFFFF' },
  dark: { water: '#1E3A52', waterLine: '#2B4E6A', land: '#5C4D33', land2: '#54452D', green: '#4F5A36', river: '#4F8DB8', mountain: '#7D6A4E', dune: '#6E5A3C', pinStroke: '#0E1128' },
} as const;

export type PinState = 'idle' | 'right' | 'wrong' | 'highlight';

const HIT = TOUCH_TARGET - 4;

const useStyles = makeStyles((c) => ({
  map: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: c.border },
  label: { backgroundColor: c.surface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, opacity: 0.95, borderWidth: 1, borderColor: c.border },
  spacer: { width: HIT, height: HIT },
}));

interface StoryMapArtProps {
  places: readonly MapPlaceId[];
  name: (id: MapPlaceId) => string;
  pinState?: (id: MapPlaceId) => PinState;
  onPress?: (id: MapPlaceId) => void;
  disabled?: boolean;
  /** Accessibility label per place (defaults to the name). */
  placeLabel?: (id: MapPlaceId) => string;
}

/** Hit area of a place: the pin (48 dp) plus its label on the given side. */
function hitStyle(x: number, y: number, side: LabelSide): ViewStyle {
  const left = `${(x / 400) * 100}%` as const;
  const top = `${(y / 300) * 100}%` as const;
  switch (side) {
    case 'right':
      return { position: 'absolute', left, top, marginLeft: -HIT / 2, marginTop: -HIT / 2, flexDirection: 'row', alignItems: 'center' };
    case 'left':
      return { position: 'absolute', right: `${100 - (x / 400) * 100}%`, top, marginRight: -HIT / 2, marginTop: -HIT / 2, flexDirection: 'row-reverse', alignItems: 'center' };
    case 'top':
      return { position: 'absolute', left, bottom: `${100 - (y / 300) * 100}%`, width: 120, marginLeft: -60, marginBottom: -HIT / 2, flexDirection: 'column-reverse', alignItems: 'center' };
    case 'bottom':
      return { position: 'absolute', left, top, width: 120, marginLeft: -60, marginTop: -HIT / 2, flexDirection: 'column', alignItems: 'center' };
  }
}

/**
 * A simple illustrated map of the lands of the 25 prophets' stories – the Nile and Sinai, the Levant with the Dead
 * Sea, Mesopotamia and the Arabian Peninsula down to Yemen – with tappable places. Positions are approximate and
 * stylised (the Levant is drawn larger), not exact geography.
 */
export function StoryMapArt({ places, name, pinState, onPress, disabled, placeLabel }: StoryMapArtProps) {
  const { c, dark } = useTheme();
  const styles = useStyles();
  const art = dark ? ART.dark : ART.light;
  const pinColor = (state: PinState) => (state === 'right' ? c.success : state === 'wrong' ? c.error : state === 'highlight' ? c.primary : c.gold);

  return (
    <View style={styles.map}>
      <Svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <Rect x={0} y={0} width={400} height={300} fill={art.land} />
        {/* Deserts of Arabia and Egypt */}
        <G fill={art.dune} opacity={0.6}>
          <Path d="M240 170q12-6 24 0M262 186q12-6 24 0M292 200q12-6 24 0M250 206q10-5 20 0M30 200q12-6 24 0M18 240q12-6 24 0M300 168q10-5 20 0" stroke={art.dune} strokeWidth={2} fill="none" />
        </G>
        {/* Fertile lands: the Nile valley, the Levant, Mesopotamia */}
        <Path d="M54 96C64 92 78 96 86 104L80 112C72 106 62 104 54 104Z" fill={art.green} />
        <Path d="M64 110C70 150 70 220 64 300H82C82 220 80 150 76 110Z" fill={art.green} opacity={0.8} />
        <Path d="M128 40C140 44 150 60 156 84L144 100C138 80 132 60 126 46Z" fill={art.green} opacity={0.8} />
        <Path d="M200 28C236 56 270 92 300 130L286 136C258 102 226 70 194 40Z" fill={art.green} opacity={0.75} />
        {/* Seas */}
        <Path d="M0 0H128L134 30L130 58L122 80L100 92L78 100L54 96L28 92L0 90Z" fill={art.water} />
        <Path d="M92 110L98 108L112 160L106 162Z" fill={art.water} />
        <Path d="M140 110L146 110L134 160L128 160Z" fill={art.water} />
        <Path d="M106 160L134 158L182 214L246 300H222L170 226Z" fill={art.water} />
        <Path d="M262 300C300 290 340 282 400 262V300Z" fill={art.water} />
        <Path d="M296 128C312 124 324 132 340 150S378 190 400 204V222C380 214 352 196 332 178S300 146 296 128Z" fill={art.water} />
        <Path d="M0 90L28 92L54 96L78 100L100 92L122 80L130 58L134 30L128 0" stroke={art.waterLine} strokeWidth={2} fill="none" />
        {/* Rivers and lakes */}
        <Path d="M72 300C76 250 66 200 72 150C74 128 70 112 72 100" stroke={art.river} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <Path d="M152 54C150 66 153 76 150 90" stroke={art.river} strokeWidth={2} fill="none" />
        <Ellipse cx={151} cy={60} rx={3} ry={4} fill={art.river} />
        <Ellipse cx={150} cy={98} rx={4} ry={10} fill={art.river} />
        <Path d="M196 28C214 50 236 78 258 98S288 122 300 130" stroke={art.river} strokeWidth={2.6} fill="none" />
        <Path d="M244 22C256 48 270 74 280 98S296 122 302 130" stroke={art.river} strokeWidth={2.6} fill="none" />
        {/* Mountains: Taurus / Zagros, Sinai, the Hijaz */}
        <G fill={art.mountain}>
          <Path d="M222 22L232 8 242 22Z M252 18L262 4 272 18Z M282 30L292 16 302 30Z M306 52L316 38 326 52Z" />
          <Path d="M112 156L118 146 124 156Z" />
          <Path d="M176 196L182 188 188 196Z M190 228L196 220 202 228Z M206 262L212 254 218 262Z" />
        </G>
        {places.map((id) => {
          const p = PLACES[id];
          return <Circle key={id} cx={p.x} cy={p.y} r={8} fill={pinColor(pinState?.(id) ?? 'idle')} stroke={art.pinStroke} strokeWidth={3} />;
        })}
      </Svg>
      {places.map((id) => {
        const p = PLACES[id];
        const content = (
          <>
            <View style={styles.spacer} />
            <View style={styles.label}>
              <AppText variant="tiny" color={c.text} numberOfLines={1}>
                {name(id)}
              </AppText>
            </View>
          </>
        );
        if (!onPress) {
          return (
            <View key={id} style={hitStyle(p.x, p.y, p.label)} accessible accessibilityLabel={placeLabel?.(id) ?? name(id)}>
              {content}
            </View>
          );
        }
        return (
          <Pressable
            key={id}
            onPress={() => onPress(id)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={placeLabel?.(id) ?? name(id)}
            accessibilityState={{ disabled: !!disabled }}
            style={hitStyle(p.x, p.y, p.label)}
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}

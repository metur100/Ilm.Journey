import { Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { makeStyles, radius, TOUCH_TARGET, useTheme } from '@/core/theme';

import { PLACES } from '../content/places';
import type { MapPlaceId } from '../models';

/** Map artwork colours (illustration – allowed outside the palette), softened in dark mode. */
const ART = {
  light: { water: '#BFE0EE', land: '#EBD3A0', river: '#4FA3D1', mountain: '#B49870', pinStroke: '#FFFFFF' },
  dark: { water: '#1E3A52', land: '#5C4D33', river: '#4F8DB8', mountain: '#7D6A4E', pinStroke: '#0E1128' },
} as const;

export type PinState = 'idle' | 'right' | 'wrong' | 'highlight';

const useStyles = makeStyles((c) => ({
  map: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: c.border },
  hit: {
    position: 'absolute',
    width: 104,
    height: TOUCH_TARGET + 8,
    marginLeft: -52,
    marginTop: -26,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: { backgroundColor: c.surface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, opacity: 0.94 },
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

/**
 * A simple illustrated map of the lands of the stories (Egypt & Sinai, the Levant, Mesopotamia, the
 * Arabian Peninsula) with tappable places. Positions are approximate, not exact geography.
 */
export function StoryMapArt({ places, name, pinState, onPress, disabled, placeLabel }: StoryMapArtProps) {
  const { c, dark } = useTheme();
  const styles = useStyles();
  const art = dark ? ART.dark : ART.light;
  const pinColor = (state: PinState) => (state === 'right' ? c.success : state === 'wrong' ? c.error : state === 'highlight' ? c.primary : c.gold);

  return (
    <View style={styles.map}>
      <Svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <Rect x={0} y={0} width={400} height={300} fill={art.water} />
        <Path
          d="M0 70 L120 80 L150 60 L230 20 L330 10 L400 30 L400 300 L330 300 L300 230 L250 290 L210 300 L180 240 L150 190 L120 170 L110 300 L0 300 Z"
          fill={art.land}
        />
        {/* Red Sea */}
        <Path d="M120 168 L150 190 L180 240 L210 300 L190 300 L160 245 L132 200 L112 175 Z" fill={art.water} />
        {/* Persian Gulf */}
        <Path d="M330 150 Q360 170 372 205 Q350 200 330 185 Q318 168 330 150 Z" fill={art.water} />
        {/* Mediterranean coast */}
        <Path d="M0 70 L120 80 L150 60 L150 50 L0 55 Z" fill={art.water} />
        {/* Nile */}
        <Path d="M92 300 C95 240 88 200 96 150 C100 120 98 100 104 82" stroke={art.river} strokeWidth={4} fill="none" />
        {/* Tigris & Euphrates */}
        <Path d="M265 40 C285 80 300 110 335 155" stroke={art.river} strokeWidth={3} fill="none" />
        <Path d="M240 50 C255 95 285 125 330 155" stroke={art.river} strokeWidth={3} fill="none" />
        {/* Mountains near Judi */}
        <Path d="M255 50 L270 28 L285 50 Z M275 48 L290 30 L305 48 Z" fill={art.mountain} />
        {places.map((id) => {
          const p = PLACES[id];
          return <Circle key={id} cx={p.x} cy={p.y} r={11} fill={pinColor(pinState?.(id) ?? 'idle')} stroke={art.pinStroke} strokeWidth={3} />;
        })}
      </Svg>
      {places.map((id) => {
        const p = PLACES[id];
        const style = [styles.hit, { left: `${(p.x / 400) * 100}%` as const, top: `${(p.y / 300) * 100}%` as const }];
        const label = (
          <View style={styles.label}>
            <AppText variant="tiny" color={c.text}>
              {name(id)}
            </AppText>
          </View>
        );
        if (!onPress) {
          return (
            <View key={id} style={style} accessible accessibilityLabel={placeLabel?.(id) ?? name(id)}>
              {label}
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
            style={style}
          >
            {label}
          </Pressable>
        );
      })}
    </View>
  );
}

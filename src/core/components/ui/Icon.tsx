import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/core/theme';

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Extra line icons from the Sira app (24×24 grid). */
const PATH_ICONS = {
  timeline: { d: ['M6 3v18', circle(6, 6, 1.6), circle(6, 12, 1.6), circle(6, 18, 1.6), 'M10 6h10', 'M10 12h7', 'M10 18h9'] },
  compass: { d: [circle(12, 12, 9), 'm15.5 8.5-2 5-5 2 2-5z'] },
  search: { d: [circle(11, 11, 7), 'm20 20-4-4'] },
  bookmark: { d: ['M6 3h12v18l-6-4-6 4z'] },
  bookmarkFilled: { d: ['M6 3h12v18l-6-4-6 4z'], fill: true },
  pause: { d: ['M7 4h4v16H7z', 'M13 4h4v16h-4z'], fill: true },
  people: { d: [circle(9, 8, 3.5), 'M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5', circle(17, 9, 2.5), 'M17 14.5c2.8 0 5 1.5 5 4.5'] },
  pin: { d: ['M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z', circle(12, 10, 2.5)] },
  tag: { d: ['M3 12V3h9l9 9-9 9z', circle(7.5, 7.5, 1.5)] },
  link: { d: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'] },
  feather: { d: ['M20 4C12 4 7 9 7 17v3', 'M7 17l7-7', 'M10 14h5'] },
  kaaba: { d: ['M5 7l7-3 7 3v10l-7 3-7-3z', 'M5 7l7 3 7-3', 'M12 10v10', 'M5 10l7 3 7-3'] },
  plus: { d: ['M12 5v14', 'M5 12h14'] },
  minus: { d: ['M5 12h14'] },
  locate: { d: [circle(12, 12, 7), 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3'] },
  text: { d: ['M4 7V5h16v2', 'M12 5v14', 'M9 19h6'] },
  route: { d: [circle(6, 17, 2), circle(18, 7, 2), 'M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7'] },
  external: { d: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5H5V6h5'] },
  list: { d: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'] },
  pointer: {
    d: [
      'M22 14a8 8 0 0 1-8 8',
      'M18 11v-1a2 2 0 0 0-4 0',
      'M14 10V9a2 2 0 0 0-4 0v1',
      'M10 9.5V4a2 2 0 0 0-4 0v10',
      'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
    ],
  },
  quote: { d: ['M9 7H5v6h4v-2a4 4 0 0 1-4 4', 'M19 7h-4v6h4v-2a4 4 0 0 1-4 4'] },
} as const;

type PathIconName = keyof typeof PATH_ICONS;

export type IconName =
  | 'home'
  | 'map'
  | 'book'
  | 'user'
  | 'flame'
  | 'star'
  | 'starOutline'
  | 'lock'
  | 'check'
  | 'close'
  | 'back'
  | 'chevron'
  | 'settings'
  | 'speaker'
  | 'play'
  | 'stop'
  | 'refresh'
  | 'trophy'
  | 'sparkle'
  | 'moon'
  | 'sun'
  | 'mosque'
  | 'scroll'
  | 'quran'
  | 'heart'
  | 'letter'
  | 'flag'
  | 'calendar'
  | 'eye'
  | 'eyeOff'
  | 'info'
  | 'shield'
  | 'bell'
  | 'lantern'
  | 'globe'
  | 'trash'
  | 'pencil'
  | PathIconName;

/** Icon name or any string (unknown names render a dot) – for icons stored in data/registries. */
export type IconKey = IconName | (string & {});

interface IconProps {
  name: IconKey;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Hand-drawn line icon set (24×24 grid) so the app ships without icon fonts. Decorative – screen
 * readers rely on the label of the surrounding control. Defaults to the theme's text colour.
 */
export function Icon({ name, size = 24, color: colorProp, strokeWidth = 2 }: IconProps) {
  const { c } = useTheme();
  const color = colorProp ?? c.text;
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const filled = { fill: color, stroke: 'none' };

  const body = (() => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path d="M3 11.5 12 4l9 7.5" {...common} />
            <Path d="M5.5 10v9.5h5v-5h3v5h5V10" {...common} />
          </>
        );
      case 'map':
        return (
          <>
            <Path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20z" {...common} />
            <Path d="M8.5 4v13.5M15.5 6.5V20" {...common} />
          </>
        );
      case 'book':
        return (
          <>
            <Path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" {...common} />
            <Path d="M12 6v13" {...common} />
          </>
        );
      case 'user':
        return (
          <>
            <Circle cx={12} cy={8} r={4} {...common} />
            <Path d="M4.5 20c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" {...common} />
          </>
        );
      case 'flame':
        return (
          <Path
            d="M12 21c-4 0-6.5-2.6-6.5-6.1 0-3.4 2.6-5.3 3.6-8.4.4 2 1.6 3 2.6 3.5.2-2.8 1.6-5 3.7-7 .3 3.1 1.6 4.8 2.7 6.4 1 1.4 1.4 2.7 1.4 4.6C19.5 18.3 16.5 21 12 21z"
            {...filled}
          />
        );
      case 'star':
        return <Path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" {...filled} />;
      case 'starOutline':
        return <Path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" {...common} />;
      case 'lock':
        return (
          <>
            <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...common} />
            <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...common} />
          </>
        );
      case 'check':
        return <Path d="m5 12.5 4.5 4.5L19 7.5" {...common} />;
      case 'close':
        return <Path d="M6 6l12 12M18 6 6 18" {...common} />;
      case 'back':
        return <Path d="M15 5 8 12l7 7" {...common} />;
      case 'chevron':
        return <Path d="m9 5 7 7-7 7" {...common} />;
      case 'settings':
        return (
          <>
            <Circle cx={12} cy={12} r={3} {...common} />
            <Path
              d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"
              {...common}
            />
          </>
        );
      case 'speaker':
        return (
          <>
            <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...common} />
            <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...common} />
          </>
        );
      case 'play':
        return <Path d="M7 4.5v15l12.5-7.5z" {...filled} />;
      case 'stop':
        return <Rect x={6} y={6} width={12} height={12} rx={2} {...filled} />;
      case 'refresh':
        return (
          <>
            <Path d="M19.5 11A7.5 7.5 0 0 0 6 6.6L4.5 8" {...common} />
            <Path d="M4.5 3.5V8H9" {...common} />
            <Path d="M4.5 13A7.5 7.5 0 0 0 18 17.4l1.5-1.4" {...common} />
            <Path d="M19.5 20.5V16H15" {...common} />
          </>
        );
      case 'trophy':
        return (
          <>
            <Path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" {...common} />
            <Path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5" {...common} />
          </>
        );
      case 'sparkle':
        return (
          <Path
            d="M12 3c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6zM18.5 15c.3 1.8.9 2.4 2.5 2.7-1.6.3-2.2.9-2.5 2.7-.3-1.8-.9-2.4-2.5-2.7 1.6-.3 2.2-.9 2.5-2.7z"
            {...filled}
          />
        );
      case 'moon':
        return <Path d="M19.5 15.5A8 8 0 0 1 8.5 4.5a8 8 0 1 0 11 11z" {...filled} />;
      case 'sun':
        return (
          <>
            <Circle cx={12} cy={12} r={4} {...filled} />
            <Path
              d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
              {...common}
            />
          </>
        );
      case 'mosque':
        return (
          <>
            <Path d="M6 20.5v-6.5c0-3.3 2.7-5.5 6-7.5 3.3 2 6 4.2 6 7.5v6.5z" {...common} />
            <Path d="M12 6.5V3.5M10.5 20.5v-4a1.5 1.5 0 0 1 3 0v4M3 20.5V11M21 20.5V11M2 20.5h20" {...common} />
          </>
        );
      case 'scroll':
        return (
          <>
            <Path d="M7 4h11a2 2 0 0 1 2 2v1.5h-4" {...common} />
            <Path d="M16 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5h10" {...common} />
            <Path d="M7 4a2 2 0 0 0-2 2v10.5M8.5 9h4.5M8.5 12.5h4.5" {...common} />
          </>
        );
      case 'quran':
        return (
          <>
            <Path d="M5 4h11.5A2.5 2.5 0 0 1 19 6.5V20H7.5A2.5 2.5 0 0 1 5 17.5z" {...common} />
            <Path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H19" {...common} />
            <Path d="m12 6.5 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 8.8l2-.3z" {...filled} />
          </>
        );
      case 'heart':
        return (
          <Path
            d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"
            {...filled}
          />
        );
      case 'letter':
        return (
          <>
            <Path d="M16 6.5c-1.3-1.3-3.8-1.2-4.6.6-.8 1.9.8 3.4 3 3.4H9.5c-2.2 0-3.5 1.6-3.5 3.6C6 16.4 8 18 11 18h7" {...common} />
            <Circle cx={12} cy={21} r={1} {...filled} />
          </>
        );
      case 'flag':
        return (
          <>
            <Path d="M5 21V4" {...common} />
            <Path d="M5 4.5c4-2 7 2 11 0v8c-4 2-7-2-11 0" {...common} />
          </>
        );
      case 'calendar':
        return (
          <>
            <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} {...common} />
            <Path d="M3.5 10h17M8 3v4M16 3v4" {...common} />
          </>
        );
      case 'eye':
        return (
          <>
            <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...common} />
            <Circle cx={12} cy={12} r={3} {...common} />
          </>
        );
      case 'eyeOff':
        return (
          <>
            <Path d="M4 4l16 16" {...common} />
            <Path d="M10 6c.6-.3 1.3-.5 2-.5 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.5 7.5A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" {...common} />
          </>
        );
      case 'info':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M12 11v6M12 7.5v.5" {...common} />
          </>
        );
      case 'shield':
        return (
          <>
            <Path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z" {...common} />
            <Path d="m9 12 2 2 4-4" {...common} />
          </>
        );
      case 'bell':
        return (
          <>
            <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" {...common} />
            <Path d="M10 20.5a2 2 0 0 0 4 0" {...common} />
          </>
        );
      case 'lantern':
        return (
          <>
            <Path d="M12 2.5v2M9 4.5h6M8 7h8l1 9H7z" {...common} />
            <Path d="M7 16l1.5 4h7l1.5-4M12 10v3" {...common} />
          </>
        );
      case 'globe':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" {...common} />
          </>
        );
      case 'trash':
        return (
          <>
            <Path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14" {...common} />
            <Path d="M10 10.5v6M14 10.5v6" {...common} />
          </>
        );
      case 'pencil':
        return <Path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19zM14 7l3.5 3.5" {...common} />;
      default: {
        const icon = PATH_ICONS[name as PathIconName];
        if (!icon) return <Circle cx={12} cy={12} r={4} {...filled} />;
        const fill = 'fill' in icon && icon.fill;
        return (
          <>
            {icon.d.map((d, i) => (
              <Path key={i} d={d} {...common} fill={fill ? color : 'none'} />
            ))}
          </>
        );
      }
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {body}
    </Svg>
  );
}

import { mix } from '../../art/palette';
import type { TopicId } from '../../models';
import { type Palette, topicThemes } from '../../theme';

/**
 * Colours of the kit, derived from the app palette (light / dark / high contrast) and the topic accent – never
 * hard-coded, so every engine follows the theme. Computed once per palette + topic.
 */
export interface KitColors {
  /** Board surface gradient (top → bottom) and its border. */
  board: [string, string];
  boardBorder: string;
  /** Faint decoration on the board (stars in the corners). */
  boardDeco: string;
  /** Tiles: face, the darker "lip" under it (depth), border, text. */
  tileFace: string;
  tileEdge: string;
  tileBorder: string;
  tileText: string;
  /** Slots / drop zones: inset fill, dashed border, the glow while something hovers over it. */
  slotFill: string;
  slotBorder: string;
  slotHover: string;
  /** Translucent slot fill over pictures / scenes. */
  slotGlass: string;
  /** Topic accent (filled badges, lines) and a soft tint of it. */
  accent: string;
  accentSoft: string;
  accentText: string;
  onAccent: string;
  /** Right / wrong / selected states. */
  right: string;
  rightSoft: string;
  rightEdge: string;
  /** Text / icons on a filled `right` badge. */
  onRight: string;
  wrong: string;
  wrongSoft: string;
  gold: string;
  onGold: string;
  goldSoft: string;
  goldEdge: string;
  /** Liquids (PourFill). */
  water: string;
  waterSoft: string;
  /** Text on the board. */
  text: string;
  textMuted: string;
  /** Card backs (memory) – topic gradient. */
  cardBack: [string, string];
  shadow: string;
}

const cache = new WeakMap<Palette, Map<string, KitColors>>();

export function kitColors(c: Palette, topic: TopicId, dark: boolean, highContrast: boolean): KitColors {
  let byTopic = cache.get(c);
  if (!byTopic) {
    byTopic = new Map();
    cache.set(c, byTopic);
  }
  const hit = byTopic.get(topic);
  if (hit) return hit;
  const accent = topicThemes[topic].accent;
  const tint = highContrast ? 0.5 : 1;
  const colors: KitColors = dark
    ? {
        board: [mix(c.surface, accent, 0.2 * tint), mix(c.background, accent, 0.1 * tint)],
        boardBorder: highContrast ? c.border : mix(c.border, accent, 0.35),
        boardDeco: mix(c.surface, accent, 0.42),
        tileFace: mix(c.surfaceAlt, accent, 0.12 * tint),
        tileEdge: mix(c.background, accent, 0.3),
        tileBorder: highContrast ? c.border : mix(c.border, accent, 0.4),
        tileText: c.text,
        slotFill: mix(c.background, accent, 0.12),
        slotBorder: highContrast ? c.text : mix(c.border, accent, 0.55),
        slotHover: c.goldSoft,
        slotGlass: 'rgba(0,0,0,0.28)',
        accent: mix(accent, '#FFFFFF', 0.12),
        accentSoft: mix(c.surface, accent, 0.35),
        accentText: mix(accent, '#FFFFFF', 0.55),
        onAccent: c.onAccent,
        right: c.success,
        rightSoft: c.successSoft,
        rightEdge: mix(c.successSoft, '#000000', 0.35),
        onRight: c.onStatus,
        wrong: c.error,
        wrongSoft: c.errorSoft,
        gold: c.gold,
        onGold: c.onGold,
        goldSoft: c.goldSoft,
        goldEdge: mix(c.goldSoft, '#000000', 0.35),
        water: c.info,
        waterSoft: mix(c.info, '#FFFFFF', 0.35),
        text: c.text,
        textMuted: c.textMuted,
        cardBack: [mix(accent, '#000000', 0.15), mix(accent, '#000000', 0.4)],
        shadow: c.shadow,
      }
    : {
        board: [mix(c.surface, accent, 0.07 * tint), mix(c.background, accent, 0.14 * tint)],
        boardBorder: highContrast ? c.border : mix(c.border, accent, 0.25),
        boardDeco: mix(c.background, accent, 0.22),
        tileFace: c.surface,
        tileEdge: mix(c.border, accent, 0.38),
        tileBorder: highContrast ? c.border : mix(c.border, accent, 0.18),
        tileText: c.text,
        slotFill: mix(c.surface, accent, 0.06),
        slotBorder: highContrast ? c.text : mix(c.border, accent, 0.5),
        slotHover: c.goldSoft,
        slotGlass: 'rgba(255,255,255,0.42)',
        accent,
        accentSoft: mix(c.surface, accent, 0.14),
        accentText: mix(accent, '#000000', 0.25),
        onAccent: c.onAccent,
        right: c.success,
        rightSoft: c.successSoft,
        rightEdge: mix(c.success, c.successSoft, 0.45),
        onRight: c.onStatus,
        wrong: c.error,
        wrongSoft: c.errorSoft,
        gold: c.gold,
        onGold: c.onGold,
        goldSoft: c.goldSoft,
        goldEdge: c.goldBorder,
        water: mix(c.info, '#FFFFFF', 0.2),
        waterSoft: mix(c.info, '#FFFFFF', 0.55),
        text: c.text,
        textMuted: c.textMuted,
        cardBack: [mix(accent, '#FFFFFF', 0.08), mix(accent, '#000000', 0.22)],
        shadow: c.shadow,
      };
  byTopic.set(topic, colors);
  return colors;
}

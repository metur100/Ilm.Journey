import React from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  Pattern,
  Polygon,
  Polyline,
  RadialGradient,
  Rect,
  Stop,
  Text,
  TSpan,
} from 'react-native-svg';

import { makeCtx, type ArtDef, type CtxOptions } from './kit';

const TAGS = new Map<unknown, string>([
  [Svg, 'svg'],
  [Circle, 'circle'],
  [ClipPath, 'clipPath'],
  [Defs, 'defs'],
  [Ellipse, 'ellipse'],
  [G, 'g'],
  [Line, 'line'],
  [LinearGradient, 'linearGradient'],
  [Mask, 'mask'],
  [Path, 'path'],
  [Pattern, 'pattern'],
  [Polygon, 'polygon'],
  [Polyline, 'polyline'],
  [RadialGradient, 'radialGradient'],
  [Rect, 'rect'],
  [Stop, 'stop'],
  [Text, 'text'],
  [TSpan, 'tspan'],
]);

const KEEP_CASE = new Set(['viewBox', 'gradientUnits', 'gradientTransform', 'patternUnits', 'patternContentUnits', 'preserveAspectRatio', 'clipPathUnits']);

const attrName = (k: string) => (KEEP_CASE.has(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function serialize(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return esc(String(node));
  if (Array.isArray(node)) return node.map(serialize).join('');
  if (!React.isValidElement(node)) return '';
  const el = node as React.ReactElement<Record<string, unknown>>;
  const { children, ...props } = el.props;
  if (el.type === React.Fragment) return serialize(children as React.ReactNode);
  const tag = TAGS.get(el.type);
  if (!tag) {
    if (typeof el.type === 'function') {
      // Plain function components of the art kit (no hooks) – expand them.
      return serialize((el.type as (p: unknown) => React.ReactNode)(el.props));
    }
    throw new Error(`svgString: unsupported element ${String(el.type)}`);
  }
  const attrs = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && typeof v !== 'function' && typeof v !== 'object')
    .map(([k, v]) => ` ${attrName(k)}="${esc(String(v))}"`)
    .join('');
  const inner = serialize(children as React.ReactNode);
  return inner ? `<${tag}${attrs}>${inner}</${tag}>` : `<${tag}${attrs}/>`;
}

let counter = 0;

/**
 * Renders an art definition to standalone SVG markup (for contact sheets, share images or the web). Works without a
 * native renderer because pieces are pure functions of the drawing context.
 */
export function defToSvg(def: ArtDef, opts: CtxOptions & { width?: number; height?: number } = {}): string {
  counter += 1;
  const ctx = makeCtx(`s${counter}`, opts);
  const width = opts.width ?? def.w;
  const height = opts.height ?? Math.round((width * def.h) / def.w);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${def.w} ${def.h}">${serialize(def.draw(ctx))}</svg>`;
}

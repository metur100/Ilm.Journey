/**
 * Samples an SVG path (absolute commands M, L, H, V, Q, C, Z – the subset tracing shapes use) into points about
 * `step` units apart. Pure; used by TraceShape (tracing progress) and tests.
 */
export function samplePath(d: string, step = 2): [number, number][] {
  const tokens = d.match(/[MLHVQCZmlhvqcz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const pts: [number, number][] = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const num = () => Number(tokens[i++]);
  const push = (px: number, py: number) => {
    const last = pts[pts.length - 1];
    if (!last) {
      pts.push([px, py]);
      return;
    }
    const dist = Math.hypot(px - last[0], py - last[1]);
    if (dist >= step) {
      const n = Math.floor(dist / step);
      for (let k = 1; k <= n; k++) pts.push([last[0] + ((px - last[0]) * k) / n, last[1] + ((py - last[1]) * k) / n]);
    }
  };
  const curve = (fn: (t: number) => [number, number], len: number) => {
    const n = Math.max(4, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) {
      const [px, py] = fn(k / n);
      push(px, py);
    }
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    switch (cmd) {
      case 'M':
        x = num();
        y = num();
        sx = x;
        sy = y;
        if (pts.length === 0) pts.push([x, y]);
        else push(x, y);
        cmd = 'L';
        break;
      case 'L':
        x = num();
        y = num();
        push(x, y);
        break;
      case 'H':
        x = num();
        push(x, y);
        break;
      case 'V':
        y = num();
        push(x, y);
        break;
      case 'Q': {
        const [x0, y0, cx, cy, ex, ey] = [x, y, num(), num(), num(), num()];
        curve((t) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * ey], Math.hypot(cx - x0, cy - y0) + Math.hypot(ex - cx, ey - cy));
        x = ex;
        y = ey;
        break;
      }
      case 'C': {
        const [x0, y0, c1x, c1y, c2x, c2y, ex, ey] = [x, y, num(), num(), num(), num(), num(), num()];
        curve(
          (t) => [
            (1 - t) ** 3 * x0 + 3 * (1 - t) ** 2 * t * c1x + 3 * (1 - t) * t * t * c2x + t ** 3 * ex,
            (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * c1y + 3 * (1 - t) * t * t * c2y + t ** 3 * ey,
          ],
          Math.hypot(c1x - x0, c1y - y0) + Math.hypot(c2x - c1x, c2y - c1y) + Math.hypot(ex - c2x, ey - c2y),
        );
        x = ex;
        y = ey;
        break;
      }
      case 'Z':
        push(sx, sy);
        x = sx;
        y = sy;
        cmd = '';
        break;
      default:
        i++;
    }
  }
  return pts;
}

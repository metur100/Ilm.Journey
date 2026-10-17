import { curvePoints } from '@/features/stories/components/JourneyPath';

describe('journey path', () => {
  it('walks the S-curve between two medallions in even steps', () => {
    const points = curvePoints([90, 59], [290, 177], 12);
    expect(points[0]).toMatchObject({ x: 90, y: 59 });
    // The curve leaves the medallion almost straight down (vertical tangent).
    expect(points[0].angle).toBeGreaterThan(1.3);
    expect(points[0].angle).toBeLessThan(Math.PI / 2 + 0.01);
    const last = points[points.length - 1];
    expect(Math.hypot(290 - last.x, 177 - last.y)).toBeLessThan(12);
    for (let i = 1; i < points.length; i++) {
      const gap = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      expect(gap).toBeGreaterThan(11);
      expect(gap).toBeLessThanOrEqual(12.01);
    }
  });

  it('mirrors when the path winds back to the left', () => {
    const right = curvePoints([90, 59], [290, 177], 12);
    const left = curvePoints([290, 59], [90, 177], 12);
    expect(left).toHaveLength(right.length);
    left.forEach((p, i) => {
      expect(p.x).toBeCloseTo(380 - right[i].x, 5);
      expect(p.y).toBeCloseTo(right[i].y, 5);
    });
  });
});

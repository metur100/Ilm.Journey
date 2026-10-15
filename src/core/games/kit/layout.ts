import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** Size used before the first layout under Jest (no layout pass there), so engines render their content in tests. */
const TEST_SIZE = process.env.NODE_ENV === 'test' ? { w: 320, h: 480 } : { w: 0, h: 0 };

/** Measured size of a view (`onLayout`); ignores sub-pixel changes. */
export function useMeasure(): { w: number; h: number; onLayout: (e: LayoutChangeEvent) => void } {
  const [size, setSize] = useState(TEST_SIZE);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (Math.abs(prev.w - width) > 1 || Math.abs(prev.h - height) > 1 ? { w: width, h: height } : prev));
  }, []);
  return { ...size, onLayout };
}

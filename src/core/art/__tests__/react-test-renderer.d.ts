// Minimal typing for react-test-renderer (the package ships no types and @types is not installed).
declare module 'react-test-renderer' {
  import type { ReactElement } from 'react';

  export interface ReactTestRendererJSON {
    type: string;
    props: Record<string, unknown>;
    children: (ReactTestRendererJSON | string)[] | null;
  }
  export interface ReactTestRenderer {
    toJSON(): ReactTestRendererJSON | ReactTestRendererJSON[] | null;
    unmount(): void;
    update(element: ReactElement): void;
  }
  export function create(element: ReactElement): ReactTestRenderer;
  export function act(callback: () => void): void;
}

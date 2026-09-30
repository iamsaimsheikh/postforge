declare module "react/jsx-runtime" {
  export function jsx(type: any, props: any, key?: string): any;
  export function jsxs(type: any, props: any, key?: string): any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  type Element = any;
}

declare namespace React {
  type ReactNode = any;
}

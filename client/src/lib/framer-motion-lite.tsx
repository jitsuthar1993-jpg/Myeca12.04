import React from "react";

export type PanInfo = {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

type Listener<T> = (value: T) => void;

export class MotionValue<T = number> {
  private current: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.current = initial;
  }

  get() {
    return this.current;
  }

  set(value: T) {
    this.current = value;
    this.listeners.forEach((listener) => listener(value));
  }

  on(_event: "change", listener: Listener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

type MotionStyle = React.CSSProperties & {
  x?: number | string | MotionValue<number | string>;
  y?: number | string | MotionValue<number | string>;
};

type MotionProps = {
  animate?: unknown;
  children?: React.ReactNode;
  drag?: unknown;
  dragConstraints?: unknown;
  dragElastic?: unknown;
  exit?: unknown;
  initial?: unknown;
  layout?: unknown;
  layoutId?: string;
  transition?: unknown;
  variants?: unknown;
  viewport?: unknown;
  whileFocus?: unknown;
  whileHover?: unknown;
  whileInView?: unknown;
  whileTap?: unknown;
  onDragEnd?: (event: unknown, info: PanInfo) => void;
  style?: MotionStyle;
};

type MotionComponentProps<T extends keyof JSX.IntrinsicElements> =
  Omit<JSX.IntrinsicElements[T], keyof MotionProps | "style"> & MotionProps;

const motionOnlyProps = new Set([
  "animate",
  "drag",
  "dragConstraints",
  "dragElastic",
  "exit",
  "initial",
  "layout",
  "layoutId",
  "transition",
  "variants",
  "viewport",
  "whileFocus",
  "whileHover",
  "whileInView",
  "whileTap",
  "onDragEnd",
]);

function isMotionValue(value: unknown): value is MotionValue<number | string> {
  return value instanceof MotionValue;
}

function formatTranslate(value: number | string | undefined, axis: "x" | "y") {
  if (value == null) return "";
  const cssValue = typeof value === "number" ? `${value}px` : value;
  return axis === "x" ? `translateX(${cssValue})` : `translateY(${cssValue})`;
}

function useMotionStyle(style?: MotionStyle) {
  const [, forceRender] = React.useReducer((value: number) => value + 1, 0);

  React.useEffect(() => {
    if (!style) return undefined;
    const motionValues: Array<MotionValue<number | string>> = [];
    if (isMotionValue(style.x)) motionValues.push(style.x);
    if (isMotionValue(style.y)) motionValues.push(style.y);
    const unsubscribers = motionValues.map((value) => value.on("change", () => forceRender()));

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [style?.x, style?.y]);

  if (!style) return undefined;

  const { x, y, transform, ...rest } = style;
  const xValue = isMotionValue(x) ? x.get() : x;
  const yValue = isMotionValue(y) ? y.get() : y;
  const motionTransform = [formatTranslate(xValue, "x"), formatTranslate(yValue, "y")]
    .filter(Boolean)
    .join(" ");

  return {
    ...rest,
    transform: [transform, motionTransform].filter(Boolean).join(" ") || undefined,
  } as React.CSSProperties;
}

function createMotionComponent<T extends keyof JSX.IntrinsicElements>(tag: T) {
  const MotionTag = React.forwardRef<HTMLElement, MotionComponentProps<T>>((rawProps, ref) => {
    const props = rawProps as MotionComponentProps<T>;
    const domProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
      if (!motionOnlyProps.has(key)) {
        domProps[key] = value;
      }
    }

    domProps.style = useMotionStyle(props.style);
    return React.createElement(tag, { ...domProps, ref });
  });

  MotionTag.displayName = `Motion.${String(tag)}`;
  return MotionTag;
}

const componentCache = new Map<string, React.ComponentType<any>>();

function getMotionComponent(tag: string) {
  if (!componentCache.has(tag)) {
    componentCache.set(tag, createMotionComponent(tag as keyof JSX.IntrinsicElements));
  }
  return componentCache.get(tag)!;
}

export const m = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return getMotionComponent(prop);
    },
  },
) as Record<keyof JSX.IntrinsicElements, React.ComponentType<any>>;

export const motion = m;

export function AnimatePresence({ children }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <>{children}</>;
}

export function LazyMotion({ children }: { children?: React.ReactNode; [key: string]: unknown }) {
  return <>{children}</>;
}

export const domAnimation = {};
export const domMax = {};

export function useMotionValue<T = number>(initial: T) {
  return React.useMemo(() => new MotionValue(initial), []);
}

export function useTransform(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: number[],
) {
  const mapValue = React.useCallback(
    (current: number) => {
      if (inputRange.length < 2 || outputRange.length < 2) return outputRange[0] ?? 0;
      const startInput = inputRange[0];
      const endInput = inputRange[inputRange.length - 1];
      const startOutput = outputRange[0];
      const endOutput = outputRange[outputRange.length - 1];
      const progress = endInput === startInput ? 0 : (current - startInput) / (endInput - startInput);
      return startOutput + progress * (endOutput - startOutput);
    },
    [inputRange, outputRange],
  );

  const transformed = React.useMemo(() => new MotionValue(mapValue(value.get())), [mapValue, value]);

  React.useEffect(() => {
    transformed.set(mapValue(value.get()));
    const unsubscribe = value.on("change", (current) => transformed.set(mapValue(current)));
    return () => {
      unsubscribe();
    };
  }, [mapValue, transformed, value]);

  return transformed;
}

export function animate<T>(value: MotionValue<T>, target: T, _options?: unknown) {
  value.set(target);
  return { stop() {} };
}

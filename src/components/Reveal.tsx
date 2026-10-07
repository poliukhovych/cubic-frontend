// src/components/Reveal.tsx
import React, { type JSX } from "react";
import { useInView } from "@/lib/hooks/useInView";
import { cls } from "@/lib/utils/cls";

type Props = React.PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delayMs?: number;     // затримка перед анімацією
  y?: number;           // початковий зсув по Y
  blurPx?: number;      // стартове розмиття (px). Якщо не задано — без blur-анімації
  opacityFrom?: number; // стартова прозорість (0..1)
}>;

const Reveal: React.FC<Props> = ({
  as = "div",
  className,
  delayMs = 0,
  y = 16,
  blurPx,
  opacityFrom,
  children,
}) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 });
  const Comp: any = as;

  return (
    <Comp
      ref={ref}
      className={cls(
        "reveal",
        blurPx != null && "reveal--blur",
        inView && "reveal--in",
        className
      )}
      style={
        {
          // кастомні CSS-змінні
          // @ts-ignore
          "--reveal-delay": `${delayMs}ms`,
          "--reveal-translate": `${y}px`,
          "--reveal-blur": blurPx != null ? `${blurPx}px` : undefined,
          "--reveal-opacity-from":
            opacityFrom != null ? String(opacityFrom) : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </Comp>
  );
};

export default Reveal;

import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target); // показуємо один раз
          }
        });
      },
      { root: null, threshold: 0.2, ...(options || {}) }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, inView };
}

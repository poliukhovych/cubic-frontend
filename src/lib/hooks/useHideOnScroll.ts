import { useEffect, useRef, useState } from "react";

export const useHideOnScroll = () => {
  const last = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last.current && y > 24);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
};

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

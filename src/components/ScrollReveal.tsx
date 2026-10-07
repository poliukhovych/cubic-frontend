import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 20,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const initiallyVisible = useRef(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    initiallyVisible.current = rect.top < window.innerHeight;

    if (initiallyVisible.current) {
      element.classList.add('scroll-reveal-visible');
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!once || !hasAnimated.current)) {
            element.classList.add('scroll-reveal-visible');
            hasAnimated.current = true;
            if (once) observer.unobserve(element);
          } else if (!entry.isIntersecting && !once && hasAnimated.current) {
            element.classList.remove('scroll-reveal-visible');
            hasAnimated.current = false;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const getDirectionStyles = () => {
    switch (direction) {
      case 'up': return `translate-y-[${distance}px]`;
      case 'down': return `translate-y-[-${distance}px]`;
      case 'left': return `translate-x-[${distance}px]`;
      case 'right': return `translate-x-[-${distance}px]`;
      default: return `translate-y-[${distance}px]`;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-reveal opacity-0 transform transition-all duration-700 ease-out',
        getDirectionStyles(),
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
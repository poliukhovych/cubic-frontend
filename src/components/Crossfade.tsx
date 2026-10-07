// src/components/Crossfade.tsx
import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Ключ для визначення "нового контенту" */
  stateKey: string | number;
};

const Crossfade: React.FC<Props> = ({ children, stateKey }) => {
  const [displayed, setDisplayed] = useState<React.ReactNode>(children);
  const [fadeState, setFadeState] = useState<"in"|"out">("in");

  useEffect(() => {
    // при зміні ключа: спочатку зникає стара версія
    setFadeState("out");
    const t = setTimeout(() => {
      // після анімації міняємо контент і знову показуємо
      setDisplayed(children);
      setFadeState("in");
    }, 300); // тривалість збігається з CSS transition

    return () => clearTimeout(t);
  }, [stateKey, children]);

  return (
    <div
      className={`transition-opacity duration-300`}
      style={{ opacity: fadeState === "in" ? 1 : 0 }}
    >
      {displayed}
    </div>
  );
};

export default Crossfade;

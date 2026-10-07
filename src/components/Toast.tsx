// src/components/Toast.tsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  message: string | null;
  duration?: number;          // ms
  onClose?: () => void;
};

const Toast: React.FC<Props> = ({ message, duration = 1200, onClose }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t1 = setTimeout(() => setOpen(false), duration);
    const t2 = setTimeout(() => onClose?.(), duration + 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [message, duration, onClose]);

  if (!message) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className={[
          "mb-8 glasscard px-4 py-2 shadow-lg pointer-events-auto",
          "transition-all duration-200",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        ].join(" ")}
      >
        {message}
      </div>
    </div>,
    document.body
  );
};

export default Toast;

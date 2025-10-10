// src/components/ViewModeToggle.tsx
import React, { useEffect, useState } from "react";
import { getViewMode, setViewMode, type ViewMode } from "@/lib/utils/prefs";
import { useAuth } from "@/types/auth";

type Props = {
  value?: ViewMode;
  onChange?: (v: ViewMode) => void;
};

const ViewModeToggle: React.FC<Props> = ({ value, onChange }) => {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [internal, setInternal] = useState<ViewMode>("view");
  const mode = value ?? internal;

  useEffect(() => { if (!value && uid) setInternal(getViewMode(uid)); }, [uid, value]);

  const toggle = () => {
    const next = mode === "view" ? "edit" : "view";
    if (onChange) onChange(next);
    else { setInternal(next); if (uid) setViewMode(uid, next); }
  };

  const modeLabel = mode === "edit" ? "Edit" : "View";

  return (
    <button onClick={toggle} className="glass glass-card p-5 w-full text-left pressable hover-lift rounded-xl" aria-label={`Режим: ${modeLabel}`}>
      <div className="font-semibold text-lg mb-1">Режим</div>
      <div className="text-4xl font-semibold leading-none">{modeLabel}</div>
    </button>
  );
};

export default ViewModeToggle;

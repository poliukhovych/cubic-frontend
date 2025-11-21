// src/components/AdminHistoryPanel.tsx
import React, { useEffect, useState } from "react";
import { fetchChangeHistory, type ChangeItem } from "@/lib/fakeApi/admin";
import { useNavigate } from "react-router-dom";

const badge = (x: string) => (
  <span
    className="px-2 py-0.5 rounded-xl text-xs border"
    style={{ borderColor: "color-mix(in oklab, var(--border), transparent 35%)" }}
  >
    {x}
  </span>
);

const AdminHistoryPanel: React.FC = () => {
  const [items, setItems] = useState<ChangeItem[]>([]);
  const nav = useNavigate();

  useEffect(() => { fetchChangeHistory().then(setItems); }, []);

  return (
    <div className="space-y-3">
      <div className="glasscard p-4">
        <div className="font-semibold mb-3">історія</div>

        <div
          className="divide-y"
          style={{ borderColor: "color-mix(in oklab, var(--border), transparent 40%)" }}
        >
          {items.map((it) => (
            <div key={it.id} className="py-3">
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-[var(--muted)] mt-0.5 flex flex-wrap items-center gap-2">
                {badge(it.entity)} {badge(it.action)}
                <span>· {new Date(it.ts).toLocaleString()} · {it.actor}</span>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-6 text-[var(--muted)]">Ще немає змін…</div>
          )}
        </div>
      </div>

      <button
        className="btn w-full py-3 rounded-2xl hover-shadow"
        onClick={() => nav("/admin/archive")}
      >
        архів
      </button>
    </div>
  );
};

export default AdminHistoryPanel;

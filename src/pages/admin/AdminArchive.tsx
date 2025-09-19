import React, { useEffect, useMemo, useState } from "react";
import { listScheduleSnapshots, deleteScheduleSnapshot } from "@/lib/fakeApi/admin";
import type { ScheduleSnapshot } from "@/types/schedule";
import { Link } from "react-router-dom";

const AdminArchive: React.FC = () => {
  const [list, setList] = useState<
    Array<Pick<ScheduleSnapshot, "id" | "title" | "createdAt" | "parity" | "createdBy" | "comment">>
  >([]);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = async () => setList(await listScheduleSnapshots());
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(it =>
      it.title.toLowerCase().includes(s) ||
      (it.comment ?? "").toLowerCase().includes(s) ||
      new Date(it.createdAt).toLocaleString().toLowerCase().includes(s)
    );
  }, [list, q]);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Архів</div>

      {/* Панель пошуку */}
      <div className="glasscard p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <div className="text-sm text-[var(--muted)] mb-1">
            Пошук за назвою / датою / коментарем
          </div>
          <input
            className="input w-full"
            placeholder="Напр. «W36», «Іваненко», «2025-03-12», «після правок»…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Список збережених розкладів */}
      <div className="glasscard p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Коментар</th>
              <th className="px-4 py-3">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-t"
                style={{ borderColor: "color-mix(in oklab, var(--border), transparent 40%)" }}
              >
                {/* Назва — без парності та без активного лінка */}
                <td className="px-4 py-3 align-top">
                  {s.title}
                </td>

                <td className="px-4 py-3 align-top">
                  {new Date(s.createdAt).toLocaleString()}
                </td>

                {/* Коментар — охайний блок з прокруткою для довгих текстів */}
                <td className="px-4 py-3 align-top">
                  {s.comment ? (
                    <div className="max-w-[520px] max-h-24 overflow-auto whitespace-pre-wrap break-words pr-1">
                      {s.comment}
                    </div>
                  ) : (
                    <span className="text-[var(--muted)]">—</span>
                  )}
                </td>

                {/* Дії — кнопка «Переглянути розклад» (нове вікно) + Видалити */}
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/archive/${s.id}`}
                      target="_blank"
                      rel="noopener"
                      className="btn px-2 py-1 rounded-xl"
                      title="Відкрити в новій вкладці"
                    >
                      Переглянути розклад
                    </Link>

                    <button
                      className="btn px-2 py-1 rounded-xl"
                      disabled={busyId === s.id}
                      onClick={async () => {
                        setBusyId(s.id);
                        await deleteScheduleSnapshot(s.id);
                        await reload();
                        setBusyId(null);
                      }}
                    >
                      {busyId === s.id ? "Видаляємо…" : "Видалити"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[var(--muted)]" colSpan={4}>
                  Нічого не знайдено…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminArchive;

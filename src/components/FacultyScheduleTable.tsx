import React, { useEffect, useMemo, useState } from "react";
import {
  fetchFacultySchedule,
  saveFacultySchedule,
  filterFacultyLessons,
} from "@/lib/fakeApi/admin";
import type { FacultyLesson, Parity } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import { Pin, PinOff, ChevronLeft, ChevronRight, Minimize2 } from "lucide-react";

/* ----- константи часу та днів (4 пари) ----- */
const TIMES: Record<1|2|3|4, { start: string; end: string }> = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
};
const DAYS: Record<1|2|3|4|5|6, string> = {
  1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб",
};
const WEEKDAYS: (1|2|3|4|5|6)[] = [1,2,3,4,5,6];
const PAIRS: (1|2|3|4)[] = [1,2,3,4];

type Level = "bachelor" | "master";

const IconButton: React.FC<{ active?: boolean; onClick: () => void; title: string; }> =
({ active, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={[
      "rounded-md p-1 transition",
      active ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)] hover-lift" : "hover-lift hover:bg-[var(--surface-2)]"
    ].join(" ")}
  >
    {active ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
  </button>
);

const CellCard: React.FC<{
  lesson: FacultyLesson;
  dense?: boolean;
  onDragStart: (l: FacultyLesson) => void;
  onTogglePin: (id: string) => void;
}> = ({ lesson, dense, onDragStart, onTogglePin }) => (
  <div
    className={[
      "glasscard rounded-xl m-1",
      dense ? "p-1.5 text-[12px]" : "p-2 text-sm",
      "flex flex-col gap-1",
      lesson.pinned ? "opacity-90 cursor-not-allowed ring-1 ring-[var(--border)]" : "cursor-move hover-lift hover-shadow",
    ].join(" ")}
    draggable={!lesson.pinned}
    onDragStart={(e) => {
      if (lesson.pinned) return;
      e.dataTransfer.setData("text/plain", lesson.id);
      onDragStart(lesson);
    }}
  >
    <div className="flex items-start gap-2">
      <div className="font-medium leading-tight">{lesson.subject}</div>
      <div className="ml-auto">
        <IconButton
          active={!!lesson.pinned}
          title={lesson.pinned ? "Відкріпити пару" : "Закріпити пару"}
          onClick={() => onTogglePin(lesson.id)}
        />
      </div>
    </div>
    <div className={dense ? "text-[10px] text-[var(--muted)]" : "text-xs text-[var(--muted)]"}>
      {lesson.teacher} · {lesson.location ?? "—"}
    </div>
    {lesson.parity !== "any" && (
      <div className={dense ? "text-[9px]" : "text-[10px]"} style={{opacity:0.75}}>
        {lesson.parity === "even" ? "ПАРНИЙ" : "НЕПАРНИЙ"}
      </div>
    )}
  </div>
);

const EmptyDropZone: React.FC<{ onDrop: () => void; dense?: boolean; }> = ({ onDrop, dense }) => (
  <div
    className={[
      "rounded-xl border border-dashed text-center text-[var(--muted)]",
      dense ? "p-2 text-[10px]" : "p-4 text-xs"
    ].join(" ")}
    style={{ borderColor: "color-mix(in oklab, var(--border), transparent 30%)" }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => { e.preventDefault(); onDrop(); }}
  >
    перетягніть пару сюди
  </div>
);

const SelectorRow: React.FC<{
  level: Level; setLevel: (v: Level) => void;
  course: number; setCourse: (n: number) => void;
  parity: Parity; setParity: (p: Parity) => void;
  dense: boolean; setDense: (v:boolean)=>void;
}> = ({ level, setLevel, course, setCourse, parity, setParity, dense, setDense }) => (
  <div className="flex flex-wrap gap-3 mb-4 items-center">
    <select className="select" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
      <option value="bachelor">Бакалавр</option>
      <option value="master">Магістр</option>
    </select>

    <select className="select" value={course} onChange={(e) => setCourse(Number(e.target.value))}>
      {(level === "bachelor" ? [1,2,3,4] : [1,2]).map(c => (
        <option key={c} value={c}>{c} курс</option>
      ))}
    </select>

    <select className="select" value={parity} onChange={(e) => setParity(e.target.value as Parity)}>
      <option value="any">Будь-який тиждень</option>
      <option value="even">Парний</option>
      <option value="odd">Непарний</option>
    </select>

    <label className="inline-flex items-center gap-2 ml-auto text-sm cursor-pointer">
      <input
        type="checkbox"
        className="checkbox"
        checked={dense}
        onChange={(e)=>setDense(e.target.checked)}
      />
      <Minimize2 className="h-4 w-4" /> Dense
    </label>
  </div>
);

const FacultyScheduleTable: React.FC = () => {
  const { user } = useAuth();
  const [level, setLevel] = useState<Level>("bachelor");
  const [course, setCourse] = useState<number>(1);
  const [parity, setParity] = useState<Parity>("any");

  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10); // скільки колонок показувати за раз

  const [allLessons, setAllLessons] = useState<FacultyLesson[]>([]);
  const [dragging, setDragging] = useState<FacultyLesson | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFacultySchedule(level).then(setAllLessons);
  }, [level]);

  // 1) Фільтруємо по курсу/парності
  const viewLessons = useMemo(
    () => filterFacultyLessons({ lessons: allLessons, course, parity }),
    [allLessons, course, parity]
  );

  // 2) Список ГРУП з відфільтрованих даних
  const allGroups = useMemo(() => {
    const set = new Set<string>();
    viewLessons.forEach(l => {
      const g = (l.group ?? (l as any).speciality ?? "").toString().trim();
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [viewLessons]);

  // 3) Пагінація колонок
  const maxPage = Math.max(0, Math.ceil(allGroups.length / pageSize) - 1);
  useEffect(() => { if (page > maxPage) setPage(maxPage); }, [maxPage, page]);
  const groups = useMemo(
    () => allGroups.slice(page * pageSize, page * pageSize + pageSize),
    [allGroups, page, pageSize]
  );

  // 4) Індекс клітинок
  const byCell = useMemo(() => {
    const m = new Map<string, FacultyLesson[]>();
    viewLessons.forEach(l => {
      const groupName = (l.group ?? (l as any).speciality ?? "").toString();
      const k = `${l.weekday}-${l.pair}-${groupName}`;
      const arr = m.get(k) ?? [];
      arr.push(l);
      m.set(k, arr);
    });
    return m;
  }, [viewLessons]);

  const getCell = (weekday: 1|2|3|4|5|6, pair: 1|2|3|4, group: string) =>
    byCell.get(`${weekday}-${pair}-${group}`) ?? [];

  const togglePin = (id: string) => {
    setAllLessons(prev => prev.map(l => l.id === id ? { ...l, pinned: !l.pinned } : l));
  };

  const moveLesson = (lessonId: string, to: { weekday: 1|2|3|4|5|6; pair: 1|2|3|4; group: string; }) => {
    setAllLessons(prev => {
      const srcIdx = prev.findIndex(l => l.id === lessonId);
      if (srcIdx < 0) return prev;
      if (prev[srcIdx].pinned) return prev;

      const targetIdx = prev.findIndex(l =>
        l.level === prev[srcIdx].level &&
        l.course === prev[srcIdx].course &&
        l.parity === prev[srcIdx].parity &&
        l.weekday === to.weekday &&
        l.pair === to.pair &&
        (l.group ?? (l as any).speciality) === to.group
      );

      const next = [...prev];
      const timeOf = (p: 1|2|3|4) => TIMES[p];

      if (targetIdx >= 0) {
        if (next[targetIdx].pinned) return prev;
        const a = next[srcIdx];
        const b = next[targetIdx];
        next[targetIdx] = { ...a, weekday: to.weekday, pair: to.pair, group: to.group, time: timeOf(to.pair) };
        next[srcIdx]     = { ...b, weekday: a.weekday, pair: a.pair, group: a.group ?? (a as any).speciality ?? "", time: timeOf(a.pair) };
      } else {
        next[srcIdx] = { ...next[srcIdx], weekday: to.weekday, pair: to.pair, group: to.group, time: timeOf(to.pair) };
      }
      return next;
    });
  };

  const onDropToCell = (e: React.DragEvent, coords: { weekday: 1|2|3|4|5|6; pair: 1|2|3|4; group: string; }) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveLesson(id, coords);
    setDragging(null);
  };

  const saveAll = async () => {
    setSaving(true);
    await saveFacultySchedule(level, allLessons);
    setSaving(false);
  };

  return (
    <div className="glasscard p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">Розклад факультету</div>
        <div className="flex items-center gap-2">
          {/* керування сторінками колонок */}
          <div className="flex items-center gap-1">
            <button className="btn px-2 py-2 rounded-xl" disabled={page<=0} onClick={()=>setPage(p=>Math.max(0,p-1))}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm text-[var(--muted)] w-28 text-center">
              {page+1} / {Math.max(1, maxPage+1)}
            </div>
            <button className="btn px-2 py-2 rounded-xl" disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            className="btn py-2 px-4 rounded-xl hover-shadow disabled:opacity-50"
            onClick={saveAll}
            disabled={saving}
            title={user?.id ? "Зберегти зміни" : "Потрібен користувач"}
          >
            {saving ? "Збереження…" : "Зберегти (fake)"}
          </button>
        </div>
      </div>

      <SelectorRow
        level={level} setLevel={setLevel}
        course={course} setCourse={setCourse}
        parity={parity} setParity={setParity}
        dense={dense} setDense={setDense}
      />

<div className="overflow-auto scrollarea scrollbar-stable sticky-left">
        <table className="w-full text-sm relative border-separate border-spacing-0">
  <thead>
    <tr className="text-left">
      <th className="th-sticky th-day sticky-base">День</th>
      <th className="th-sticky th-pair sticky-base">Пара</th>
      <th className="th-sticky th-time sticky-base">Час</th>
      {groups.map(g => (
        <th key={g} className="py-2 text-[var(--muted)] min-w-[220px] text-center">{g}</th>
      ))}
    </tr>
  </thead>
  <tbody /* ... */>
    {WEEKDAYS.map(weekday => (
      <React.Fragment key={weekday}>
        <tr>
          <td colSpan={3 + groups.length} className="p-0"><div className="dayline" /></td>
        </tr>

        {PAIRS.map((pair, pairIdx) => (
          <tr key={`${weekday}-${pair}`} className="border-t"
              style={{ borderColor: "color-mix(in oklab, var(--border), transparent 60%)" }}>
            {pairIdx === 0 && (
              <td className="td-sticky th-day sticky-base" rowSpan={PAIRS.length}>
                {DAYS[weekday]}
              </td>
            )}
            <td className="td-sticky th-pair sticky-base">{pair}</td>

            <td className="td-sticky th-time sticky-base">
              <div className="flex flex-col leading-tight">
                <span>{TIMES[pair].start}</span>
                <span className="text-[var(--muted)]">—</span>
                <span>{TIMES[pair].end}</span>
              </div>
            </td>

            {groups.map(group => {
              const items = getCell(weekday, pair, group);
              return (
                <td key={group} onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDropToCell(e, { weekday, pair, group })}
                    className="py-2 align-top">
                  {items.length > 0 ? items.map(l => (
                    <CellCard key={l.id} lesson={l} dense={dense}
                              onDragStart={setDragging} onTogglePin={togglePin}/>
                  )) : (
                    <EmptyDropZone dense={dense}
                                   onDrop={() => dragging && moveLesson(dragging.id, { weekday, pair, group })}/>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </React.Fragment>
    ))}
  </tbody>
</table>

      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm text-[var(--muted)]">
          Показувати колонок:
          <select
            className="select ml-2"
            value={pageSize}
            onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(0); }}
          >
            {[4,6,8,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="text-xs text-[var(--muted)] ml-auto">
          * Стіккі «День/Пара/Час». Колонки — пагінуються, щільний режим стискає картки.
        </div>
      </div>
    </div>
  );
};

export default FacultyScheduleTable;

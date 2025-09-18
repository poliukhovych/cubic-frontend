// src/components/FacultyScheduleTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchFacultySchedule,
  saveFacultySchedule,
  filterFacultyLessons,
  fetchTeachers,
} from "@/lib/fakeApi/admin";
import type { FacultyLesson, Parity } from "@/types/schedule";
import type { Teacher } from "@/types/teachers";
import { useAuth } from "@/types/auth";
import {
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  Shuffle,
} from "lucide-react";

/* ----- константи часу та днів (4 пари) ----- */
const TIMES: Record<1 | 2 | 3 | 4, { start: string; end: string }> = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
};
const DAYS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
};
const WEEKDAYS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
const PAIRS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

type Level = "bachelor" | "master";

/* ---------- дрібні утиліти ---------- */
const tmpId = () => `tmp-${Math.random().toString(36).slice(2, 9)}`;

/* ---------- кнопка пін/анпін ---------- */
const IconButton: React.FC<{ active?: boolean; onClick: () => void; title: string }> = ({
  active,
  onClick,
  title,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={[
      "rounded-md p-1 transition",
      active ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)] hover-lift" : "hover-lift hover:bg-[var(--surface-2)]",
    ].join(" ")}
  >
    {active ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
  </button>
);

/* ---------- трьохстановий тогл парності ---------- */
const ParityToggle: React.FC<{ value: Parity; onChange: (p: Parity) => void }> = ({
  value,
  onChange,
}) => {
  const Item: React.FC<{ v: Parity; label: string }> = ({ v, label }) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={[
        "px-2 py-1 rounded-md text-xs transition",
        value === v ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)]" : "hover:bg-[var(--surface-2)]/60",
      ].join(" ")}
      title={label}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex items-center gap-1 bg-[var(--surface)] rounded-md p-1 ring-1 ring-[var(--border)]">
      <Item v="any" label="any" />
      <Item v="odd" label="odd" />
      <Item v="even" label="even" />
    </div>
  );
};

/* ---------- картка пари (перегляд) ---------- */
const CellCard: React.FC<{
  lesson: FacultyLesson;
  dense?: boolean;
  onDragStart: (l: FacultyLesson) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (l: FacultyLesson) => void;
  isDraft?: boolean;
  editable: boolean;
}> = ({
  lesson,
  dense,
  onDragStart,
  onTogglePin,
  onDelete,
  onStartEdit,
  isDraft,
  editable,
}) => (
  <div
    className={[
      "glasscard rounded-xl m-1 relative",
      dense ? "p-1.5 text-[12px]" : "p-2 text-sm",
      "flex flex-col gap-1",
      editable && !lesson.pinned ? "cursor-move hover-lift hover-shadow" : "opacity-90 cursor-default",
      !editable && lesson.pinned ? "ring-1 ring-primary/50" : "",
      isDraft ? "ring-1 ring-warning/60" : "",
    ].join(" ")}
    draggable={editable && !lesson.pinned}
    onDragStart={(e) => {
      if (!editable || lesson.pinned) return;
      e.dataTransfer.setData("text/plain", lesson.id);
      onDragStart(lesson);
    }}
  >
    <div className="flex items-start gap-2">
      <div className="font-medium leading-tight">
        {lesson.subject || <span className="text-[var(--muted)]">[без назви]</span>}
      </div>
      <div className="ml-auto flex items-center gap-1">
        {editable && (
          <>
            <button
              className="rounded-md p-1 hover:bg-[var(--surface-2)]"
              title="Редагувати"
              onClick={() => onStartEdit(lesson)}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="rounded-md p-1 hover:bg-[var(--surface-2)]"
              title="Видалити"
              onClick={() => onDelete(lesson.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
        {editable ? (
          <IconButton
            active={!!lesson.pinned}
            title={lesson.pinned ? "Відкріпити пару" : "Закріпити пару"}
            onClick={() => onTogglePin(lesson.id)}
          />
        ) : (
          lesson.pinned && <Pin className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>

    <div className={dense ? "text-[10px] text-[var(--muted)]" : "text-xs text-[var(--muted)]"}>
      {(lesson.teacher && lesson.teacher.trim()) ? lesson.teacher : <span className="text-[var(--muted)]">[викладач?]</span>}
      {" · "}
      {lesson.location ?? "—"}
    </div>

    {lesson.parity !== "any" && (
      <div className={dense ? "text-[9px]" : "text-[10px]"} style={{ opacity: 0.75 }}>
        {lesson.parity === "even" ? "ПАРНИЙ" : "НЕПАРНИЙ"}
      </div>
    )}

    {isDraft && (
      <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] ring-1 ring-[var(--warning)]/40">
        draft
      </div>
    )}
  </div>
);

/* ---------- порожня зона (для спадку сумісності) ---------- */
const EmptyDropZone: React.FC<{ onDrop: () => void; dense?: boolean; editable: boolean }> = ({
  onDrop,
  dense,
  editable,
}) => (
  <div
    className={[
      "rounded-xl border border-dashed text-center text-[var(--muted)]",
      dense ? "p-2 text-[10px]" : "p-4 text-xs",
    ].join(" ")}
    style={{ borderColor: "color-mix(in oklab, var(--border), transparent 30%)" }}
    onDragOver={(e) => editable && e.preventDefault()}
    onDrop={(e) => {
      if (!editable) return;
      e.preventDefault();
      onDrop();
    }}
  >
    {editable ? "перетягніть пару сюди" : "—"}
  </div>
);

/* ---------- верхній ряд фільтрів ---------- */
const SelectorRow: React.FC<{
  level: Level;
  setLevel: (v: Level) => void;
  course: number;
  setCourse: (n: number) => void;
  parity: Parity;
  setParity: (p: Parity) => void;
  dense: boolean;
  setDense: (v: boolean) => void;
}> = ({ level, setLevel, course, setCourse, parity, setParity, dense, setDense }) => (
  <div className="flex flex-wrap gap-3 mb-4 items-center">
    <select className="select" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
      <option value="bachelor">Бакалавр</option>
      <option value="master">Магістр</option>
    </select>

    <select className="select" value={course} onChange={(e) => setCourse(Number(e.target.value))}>
      {(level === "bachelor" ? [1, 2, 3, 4] : [1, 2]).map((c) => (
        <option key={c} value={c}>
          {c} курс
        </option>
      ))}
    </select>

    <select className="select" value={parity} onChange={(e) => setParity(e.target.value as Parity)}>
      <option value="any">Будь-який тиждень</option>
      <option value="even">Парний</option>
      <option value="odd">Непарний</option>
    </select>

    <label className="inline-flex items-center gap-2 ml-auto text-sm cursor-pointer">
      <input type="checkbox" className="checkbox" checked={dense} onChange={(e) => setDense(e.target.checked)} />
      <Minimize2 className="h-4 w-4" /> Dense
    </label>
  </div>
);

const FacultyScheduleTable: React.FC<{ editable: boolean }> = ({ editable }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const { user } = useAuth();
  const [level, setLevel] = useState<Level>("bachelor");
  const [course, setCourse] = useState<number>(1);
  const [parity, setParity] = useState<Parity>("any");

  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [allLessons, setAllLessons] = useState<FacultyLesson[]>([]);
  const [dragging, setDragging] = useState<FacultyLesson | null>(null);
  const [saving, setSaving] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<FacultyLesson>>({});
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set());

  /* ---------- дані ---------- */
  useEffect(() => {
    fetchFacultySchedule(level).then(setAllLessons);
  }, [level]);

  useEffect(() => {
    fetchTeachers().then(setTeachers);
  }, []);

  const viewLessons = useMemo(
    () => filterFacultyLessons({ lessons: allLessons, course, parity }),
    [allLessons, course, parity]
  );

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    viewLessons.forEach((l) => {
      const g = (l.group ?? (l as any).speciality ?? "").toString().trim();
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [viewLessons]);

  const maxPage = Math.max(0, Math.ceil(allGroups.length / pageSize) - 1);
  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [maxPage, page]);
  const groups = useMemo(
    () => allGroups.slice(page * pageSize, page * pageSize + pageSize),
    [allGroups, page, pageSize]
  );

  const byCell = useMemo(() => {
    const m = new Map<string, FacultyLesson[]>();
    viewLessons.forEach((l) => {
      const groupName = (l.group ?? (l as any).speciality ?? "").toString();
      const k = `${l.weekday}-${l.pair}-${groupName}`;
      const arr = m.get(k) ?? [];
      arr.push(l);
      m.set(k, arr);
    });
    return m;
  }, [viewLessons]);

  const getCell = (weekday: 1 | 2 | 3 | 4 | 5 | 6, pair: 1 | 2 | 3 | 4, group: string) =>
    byCell.get(`${weekday}-${pair}-${group}`) ?? [];

  /* ---------- редагування ---------- */
  const startEdit = (l: FacultyLesson) => {
    if (!editable) return;
    setEditingId(l.id);
    setEditBuf({ ...l });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditBuf({});
  };
  const commitEdit = () => {
    if (!editable || !editingId) return;
    setAllLessons((prev) => prev.map((l) => (l.id === editingId ? ({ ...l, ...editBuf } as FacultyLesson) : l)));
    setEditingId(null);
    setEditBuf({});
  };

  const togglePin = (id: string) => {
    if (!editable) return;
    setAllLessons((prev) => prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  };

  const deleteLesson = (id: string) => {
    if (!editable) return;
    setAllLessons((prev) => prev.filter((l) => l.id !== id));
    setDraftIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (editingId === id) cancelEdit();
  };

  const createDraftLesson = (opts: {
    weekday: 1 | 2 | 3 | 4 | 5 | 6;
    pair: 1 | 2 | 3 | 4;
    group: string;
    parity: Parity;
  }) => {
    if (!editable) return;
    const l: FacultyLesson = {
      id: tmpId(),
      weekday: opts.weekday,
      pair: opts.pair,
      parity: opts.parity,
      time: TIMES[opts.pair],
      course: course as 1 | 2 | 3 | 4,
      level,
      group: opts.group,
      subject: "",
      teacher: "",
      location: "",
      pinned: false,
    };
    setAllLessons((prev) => [l, ...prev]);
    setDraftIds((prev) => new Set(prev).add(l.id));
    startEdit(l);
  };

  /* ---------- DnD ---------- */
  const moveLesson = (
    lessonId: string,
    to: { weekday: 1 | 2 | 3 | 4 | 5 | 6; pair: 1 | 2 | 3 | 4; group: string }
  ) => {
    if (!editable) return;
    setAllLessons((prev) => {
      const srcIdx = prev.findIndex((l) => l.id === lessonId);
      if (srcIdx < 0) return prev;
      if (prev[srcIdx].pinned) return prev;

      const targetIdx = prev.findIndex(
        (l) =>
          l.level === prev[srcIdx].level &&
          l.course === prev[srcIdx].course &&
          l.parity === prev[srcIdx].parity &&
          l.weekday === to.weekday &&
          l.pair === to.pair &&
          (l.group ?? (l as any).speciality) === to.group
      );

      const next = [...prev];
      const timeOf = (p: 1 | 2 | 3 | 4) => TIMES[p];

      if (targetIdx >= 0) {
        if (next[targetIdx].pinned) return prev;
        const a = next[srcIdx];
        const b = next[targetIdx];
        next[targetIdx] = { ...a, weekday: to.weekday, pair: to.pair, group: to.group, time: timeOf(to.pair) };
        next[srcIdx] = {
          ...b,
          weekday: a.weekday,
          pair: a.pair,
          group: (a.group ?? (a as any).speciality ?? "") as string,
          time: timeOf(a.pair),
        };
      } else {
        next[srcIdx] = { ...next[srcIdx], weekday: to.weekday, pair: to.pair, group: to.group, time: timeOf(to.pair) };
      }
      return next;
    });
  };

  const onDropToCell = (
    e: React.DragEvent,
    coords: { weekday: 1 | 2 | 3 | 4 | 5 | 6; pair: 1 | 2 | 3 | 4; group: string }
  ) => {
    if (!editable) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveLesson(id, coords);
    setDragging(null);
  };

  /* ---------- збереження (з очисткою чернеток) ---------- */
  const saveAll = async () => {
    if (!editable) return;
    setSaving(true);

    // Видаляємо незаповнені чернетки (обов'язково потрібні subject і teacher)
    setAllLessons((prev) =>
      prev.filter((l) => {
        if (!draftIds.has(l.id)) return true;
        const ok = l.subject?.trim() && l.teacher?.trim();
        return !!ok;
      })
    );
    setDraftIds(new Set());

    await saveFacultySchedule(level, allLessons);
    setSaving(false);
  };

  /* ---------- синхронізація верхнього скролу ---------- */
  useEffect(() => {
    const main = scrollRef.current;
    const top = topScrollRef.current;
    if (!main || !top) return;

    const onMain = () => {
      top.scrollLeft = main.scrollLeft;
    };
    const onTop = () => {
      main.scrollLeft = top.scrollLeft;
    };

    main.addEventListener("scroll", onMain);
    top.addEventListener("scroll", onTop);

    const updateWidth = () => {
      if (main) setScrollWidth(main.scrollWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      main.removeEventListener("scroll", onMain);
      top.removeEventListener("scroll", onTop);
      window.removeEventListener("resize", updateWidth);
    };
  }, [groups]);

  /* ---------- інлайн-редактор (вставляється замість картки) ---------- */
  const renderInlineEditor = (l: FacultyLesson) => (
    <div className={["glasscard rounded-xl m-1", dense ? "p-1.5 text-[12px]" : "p-2 text-sm"].join(" ")}>
      <div className="flex flex-col gap-2">
        <input
          className="input"
          placeholder="Назва предмету"
          value={editBuf.subject ?? ""}
          onChange={(e) => setEditBuf((prev) => ({ ...prev, subject: e.target.value }))}
        />
        <div className="flex gap-2">
          <select
            className="select flex-1"
            value={editBuf.teacher ?? ""}
            onChange={(e) => setEditBuf((prev) => ({ ...prev, teacher: e.target.value }))}
          >
            <option value="">— Викладач —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            className="input flex-1"
            placeholder="Аудиторія"
            value={editBuf.location ?? ""}
            onChange={(e) => setEditBuf((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <ParityToggle
            value={(editBuf.parity as Parity) ?? "any"}
            onChange={(p) => setEditBuf((prev) => ({ ...prev, parity: p }))}
          />
          <div className="ml-auto flex items-center gap-1">
            <button className="btn px-2 py-1 rounded-md" onClick={commitEdit} title="Застосувати">
              <Check className="h-4 w-4" />
            </button>
            <button className="btn px-2 py-1 rounded-md" onClick={cancelEdit} title="Скасувати">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------- розмітка ---------- */
  return (
    <div className="glasscard p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">Розклад факультету</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button className="btn px-2 py-2 rounded-xl" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm text-[var(--muted)] w-28 text-center">
              {page + 1} / {Math.max(1, maxPage + 1)}
            </div>
            <button
              className="btn px-2 py-2 rounded-xl"
              disabled={page >= maxPage}
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {editable && (
            <button
              className="btn py-2 px-4 rounded-xl hover-shadow disabled:opacity-50"
              onClick={saveAll}
              disabled={saving}
              title={user?.id ? "Зберегти зміни" : "Потрібен користувач"}
            >
              {saving ? "Збереження…" : "Зберегти (fake)"}
            </button>
          )}
        </div>
      </div>

      <SelectorRow
        level={level}
        setLevel={setLevel}
        course={course}
        setCourse={setCourse}
        parity={setParity ? parity : "any"}
        setParity={setParity}
        dense={dense}
        setDense={setDense}
      />

      {/* верхній скрол */}
      <div ref={topScrollRef} className="overflow-x-auto scrollbar-stable" style={{ height: 16 }}>
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>

      <div ref={scrollRef} className="overflow-auto scrollarea scrollbar-stable sticky-left">
        <table className="w-full rounded-xl text-sm relative p-4 border-separate border-spacing-0">
          <thead className="rounded-xl">
            <tr className="text-left">
              <th className="th-sticky th-day sticky-base">День</th>
              <th className="th-sticky th-pair sticky-base">Пара</th>
              <th className="th-sticky th-time sticky-base">Час</th>
              {groups.map((g) => (
                <th key={g} className="py-2 text-[var(--muted)] min-w-[220px] text-center">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="rounded-xl">
            {WEEKDAYS.map((weekday) => (
              <React.Fragment key={weekday}>
                <tr>
                  <td colSpan={3 + groups.length} className="p-0">
                    <div className="dayline" />
                  </td>
                </tr>

                {PAIRS.map((pair, pairIdx) => (
                  <tr
                    key={`${weekday}-${pair}`}
                    className="border-t"
                    style={{ borderColor: "color-mix(in oklab, var(--border), transparent 60%)" }}
                  >
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

                    {groups.map((group) => {
                      const items = getCell(weekday as 1 | 2 | 3 | 4 | 5 | 6, pair as 1 | 2 | 3 | 4, group);
                      const oddItems = items.filter((i) => i.parity === "odd");
                      const evenItems = items.filter((i) => i.parity === "even");
                      const anyItems = items.filter((i) => i.parity === "any");

                      const dropToHalf = (e: React.DragEvent, half: "top" | "bottom") => {
                        if (!editable) return;
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        if (!id) return;

                        const hasAny = anyItems[0];
                        if (hasAny) {
                          const draggedParity: Parity = half === "top" ? "odd" : "even";
                          const anyTo: Parity = half === "top" ? "even" : "odd";
                          setAllLessons((prev) =>
                            prev.map((l) => {
                              if (l.id === id)
                                return { ...l, weekday, pair, group, time: TIMES[pair], parity: draggedParity };
                              if (l.id === hasAny.id) return { ...l, parity: anyTo };
                              return l;
                            })
                          );
                          setDragging(null);
                          return;
                        }

                        // звичайний dnd у половину
                        const draggedParity: Parity = half === "top" ? "odd" : "even";
                        moveLesson(id, { weekday, pair, group });
                        // якщо була any — конкретизуємо
                        setAllLessons((prev) => prev.map((l) => (l.id === id ? { ...l, parity: draggedParity } : l)));
                        setDragging(null);
                      };

                      return (
                        <td key={group} className="py-2 align-top">
                          <div className="grid grid-rows-2 gap-1 relative" onDragOver={(e) => editable && e.preventDefault()}>
                            {anyItems.length > 0 ? (
                              // ANY займає обидві підкомірки
                              <div
                                className="row-span-2"
                                onDrop={(e) => {
                                  // дроп у центр — звичайний move
                                  onDropToCell(e, { weekday, pair, group });
                                }}
                              >
                                {anyItems.map((l) =>
                                  editingId === l.id ? (
                                    <React.Fragment key={l.id}>{renderInlineEditor(l)}</React.Fragment>
                                  ) : (
                                    <CellCard
                                      key={l.id}
                                      lesson={l}
                                      dense={dense}
                                      onDragStart={setDragging}
                                      onTogglePin={togglePin}
                                      onDelete={deleteLesson}
                                      onStartEdit={startEdit}
                                      editable={editable}
                                      isDraft={draftIds.has(l.id)}
                                    />
                                  )
                                )}

                                {/* швидке розщеплення any -> even + odd(draft) */}
                                {editable && anyItems[0] && (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      className="btn px-2 py-1 m-1 rounded-md"
                                      title="Розщепити на odd/even (odd вгорі)"
                                      onClick={() => {
                                        const a = anyItems[0];
                                        setAllLessons((prev) => prev.map((x) => (x.id === a.id ? { ...x, parity: "even" } : x)));
                                        createDraftLesson({ weekday, pair, group, parity: "odd" });
                                      }}
                                    >
                                      <Shuffle className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {/* TOP (odd) */}
                                <div className="min-h-[48px] rounded-md" onDrop={(e) => dropToHalf(e, "top")}>
                                  {oddItems.length ? (
                                    oddItems.map((l) =>
                                      editingId === l.id ? (
                                        <React.Fragment key={l.id}>{renderInlineEditor(l)}</React.Fragment>
                                      ) : (
                                        <CellCard
                                          key={l.id}
                                          lesson={l}
                                          dense={dense}
                                          onDragStart={setDragging}
                                          onTogglePin={togglePin}
                                          onDelete={deleteLesson}
                                          onStartEdit={startEdit}
                                          editable={editable}
                                          isDraft={draftIds.has(l.id)}
                                        />
                                      )
                                    )
                                  ) : editable ? (
                                    <button
                                      className="w-full rounded-xl border border-dashed text-xs py-3 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                                      onClick={() => createDraftLesson({ weekday, pair, group, parity: "odd" })}
                                      title="Додати пару (odd)"
                                    >
                                      <Plus className="inline h-3 w-3 mr-1" /> Додати odd
                                    </button>
                                  ) : (
                                    <div className="h-3" />
                                  )}
                                </div>

                                {/* BOTTOM (even) */}
                                <div className="min-h-[48px] rounded-md" onDrop={(e) => dropToHalf(e, "bottom")}>
                                  {evenItems.length ? (
                                    evenItems.map((l) =>
                                      editingId === l.id ? (
                                        <React.Fragment key={l.id}>{renderInlineEditor(l)}</React.Fragment>
                                      ) : (
                                        <CellCard
                                          key={l.id}
                                          lesson={l}
                                          dense={dense}
                                          onDragStart={setDragging}
                                          onTogglePin={togglePin}
                                          onDelete={deleteLesson}
                                          onStartEdit={startEdit}
                                          editable={editable}
                                          isDraft={draftIds.has(l.id)}
                                        />
                                      )
                                    )
                                  ) : editable ? (
                                    <button
                                      className="w-full rounded-xl border border-dashed text-xs py-3 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                                      onClick={() => createDraftLesson({ weekday, pair, group, parity: "even" })}
                                      title="Додати пару (even)"
                                    >
                                      <Plus className="inline h-3 w-3 mr-1" /> Додати even
                                    </button>
                                  ) : (
                                    <div className="h-3" />
                                  )}
                                </div>
                              </>
                            )}

                            {/* Якщо зовсім порожньо */}
                            {items.length === 0 && editable && (
                              <button
                                className="absolute inset-0 rounded-xl border border-dashed text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]/40"
                                onClick={() => createDraftLesson({ weekday, pair, group, parity: "any" })}
                                title="Створити пару (any)"
                              >
                                <Plus className="inline h-3 w-3 mr-1" /> Створити (any)
                              </button>
                            )}
                          </div>
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
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[4, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
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

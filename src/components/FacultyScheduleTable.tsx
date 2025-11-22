// src/components/FacultyScheduleTable.tsx
import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
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
import { createPortal } from "react-dom";
import NiceSelect from "@/ui/NiceSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchTeachersApi } from "@/lib/api/teachers-api";
import { fetchGroupsApi } from "@/lib/api/groups-api";
import { fetchCoursesApi } from "@/lib/api/courses-api";
import { getDefaultTimeslotMap } from "@/lib/api/timeslots-api";

import {
  saveFacultySchedule,
  filterFacultyLessons,
  createScheduleSnapshot,
} from "@/lib/fakeApi/admin";

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
const IconButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  title: string;
}> = ({ active, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={[
      "rounded-md p-1 transition",
      active
        ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)] hover-lift"
        : "hover-lift hover:bg-[var(--surface-2)]",
    ].join(" ")}
  >
    {active ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
  </button>
);

/* ---------- трьохстановий тогл парності ---------- */
const ParityToggle: React.FC<{
  value: Parity;
  onChange: (p: Parity) => void;
}> = ({ value, onChange }) => {
  const items: { v: Parity; label: string; color: string }[] = [
    { v: "any", label: "будь-який", color: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" },
        { v: "odd", label: "непарний", color: "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40" },
    { v: "even", label: "парний", color: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40" },
  ];

  const Item: React.FC<{ v: Parity; label: string; color: string }> = ({ v, label, color }) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={[
        "px-3 py-1.5 rounded-xl text-xs font-medium transition hover-lift",
        value === v
          ? `${color} ring-1 ring-current`
          : `${color} opacity-60 hover:opacity-100`,
      ].join(" ")}
      title={`Тиждень: ${label}`}
    >
      {label}
    </button>
  );

  return (
    <div className="hover-lift inline-flex items-center gap-1 bg-[var(--surface)] rounded-2xl p-1 ring-1 ring-[var(--border)]">
      {items.map(item => (
        <Item key={item.v} v={item.v} label={item.label} color={item.color} />
      ))}
    </div>
  );
};

// ——— Додати вгорі файлу (поруч із іншими дрібними компонентами) ———
const AddSlotButton: React.FC<{
  label: string;
  onClick: () => void;
  title?: string;
  variant?: 'odd' | 'even' | 'any';
}> = ({ label, onClick, title, variant = 'any' }) => {
  const colors = {
    odd: 'border-orange-500/40 bg-orange-50/10 hover:bg-orange-100/20 text-orange-700 dark:text-orange-300',
    even: 'border-blue-500/40 bg-blue-50/10 hover:bg-blue-100/20 text-blue-700 dark:text-blue-300',
    any: 'border-[var(--border)]/70 bg-[var(--surface)]/40 hover:bg-[var(--surface-2)]/60 text-[var(--text)]/90'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      // ✅ гарантовано однакова ширина, але не ширше за колонку
      style={{ width: "min(280px, 100%)" }}
      className={[
        "block mx-auto", // центр
        "px-4 py-3 rounded-2xl", // форма
        "border-2 border-dashed",
        colors[variant],
        "flex items-center justify-center gap-2",
        "transition hover-lift focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        "select-none text-sm font-medium",
      ].join(" ")}
    >
      <Plus className="h-4 w-4 opacity-80" />
      <span>{label}</span>
    </button>
  );
};

/* ---------- картка пари (перегляд) ---------- */
const CellCard: React.FC<{
  lesson: FacultyLesson;
  dense?: boolean;
  onDragStart: (l: FacultyLesson | null) => void;
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
      editable && !lesson.pinned
        ? "cursor-move hover-lift hover-shadow"
        : "opacity-90 cursor-default",
      !editable && lesson.pinned ? "ring-1 ring-primary/50" : "",
      isDraft ? "ring-1 ring-warning/60" : "",
    ].join(" ")}
    draggable={editable && !lesson.pinned}
    onDragStart={(e) => {
      if (!editable || lesson.pinned) return;
      // чіткий сигнал браузеру про перенос
      try {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";
      } catch {}
      e.dataTransfer.setData("text/plain", lesson.id);
      onDragStart(lesson);
    }}
  >
    <div className="flex items-start gap-2">
      <div className="font-medium leading-tight">
        {lesson.subject || (
          <span className="text-[var(--muted)]">[без назви]</span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        {editable && (
          <>
            <button
              className="hover-lift rounded-md p-1 hover:bg-[var(--surface-2)]"
              title="Редагувати"
              onClick={() => onStartEdit(lesson)}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="hover-lift rounded-md p-1 hover:bg-[var(--surface-2)]"
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

    <div
      className={
        dense
          ? "text-[10px] text-[var(--muted)]"
          : "text-xs text-[var(--muted)]"
      }
    >
      {lesson.teacher && lesson.teacher.trim() ? (
        lesson.teacher
      ) : (
        <span className="text-[var(--muted)]">[викладач?]</span>
      )}
      {" · "}
      {lesson.location ?? "—"}
    </div>

    {lesson.parity !== "any" && (
      <div
        className={dense ? "text-[9px]" : "text-[10px]"}
        style={{ opacity: 0.75 }}
      >
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
}> = ({
  level,
  setLevel,
  course,
  setCourse,
  parity,
  setParity,
  dense,
  setDense,
}) => (
  <div className="flex flex-wrap gap-4 mb-6 items-center p-4 bg-background/30 backdrop-blur rounded-xl border border-white/10">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Рівень освіти:</span>
      <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
        <SelectTrigger className="w-[140px] glass glass-btn hover:scale-[1.02] transition-all duration-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass glass-card border-white/20 shadow-2xl">
          <SelectItem 
            value="bachelor" 
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
          >
            🎓 Бакалавр
          </SelectItem>
          <SelectItem 
            value="master"
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
          >
            🎖️ Магістр
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Курс:</span>
      <Select value={String(course)} onValueChange={(v) => setCourse(Number(v))}>
        <SelectTrigger className="w-[120px] glass glass-btn hover:scale-[1.02] transition-all duration-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass glass-card border-white/20 shadow-2xl">
          {(level === "bachelor" ? [1, 2, 3, 4] : [1, 2]).map((c) => (
            <SelectItem 
              key={c} 
              value={String(c)}
              className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
            >
              {c} курс
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Парність тижня:</span>
      <Select value={parity} onValueChange={(v) => setParity(v as Parity)}>
        <SelectTrigger className="w-[180px] glass glass-btn hover:scale-[1.02] transition-all duration-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass glass-card border-white/20 shadow-2xl">
          <SelectItem 
            value="any"
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
          >
            📅 Будь-який тиждень
          </SelectItem>
          <SelectItem 
            value="even"
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
          >
            📈 Парний
          </SelectItem>
          <SelectItem 
            value="odd"
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors"
          >
            📉 Непарний
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <label className="inline-flex items-center gap-2 ml-auto text-sm cursor-pointer group">
      <input
        type="checkbox"
        className="w-4 h-4 text-primary bg-background/50 border-2 border-white/20 rounded focus:ring-primary focus:ring-2 transition-all duration-200"
        checked={dense}
        onChange={(e) => setDense(e.target.checked)}
      />
      <Minimize2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" /> 
      <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">Компактний вигляд</span>
    </label>
  </div>
);

async function convertAssignmentsToLessons(
  assignments: Array<{
    timeslotId: number;
    groupId: string;
    courseId: string;
    teacherId: string;
    roomId: string;
    courseType: string;
  }>
): Promise<FacultyLesson[]> {
  console.log("📥 Converting assignments to lessons...", assignments.length);

  // Завантажити всі необхідні дані
  const timeslotMap = getDefaultTimeslotMap();

  const [teachersResp, groupsResp, coursesResp] = await Promise.all([
    fetchTeachersApi(),
    fetchGroupsApi(),
    fetchCoursesApi(),
  ]);

  // Побудувати map-и для швидкого пошуку. Частина API вже повертає масиви сущностей,
  // тому нормалізуємо їх «на місці», не покладаючись на властивості типу .teachers тощо.
  const teacherMap = new Map<string, any>(
    ((teachersResp as any)?.teachers || teachersResp || []).map((t: any) => [
      t.teacher_id || t.id,
      t,
    ])
  );

  const groupMap = new Map<string, any>(
    ((groupsResp as any)?.groups || groupsResp || []).map((g: any) => [
      g.group_id || g.id,
      g,
    ])
  );

  const courseMap = new Map<string, any>(
    ((coursesResp as any)?.courses || coursesResp || []).map((c: any) => [
      c.course_id || c.id,
      c,
    ])
  );

  console.log("📊 Data loaded:", {
    timeslots: timeslotMap.size,
    teachers: teacherMap.size,
    groups: groupMap.size,
    courses: courseMap.size,
  });

  // Конвертувати кожен assignment
  const lessons: FacultyLesson[] = assignments.map((assignment, idx) => {
    const timeslot = timeslotMap.get(assignment.timeslotId);
    const teacher = teacherMap.get(assignment.teacherId);
    const group = groupMap.get(assignment.groupId);
    const course = courseMap.get(assignment.courseId);
    if (!timeslot) {
      console.warn(
        `⚠️  Timeslot ${assignment.timeslotId} not found for assignment ${idx}`
      );
    }

    const lesson: FacultyLesson = {
      id: `${assignment.courseId}_${assignment.groupId}_${idx}`,
      weekday: timeslot?.weekday || 1,
      pair: timeslot?.pair || 1,
      parity: timeslot?.parity || "any",
      time: timeslot?.time || { start: "08:30", end: "10:05" },
      course: 1, // TODO: визначити курс з groupId або group.name
      level: "bachelor", // TODO: визначити рівень з group або course
      group: group?.name || assignment.groupId,
      subject: course?.name || assignment.courseId,
      teacher: teacher?.name || teacher?.full_name
        || (teacher?.last_name && teacher?.first_name
          ? `${teacher.last_name} ${teacher.first_name}`
          : assignment.teacherId),
      location: assignment.roomId,
      pinned: false,
    };

    return lesson;
  });

  console.log("✅ Converted", lessons.length, "lessons");
  return lessons;
}

const FacultyScheduleTable: React.FC<{
  editable: boolean;
  lessons?: FacultyLesson[]; // якщо передали — не фетчимо з fakeApi
}> = ({ editable, lessons }) => {
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
  const [, setDragging] = useState<FacultyLesson | null>(null);
  const [saving, setSaving] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<FacultyLesson>>({});
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set());

  const [snapOpen, setSnapOpen] = useState(false);
  const [snapTitle, setSnapTitle] = useState("");
  const [snapComment, setSnapComment] = useState("");
  const [snapBusy, setSnapBusy] = useState(false);

  const sortGroups = (a: string, b: string) =>
    a.localeCompare(b, "uk", { numeric: true, sensitivity: "base" });

  /* ---------- DnD helpers ---------- */
  const allowDrop = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };

  const handleConfirmSnapshot = async () => {
    if (!snapTitle.trim() || !snapComment.trim()) return;
    try {
      setSnapBusy(true);
      await saveAll(); // збереже у fakeApi твій “активний” стан
      await createScheduleSnapshot(
        snapTitle.trim(),
        snapComment.trim(),
        "both", // повна сітка
        user?.name ?? "Admin",
        allLessons // зберігаємо весь набір пар
      );
      setSnapOpen(false);
      setSnapTitle("");
      setSnapComment("");
    } finally {
      setSnapBusy(false);
    }
  };

  /* ---------- дані ---------- */
  useEffect(() => {
    // Якщо lessons передано ззовні (props) - використовуємо їх
    if (lessons) {
      setAllLessons(lessons);
      return;
    }

    // Інакше завантажуємо з localStorage (після генерації)
    const loadSchedule = async () => {
      try {
        console.log("🔄 Loading schedule from last generation...");
        
        const lastScheduleJson = localStorage.getItem("last_generated_schedule");
        
        if (!lastScheduleJson) {
          console.warn("⚠️  No generated schedule found, table will be empty");
          setAllLessons([]);
          return;
        }

        const scheduleData = JSON.parse(lastScheduleJson);
        console.log("📊 Schedule data:", scheduleData);

        if (!scheduleData.schedule || scheduleData.schedule.length === 0) {
          console.warn("⚠️  Schedule has no assignments");
          setAllLessons([]);
          return;
        }

        // Конвертувати backend assignments → FacultyLesson[]
        const convertedLessons = await convertAssignmentsToLessons(
          scheduleData.schedule
        );
        console.log("📅 Converted lessons:", convertedLessons);

        setAllLessons(convertedLessons);
      } catch (err) {
        console.error("❌ Failed to load schedule:", err);
        setAllLessons([]);
        
        // Опціонально: fallback на fake API
        // import { SEED_BACHELOR } from "@/lib/fakeApi/facultyScheduleSeed";
        // setAllLessons(SEED_BACHELOR);
      }
    };

    loadSchedule();
  }, [level, lessons]); // Перезавантажувати при зміні level або lessons

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teachersList = await fetchTeachersApi();
        setTeachers(
          (teachersList ?? []).map((t: any) => ({
            id: t.teacher_id || t.id,
            name: t.name || `${t.last_name ?? ""} ${t.first_name ?? ""}`.trim(),
            subjects: Array.isArray(t.subjects) ? t.subjects : [],
            status: t.status,
          }))
        );
      } catch (err) {
        console.error("❌ Failed to load teachers:", err);
        setTeachers([]);
      }
    };

    loadTeachers();
  }, []);


  useEffect(() => {
    if (snapOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [snapOpen]);

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
    // 🔒 фіксуємо стабільний порядок колонок
    return Array.from(set).sort(sortGroups);
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
    const m = new Map<string, { odd?: FacultyLesson; even?: FacultyLesson; any?: FacultyLesson }>();
    viewLessons.forEach((l) => {
      const groupName = (l.group ?? (l as any).speciality ?? "").toString();
      const k = `${l.weekday}-${l.pair}-${groupName}`;
      const cell = m.get(k) ?? {};
      
      // Забезпечуємо унікальність парності в комірці
      if (l.parity === "odd" && !cell.odd) {
        cell.odd = l;
      } else if (l.parity === "even" && !cell.even) {
        cell.even = l;
      } else if (l.parity === "any" && !cell.any) {
        cell.any = l;
      }
      // Ігноруємо дублікати - не додаємо другу пару з тією ж парністю
      
      m.set(k, cell);
    });
    return m;
  }, [viewLessons]);

  const getCell = (
    weekday: 1 | 2 | 3 | 4 | 5 | 6,
    pair: 1 | 2 | 3 | 4,
    group: string
  ) => {
    const cell = byCell.get(`${weekday}-${pair}-${group}`);
    if (!cell) return { oddItems: [], evenItems: [], anyItems: [] };
    
    return {
      oddItems: cell.odd ? [cell.odd] : [],
      evenItems: cell.even ? [cell.even] : [],
      anyItems: cell.any ? [cell.any] : []
    };
  };

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
    setAllLessons((prev) =>
      prev.map((l) =>
        l.id === editingId ? ({ ...l, ...editBuf } as FacultyLesson) : l
      )
    );
    setEditingId(null);
    setEditBuf({});
  };

  const togglePin = (id: string) => {
    if (!editable) return;
    setAllLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l))
    );
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
    
    // Перевіряємо чи не існує вже пара з такою парністю в цій комірці
    const existing = allLessons.find((l) =>
      l.level === level &&
      l.course === course &&
      l.weekday === opts.weekday &&
      l.pair === opts.pair &&
      (l.group ?? (l as any).speciality) === opts.group &&
      l.parity === opts.parity
    );
    
    if (existing) {
      // Якщо пара вже існує - просто редагуємо її
      startEdit(existing);
      return;
    }
    
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
    setAllLessons((prev) => [...prev, l]);
    setDraftIds((prev) => new Set(prev).add(l.id));
    startEdit(l);
  };

  /* ---------- DnD ---------- */
  const moveLesson = (
    lessonId: string,
    to: { weekday: 1 | 2 | 3 | 4 | 5 | 6; pair: 1 | 2 | 3 | 4; group: string },
    forceParity?: Parity
  ) => {
    if (!editable) return;
    setAllLessons((prev) => {
      const srcIdx = prev.findIndex((l) => l.id === lessonId);
      if (srcIdx < 0) return prev;
      if (prev[srcIdx].pinned) return prev;

      const movingLesson = prev[srcIdx];
      const targetParity = forceParity || movingLesson.parity;
      
      // Знаходимо всі пари в цільовій комірці
      const targetLessons = prev.filter(
        (l) =>
          l.id !== lessonId &&
          l.level === movingLesson.level &&
          l.course === movingLesson.course &&
          l.weekday === to.weekday &&
          l.pair === to.pair &&
          (l.group ?? (l as any).speciality) === to.group
      );

      const next = [...prev];
      const timeOf = (p: 1 | 2 | 3 | 4) => TIMES[p];

      // Логіка обробки різних сценаріїв
      if (targetLessons.length === 0) {
        // Порожня комірка - просто переміщуємо
        next[srcIdx] = {
          ...movingLesson,
          weekday: to.weekday,
          pair: to.pair,
          group: to.group,
          time: timeOf(to.pair),
          parity: targetParity,
        };
      } else if (targetLessons.length === 1) {
        const targetLesson = targetLessons[0];
        const targetIdx = prev.findIndex(l => l.id === targetLesson.id);
        
        if (targetLesson.pinned) return prev; // Не можемо змінити закріплену пару

        if (targetLesson.parity === "any") {
          // Якщо в цілі є "any" пара
          if (targetParity === "any") {
            // any -> any: простий swap
            next[targetIdx] = {
              ...targetLesson,
              weekday: movingLesson.weekday,
              pair: movingLesson.pair,
              group: (movingLesson.group ?? (movingLesson as any).speciality ?? "") as string,
              time: timeOf(movingLesson.pair),
            };
            next[srcIdx] = {
              ...movingLesson,
              weekday: to.weekday,
              pair: to.pair,
              group: to.group,
              time: timeOf(to.pair),
            };
          } else {
            // odd/even -> any: змінюємо any на протилежну парність
            const oppositeParity: Parity = targetParity === "odd" ? "even" : "odd";
            next[targetIdx] = {
              ...targetLesson,
              parity: oppositeParity,
            };
            next[srcIdx] = {
              ...movingLesson,
              weekday: to.weekday,
              pair: to.pair,
              group: to.group,
              time: timeOf(to.pair),
              parity: targetParity,
            };
          }
        } else if (movingLesson.parity === "any") {
          // any -> odd/even: змінюємо any на протилежну парність цілі
          const oppositeParity: Parity = targetLesson.parity === "odd" ? "even" : "odd";
          next[srcIdx] = {
            ...movingLesson,
            weekday: to.weekday,
            pair: to.pair,
            group: to.group,
            time: timeOf(to.pair),
            parity: oppositeParity,
          };
        } else if (targetLesson.parity === targetParity) {
          // Однакова парність - swap
          next[targetIdx] = {
            ...targetLesson,
            weekday: movingLesson.weekday,
            pair: movingLesson.pair,
            group: (movingLesson.group ?? (movingLesson as any).speciality ?? "") as string,
            time: timeOf(movingLesson.pair),
          };
          next[srcIdx] = {
            ...movingLesson,
            weekday: to.weekday,
            pair: to.pair,
            group: to.group,
            time: timeOf(to.pair),
          };
        } else {
          // Різна парність (odd vs even) - просто переміщуємо
          next[srcIdx] = {
            ...movingLesson,
            weekday: to.weekday,
            pair: to.pair,
            group: to.group,
            time: timeOf(to.pair),
            parity: targetParity,
          };
        }
      } else {
        // В комірці 2 пари (odd + even) - заборонено, нічого не робимо
        return prev;
      }
      
      return next;
    });
  };



  // drop на пусту зону з конкретизацією парності
  const dropIntoEmpty = (
    e: React.DragEvent,
    coords: {
      weekday: 1 | 2 | 3 | 4 | 5 | 6;
      pair: 1 | 2 | 3 | 4;
      group: string;
    },
    forceParity: Parity
  ) => {
    if (!editable) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    moveLesson(id, coords, forceParity);
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

  const [rowHeights, setRowHeights] = useState<
    Record<string, { odd: number; even: number }>
  >({});

  const baseHalfMin = dense ? 40 : 52; // мінімальна висота однієї половини
  const HALF_GAP_PX = 4;

  useLayoutEffect(() => {
  const raf = requestAnimationFrame(() => {
    // збираємо всі вузли з позначками половинок/any
    const nodes =
      scrollRef.current?.querySelectorAll<HTMLElement>('[data-row][data-half]');

    // тимчасова мапа «рядок -> макс. висоти»
    const tmp: Record<string, { odd: number; even: number; both?: number }> = {};

    nodes?.forEach((el) => {
      const row = el.dataset.row as string; // "weekday-pair"
      const half = el.dataset.half as "odd" | "even" | "both";
      const h = el.scrollHeight;

      const entry = tmp[row] ?? { odd: baseHalfMin, even: baseHalfMin };
      if (half === "odd" || half === "even") {
        entry[half] = Math.max(entry[half], h);
      } else {
        entry.both = Math.max(entry.both ?? 0, h);
      }
      tmp[row] = entry;
    });

    // якщо в рядку є картка any і вона вища за суму половинок,
    // «розкидуємо» надлишок між odd/even
    Object.values(tmp).forEach((v) => {
      if (v.both) {
        const sum = v.odd + v.even + HALF_GAP_PX;
        if (v.both > sum) {
          const extra = v.both - sum;
          v.odd += Math.ceil(extra / 2);
          v.even += Math.floor(extra / 2);
        }
      }
    });

    // у стан зберігаємо тільки odd/even, очищуємо старі записи
    const next: Record<string, { odd: number; even: number }> = {};
    Object.entries(tmp).forEach(([k, v]) => (next[k] = { odd: v.odd, even: v.even }));
    
    // Додаємо базові висоти для рядків без пар (щоб не було 0 висоти)
    WEEKDAYS.forEach(weekday => {
      PAIRS.forEach(pair => {
        const rowKey = `${weekday}-${pair}`;
        if (!next[rowKey]) {
          next[rowKey] = { odd: baseHalfMin, even: baseHalfMin };
        }
      });
    });
    
    setRowHeights(next);
  });

  return () => cancelAnimationFrame(raf);
}, [viewLessons, groups, dense, editingId, baseHalfMin, allLessons.length]); // Додаємо allLessons.length як dependency

  /* ---------- інлайн-редактор (вставляється замість картки) ---------- */
  const renderInlineEditor = () => (
    <div
      className={[
        "glasscard rounded-xl m-1",
        dense ? "p-1.5 text-[12px]" : "p-2 text-sm",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2">
        <input
          className="input hover-lift"
          placeholder="Назва предмету"
          value={editBuf.subject ?? ""}
          onChange={(e) =>
            setEditBuf((prev) => ({ ...prev, subject: e.target.value }))
          }
        />
        <div className="flex gap-2">
          <NiceSelect
            className="flex-1"
            ariaLabel="Викладач"
            placeholder="Викладач"
            value={editBuf.teacher || undefined}
            onChange={(v) => setEditBuf((prev) => ({ ...prev, teacher: v }))}
            options={teachers.map((t) => ({ value: t.name, label: t.name }))}
          />
          <input
            className="input flex-1 hover-lift"
            placeholder="Аудиторія"
            value={editBuf.location ?? ""}
            onChange={(e) =>
              setEditBuf((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <ParityToggle
            value={(editBuf.parity as Parity) ?? "any"}
            onChange={(p) => setEditBuf((prev) => ({ ...prev, parity: p }))}
          />
          <div className="ml-auto flex items-center gap-1">
            <button
              className="btn hover-lift px-2 py-1 rounded-md"
              onClick={commitEdit}
              title="Застосувати"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              className="btn hover-lift px-2 py-1 rounded-md"
              onClick={cancelEdit}
              title="Скасувати"
            >
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
            <button
              className="btn px-2 py-2 rounded-xl"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
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

          {editable && !lessons && (
            <button
              className="btn py-2 px-4 rounded-xl hover-shadow disabled:opacity-50"
              onClick={() => setSnapOpen(true)} // ← було: onClick={saveAll}
              disabled={saving}
              title={user?.id ? "Зберегти зміни" : "Потрібен користувач"}
            >
              {saving ? "Збереження…" : "Зберегти"}
            </button>
          )}
        </div>
      </div>

      <SelectorRow
        level={level}
        setLevel={setLevel}
        course={course}
        setCourse={setCourse}
        parity={parity}
        setParity={setParity}
        dense={dense}
        setDense={setDense}
      />

      {/* верхній скрол */}
      <div
        ref={topScrollRef}
        className="overflow-x-auto scrollbar-stable"
        style={{ height: 16 }}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>

      <div
        ref={scrollRef}
        className="overflow-auto scrollarea scrollbar-stable sticky-left"
      >
        <table className="w-full rounded-xl text-sm relative p-4 border-separate border-spacing-0">
          <thead className="rounded-xl">
            <tr className="text-left">
              <th className="th-sticky th-day sticky-base">День</th>
              <th className="th-sticky th-pair sticky-base">Пара</th>
              <th className="th-sticky th-time sticky-base">Час</th>
              {groups.map((g) => (
                <th
                  key={g}
                  className="py-2 text-[var(--muted)] min-w-[220px] text-center"
                >
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
                  <React.Fragment key={`${weekday}-${pair}`}>
                    <tr key={`${weekday}-${pair}`}>
                      {pairIdx === 0 && (
                        <td
                          className="td-sticky th-day sticky-base"
                          rowSpan={PAIRS.length}
                        >
                          {DAYS[weekday]}
                        </td>
                      )}

                      <td
                        className={`td-sticky th-pair sticky-base ${
                          pairIdx > 0 ? "pair-divider" : ""
                        }`}
                      >
                        {pair}
                      </td>

                      <td
                        className={`td-sticky th-time sticky-base ${
                          pairIdx > 0 ? "pair-divider" : ""
                        }`}
                      >
                        <div className="flex flex-col leading-tight">
                          <span>{TIMES[pair].start}</span>
                          <span className="text-[var(--muted)]">—</span>
                          <span>{TIMES[pair].end}</span>
                        </div>
                      </td>

                      {groups.map((group) => {
                        const cellData = getCell(
                          weekday as 1 | 2 | 3 | 4 | 5 | 6,
                          pair as 1 | 2 | 3 | 4,
                          group
                        );
                        const { oddItems, evenItems, anyItems } = cellData;
                        const isEmpty = oddItems.length === 0 && evenItems.length === 0 && anyItems.length === 0;

                        const dropToHalf = (
                          e: React.DragEvent,
                          half: "top" | "bottom"
                        ) => {
                          if (!editable) return;
                          e.preventDefault();
                          const id = e.dataTransfer.getData("text/plain");
                          if (!id) return;

                          const draggedParity: Parity = half === "top" ? "odd" : "even";
                          
                          // Використовуємо нову логіку moveLesson з примусовою парністю
                          moveLesson(id, { weekday, pair, group }, draggedParity);
                          setDragging(null);
                        };

                        if (editable && isEmpty) {
                          // 100% порожня комірка: 3 кнопки однакового розміру,
                          // а висота блоку — під найбільшу «півклітинку» в рядку
                          const rowKey = `${weekday}-${pair}`;
                          const minOdd = rowHeights[rowKey]?.odd ?? baseHalfMin;
                          const minEven =
                            rowHeights[rowKey]?.even ?? baseHalfMin;
                          const totalMin = minOdd + minEven + HALF_GAP_PX;

                          return (
                            <td
                              key={group}
                              className={`py-2 align-top ${
                                pairIdx > 0 ? "pair-divider" : ""
                              }`}
                            >
                              <div
                                className="flex flex-col items-stretch gap-2 p-1"
                                style={{ minHeight: totalMin }}
                              >
                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "odd"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Непарний тиждень"
                                    title="Додати пару тільки для непарного тижня"
                                    variant="odd"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "odd",
                                      })
                                    }
                                  />
                                </div>

                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "any"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Будь-який тиждень"
                                    title="Додати пару для будь-якого тижня (парного або непарного)"
                                    variant="any"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "any",
                                      })
                                    }
                                  />
                                </div>

                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "even"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Парний тиждень"
                                    title="Додати пару тільки для парного тижня"
                                    variant="even"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "even",
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // НЕ порожньо: вирівнюємо висоти половинок (odd/even) і блоку any
                        return (
                          <td
                            key={group}
                            className={`py-2 align-top ${
                              pairIdx > 0 ? "pair-divider" : ""
                            }`}
                          >
                            <div
                              className="grid grid-rows-2 gap-1 relative"
                              onDragOver={allowDrop}
                            >
                              {anyItems.length > 0 ? (
                                // ANY займає дві половини — задаємо мінімальну сумарну висоту
                                (() => {
                                  const rowKey = `${weekday}-${pair}`;
                                  const minAny =
                                    (rowHeights[rowKey]?.odd ?? baseHalfMin) +
                                    (rowHeights[rowKey]?.even ?? baseHalfMin) +
                                    HALF_GAP_PX;

                                  return (
                                    <div
                                      className="row-span-2"
                                      data-row={rowKey}
                                      data-half="both"
                                      style={{ minHeight: minAny }}
                                      onDragOver={allowDrop}
                                      onDrop={(e) => {
                                        // Drop на any пару - спеціальна логіка
                                        if (!editable) return;
                                        e.preventDefault();
                                        const draggedId = e.dataTransfer.getData("text/plain");
                                        if (!draggedId) return;
                                        
                                        const draggedLesson = allLessons.find(l => l.id === draggedId);
                                        if (!draggedLesson || draggedLesson.pinned) return;
                                        
                                        const anyLesson = anyItems[0];
                                        if (!anyLesson || anyLesson.pinned) return;
                                        
                                        if (draggedLesson.parity === "any") {
                                          // any -> any: простий swap
                                          moveLesson(draggedId, { weekday, pair, group });
                                        } else {
                                          // odd/even -> any: змінюємо any на протилежну парність
                                          const targetParity = draggedLesson.parity === "odd" ? "even" : "odd";
                                          setAllLessons((prev) =>
                                            prev.map((l) => {
                                              if (l.id === draggedId) {
                                                return {
                                                  ...l,
                                                  weekday,
                                                  pair,
                                                  group,
                                                  time: TIMES[pair],
                                                  parity: draggedLesson.parity,
                                                };
                                              }
                                              if (l.id === anyLesson.id) {
                                                return { ...l, parity: targetParity };
                                              }
                                              return l;
                                            })
                                          );
                                        }
                                        setDragging(null);
                                      }}
                                    >
                                      {anyItems.map((l) =>
                                        editingId === l.id ? (
                                          <React.Fragment key={l.id}>
                                            {renderInlineEditor()}
                                          </React.Fragment>
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
                                            className=" hover-lift btn px-2 py-1 m-1 rounded-md"
                                            title="Розщепити на odd/even (odd вгорі)"
                                            onClick={() => {
                                              const a = anyItems[0];
                                              setAllLessons((prev) =>
                                                prev.map((x) =>
                                                  x.id === a.id
                                                    ? { ...x, parity: "even" }
                                                    : x
                                                )
                                              );
                                              createDraftLesson({
                                                weekday,
                                                pair,
                                                group,
                                                parity: "odd",
                                              });
                                            }}
                                          >
                                            <Shuffle className=" hover-lift h-4 w-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <>
                                  {/* TOP (odd) */}
                                  {(() => {
                                    const rowKey = `${weekday}-${pair}`;
                                    const minH =
                                      rowHeights[rowKey]?.odd ?? baseHalfMin;

                                    return (
                                      <div
                                        data-row={rowKey}
                                        data-half="odd"
                                        style={{ minHeight: minH }}
                                        className="rounded-md"
                                        onDragOver={allowDrop}
                                        onDrop={(e) => dropToHalf(e, "top")}
                                      >
                                        {oddItems.length ? (
                                          oddItems.map((l) =>
                                            editingId === l.id ? (
                                              <React.Fragment key={l.id}>
                                                {renderInlineEditor()}
                                              </React.Fragment>
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
                                          <div className="p-1">
                                            <AddSlotButton
                                              label="Непарний тиждень"
                                              title="Додати пару для непарного тижня"
                                              variant="odd"
                                              onClick={() =>
                                                createDraftLesson({
                                                  weekday,
                                                  pair,
                                                  group,
                                                  parity: "odd",
                                                })
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <div className="h-3" />
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* BOTTOM (even) */}
                                  {(() => {
                                    const rowKey = `${weekday}-${pair}`;
                                    const minH =
                                      rowHeights[rowKey]?.even ?? baseHalfMin;

                                    return (
                                      <div
                                        data-row={rowKey}
                                        data-half="even"
                                        style={{ minHeight: minH }}
                                        className="rounded-md"
                                        onDragOver={allowDrop}
                                        onDrop={(e) => dropToHalf(e, "bottom")}
                                      >
                                        {evenItems.length ? (
                                          evenItems.map((l) =>
                                            editingId === l.id ? (
                                              <React.Fragment key={l.id}>
                                                {renderInlineEditor()}
                                              </React.Fragment>
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
                                          <div className="p-1">
                                            <AddSlotButton
                                              label="Парний тиждень"
                                              title="Додати пару для парного тижня"
                                              variant="even"
                                              onClick={() =>
                                                createDraftLesson({
                                                  weekday,
                                                  pair,
                                                  group,
                                                  parity: "even",
                                                })
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <div className="h-3" />
                                        )}
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm text-[var(--muted)]">
          Показувати колонок:
        </label>
        <NiceSelect
          className="ml-2"
          value={String(pageSize)}
          onChange={(v) => {
            setPageSize(Number(v));
            setPage(0);
          }}
          options={[4, 6, 8, 10].map((n) => ({
            value: String(n),
            label: String(n),
          }))}
        />
      </div>

      {snapOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => !snapBusy && setSnapOpen(false)}
            />
            <div
              className="glasscard relative z-10 w-[min(560px,92vw)] max-h-[85vh] overflow-auto p-5 rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="snap-title"
            >
              <div id="snap-title" className="text-lg font-semibold mb-3">
                Зберегти до Архіву
              </div>

              <label className="block text-sm text-[var(--muted)] mb-1">
                Назва
              </label>
              <input
                className="input w-full mb-3"
                placeholder="Напр. W36 — після правок"
                value={snapTitle}
                onChange={(e) => setSnapTitle(e.target.value)}
                disabled={snapBusy}
              />

              <label className="block text-sm text-[var(--muted)] mb-1">
                Коментар
              </label>
              <textarea
                className="input w-full min-h-[96px]"
                placeholder="Коротко опиши, що змінили"
                value={snapComment}
                onChange={(e) => setSnapComment(e.target.value)}
                disabled={snapBusy}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="btn px-4 py-2 rounded-xl"
                  onClick={() => setSnapOpen(false)}
                  disabled={snapBusy}
                >
                  Скасувати
                </button>
                <button
                  className="btn px-4 py-2 rounded-xl"
                  onClick={handleConfirmSnapshot}
                  disabled={
                    snapBusy || !snapTitle.trim() || !snapComment.trim()
                  }
                  title={
                    !snapTitle.trim() || !snapComment.trim()
                      ? "Заповни назву і коментар"
                      : "Зберегти до Архіву"
                  }
                >
                  {snapBusy ? "Зберігаємо…" : "Підтвердити"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FacultyScheduleTable;

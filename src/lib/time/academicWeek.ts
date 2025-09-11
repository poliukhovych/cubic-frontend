// src/lib/time/academicWeek.ts

/** Поточна дата */
export function now(): Date {
  return new Date();
}

/** Понеділок 00:00 локального тижня для довільної дати */
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0=Нд...6=Сб
  const diffToMonday = (day + 6) % 7;
  x.setDate(x.getDate() - diffToMonday);
  return x;
}

/** Наступний понеділок після дати d (не включно, якщо d — понеділок) */
export function nextMonday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0..6
  const add = (8 - (day || 7)) % 7 || 7;
  x.setDate(x.getDate() + add);
  return x;
}

/** 1 вересня академічного року для довільної дати (якщо місяць < вересня — попередній рік) */
export function getAcademicSept1(forDate: Date): Date {
  const y = forDate.getMonth() >= 8 ? forDate.getFullYear() : forDate.getFullYear() - 1;
  const s = new Date(y, 8, 1);
  s.setHours(0, 0, 0, 0);
  return s;
}

/**
 * Понеділок ПЕРШОГО навчального тижня відносно довільної дати:
 * - якщо 1 вересня ПН–ПТ → startOfWeek(1 вересня)
 * - якщо СБ/НД → nextMonday(1 вересня)
 */
export function getFirstTeachingMonday(forDate: Date): Date {
  const sept1 = getAcademicSept1(forDate);
  const day = sept1.getDay(); // 0=Нд,6=Сб
  if (day === 0 || day === 6) return nextMonday(sept1);
  return startOfWeek(sept1);
}

/** clamp helper */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * ✅ Базова функція: індекс тижня (1-based) відносно ЗАДАНОГО старту семестру.
 * Якщо date < startMonday → повертає 1 (щоб не було 0/негативних).
 */
export function getWeekIndexFromStart(
  startMonday: Date,
  date: Date,
  totalWeeks?: number
): number {
  const d0 = startOfWeek(startMonday); // гарантія що це саме понеділок 00:00
  const dW = startOfWeek(date);
  const diffMs = dW.getTime() - d0.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  let idx = weeks + 1; // перший тиждень = 1
  if (idx < 1) idx = 1;
  if (totalWeeks && totalWeeks > 0) idx = clamp(idx, 1, totalWeeks);
  return idx;
}

/**
 * Зручний варіант: якщо старт не передано — беремо відносно "сьогоднішнього" семестру.
 * (Тобто старт = перший навчальний понеділок для поточного академічного року)
 */
export function getWeekIndex(
  date: Date = now(),
  opts?: { startMonday?: Date; totalWeeks?: number }
): number {
  const start = opts?.startMonday ?? getFirstTeachingMonday(now());
  return getWeekIndexFromStart(start, date, opts?.totalWeeks);
}

/** "odd"/"even" з урахуванням того ж самого старту */
export function getParity(
  date: Date = now(),
  opts?: { startMonday?: Date }
): "odd" | "even" {
  const idx = getWeekIndex(date, { startMonday: opts?.startMonday });
  return idx % 2 === 1 ? "odd" : "even";
}


/** Додаток днів до дати (не мутує вхідну) */
export function addDays(date: Date, days: number): Date {
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
}

/** Старт (понеділок) для вказаного індексу тижня (1-based) */
export function getWeekStartFromIndex(startMonday: Date, weekIndex: number): Date {
  const idx = Math.max(1, Math.floor(weekIndex));
  return addDays(startMonday, (idx - 1) * 7);
}

/** Масив 7 дат цього тижня (Пн..Нд) */
export function getWeekDates(startMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startMonday, i));
}

/** Короткий формат дати: DD.MM */
export function formatDM(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

/** Діапазон тижня: DD.MM – DD.MM (з роком за бажанням) */
export function formatWeekRange(weekStart: Date, withYear = false): string {
  const weekEnd = addDays(weekStart, 6);
  const left = formatDM(weekStart);
  const right = formatDM(weekEnd);
  if (!withYear) return `${left} – ${right}`;
  return `${left}.${weekStart.getFullYear()} – ${right}.${weekEnd.getFullYear()}`;
}


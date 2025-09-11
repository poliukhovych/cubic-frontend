// src/lib/time/academicWeek.ts

/** Поточна дата */
export function now(): Date {
    return new Date();
}

/** Початок тижня (ПОНЕДІЛОК 00:00) */
function startOfWeek(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const day = x.getDay(); // 0=Нд...6=Сб
    const diffToMonday = (day + 6) % 7;
    x.setDate(x.getDate() - diffToMonday);
    return x;
}

/** Наступний понеділок після дати d (не включно, якщо d — понеділок) */
function nextMonday(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const day = x.getDay(); // 0..6
    const add = (8 - (day || 7)) % 7 || 7;
    x.setDate(x.getDate() + add);
    return x;
}

/** 1 вересня академічного року для довільної дати (якщо місяць < вересня — беремо попередній рік) */
export function getAcademicSept1(forDate: Date): Date {
    const y = forDate.getMonth() >= 8 ? forDate.getFullYear() : forDate.getFullYear() - 1;
    const s = new Date(y, 8, 1);
    s.setHours(0, 0, 0, 0);
    return s;
}

/**
 * Понеділок ПЕРШОГО навчального тижня:
 * - якщо 1 вересня ПН–ПТ → startOfWeek(1 вересня)
 * - якщо СБ/НД → nextMonday(1 вересня)
 */
export function getFirstTeachingMonday(forDate: Date): Date {
    const sept1 = getAcademicSept1(forDate);
    const day = sept1.getDay(); // 0=Нд,6=Сб
    if (day === 0 || day === 6) return nextMonday(sept1);
    return startOfWeek(sept1);
}

/** Номер тижня (1-based) відносно першого навчального понеділка */
export function getWeekIndex(date: Date = now()): number {
    const d0 = getFirstTeachingMonday(date);
    const dW = startOfWeek(date);
    const diffMs = dW.getTime() - d0.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    // Перший навчальний тиждень має номер 1
    return weeks + 1;
}

/** true = непарний (week #1) */
export function isOddWeek(date: Date = now()): boolean {
    const idx = getWeekIndex(date);
    return idx % 2 === 1;
}

/** "odd" | "even" */
export function currentParity(date: Date = now()): "odd" | "even" {
    return isOddWeek(date) ? "odd" : "even";
}

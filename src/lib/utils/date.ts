//src/lib/utils/date.ts
export function academicYearStart(d: Date = new Date()): Date {
  const year = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; // вересень = 8
  return new Date(year, 8, 1); // 1 вересня
}

/** Рахуємо тиждень від понеділка, 0-й тиждень починається з понеділка тижня, де лежить 1 вересня */
export function weeksSinceStart(date = new Date()): number {
  const start = academicYearStart(date);
  const startMonday = start.getDay() === 0
    ? new Date(start.getFullYear(), start.getMonth(), start.getDate() - 6)
    : new Date(start.getFullYear(), start.getMonth(), start.getDate() - (start.getDay() - 1));
  const ms = date.setHours(0,0,0,0) - startMonday.setHours(0,0,0,0);
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}
// Понеділок як початок тижня
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // 0=Нд, 1=Пн, ..., 6=Сб
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7; // скільки днів відмотати до понеділка
  date.setDate(date.getDate() - diffToMonday);
  return date;
}

function nextMonday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0..6
  const add = (8 - (day || 7)) % 7 || 7; // скільки днів додати до наступного понеділка
  date.setDate(date.getDate() + add);
  return date;
}

// Для довільної календарної дати повертаємо 1 вересня відповідного академічного року
function getAcademicSept1(forDate: Date): Date {
  const y = forDate.getMonth() >= 8 /* вересень=8 */ ? forDate.getFullYear()
                                                     : forDate.getFullYear() - 1;
  const sept1 = new Date(y, 8, 1);
  sept1.setHours(0, 0, 0, 0);
  return sept1;
}

export function isEvenWeek(date = new Date()): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // 1) Визначаємо 1 вересня академічного року
  const sept1 = getAcademicSept1(d);
  const sept1Day = sept1.getDay(); // 0=Нд, 6=Сб

  // 2) Старт парного відліку:
  //    - якщо 1 вересня будень → тиждень, що містить 1 вересня
  //    - якщо вихідні → наступний понеділок після 1 вересня
  const evenWeekStart = (sept1Day === 0 || sept1Day === 6)
    ? nextMonday(sept1)
    : startOfWeek(sept1);

  // 3) Скільки повних тижнів від evenWeekStart до поточної дати
  const targetWeekStart = startOfWeek(d);
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const diffWeeks = Math.floor((targetWeekStart.getTime() - evenWeekStart.getTime()) / MS_WEEK);

  // 4) 0-й тиждень (diffWeeks === 0) — парний; далі чергуються
  return diffWeeks % 2 === 0;
}


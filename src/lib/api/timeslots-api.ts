// src/lib/api/timeslots-api.ts

import { api } from "@/lib/api";

/**
 * Те, що повертає бекенд:
 * {
 *   timeslotId: 26,
 *   day: 3,                // 1..5
 *   frequency: "ALL" | "ODD" | "EVEN"
 * }
 */
export interface RawTimeslotDto {
  timeslotId: number;
  day: number;
  frequency: "ALL" | "ODD" | "EVEN";
}

/**
 * Те, що очікує фронт (FacultyScheduleTable)
 */
export interface TimeslotInfo {
  id: number;
  weekday: 1 | 2 | 3 | 4 | 5 | 6;
  pair: 1 | 2 | 3 | 4;
  parity: "any" | "even" | "odd";
  time: { start: string; end: string };
}

// Базові часи пар — ті ж, що у FacultyScheduleTable
const TIMES: Record<1 | 2 | 3 | 4, { start: string; end: string }> = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
};

/**
 * Завантажує таймслоти з бекенду і будує мапу:
 * timeslotId → { weekday, pair, parity, time }
 *
 * Припущення:
 * - 5 днів * 4 пари * 3 варіанти парності = 60 слотів
 * - всередині дня 12 слотів, кожні 3 слоти відповідають одній парі:
 *   1..3 → пара 1 (ALL/ODD/EVEN)
 *   4..6 → пара 2
 *   7..9 → пара 3
 *   10..12 → пара 4
 */
export async function fetchTimeslotsMapApi(): Promise<
  Map<number, TimeslotInfo>
> {
  try {
    const response = await api.get<{ timeslots: RawTimeslotDto[] }>(
      "/timeslots/"
    );

    const list = response.timeslots ?? [];
    const map = new Map<number, TimeslotInfo>();

    list.forEach((raw) => {
      const id = Number(raw.timeslotId);
      if (!Number.isFinite(id)) return;

      // 12 слотів на день, кожні 3 — це одна пара
      const idxInDay = (id - 1) % 12; // 0..11
      const pairIndex = Math.floor(idxInDay / 3); // 0..3
      const pair = (pairIndex + 1) as 1 | 2 | 3 | 4;

      const weekday = (raw.day || 1) as 1 | 2 | 3 | 4 | 5 | 6;

      const parity: "any" | "odd" | "even" =
        raw.frequency === "ALL"
          ? "any"
          : raw.frequency === "ODD"
          ? "odd"
          : "even";

      map.set(id, {
        id,
        weekday,
        pair,
        parity,
        time: TIMES[pair],
      });
    });

    return map;
  } catch (err) {
    console.error("Failed to fetch timeslots:", err);
    return new Map();
  }
}

/**
 * Fallback mapping, якщо бекенд недоступний.
 * Логіка така сама, як і у fetchTimeslotsMapApi,
 * але без запиту — просто генеруємо 60 слотів.
 */
export function getDefaultTimeslotMap(): Map<number, TimeslotInfo> {
  const map = new Map<number, TimeslotInfo>();

  let id = 1;
  for (let weekday = 1; weekday <= 5; weekday++) {
    for (let pair = 1; pair <= 4; pair++) {
      for (const parity of ["any", "even", "odd"] as const) {
        map.set(id, {
          id,
          weekday: weekday as 1 | 2 | 3 | 4 | 5,
          pair: pair as 1 | 2 | 3 | 4,
          parity,
          time: TIMES[pair as 1 | 2 | 3 | 4],
        });
        id++;
      }
    }
  }

  return map;
}

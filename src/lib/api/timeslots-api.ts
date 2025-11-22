// src/lib/api/timeslots-api.ts

import { api } from "@/lib/api";

export interface TimeslotInfo {
  id: number;
  weekday: 1 | 2 | 3 | 4 | 5 | 6;
  pair: 1 | 2 | 3 | 4;
  parity: "any" | "even" | "odd";
  time: { start: string; end: string };
}

export async function fetchTimeslotsMapApi(): Promise<
  Map<number, TimeslotInfo>
> {
  try {
    const response = await api.get<{ timeslots: TimeslotInfo[] }>(
      "/api/timeslots/"
    );
    const map = new Map<number, TimeslotInfo>();
    (response.timeslots || []).forEach((ts) => {
      map.set(ts.id, ts);
    });
    return map;
  } catch (err) {
    console.error("Failed to fetch timeslots:", err);
    return new Map();
  }
}

/**
 * Fallback mapping якщо бекенд не готовий
 * timeslotId 1-60 → weekday/pair/parity
 * Припускаємо 5 днів * 4 пари * 3 варіанти парності = 60 слотів
 */
export function getDefaultTimeslotMap(): Map<number, TimeslotInfo> {
  const map = new Map<number, TimeslotInfo>();

  const TIMES: Record<1 | 2 | 3 | 4, { start: string; end: string }> = {
    1: { start: "08:30", end: "10:05" },
    2: { start: "10:25", end: "12:00" },
    3: { start: "12:10", end: "13:45" },
    4: { start: "14:00", end: "15:35" },
  };

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

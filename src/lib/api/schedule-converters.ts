// src/lib/api/schedule-converters.ts
import type { Assignment } from "./students-api";
import type { Lesson } from "@/types/schedule";
import { fetchTimeslotsMapApi, getDefaultTimeslotMap } from "./timeslots-api";
import { fetchGroupsApi } from "./groups-api";
import { fetchCoursesApi } from "./courses-api";

/**
 * Конвертує масив Assignment з бекенду в Lesson для фронтенду
 */
export async function convertAssignmentsToLessons(
  assignments: Assignment[]
): Promise<Lesson[]> {
  // Завантажуємо необхідні довідники
  const [timeslotsMap, groups, courses] = await Promise.all([
    fetchTimeslotsMapApi().catch(() => getDefaultTimeslotMap()),
    fetchGroupsApi().catch(() => []),
    fetchCoursesApi().catch(() => []),
  ]);

  // Створюємо мапи для швидкого пошуку
  const groupsMap = new Map(groups.map((g) => [g.id, g]));
  const coursesMap = new Map(courses.map((c) => [c.id, c]));

  const lessons: Lesson[] = [];

  for (const assignment of assignments) {
    // Отримуємо інформацію про таймслот
    const timeslot = timeslotsMap.get(assignment.timeslotId);
    if (!timeslot) {
      console.warn(`Timeslot ${assignment.timeslotId} not found`);
      continue;
    }

    // Отримуємо інформацію про групу
    const group = groupsMap.get(assignment.groupId);
    const groupName = group?.name || assignment.groupId;

    // Визначаємо підгрупу (якщо subgroupNo > 0, це підгрупа)
    const subgroup = assignment.subgroupNo > 0 
      ? (assignment.subgroupNo === 1 ? "a" : "b") as "a" | "b"
      : null;

    // Отримуємо інформацію про курс
    const course = coursesMap.get(assignment.courseId);
    const subject = course?.title || assignment.courseId;

    // Формуємо локацію
    const location = assignment.roomName || (assignment.roomId ? `Ауд. ${assignment.roomId}` : "Онлайн");

    lessons.push({
      id: assignment.assignmentId,
      weekday: timeslot.weekday,
      time: timeslot.time,
      subject,
      location,
      group: {
        id: assignment.groupId,
        name: groupName,
        subgroup,
      },
      parity: timeslot.parity,
      meetingUrl: undefined, // TODO: додати коли буде в бекенді
    });
  }

  return lessons;
}

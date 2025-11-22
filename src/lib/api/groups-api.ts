// src/lib/api/groups-api.ts

import { api } from "@/lib/api";
import type { Group } from "@/types/students";

// Бекенд: GET /api/groups/
// {
//   "groups": [
//     { "name": "ІПЗ-31", "size": 28, "groupId": "..." },
//     ...
//   ],
//   "total": 4
// }
export interface BackendGroup {
  groupId: string;
  name: string;
  size?: number | null;
}

export interface GroupsListResponse {
  groups: BackendGroup[];
  total: number;
}

// Backend не повертає type/course – ми їх НЕ вигадуємо.
// Для типів TS робимо явний каст, а в UI для курсів використовуємо тільки id+name.
function mapBackendGroup(g: BackendGroup): Group {
  const base = {
    id: g.groupId,
    name: g.name,
    size: g.size ?? undefined,
  } as Partial<Group> & Pick<Group, "id" | "name" | "size">;

  return base as Group;
}

export async function fetchGroupsApi(): Promise<Group[]> {
  const data = await api.get<GroupsListResponse>("/api/groups/");
  return data.groups.map(mapBackendGroup);
}

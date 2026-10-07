// src/lib/api/groups-api.ts

import { api } from "@/lib/api";
import type { Group, GroupCreateRequest, GroupUpdateRequest } from "@/types/students";

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
  type?: "bachelor" | "master";
  course?: number;
}

export interface GroupsListResponse {
  groups: BackendGroup[];
  total: number;
}

// Backend не повертає type/course – ми їх НЕ вигадуємо.
// Для типів TS робимо явний каст, а в UI для курсів використовуємо тільки id+name.
function mapBackendGroup(g: BackendGroup): Group {
  return {
    id: g.groupId,
    name: g.name,
    type: g.type ?? "bachelor",
    course: typeof g.course === "number" ? g.course : 1,
    size: g.size ?? undefined,
  };
}

export async function fetchGroupsApi(): Promise<Group[]> {
  const data = await api.get<GroupsListResponse>("/groups/");
  return data.groups.map(mapBackendGroup);
}

export async function createGroupApi(payload: GroupCreateRequest): Promise<void> {
  await api.post("/groups/", payload);
}

export async function updateGroupApi(
  id: string,
  payload: GroupUpdateRequest
): Promise<void> {
  await api.put(`/groups/${id}`, payload);
}

export async function deleteGroupApi(id: string): Promise<void> {
  await api.delete(`/groups/${id}`);
}

// src/lib/api/rooms-api.ts

import { api } from "@/lib/api";

export interface Room {
  room_id: string;
  id?: string;
  name: string;
  capacity: number;
}

export interface RoomsListResponse {
  rooms: Room[];
  total: number;
}

export async function fetchRoomsApi(): Promise<RoomsListResponse> {
  const data = await api.get<RoomsListResponse>("/rooms/");
  return data;
}

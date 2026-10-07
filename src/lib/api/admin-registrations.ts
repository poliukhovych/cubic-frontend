// src/lib/api/admin-registrations.ts

import { api } from "@/lib/api";
import type {
  RegistrationRequest,
  RegistrationUpdateRequest,
  RegistrationActionResponse,
} from "@/types/registrations";

// DTO з бекенду (app/schemas/registration.py -> RegistrationRequestOut)
type RegistrationStatusDto = "pending" | "approved" | "rejected";

interface RegistrationRequestOutDto {
  requestId: string; // camelCase alias
  request_id: string; // snake_case (fallback)
  email: string;
  firstName: string; // camelCase alias
  first_name: string; // snake_case (fallback)
  lastName: string; // camelCase alias
  last_name: string; // snake_case (fallback)
  patronymic?: string | null;
  requestedRole: "student" | "teacher"; // camelCase alias
  requested_role: "student" | "teacher"; // snake_case (fallback)
  status: RegistrationStatusDto;
  createdAt: string; // camelCase alias
  created_at: string; // snake_case (fallback)
  adminNote?: string | null;
  admin_note?: string | null;

  // можливі додаткові поля
  groupId?: string | null; // camelCase alias
  group_id?: string | null; // snake_case (fallback)
  groupName?: string | null; // camelCase alias
  group_name?: string | null; // snake_case (fallback)
  subjects?: string[] | null;
  fullName?: string; // computed field from backend
}

// Мапінг backend DTO -> frontend RegistrationRequest
function mapDtoToRegistration(dto: RegistrationRequestOutDto): RegistrationRequest {
  // Використовуємо fullName з бекенду, якщо є, інакше формуємо самі
  let fullName = dto.fullName;
  if (!fullName) {
    const firstName = dto.firstName || dto.first_name || "";
    const lastName = dto.lastName || dto.last_name || "";
    const patronymic = dto.patronymic || "";
    const parts = [firstName, patronymic, lastName].filter(Boolean);
    fullName = parts.join(" ").trim();
  }

  return {
    id: dto.requestId || dto.request_id,
    email: dto.email,
    fullName,
    role: dto.requestedRole || dto.requested_role,
    status: dto.status,
    submittedAt: dto.createdAt || dto.created_at,
    groupId: (dto.groupId || dto.group_id) ?? undefined,
    groupName: (dto.groupName || dto.group_name) ?? undefined,
    subjects: dto.subjects ?? undefined,
  };
}

// ---- API-функції ----

// Список заявок
export async function fetchAdminRegistrations(): Promise<RegistrationRequest[]> {
  const data = await api.get<RegistrationRequestOutDto[]>("/admin/registrations/");
  return data.map(mapDtoToRegistration);
}

// Оновлення заявки (якщо використовується редагування полів)
export async function updateRegistration(
  id: string,
  payload: RegistrationUpdateRequest,
): Promise<RegistrationRequest> {
  // Конвертуємо frontend формат в backend формат
  const backendPayload: Record<string, unknown> = {};
  
  console.log('📤 Оновлення заявки, вхідні дані:', payload);
  
  if (payload.fullName !== undefined) {
    // Розбиваємо fullName на first_name, last_name, patronymic
    // Формат: "Прізвище Ім'я По-батькові" (український порядок)
    const parts = payload.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      backendPayload.lastName = parts[0];  // Перше слово - прізвище
      backendPayload.firstName = parts[1]; // Друге слово - ім'я
      if (parts.length > 2) {
        backendPayload.patronymic = parts.slice(2).join(" ") || null; // Решта - по-батькові
      } else {
        backendPayload.patronymic = null;
      }
    } else if (parts.length === 1) {
      // Якщо тільки одне слово, вважаємо його прізвищем
      backendPayload.lastName = parts[0];
      backendPayload.firstName = "";
      backendPayload.patronymic = null;
    }
  }
  
  if (payload.email !== undefined) {
    backendPayload.email = payload.email;
  }
  
  if (payload.groupId !== undefined) {
    backendPayload.groupId = payload.groupId || null;
  }
  
  // subjects не підтримується в UpdateRegistrationRequest на бекенді
  // тому не відправляємо його
  
  console.log('📤 Відправка на бекенд:', backendPayload);
  
  const dto = await api.put<RegistrationRequestOutDto>(
    `/admin/registrations/${id}`,
    backendPayload,
  );
  return mapDtoToRegistration(dto);
}

// Схвалити заявку
export async function approveRegistration(
  id: string,
  role?: "student" | "teacher",
  adminNote?: string,
): Promise<RegistrationActionResponse> {
  const body: Record<string, unknown> = {};
  if (role) {
    body.role = role;
  }
  if (adminNote) {
    body.adminNote = adminNote;
  }
  
  const dto = await api.patch<RegistrationRequestOutDto>(
    `/admin/registrations/${id}/approve`,
    body,
  );
  const reg = mapDtoToRegistration(dto);
  return {
    success: true,
    message: `Заявку ${reg.fullName} схвалено`,
  };
}

// Відхилити заявку
export async function rejectRegistration(
  id: string,
  reason?: string,
): Promise<RegistrationActionResponse> {
  const body: Record<string, unknown> = {};
  if (reason) {
    body.reason = reason;
  }
  
  const dto = await api.patch<RegistrationRequestOutDto>(
    `/admin/registrations/${id}/reject`,
    body,
  );
  const reg = mapDtoToRegistration(dto);
  return {
    success: true,
    message: `Заявку ${reg.fullName} відхилено`,
  };
}

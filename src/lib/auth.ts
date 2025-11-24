/**
 * Authentication utilities for Google OAuth and JWT handling
 */
import { API_BASE } from './api';

export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  needs_role_selection: boolean;
}

const API_BASE_URL = API_BASE;

/**
 * Authenticate user with Google ID token
 */
export async function authenticateWithGoogle(
  idToken: string,
  role?: UserRole
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_token: idToken,
      role: role,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Authentication failed');
  }

  const data: AuthResponse = await response.json();
  
  // Save token to localStorage
  // Backend uses 'accessToken' (camelCase) in JSON response
  const token = (data as any).accessToken || (data as any).access_token;
  if (!token) {
    throw new Error('No access token in response');
  }
  
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

/**
 * Select role for existing user
 */
export async function selectRole(role: UserRole): Promise<AuthResponse> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/select-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Role selection failed');
  }

  const data: AuthResponse = await response.json();
  
  // Update token and user in localStorage
  // Backend uses 'accessToken' (camelCase) in JSON response
  const newToken = (data as any).accessToken || (data as any).access_token;
  if (!newToken) {
    throw new Error('No access token in response');
  }
  
  localStorage.setItem('access_token', newToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication expired');
    }
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get user information');
  }

  return await response.json();
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole | UserRole[]): boolean {
  const user = getStoredUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Admin login with username/password
 */
export async function adminLogin(username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let detail = 'Admin login failed';
    try { const err = await response.json(); detail = err.detail || detail; } catch {}
    throw new Error(detail);
  }

  const data: AuthResponse = await response.json();
  
  // Backend uses 'accessToken' (camelCase) in JSON response
  const token = (data as any).accessToken || (data as any).access_token;
  if (!token) {
    throw new Error('No access token in response');
  }
  
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

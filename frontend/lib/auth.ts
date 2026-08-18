export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cf_token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('cf_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setAuth(token: string, user: User) {
  localStorage.setItem('cf_token', token);
  localStorage.setItem('cf_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('cf_token');
  localStorage.removeItem('cf_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

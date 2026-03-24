/**
 * Utility functions for session storage management.
 *
 * Security note: tokens are stored in sessionStorage (cleared on tab close)
 * rather than localStorage to reduce XSS exposure surface.
 * For higher security, prefer HttpOnly cookies via the backend.
 */

export const saveSession = (token: string, user: object): void => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const getToken = (): string | null => sessionStorage.getItem('token');

export const getUser = <T>(): T | null => {
  const raw = sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

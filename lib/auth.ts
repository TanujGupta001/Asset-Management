const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export interface AuthSession {
  username: string;
  loggedInAt: number;
}

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSessionToken(username: string): string {
  const payload: AuthSession = {
    username,
    loggedInAt: Date.now(),
  };
  return btoa(JSON.stringify(payload));
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token)) as AuthSession;
    if (!payload.username || !payload.loggedInAt) return false;
    const ageHours = (Date.now() - payload.loggedInAt) / (1000 * 60 * 60);
    return ageHours < 24 * 7;
  } catch {
    return false;
  }
}

export function getSessionUsername(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token)) as AuthSession;
    return payload.username || null;
  } catch {
    return null;
  }
}

export const SESSION_KEY = 'itam-session';

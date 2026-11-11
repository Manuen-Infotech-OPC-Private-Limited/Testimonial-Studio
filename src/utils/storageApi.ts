import { AuthUser, DesignRecord } from '../types/studio';
import { TEMPLATES, SAMPLE_DESIGNS } from '../data/defaultTemplates';
import { getTemplateThumbnailUrl } from './router';

export interface BackendHealth {
  ok: boolean;
  dbConnected: boolean;
  status: string;
}

export interface AuthResponse {
  user: AuthUser;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';
const LEGACY_TOKEN_KEY = 'ts_auth_token';
const SESSION_HINT_KEY = 'ts_has_session';

export function hasSessionHint(): boolean {
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSessionHint(active: boolean): void {
  try {
    if (active) {
      window.localStorage.setItem(SESSION_HINT_KEY, '1');
    } else {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAuthToken(): void {
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errBody = await res.json();
      message = errBody?.message || errBody?.error || message;
    } catch {
      // ignore non-JSON error body
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as T;
}

export function buildSampleSeedRecords(): DesignRecord[] {
  return SAMPLE_DESIGNS.map((s) => ({
    id: s.id,
    title: s.title,
    templateId: s.templateId,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    thumbnail: getTemplateThumbnailUrl(s.templateId),
    data: JSON.parse(JSON.stringify(TEMPLATES[s.templateId])),
  }));
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    return await apiRequest<BackendHealth>('/api/health');
  } catch {
    return {
      ok: false,
      dbConnected: false,
      status: 'offline',
    };
  }
}

export async function signUpWithMobile(
  name: string,
  mobileNumber: string,
  password: string
): Promise<AuthResponse> {
  clearAuthToken();
  const res = await apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, mobileNumber, password }),
  });
  setSessionHint(true);
  return res;
}

export async function signInWithMobile(
  mobileNumber: string,
  password: string
): Promise<AuthResponse> {
  clearAuthToken();
  const res = await apiRequest<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ mobileNumber, password }),
  });
  setSessionHint(true);
  return res;
}

export async function signOutSession(): Promise<void> {
  clearAuthToken();
  setSessionHint(false);
  try {
    await fetch(`${API_BASE}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
    });
  } catch {
    // ignore network errors on signout
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  clearAuthToken();
  try {
    const res = await apiRequest<{ authenticated: boolean; user: AuthUser | null }>(
      '/api/auth/session'
    );
    if (res.authenticated && res.user) {
      setSessionHint(true);
      return res.user;
    }
    setSessionHint(false);
    return null;
  } catch {
    return null;
  }
}

export async function incrementDownloadCount(): Promise<AuthUser> {
  const res = await apiRequest<{ downloadCount: number; user: AuthUser }>(
    '/api/auth/downloads/increment',
    { method: 'POST' }
  );
  return res.user;
}

export async function initializeDesigns(): Promise<DesignRecord[]> {
  return await apiRequest<DesignRecord[]>('/api/designs');
}

export async function fetchAllDesigns(): Promise<DesignRecord[]> {
  return await apiRequest<DesignRecord[]>('/api/designs');
}

export async function fetchDesignById(id: string): Promise<DesignRecord | null> {
  try {
    return await apiRequest<DesignRecord>(`/api/designs/${encodeURIComponent(id)}`);
  } catch (err: any) {
    if (err?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function persistDesign(design: DesignRecord): Promise<DesignRecord> {
  return await apiRequest<DesignRecord>('/api/designs', {
    method: 'POST',
    body: JSON.stringify(design),
  });
}

export async function removeDesign(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/designs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function removeAllDesigns(): Promise<void> {
  try {
    await apiRequest<{ deletedCount: number }>('/api/designs', {
      method: 'DELETE',
    });
  } catch (err: any) {
    // Fallback if running API process has not reloaded DELETE /api/designs yet
    if (err?.status === 404) {
      const existing = await fetchAllDesigns();
      await Promise.all(existing.map((d) => removeDesign(d.id)));
      return;
    }
    throw err;
  }
}

export async function resetSampleDesignsInDb(): Promise<DesignRecord[]> {
  return await apiRequest<DesignRecord[]>('/api/designs/seed', {
    method: 'POST',
    body: JSON.stringify({ designs: buildSampleSeedRecords() }),
  });
}

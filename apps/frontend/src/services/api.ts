import type { AuthResponse, Script } from '../types';

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(msg ?? `HTTP ${res.status}`);
  }
  return res.json();
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

// ── Auth ────────────────────────────────────────────────────────────────────

export const register = (email: string, password: string) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// ── Scripts ─────────────────────────────────────────────────────────────────

export const getScripts = () => request<Script[]>('/scripts');

export const getScript = (id: string) => request<Script>(`/scripts/${id}`);

export interface CreateScriptData {
  name: string;
  content: string;
  description?: string;
  url?: string;
}

export const createScript = (token: string, data: CreateScriptData) =>
  request<Script>('/scripts', {
    method: 'POST',
    headers: bearer(token),
    body: JSON.stringify(data),
  });

export interface UpdateScriptData {
  name?: string;
  description?: string;
  url?: string;
}

export const updateScript = (token: string, id: string, data: UpdateScriptData) =>
  request<Script>(`/scripts/${id}`, {
    method: 'PATCH',
    headers: bearer(token),
    body: JSON.stringify(data),
  });

export const reanalyzeScript = (token: string, id: string) =>
  request<Script>(`/scripts/${id}/reanalyze`, {
    method: 'POST',
    headers: bearer(token),
  });

export const analyzeScript = (url: string) =>
  request('/scripts/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

export interface FetchUrlResult {
  url: string;
  content: string;
  suggestedName?: string;
}

export const fetchScriptFromUrl = (token: string, url: string) =>
  request<FetchUrlResult>('/scripts/fetch-url', {
    method: 'POST',
    headers: bearer(token),
    body: JSON.stringify({ url }),
  });

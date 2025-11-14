import { AuthResponse, ChatResponse, ChatMessage, PortfolioPayload } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

type RequestOptions = {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { method = 'GET', token, body } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    cache: 'no-store',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      // ignore body parsing errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password },
    }),
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: (token: string) =>
    apiRequest<AuthResponse['user']>('/auth/me', {
      method: 'GET',
      token,
    }),
};

export const portfolioApi = {
  get: (token: string) =>
    apiRequest<PortfolioPayload>('/portfolio', { token }),
  sync: (token: string) =>
    apiRequest<PortfolioPayload>('/portfolio/sync', {
      method: 'POST',
      token,
    }),
};

export const chatApi = {
  list: (token: string) =>
    apiRequest<ChatMessage[]>('/chat/messages', { token }),
  send: (token: string, message: string) =>
    apiRequest<ChatResponse>('/chat/messages', {
      method: 'POST',
      token,
      body: { message },
    }),
};


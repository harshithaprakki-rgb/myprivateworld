export interface UserProfile {
  diaryTitle: string;
  diarySubtitle: string;
  ownerName: string;
  bio: string;
  coverTexture: 'leather' | 'parchment' | 'botanical' | 'velvet';
  accentColor: string;
  fontStyle: 'cormorant' | 'caveat' | 'sans';
  ambientSound: 'none' | 'music_box' | 'rain' | 'fireplace';
}

export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profile: UserProfile;
  createdAt: string;
}

export interface ScrapbookPage {
  id: string;
  userId: string;
  pageNumber: number;
  chapterTitle: string;
  title: string;
  date: string;
  weatherMood: string;
  inkColor: string;
  content: string;
  handwrittenNote?: string;
  quote?: {
    text: string;
    author: string;
  };
  stickers: Array<{
    id: string;
    type: 'pressed_flower' | 'stamp' | 'wax_seal' | 'tape' | 'paperclip' | 'dried_rose';
    x: number;
    y: number;
    rotation: number;
    label?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoMemory {
  id: string;
  userId: string;
  title: string;
  date: string;
  location?: string;
  caption: string;
  imageUrl: string;
  tapeStyle: 'floral' | 'kraft' | 'rose' | 'sage' | 'gold';
  rotation: number;
  favorite: boolean;
  pageId?: string;
  createdAt: string;
}

export interface SecretNote {
  id: string;
  userId: string;
  title: string;
  date: string;
  sealColor: 'crimson' | 'gold' | 'emerald' | 'navy';
  sealMonogram: string;
  isLockedWithPin: boolean;
  pinHash?: string;
  content: string;
  isRevealed: boolean;
  createdAt: string;
}

export interface DreamEntry {
  id: string;
  userId: string;
  type: 'dream' | 'future_letter';
  title: string;
  date: string;
  content: string;
  mood: string;
  unlockDate?: string;
  isLocked: boolean;
  createdAt: string;
}

export interface DearUnknownLetter {
  id: string;
  userId: string;
  title: string;
  date: string;
  content: string;
  emotion: string;
  releasedToStars: boolean;
  createdAt: string;
}

const TOKEN_KEY = 'my_private_world_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// Authentication
export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; acceptTerms: boolean }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Profile
  updateProfile: (payload: { name?: string; profile: Partial<UserProfile> }) =>
    request<{ message: string; user: User }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Pages
  getPages: () => request<{ pages: ScrapbookPage[] }>('/api/diary/pages'),

  createPage: (page: Partial<ScrapbookPage>) =>
    request<{ page: ScrapbookPage }>('/api/diary/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    }),

  updatePage: (pageId: string, page: Partial<ScrapbookPage>) =>
    request<{ page: ScrapbookPage }>(`/api/diary/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    }),

  deletePage: (pageId: string) =>
    request<{ message: string }>(`/api/diary/pages/${pageId}`, {
      method: 'DELETE',
    }),

  // Memories
  getMemories: () => request<{ memories: PhotoMemory[] }>('/api/diary/memories'),

  createMemory: (memory: Partial<PhotoMemory>) =>
    request<{ memory: PhotoMemory }>('/api/diary/memories', {
      method: 'POST',
      body: JSON.stringify(memory),
    }),

  deleteMemory: (memoryId: string) =>
    request<{ message: string }>(`/api/diary/memories/${memoryId}`, {
      method: 'DELETE',
    }),

  // Secrets
  getSecrets: () => request<{ secrets: SecretNote[] }>('/api/diary/secrets'),

  createSecret: (secret: Partial<SecretNote>) =>
    request<{ secret: SecretNote }>('/api/diary/secrets', {
      method: 'POST',
      body: JSON.stringify(secret),
    }),

  deleteSecret: (secretId: string) =>
    request<{ message: string }>(`/api/diary/secrets/${secretId}`, {
      method: 'DELETE',
    }),

  // Dreams
  getDreams: () => request<{ dreams: DreamEntry[] }>('/api/diary/dreams'),

  createDream: (dream: Partial<DreamEntry>) =>
    request<{ dream: DreamEntry }>('/api/diary/dreams', {
      method: 'POST',
      body: JSON.stringify(dream),
    }),

  deleteDream: (dreamId: string) =>
    request<{ message: string }>(`/api/diary/dreams/${dreamId}`, {
      method: 'DELETE',
    }),

  // Dear Unknown Letters
  getDearUnknownLetters: () => request<{ letters: DearUnknownLetter[] }>('/api/diary/dear-unknown'),

  createDearUnknownLetter: (letter: Partial<DearUnknownLetter>) =>
    request<{ letter: DearUnknownLetter }>('/api/diary/dear-unknown', {
      method: 'POST',
      body: JSON.stringify(letter),
    }),

  deleteDearUnknownLetter: (letterId: string) =>
    request<{ message: string }>(`/api/diary/dear-unknown/${letterId}`, {
      method: 'DELETE',
    }),

  // Media upload
  uploadPhoto: (dataUrl: string, filename: string) =>
    request<{ url: string }>('/api/diary/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    }),
};

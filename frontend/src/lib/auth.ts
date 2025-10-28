import type { User } from '@/types/api';

// Token management
export const setTokens = (accessToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// User management
export const setUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const clearUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Complete logout
export const logout = () => {
  clearTokens();
  clearUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Check if user is pro
export const isProUser = (): boolean => {
  const user = getUser();
  return user?.is_pro || false;
};

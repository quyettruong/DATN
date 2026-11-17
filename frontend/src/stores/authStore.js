import { create } from 'zustand';
import { post, get } from '../api/axios';

export const useAuthStore = create((set, getStore) => ({
  user: JSON.parse(localStorage.getItem('auth_user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await post('/api/auth/login', { username, password });
      if (response.success) {
        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: response.message || 'Login failed' });
      return false;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Login failed' });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await post('/api/auth/register', data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Registration failed' });
      return { success: false, message: error.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await get('/api/auth/me');
      if (response.success) {
        localStorage.setItem('auth_user', JSON.stringify(response.data));
        set({ user: response.data, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to load user', error);
      getStore().logout();
    }
  }
}));

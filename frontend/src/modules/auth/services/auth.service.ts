import api from '../../../shared/services/api';
import { LoginResponse } from '../../../shared/types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    // Unwrap the standard envelope: { success, message, data: LoginResult }
    return data.data as LoginResponse;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data as LoginResponse;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout').catch(() => {/* silent */});
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};

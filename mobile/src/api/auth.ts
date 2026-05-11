import client from './client';
import { useAuthStore } from '../store/authStore';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    const { user, tokens } = response.data;
    useAuthStore.setState({ user, token: tokens.access_token, refreshToken: tokens.refresh_token });
    return response.data;
  },

  logout: async () => {
    useAuthStore.getState().logout();
    return true;
  },

  refresh: async (refreshToken: string) => {
    const response = await client.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token } = response.data;
    useAuthStore.setState({ token: access_token });
    return response.data;
  },
};

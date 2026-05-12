import client from './client';
import { useAuthStore } from '../store/authStore';

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await client.post('/auth/login', { email, password });
    const { token, user } = data;
    useAuthStore.setState({ user, token, refreshToken: null });
    return data;
  },

  logout: async () => {
    useAuthStore.getState().logout();
  },
};

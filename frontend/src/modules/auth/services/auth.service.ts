import client from '../../../api/client';
import { LoginResponse } from '../../../shared/types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await client.post('/auth/login', { email, password });
    return data;
  },
};

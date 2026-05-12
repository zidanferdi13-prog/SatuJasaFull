import { API_URL } from '../constants';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    if (error.response?.status === 402) {
      // Subscription expired
      alert('Langganan telah kadaluarsa. Hubungi admin.');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
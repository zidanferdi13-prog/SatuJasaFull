import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/authStore';

export function useLogin() {
  const { setUser, setToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      // Persist refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      useAuthStore.setState({ refreshToken: data.refreshToken });
      queryClient.clear();
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

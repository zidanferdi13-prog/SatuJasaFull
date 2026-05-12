import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../store/authStore';

export function useLogin() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
}
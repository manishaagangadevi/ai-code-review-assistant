import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export function useAuth() {
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me')
        .then(res => setAuth(res.data, token))
        .catch(() => logout());
    }
  }, [token]);

  return { user, token, setAuth, logout, isAuthenticated };
}

export function useRequireAuth() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  return useAuthStore();
}
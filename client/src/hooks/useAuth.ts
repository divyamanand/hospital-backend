import { useQuery } from '@tanstack/react-query'
import { query, mutate } from '@/lib/api'

export type AppRole = 'admin' | 'receptionist' | 'doctor' | 'inventory' | 'room_manager' | 'patient'

type Me = { id: string; role: AppRole; email: string }

export function useAuthBootstrap() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => query<Me>('/auth/me'),
    retry: false,
  })
  return { user: data ?? null, loading: isLoading }
}

export function useAuthActions() {
  const login = (email: string, password: string) => mutate('/auth/login', { email, password })
  const logout = () => mutate('/auth/logout', {})
  return { login, logout }
}

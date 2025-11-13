import { useEffect, useState } from 'react'
import { query, mutate } from '@/lib/api'

export type AppRole = 'admin' | 'receptionist' | 'doctor' | 'inventory' | 'room_manager' | 'patient'

type Me = { id: string; role: AppRole; email: string }

export function useAuthBootstrap() {
  const [user, setUser] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    query<Me>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])
  return { user, loading, setUser }
}

export function useAuthActions() {
  const login = (email: string, password: string) => mutate('/auth/login', { email, password })
  const logout = () => mutate('/auth/logout', {})
  return { login, logout }
}

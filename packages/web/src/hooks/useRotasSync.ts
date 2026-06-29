import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/api/auth.service'
import { useAuth } from '@/hooks/useAuth'

export function useRotasSync() {
  const { session, setSession } = useAuth()

  const { data } = useQuery({
    queryKey: ['auth:session'],
    queryFn: authService.me,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (!data || !session) return

    const incoming = JSON.stringify(data.rotas)
    const cached = JSON.stringify(session.rotas ?? [])

    if (incoming !== cached) {
      setSession({
        user: data.user,
        hotel: data.hotel,
        rotas: data.rotas,
      })
    }
  }, [data, session, setSession])
}

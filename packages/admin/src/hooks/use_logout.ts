import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { useAuth } from '@/hooks/use_auth'

export function useLogout() {
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: logout } = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      setSession(null)
      queryClient.clear()
      navigate('/login')
    },
  })

  return { logout }
}

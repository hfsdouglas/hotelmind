import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/api/auth.service'
import { useAuth } from '@/hooks/useAuth'

export function useLogout() {
  const navigate = useNavigate()
  const { clearSession } = useAuth()

  async function logout() {
    try {
      await authService.logout()
    } catch {
      toast.error('Não foi possível encerrar a sessão no servidor.')
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  return { logout }
}

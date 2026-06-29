import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/api/auth.service'
import { useAuth } from '@/hooks/useAuth'
import type { LoginFormData } from '@/schemas/auth.schema'

export function useLogin() {
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: ({ admin, message }) => {
      setSession({ admin })
      toast.success(message)
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('Credenciais inválidas.')
    },
  })

  return { login, isPending }
}

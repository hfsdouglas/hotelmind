import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { usePageTitle } from '@/hooks/use_document_title'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  usePageTitle('Entrar')
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}

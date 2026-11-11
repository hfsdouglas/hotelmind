import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/login_form'
import { useAuth } from '@/hooks/use_auth'
import { usePageTitle } from '@/hooks/use_document_title'

export function LoginPage() {
  usePageTitle('Entrar')
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function LoginLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Outlet />
    </div>
  )
}

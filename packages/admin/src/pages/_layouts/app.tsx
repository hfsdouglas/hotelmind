import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use_auth'

export function AppLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  )
}

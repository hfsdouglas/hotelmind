import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use_auth'
import { useRotasSync } from '@/hooks/use_rotas_sync'

export function AppLayout() {
  const { isAuthenticated } = useAuth()

  useRotasSync()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  )
}

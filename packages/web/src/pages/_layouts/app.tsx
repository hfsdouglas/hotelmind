import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    authService.me().catch(() => {})
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200',
          sidebarOpen ? 'ml-60' : 'ml-0'
        )}
      >
        <TopNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

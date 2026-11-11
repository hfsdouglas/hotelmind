import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { SupportBanner } from '@/components/layout/support_banner'
import { TopNavbar } from '@/components/layout/top_navbar'
import { useAuth } from '@/hooks/use_auth'
import { useRotasSync } from '@/hooks/use_rotas_sync'

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useRotasSync()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <SupportBanner />
      <TopNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

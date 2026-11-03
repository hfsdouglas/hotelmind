import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { SupportBanner } from '@/components/layout/SupportBanner'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { useAuth } from '@/hooks/useAuth'
import { useRotasSync } from '@/hooks/useRotasSync'

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
            className="absolute inset-0 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="relative min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

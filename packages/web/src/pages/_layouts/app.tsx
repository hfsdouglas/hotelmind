import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { useAuth } from '@/hooks/useAuth'
import { useRotasSync } from '@/hooks/useRotasSync'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useRotasSync()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col">
        <div
          className={cn(
            'transition-[margin] duration-300',
            sidebarOpen ? 'ml-72' : 'ml-0',
          )}
        >
          <TopNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { AppShell, SuiteSyncLogo } from '@hotelmind/ui'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use_auth'
import { buildNavigation } from './build_navigation'
import { NotificationsDropdown } from './notifications_dropdown'
import { SidebarUserCard } from './sidebar_user_card'
import { SupportBanner } from './support_banner'

const STORAGE_KEY = 'suitesync-sidebar-collapsed'

function HomeLink({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="SuiteSync — Ir para o dashboard"
      className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SuiteSyncLogo size="sm" iconOnly={iconOnly} />
    </Link>
  )
}

interface SidebarProps {
  children: ReactNode
}

/** Hotel app shell: sidebar navigation built from `session.rotas`. */
export function Sidebar({ children }: SidebarProps) {
  const { session } = useAuth()
  const { pathname } = useLocation()

  if (!session) return <>{children}</>

  return (
    <AppShell
      storageKey={STORAGE_KEY}
      brand={<HomeLink />}
      brandCollapsed={<HomeLink iconOnly />}
      sections={buildNavigation(session.rotas ?? [], pathname)}
      topBanner={<SupportBanner />}
      mobileActions={<NotificationsDropdown />}
      renderLink={({ to, ...props }) => <Link to={to} {...props} />}
      footer={({ collapsed }) => (
        <div className="flex flex-col gap-2">
          <NotificationsDropdown variant="sidebar" collapsed={collapsed} />
          <SidebarUserCard collapsed={collapsed} />
        </div>
      )}
    >
      {children}
    </AppShell>
  )
}

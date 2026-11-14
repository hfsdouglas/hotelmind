import { AppShell, type NavSection, SuiteSyncLogo } from '@hotelmind/ui'
import {
  Building2,
  LayoutDashboard,
  LifeBuoy,
  Network,
  ShieldCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use_auth'
import { SidebarUserCard } from './sidebar_user_card'

const STORAGE_KEY = 'suitesync-sidebar-collapsed'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Hotéis', href: '/hoteis', icon: Building2 },
  { label: 'Rotas', href: '/rotas', icon: Network },
  { label: 'Administradores', href: '/administradores', icon: ShieldCheck },
  { label: 'Suporte', href: '/suporte', icon: LifeBuoy },
]

function HomeLink({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="SuiteSync Admin — Ir para o dashboard"
      className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SuiteSyncLogo
        size="sm"
        surface="on-primary"
        iconOnly={iconOnly}
        badge="ADMIN"
      />
    </Link>
  )
}

interface SidebarProps {
  children: ReactNode
}

/** Admin app shell: fixed platform navigation in the brand-blue sidebar. */
export function Sidebar({ children }: SidebarProps) {
  const { session } = useAuth()
  const { pathname } = useLocation()

  if (!session) return <>{children}</>

  const sections: NavSection[] = [
    {
      id: 'plataforma',
      label: 'Plataforma',
      items: NAV.map(({ label, href, icon }) => ({
        id: href,
        label,
        icon,
        href,
        active: pathname === href || pathname.startsWith(`${href}/`),
      })),
    },
  ]

  return (
    <AppShell
      storageKey={STORAGE_KEY}
      variant="brand"
      brand={<HomeLink />}
      brandCollapsed={<HomeLink iconOnly />}
      sections={sections}
      renderLink={({ to, ...props }) => <Link to={to} {...props} />}
      footer={({ collapsed }) => <SidebarUserCard collapsed={collapsed} />}
    >
      {children}
    </AppShell>
  )
}

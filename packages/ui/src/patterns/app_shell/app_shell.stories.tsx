import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react'
import { SidebarUserCard } from '../sidebar_user_card/sidebar_user_card'
import { SuiteSyncLogo } from '../suite_sync_logo/suite_sync_logo'
import { AppShell, type AppShellProps } from './app_shell'

const args: AppShellProps = {
  storageKey: 'storybook-sidebar-collapsed',
  brand: <SuiteSyncLogo size="sm" />,
  brandCollapsed: <SuiteSyncLogo size="sm" iconOnly />,
  sections: [
    {
      id: 'operacao',
      label: 'Operação',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '#dashboard',
          active: true,
        },
        {
          id: 'reservas',
          label: 'Reservas',
          icon: CalendarDays,
          href: '#reservas',
        },
        { id: 'quartos', label: 'Quartos', icon: BedDouble, href: '#quartos' },
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: Settings,
          children: [
            { id: 'hotel', label: 'Hotel', icon: Settings, href: '#hotel' },
          ],
        },
      ],
    },
  ],
  footer: ({ collapsed }) => (
    <SidebarUserCard
      name="Maria Souza"
      secondary="Hotel Luxo"
      collapsed={collapsed}
      items={[
        {
          id: 'sair',
          label: 'Sair',
          icon: LogOut,
          destructive: true,
          onSelect: () => {},
        },
      ]}
    />
  ),
  renderLink: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  children: (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold">Conteúdo da página</h1>
      <p className="mt-2 text-muted-foreground">
        O conteúdo ocupa todo o espaço ao lado do menu.
      </p>
    </div>
  ),
}

const meta = {
  title: 'Patterns/AppShell',
  component: AppShell,
  args,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Brand: Story = {
  args: {
    variant: 'brand',
    brand: <SuiteSyncLogo size="sm" surface="on-primary" badge="ADMIN" />,
    brandCollapsed: <SuiteSyncLogo size="sm" iconOnly surface="on-primary" />,
  },
}
export const MobileDrawer: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

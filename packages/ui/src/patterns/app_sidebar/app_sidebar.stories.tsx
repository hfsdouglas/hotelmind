import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BedDouble,
  Bell,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import { SuiteSyncLogo } from '../suite_sync_logo/suite_sync_logo'
import { AppSidebar, type NavSection } from './app_sidebar'

const SECTIONS: NavSection[] = [
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
        id: 'alertas',
        label: 'Alertas',
        icon: Bell,
        href: '#alertas',
        badge: {
          count: 3,
          tone: 'destructive',
          label: '3 notificações não lidas',
        },
      },
    ],
  },
  {
    id: 'administracao',
    label: 'Administração',
    items: [
      {
        id: 'configuracoes',
        label: 'Configurações',
        icon: Settings,
        children: [
          { id: 'hotel', label: 'Hotel', icon: Settings, href: '#hotel' },
          { id: 'tema', label: 'Tema', icon: Settings, href: '#tema' },
        ],
      },
    ],
  },
]

function Demo({
  initialCollapsed = false,
  brand_variant = false,
  sections = SECTIONS,
}: {
  initialCollapsed?: boolean
  brand_variant?: boolean
  sections?: NavSection[]
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  return (
    <div
      data-sidebar-variant={brand_variant ? 'brand' : undefined}
      className="h-[640px] bg-background p-2"
    >
      <div
        id="story-sidebar"
        className={`h-full overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-sidebar-panel dark:shadow-none ${collapsed ? 'w-[4.5rem]' : 'w-64'}`}
      >
        <AppSidebar
          id="story-sidebar"
          brand={
            <SuiteSyncLogo
              size="sm"
              surface={brand_variant ? 'on-primary' : 'auto'}
            />
          }
          brandCollapsed={
            <SuiteSyncLogo
              size="sm"
              iconOnly
              surface={brand_variant ? 'on-primary' : 'auto'}
            />
          }
          sections={sections}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(value => !value)}
          renderLink={({ to, children, ...rest }) => (
            <a href={to} {...rest}>
              {children}
            </a>
          )}
        />
      </div>
    </div>
  )
}

const meta = {
  title: 'Patterns/AppSidebar',
  component: Demo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = { render: () => <Demo /> }
export const Collapsed: Story = {
  render: () => <Demo initialCollapsed />,
}
export const SubmenuOpen: Story = {
  render: () => (
    <Demo
      sections={SECTIONS.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.children
            ? {
                ...item,
                children: item.children.map((child, index) => ({
                  ...child,
                  active: index === 0,
                })),
              }
            : { ...item, active: false }
        ),
      }))}
    />
  ),
}
export const Brand: Story = { render: () => <Demo brand_variant /> }

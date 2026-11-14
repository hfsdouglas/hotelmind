import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Bell, LayoutDashboard, Settings } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import {
  AppSidebar,
  type AppSidebarProps,
  type NavSection,
} from './app_sidebar'

const SECTIONS: NavSection[] = [
  {
    id: 'geral',
    label: 'Geral',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        active: true,
      },
      {
        id: 'alertas',
        label: 'Alertas',
        icon: Bell,
        href: '/alertas',
        badge: {
          count: 3,
          tone: 'destructive',
          label: '3 notificações não lidas',
        },
      },
    ],
  },
  {
    id: 'config',
    label: 'Administração',
    items: [
      {
        id: 'configuracoes',
        label: 'Configurações',
        icon: Settings,
        children: [
          {
            id: 'hotel',
            label: 'Hotel',
            icon: Settings,
            href: '/config/hotel',
          },
          { id: 'tema', label: 'Tema', icon: Settings, href: '/config/tema' },
        ],
      },
    ],
  },
]

function renderSidebar(props: Partial<AppSidebarProps> = {}) {
  return render(
    <AppSidebar
      id="sidebar"
      brand={<span>Marca</span>}
      brandCollapsed={<span>M</span>}
      sections={SECTIONS}
      collapsed={false}
      onToggleCollapsed={vi.fn()}
      renderLink={({ to, children, ...rest }) => (
        <a href={to} {...rest}>
          {children}
        </a>
      )}
      {...props}
    />
  )
}

describe('AppSidebar', () => {
  it('shows visible labels when expanded and section headings', () => {
    renderSidebar()

    expect(screen.getByText('Dashboard')).not.toHaveClass('sr-only')
    expect(screen.getByText('Geral')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' })
    ).toBeInTheDocument()
  })

  it('keeps labels accessible but visually hidden when collapsed', () => {
    renderSidebar({ collapsed: true })

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toHaveClass('sr-only')
  })

  it('marks the active item with aria-current', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: /Alertas/ })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('exposes badge count through the accessible name', () => {
    renderSidebar()

    expect(
      screen.getByRole('link', { name: /3 notificações não lidas/ })
    ).toBeInTheDocument()
  })

  it('shows a tooltip on hover when collapsed', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.hover(screen.getByRole('link', { name: 'Dashboard' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Dashboard')
  })

  it('shows a tooltip on keyboard focus when collapsed', async () => {
    renderSidebar({ collapsed: true })

    act(() => screen.getByRole('link', { name: 'Dashboard' }).focus())

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Dashboard')
  })

  it('toggle button reports its target and label', async () => {
    const user = userEvent.setup()
    const onToggleCollapsed = vi.fn()
    renderSidebar({ onToggleCollapsed })

    const toggle = screen.getByRole('button', { name: 'Recolher menu' })
    expect(toggle).toHaveAttribute('aria-controls', 'sidebar')
    await user.click(toggle)

    expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
  })

  it('labels the toggle "Expandir menu" when collapsed', () => {
    renderSidebar({ collapsed: true })

    expect(
      screen.getByRole('button', { name: 'Expandir menu' })
    ).toBeInTheDocument()
  })

  it('opens and closes a group with aria-expanded', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const group = screen.getByRole('button', { name: 'Configurações' })
    expect(group).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('link', { name: 'Hotel' })
    ).not.toBeInTheDocument()

    await user.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Hotel' })).toBeInTheDocument()

    await user.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the group that contains the active route by itself', () => {
    const sections: NavSection[] = [
      {
        id: 'config',
        items: [
          {
            id: 'configuracoes',
            label: 'Configurações',
            icon: Settings,
            children: [
              {
                id: 'hotel',
                label: 'Hotel',
                icon: Settings,
                href: '/c/hotel',
                active: true,
              },
            ],
          },
        ],
      },
    ]
    renderSidebar({ sections })

    expect(
      screen.getByRole('button', { name: 'Configurações' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Hotel' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('shows group children in a flyout when collapsed', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.click(screen.getByRole('button', { name: 'Configurações' }))

    const flyout = await screen.findByRole('dialog')
    expect(
      within(flyout).getByRole('link', { name: 'Hotel' })
    ).toBeInTheDocument()
  })

  it('filters items ignoring accents and case', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.type(
      screen.getByRole('searchbox', { name: 'Filtrar menu' }),
      'CONFIGURACOES'
    )

    expect(
      screen.getByRole('button', { name: 'Configurações' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Dashboard' })
    ).not.toBeInTheDocument()
  })

  it('finds a child by its label and reveals it', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.type(
      screen.getByRole('searchbox', { name: 'Filtrar menu' }),
      'tema'
    )

    expect(screen.getByRole('link', { name: 'Tema' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Hotel' })
    ).not.toBeInTheDocument()
  })

  it('shows an empty state announced as status when nothing matches', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.type(
      screen.getByRole('searchbox', { name: 'Filtrar menu' }),
      'zzz'
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum item encontrado'
    )
  })

  it('expands the sidebar when the search icon is used while collapsed', async () => {
    const user = userEvent.setup()
    const onToggleCollapsed = vi.fn()
    renderSidebar({ collapsed: true, onToggleCollapsed })

    await user.click(screen.getByRole('button', { name: 'Buscar no menu' }))

    expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
  })

  it('calls onNavigate when a link is used', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderSidebar({ onNavigate })

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(onNavigate).toHaveBeenCalled()
  })

  it('renders the footer slot', () => {
    renderSidebar({ footer: <div>Rodapé</div> })

    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })
})

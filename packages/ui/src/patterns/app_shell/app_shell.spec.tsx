import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutDashboard } from 'lucide-react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell, type AppShellProps } from './app_shell'

const KEY = 'test-sidebar-collapsed'

function stub_width(wide: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: wide,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

function renderShell(props: Partial<AppShellProps> = {}) {
  return render(
    <AppShell
      storageKey={KEY}
      brand={<span>Marca</span>}
      brandCollapsed={<span>M</span>}
      sections={[
        {
          id: 'geral',
          items: [
            {
              id: 'dashboard',
              label: 'Dashboard',
              icon: LayoutDashboard,
              href: '/dashboard',
            },
          ],
        },
      ]}
      footer={({ collapsed }) => (
        <div>{collapsed ? 'rodape recolhido' : 'rodape expandido'}</div>
      )}
      renderLink={({ to, children, ...rest }) => (
        <a href={to} {...rest}>
          {children}
        </a>
      )}
      {...props}
    >
      <p>Conteúdo</p>
    </AppShell>
  )
}

describe('AppShell', () => {
  beforeEach(() => {
    localStorage.clear()
    stub_width(true)
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('renders the content inside main#conteudo-principal and a skip link', () => {
    renderShell()

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'conteudo-principal')
    expect(main).toHaveTextContent('Conteúdo')
    expect(
      screen.getByRole('link', { name: 'Pular para o conteúdo' })
    ).toHaveAttribute('href', '#conteudo-principal')
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('defaults to expanded on wide screens and collapsed on narrow ones', () => {
    renderShell()
    expect(screen.getByText('rodape expandido')).toBeInTheDocument()
  })

  it('defaults to collapsed on narrow screens', () => {
    stub_width(false)
    renderShell()
    expect(screen.getByText('rodape recolhido')).toBeInTheDocument()
  })

  it('restores the stored preference over the width default', () => {
    localStorage.setItem(KEY, 'true')
    renderShell()
    expect(screen.getByText('rodape recolhido')).toBeInTheDocument()
  })

  it('persists the preference only when the user toggles it', async () => {
    const user = userEvent.setup()
    renderShell()
    expect(localStorage.getItem(KEY)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(localStorage.getItem(KEY)).toBe('true')
    expect(screen.getByText('rodape recolhido')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expandir menu' }))
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('survives a storage failure', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderShell()

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(screen.getByText('rodape recolhido')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('opens the mobile drawer, closes it with Esc and returns focus', async () => {
    const user = userEvent.setup()
    renderShell()

    const open = screen.getByRole('button', { name: 'Abrir menu' })
    expect(open).toHaveAttribute('aria-expanded', 'false')
    await user.click(open)

    const drawer = await screen.findByRole('dialog', { name: 'Menu principal' })
    expect(drawer).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus()
    )
  })

  it('closes the drawer after navigating', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const drawer = await screen.findByRole('dialog')
    await user.click(
      drawer.querySelector('a[href="/dashboard"]') as HTMLAnchorElement
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the drawer when the brand link is used', async () => {
    const user = userEvent.setup()
    renderShell({ brand: <a href="/home">Marca</a> })

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await user.click(await screen.findByRole('link', { name: 'Marca' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders top banner and mobile actions', () => {
    renderShell({
      topBanner: <div>Banner</div>,
      mobileActions: <button type="button">Sino</button>,
    })

    expect(screen.getByText('Banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sino' })).toBeInTheDocument()
  })

  it('applies the brand variant', () => {
    const { container } = renderShell({ variant: 'brand' })

    expect(
      container.querySelector('[data-sidebar-variant="brand"]')
    ).not.toBeNull()
  })
})

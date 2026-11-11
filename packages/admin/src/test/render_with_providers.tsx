import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth_context'
import { ThemeProvider } from '@/contexts/theme_context'
import type { AdminSession } from '@/types/auth'

interface RenderWithProvidersOptions extends RenderOptions {
  router_props?: MemoryRouterProps
  initial_session?: AdminSession | null
}

function make_query_client() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function render_with_providers(
  ui: ReactNode,
  { router_props, ...render_options }: RenderWithProvidersOptions = {}
) {
  const query_client = make_query_client()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={query_client}>
          <MemoryRouter {...router_props}>
            <AuthProvider>{children}</AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...render_options })
}

import { type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
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
  { router_props, ...render_options }: RenderWithProvidersOptions = {},
) {
  const query_client = make_query_client()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={query_client}>
        <MemoryRouter {...router_props}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...render_options })
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PagedDataTable } from './paged_data_table'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

interface Item {
  id: string
  name: string
}

const columns = [
  { key: 'name' as const, label: 'Nome' },
]

describe('PagedDataTable', () => {
  it('renders table rows and result count after suspense resolves', async () => {
    const queryClient = createQueryClient()
    const queryFn = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Item Admin 1' },
        { id: '2', name: 'Item Admin 2' },
      ],
      meta: { total: 2, pagina: 1, ultima_pagina: 1, limite: 10 },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PagedDataTable<Item>
          columns={columns}
          queryKey={['admin:items']}
          queryFn={queryFn}
          label="registros"
        />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Item Admin 1')).toBeInTheDocument()
      expect(screen.getByText('Item Admin 2')).toBeInTheDocument()
      expect(screen.getByText('2 resultados encontrados')).toBeInTheDocument()
    })
  })
})

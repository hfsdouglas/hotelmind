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

const columns = [{ key: 'name' as const, header: 'Nome' }]

describe('PagedDataTable', () => {
  it('renders table rows and result count after suspense resolves', async () => {
    const queryClient = createQueryClient()
    const queryFn = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Item Um' },
        { id: '2', name: 'Item Dois' },
      ],
      meta: { total: 2, pagina: 1, ultima_pagina: 1, limite: 10 },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PagedDataTable<Item>
          columns={columns}
          queryKey={['items']}
          queryFn={queryFn}
          label="itens"
        />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Item Um')).toBeInTheDocument()
      expect(screen.getByText('Item Dois')).toBeInTheDocument()
      expect(screen.getByText('2 resultados encontrados')).toBeInTheDocument()
    })
  })
})

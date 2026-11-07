import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TarifarioForm } from './tarifario_form'

const mockCategories = [
  { id: 'cat-1', nome: 'Standard', status: 'S' as const },
  { id: 'cat-2', nome: 'Luxo', status: 'S' as const },
]

const mockRegimes = [
  {
    id: 'reg-1',
    hotel_id: 'hotel-1',
    titulo: 'Café da Manhã',
    descricao: 'Incluso café',
    cor_pulseira: '#3B82F6',
    ativo: true,
    criado_em: '2026-01-01',
    atualizado_em: '2026-01-01',
  },
]

describe('TarifarioForm', () => {
  it('renders form inputs and handles multi-category submission with minimum stay', async () => {
    const user = userEvent.setup()
    const onSubmitPayload = vi.fn()

    render(
      <MemoryRouter>
        <TarifarioForm
          mode="create"
          title="Novo Tarifário"
          categories={mockCategories}
          regimes={mockRegimes}
          occupiedPeriods={[]}
          onCancel={vi.fn()}
          onSubmitPayload={onSubmitPayload}
          initialValues={{
            nome: 'Alta Temporada',
            categoria_quarto_ids: ['cat-1', 'cat-2'],
            regime_alimentacao_id: 'reg-1',
            valor_diaria: '250.00',
            minimo_diarias: 2,
            datas: ['2026-11-20'],
            ativo: true,
          }}
        />
      </MemoryRouter>
    )

    expect(screen.getByDisplayValue('Alta Temporada')).toBeInTheDocument()
    expect(
      screen.getByText('Passo 2: Categorias de Quarto')
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument() // minimo_diarias

    const submitBtn = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onSubmitPayload).toHaveBeenCalledWith({
        nome: 'Alta Temporada',
        categoria_quarto_id: 'cat-1',
        categoria_quarto_ids: ['cat-1', 'cat-2'],
        regime_alimentacao_id: 'reg-1',
        parceiro_id: null,
        valor_diaria: '250.00',
        minimo_diarias: 2,
        datas: ['2026-11-20'],
        ativo: true,
      })
    })
  })

  it('submits with commercial partner when selected', async () => {
    const user = userEvent.setup()
    const onSubmitPayload = vi.fn()
    const mockParceiros = [{ id: 'parc-1', razao_social: 'Petrobras S/A' }]

    render(
      <MemoryRouter>
        <TarifarioForm
          mode="create"
          title="Novo Tarifário Corporativo"
          categories={mockCategories}
          regimes={mockRegimes}
          parceiros={mockParceiros}
          occupiedPeriods={[]}
          onCancel={vi.fn()}
          onSubmitPayload={onSubmitPayload}
          initialValues={{
            nome: 'Tarifa Petrobras',
            categoria_quarto_ids: ['cat-1'],
            regime_alimentacao_id: 'reg-1',
            parceiro_id: 'parc-1',
            valor_diaria: '210.00',
            minimo_diarias: 1,
            datas: ['2026-11-20'],
            ativo: true,
          }}
        />
      </MemoryRouter>
    )

    const submitBtn = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onSubmitPayload).toHaveBeenCalledWith({
        nome: 'Tarifa Petrobras',
        categoria_quarto_id: 'cat-1',
        categoria_quarto_ids: ['cat-1'],
        regime_alimentacao_id: 'reg-1',
        parceiro_id: 'parc-1',
        valor_diaria: '210.00',
        minimo_diarias: 1,
        datas: ['2026-11-20'],
        ativo: true,
      })
    })
  })
})

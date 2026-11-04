import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TarifarioForm } from './tarifario_form'

const mockCategories = [
  { id: 'cat-1', nome: 'Standard' },
  { id: 'cat-2', nome: 'Luxo' },
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
  it('renders form inputs and handles submission', async () => {
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
            categoria_quarto_id: 'cat-1',
            regime_alimentacao_id: 'reg-1',
            valor_diaria: '250.00',
            datas: ['2026-11-20'],
            ativo: true,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByDisplayValue('Alta Temporada')).toBeInTheDocument()
    expect(screen.getByDisplayValue('250.00')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(onSubmitPayload).toHaveBeenCalledWith({
        nome: 'Alta Temporada',
        categoria_quarto_id: 'cat-1',
        regime_alimentacao_id: 'reg-1',
        valor_diaria: '250.00',
        datas: ['2026-11-20'],
        ativo: true,
      })
    })
  })
})

import type { ReservaHospede } from '@hotelmind/contracts'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReservaHospedesSection } from './reserva_hospedes_section'

const makeHospede = (over: Record<string, unknown> = {}) =>
  ({
    id: 'h-1',
    posicao: 1,
    ficha_status: 'preenchida',
    nome_completo: 'Ana Souza',
    tipo_documento: 'cpf',
    numero_documento: '12345678900',
    telefone: '(11) 99999-8888',
    cidade: 'Campinas',
    estado: 'SP',
    preenchido_por: 'hospede',
    ...over,
  }) as unknown as ReservaHospede

describe('ReservaHospedesSection', () => {
  it('exibe contadores e dados do hospede titular', () => {
    render(
      <ReservaHospedesSection
        totalHospedes={2}
        fichasPreenchidas={1}
        hospedes={[makeHospede()]}
        onEditarFicha={vi.fn()}
      />
    )

    expect(screen.getByText('Hóspedes da Reserva (2)')).toBeInTheDocument()
    expect(
      screen.getByText('1 de 2 ficha(s) preenchida(s)')
    ).toBeInTheDocument()
    expect(screen.getByText('Titular')).toBeInTheDocument()
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('Preenchida')).toBeInTheDocument()
    expect(screen.getByText('Doc: CPF 12345678900')).toBeInTheDocument()
    expect(screen.getByText('Tel: (11) 99999-8888')).toBeInTheDocument()
    expect(screen.getByText('Origem: Campinas/SP')).toBeInTheDocument()
    expect(screen.getByText('Preenchido via hospede')).toBeInTheDocument()
  })

  it('mostra hospede pendente sem dados e aguardando preenchimento', () => {
    render(
      <ReservaHospedesSection
        totalHospedes={2}
        fichasPreenchidas={0}
        hospedes={[
          makeHospede({
            id: 'h-2',
            posicao: 2,
            ficha_status: 'pendente',
            nome_completo: null,
            numero_documento: null,
            telefone: null,
            cidade: null,
            estado: null,
            preenchido_por: null,
          }),
        ]}
        onEditarFicha={vi.fn()}
      />
    )

    expect(screen.getByText('Hóspede 2')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Aguardando preenchimento')).toBeInTheDocument()
    expect(screen.queryByText(/^Doc:/)).not.toBeInTheDocument()
  })

  it('mostra status rascunho', () => {
    render(
      <ReservaHospedesSection
        totalHospedes={1}
        fichasPreenchidas={0}
        hospedes={[makeHospede({ ficha_status: 'rascunho' })]}
        onEditarFicha={vi.fn()}
      />
    )

    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('nao renderiza cartoes quando nao ha hospedes', () => {
    render(
      <ReservaHospedesSection
        totalHospedes={0}
        fichasPreenchidas={0}
        onEditarFicha={vi.fn()}
      />
    )

    expect(screen.getByText('Hóspedes da Reserva (0)')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /editar ficha/i })
    ).not.toBeInTheDocument()
  })

  it('chama onEditarFicha com o hospede do cartao clicado', async () => {
    const user = userEvent.setup()
    const onEditarFicha = vi.fn()
    const h1 = makeHospede()
    const h2 = makeHospede({ id: 'h-2', posicao: 2, nome_completo: 'Beto' })
    render(
      <ReservaHospedesSection
        totalHospedes={2}
        fichasPreenchidas={2}
        hospedes={[h1, h2]}
        onEditarFicha={onEditarFicha}
      />
    )

    const card = screen
      .getByText('Beto')
      .closest('div.rounded-lg') as HTMLElement
    await user.click(
      within(card).getByRole('button', { name: /editar ficha/i })
    )

    expect(onEditarFicha).toHaveBeenCalledTimes(1)
    expect(onEditarFicha).toHaveBeenCalledWith(h2)
  })
})

import type { Reserva } from '@hotelmind/contracts'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReservaDetalhesHospedagem } from './reserva_detalhes_hospedagem'

const makeReserva = (over: Record<string, unknown> = {}) =>
  ({
    id: 'res-1',
    check_in: '2026-11-10T00:00:00.000Z',
    check_out: '2026-11-12',
    valor_total: '2400',
    quarto: { identificacao: '101', categoria_nome: 'Luxo' },
    regime_alimentacao: { titulo: 'Meia pensão', cor_pulseira: '#ff0000' },
    parceiro_comercial: null,
    detalhamento_diarias: [
      {
        data: '2026-11-10',
        tarifario_id: 't1',
        tarifario_nome: 'Alta',
        valor_diaria: '1000',
      },
      {
        data: '2026-11-11',
        tarifario_id: 't1',
        tarifario_nome: 'Baixa',
        valor_diaria: '1400',
      },
    ],
    ...over,
  }) as unknown as Reserva

describe('ReservaDetalhesHospedagem', () => {
  it('exibe datas, suite e regime', () => {
    render(<ReservaDetalhesHospedagem reserva={makeReserva()} />)

    expect(screen.getByText('10/11/2026')).toBeInTheDocument()
    expect(screen.getByText('12/11/2026')).toBeInTheDocument()
    expect(screen.getByText(/101\s*\(\s*Luxo\s*\)/)).toBeInTheDocument()
    expect(screen.getByText('Meia pensão')).toBeInTheDocument()
  })

  it('lista tarifas por diaria e valor total', () => {
    render(<ReservaDetalhesHospedagem reserva={makeReserva()} />)

    expect(screen.getByText('Diária 10/11/2026')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?1\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?1\.400,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?2\.400,00/)).toBeInTheDocument()
  })

  it('exibe parceiro comercial quando vinculado', () => {
    render(
      <ReservaDetalhesHospedagem
        reserva={makeReserva({
          parceiro_comercial: { razao_social: 'Agencia XYZ' },
        })}
      />
    )

    expect(screen.getByText('Agencia XYZ')).toBeInTheDocument()
  })

  it('nao exibe parceiro comercial quando ausente', () => {
    render(<ReservaDetalhesHospedagem reserva={makeReserva()} />)

    expect(
      screen.queryByText('Parceiro Comercial Vinculado:')
    ).not.toBeInTheDocument()
  })

  it('usa hifen quando nao ha suite', () => {
    render(
      <ReservaDetalhesHospedagem reserva={makeReserva({ quarto: undefined })} />
    )

    expect(screen.getByText(/-\s*\(\s*-\s*\)/)).toBeInTheDocument()
  })
})

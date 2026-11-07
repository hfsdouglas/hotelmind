import { describe, expect, it } from 'vitest'
import { OrcamentoValidationError } from '@/core/errors/orcamento_errors'
import { Orcamento } from './orcamento'

describe('Orcamento Entity', () => {
  const base_props = {
    id: 'orcamento-1',
    hotel_id: 'hotel-1',
    lead_id: 'lead-1',
    regime_alimentacao_id: 'regime-1',
    categoria_quarto_id: 'categoria-1',
    check_in: '2026-12-01',
    check_out: '2026-12-05',
    quantidade_adultos: 2,
    quantidade_criancas: 0,
    quantidade_pets: 0,
    valor_total: '1000.00',
    detalhamento_noites: [],
    token_publico: 'token-abc',
    status: 'pendente' as const,
    created_at: new Date(),
    updated_at: new Date(),
  }

  it('deve instanciar um orçamento válido', () => {
    const orcamento = new Orcamento(base_props)

    expect(orcamento.id).toBe('orcamento-1')
    expect(orcamento.check_in).toBe('2026-12-01')
    expect(orcamento.valor_total).toBe('1000.00')
    expect(orcamento.status).toBe('pendente')
    expect(orcamento.parceiro_id).toBeNull()
  })

  it('deve suportar vínculo opcional com parceiro comercial', () => {
    const orcamento = new Orcamento({
      ...base_props,
      parceiro_id: 'parceiro-1',
      parceiro: { id: 'parceiro-1', razao_social: 'CVC Viagens' },
    })

    expect(orcamento.parceiro_id).toBe('parceiro-1')
    expect(orcamento.parceiro?.razao_social).toBe('CVC Viagens')
  })

  it('deve lançar erro se lead_id for vazio', () => {
    expect(
      () =>
        new Orcamento({
          ...base_props,
          lead_id: '',
        })
    ).toThrow(OrcamentoValidationError)
  })

  it('deve lançar erro se regime_alimentacao_id for vazio', () => {
    expect(
      () =>
        new Orcamento({
          ...base_props,
          regime_alimentacao_id: '',
        })
    ).toThrow(OrcamentoValidationError)
  })

  it('deve lançar erro se datas forem inválidas', () => {
    expect(
      () =>
        new Orcamento({
          ...base_props,
          check_in: 'data-invalida',
        })
    ).toThrow(OrcamentoValidationError)

    expect(
      () =>
        new Orcamento({
          ...base_props,
          check_in: '2026-12-10',
          check_out: '2026-12-05',
        })
    ).toThrow(OrcamentoValidationError)
  })

  it('deve lançar erro se quantidade de adultos for menor que 1', () => {
    expect(
      () =>
        new Orcamento({
          ...base_props,
          quantidade_adultos: 0,
        })
    ).toThrow(OrcamentoValidationError)
  })
})

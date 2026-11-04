import { describe, expect, it } from 'vitest'
import { Tarifario } from '@/core/entities/tarifario'
import { TarifarioSemCoberturaError } from '@/core/errors/tarifario_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { CalcularTarifaReservaUseCase } from '@/core/usecases/tarifarios/calcular_tarifa_reserva_use_case'
import { TarifarioPricingService } from './tarifario_pricing_service'

function make_tarifario(overrides: Partial<{
  id: string
  hotel_id: string
  categoria_quarto_id: string
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
}>) {
  return new Tarifario({
    id: overrides.id ?? crypto.randomUUID(),
    hotel_id: overrides.hotel_id ?? 'hotel-1',
    categoria_quarto_id: overrides.categoria_quarto_id ?? 'cat-1',
    regime_alimentacao_id: overrides.regime_alimentacao_id ?? 'regime-1',
    nome: overrides.nome ?? 'Tarifa Padrão',
    datas: overrides.datas ?? ['2027-03-01'],
    valor_diaria: overrides.valor_diaria ?? '200.00',
    ativo: overrides.ativo ?? true,
    categoria_quarto: { id: 'cat-1', nome: 'Suítes Luxo', status: 'S' },
    regime_alimentacao: {
      id: overrides.regime_alimentacao_id ?? 'regime-1',
      titulo: 'Meia Pensão',
      cor_pulseira: '#2563EB',
    },
    criado_em: '2026-11-02T12:00:00.000Z',
    atualizado_em: '2026-11-02T12:00:00.000Z',
  })
}

describe('TarifarioPricingService & CalcularTarifaReservaUseCase (CA10 & RN06)', () => {
  const service = new TarifarioPricingService()

  it('selects the lowest applicable daily rate for each night when multiple active rate plans are eligible', () => {
    const t_base = make_tarifario({
      id: 't-base',
      nome: 'Tarifa Base',
      datas: ['2027-03-09', '2027-03-10', '2027-03-11', '2027-03-12'],
      valor_diaria: '250.00',
    })
    const t_promo = make_tarifario({
      id: 't-promo',
      nome: 'Promoção Fim de Semana',
      datas: ['2027-03-10', '2027-03-11'],
      valor_diaria: '180.50',
    })
    const t_inativo = make_tarifario({
      id: 't-inativo',
      nome: 'Inativo Mais Barato',
      datas: ['2027-03-09', '2027-03-10', '2027-03-11', '2027-03-12'],
      valor_diaria: '99.00',
      ativo: false,
    })

    const result = service.calcular_reserva({
      hotel_id: 'hotel-1',
      categoria_quarto_id: 'cat-1',
      check_in: '2027-03-09',
      check_out: '2027-03-13',
      tarifarios: [t_base, t_promo, t_inativo],
    })

    expect(result.noites).toEqual([
      {
        data: '2027-03-09',
        tarifario_id: 't-base',
        tarifario_nome: 'Tarifa Base',
        valor_diaria: '250.00',
      },
      {
        data: '2027-03-10',
        tarifario_id: 't-promo',
        tarifario_nome: 'Promoção Fim de Semana',
        valor_diaria: '180.50',
      },
      {
        data: '2027-03-11',
        tarifario_id: 't-promo',
        tarifario_nome: 'Promoção Fim de Semana',
        valor_diaria: '180.50',
      },
      {
        data: '2027-03-12',
        tarifario_id: 't-base',
        tarifario_nome: 'Tarifa Base',
        valor_diaria: '250.00',
      },
    ])
    expect(result.valor_total).toBe('861.00')
  })

  it('calculates across multiple rate plans via CalcularTarifaReservaUseCase and throws when a night has no active coverage', async () => {
    const tarifarios_repo = new InMemoryTarifarioRepository()
    const categorias_repo = new InMemoryCategoriaQuartoRepository()
    const cat = await categorias_repo.create({
      hotel_id: 'hotel-1',
      nome: 'Suítes Luxo',
      status: 'S',
    })

    await tarifarios_repo.create({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat.id,
      regime_alimentacao_id: 'regime-1',
      nome: 'Março',
      datas: ['2027-03-31'],
      valor_diaria: '200.00',
      ativo: true,
    })
    await tarifarios_repo.create({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat.id,
      regime_alimentacao_id: 'regime-1',
      nome: 'Abril',
      datas: ['2027-04-01'],
      valor_diaria: '300.00',
      ativo: true,
    })

    const use_case = new CalcularTarifaReservaUseCase(
      tarifarios_repo,
      categorias_repo,
    )
    const calculo = await use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat.id,
      check_in: '2027-03-31',
      check_out: '2027-04-02',
    })

    expect(calculo.noites).toHaveLength(2)
    expect(calculo.noites[0].valor_diaria).toBe('200.00')
    expect(calculo.noites[1].valor_diaria).toBe('300.00')
    expect(calculo.valor_total).toBe('500.00')

    await expect(
      use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat.id,
        check_in: '2027-05-01',
        check_out: '2027-05-03',
      }),
    ).rejects.toThrow(TarifarioSemCoberturaError)
  })
})

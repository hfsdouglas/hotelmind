import { beforeEach, describe, expect, it } from 'vitest'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioSemCoberturaError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { CalcularTarifaReservaUseCase } from './calcular_tarifa_reserva_use_case'

const HOTEL_A = 'hotel-a'
const HOTEL_B = 'hotel-b'

describe('CalcularTarifaReservaUseCase', () => {
  let tarifarios_repo: InMemoryTarifarioRepository
  let categorias_repo: InMemoryCategoriaQuartoRepository
  let calcular: CalcularTarifaReservaUseCase

  beforeEach(() => {
    tarifarios_repo = new InMemoryTarifarioRepository()
    categorias_repo = new InMemoryCategoriaQuartoRepository()
    tarifarios_repo.register_regime_alimentacao('regime-1', 'Café', '#2563EB')
    tarifarios_repo.register_regime_alimentacao('regime-2', 'Pensão', '#10B981')
    calcular = new CalcularTarifaReservaUseCase(
      tarifarios_repo,
      categorias_repo
    )
  })

  async function seed_categoria(hotel_id = HOTEL_A, status: 'S' | 'N' = 'S') {
    const categoria = await categorias_repo.create({
      hotel_id,
      nome: 'Suíte',
      status,
    })
    tarifarios_repo.register_category(categoria.id, categoria.nome, status)
    return categoria
  }

  function seed_tarifa(input: {
    hotel_id?: string
    categoria_id: string
    datas: string[]
    valor: string
    nome?: string
    parceiro_id?: string | null
    regime_id?: string
    minimo_diarias?: number
    ativo?: boolean
  }) {
    return tarifarios_repo.create({
      hotel_id: input.hotel_id ?? HOTEL_A,
      categoria_quarto_id: input.categoria_id,
      regime_alimentacao_id: input.regime_id ?? 'regime-1',
      parceiro_id: input.parceiro_id ?? null,
      nome: input.nome ?? 'Tarifa',
      datas: input.datas,
      valor_diaria: input.valor,
      minimo_diarias: input.minimo_diarias,
      ativo: input.ativo ?? true,
    })
  }

  it('soma as diárias das noites da estadia (check-out não é cobrado)', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01', '2026-12-02', '2026-12-03'],
      valor: '250.50',
      nome: 'Base',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
    })

    expect(result.noites.map(n => n.data)).toEqual(['2026-12-01', '2026-12-02'])
    expect(result.noites[0]).toMatchObject({
      tarifario_nome: 'Base',
      valor_diaria: '250.50',
    })
    expect(result.valor_total).toBe('501.00')
  })

  it('calcula uma única noite', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '199.99',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
    })

    expect(result.noites).toHaveLength(1)
    expect(result.valor_total).toBe('199.99')
  })

  it('atravessa virada de mês e de ano', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-30', '2026-12-31', '2027-01-01'],
      valor: '100.00',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-30',
      check_out: '2027-01-02',
    })

    expect(result.noites.map(n => n.data)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
    ])
    expect(result.valor_total).toBe('300.00')
  })

  it('inclui 29 de fevereiro em ano bissexto', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2028-02-28', '2028-02-29'],
      valor: '100.00',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2028-02-28',
      check_out: '2028-03-01',
    })

    expect(result.noites.map(n => n.data)).toEqual(['2028-02-28', '2028-02-29'])
  })

  it('combina tarifários diferentes em datas não contíguas', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '100.00',
      nome: 'Baixa',
    })
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-02'],
      valor: '300.00',
      nome: 'Alta',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-01',
      check_out: '2026-12-03',
    })

    expect(result.noites.map(n => n.tarifario_nome)).toEqual(['Baixa', 'Alta'])
    expect(result.valor_total).toBe('400.00')
  })

  it('escolhe a menor diária quando mais de um tarifário cobre a noite (regimes distintos)', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '400.00',
      nome: 'Cara',
      regime_id: 'regime-1',
    })
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '350.00',
      nome: 'Barata',
      regime_id: 'regime-2',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
    })

    expect(result.noites[0].tarifario_nome).toBe('Barata')
    expect(result.valor_total).toBe('350.00')
  })

  it('ignora tarifários inativos', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '10.00',
      nome: 'Inativa',
      ativo: false,
    })
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01'],
      valor: '200.00',
      nome: 'Ativa',
    })

    const result = await calcular.execute({
      hotel_id: HOTEL_A,
      categoria_quarto_id: cat.id,
      check_in: '2026-12-01',
      check_out: '2026-12-02',
    })

    expect(result.noites[0].tarifario_nome).toBe('Ativa')
  })

  it('lança TarifarioSemCoberturaError indicando a primeira noite descoberta', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-01', '2026-12-03'],
      valor: '100.00',
    })

    await expect(
      calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-04',
      })
    ).rejects.toThrow(/2026-12-02/)
  })

  it('lança TarifarioSemCoberturaError quando não há nenhum tarifário', async () => {
    const cat = await seed_categoria()

    await expect(
      calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })
    ).rejects.toThrow(TarifarioSemCoberturaError)
  })

  it('não cobre a noite do próprio check-out (tarifa só no dia do check-out não basta)', async () => {
    const cat = await seed_categoria()
    await seed_tarifa({
      categoria_id: cat.id,
      datas: ['2026-12-02'],
      valor: '100.00',
    })

    await expect(
      calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })
    ).rejects.toThrow(TarifarioSemCoberturaError)
  })

  describe('estadia mínima', () => {
    it('rejeita estadia menor que o mínimo de diárias do tarifário', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01', '2026-12-02', '2026-12-03'],
        valor: '100.00',
        minimo_diarias: 3,
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: cat.id,
          check_in: '2026-12-01',
          check_out: '2026-12-03',
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
    })

    it('aceita estadia exatamente igual ao mínimo', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01', '2026-12-02', '2026-12-03'],
        valor: '100.00',
        minimo_diarias: 3,
      })

      const result = await calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-04',
      })

      expect(result.valor_total).toBe('300.00')
    })

    it('usa tarifário sem mínimo como alternativa quando o com mínimo não se aplica', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '50.00',
        nome: 'Promo 3 noites',
        minimo_diarias: 3,
        regime_id: 'regime-1',
      })
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '120.00',
        nome: 'Padrão',
        regime_id: 'regime-2',
      })

      const result = await calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })

      expect(result.noites[0].tarifario_nome).toBe('Padrão')
    })
  })

  describe('parceiro comercial', () => {
    it('usa apenas a tarifa do parceiro quando informado', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '500.00',
        nome: 'Pública',
      })
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '380.00',
        nome: 'Parceiro',
        parceiro_id: 'parceiro-1',
        regime_id: 'regime-2',
      })

      const result = await calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        parceiro_id: 'parceiro-1',
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })

      expect(result.noites[0].tarifario_nome).toBe('Parceiro')
      expect(result.valor_total).toBe('380.00')
    })

    it('usa apenas tarifas públicas quando não há parceiro', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '500.00',
        nome: 'Pública',
      })
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '380.00',
        nome: 'Parceiro',
        parceiro_id: 'parceiro-1',
        regime_id: 'regime-2',
      })

      const result = await calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })

      expect(result.noites[0].tarifario_nome).toBe('Pública')
    })

    it('não faz fallback para tarifa pública quando o parceiro não tem tarifa', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '500.00',
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: cat.id,
          parceiro_id: 'parceiro-sem-tarifa',
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
    })

    it('não usa tarifa de outro parceiro', async () => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01'],
        valor: '300.00',
        parceiro_id: 'parceiro-2',
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: cat.id,
          parceiro_id: 'parceiro-1',
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
    })
  })

  describe('validação de datas', () => {
    it.each([
      ['check-out igual ao check-in', '2026-12-01', '2026-12-01'],
      ['check-out anterior ao check-in', '2026-12-05', '2026-12-01'],
      ['check-in com formato inválido', '01/12/2026', '2026-12-03'],
      ['check-out com data inexistente', '2026-12-01', '2026-02-30'],
    ])('rejeita %s', async (_nome, check_in, check_out) => {
      const cat = await seed_categoria()
      await seed_tarifa({
        categoria_id: cat.id,
        datas: ['2026-12-01', '2026-12-02'],
        valor: '100.00',
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: cat.id,
          check_in,
          check_out,
        })
      ).rejects.toThrow(TarifarioValidationError)
    })
  })

  describe('categoria', () => {
    it('lança CategoriaQuartoInativaError para categoria inexistente', async () => {
      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: 'nao-existe',
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(CategoriaQuartoInativaError)
    })

    it('lança CategoriaQuartoInativaError para categoria inativa', async () => {
      const cat = await seed_categoria(HOTEL_A, 'N')

      await expect(
        calcular.execute({
          hotel_id: HOTEL_A,
          categoria_quarto_id: cat.id,
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(CategoriaQuartoInativaError)
    })
  })

  describe('isolamento entre hotéis', () => {
    it('hotel B não calcula usando categoria do hotel A', async () => {
      const cat_a = await seed_categoria(HOTEL_A)
      await seed_tarifa({
        hotel_id: HOTEL_A,
        categoria_id: cat_a.id,
        datas: ['2026-12-01'],
        valor: '100.00',
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_B,
          categoria_quarto_id: cat_a.id,
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(CategoriaQuartoInativaError)
    })

    it('não usa tarifas de outro hotel, mesmo que sejam mais baratas', async () => {
      const cat_a = await seed_categoria(HOTEL_A)
      const cat_b = await seed_categoria(HOTEL_B)
      await seed_tarifa({
        hotel_id: HOTEL_A,
        categoria_id: cat_a.id,
        datas: ['2026-12-01'],
        valor: '300.00',
        nome: 'Tarifa A',
      })
      await seed_tarifa({
        hotel_id: HOTEL_B,
        categoria_id: cat_b.id,
        datas: ['2026-12-01'],
        valor: '1.00',
        nome: 'Tarifa B',
      })

      const result = await calcular.execute({
        hotel_id: HOTEL_A,
        categoria_quarto_id: cat_a.id,
        check_in: '2026-12-01',
        check_out: '2026-12-02',
      })

      expect(result.noites[0].tarifario_nome).toBe('Tarifa A')
      expect(result.valor_total).toBe('300.00')
    })

    it('hotel sem tarifa própria não herda cobertura de outro hotel', async () => {
      const cat_a = await seed_categoria(HOTEL_A)
      const cat_b = await seed_categoria(HOTEL_B)
      await seed_tarifa({
        hotel_id: HOTEL_A,
        categoria_id: cat_a.id,
        datas: ['2026-12-01'],
        valor: '100.00',
      })

      await expect(
        calcular.execute({
          hotel_id: HOTEL_B,
          categoria_quarto_id: cat_b.id,
          check_in: '2026-12-01',
          check_out: '2026-12-02',
        })
      ).rejects.toThrow(TarifarioSemCoberturaError)
    })
  })
})

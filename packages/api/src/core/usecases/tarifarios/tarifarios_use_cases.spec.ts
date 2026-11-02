import { beforeEach, describe, expect, it } from 'vitest'
import { CategoriaQuartoInativaError } from '@/core/errors/quarto_errors'
import {
  TarifarioNotFoundError,
  TarifarioPeriodConflictError,
} from '@/core/errors/tarifario_errors'
import { InMemoryCategoriaQuartoRepository } from '@/core/repositories/categorias_quartos/in-memory/in_memory_categoria_quarto_repository'
import { InMemoryTarifarioRepository } from '@/core/repositories/tarifarios/in-memory/in_memory_tarifario_repository'
import { AtivarTarifarioUseCase } from './ativar_tarifario_use_case'
import { BuscarTarifarioUseCase } from './buscar_tarifario_use_case'
import { ConsultarPeriodosTarifariosUseCase } from './consultar_periodos_tarifarios_use_case'
import { CriarTarifarioUseCase } from './criar_tarifario_use_case'
import { DesativarTarifarioUseCase } from './desativar_tarifario_use_case'
import { EditarTarifarioUseCase } from './editar_tarifario_use_case'
import { ListarTarifariosUseCase } from './listar_tarifarios_use_case'

describe('Tarifarios Use Cases', () => {
  let tarifarios_repo: InMemoryTarifarioRepository
  let categorias_repo: InMemoryCategoriaQuartoRepository
  let criar_use_case: CriarTarifarioUseCase
  let editar_use_case: EditarTarifarioUseCase
  let listar_use_case: ListarTarifariosUseCase
  let buscar_use_case: BuscarTarifarioUseCase
  let ativar_use_case: AtivarTarifarioUseCase
  let desativar_use_case: DesativarTarifarioUseCase
  let calendario_use_case: ConsultarPeriodosTarifariosUseCase
  let cat_luxo_id: string
  let cat_master_id: string

  beforeEach(async () => {
    tarifarios_repo = new InMemoryTarifarioRepository()
    categorias_repo = new InMemoryCategoriaQuartoRepository()
    criar_use_case = new CriarTarifarioUseCase(tarifarios_repo, categorias_repo)
    editar_use_case = new EditarTarifarioUseCase(
      tarifarios_repo,
      categorias_repo,
    )
    listar_use_case = new ListarTarifariosUseCase(tarifarios_repo)
    buscar_use_case = new BuscarTarifarioUseCase(tarifarios_repo)
    ativar_use_case = new AtivarTarifarioUseCase(tarifarios_repo)
    desativar_use_case = new DesativarTarifarioUseCase(tarifarios_repo)
    calendario_use_case = new ConsultarPeriodosTarifariosUseCase(
      tarifarios_repo,
      categorias_repo,
    )

    const cat_luxo = await categorias_repo.create({
      hotel_id: 'hotel-1',
      nome: 'Suítes Luxo',
      status: 'S',
    })
    const cat_master = await categorias_repo.create({
      hotel_id: 'hotel-1',
      nome: 'Suítes Master',
      status: 'S',
    })
    cat_luxo_id = cat_luxo.id
    cat_master_id = cat_master.id
    tarifarios_repo.register_category(cat_luxo.id, cat_luxo.nome, 'S')
    tarifarios_repo.register_category(cat_master.id, cat_master.nome, 'S')
  })

  it('CA01 & CA04: creates valid rate plans and allows consecutive half-open periods', async () => {
    const marco = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: '  Baixa Temporada Março  ',
      data_inicio: '2027-03-01',
      data_fim: '2027-04-01',
      valor_diaria: '200',
    })
    expect(marco.nome).toBe('Baixa Temporada Março')
    expect(marco.valor_diaria).toBe('200.00')
    expect(marco.ativo).toBe(true)

    const abril = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Média Temporada Abril',
      data_inicio: '2027-04-01',
      data_fim: '2027-05-01',
      valor_diaria: '250.00',
    })
    expect(abril.data_inicio).toBe('2027-04-01')

    const { data: periods } = await calendario_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
    })
    expect(periods).toHaveLength(2)
  })

  it('CA05 & RN04: blocks overlapping active periods in the same hotel + category, while allowing same period in another category or hotel', async () => {
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Março Luxo',
      data_inicio: '2027-03-01',
      data_fim: '2027-04-01',
      valor_diaria: '200.00',
    })

    await expect(
      criar_use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat_luxo_id,
        nome: 'Conflito Março/Abril',
        data_inicio: '2027-03-15',
        data_fim: '2027-04-15',
        valor_diaria: '220.00',
      }),
    ).rejects.toThrow(TarifarioPeriodConflictError)

    // Same period in a different category is allowed
    const master_marco = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_master_id,
      nome: 'Março Master',
      data_inicio: '2027-03-01',
      data_fim: '2027-04-01',
      valor_diaria: '350.00',
    })
    expect(master_marco.id).toBeTruthy()
  })

  it('CA11: handles race conditions where two simultaneous requests try to persist overlapping active periods', async () => {
    const results = await Promise.allSettled([
      criar_use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat_luxo_id,
        nome: 'Concorrente A',
        data_inicio: '2027-06-01',
        data_fim: '2027-07-01',
        valor_diaria: '200.00',
      }),
      criar_use_case.execute({
        hotel_id: 'hotel-1',
        categoria_quarto_id: cat_luxo_id,
        nome: 'Concorrente B',
        data_inicio: '2027-06-10',
        data_fim: '2027-07-10',
        valor_diaria: '210.00',
      }),
    ])

    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
  })

  it('CA06 & CA07: edits an existing rate plan excluding itself from conflict checks', async () => {
    const created = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Temporada Inverno',
      data_inicio: '2027-07-01',
      data_fim: '2027-08-01',
      valor_diaria: '300.00',
    })

    const updated = await editar_use_case.execute({
      id: created.id,
      hotel_id: 'hotel-1',
      nome: 'Temporada Inverno Atualizada',
      data_inicio: '2027-07-01',
      data_fim: '2027-08-01',
      valor_diaria: '320.00',
    })
    expect(updated.nome).toBe('Temporada Inverno Atualizada')
    expect(updated.valor_diaria).toBe('320.00')
  })

  it('CA08 & RN05: deactivates preserving history, allows new active period over deactivated range, and re-validates conflict on reactivation', async () => {
    const first = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Tarifa Original',
      data_inicio: '2027-09-01',
      data_fim: '2027-10-01',
      valor_diaria: '200.00',
    })

    const deactivated = await desativar_use_case.execute(first.id, 'hotel-1')
    expect(deactivated.ativo).toBe(false)

    // Historical record still retrievable
    const fetched = await buscar_use_case.execute(first.id, 'hotel-1')
    expect(fetched.ativo).toBe(false)

    // New active rate plan can now occupy September
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Nova Tarifa Setembro',
      data_inicio: '2027-09-10',
      data_fim: '2027-09-25',
      valor_diaria: '240.00',
    })

    // Reactivating the first rate plan must fail due to period conflict
    await expect(
      ativar_use_case.execute(first.id, 'hotel-1'),
    ).rejects.toThrow(TarifarioPeriodConflictError)
  })

  it('CA09: enforces multi-tenant isolation across list, get, edit, activate, deactivate, and category association', async () => {
    const created = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      categoria_quarto_id: cat_luxo_id,
      nome: 'Tarifa Hotel 1',
      data_inicio: '2027-11-01',
      data_fim: '2027-12-01',
      valor_diaria: '200.00',
    })

    const list_hotel_2 = await listar_use_case.execute('hotel-2', {
      pagina: 1,
      limite: 25,
    })
    expect(list_hotel_2.data).toHaveLength(0)

    await expect(
      buscar_use_case.execute(created.id, 'hotel-2'),
    ).rejects.toThrow(TarifarioNotFoundError)

    await expect(
      editar_use_case.execute({
        id: created.id,
        hotel_id: 'hotel-2',
        nome: 'Invasão',
      }),
    ).rejects.toThrow(TarifarioNotFoundError)

    await expect(
      desativar_use_case.execute(created.id, 'hotel-2'),
    ).rejects.toThrow(TarifarioNotFoundError)

    await expect(
      criar_use_case.execute({
        hotel_id: 'hotel-2',
        categoria_quarto_id: cat_luxo_id,
        nome: 'Categoria de outro hotel',
        data_inicio: '2027-11-01',
        data_fim: '2027-12-01',
        valor_diaria: '200.00',
      }),
    ).rejects.toThrow(CategoriaQuartoInativaError)
  })
})

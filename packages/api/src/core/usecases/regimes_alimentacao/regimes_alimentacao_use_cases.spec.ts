import { beforeEach, describe, expect, it } from 'vitest'
import {
  RegimeAlimentacaoConflictError,
  RegimeAlimentacaoNotFoundError,
} from '@/core/errors/regime_alimentacao_errors'
import { InMemoryRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/in-memory/in_memory_regime_alimentacao_repository'
import { AtivarRegimeAlimentacaoUseCase } from './ativar_regime_alimentacao_use_case'
import { BuscarRegimeAlimentacaoUseCase } from './buscar_regime_alimentacao_use_case'
import { CriarRegimeAlimentacaoUseCase } from './criar_regime_alimentacao_use_case'
import { DesativarRegimeAlimentacaoUseCase } from './desativar_regime_alimentacao_use_case'
import { EditarRegimeAlimentacaoUseCase } from './editar_regime_alimentacao_use_case'
import { ListarRegimesAlimentacaoUseCase } from './listar_regimes_alimentacao_use_case'

describe('Regimes de Alimentação Use Cases', () => {
  let repository: InMemoryRegimeAlimentacaoRepository
  let criar_use_case: CriarRegimeAlimentacaoUseCase
  let editar_use_case: EditarRegimeAlimentacaoUseCase
  let listar_use_case: ListarRegimesAlimentacaoUseCase
  let buscar_use_case: BuscarRegimeAlimentacaoUseCase
  let ativar_use_case: AtivarRegimeAlimentacaoUseCase
  let desativar_use_case: DesativarRegimeAlimentacaoUseCase

  beforeEach(() => {
    repository = new InMemoryRegimeAlimentacaoRepository()
    criar_use_case = new CriarRegimeAlimentacaoUseCase(repository)
    editar_use_case = new EditarRegimeAlimentacaoUseCase(repository)
    listar_use_case = new ListarRegimesAlimentacaoUseCase(repository)
    buscar_use_case = new BuscarRegimeAlimentacaoUseCase(repository)
    ativar_use_case = new AtivarRegimeAlimentacaoUseCase(repository)
    desativar_use_case = new DesativarRegimeAlimentacaoUseCase(repository)
  })

  it('creates a new regime de alimentacao successfully', async () => {
    const regime = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'Café da Manhã',
      descricao: 'Apenas café da manhã incluso',
      cor_pulseira: '#3b82f6',
    })

    expect(regime.id).toBeDefined()
    expect(regime.titulo).toBe('Café da Manhã')
    expect(regime.cor_pulseira).toBe('#3B82F6')
    expect(regime.ativo).toBe(true)

    const found = await buscar_use_case.execute({
      id: regime.id,
      hotel_id: 'hotel-1',
    })
    expect(found.id).toBe(regime.id)
  })

  it('does not allow duplicate title for the same hotel', async () => {
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'All Inclusive',
      cor_pulseira: '#ef4444',
    })

    await expect(
      criar_use_case.execute({
        hotel_id: 'hotel-1',
        titulo: 'All Inclusive',
        cor_pulseira: '#10b981',
      })
    ).rejects.toBeInstanceOf(RegimeAlimentacaoConflictError)
  })

  it('allows same title for different hotels', async () => {
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'All Inclusive',
      cor_pulseira: '#ef4444',
    })

    const regime2 = await criar_use_case.execute({
      hotel_id: 'hotel-2',
      titulo: 'All Inclusive',
      cor_pulseira: '#10b981',
    })

    expect(regime2.hotel_id).toBe('hotel-2')
  })

  it('updates an existing regime de alimentacao', async () => {
    const created = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'Meia Pensão',
      cor_pulseira: '#f59e0b',
    })

    const updated = await editar_use_case.execute({
      id: created.id,
      hotel_id: 'hotel-1',
      titulo: 'Meia Pensão Flex',
      descricao: 'Café + almoço ou jantar',
      cor_pulseira: '#8b5cf6',
      ativo: true,
    })

    expect(updated.titulo).toBe('Meia Pensão Flex')
    expect(updated.descricao).toBe('Café + almoço ou jantar')
    expect(updated.cor_pulseira).toBe('#8B5CF6')
  })

  it('throws error when updating non-existent regime', async () => {
    await expect(
      editar_use_case.execute({
        id: 'inexistente',
        hotel_id: 'hotel-1',
        titulo: 'Novo Nome',
        cor_pulseira: '#ffffff',
        ativo: true,
      })
    ).rejects.toBeInstanceOf(RegimeAlimentacaoNotFoundError)
  })

  it('lists and filters regimes de alimentacao with pagination', async () => {
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'Café da Manhã',
      cor_pulseira: '#3b82f6',
    })
    await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'Pensão Completa',
      cor_pulseira: '#10b981',
    })

    const result = await listar_use_case.execute({
      hotel_id: 'hotel-1',
      busca: 'completa',
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].titulo).toBe('Pensão Completa')
  })

  it('activates and deactivates a regime de alimentacao', async () => {
    const regime = await criar_use_case.execute({
      hotel_id: 'hotel-1',
      titulo: 'All Inclusive VIP',
      cor_pulseira: '#ec4899',
    })

    const desativado = await desativar_use_case.execute({
      id: regime.id,
      hotel_id: 'hotel-1',
    })
    expect(desativado.ativo).toBe(false)

    const ativado = await ativar_use_case.execute({
      id: regime.id,
      hotel_id: 'hotel-1',
    })
    expect(ativado.ativo).toBe(true)
  })
})

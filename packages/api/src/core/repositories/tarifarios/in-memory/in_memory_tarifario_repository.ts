import type { PeriodoTarifarioCalendario } from '@hotelmind/contracts'
import { normalize_datas, Tarifario } from '@/core/entities/tarifario'
import { TarifarioPeriodConflictError } from '@/core/errors/tarifario_errors'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateTarifarioData,
  FindCalendarioPeriodsInput,
  FindOverlappingActiveInput,
  ITarifarioRepository,
  TarifarioListFilter,
  UpdateTarifarioData,
} from '@/core/repositories/tarifarios/tarifario.repository'

export class InMemoryTarifarioRepository implements ITarifarioRepository {
  private items: Tarifario[] = []
  private category_names = new Map<
    string,
    { nome: string; status: 'S' | 'N' }
  >()
  private regime_names = new Map<
    string,
    { titulo: string; cor_pulseira: string }
  >()

  register_category(id: string, nome: string, status: 'S' | 'N' = 'S') {
    this.category_names.set(id, { nome, status })
  }

  register_regime_alimentacao(
    id: string,
    titulo: string,
    cor_pulseira: string
  ) {
    this.regime_names.set(id, { titulo, cor_pulseira })
  }

  async list(
    hotel_id: string,
    input: TarifarioListFilter
  ): Promise<PaginatedResult<Tarifario>> {
    const filtered = this.items
      .filter(item => {
        if (item.hotel_id !== hotel_id) return false
        if (
          input.categoria_quarto_id?.length &&
          !input.categoria_quarto_id.includes(item.categoria_quarto_id)
        ) {
          return false
        }
        if (typeof input.ativo === 'boolean' && item.ativo !== input.ativo) {
          return false
        }
        if (input.busca) {
          const term = input.busca.toLowerCase()
          const matches_name = item.nome.toLowerCase().includes(term)
          const matches_cat = item.categoria_quarto.nome
            .toLowerCase()
            .includes(term)
          if (!matches_name && !matches_cat) return false
        }
        return true
      })
      .sort((a, b) => (a.datas[0] ?? '').localeCompare(b.datas[0] ?? ''))

    const start = (input.pagina - 1) * input.limite
    return {
      data: filtered.slice(start, start + input.limite),
      meta: {
        pagina: input.pagina,
        limite: input.limite,
        total: filtered.length,
        ultima_pagina: Math.max(1, Math.ceil(filtered.length / input.limite)),
      },
    }
  }

  async find_by_id(id: string, hotel_id: string): Promise<Tarifario | null> {
    return (
      this.items.find(item => item.id === id && item.hotel_id === hotel_id) ??
      null
    )
  }

  async find_periods_by_category(
    input: FindCalendarioPeriodsInput
  ): Promise<PeriodoTarifarioCalendario[]> {
    return this.items
      .filter(item => {
        if (item.hotel_id !== input.hotel_id) return false
        if (item.categoria_quarto_id !== input.categoria_quarto_id) return false
        if (input.data_inicio && input.data_fim) {
          const start = input.data_inicio
          const end = input.data_fim
          return item.datas.some(d => d >= start && d <= end)
        }
        return true
      })
      .sort((a, b) => (a.datas[0] ?? '').localeCompare(b.datas[0] ?? ''))
      .map(item => ({
        id: item.id,
        categoria_quarto_id: item.categoria_quarto_id,
        nome: item.nome,
        datas: item.datas,
        valor_diaria: item.valor_diaria,
        ativo: item.ativo,
      }))
  }

  private find_overlapping_active_sync(
    input: FindOverlappingActiveInput
  ): Tarifario | null {
    const requested = new Set(normalize_datas(input.datas))
    return (
      this.items.find(
        item =>
          item.hotel_id === input.hotel_id &&
          item.categoria_quarto_id === input.categoria_quarto_id &&
          item.ativo &&
          (!input.exclude_id || item.id !== input.exclude_id) &&
          item.datas.some(d => requested.has(d))
      ) ?? null
    )
  }

  async find_overlapping_active(
    input: FindOverlappingActiveInput
  ): Promise<Tarifario | null> {
    return this.find_overlapping_active_sync(input)
  }

  async find_active_for_range(input: {
    hotel_id: string
    categoria_quarto_id: string
    data_inicio: string
    data_fim: string
  }): Promise<Tarifario[]> {
    return this.items.filter(
      item =>
        item.hotel_id === input.hotel_id &&
        item.categoria_quarto_id === input.categoria_quarto_id &&
        item.ativo &&
        item.datas.some(d => d >= input.data_inicio && d < input.data_fim)
    )
  }

  async create(data: CreateTarifarioData): Promise<Tarifario> {
    if (data.ativo) {
      const conflict = this.find_overlapping_active_sync({
        hotel_id: data.hotel_id,
        categoria_quarto_id: data.categoria_quarto_id,
        datas: data.datas,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    const cat_meta = this.category_names.get(data.categoria_quarto_id) ?? {
      nome: 'Categoria',
      status: 'S' as const,
    }
    const regime_meta = this.regime_names.get(data.regime_alimentacao_id) ?? {
      titulo: 'Regime',
      cor_pulseira: '#2563EB',
    }
    const now = new Date().toISOString()
    const entity = new Tarifario({
      id: crypto.randomUUID(),
      hotel_id: data.hotel_id,
      categoria_quarto_id: data.categoria_quarto_id,
      regime_alimentacao_id: data.regime_alimentacao_id,
      nome: data.nome,
      datas: data.datas,
      valor_diaria: data.valor_diaria,
      ativo: data.ativo,
      categoria_quarto: {
        id: data.categoria_quarto_id,
        nome: cat_meta.nome,
        status: cat_meta.status,
      },
      regime_alimentacao: {
        id: data.regime_alimentacao_id,
        titulo: regime_meta.titulo,
        cor_pulseira: regime_meta.cor_pulseira,
      },
      criado_em: now,
      atualizado_em: now,
    })
    this.items.push(entity)
    return entity
  }

  async update(data: UpdateTarifarioData): Promise<Tarifario> {
    const index = this.items.findIndex(
      item => item.id === data.id && item.hotel_id === data.hotel_id
    )
    if (index < 0) {
      throw new Error('Tarifário não encontrado.')
    }

    if (data.ativo) {
      const conflict = this.find_overlapping_active_sync({
        hotel_id: data.hotel_id,
        categoria_quarto_id: data.categoria_quarto_id,
        datas: data.datas,
        exclude_id: data.id,
      })
      if (conflict) {
        throw new TarifarioPeriodConflictError()
      }
    }

    const current = this.items[index]
    const cat_meta = this.category_names.get(data.categoria_quarto_id) ?? {
      nome: current.categoria_quarto.nome,
      status: current.categoria_quarto.status,
    }
    const regime_id =
      data.regime_alimentacao_id ?? current.regime_alimentacao_id
    const regime_meta =
      this.regime_names.get(regime_id) ??
      (current.regime_alimentacao?.id === regime_id
        ? current.regime_alimentacao
        : { titulo: 'Regime', cor_pulseira: '#2563EB' })

    const updated = new Tarifario({
      id: current.id,
      hotel_id: current.hotel_id,
      categoria_quarto_id: data.categoria_quarto_id,
      regime_alimentacao_id: regime_id,
      nome: data.nome,
      datas: data.datas,
      valor_diaria: data.valor_diaria,
      ativo: data.ativo,
      categoria_quarto: {
        id: data.categoria_quarto_id,
        nome: cat_meta.nome,
        status: cat_meta.status,
      },
      regime_alimentacao: {
        id: regime_id,
        titulo: regime_meta.titulo,
        cor_pulseira: regime_meta.cor_pulseira,
      },
      criado_em: current.criado_em,
      atualizado_em: new Date().toISOString(),
    })
    this.items[index] = updated
    return updated
  }
}

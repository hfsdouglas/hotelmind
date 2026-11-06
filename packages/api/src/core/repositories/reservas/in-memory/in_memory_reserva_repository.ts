import { randomUUID } from 'node:crypto'
import type { ReservaListParams, ReservaStatus } from '@hotelmind/contracts'
import { Reserva } from '@/core/entities/reserva'
import { ReservaHospede } from '@/core/entities/reserva_hospede'
import { ReservaValidationError } from '@/core/errors/reserva_errors'
import type { PaginatedResult } from '@/core/repositories/pagination'
import type {
  CreateReservaData,
  CreateReservaHospedeData,
  IReservaHospedeRepository,
  IReservaRepository,
  UpdateFichaHospedeData,
  UpdateReservaData,
} from '@/core/repositories/reservas/reserva_repository'
import { computeObjectSha256 } from '@/core/utils/canonical_hash'
import { extract_hotel_prefix } from '@/core/utils/hotel_code'

export class InMemoryReservaHospedeRepository
  implements IReservaHospedeRepository
{
  public items: ReservaHospede[] = []

  async create_many(hospedes: CreateReservaHospedeData[]): Promise<void> {
    for (const h of hospedes) {
      const entity = new ReservaHospede({
        id: randomUUID(),
        reserva_id: h.reserva_id,
        posicao: h.posicao,
        ficha_status: h.ficha_status ?? 'pendente',
        nome_completo: h.nome_completo,
      })
      this.items.push(entity)
    }
  }

  async find_by_reserva_id(reserva_id: string): Promise<ReservaHospede[]> {
    return this.items
      .filter(h => h.reserva_id === reserva_id)
      .sort((a, b) => a.posicao - b.posicao)
  }

  async find_by_reserva_and_posicao(
    reserva_id: string,
    posicao: number
  ): Promise<ReservaHospede | null> {
    const item = this.items.find(
      h => h.reserva_id === reserva_id && h.posicao === posicao
    )
    return item ?? null
  }

  async update_ficha(
    reserva_id: string,
    posicao: number,
    data: UpdateFichaHospedeData
  ): Promise<ReservaHospede | null> {
    const index = this.items.findIndex(
      h => h.reserva_id === reserva_id && h.posicao === posicao
    )
    if (index === -1) return null

    const current = this.items[index]
    const updated = new ReservaHospede({
      id: current.id,
      reserva_id: current.reserva_id,
      posicao: current.posicao,
      ficha_status: data.ficha_status ?? current.ficha_status,
      preenchido_por:
        data.preenchido_por !== undefined
          ? data.preenchido_por
          : current.preenchido_por,
      preenchido_em:
        data.preenchido_em !== undefined
          ? data.preenchido_em
          : current.preenchido_em,
      nome_completo:
        data.nome_completo !== undefined
          ? data.nome_completo
          : current.nome_completo,
      nacionalidade:
        data.nacionalidade !== undefined
          ? data.nacionalidade
          : current.nacionalidade,
      data_nascimento:
        data.data_nascimento !== undefined
          ? data.data_nascimento
          : current.data_nascimento,
      sexo: data.sexo !== undefined ? data.sexo : current.sexo,
      profissao:
        data.profissao !== undefined ? data.profissao : current.profissao,
      tipo_documento:
        data.tipo_documento !== undefined
          ? data.tipo_documento
          : current.tipo_documento,
      numero_documento:
        data.numero_documento !== undefined
          ? data.numero_documento
          : current.numero_documento,
      logradouro:
        data.logradouro !== undefined ? data.logradouro : current.logradouro,
      numero_endereco:
        data.numero_endereco !== undefined
          ? data.numero_endereco
          : current.numero_endereco,
      complemento:
        data.complemento !== undefined ? data.complemento : current.complemento,
      bairro: data.bairro !== undefined ? data.bairro : current.bairro,
      cidade: data.cidade !== undefined ? data.cidade : current.cidade,
      estado: data.estado !== undefined ? data.estado : current.estado,
      cep: data.cep !== undefined ? data.cep : current.cep,
      pais_residencia:
        data.pais_residencia !== undefined
          ? data.pais_residencia
          : current.pais_residencia,
      telefone: data.telefone !== undefined ? data.telefone : current.telefone,
      email: data.email !== undefined ? data.email : current.email,
      motivo_viagem:
        data.motivo_viagem !== undefined
          ? data.motivo_viagem
          : current.motivo_viagem,
      meio_transporte:
        data.meio_transporte !== undefined
          ? data.meio_transporte
          : current.meio_transporte,
      responsavel_posicao:
        data.responsavel_posicao !== undefined
          ? data.responsavel_posicao
          : current.responsavel_posicao,
    })

    this.items[index] = updated
    return updated
  }

  async adjust_positions(
    reserva_id: string,
    nova_quantidade: number
  ): Promise<void> {
    const hospedes = await this.find_by_reserva_id(reserva_id)
    const atual = hospedes.length

    if (nova_quantidade === atual) return

    if (nova_quantidade > atual) {
      const novos: CreateReservaHospedeData[] = []
      for (let p = atual + 1; p <= nova_quantidade; p++) {
        novos.push({
          reserva_id,
          posicao: p,
          ficha_status: 'pendente',
        })
      }
      await this.create_many(novos)
    } else {
      // Reduzir: só remover da última para a primeira se não estiver preenchida
      const a_remover = hospedes.slice(nova_quantidade)
      const preenchidas = a_remover.filter(h => h.ficha_status === 'preenchida')
      if (preenchidas.length > 0) {
        throw new ReservaValidationError(
          `Não é possível reduzir a quantidade de pessoas pois as posições (${preenchidas.map(h => h.posicao).join(', ')}) contêm fichas já preenchidas.`
        )
      }
      this.items = this.items.filter(
        h => !(h.reserva_id === reserva_id && h.posicao > nova_quantidade)
      )
    }
  }
}

export class InMemoryReservaRepository implements IReservaRepository {
  public items: Reserva[] = []
  public historico: Array<{
    id: string
    reserva_id: string
    status_anterior: string | null
    status_novo: string
    user_id: string | null
    created_at: Date
  }> = []
  public logs: Array<{
    id: string
    reserva_id: string
    hotel_id: string
    user_id: string | null
    dados_hash: string
    dados_reserva: Record<string, unknown>
    created_at: Date
  }> = []
  private hotel_names = new Map<string, string>()

  set_hotel_name(hotel_id: string, name: string) {
    this.hotel_names.set(hotel_id, name)
  }

  constructor(
    private readonly hospedes_repo?: InMemoryReservaHospedeRepository
  ) {}

  private is_active_status(status: ReservaStatus): boolean {
    return (
      status === 'a_confirmar' ||
      status === 'confirmada' ||
      status === 'check_in' ||
      status === 'check_out'
    )
  }

  async create(data: CreateReservaData): Promise<Reserva> {
    const now = new Date()
    const reserva = new Reserva({
      id: randomUUID(),
      hotel_id: data.hotel_id,
      codigo: data.codigo,
      titular_nome: data.titular_nome,
      titular_telefone: data.titular_telefone,
      titular_email: data.titular_email,
      quarto_id: data.quarto_id,
      regime_alimentacao_id: data.regime_alimentacao_id,
      parceiro_comercial_id: data.parceiro_comercial_id,
      check_in: data.check_in,
      check_out: data.check_out,
      quantidade_adultos: data.quantidade_adultos,
      quantidade_criancas: data.quantidade_criancas ?? 0,
      valor_total: data.valor_total,
      detalhamento_diarias: data.detalhamento_diarias,
      status: data.status ?? 'a_confirmar',
      token_fnrh: data.token_fnrh,
      token_fnrh_ativo: data.token_fnrh_ativo ?? true,
      observacoes: data.observacoes,
      created_at: now,
      updated_at: now,
    })

    this.items.push(reserva)
    return reserva
  }

  async update(
    id: string,
    hotel_id: string,
    data: UpdateReservaData
  ): Promise<Reserva | null> {
    const index = this.items.findIndex(
      r => r.id === id && r.hotel_id === hotel_id
    )
    if (index === -1) return null

    const current = this.items[index]
    const updated = new Reserva({
      id: current.id,
      hotel_id: current.hotel_id,
      codigo: current.codigo,
      titular_nome: data.titular_nome ?? current.titular_nome,
      titular_telefone:
        data.titular_telefone !== undefined
          ? data.titular_telefone
          : current.titular_telefone,
      titular_email:
        data.titular_email !== undefined
          ? data.titular_email
          : current.titular_email,
      quarto_id: data.quarto_id ?? current.quarto_id,
      regime_alimentacao_id:
        data.regime_alimentacao_id ?? current.regime_alimentacao_id,
      parceiro_comercial_id:
        data.parceiro_comercial_id !== undefined
          ? data.parceiro_comercial_id
          : current.parceiro_comercial_id,
      check_in: data.check_in ?? current.check_in,
      check_out: data.check_out ?? current.check_out,
      quantidade_adultos: data.quantidade_adultos ?? current.quantidade_adultos,
      quantidade_criancas:
        data.quantidade_criancas ?? current.quantidade_criancas,
      valor_total: data.valor_total ?? current.valor_total,
      detalhamento_diarias:
        data.detalhamento_diarias ?? current.detalhamento_diarias,
      status: data.status ?? current.status,
      token_fnrh: data.token_fnrh ?? current.token_fnrh,
      token_fnrh_ativo:
        data.token_fnrh_ativo !== undefined
          ? data.token_fnrh_ativo
          : current.token_fnrh_ativo,
      fnrh_enviada_em:
        data.fnrh_enviada_em !== undefined
          ? data.fnrh_enviada_em
          : current.fnrh_enviada_em,
      observacoes:
        data.observacoes !== undefined ? data.observacoes : current.observacoes,
      quarto: current.quarto,
      regime_alimentacao: current.regime_alimentacao,
      parceiro_comercial: current.parceiro_comercial,
      hospedes: current.hospedes,
      created_at: current.created_at,
      updated_at: new Date(),
    })

    this.items[index] = updated
    return updated
  }

  async find_by_id(id: string, hotel_id: string): Promise<Reserva | null> {
    const item = this.items.find(
      r => (r.id === id || r.codigo === id) && r.hotel_id === hotel_id
    )
    if (!item) return null

    if (this.hospedes_repo) {
      const hospedes = await this.hospedes_repo.find_by_reserva_id(item.id)
      return new Reserva({
        ...item,
        hospedes,
      })
    }
    return item
  }

  async find_by_token_fnrh(token: string): Promise<Reserva | null> {
    const item = this.items.find(r => r.token_fnrh === token)
    if (!item) return null

    if (this.hospedes_repo) {
      const hospedes = await this.hospedes_repo.find_by_reserva_id(item.id)
      return new Reserva({
        ...item,
        hospedes,
      })
    }
    return item
  }

  async find_conflito(
    quarto_id: string,
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<boolean> {
    return this.items.some(r => {
      if (r.quarto_id !== quarto_id) return false
      if (ignorar_reserva_id && r.id === ignorar_reserva_id) return false
      if (!this.is_active_status(r.status)) return false

      // Overlap semiaberto [check_in, check_out)
      return check_in < r.check_out && check_out > r.check_in
    })
  }

  async find_conflitos_por_quartos(
    quartos_ids: string[],
    check_in: string,
    check_out: string,
    ignorar_reserva_id?: string
  ): Promise<string[]> {
    const ocupados = new Set<string>()

    for (const r of this.items) {
      if (!quartos_ids.includes(r.quarto_id)) continue
      if (ignorar_reserva_id && r.id === ignorar_reserva_id) continue
      if (!this.is_active_status(r.status)) continue

      if (check_in < r.check_out && check_out > r.check_in) {
        ocupados.add(r.quarto_id)
      }
    }

    return Array.from(ocupados)
  }

  async list(
    hotel_id: string,
    params: ReservaListParams
  ): Promise<PaginatedResult<Reserva>> {
    const pagina = params.pagina && params.pagina > 0 ? params.pagina : 1
    const limite = params.limite && params.limite > 0 ? params.limite : 10

    let filtered = this.items.filter(r => r.hotel_id === hotel_id)

    if (params.status) {
      filtered = filtered.filter(r => r.status === params.status)
    }

    if (params.quarto_id) {
      filtered = filtered.filter(r => r.quarto_id === params.quarto_id)
    }

    if (params.regime_alimentacao_id) {
      filtered = filtered.filter(
        r => r.regime_alimentacao_id === params.regime_alimentacao_id
      )
    }

    if (params.parceiro_comercial_id) {
      filtered = filtered.filter(
        r => r.parceiro_comercial_id === params.parceiro_comercial_id
      )
    }

    if (params.check_in_de) {
      filtered = filtered.filter(r => r.check_in >= params.check_in_de!)
    }

    if (params.check_in_ate) {
      filtered = filtered.filter(r => r.check_in <= params.check_in_ate!)
    }

    if (params.busca) {
      const q = params.busca.toLowerCase().trim()
      filtered = filtered.filter(r => {
        if (r.codigo.toLowerCase().includes(q)) return true
        if (r.titular_nome.toLowerCase().includes(q)) return true
        return false
      })
    }

    filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

    const total = filtered.length
    const offset = (pagina - 1) * limite
    const paginated = filtered.slice(offset, offset + limite)

    // Enrich hospedes if available
    const enriched = await Promise.all(
      paginated.map(async item => {
        if (this.hospedes_repo) {
          const hospedes = await this.hospedes_repo.find_by_reserva_id(item.id)
          return new Reserva({
            ...item,
            hospedes,
          })
        }
        return item
      })
    )

    return {
      data: enriched,
      meta: {
        total,
        pagina,
        limite,
        ultima_pagina: Math.max(1, Math.ceil(total / limite)),
      },
    }
  }

  async gerar_proximo_codigo(hotel_id: string): Promise<string> {
    const do_hotel = this.items.filter(r => r.hotel_id === hotel_id)
    const proximo = do_hotel.length + 1
    const name = this.hotel_names.get(hotel_id) || 'Furnaspark Resort'
    const prefix = extract_hotel_prefix(name)
    return `${prefix}-${String(proximo).padStart(6, '0')}`
  }

  async create_log(
    reserva_id: string,
    hotel_id: string,
    dados_reserva: Record<string, unknown>,
    user_id?: string | null
  ): Promise<void> {
    const hash = computeObjectSha256(dados_reserva)
    const logsReserva = this.logs.filter(l => l.reserva_id === reserva_id)
    const ultimoLog = logsReserva[logsReserva.length - 1]
    if (ultimoLog && ultimoLog.dados_hash === hash) {
      return
    }
    this.logs.push({
      id: randomUUID(),
      reserva_id,
      hotel_id,
      user_id: user_id ?? null,
      dados_hash: hash,
      dados_reserva,
      created_at: new Date(),
    })
  }

  async create_status_historico(
    reserva_id: string,
    status_anterior: string | null,
    status_novo: string,
    user_id?: string | null
  ): Promise<void> {
    this.historico.push({
      id: randomUUID(),
      reserva_id,
      status_anterior,
      status_novo,
      user_id: user_id ?? null,
      created_at: new Date(),
    })
    const reserva = this.items.find(r => r.id === reserva_id)
    if (reserva) {
      await this.create_log(
        reserva_id,
        reserva.hotel_id,
        { status_anterior, status: status_novo },
        user_id
      )
    }
  }
}

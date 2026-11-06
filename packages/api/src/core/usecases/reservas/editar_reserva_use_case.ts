import type { DiariaReserva, UpdateReservaPayload } from '@hotelmind/contracts'
import { Reserva } from '@/core/entities/reserva'
import {
  ReservaConflitoError,
  ReservaNotFoundError,
  ReservaValidationError,
} from '@/core/errors/reserva_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'
import type { IQuartoRepository } from '@/core/repositories/quartos/quarto.repository'
import type { IRegimeAlimentacaoRepository } from '@/core/repositories/regimes_alimentacao/regime_alimentacao.repository'
import type {
  IReservaHospedeRepository,
  IReservaRepository,
} from '@/core/repositories/reservas/reserva_repository'
import type { ITarifarioRepository } from '@/core/repositories/tarifarios/tarifario.repository'
import { ReservaStatusService } from '@/core/services/reserva_status_service'
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'
import { ConsultarDisponibilidadeUseCase } from '@/core/usecases/reservas/consultar_disponibilidade_use_case'

export interface EditarReservaInput {
  reserva_id: string
  hotel_id: string
  dados: UpdateReservaPayload
  user_id?: string | null
}

export class EditarReservaUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hospedes_repo: IReservaHospedeRepository,
    private readonly quartos_repo: IQuartoRepository,
    private readonly regimes_repo: IRegimeAlimentacaoRepository,
    private readonly tarifarios_repo: ITarifarioRepository,
    private readonly parceiros_repo?: IParceiroComercialRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService(),
    private readonly status_service: ReservaStatusService = new ReservaStatusService(),
    private readonly disponibilidade_use_case: ConsultarDisponibilidadeUseCase = new ConsultarDisponibilidadeUseCase(
      reservas_repo,
      quartos_repo,
      tarifarios_repo,
      pricing_service
    )
  ) {}

  async execute(input: EditarReservaInput): Promise<Reserva> {
    const { reserva_id, hotel_id, dados } = input

    const reserva = await this.reservas_repo.find_by_id(reserva_id, hotel_id)
    if (!reserva) {
      throw new ReservaNotFoundError()
    }

    if (reserva.status !== 'a_confirmar' && reserva.status !== 'confirmada') {
      throw new ReservaValidationError(
        `Apenas reservas com status 'A confirmar' ou 'Confirmada' podem ser editadas (status atual: '${reserva.status}').`
      )
    }

    const check_in = dados.check_in ?? reserva.check_in
    const check_out = dados.check_out ?? reserva.check_out
    const quarto_id = dados.quarto_id ?? reserva.quarto_id
    const regime_alimentacao_id =
      dados.regime_alimentacao_id ?? reserva.regime_alimentacao_id
    const quantidade_adultos =
      dados.quantidade_adultos ?? reserva.quantidade_adultos
    const quantidade_criancas =
      dados.quantidade_criancas !== undefined
        ? dados.quantidade_criancas
        : reserva.quantidade_criancas

    if (check_in >= check_out) {
      throw new ReservaValidationError(
        'A data de check-out deve ser posterior à data de check-in.'
      )
    }

    const quarto = await this.quartos_repo.find_by_id(quarto_id, hotel_id)
    if (!quarto) {
      throw new ReservaValidationError('Suíte (quarto) não encontrada.')
    }
    if (quarto.status !== 'S') {
      throw new ReservaValidationError('A suíte selecionada está inativa.')
    }

    const total_pessoas = quantidade_adultos + (quantidade_criancas || 0)
    if (total_pessoas > quarto.limite_hospedes) {
      throw new ReservaValidationError(
        `A quantidade de pessoas excede a capacidade máxima da suíte (${quarto.limite_hospedes} pessoas).`
      )
    }

    const regime = await this.regimes_repo.find_by_id(
      regime_alimentacao_id,
      hotel_id
    )
    if (!regime) {
      throw new ReservaValidationError('Regime de alimentação não encontrado.')
    }
    if (!regime.ativo) {
      throw new ReservaValidationError(
        'O regime de alimentação selecionado está inativo.'
      )
    }

    const input_parceiro =
      dados.parceiro_id !== undefined
        ? dados.parceiro_id
        : dados.parceiro_comercial_id
    const reserva_parceiro =
      reserva.parceiro_id !== undefined
        ? reserva.parceiro_id
        : reserva.parceiro_comercial_id
    const parceiro_id =
      input_parceiro !== undefined ? input_parceiro : reserva_parceiro

    if (parceiro_id && this.parceiros_repo) {
      const parceiro = await this.parceiros_repo.find_by_id(
        parceiro_id,
        hotel_id
      )
      if (!parceiro) {
        throw new ReservaValidationError('Parceiro comercial não encontrado.')
      }
      if (parceiro_id !== reserva_parceiro && parceiro.status !== 'ativo') {
        throw new ReservaValidationError(
          'O parceiro comercial selecionado está inativo.'
        )
      }
    }

    // Checar conflito se datas ou quarto mudaram
    const datas_mudaram =
      check_in !== reserva.check_in || check_out !== reserva.check_out
    const quarto_mudou = quarto_id !== reserva.quarto_id
    const parceiro_mudou = parceiro_id !== reserva_parceiro

    if (datas_mudaram || quarto_mudou) {
      const conflito = await this.reservas_repo.find_conflito(
        quarto_id,
        check_in,
        check_out,
        reserva.id
      )
      if (conflito) {
        const alternativas = await this.disponibilidade_use_case.execute({
          hotel_id,
          check_in,
          check_out,
          regime_alimentacao_id,
          pessoas: total_pessoas,
          parceiro_id,
          ignorar_reserva_id: reserva.id,
        })
        throw new ReservaConflitoError(
          'A suíte selecionada já possui reserva no período informado.',
          alternativas.slice(0, 5)
        )
      }
    }

    // Recalcular tarifas se datas, quarto, regime ou parceiro mudaram
    let valor_total = reserva.valor_total
    let detalhamento_diarias = reserva.detalhamento_diarias

    if (
      datas_mudaram ||
      quarto_mudou ||
      regime_alimentacao_id !== reserva.regime_alimentacao_id ||
      parceiro_mudou
    ) {
      const tarifarios_ativos =
        await this.tarifarios_repo.find_active_for_range({
          hotel_id,
          categoria_quarto_id: quarto.categoria_id,
          parceiro_id,
          data_inicio: check_in,
          data_fim: check_out,
        })

      const do_regime = tarifarios_ativos.filter(
        t => t.regime_alimentacao_id === regime_alimentacao_id
      )

      const calculo = this.pricing_service.calcular_reserva({
        hotel_id,
        categoria_quarto_id: quarto.categoria_id,
        parceiro_id,
        check_in,
        check_out,
        tarifarios: do_regime,
      })

      valor_total = calculo.valor_total
      detalhamento_diarias = calculo.noites as DiariaReserva[]
    }

    // Ajustar posições de hóspedes se total_pessoas mudou
    if (total_pessoas !== reserva.total_hospedes) {
      await this.hospedes_repo.adjust_positions(reserva.id, total_pessoas)
    }

    let status_final = reserva.status
    if (dados.status && dados.status !== reserva.status) {
      this.status_service.validar_transicao(reserva.status, dados.status)
      status_final = dados.status
      await this.reservas_repo.create_status_historico(
        reserva.id,
        reserva.status,
        dados.status,
        input.user_id
      )
    }

    const updated = await this.reservas_repo.update(reserva.id, hotel_id, {
      titular_nome: dados.titular_nome ?? reserva.titular_nome,
      titular_telefone:
        dados.titular_telefone !== undefined
          ? dados.titular_telefone
          : reserva.titular_telefone,
      titular_email:
        dados.titular_email !== undefined
          ? dados.titular_email
          : reserva.titular_email,
      quarto_id,
      regime_alimentacao_id,
      parceiro_id,
      parceiro_comercial_id: parceiro_id,
      check_in,
      check_out,
      quantidade_adultos,
      quantidade_criancas,
      valor_total,
      detalhamento_diarias,
      status: status_final,
      observacoes:
        dados.observacoes !== undefined
          ? dados.observacoes
          : reserva.observacoes,
    })

    if (!updated) {
      throw new ReservaNotFoundError()
    }

    const hospedes = await this.hospedes_repo.find_by_reserva_id(reserva.id)
    return new Reserva({
      ...updated,
      hospedes,
      quarto: {
        id: quarto.id,
        identificacao: quarto.identificacao,
        categoria_nome: quarto.categoria?.nome ?? '',
      },
      regime_alimentacao: {
        id: regime.id,
        titulo: regime.titulo,
        cor_pulseira: regime.cor_pulseira,
      },
    })
  }
}

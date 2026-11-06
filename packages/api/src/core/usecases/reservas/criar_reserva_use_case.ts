import { randomBytes } from 'node:crypto'
import type { CreateReservaPayload, DiariaReserva } from '@hotelmind/contracts'
import { Reserva } from '@/core/entities/reserva'
import {
  ReservaConflitoError,
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
import { TarifarioPricingService } from '@/core/services/tarifario_pricing_service'
import { ConsultarDisponibilidadeUseCase } from '@/core/usecases/reservas/consultar_disponibilidade_use_case'

export interface CriarReservaInput extends CreateReservaPayload {
  hotel_id: string
  user_id?: string | null
}

export class CriarReservaUseCase {
  constructor(
    private readonly reservas_repo: IReservaRepository,
    private readonly hospedes_repo: IReservaHospedeRepository,
    private readonly quartos_repo: IQuartoRepository,
    private readonly regimes_repo: IRegimeAlimentacaoRepository,
    private readonly tarifarios_repo: ITarifarioRepository,
    private readonly parceiros_repo?: IParceiroComercialRepository,
    private readonly pricing_service: TarifarioPricingService = new TarifarioPricingService(),
    private readonly disponibilidade_use_case: ConsultarDisponibilidadeUseCase = new ConsultarDisponibilidadeUseCase(
      reservas_repo,
      quartos_repo,
      tarifarios_repo,
      pricing_service
    )
  ) {}

  async execute(input: CriarReservaInput): Promise<Reserva> {
    const final_parceiro_id = input.parceiro_id ?? input.parceiro_comercial_id
    const {
      hotel_id,
      quarto_id,
      regime_alimentacao_id,
      check_in,
      check_out,
      quantidade_adultos,
      quantidade_criancas = 0,
      titular_nome,
      titular_telefone,
      titular_email,
      observacoes,
      user_id,
    } = input

    // 1. Validar datas
    if (check_in >= check_out) {
      throw new ReservaValidationError(
        'A data de check-out deve ser posterior à data de check-in.'
      )
    }

    // 2. Validar quarto
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

    // 3. Validar regime de alimentação
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

    // 4. Validar parceiro comercial (se informado)
    if (final_parceiro_id && this.parceiros_repo) {
      const parceiro = await this.parceiros_repo.find_by_id(
        final_parceiro_id,
        hotel_id
      )
      if (!parceiro) {
        throw new ReservaValidationError('Parceiro comercial não encontrado.')
      }
      if (parceiro.status !== 'ativo') {
        throw new ReservaValidationError(
          'O parceiro comercial selecionado está inativo.'
        )
      }
    }

    // 5. Verificar conflito da suíte
    const conflito = await this.reservas_repo.find_conflito(
      quarto_id,
      check_in,
      check_out
    )
    if (conflito) {
      const alternativas = await this.disponibilidade_use_case.execute({
        hotel_id,
        check_in,
        check_out,
        regime_alimentacao_id,
        pessoas: total_pessoas,
        parceiro_id: final_parceiro_id,
      })
      throw new ReservaConflitoError(
        'A suíte selecionada já possui reserva no período informado.',
        alternativas.slice(0, 5)
      )
    }

    // 6. Calcular tarifas aplicadas
    const tarifarios_ativos = await this.tarifarios_repo.find_active_for_range({
      hotel_id,
      categoria_quarto_id: quarto.categoria_id,
      parceiro_id: final_parceiro_id,
      data_inicio: check_in,
      data_fim: check_out,
    })

    const do_regime = tarifarios_ativos.filter(
      t => t.regime_alimentacao_id === regime_alimentacao_id
    )

    const calculo = this.pricing_service.calcular_reserva({
      hotel_id,
      categoria_quarto_id: quarto.categoria_id,
      parceiro_id: final_parceiro_id,
      check_in,
      check_out,
      tarifarios: do_regime,
    })

    // 7. Gerar código e token público FNRH
    const codigo = await this.reservas_repo.gerar_proximo_codigo(hotel_id)
    const token_fnrh = randomBytes(24).toString('base64url')

    // 8. Criar reserva
    const reserva = await this.reservas_repo.create({
      hotel_id,
      codigo,
      titular_nome,
      titular_telefone,
      titular_email,
      quarto_id,
      regime_alimentacao_id,
      parceiro_id: final_parceiro_id || null,
      parceiro_comercial_id: final_parceiro_id || null,
      check_in,
      check_out,
      quantidade_adultos,
      quantidade_criancas,
      valor_total: calculo.valor_total,
      detalhamento_diarias: calculo.noites as DiariaReserva[],
      status: 'a_confirmar',
      token_fnrh,
      token_fnrh_ativo: true,
      observacoes,
    })

    // 9. Criar posições de hóspedes
    const hospedes_para_criar = []
    for (let p = 1; p <= total_pessoas; p++) {
      hospedes_para_criar.push({
        reserva_id: reserva.id,
        posicao: p,
        ficha_status: 'pendente' as const,
        nome_completo: p === 1 ? titular_nome : null,
      })
    }
    await this.hospedes_repo.create_many(hospedes_para_criar)

    // 10. Registrar histórico de status
    await this.reservas_repo.create_status_historico(
      reserva.id,
      null,
      'a_confirmar',
      user_id
    )

    const hospedes = await this.hospedes_repo.find_by_reserva_id(reserva.id)
    return new Reserva({
      ...reserva,
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

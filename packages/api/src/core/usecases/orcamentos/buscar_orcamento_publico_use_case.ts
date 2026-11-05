import type { OrcamentoPublicoVisualizacao } from '@hotelmind/contracts'
import { OrcamentoNotFoundError } from '@/core/errors/orcamento_errors'
import type { IOrcamentoRepository } from '@/core/repositories/orcamentos/orcamento_repository'

export class BuscarOrcamentoPublicoUseCase {
  constructor(private readonly orcamentos: IOrcamentoRepository) {}

  async execute(token: string): Promise<OrcamentoPublicoVisualizacao> {
    const orcamento = await this.orcamentos.find_by_token_publico(token)
    if (!orcamento) {
      throw new OrcamentoNotFoundError('Orçamento não encontrado ou expirado.')
    }

    const diff_time = Math.abs(
      new Date(orcamento.check_out).getTime() -
        new Date(orcamento.check_in).getTime()
    )
    const total_noites = Math.max(
      1,
      Math.ceil(diff_time / (1000 * 60 * 60 * 24))
    )

    const hotel = orcamento.hotel

    return {
      token_publico: orcamento.token_publico,
      hotel_nome: hotel?.nome_fantasia || hotel?.nome_hotel || 'Hotel',
      hotel_nome_fantasia: hotel?.nome_fantasia ?? undefined,
      hotel_telefone: hotel?.telefone_comercial ?? undefined,
      hotel_celular: hotel?.celular ?? undefined,
      hotel_email: hotel?.email_comercial ?? undefined,
      hotel_endereco: hotel?.endereco ?? null,
      check_in: orcamento.check_in,
      check_out: orcamento.check_out,
      total_noites,
      quantidade_adultos: orcamento.quantidade_adultos,
      quantidade_criancas: orcamento.quantidade_criancas,
      quantidade_pets: orcamento.quantidade_pets,
      regime_alimentacao: {
        nome: orcamento.regime_alimentacao?.titulo ?? 'Regime de Alimentação',
        cor: orcamento.regime_alimentacao?.cor_pulseira ?? '#3b82f6',
        descricao: orcamento.regime_alimentacao?.descricao ?? undefined,
      },
      categoria_quarto: {
        nome: orcamento.categoria_quarto?.nome ?? 'Suíte',
      },
      lead_nome: orcamento.lead?.nome ?? 'Cliente',
      detalhamento_noites: orcamento.detalhamento_noites,
      valor_total: orcamento.valor_total,
      status: orcamento.status,
      cupom_desconto: orcamento.cupom_desconto,
      criado_em: orcamento.created_at.toISOString(),
    }
  }
}

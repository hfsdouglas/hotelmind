export interface ConsultarDisponibilidadeParams {
  check_in: string
  check_out: string
  regime_alimentacao_id: string
  pessoas: number
  parceiro_id?: string | null
  ignorar_reserva_id?: string
}

export interface QuartoDisponivel {
  quarto_id: string
  identificacao: string
  categoria_id: string
  categoria_nome: string
  limite_hospedes: number
  valor_total: string
}

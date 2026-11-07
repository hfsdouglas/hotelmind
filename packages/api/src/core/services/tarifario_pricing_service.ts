import type {
  CalculoTarifaReserva,
  NoiteCalculadaReserva,
} from '@hotelmind/contracts'
import type { Tarifario } from '@/core/entities/tarifario'
import {
  cents_to_valor_diaria,
  is_valid_iso_date,
  valor_diaria_to_cents,
} from '@/core/entities/tarifario'
import {
  TarifarioSemCoberturaError,
  TarifarioValidationError,
} from '@/core/errors/tarifario_errors'

function enumerate_nights(check_in: string, check_out: string): string[] {
  if (!is_valid_iso_date(check_in) || !is_valid_iso_date(check_out)) {
    throw new TarifarioValidationError('As datas da reserva são inválidas.')
  }
  if (check_in >= check_out) {
    throw new TarifarioValidationError(
      'A data de check-in deve ser anterior à data de check-out.'
    )
  }

  const nights: string[] = []
  const [sy, sm, sd] = check_in.split('-').map(Number)
  let current = new Date(Date.UTC(sy, sm - 1, sd))

  while (true) {
    const iso = current.toISOString().slice(0, 10)
    if (iso >= check_out) break
    nights.push(iso)
    current = new Date(
      Date.UTC(
        current.getUTCFullYear(),
        current.getUTCMonth(),
        current.getUTCDate() + 1
      )
    )
  }

  return nights
}

export class TarifarioPricingService {
  calcular_reserva(input: {
    hotel_id: string
    categoria_quarto_id: string
    check_in: string
    check_out: string
    tarifarios: Tarifario[]
    parceiro_id?: string | null
  }): CalculoTarifaReserva {
    const nights = enumerate_nights(input.check_in, input.check_out)
    const noites_calculadas: NoiteCalculadaReserva[] = []
    let total_cents = 0

    const target_parceiro =
      input.parceiro_id !== undefined ? input.parceiro_id : undefined

    for (const night of nights) {
      const elegiveis = input.tarifarios.filter(t => {
        if (!t.ativo) return false
        if (t.hotel_id !== input.hotel_id) return false

        const matches_category =
          t.categoria_quarto_ids?.length > 0
            ? t.categoria_quarto_ids.includes(input.categoria_quarto_id)
            : t.categoria_quarto_id === input.categoria_quarto_id
        if (!matches_category) return false

        if (
          target_parceiro !== undefined &&
          t.parceiro_id !== target_parceiro
        ) {
          return false
        }

        if (!t.datas.includes(night)) return false

        // Validação de estadia mínima
        const minimo_diarias = t.minimo_diarias ?? 1
        if (nights.length < minimo_diarias) return false

        return true
      })

      if (elegiveis.length === 0) {
        throw new TarifarioSemCoberturaError(night)
      }

      let menor = elegiveis[0]
      let menor_cents = valor_diaria_to_cents(menor.valor_diaria)

      for (let i = 1; i < elegiveis.length; i++) {
        const candidato = elegiveis[i]
        const candidato_cents = valor_diaria_to_cents(candidato.valor_diaria)
        if (candidato_cents < menor_cents) {
          menor = candidato
          menor_cents = candidato_cents
        }
      }

      total_cents += menor_cents
      noites_calculadas.push({
        data: night,
        tarifario_id: menor.id,
        tarifario_nome: menor.nome,
        valor_diaria: cents_to_valor_diaria(menor_cents),
      })
    }

    return {
      noites: noites_calculadas,
      valor_total: cents_to_valor_diaria(total_cents),
    }
  }
}

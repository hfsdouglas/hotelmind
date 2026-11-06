import type { FichaFnrh } from '@hotelmind/contracts'
import { validar_cpf } from '@/core/entities/parceiro_comercial'
import { is_valid_iso_date } from '@/core/entities/tarifario'
import { ReservaValidationError } from '@/core/errors/reserva_errors'

export interface FNRHValidationResult {
  valida: boolean
  erros: string[]
}

export class FnrhValidationService {
  validar_ficha(dados: Partial<FichaFnrh>): FNRHValidationResult {
    const erros: string[] = []

    if (!dados.nome_completo || dados.nome_completo.trim().length < 3) {
      erros.push('Nome completo é obrigatório (mínimo 3 caracteres).')
    }

    if (!dados.nacionalidade || dados.nacionalidade.trim().length === 0) {
      erros.push('Nacionalidade é obrigatória.')
    }

    if (!dados.data_nascimento || !is_valid_iso_date(dados.data_nascimento)) {
      erros.push('Data de nascimento inválida.')
    } else {
      const hoje = new Date().toISOString().slice(0, 10)
      if (dados.data_nascimento >= hoje) {
        erros.push('Data de nascimento deve ser anterior à data atual.')
      }
    }

    if (!dados.sexo || dados.sexo.trim().length === 0) {
      erros.push('Gênero/sexo é obrigatório.')
    }

    if (!dados.profissao || dados.profissao.trim().length === 0) {
      erros.push('Profissão é obrigatória.')
    }

    // Validação de menor de idade
    let is_menor = false
    if (dados.data_nascimento && is_valid_iso_date(dados.data_nascimento)) {
      const nasc = new Date(dados.data_nascimento)
      const agora = new Date()
      let idade = agora.getUTCFullYear() - nasc.getUTCFullYear()
      const m = agora.getUTCMonth() - nasc.getUTCMonth()
      if (m < 0 || (m === 0 && agora.getUTCDate() < nasc.getUTCDate())) {
        idade--
      }
      is_menor = idade < 18
    }

    if (!dados.numero_documento || dados.numero_documento.trim().length === 0) {
      if (is_menor) {
        if (!dados.responsavel_posicao || dados.responsavel_posicao < 1) {
          erros.push(
            'Hóspede menor de idade sem documento deve ter um responsável indicado.'
          )
        }
      } else {
        erros.push('Número do documento é obrigatório.')
      }
    } else if (dados.tipo_documento === 'cpf') {
      const limpo = dados.numero_documento.replace(/\D/g, '')
      if (!validar_cpf(limpo)) {
        erros.push('Número de CPF inválido.')
      }
    }

    // Endereço e residência
    const pais = dados.pais_residencia?.trim() || 'Brasil'
    const is_brasil = pais.toLowerCase() === 'brasil'

    if (is_brasil) {
      if (!dados.logradouro || dados.logradouro.trim().length === 0) {
        erros.push('Logradouro é obrigatório para residentes no Brasil.')
      }
      if (!dados.cidade || dados.cidade.trim().length === 0) {
        erros.push('Cidade é obrigatória.')
      }
      if (dados.estado?.trim().length !== 2) {
        erros.push('Estado (UF de 2 letras) é obrigatório.')
      }
    } else {
      if (!dados.pais_residencia || dados.pais_residencia.trim().length === 0) {
        erros.push('País de residência é obrigatório para estrangeiros.')
      }
    }

    // Contato
    const tem_tel = !!(dados.telefone && dados.telefone.trim().length >= 8)
    const tem_email = !!(
      dados.email &&
      dados.email.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
    )

    if (!is_menor && !tem_tel && !tem_email) {
      erros.push(
        'Informe ao menos um meio de contato válido (telefone ou e-mail).'
      )
    }

    if (!dados.motivo_viagem || dados.motivo_viagem.trim().length === 0) {
      erros.push('Motivo da viagem é obrigatório.')
    }

    if (!dados.meio_transporte || dados.meio_transporte.trim().length === 0) {
      erros.push('Meio de transporte é obrigatório.')
    }

    return {
      valida: erros.length === 0,
      erros,
    }
  }

  validar_e_lancar(dados: Partial<FichaFnrh>): void {
    const res = this.validar_ficha(dados)
    if (!res.valida) {
      throw new ReservaValidationError(res.erros.join(' '))
    }
  }
}

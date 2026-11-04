import type { CreateParceiroComercialPayload } from '@hotelmind/contracts'
import { ParceiroComercial } from '@/core/entities/parceiro_comercial'
import { ParceiroComercialConflictError } from '@/core/errors/parceiro_comercial_errors'
import type { IParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/parceiro_comercial_repository'

export interface CriarParceiroComercialInput
  extends CreateParceiroComercialPayload {
  hotel_id: string
}

export class CriarParceiroComercialUseCase {
  constructor(private readonly repo: IParceiroComercialRepository) {}

  async execute(
    input: CriarParceiroComercialInput
  ): Promise<ParceiroComercial> {
    if (input.documento?.trim()) {
      const existing = await this.repo.find_by_documento(
        input.documento.trim(),
        input.hotel_id
      )
      if (existing) {
        throw new ParceiroComercialConflictError(
          'Já existe um parceiro comercial cadastrado com este documento.'
        )
      }
    }

    // Instancia entidade para acionar validações de domínio antes da persistência
    new ParceiroComercial({
      id: 'temp-id',
      hotel_id: input.hotel_id,
      tipo_parceiro: input.tipo_parceiro,
      tipo_pessoa: input.tipo_pessoa,
      razao_social: input.razao_social,
      nome_fantasia: input.nome_fantasia,
      documento: input.documento,
      inscricao_estadual: input.inscricao_estadual,
      estrangeiro: input.estrangeiro,
      cadastur: input.cadastur,
      codigo_iata: input.codigo_iata,
      registro_embratur: input.registro_embratur,

      logradouro: input.logradouro,
      numero: input.numero,
      complemento: input.complemento,
      bairro: input.bairro,
      cidade: input.cidade,
      estado: input.estado,
      cep: input.cep,
      pais: input.pais,

      modelo_tarifario: input.modelo_tarifario,
      comissao_padrao: input.comissao_padrao ?? 0.0,
      politica_faturamento: input.politica_faturamento,
      prazo_pagamento_dias: input.prazo_pagamento_dias ?? 0,
      limite_credito: input.limite_credito ?? 0.0,
      allotment_quartos: input.allotment_quartos ?? 0,

      status: 'ativo',
      observacoes: input.observacoes,
      criado_em: new Date(),
      atualizado_em: new Date(),
      contatos: input.contatos?.map(c => ({
        tipo_contato: c.tipo_contato,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        cargo: c.cargo,
      })),
    })

    return this.repo.create(input)
  }
}

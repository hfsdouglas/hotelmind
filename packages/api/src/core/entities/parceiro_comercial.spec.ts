import { describe, expect, it } from 'vitest'
import { ParceiroComercialValidationError } from '@/core/errors/parceiro_comercial_errors'
import {
  ParceiroComercial,
  validar_cnpj,
  validar_cpf,
} from './parceiro_comercial'

describe('ParceiroComercial Entity', () => {
  it('valida cpf e cnpj corretamente com algoritmos oficiais', () => {
    expect(validar_cpf('52998224725')).toBe(true)
    expect(validar_cpf('11111111111')).toBe(false)
    expect(validar_cpf('123')).toBe(false)

    expect(validar_cnpj('11222333000181')).toBe(true)
    expect(validar_cnpj('00000000000000')).toBe(false)
    expect(validar_cnpj('12345')).toBe(false)
  })

  it('deve instanciar um parceiro comercial válido', () => {
    const parceiro = new ParceiroComercial({
      id: 'parceiro-1',
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agência de Turismo ABC LTDA',
      documento: '11222333000181',
      modelo_tarifario: 'comissionada',
      comissao_padrao: 10,
      politica_faturamento: 'faturado_quinzenal',
      prazo_pagamento_dias: 15,
      limite_credito: 10000,
      allotment_quartos: 2,
      status: 'ativo',
      criado_em: new Date(),
      atualizado_em: new Date(),
    })

    expect(parceiro.id).toBe('parceiro-1')
    expect(parceiro.razao_social).toBe('Agência de Turismo ABC LTDA')
    expect(parceiro.comissao_padrao).toBe(10)
  })

  it('deve lançar erro se razão social for inválida', () => {
    expect(
      () =>
        new ParceiroComercial({
          id: 'parceiro-1',
          hotel_id: 'hotel-1',
          tipo_parceiro: 'agencia_viagens',
          tipo_pessoa: 'PJ',
          razao_social: ' ',
          modelo_tarifario: 'comissionada',
          comissao_padrao: 10,
          politica_faturamento: 'prepago',
          prazo_pagamento_dias: 0,
          limite_credito: 0,
          allotment_quartos: 0,
          status: 'ativo',
          criado_em: new Date(),
          atualizado_em: new Date(),
        })
    ).toThrow(ParceiroComercialValidationError)
  })

  it('deve lançar erro se comissão padrão for negativa ou maior que 100', () => {
    expect(
      () =>
        new ParceiroComercial({
          id: 'parceiro-1',
          hotel_id: 'hotel-1',
          tipo_parceiro: 'agencia_viagens',
          tipo_pessoa: 'PJ',
          razao_social: 'Agência Teste',
          documento: '11222333000181',
          modelo_tarifario: 'comissionada',
          comissao_padrao: -5,
          politica_faturamento: 'prepago',
          prazo_pagamento_dias: 0,
          limite_credito: 0,
          allotment_quartos: 0,
          status: 'ativo',
          criado_em: new Date(),
          atualizado_em: new Date(),
        })
    ).toThrow(ParceiroComercialValidationError)
  })
})

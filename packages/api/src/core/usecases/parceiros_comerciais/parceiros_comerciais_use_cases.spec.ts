import { beforeEach, describe, expect, it } from 'vitest'
import {
  ParceiroComercialConflictError,
  ParceiroComercialValidationError,
} from '@/core/errors/parceiro_comercial_errors'
import { InMemoryParceiroComercialRepository } from '@/core/repositories/parceiros_comerciais/in-memory/in_memory_parceiro_comercial_repository'
import { AtualizarStatusParceiroUseCase } from './atualizar_status_parceiro_use_case'
import { BuscarParceiroComercialUseCase } from './buscar_parceiro_comercial_use_case'
import { CriarParceiroComercialUseCase } from './criar_parceiro_comercial_use_case'
import { EditarParceiroComercialUseCase } from './editar_parceiro_comercial_use_case'
import { ExcluirParceiroComercialUseCase } from './excluir_parceiro_comercial_use_case'
import { ListarParceirosComerciaisUseCase } from './listar_parceiros_comerciais_use_case'

describe('CriarParceiroComercialUseCase', () => {
  let repository: InMemoryParceiroComercialRepository
  let sut: CriarParceiroComercialUseCase

  // Documentos válidos para testes
  const CPF_VALIDO = '52998224725'
  const CNPJ_VALIDO = '11222333000181'

  beforeEach(() => {
    repository = new InMemoryParceiroComercialRepository()
    sut = new CriarParceiroComercialUseCase(repository)
  })

  it('deve cadastrar um agente autônomo (PF) com CPF e endereço válidos', async () => {
    const parceiro = await sut.execute({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agente_autonomo',
      tipo_pessoa: 'PF',
      razao_social: 'João Carlos Silva',
      documento: CPF_VALIDO,
      logradouro: 'Rua das Flores',
      numero: '123',
      cidade: 'Campinas',
      estado: 'SP',
      cep: '13010-000',
      pais: 'Brasil',
      modelo_tarifario: 'comissionada',
      comissao_padrao: 10,
      politica_faturamento: 'prepago',
    })

    expect(parceiro.id).toBeDefined()
    expect(parceiro.razao_social).toBe('João Carlos Silva')
    expect(parceiro.tipo_parceiro).toBe('agente_autonomo')
    expect(parceiro.documento).toBe(CPF_VALIDO)
    expect(parceiro.status).toBe('ativo')
  })

  it('deve cadastrar uma agência de viagens (PJ) com CNPJ válido', async () => {
    const parceiro = await sut.execute({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Mundo Viagens e Turismo Ltda',
      nome_fantasia: 'Mundo Viagens',
      documento: CNPJ_VALIDO,
      logradouro: 'Av Paulista',
      numero: '1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      pais: 'Brasil',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
      prazo_pagamento_dias: 15,
      limite_credito: 50000,
    })

    expect(parceiro.id).toBeDefined()
    expect(parceiro.tipo_pessoa).toBe('PJ')
    expect(parceiro.nome_fantasia).toBe('Mundo Viagens')
  })

  it('não deve permitir CPF inválido para pessoa física', async () => {
    await expect(
      sut.execute({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'agente_autonomo',
        tipo_pessoa: 'PF',
        razao_social: 'Agente Inválido',
        documento: '12345678900',
        modelo_tarifario: 'comissionada',
        politica_faturamento: 'prepago',
      })
    ).rejects.toThrow(ParceiroComercialValidationError)
  })

  it('não deve permitir CNPJ inválido para pessoa jurídica', async () => {
    await expect(
      sut.execute({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'operadora_turismo',
        tipo_pessoa: 'PJ',
        razao_social: 'Operadora Inválida',
        documento: '11111111000100',
        modelo_tarifario: 'net',
        politica_faturamento: 'prepago',
      })
    ).rejects.toThrow(ParceiroComercialValidationError)
  })

  it('não deve permitir cadastrar documento duplicado para o mesmo hotel', async () => {
    await sut.execute({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agente_autonomo',
      tipo_pessoa: 'PF',
      razao_social: 'Agente Original',
      documento: CPF_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    await expect(
      sut.execute({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'agente_autonomo',
        tipo_pessoa: 'PF',
        razao_social: 'Agente Duplicado',
        documento: CPF_VALIDO,
        modelo_tarifario: 'comissionada',
        politica_faturamento: 'prepago',
      })
    ).rejects.toThrow(ParceiroComercialConflictError)
  })

  it('deve permitir cadastro de parceiro estrangeiro sem CPF/CNPJ', async () => {
    const parceiro = await sut.execute({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'operadora_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Global Tour Wholesaler Inc',
      estrangeiro: true,
      documento: 'US-TAX-987654321',
      codigo_iata: '99-8 7654 3',
      pais: 'Estados Unidos',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
    })

    expect(parceiro.id).toBeDefined()
    expect(parceiro.estrangeiro).toBe(true)
    expect(parceiro.documento).toBe('US-TAX-987654321')
  })

  it('não deve aceitar percentual de comissão superior a 100% ou negativo', async () => {
    await expect(
      sut.execute({
        hotel_id: 'hotel-1',
        tipo_parceiro: 'agente_autonomo',
        tipo_pessoa: 'PF',
        razao_social: 'Agente Comissão Invalida',
        documento: CPF_VALIDO,
        modelo_tarifario: 'comissionada',
        comissao_padrao: 150,
        politica_faturamento: 'prepago',
      })
    ).rejects.toThrow(ParceiroComercialValidationError)
  })
})

describe('EditarParceiroComercialUseCase', () => {
  let repository: InMemoryParceiroComercialRepository
  let sut: EditarParceiroComercialUseCase

  const CNPJ_VALIDO_1 = '11222333000181'
  const CNPJ_VALIDO_2 = '00000000000191'

  beforeEach(() => {
    repository = new InMemoryParceiroComercialRepository()
    sut = new EditarParceiroComercialUseCase(repository)
  })

  it('deve atualizar dados cadastrais e regras comerciais de um parceiro', async () => {
    const parceiro = await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agencia Alpha',
      documento: CNPJ_VALIDO_1,
      modelo_tarifario: 'comissionada',
      comissao_padrao: 10,
      politica_faturamento: 'prepago',
    })

    const atualizado = await sut.execute({
      id: parceiro.id,
      hotel_id: 'hotel-1',
      nome_fantasia: 'Alpha Turismo',
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
      limite_credito: 25000,
    })

    expect(atualizado.nome_fantasia).toBe('Alpha Turismo')
    expect(atualizado.modelo_tarifario).toBe('net')
    expect(atualizado.limite_credito).toBe(25000)
  })

  it('não deve permitir atualizar com documento já usado por outro parceiro', async () => {
    await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'operadora_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Operadora Beta',
      documento: CNPJ_VALIDO_2,
      modelo_tarifario: 'net',
      politica_faturamento: 'faturado',
    })

    const p1 = await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agencia Alpha',
      documento: CNPJ_VALIDO_1,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    await expect(
      sut.execute({
        id: p1.id,
        hotel_id: 'hotel-1',
        documento: CNPJ_VALIDO_2,
      })
    ).rejects.toThrow(ParceiroComercialConflictError)
  })
})

describe('Listar, Buscar, AtualizarStatus e Excluir ParceiroComercial UseCases', () => {
  let repository: InMemoryParceiroComercialRepository
  const CNPJ_VALIDO = '11222333000181'

  beforeEach(() => {
    repository = new InMemoryParceiroComercialRepository()
  })

  it('deve listar parceiros com filtros por tipo e busca textual', async () => {
    await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'clube_turismo',
      tipo_pessoa: 'PJ',
      razao_social: 'Clube de Férias Brasil',
      nome_fantasia: 'Férias Club',
      documento: CNPJ_VALIDO,
      cidade: 'Fortaleza',
      estado: 'CE',
      modelo_tarifario: 'net',
      politica_faturamento: 'voucher',
    })

    const listarSut = new ListarParceirosComerciaisUseCase(repository)
    const res = await listarSut.execute({
      hotel_id: 'hotel-1',
      pagina: 1,
      limite: 10,
      tipo_parceiro: 'clube_turismo',
    })

    expect(res.data).toHaveLength(1)
    expect(res.data[0].razao_social).toBe('Clube de Férias Brasil')
  })

  it('deve atualizar status para bloqueado exigindo motivo', async () => {
    const parceiro = await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agencia Teste',
      documento: CNPJ_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const statusSut = new AtualizarStatusParceiroUseCase(repository)

    await expect(
      statusSut.execute({
        id: parceiro.id,
        hotel_id: 'hotel-1',
        status: 'bloqueado',
        motivo_bloqueio: '',
      })
    ).rejects.toThrow(ParceiroComercialValidationError)

    const bloqueado = await statusSut.execute({
      id: parceiro.id,
      hotel_id: 'hotel-1',
      status: 'bloqueado',
      motivo_bloqueio: 'Inadimplência de faturas',
    })

    expect(bloqueado.status).toBe('bloqueado')
    expect(bloqueado.motivo_bloqueio).toBe('Inadimplência de faturas')
  })

  it('deve excluir parceiro comercial', async () => {
    const parceiro = await repository.create({
      hotel_id: 'hotel-1',
      tipo_parceiro: 'agencia_viagens',
      tipo_pessoa: 'PJ',
      razao_social: 'Agencia a excluir',
      documento: CNPJ_VALIDO,
      modelo_tarifario: 'comissionada',
      politica_faturamento: 'prepago',
    })

    const excluirSut = new ExcluirParceiroComercialUseCase(repository)
    await excluirSut.execute({ id: parceiro.id, hotel_id: 'hotel-1' })

    const buscarSut = new BuscarParceiroComercialUseCase(repository)
    await expect(
      buscarSut.execute({ id: parceiro.id, hotel_id: 'hotel-1' })
    ).rejects.toThrow()
  })
})

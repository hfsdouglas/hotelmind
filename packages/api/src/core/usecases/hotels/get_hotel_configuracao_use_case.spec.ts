import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryHotelConfiguracaoRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_configuracao_repository'
import { GetHotelConfiguracaoUseCase } from './get_hotel_configuracao_use_case'

let repository: InMemoryHotelConfiguracaoRepository
let sut: GetHotelConfiguracaoUseCase

describe('GetHotelConfiguracaoUseCase', () => {
  beforeEach(() => {
    repository = new InMemoryHotelConfiguracaoRepository()
    sut = new GetHotelConfiguracaoUseCase(repository)

    repository.seedHotel({
      id: 'hotel-1',
      nome_hotel: 'Hotel Grand Luxo',
      nome_fantasia: 'Grand Luxo',
      razao_social: 'Grand Luxo Hotelaria LTDA',
      cnpj: '12345678000199',
      email_comercial: 'contato@grandluxo.com',
      telefone_comercial: '11999999999',
    })
  })

  it('returns default settings when hotel has no persisted configuration', async () => {
    const result = await sut.execute({ hotelId: 'hotel-1' })

    expect(result.id).toBe('hotel-1')
    expect(result.nome_hotel).toBe('Hotel Grand Luxo')
    expect(result.nome_fantasia).toBe('Grand Luxo')
    expect(result.razao_social).toBe('Grand Luxo Hotelaria LTDA')
    expect(result.cnpj).toBe('12345678000199')
    expect(result.categoria).toBe('HOTEL')
    expect(result.horario_checkin).toBe('14:00')
    expect(result.horario_checkout).toBe('12:00')
    expect(result.recepcao_24h).toBe(true)
    expect(result.limite_idade_crianca_gratis).toBe(5)
  })

  it('returns persisted configuration when available', async () => {
    await repository.upsert('hotel-1', {
      nome_hotel: 'Grand Luxo Resort',
      nome_fantasia: 'Grand Luxo Modificado',
      razao_social: 'Grand Luxo Razao LTDA',
      cnpj: '99999999000100',
      email_comercial: 'reserva@grandluxo.com',
      telefone_comercial: '11888888888',
      categoria: 'RESORT',
      classificacao_estrelas: 5,
      descricao_curta: 'Resort de luxo',
      descricao_completa: 'Descrição completa',
      limite_idade_crianca_gratis: 7,
      quantidade_max_criancas_gratis: 2,
      horario_checkin: '15:00',
      horario_checkout: '11:00',
      recepcao_24h: false,
      horario_abertura_recepcao: '08:00',
      horario_fechamento_recepcao: '23:00',
      aceita_pets: true,
      peso_maximo_pet_kg: 20,
      permite_fumar: false,
      taxa_higienizacao_fumo: 300,
      tipo_estacionamento: 'GRATUITO',
      valor_diaria_estacionamento: null,
      estacionamento_reserva_previa: true,
      cobertura_estacionamento: 'COBERTO',
      possui_wifi: true,
      tipo_wifi: 'GRATUITO_TOTAL',
      nome_rede_wifi: 'Grand_Resort',
      senha_rede_wifi: 'wifi_pass',
      exibir_wifi_voucher: true,
      tema: {
        logo_principal: null,
        logo_escuro: null,
        favicon: null,
        cor_primaria: '#0055ff',
        cor_secundaria: '#555555',
        cor_fundo: '#f0f0f0',
        cor_superficie: '#ffffff',
        cor_texto_principal: '#111111',
        cor_texto_secundario: '#444444',
        cor_destaque: '#ffaa00',
      },
    })

    const result = await sut.execute({ hotelId: 'hotel-1' })

    expect(result.nome_fantasia).toBe('Grand Luxo Modificado')
    expect(result.categoria).toBe('RESORT')
    expect(result.classificacao_estrelas).toBe(5)
    expect(result.tema?.cor_primaria).toBe('#0055ff')
    expect(result.horario_checkin).toBe('15:00')
    expect(result.recepcao_24h).toBe(false)
    expect(result.horario_abertura_recepcao).toBe('08:00')
  })

  it('throws an error if hotel does not exist', async () => {
    await expect(sut.execute({ hotelId: 'non-existing' })).rejects.toThrowError(
      /hotel não encontrado/i
    )
  })
})

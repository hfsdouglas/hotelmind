import type { UpdateHotelConfiguracaoInput } from '@hotelmind/contracts'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryHotelConfiguracaoRepository } from '@/core/repositories/hotels/in-memory/in_memory_hotel_configuracao_repository'
import { UpdateHotelConfiguracaoUseCase } from './update_hotel_configuracao_use_case'

let repository: InMemoryHotelConfiguracaoRepository
let sut: UpdateHotelConfiguracaoUseCase

const BASE_INPUT: UpdateHotelConfiguracaoInput = {
  nome_hotel: 'Pousada Encantada',
  nome_fantasia: 'Pousada Encantada',
  razao_social: 'Pousada Encantada LTDA',
  cnpj: '11222333000144',
  email_comercial: 'contato@encantada.com',
  telefone_comercial: '11999999999',
  celular: '11988887777',
  website: 'https://pousadaencantada.com',
  categoria: 'POUSADA',
  classificacao_estrelas: 4,
  descricao_curta: 'Sua pousada no campo',
  descricao_completa: 'Descrição completa da pousada',
  limite_idade_crianca_gratis: 6,
  quantidade_max_criancas_gratis: 2,
  horario_checkin: '14:00',
  horario_checkout: '12:00',
  recepcao_24h: true,
  horario_abertura_recepcao: null,
  horario_fechamento_recepcao: null,
  aceita_pets: true,
  peso_maximo_pet_kg: 10,
  permite_fumar: false,
  taxa_higienizacao_fumo: 200,
  tipo_estacionamento: 'GRATUITO',
  valor_diaria_estacionamento: null,
  estacionamento_reserva_previa: false,
  cobertura_estacionamento: 'COBERTO',
  possui_wifi: true,
  tipo_wifi: 'GRATUITO_TOTAL',
  nome_rede_wifi: 'Pousada_WiFi',
  senha_rede_wifi: 'pousada123',
  exibir_wifi_voucher: true,
  tema: {
    logo_principal: 'data:image/png;base64,primary',
    logo_escuro: 'data:image/png;base64,dark',
    favicon: 'data:image/x-icon;base64,fav',
    cor_primaria: '#2563eb',
    cor_secundaria: '#475569',
    cor_fundo: '#f8fafc',
    cor_superficie: '#ffffff',
    cor_texto_principal: '#0f172a',
    cor_texto_secundario: '#334155',
    cor_destaque: '#eab308',
  },
}

describe('UpdateHotelConfiguracaoUseCase', () => {
  beforeEach(() => {
    repository = new InMemoryHotelConfiguracaoRepository()
    sut = new UpdateHotelConfiguracaoUseCase(repository)

    repository.seedHotel({
      id: 'hotel-1',
      nome_hotel: 'Pousada Original',
      nome_fantasia: 'Pousada Original',
      razao_social: 'Pousada Original LTDA',
      cnpj: '11222333000144',
      email_comercial: 'contato@encantada.com',
      telefone_comercial: '11999999999',
    })
  })

  it('updates configuration and institutional data successfully', async () => {
    const result = await sut.execute({
      hotelId: 'hotel-1',
      data: BASE_INPUT,
    })

    expect(result.id).toBe('hotel-1')
    expect(result.nome_fantasia).toBe('Pousada Encantada')
    expect(result.categoria).toBe('POUSADA')
    expect(result.tema?.cor_primaria).toBe('#2563eb')
    expect(result.limite_idade_crianca_gratis).toBe(6)
    expect(result.nome_rede_wifi).toBe('Pousada_WiFi')
  })

  it('validates reception hours when recepcao_24h is false', async () => {
    await expect(
      sut.execute({
        hotelId: 'hotel-1',
        data: {
          ...BASE_INPUT,
          recepcao_24h: false,
          horario_abertura_recepcao: null,
          horario_fechamento_recepcao: '22:00',
        },
      })
    ).rejects.toThrowError(/recepção/i)
  })

  it('throws an error if hotel does not exist', async () => {
    await expect(
      sut.execute({
        hotelId: 'non-existing',
        data: BASE_INPUT,
      })
    ).rejects.toThrowError(/hotel não encontrado/i)
  })
})

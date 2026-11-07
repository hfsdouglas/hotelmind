import type {
  CategoriaHotel,
  CoberturaEstacionamento,
  HotelConfiguracaoDTO,
  HotelTemaDTO,
  TipoEstacionamento,
  TipoWifi,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'
import type { HotelConfiguracaoRepository } from '../hotel_configuracao_repository'

interface StoredHotel {
  id: string
  created_at: Date
  updated_at: Date
  nome_hotel: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  email_comercial: string
  telefone_comercial: string
  celular?: string | null
  website?: string | null
  categoria: CategoriaHotel
  classificacao_estrelas: number
  descricao_curta?: string | null
  descricao_completa?: string | null
  limite_idade_crianca_gratis: number
  quantidade_max_criancas_gratis: number
  horario_checkin: string
  horario_checkout: string
  recepcao_24h: boolean
  horario_abertura_recepcao?: string | null
  horario_fechamento_recepcao?: string | null
  aceita_pets: boolean
  peso_maximo_pet_kg?: number | null
  permite_fumar: boolean
  taxa_higienizacao_fumo?: number | null
  tipo_estacionamento: TipoEstacionamento
  valor_diaria_estacionamento?: number | null
  estacionamento_reserva_previa: boolean
  cobertura_estacionamento: CoberturaEstacionamento
  possui_wifi: boolean
  tipo_wifi: TipoWifi
  nome_rede_wifi?: string | null
  senha_rede_wifi?: string | null
  exibir_wifi_voucher: boolean
  tema?: HotelTemaDTO | null
}

export class InMemoryHotelConfiguracaoRepository
  implements HotelConfiguracaoRepository
{
  public hotels: Map<string, StoredHotel> = new Map()

  seedHotel(hotel: Partial<StoredHotel> & { id: string }) {
    this.hotels.set(hotel.id, {
      id: hotel.id,
      created_at: hotel.created_at ?? new Date(),
      updated_at: hotel.updated_at ?? new Date(),
      nome_hotel: hotel.nome_hotel ?? 'Hotel Teste',
      nome_fantasia: hotel.nome_fantasia ?? 'Hotel Teste',
      razao_social: hotel.razao_social ?? 'Hotel Teste Ltda',
      cnpj: hotel.cnpj ?? '12345678000199',
      email_comercial: hotel.email_comercial ?? 'contato@hotelteste.com',
      telefone_comercial: hotel.telefone_comercial ?? '11999999999',
      celular: hotel.celular ?? null,
      website: hotel.website ?? null,
      categoria: hotel.categoria ?? 'HOTEL',
      classificacao_estrelas: hotel.classificacao_estrelas ?? 4,
      descricao_curta: hotel.descricao_curta ?? null,
      descricao_completa: hotel.descricao_completa ?? null,
      limite_idade_crianca_gratis: hotel.limite_idade_crianca_gratis ?? 5,
      quantidade_max_criancas_gratis: hotel.quantidade_max_criancas_gratis ?? 1,
      horario_checkin: hotel.horario_checkin ?? '14:00',
      horario_checkout: hotel.horario_checkout ?? '12:00',
      recepcao_24h: hotel.recepcao_24h ?? true,
      horario_abertura_recepcao: hotel.horario_abertura_recepcao ?? null,
      horario_fechamento_recepcao: hotel.horario_fechamento_recepcao ?? null,
      aceita_pets: hotel.aceita_pets ?? false,
      peso_maximo_pet_kg: hotel.peso_maximo_pet_kg ?? null,
      permite_fumar: hotel.permite_fumar ?? false,
      taxa_higienizacao_fumo: hotel.taxa_higienizacao_fumo ?? null,
      tipo_estacionamento: hotel.tipo_estacionamento ?? 'NAO_POSSUI',
      valor_diaria_estacionamento: hotel.valor_diaria_estacionamento ?? null,
      estacionamento_reserva_previa:
        hotel.estacionamento_reserva_previa ?? false,
      cobertura_estacionamento: hotel.cobertura_estacionamento ?? 'DESCOBERTO',
      possui_wifi: hotel.possui_wifi ?? true,
      tipo_wifi: hotel.tipo_wifi ?? 'GRATUITO_TOTAL',
      nome_rede_wifi: hotel.nome_rede_wifi ?? null,
      senha_rede_wifi: hotel.senha_rede_wifi ?? null,
      exibir_wifi_voucher: hotel.exibir_wifi_voucher ?? true,
      tema: hotel.tema ?? null,
    })
  }

  async findByHotelId(hotelId: string): Promise<HotelConfiguracaoDTO | null> {
    const hotel = this.hotels.get(hotelId)
    if (!hotel) return null

    return this.mapToDTO(hotel)
  }

  async upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoDTO> {
    const existing = this.hotels.get(hotelId)
    const now = new Date()

    const temaDTO: HotelTemaDTO = {
      id: existing?.tema?.id ?? `tema-${Date.now()}`,
      hotel_id: hotelId,
      created_at: existing?.tema?.created_at ?? now.toISOString(),
      updated_at: now.toISOString(),
      logo_principal: data.tema.logo_principal ?? null,
      logo_escuro: data.tema.logo_escuro ?? null,
      favicon: data.tema.favicon ?? null,
      cor_primaria: data.tema.cor_primaria,
      cor_secundaria: data.tema.cor_secundaria,
      cor_fundo: data.tema.cor_fundo,
      cor_superficie: data.tema.cor_superficie,
      cor_texto_principal: data.tema.cor_texto_principal,
      cor_texto_secundario: data.tema.cor_texto_secundario,
      cor_destaque: data.tema.cor_destaque,
    }

    const stored: StoredHotel = {
      id: hotelId,
      created_at: existing?.created_at ?? now,
      updated_at: now,
      nome_hotel: data.nome_hotel,
      nome_fantasia: data.nome_fantasia,
      razao_social: data.razao_social,
      cnpj: data.cnpj,
      email_comercial: data.email_comercial,
      telefone_comercial: data.telefone_comercial,
      celular: data.celular ?? null,
      website: data.website ?? null,
      categoria: data.categoria,
      classificacao_estrelas: data.classificacao_estrelas,
      descricao_curta: data.descricao_curta ?? null,
      descricao_completa: data.descricao_completa ?? null,
      limite_idade_crianca_gratis: data.limite_idade_crianca_gratis,
      quantidade_max_criancas_gratis: data.quantidade_max_criancas_gratis,
      horario_checkin: data.horario_checkin,
      horario_checkout: data.horario_checkout,
      recepcao_24h: data.recepcao_24h,
      horario_abertura_recepcao: data.recepcao_24h
        ? null
        : (data.horario_abertura_recepcao ?? null),
      horario_fechamento_recepcao: data.recepcao_24h
        ? null
        : (data.horario_fechamento_recepcao ?? null),
      aceita_pets: data.aceita_pets,
      peso_maximo_pet_kg: data.peso_maximo_pet_kg ?? null,
      permite_fumar: data.permite_fumar,
      taxa_higienizacao_fumo: data.taxa_higienizacao_fumo ?? null,
      tipo_estacionamento: data.tipo_estacionamento,
      valor_diaria_estacionamento: data.valor_diaria_estacionamento ?? null,
      estacionamento_reserva_previa: data.estacionamento_reserva_previa,
      cobertura_estacionamento: data.cobertura_estacionamento,
      possui_wifi: data.possui_wifi,
      tipo_wifi: data.tipo_wifi,
      nome_rede_wifi: data.nome_rede_wifi ?? null,
      senha_rede_wifi: data.senha_rede_wifi ?? null,
      exibir_wifi_voucher: data.exibir_wifi_voucher,
      tema: temaDTO,
    }

    this.hotels.set(hotelId, stored)
    return this.mapToDTO(stored)
  }

  private mapToDTO(hotel: StoredHotel): HotelConfiguracaoDTO {
    return {
      id: hotel.id,
      created_at: hotel.created_at.toISOString(),
      updated_at: hotel.updated_at.toISOString(),
      nome_hotel: hotel.nome_hotel,
      nome_fantasia: hotel.nome_fantasia,
      razao_social: hotel.razao_social,
      cnpj: hotel.cnpj,
      email_comercial: hotel.email_comercial,
      telefone_comercial: hotel.telefone_comercial,
      celular: hotel.celular ?? null,
      website: hotel.website ?? null,
      categoria: hotel.categoria,
      classificacao_estrelas: hotel.classificacao_estrelas,
      descricao_curta: hotel.descricao_curta ?? null,
      descricao_completa: hotel.descricao_completa ?? null,
      limite_idade_crianca_gratis: hotel.limite_idade_crianca_gratis,
      quantidade_max_criancas_gratis: hotel.quantidade_max_criancas_gratis,
      horario_checkin: hotel.horario_checkin,
      horario_checkout: hotel.horario_checkout,
      recepcao_24h: hotel.recepcao_24h,
      horario_abertura_recepcao: hotel.horario_abertura_recepcao ?? null,
      horario_fechamento_recepcao: hotel.horario_fechamento_recepcao ?? null,
      aceita_pets: hotel.aceita_pets,
      peso_maximo_pet_kg: hotel.peso_maximo_pet_kg ?? null,
      permite_fumar: hotel.permite_fumar,
      taxa_higienizacao_fumo: hotel.taxa_higienizacao_fumo ?? null,
      tipo_estacionamento: hotel.tipo_estacionamento,
      valor_diaria_estacionamento: hotel.valor_diaria_estacionamento ?? null,
      estacionamento_reserva_previa: hotel.estacionamento_reserva_previa,
      cobertura_estacionamento: hotel.cobertura_estacionamento,
      possui_wifi: hotel.possui_wifi,
      tipo_wifi: hotel.tipo_wifi,
      nome_rede_wifi: hotel.nome_rede_wifi ?? null,
      senha_rede_wifi: hotel.senha_rede_wifi ?? null,
      exibir_wifi_voucher: hotel.exibir_wifi_voucher,
      tema: hotel.tema ?? null,
    }
  }
}

import type {
  CategoriaHotel,
  CoberturaEstacionamento,
  HotelConfiguracaoDTO,
  HotelTemaDTO,
  TipoEstacionamento,
  TipoWifi,
  UpdateHotelConfiguracaoInput,
} from '@hotelmind/contracts'
import type { Prisma } from '@prisma/client'
import type { DB } from '@/lib/prisma'
import type { HotelConfiguracaoRepository } from '../hotel_configuracao_repository'

type HotelWithTema = Prisma.HotelGetPayload<{ include: { tema: true } }>

export class PostgresHotelConfiguracaoRepository
  implements HotelConfiguracaoRepository
{
  constructor(private readonly db: DB) {}

  async findByHotelId(hotelId: string): Promise<HotelConfiguracaoDTO | null> {
    const hotel = await this.db.hotel.findUnique({
      where: { id: hotelId },
      include: {
        tema: true,
      },
    })

    if (!hotel) return null

    return this.mapToDTO(hotel)
  }

  async upsert(
    hotelId: string,
    data: UpdateHotelConfiguracaoInput
  ): Promise<HotelConfiguracaoDTO> {
    const updatedHotel = await this.db.hotel.update({
      where: { id: hotelId },
      data: {
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
        tema: {
          upsert: {
            create: {
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
            },
            update: {
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
            },
          },
        },
      },
      include: {
        tema: true,
      },
    })

    return this.mapToDTO(updatedHotel)
  }

  private mapToDTO(hotel: HotelWithTema): HotelConfiguracaoDTO {
    let temaDTO: HotelTemaDTO | null = null
    if (hotel.tema) {
      temaDTO = {
        id: hotel.tema.id,
        hotel_id: hotel.tema.hotel_id,
        created_at: hotel.tema.created_at.toISOString(),
        updated_at: hotel.tema.updated_at.toISOString(),
        logo_principal: hotel.tema.logo_principal,
        logo_escuro: hotel.tema.logo_escuro,
        favicon: hotel.tema.favicon,
        cor_primaria: hotel.tema.cor_primaria,
        cor_secundaria: hotel.tema.cor_secundaria,
        cor_fundo: hotel.tema.cor_fundo,
        cor_superficie: hotel.tema.cor_superficie,
        cor_texto_principal: hotel.tema.cor_texto_principal,
        cor_texto_secundario: hotel.tema.cor_texto_secundario,
        cor_destaque: hotel.tema.cor_destaque,
      }
    }

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
      celular: hotel.celular,
      website: hotel.website,
      categoria: hotel.categoria as CategoriaHotel,
      classificacao_estrelas: hotel.classificacao_estrelas,
      descricao_curta: hotel.descricao_curta,
      descricao_completa: hotel.descricao_completa,
      limite_idade_crianca_gratis: hotel.limite_idade_crianca_gratis,
      quantidade_max_criancas_gratis: hotel.quantidade_max_criancas_gratis,
      horario_checkin: hotel.horario_checkin,
      horario_checkout: hotel.horario_checkout,
      recepcao_24h: hotel.recepcao_24h,
      horario_abertura_recepcao: hotel.horario_abertura_recepcao,
      horario_fechamento_recepcao: hotel.horario_fechamento_recepcao,
      aceita_pets: hotel.aceita_pets,
      peso_maximo_pet_kg: hotel.peso_maximo_pet_kg
        ? Number(hotel.peso_maximo_pet_kg)
        : null,
      permite_fumar: hotel.permite_fumar,
      taxa_higienizacao_fumo: hotel.taxa_higienizacao_fumo
        ? Number(hotel.taxa_higienizacao_fumo)
        : null,
      tipo_estacionamento: hotel.tipo_estacionamento as TipoEstacionamento,
      valor_diaria_estacionamento: hotel.valor_diaria_estacionamento
        ? Number(hotel.valor_diaria_estacionamento)
        : null,
      estacionamento_reserva_previa: hotel.estacionamento_reserva_previa,
      cobertura_estacionamento:
        hotel.cobertura_estacionamento as CoberturaEstacionamento,
      possui_wifi: hotel.possui_wifi,
      tipo_wifi: hotel.tipo_wifi as TipoWifi,
      nome_rede_wifi: hotel.nome_rede_wifi,
      senha_rede_wifi: hotel.senha_rede_wifi,
      exibir_wifi_voucher: hotel.exibir_wifi_voucher,
      tema: temaDTO,
    }
  }
}

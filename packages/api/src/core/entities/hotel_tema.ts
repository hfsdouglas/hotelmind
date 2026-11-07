const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export interface HotelTemaProps {
  id: string
  hotel_id: string
  created_at?: Date
  updated_at?: Date
  logo_principal?: string | null
  logo_escuro?: string | null
  favicon?: string | null
  cor_primaria: string
  cor_secundaria: string
  cor_fundo: string
  cor_superficie: string
  cor_texto_principal: string
  cor_texto_secundario: string
  cor_destaque: string
}

export class HotelTema {
  readonly id: string
  readonly hotel_id: string
  readonly created_at: Date
  readonly updated_at: Date
  readonly logo_principal: string | null
  readonly logo_escuro: string | null
  readonly favicon: string | null
  readonly cor_primaria: string
  readonly cor_secundaria: string
  readonly cor_fundo: string
  readonly cor_superficie: string
  readonly cor_texto_principal: string
  readonly cor_texto_secundario: string
  readonly cor_destaque: string

  constructor(props: HotelTemaProps) {
    HotelTema.validarCorHex('cor_primaria', props.cor_primaria)
    HotelTema.validarCorHex('cor_secundaria', props.cor_secundaria)
    HotelTema.validarCorHex('cor_fundo', props.cor_fundo)
    HotelTema.validarCorHex('cor_superficie', props.cor_superficie)
    HotelTema.validarCorHex('cor_texto_principal', props.cor_texto_principal)
    HotelTema.validarCorHex('cor_texto_secundario', props.cor_texto_secundario)
    HotelTema.validarCorHex('cor_destaque', props.cor_destaque)

    this.id = props.id
    this.hotel_id = props.hotel_id
    this.created_at = props.created_at ?? new Date()
    this.updated_at = props.updated_at ?? new Date()
    this.logo_principal = props.logo_principal ?? null
    this.logo_escuro = props.logo_escuro ?? null
    this.favicon = props.favicon ?? null
    this.cor_primaria = props.cor_primaria
    this.cor_secundaria = props.cor_secundaria
    this.cor_fundo = props.cor_fundo
    this.cor_superficie = props.cor_superficie
    this.cor_texto_principal = props.cor_texto_principal
    this.cor_texto_secundario = props.cor_texto_secundario
    this.cor_destaque = props.cor_destaque
  }

  static create(props: HotelTemaProps): HotelTema {
    return new HotelTema(props)
  }

  private static validarCorHex(campo: string, valor: string): void {
    if (!HEX_COLOR_REGEX.test(valor)) {
      throw new Error(
        `Cor ${campo} inválida. Deve estar no formato HEX (#RGB ou #RRGGBB).`
      )
    }
  }
}

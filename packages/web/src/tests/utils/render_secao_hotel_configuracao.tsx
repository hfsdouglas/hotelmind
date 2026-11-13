import { Form } from '@hotelmind/ui'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function makeHotelConfiguracaoValues(
  overrides: Partial<HotelConfiguracaoFormData> = {}
): HotelConfiguracaoFormData {
  return {
    nome_hotel: 'Hotel Central SA',
    nome_fantasia: 'Hotel Central',
    razao_social: 'Hotel Central LTDA',
    cnpj: '12345678000190',
    email_comercial: 'contato@hotelcentral.com.br',
    telefone_comercial: '1133334444',
    celular: null,
    website: null,
    categoria: 'HOTEL',
    classificacao_estrelas: 3,
    descricao_curta: null,
    descricao_completa: null,
    tema: {
      logo_principal: null,
      logo_escuro: null,
      favicon: null,
      cor_primaria: '#1e40af',
      cor_secundaria: '#64748b',
      cor_fundo: '#ffffff',
      cor_superficie: '#f8fafc',
      cor_texto_principal: '#0f172a',
      cor_texto_secundario: '#475569',
      cor_destaque: '#f59e0b',
    },
    limite_idade_crianca_gratis: 5,
    quantidade_max_criancas_gratis: 1,
    horario_checkin: '14:00',
    horario_checkout: '12:00',
    recepcao_24h: true,
    horario_abertura_recepcao: null,
    horario_fechamento_recepcao: null,
    aceita_pets: false,
    peso_maximo_pet_kg: null,
    permite_fumar: false,
    taxa_higienizacao_fumo: null,
    tipo_estacionamento: 'NAO_POSSUI',
    valor_diaria_estacionamento: null,
    estacionamento_reserva_previa: false,
    cobertura_estacionamento: 'DESCOBERTO',
    possui_wifi: true,
    tipo_wifi: 'GRATUITO_TOTAL',
    nome_rede_wifi: null,
    senha_rede_wifi: null,
    exibir_wifi_voucher: true,
    ...overrides,
  }
}

interface HarnessProps {
  values: HotelConfiguracaoFormData
  onForm: (form: UseFormReturn<HotelConfiguracaoFormData>) => void
  children: (form: UseFormReturn<HotelConfiguracaoFormData>) => ReactNode
}

function Harness({ values, onForm, children }: HarnessProps) {
  const form = useForm<HotelConfiguracaoFormData>({ defaultValues: values })
  onForm(form)
  return <Form {...form}>{children(form)}</Form>
}

/** Renders a hotel-configuracao section inside a react-hook-form provider. */
export function renderSecao(
  secao: (form: UseFormReturn<HotelConfiguracaoFormData>) => ReactNode,
  overrides: Partial<HotelConfiguracaoFormData> = {}
) {
  let current: UseFormReturn<HotelConfiguracaoFormData>
  const utils = render(
    <Harness
      values={makeHotelConfiguracaoValues(overrides)}
      onForm={f => {
        current = f
      }}
    >
      {secao}
    </Harness>
  )
  return { ...utils, getValues: () => current.getValues() }
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import {
  type HotelConfiguracaoFormData,
  hotelConfiguracaoFormSchema,
} from '@/schemas/hotel_configuracao'
import { ModalPreviewTema } from './modal_preview_tema'
import { SecaoApresentacao } from './secao_apresentacao'
import { SecaoCriancasHospedes } from './secao_criancas_hospedes'
import { SecaoDadosCadastrais } from './secao_dados_cadastrais'
import { SecaoEstacionamentoWifi } from './secao_estacionamento_wifi'
import { SecaoHorariosOperacao } from './secao_horarios_operacao'
import { SecaoIdentidadeVisual } from './secao_identidade_visual'
import { SecaoRegrasCasa } from './secao_regras_casa'

interface HotelConfiguracaoFormProps {
  initialData?: Partial<HotelConfiguracaoFormData>
  onSubmit: (data: HotelConfiguracaoFormData) => Promise<void>
  isSubmitting?: boolean
  title?: string
  backTo?: string
}

export function HotelConfiguracaoForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  title = 'Configurações do Hotel',
  backTo = '/',
}: HotelConfiguracaoFormProps) {
  const [modalPreviewAberto, setModalPreviewAberto] = useState(false)

  const defaultValues: HotelConfiguracaoFormData = {
    nome_hotel: initialData?.nome_hotel || '',
    nome_fantasia: initialData?.nome_fantasia || '',
    razao_social: initialData?.razao_social || '',
    cnpj: initialData?.cnpj || '',
    email_comercial: initialData?.email_comercial || '',
    telefone_comercial: initialData?.telefone_comercial || '',
    celular: initialData?.celular ?? null,
    website: initialData?.website ?? null,
    categoria: initialData?.categoria || 'HOTEL',
    classificacao_estrelas: initialData?.classificacao_estrelas ?? 0,

    descricao_curta: initialData?.descricao_curta ?? null,
    descricao_completa: initialData?.descricao_completa ?? null,

    tema: {
      logo_principal: initialData?.tema?.logo_principal ?? null,
      logo_escuro: initialData?.tema?.logo_escuro ?? null,
      favicon: initialData?.tema?.favicon ?? null,
      cor_primaria: initialData?.tema?.cor_primaria || '#1e40af',
      cor_secundaria: initialData?.tema?.cor_secundaria || '#64748b',
      cor_fundo: initialData?.tema?.cor_fundo || '#ffffff',
      cor_superficie: initialData?.tema?.cor_superficie || '#f8fafc',
      cor_texto_principal: initialData?.tema?.cor_texto_principal || '#0f172a',
      cor_texto_secundario:
        initialData?.tema?.cor_texto_secundario || '#475569',
      cor_destaque: initialData?.tema?.cor_destaque || '#f59e0b',
    },

    limite_idade_crianca_gratis: initialData?.limite_idade_crianca_gratis ?? 5,
    quantidade_max_criancas_gratis:
      initialData?.quantidade_max_criancas_gratis ?? 1,

    horario_checkin: initialData?.horario_checkin || '14:00',
    horario_checkout: initialData?.horario_checkout || '12:00',
    recepcao_24h: initialData?.recepcao_24h ?? true,
    horario_abertura_recepcao: initialData?.horario_abertura_recepcao ?? null,
    horario_fechamento_recepcao:
      initialData?.horario_fechamento_recepcao ?? null,

    aceita_pets: initialData?.aceita_pets ?? false,
    peso_maximo_pet_kg: initialData?.peso_maximo_pet_kg ?? null,
    permite_fumar: initialData?.permite_fumar ?? false,
    taxa_higienizacao_fumo: initialData?.taxa_higienizacao_fumo ?? null,

    tipo_estacionamento: initialData?.tipo_estacionamento || 'NAO_POSSUI',
    valor_diaria_estacionamento:
      initialData?.valor_diaria_estacionamento ?? null,
    estacionamento_reserva_previa:
      initialData?.estacionamento_reserva_previa ?? false,
    cobertura_estacionamento:
      initialData?.cobertura_estacionamento || 'DESCOBERTO',

    possui_wifi: initialData?.possui_wifi ?? true,
    tipo_wifi: initialData?.tipo_wifi || 'GRATUITO_TOTAL',
    nome_rede_wifi: initialData?.nome_rede_wifi ?? null,
    senha_rede_wifi: initialData?.senha_rede_wifi ?? null,
    exibir_wifi_voucher: initialData?.exibir_wifi_voucher ?? true,
  }

  const form = useForm<HotelConfiguracaoFormData>({
    resolver: zodResolver(hotelConfiguracaoFormSchema),
    defaultValues,
    values: defaultValues,
  })

  const formTema = form.watch('tema')
  const nomeFantasia = form.watch('nome_fantasia')

  return (
    <Form {...form}>
      <CrudFormLayout
        title={title}
        backTo={backTo}
        cardTitle="Configurações Gerais do Hotel"
        onSubmit={form.handleSubmit(onSubmit)}
        actions={<SaveButton isPending={isSubmitting} label="Salvar" />}
      >
        <div className="space-y-8">
          <SecaoDadosCadastrais form={form} />
          <Separator />
          <SecaoApresentacao form={form} />
          <Separator />
          <SecaoIdentidadeVisual
            form={form}
            onOpenPreview={() => setModalPreviewAberto(true)}
          />
          <Separator />
          <SecaoCriancasHospedes form={form} />
          <Separator />
          <SecaoHorariosOperacao form={form} />
          <Separator />
          <SecaoRegrasCasa form={form} />
          <Separator />
          <SecaoEstacionamentoWifi form={form} />
        </div>
      </CrudFormLayout>

      <ModalPreviewTema
        open={modalPreviewAberto}
        onOpenChange={setModalPreviewAberto}
        nomeHotel={nomeFantasia || 'Seu Hotel'}
        corPrimaria={formTema.cor_primaria}
        corSecundaria={formTema.cor_secundaria}
        corFundo={formTema.cor_fundo}
        corSuperficie={formTema.cor_superficie}
        corTextoPrincipal={formTema.cor_texto_principal}
        corTextoSecundario={formTema.cor_texto_secundario}
        corDestaque={formTema.cor_destaque}
        logoUrl={formTema.logo_principal}
      />
    </Form>
  )
}

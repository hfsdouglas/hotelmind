import { zodResolver } from '@hookform/resolvers/zod'
import type { HotelConfiguracaoDTO } from '@hotelmind/contracts'
import { Car, Clock, Palette, ShieldAlert, Users } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  type HotelConfiguracaoFormData,
  hotelConfiguracaoFormSchema,
} from '@/schemas/hotel_configuracao'
import { AbaCriancasHospedes } from './aba_criancas_hospedes'
import { AbaEstacionamentoWifi } from './aba_estacionamento_wifi'
import { AbaHorariosOperacao } from './aba_horarios_operacao'
import { AbaIdentidadeVisual } from './aba_identidade_visual'
import { AbaRegrasCasa } from './aba_regras_casa'
import { BarraAcoesFixa } from './barra_acoes_fixa'

interface HotelConfiguracaoFormProps {
  initialData: HotelConfiguracaoDTO
  onSubmit: (data: HotelConfiguracaoFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export function HotelConfiguracaoForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: HotelConfiguracaoFormProps) {
  const [activeTab, setActiveTab] = useState('identidade')

  const defaultValues: HotelConfiguracaoFormData = {
    hotel_name: initialData.hotel_name || '',
    legal_name: initialData.legal_name || '',
    tax_id: initialData.tax_id || '',
    category: initialData.category,
    star_rating: initialData.star_rating,
    short_description: initialData.short_description,
    full_description: initialData.full_description,
    logo_primary: initialData.logo_primary,
    logo_dark: initialData.logo_dark,
    favicon: initialData.favicon,
    color_primary: initialData.color_primary,
    color_secondary: initialData.color_secondary,
    color_background: initialData.color_background,
    color_surface: initialData.color_surface,
    color_text_primary: initialData.color_text_primary,
    color_text_secondary: initialData.color_text_secondary,
    color_accent: initialData.color_accent,
    free_child_age_limit: initialData.free_child_age_limit,
    free_child_max_per_room: initialData.free_child_max_per_room,
    checkin_time: initialData.checkin_time,
    checkout_time: initialData.checkout_time,
    reception_24h: initialData.reception_24h,
    reception_opening_time: initialData.reception_opening_time,
    reception_closing_time: initialData.reception_closing_time,
    pet_friendly: initialData.pet_friendly,
    pet_max_weight_kg: initialData.pet_max_weight_kg,
    smoking_allowed: initialData.smoking_allowed,
    smoking_sanitization_fee: initialData.smoking_sanitization_fee,
    parking_type: initialData.parking_type,
    parking_fee_per_day: initialData.parking_fee_per_day,
    parking_reservation_required: initialData.parking_reservation_required,
    parking_covered: initialData.parking_covered,
    wifi_available: initialData.wifi_available,
    wifi_type: initialData.wifi_type,
    wifi_ssid_default: initialData.wifi_ssid_default,
    wifi_password_default: initialData.wifi_password_default,
    wifi_show_on_voucher: initialData.wifi_show_on_voucher,
  }

  const methods = useForm<HotelConfiguracaoFormData>({
    resolver: zodResolver(hotelConfiguracaoFormSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods

  const handleDiscard = () => {
    reset(defaultValues)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="identidade" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Identidade Visual & Tema</span>
            </TabsTrigger>
            <TabsTrigger value="criancas" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Crianças & Hóspedes Extras</span>
            </TabsTrigger>
            <TabsTrigger value="horarios" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Horários & Operação</span>
            </TabsTrigger>
            <TabsTrigger value="regras" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Regras da Casa & Pets</span>
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span>Estacionamento & Wi-Fi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identidade" forceMount>
            <AbaIdentidadeVisual />
          </TabsContent>

          <TabsContent value="criancas" forceMount>
            <AbaCriancasHospedes />
          </TabsContent>

          <TabsContent value="horarios" forceMount>
            <AbaHorariosOperacao />
          </TabsContent>

          <TabsContent value="regras" forceMount>
            <AbaRegrasCasa />
          </TabsContent>

          <TabsContent value="servicos" forceMount>
            <AbaEstacionamentoWifi />
          </TabsContent>
        </Tabs>

        <BarraAcoesFixa
          onDiscard={handleDiscard}
          isSubmitting={isSubmitting}
          isDirty={isDirty}
        />
      </form>
    </FormProvider>
  )
}

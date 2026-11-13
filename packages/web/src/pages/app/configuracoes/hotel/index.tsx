import { Skeleton } from '@hotelmind/ui'
import { toast } from 'sonner'
import { HotelConfiguracaoForm } from '@/components/hotel-configuracao/hotel_configuracao_form'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  useHotelConfiguracao,
  useUpdateHotelConfiguracaoMutation,
} from '@/hooks/use_hotel_configuracao'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function HotelConfiguracoesPage() {
  usePageTitle('Configurações do Hotel')
  const { data: config, isLoading, isError } = useHotelConfiguracao()
  const { mutateAsync: updateConfig, isPending: isUpdating } =
    useUpdateHotelConfiguracaoMutation()

  const handleSubmit = async (formData: HotelConfiguracaoFormData) => {
    try {
      await updateConfig(formData)
      toast.success('Configurações do hotel atualizadas com sucesso!')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Falha ao salvar as configurações.'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !config) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as configurações do hotel. Tente recarregar
          a página.
        </div>
      </div>
    )
  }

  return (
    <HotelConfiguracaoForm
      initialData={config}
      onSubmit={handleSubmit}
      isSubmitting={isUpdating}
    />
  )
}

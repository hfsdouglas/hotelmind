import { toast } from 'sonner'
import { HotelConfiguracaoForm } from '@/components/hotel-configuracao/hotel_configuracao_form'
import { PageHeader } from '@/components/page_header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useHotelConfiguracao,
  useUpdateHotelConfiguracaoMutation,
} from '@/hooks/useHotelConfiguracao'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

export function HotelConfiguracoesPage() {
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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Configurações do Hotel"
        description="Gerencie a identidade visual, temas, regras operacionais e comodidades da propriedade"
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as configurações do hotel. Tente recarregar
          a página.
        </div>
      )}

      {!isLoading && config && (
        <HotelConfiguracaoForm
          initialData={config}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  )
}

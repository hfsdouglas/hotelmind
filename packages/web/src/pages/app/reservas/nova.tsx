import { useNavigate } from 'react-router-dom'
import { CrudFormLayout } from '@/components/forms/crud_form_layout'
import { NovaReservaFormFields } from '@/components/reservas/nova_reserva_form_fields'
import { usePageTitle } from '@/hooks/use_document_title'
import { useNovaReservaForm } from '@/hooks/use_nova_reserva_form'

export function NovaReservaPage() {
  usePageTitle('Nova Reserva')
  const navigate = useNavigate()
  const controller = useNovaReservaForm({
    onSuccess: reserva => navigate(`/reservas/${reserva.id}`),
  })

  return (
    <CrudFormLayout
      title="Nova Reserva"
      backTo="/reservas"
      onSubmit={controller.onSubmit}
      isSubmitting={controller.isPending}
      submitLabel="Salvar"
    >
      <NovaReservaFormFields controller={controller} />
    </CrudFormLayout>
  )
}

export default NovaReservaPage

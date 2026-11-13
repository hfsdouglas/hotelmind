import type { Reserva } from '@hotelmind/contracts'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@hotelmind/ui'
import { SaveButton } from '@/components/forms/save_button'
import { NovaReservaFormFields } from '@/components/reservas/nova_reserva_form_fields'
import { useNovaReservaForm } from '@/hooks/use_nova_reserva_form'
import type {
  NovaReservaValoresIniciais,
  QuartoPreferido,
} from '@/types/calendar_range_selection'

interface ModalNovaReservaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  valoresIniciais?: NovaReservaValoresIniciais
  quartoPreferido?: QuartoPreferido
  onCreated: (reserva: Reserva) => void
}

type NovaReservaFormContentProps = Omit<ModalNovaReservaProps, 'open'>

function NovaReservaFormContent({
  onOpenChange,
  valoresIniciais,
  quartoPreferido,
  onCreated,
}: NovaReservaFormContentProps) {
  const controller = useNovaReservaForm({
    valoresIniciais,
    onSuccess: onCreated,
  })

  return (
    <form onSubmit={controller.onSubmit} className="space-y-6">
      <NovaReservaFormFields
        controller={controller}
        quartoPreferido={quartoPreferido}
      />
      <div className="flex justify-end gap-3 [&>button]:min-w-[140px]">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <SaveButton isPending={controller.isPending}>Salvar</SaveButton>
      </div>
    </form>
  )
}

export function ModalNovaReserva({
  open,
  onOpenChange,
  valoresIniciais,
  quartoPreferido,
  onCreated,
}: ModalNovaReservaProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-none">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar uma nova reserva.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <NovaReservaFormContent
            onOpenChange={onOpenChange}
            valoresIniciais={valoresIniciais}
            quartoPreferido={quartoPreferido}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

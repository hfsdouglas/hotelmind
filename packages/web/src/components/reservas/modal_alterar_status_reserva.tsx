import type { ReservaStatus } from '@hotelmind/contracts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@hotelmind/ui'
import { ShieldAlert } from 'lucide-react'

interface ModalAlterarStatusReservaProps {
  open: boolean
  novoStatus: ReservaStatus | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ModalAlterarStatusReserva({
  open,
  novoStatus,
  onOpenChange,
  onConfirm,
}: ModalAlterarStatusReservaProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="size-5" />
            <AlertDialogTitle>
              Confirmar alteração para{' '}
              {novoStatus === 'cancelada' ? 'Cancelada' : 'No-show'}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm pt-2">
            Esta ação é final e liberará a suíte no inventário de
            disponibilidade do hotel. O link da FNRH também será desativado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onConfirm}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

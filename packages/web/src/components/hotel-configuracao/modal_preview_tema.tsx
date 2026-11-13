import { Button } from '@hotelmind/ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PreviewTemaCard, type PreviewTemaCardProps } from './preview_tema_card'

interface ModalPreviewTemaProps extends PreviewTemaCardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalPreviewTema({
  open,
  onOpenChange,
  ...previewProps
}: ModalPreviewTemaProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévia da Identidade Visual</DialogTitle>
          <DialogDescription>
            Visualização em tempo real de como o tema configurado será exibido
            aos hóspedes no motor de reservas e vouchers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <PreviewTemaCard {...previewProps} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

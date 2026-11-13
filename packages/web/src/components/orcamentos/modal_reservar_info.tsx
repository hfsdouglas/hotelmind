import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@hotelmind/ui'
import { Phone, Sparkles } from 'lucide-react'

interface ModalReservarInfoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelNome: string
  hotelTelefone?: string
}

export function ModalReservarInfo({
  open,
  onOpenChange,
  hotelNome,
  hotelTelefone,
}: ModalReservarInfoProps) {
  const whatsappUrl = hotelTelefone
    ? `https://wa.me/55${hotelTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá! Estou visualizando o orçamento para o ${hotelNome} e gostaria de confirmar minha reserva.`
      )}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 text-center sm:text-left">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="mt-3 text-xl font-bold">
            Reserva Direta em Breve!
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
            A confirmação de reservas com pagamento 100% online estará
            disponível em breve em nossa plataforma.
            <br />
            <br />
            Para garantir os valores deste orçamento agora e confirmar sua
            estada no <strong>{hotelNome}</strong>, entre em contato diretamente
            com nossa equipe de atendimento.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
          {whatsappUrl && (
            <Button asChild className="w-full sm:w-auto">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 h-4 w-4" />
                Falar no WhatsApp
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

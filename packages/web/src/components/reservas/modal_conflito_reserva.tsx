import type { QuartoDisponivel } from '@hotelmind/contracts'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@hotelmind/ui'
import { AlertTriangle } from 'lucide-react'

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

interface ModalConflitoReservaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mensagem: string
  alternativas: QuartoDisponivel[]
  onSelectAlternativa: (quarto: QuartoDisponivel) => void
}

export function ModalConflitoReserva({
  open,
  onOpenChange,
  mensagem,
  alternativas,
  onSelectAlternativa,
}: ModalConflitoReservaProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="size-5" />
            <AlertDialogTitle>Suíte com Conflito no Período</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm pt-2">
            {mensagem}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {alternativas.length > 0 && (
          <div className="space-y-2 my-2">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Suítes alternativas disponíveis para o período e regime:
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {alternativas.map(alt => (
                <button
                  type="button"
                  key={alt.quarto_id}
                  onClick={() => onSelectAlternativa(alt)}
                  className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-900 cursor-pointer flex items-center justify-between text-xs transition-colors w-full text-left"
                >
                  <div>
                    <span className="font-semibold">
                      Suíte {alt.identificacao}
                    </span>
                    <span className="text-zinc-500 ml-1.5">
                      ({alt.categoria_nome})
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600">
                    {formatarMoeda(alt.valor_total)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

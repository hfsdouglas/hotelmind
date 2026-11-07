import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BarraAcoesFixaProps {
  onDiscard: () => void
  isSubmitting: boolean
  isDirty?: boolean
}

export function BarraAcoesFixa({
  onDiscard,
  isSubmitting,
  isDirty = true,
}: BarraAcoesFixaProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t shadow-lg py-3.5 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground hidden sm:block">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              * Você possui alterações pendentes de salvamento.
            </span>
          ) : (
            <span>Todas as alterações foram salvas.</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            disabled={isSubmitting}
            className="w-full sm:w-44 cursor-pointer"
          >
            Descartar alterações
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-44 cursor-pointer bg-primary text-primary-foreground font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

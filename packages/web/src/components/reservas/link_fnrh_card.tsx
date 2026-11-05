import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  PowerOff,
  RefreshCw,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface LinkFnrhCardProps {
  reservaId: string
  tokenFnrh: string
  tokenAtivo: boolean
  fnrhEnviadaEm?: string | null
  fichasPreenchidas: number
  totalHospedes: number
  disabled?: boolean
}

export function LinkFnrhCard({
  reservaId,
  tokenFnrh,
  tokenAtivo,
  fnrhEnviadaEm,
  fichasPreenchidas,
  totalHospedes,
  disabled = false,
}: LinkFnrhCardProps) {
  const queryClient = useQueryClient()
  const [currentToken, setCurrentToken] = useState(tokenFnrh)
  const [isAtivo, setIsAtivo] = useState(tokenAtivo)

  const publicUrl = `${window.location.origin}/fnrh/${currentToken}`

  const copyMutation = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Link da FNRH copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o link automaticamente.')
    }
  }

  const regenerarMutation = useMutation({
    mutationFn: () => reservasService.regenerarLinkFnrh(reservaId),
    onSuccess: data => {
      setCurrentToken(data.url_token)
      setIsAtivo(true)
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] })
      toast.success(
        'Novo link FNRH gerado com sucesso! O link anterior foi invalidado.'
      )
    },
    onError: () => {
      toast.error('Erro ao regenerar link FNRH.')
    },
  })

  const desativarMutation = useMutation({
    mutationFn: () => reservasService.desativarLinkFnrh(reservaId),
    onSuccess: () => {
      setIsAtivo(false)
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] })
      toast.info('Link da FNRH desativado.')
    },
    onError: () => {
      toast.error('Erro ao desativar link FNRH.')
    },
  })

  return (
    <Card className="border-indigo-100 dark:border-indigo-950/40 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="size-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-base font-semibold">
              Ficha Nacional de Hóspedes (FNRH)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isAtivo ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Link Ativo
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-zinc-100 text-zinc-600 border-zinc-200"
              >
                Link Inativo
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Envie este link mobile-first ao cliente para preenchimento dos dados
          obrigatórios de todos os hóspedes antes do check-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950/60 p-3 rounded-lg border border-indigo-100 dark:border-zinc-800 text-sm">
          <span className="font-mono text-xs truncate max-w-[280px] sm:max-w-md text-zinc-600 dark:text-zinc-400">
            {publicUrl}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyMutation}
              className="gap-1.5"
            >
              <Copy className="size-3.5" />
              Copiar
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                title="Abrir ficha"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span>Progresso das fichas:</span>
            <Badge variant="secondary">
              {fichasPreenchidas} de {totalHospedes} preenchidas
            </Badge>
            {fnrhEnviadaEm && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                Dados enviados pelo cliente em{' '}
                {new Date(fnrhEnviadaEm).toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAtivo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || desativarMutation.isPending}
                onClick={() => desativarMutation.mutate()}
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 h-8 gap-1"
              >
                <PowerOff className="size-3" />
                Desativar link
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || regenerarMutation.isPending}
              onClick={() => regenerarMutation.mutate()}
              className="text-zinc-600 hover:text-zinc-900 h-8 gap-1"
            >
              <RefreshCw
                className={`size-3 ${regenerarMutation.isPending ? 'animate-spin' : ''}`}
              />
              Regenerar link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  PowerOff,
  RefreshCw,
  Smartphone,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'

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

  useEffect(() => {
    if (tokenFnrh) {
      setCurrentToken(tokenFnrh)
    }
  }, [tokenFnrh])

  useEffect(() => {
    setIsAtivo(tokenAtivo)
  }, [tokenAtivo])

  const publicUrl = currentToken
    ? `${window.location.origin}/fnrh/${currentToken}`
    : ''

  const copyMutation = async () => {
    if (!publicUrl) return
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <Smartphone className="size-5 text-primary shrink-0" />
          <CardTitle className="text-base font-semibold leading-snug">
            Ficha Nacional de Hóspedes (FNRH)
          </CardTitle>
        </div>

        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Envie este link ao cliente para preenchimento dos dados obrigatórios
          de todos os hóspedes antes do check-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status do Link substituindo a exibição direta da URL */}
        <div className="flex items-center justify-between bg-muted/40 px-3.5 py-2.5 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground font-medium">
            Status do Link
          </span>
          {isAtivo ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-800 text-xs"
            >
              Link Ativo
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border text-xs"
            >
              Link Inativo
            </Badge>
          )}
        </div>

        {/* Botões ocupando todo o espaço disponível em 2 colunas de mesmo tamanho */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyMutation}
            disabled={!publicUrl || disabled}
            className="w-full gap-1.5 h-8 text-xs"
          >
            <Copy className="size-3.5" />
            Copiar Link
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!publicUrl || disabled}
            className="w-full gap-1.5 h-8 text-xs"
            asChild={Boolean(publicUrl)}
          >
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                title="Abrir ficha"
              >
                <ExternalLink className="size-3.5" />
                Abrir Ficha
              </a>
            ) : (
              <span>
                <ExternalLink className="size-3.5" />
                Abrir Ficha
              </span>
            )}
          </Button>
        </div>

        {/* Indicador de progresso centralizado entre as linhas divisórias */}
        <div className="py-2.5 border-y border-border flex flex-col items-center justify-center gap-1 text-xs text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-muted-foreground">
              Progresso do preenchimento:
            </span>
            <span className="font-semibold text-foreground">
              {fichasPreenchidas} de {totalHospedes} preenchida(s)
            </span>
          </div>

          {fnrhEnviadaEm && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>FNRH enviada pelo cliente à recepção</span>
            </div>
          )}
        </div>

        {/* Ações de Gestão do Link em 2 colunas com o mesmo tamanho */}
        <div className="grid grid-cols-2 gap-2">
          {isAtivo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => desativarMutation.mutate()}
              disabled={desativarMutation.isPending || disabled}
              className="text-xs text-destructive hover:text-destructive h-8 w-full"
            >
              <PowerOff className="size-3.5 mr-1" />
              Desativar Link
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => regenerarMutation.mutate()}
              disabled={regenerarMutation.isPending || disabled}
              className="text-xs h-8 w-full"
            >
              <RefreshCw className="size-3.5 mr-1" />
              Reativar / Novo Link
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => regenerarMutation.mutate()}
            disabled={regenerarMutation.isPending || disabled}
            className="text-xs text-muted-foreground hover:text-foreground h-8 w-full"
            title="Invalida o link atual e gera uma nova URL"
          >
            <RefreshCw
              className={`size-3.5 mr-1 ${
                regenerarMutation.isPending ? 'animate-spin' : ''
              }`}
            />
            Regenerar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

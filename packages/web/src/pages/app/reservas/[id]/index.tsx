import type {
  ReservaHospede,
  ReservaStatus,
  SaveFichaPayload,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { LinkFnrhCard } from '@/components/reservas/link_fnrh_card'
import { ModalEditarFichaFnrh } from '@/components/reservas/modal_editar_ficha_fnrh'
import { ReservaContatoCard } from '@/components/reservas/reserva_contato_card'
import { ReservaDetalhesHospedagem } from '@/components/reservas/reserva_detalhes_hospedagem'
import { ReservaHospedesSection } from '@/components/reservas/reserva_hospedes_section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use_document_title'

function getStatusBadge(status: ReservaStatus) {
  switch (status) {
    case 'a_confirmar':
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-800"
        >
          A Confirmar
        </Badge>
      )
    case 'confirmada':
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-800"
        >
          Confirmada
        </Badge>
      )
    case 'check_in':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-800"
        >
          Check-in
        </Badge>
      )
    case 'check_out':
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border"
        >
          Check-out
        </Badge>
      )
    case 'no_show':
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-800"
        >
          No-show
        </Badge>
      )
    case 'cancelada':
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/30"
        >
          Cancelada
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function DetalheReservaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [hospedeEmEdicao, setHospedeEmEdicao] = useState<ReservaHospede | null>(
    null
  )

  const reservaId = id ?? ''

  const { data: reserva, isLoading } = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => reservasService.get(reservaId),
    enabled: Boolean(reservaId),
  })

  usePageTitle(
    reserva?.codigo ? `Reserva ${reserva.codigo}` : 'Detalhes da Reserva'
  )

  // Salvar ficha do hóspede pela recepção
  const fichaMutation = useMutation({
    mutationFn: ({
      posicao,
      data,
    }: {
      posicao: number
      data: SaveFichaPayload
    }) => reservasService.salvarFichaHospede(reservaId, posicao, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] })
      toast.success('Ficha do hóspede salva com sucesso!')
      setHospedeEmEdicao(null)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message || 'Erro ao salvar ficha.'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Carregando detalhes da reserva...
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">Reserva não encontrada.</p>
        <Button onClick={() => navigate('/reservas')}>
          Voltar para Reservas
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reservas')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {reserva.codigo}
              </h1>
              {getStatusBadge(reserva.status)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criada em{' '}
              {new Date(reserva.criado_em).toLocaleDateString('pt-BR')} •
              Titular: {reserva.titular_nome}
            </p>
          </div>
        </div>

        {/* Botão de Edição (status é modificado na tela de edição) */}
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to={`/reservas/${reserva.id}/editar`}>
              <Edit className="mr-2 size-4" />
              Editar Reserva
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados da Hospedagem & Diárias Congeladas */}
        <div className="lg:col-span-2 space-y-6">
          <ReservaDetalhesHospedagem reserva={reserva} />
          <ReservaHospedesSection
            totalHospedes={reserva.total_hospedes}
            fichasPreenchidas={reserva.fichas_preenchidas}
            hospedes={reserva.hospedes}
            onEditarFicha={h => setHospedeEmEdicao(h)}
          />
        </div>

        {/* Coluna Direita: Cartão do Link FNRH & Contato */}
        <div className="space-y-6">
          <LinkFnrhCard
            reservaId={reserva.id}
            tokenFnrh={reserva.token_fnrh}
            tokenAtivo={reserva.token_fnrh_ativo}
            fnrhEnviadaEm={reserva.fnrh_enviada_em}
            fichasPreenchidas={reserva.fichas_preenchidas}
            totalHospedes={reserva.total_hospedes}
            disabled={
              reserva.status === 'cancelada' || reserva.status === 'no_show'
            }
          />
          <ReservaContatoCard
            titularNome={reserva.titular_nome}
            titularTelefone={reserva.titular_telefone}
            titularEmail={reserva.titular_email}
            observacoes={reserva.observacoes}
          />
        </div>
      </div>

      {/* Modal para Editar Ficha do Hóspede */}
      <ModalEditarFichaFnrh
        open={Boolean(hospedeEmEdicao)}
        hospede={hospedeEmEdicao}
        hospedePrincipal={reserva.hospedes?.find(h => h.posicao === 1) || null}
        onOpenChange={open => !open && setHospedeEmEdicao(null)}
        onSubmit={payload => fichaMutation.mutate(payload)}
        isPending={fichaMutation.isPending}
      />
    </div>
  )
}

export default DetalheReservaPage

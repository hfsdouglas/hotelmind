import type {
  ReservaHospede,
  ReservaStatus,
  SaveFichaPayload,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { LinkFnrhCard } from '@/components/reservas/link_fnrh_card'
import { ModalAlterarStatusReserva } from '@/components/reservas/modal_alterar_status_reserva'
import { ModalEditarFichaFnrh } from '@/components/reservas/modal_editar_ficha_fnrh'
import { ReservaContatoCard } from '@/components/reservas/reserva_contato_card'
import { ReservaDetalhesHospedagem } from '@/components/reservas/reserva_detalhes_hospedagem'
import { ReservaHospedesSection } from '@/components/reservas/reserva_hospedes_section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function getStatusBadge(status: ReservaStatus) {
  switch (status) {
    case 'a_confirmar':
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          A Confirmar
        </Badge>
      )
    case 'confirmada':
      return (
        <Badge
          variant="outline"
          className="bg-sky-50 text-sky-700 border-sky-200"
        >
          Confirmada
        </Badge>
      )
    case 'check_in':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          Check-in
        </Badge>
      )
    case 'check_out':
      return (
        <Badge
          variant="outline"
          className="bg-zinc-100 text-zinc-700 border-zinc-200"
        >
          Check-out
        </Badge>
      )
    case 'no_show':
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          No-show
        </Badge>
      )
    case 'cancelada':
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200"
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
  const [statusModal, setStatusModal] = useState<{
    open: boolean
    novoStatus: ReservaStatus | null
  }>({ open: false, novoStatus: null })

  const reservaId = id ?? ''

  const { data: reserva, isLoading } = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => reservasService.get(reservaId),
    enabled: Boolean(reservaId),
  })

  // Transição de status
  const statusMutation = useMutation({
    mutationFn: (status: ReservaStatus) =>
      reservasService.changeStatus(reservaId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Status da reserva atualizado com sucesso!')
      setStatusModal({ open: false, novoStatus: null })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message || 'Erro ao alterar status.'
      toast.error(msg)
    },
  })

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
      <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">
        Carregando detalhes da reserva...
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-zinc-600">Reserva não encontrada.</p>
        <Button onClick={() => navigate('/reservas')}>
          Voltar para Reservas
        </Button>
      </div>
    )
  }

  // Transições de status permitidas
  const transicoesPossiveis: Record<ReservaStatus, ReservaStatus[]> = {
    a_confirmar: ['confirmada', 'cancelada'],
    confirmada: ['check_in', 'no_show', 'cancelada'],
    check_in: ['check_out'],
    check_out: [],
    no_show: [],
    cancelada: [],
  }

  const opcoesStatus = transicoesPossiveis[reserva.status] || []

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
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
              <h1 className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                {reserva.codigo}
              </h1>
              {getStatusBadge(reserva.status)}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Criada em{' '}
              {new Date(reserva.criado_em).toLocaleDateString('pt-BR')} •
              Titular: {reserva.titular_nome}
            </p>
          </div>
        </div>

        {/* Transições de Status */}
        {opcoesStatus.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Mudar status:</span>
            {opcoesStatus.map(st => (
              <Button
                key={st}
                size="sm"
                variant={
                  st === 'cancelada' || st === 'no_show' ? 'outline' : 'default'
                }
                className={
                  st === 'check_in'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : st === 'confirmada'
                      ? 'bg-sky-600 hover:bg-sky-700'
                      : ''
                }
                onClick={() => {
                  if (st === 'cancelada' || st === 'no_show') {
                    setStatusModal({ open: true, novoStatus: st })
                  } else {
                    statusMutation.mutate(st)
                  }
                }}
                disabled={statusMutation.isPending}
              >
                {st === 'confirmada' && 'Confirmar Reserva'}
                {st === 'check_in' && 'Realizar Check-in'}
                {st === 'check_out' && 'Finalizar Check-out'}
                {st === 'no_show' && 'Marcar No-show'}
                {st === 'cancelada' && 'Cancelar Reserva'}
              </Button>
            ))}
          </div>
        )}
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
        onOpenChange={open => !open && setHospedeEmEdicao(null)}
        onSubmit={payload => fichaMutation.mutate(payload)}
        isPending={fichaMutation.isPending}
      />

      {/* Diálogo de Confirmação para Cancelar ou No-show */}
      <ModalAlterarStatusReserva
        open={statusModal.open}
        novoStatus={statusModal.novoStatus}
        onOpenChange={open => setStatusModal(prev => ({ ...prev, open }))}
        onConfirm={() => {
          if (statusModal.novoStatus) {
            statusMutation.mutate(statusModal.novoStatus)
          }
        }}
      />
    </div>
  )
}

export default DetalheReservaPage

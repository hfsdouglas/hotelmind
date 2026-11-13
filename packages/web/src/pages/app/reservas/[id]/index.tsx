import type { ReservaHospede, SaveFichaPayload } from '@hotelmind/contracts'
import { Button } from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { LinkFnrhCard } from '@/components/reservas/link_fnrh_card'
import { ModalEditarFichaFnrh } from '@/components/reservas/modal_editar_ficha_fnrh'
import { ReservaContatoCard } from '@/components/reservas/reserva_contato_card'
import { ReservaDetalhesHospedagem } from '@/components/reservas/reserva_detalhes_hospedagem'
import { ReservaHospedesSection } from '@/components/reservas/reserva_hospedes_section'
import { ReservaStatusBadge } from '@/components/reservas/reserva_status_badge'
import { usePageTitle } from '@/hooks/use_document_title'
import { primeira_ficha_pendente } from '@/lib/fnrh'

const FNRH_PARAM = 'fnrh'
const FNRH_PENDENTE_PARAM = 'pendente'

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

  const [searchParams, setSearchParams] = useSearchParams()
  const fnrhPendenteTratado = useRef(false)

  // FR-012: abre a ficha do primeiro hóspede pendente uma única vez e limpa o parâmetro
  useEffect(() => {
    if (fnrhPendenteTratado.current) return
    if (searchParams.get(FNRH_PARAM) !== FNRH_PENDENTE_PARAM) return
    if (!reserva) return
    fnrhPendenteTratado.current = true

    const hospedes = reserva.hospedes ?? []
    const primeira = primeira_ficha_pendente(
      hospedes.map(h => ({
        posicao: h.posicao,
        nome: h.nome_completo,
        ficha_status: h.ficha_status,
      }))
    )
    const alvo = hospedes.find(h => h.posicao === primeira?.posicao)
    if (alvo) setHospedeEmEdicao(alvo)

    const next = new URLSearchParams(searchParams)
    next.delete(FNRH_PARAM)
    setSearchParams(next, { replace: true })
  }, [reserva, searchParams, setSearchParams])

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
              <ReservaStatusBadge status={reserva.status} />
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

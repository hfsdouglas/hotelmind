import type {
  FichaFnrh,
  ReservaHospede,
  ReservaStatus,
  SaveFichaPayload,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit2, Handshake, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { LinkFnrhCard } from '@/components/reservas/link_fnrh_card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mask_phone } from '@/hooks/use_phone_mask'

function formatarDataBR(dataIso: string | null | undefined) {
  if (!dataIso) return '-'
  const dateOnly = dataIso.split('T')[0]
  const [ano, mes, dia] = dateOnly.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

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
  const [formDataFicha, setFormDataFicha] = useState<Partial<FichaFnrh>>({})
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
    // biome-ignore lint/suspicious/noExplicitAny: error handling
    onError: (err: any) => {
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
    // biome-ignore lint/suspicious/noExplicitAny: error handling
    onError: (err: any) => {
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

  const abrirEdicaoHospede = (hospede: ReservaHospede) => {
    setHospedeEmEdicao(hospede)
    setFormDataFicha({
      nome_completo: hospede.nome_completo || '',
      nacionalidade: hospede.nacionalidade || 'Brasileira',
      data_nascimento: hospede.data_nascimento || '',
      sexo: hospede.sexo || '',
      profissao: hospede.profissao || '',
      tipo_documento: hospede.tipo_documento || 'cpf',
      numero_documento: hospede.numero_documento || '',
      logradouro: hospede.logradouro || '',
      numero_endereco: hospede.numero_endereco || '',
      complemento: hospede.complemento || '',
      bairro: hospede.bairro || '',
      cidade: hospede.cidade || '',
      estado: hospede.estado || '',
      cep: hospede.cep || '',
      pais_residencia: hospede.pais_residencia || 'Brasil',
      telefone: hospede.telefone || '',
      email: hospede.email || '',
      motivo_viagem: hospede.motivo_viagem || 'Lazer',
      meio_transporte: hospede.meio_transporte || 'Automóvel',
      procedencia: hospede.procedencia || '',
      proximo_destino: hospede.proximo_destino || '',
      responsavel_posicao: hospede.responsavel_posicao || null,
    })
  }

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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Dados da Hospedagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block">Check-in</span>
                  <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                    {formatarDataBR(reserva.check_in)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Check-out</span>
                  <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                    {formatarDataBR(reserva.check_out)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Suíte</span>
                  <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                    {reserva.quarto?.identificacao || '-'} (
                    {reserva.quarto?.categoria_nome || '-'})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Regime</span>
                  <span className="font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          reserva.regime_alimentacao?.cor_pulseira || '#999',
                      }}
                    />
                    {reserva.regime_alimentacao?.titulo}
                  </span>
                </div>
              </div>

              {reserva.parceiro_comercial && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs">
                  <Handshake className="size-4 text-indigo-600" />
                  <span className="text-zinc-500">
                    Parceiro Comercial Vinculado:
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {reserva.parceiro_comercial.razao_social}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diárias Congeladas na Criação */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Tarifas Aplicadas por Diária
                </CardTitle>
                <span className="text-xs text-zinc-400">
                  Valores congelados
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reserva.detalhamento_diarias.map(diaria => (
                  <div
                    key={diaria.data}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatarDataBR(diaria.data)}
                      </span>
                      <span className="text-zinc-400 ml-2">
                        ({diaria.tarifario_nome})
                      </span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatarMoeda(diaria.valor_diaria)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 flex items-center justify-between text-sm font-bold">
                  <span>Valor Total da Reserva</span>
                  <span className="text-indigo-700 dark:text-indigo-400 text-lg">
                    {formatarMoeda(reserva.valor_total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hóspedes da Reserva */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Hóspedes da Reserva ({reserva.total_hospedes})
                  </CardTitle>
                  <CardDescription>
                    {reserva.fichas_preenchidas} de {reserva.total_hospedes}{' '}
                    ficha(s) preenchida(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reserva.hospedes?.map(h => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 bg-white dark:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {h.posicao === 1 ? 'Titular' : `Hóspede ${h.posicao}`}
                        </Badge>
                        <span className="font-semibold text-sm truncate max-w-[150px]">
                          {h.nome_completo || 'Dados não informados'}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          h.ficha_status === 'preenchida'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : h.ficha_status === 'rascunho'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {h.ficha_status === 'preenchida'
                          ? 'Preenchida'
                          : h.ficha_status === 'rascunho'
                            ? 'Rascunho'
                            : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="text-xs text-zinc-500 space-y-0.5">
                      {h.numero_documento && (
                        <p>
                          Doc: {h.tipo_documento?.toUpperCase()}{' '}
                          {h.numero_documento}
                        </p>
                      )}
                      {h.telefone && <p>Tel: {h.telefone}</p>}
                      {h.cidade && h.estado && (
                        <p>
                          Origem: {h.cidade}/{h.estado}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-400">
                        {h.preenchido_por
                          ? `Preenchido via ${h.preenchido_por}`
                          : 'Aguardando preenchimento'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => abrirEdicaoHospede(h)}
                      >
                        <Edit2 className="size-3" />
                        Editar Ficha
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Cartão do Link FNRH & Ações */}
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Contato do Titular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-zinc-400 block">Nome</span>
                <span className="font-semibold text-sm">
                  {reserva.titular_nome}
                </span>
              </div>
              {reserva.titular_telefone && (
                <div>
                  <span className="text-zinc-400 block">Telefone</span>
                  <span>{mask_phone(reserva.titular_telefone)}</span>
                </div>
              )}
              {reserva.titular_email && (
                <div>
                  <span className="text-zinc-400 block">E-mail</span>
                  <span>{reserva.titular_email}</span>
                </div>
              )}
              {reserva.observacoes && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block">Observações</span>
                  <p className="text-zinc-600 mt-1">{reserva.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para Editar Ficha do Hóspede */}
      <Dialog
        open={!!hospedeEmEdicao}
        onOpenChange={open => !open && setHospedeEmEdicao(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              FNRH -{' '}
              {hospedeEmEdicao?.posicao === 1
                ? 'Titular'
                : `Hóspede ${hospedeEmEdicao?.posicao}`}
            </DialogTitle>
            <DialogDescription>
              Preencha ou atualize as informações cadastrais exigidas pela Ficha
              Nacional de Registro de Hóspedes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <Label>Nome Completo *</Label>
              <Input
                value={formDataFicha.nome_completo || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    nome_completo: e.target.value,
                  }))
                }
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-1">
              <Label>Nacionalidade *</Label>
              <Input
                value={formDataFicha.nacionalidade || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    nacionalidade: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={formDataFicha.data_nascimento || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    data_nascimento: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Gênero / Sexo *</Label>
              <Input
                value={formDataFicha.sexo || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, sexo: e.target.value }))
                }
                placeholder="Masculino / Feminino / Outro"
              />
            </div>

            <div className="space-y-1">
              <Label>Profissão *</Label>
              <Input
                value={formDataFicha.profissao || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, profissao: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo de Documento *</Label>
              <select
                value={formDataFicha.tipo_documento || 'cpf'}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    tipo_documento: e.target
                      .value as FichaFnrh['tipo_documento'],
                  }))
                }
                className="w-full px-3 py-2 border rounded-md text-xs bg-white dark:bg-zinc-950 border-zinc-200"
              >
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="passaporte">Passaporte</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label>Número do Documento *</Label>
              <Input
                value={formDataFicha.numero_documento || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    numero_documento: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={formDataFicha.telefone || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, telefone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formDataFicha.email || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>País de Residência *</Label>
              <Input
                value={formDataFicha.pais_residencia || 'Brasil'}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    pais_residencia: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Cidade *</Label>
              <Input
                value={formDataFicha.cidade || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, cidade: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Estado (UF de 2 letras) *</Label>
              <Input
                maxLength={2}
                value={formDataFicha.estado || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    estado: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Logradouro *</Label>
              <Input
                value={formDataFicha.logradouro || ''}
                onChange={e =>
                  setFormDataFicha(p => ({ ...p, logradouro: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Motivo da Viagem *</Label>
              <Input
                value={formDataFicha.motivo_viagem || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    motivo_viagem: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Meio de Transporte *</Label>
              <Input
                value={formDataFicha.meio_transporte || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    meio_transporte: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Procedência *</Label>
              <Input
                value={formDataFicha.procedencia || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    procedencia: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Próximo Destino *</Label>
              <Input
                value={formDataFicha.proximo_destino || ''}
                onChange={e =>
                  setFormDataFicha(p => ({
                    ...p,
                    proximo_destino: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (hospedeEmEdicao) {
                  fichaMutation.mutate({
                    posicao: hospedeEmEdicao.posicao,
                    data: { ...formDataFicha, concluir: false },
                  })
                }
              }}
              disabled={fichaMutation.isPending}
            >
              Salvar como Rascunho
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (hospedeEmEdicao) {
                  fichaMutation.mutate({
                    posicao: hospedeEmEdicao.posicao,
                    data: { ...formDataFicha, concluir: true },
                  })
                }
              }}
              disabled={fichaMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Concluir Ficha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação para Cancelar ou No-show */}
      <AlertDialog
        open={statusModal.open}
        onOpenChange={open => setStatusModal(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="size-5" />
              <AlertDialogTitle>
                Confirmar alteração para{' '}
                {statusModal.novoStatus === 'cancelada'
                  ? 'Cancelada'
                  : 'No-show'}
                ?
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
              onClick={() => {
                if (statusModal.novoStatus) {
                  statusMutation.mutate(statusModal.novoStatus)
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DetalheReservaPage

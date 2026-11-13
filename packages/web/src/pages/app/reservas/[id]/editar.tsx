import { zodResolver } from '@hookform/resolvers/zod'
import type {
  QuartoDisponivel,
  ReservaConflitoErro,
  ReservaStatus,
} from '@hotelmind/contracts'
import {
  Badge,
  DatePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  BedDouble,
  Calendar,
  CheckCircle2,
  DollarSign,
  Handshake,
  Loader2,
  Mail,
  PawPrint,
  Phone,
  Tag,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { reservasService } from '@/api/reservas.service'
import { CrudFormLayout } from '@/components/forms/crud_form_layout'
import { ModalConflitoReserva } from '@/components/reservas/modal_conflito_reserva'
import { usePageTitle } from '@/hooks/use_document_title'
import { mask_phone, unmask_phone, usePhoneMask } from '@/hooks/use_phone_mask'
import {
  type EditarReservaFormData,
  editarReservaFormSchema,
} from '@/schemas/reservas/reserva.schema'

function enumerateNights(checkIn: string, checkOut: string): string[] {
  if (!checkIn || !checkOut || checkIn >= checkOut) return []
  const nights: string[] = []
  const [sy, sm, sd] = checkIn.split('-').map(Number)
  const current = new Date(Date.UTC(sy, sm - 1, sd))
  while (true) {
    const iso = current.toISOString().slice(0, 10)
    if (iso >= checkOut) break
    nights.push(iso)
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return nights
}

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
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

const STATUS_LABELS: Record<ReservaStatus, string> = {
  a_confirmar: 'A Confirmar',
  confirmada: 'Confirmada',
  check_in: 'Check-in (Hóspede no hotel)',
  check_out: 'Check-out (Finalizada)',
  no_show: 'No-show (Não compareceu)',
  cancelada: 'Cancelada',
}

const TRANSIÇÕES_STATUS: Record<ReservaStatus, ReservaStatus[]> = {
  a_confirmar: ['a_confirmar', 'confirmada', 'cancelada'],
  confirmada: ['confirmada', 'check_in', 'no_show', 'cancelada'],
  check_in: ['check_in', 'check_out'],
  check_out: ['check_out'],
  no_show: ['no_show'],
  cancelada: ['cancelada'],
}

export function EditarReservaPage() {
  const { id } = useParams<{ id: string }>()
  const reservaId = id ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const phoneMask = usePhoneMask()

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('')
  const [conflitoModal, setConflitoModal] = useState<{
    open: boolean
    mensagem: string
    alternativas: QuartoDisponivel[]
  }>({
    open: false,
    mensagem: '',
    alternativas: [],
  })

  // 1. Carregar dados atuais da reserva
  const { data: reserva, isLoading: carregandoReserva } = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => reservasService.get(reservaId),
    enabled: Boolean(reservaId),
  })

  usePageTitle(
    reserva?.codigo ? `Editar Reserva ${reserva.codigo}` : 'Editar Reserva'
  )

  // 2. Regimes ativos
  const { data: regimesData } = useQuery({
    queryKey: ['regimes_alimentacao_ativos'],
    queryFn: () => regimesAlimentacaoService.list({ ativo: true, limite: 250 }),
  })
  const regimes = regimesData?.data || []

  // 3. Parceiros ativos
  const { data: parceirosData } = useQuery({
    queryKey: ['parceiros_comerciais_ativos'],
    queryFn: () =>
      parceirosComerciaisService.list({ status: 'ativo', limite: 250 }),
  })
  const parceiros = parceirosData?.data || []

  const form = useForm<EditarReservaFormData>({
    resolver: zodResolver(editarReservaFormSchema),
    defaultValues: {
      check_in: '',
      check_out: '',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      cupom_desconto: '',
      parceiro_comercial_id: '',
      regime_alimentacao_id: '',
      quarto_id: '',
      titular_nome: '',
      titular_telefone: '',
      titular_email: '',
      observacoes: '',
      status: 'a_confirmar',
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form

  // Preenche formulário com os dados carregados
  useEffect(() => {
    if (reserva) {
      reset({
        check_in: reserva.check_in.split('T')[0],
        check_out: reserva.check_out.split('T')[0],
        quantidade_adultos: reserva.quantidade_adultos,
        quantidade_criancas: reserva.quantidade_criancas,
        quantidade_pets: reserva.quantidade_pets ?? 0,
        cupom_desconto: reserva.cupom_desconto || '',
        parceiro_comercial_id: reserva.parceiro_comercial_id || '',
        regime_alimentacao_id: reserva.regime_alimentacao_id,
        quarto_id: reserva.quarto_id,
        titular_nome: reserva.titular_nome,
        titular_telefone: reserva.titular_telefone
          ? mask_phone(reserva.titular_telefone)
          : '',
        titular_email: reserva.titular_email || '',
        observacoes: reserva.observacoes || '',
        status: reserva.status,
      })
      if (reserva.quarto?.categoria_nome) {
        setCategoriaSelecionada(reserva.quarto.categoria_nome)
      }
    }
  }, [reserva, reset])

  const checkIn = watch('check_in')
  const checkOut = watch('check_out')
  const adultos = watch('quantidade_adultos') || 1
  const criancas = watch('quantidade_criancas') || 0
  const totalPessoas = adultos + criancas
  const regimeId = watch('regime_alimentacao_id')
  const quartoIdSelecionado = watch('quarto_id')
  const parceiroId = watch('parceiro_comercial_id')

  const nights = useMemo(
    () => enumerateNights(checkIn, checkOut),
    [checkIn, checkOut]
  )

  const podeConsultar = Boolean(
    checkIn && checkOut && checkIn < checkOut && regimeId && totalPessoas >= 1
  )

  // Consulta disponibilidade de quartos para o período
  const { data: disponiveis = [], isFetching: carregandoDisponibilidade } =
    useQuery({
      queryKey: [
        'reservas_disponibilidade',
        checkIn,
        checkOut,
        regimeId,
        totalPessoas,
        parceiroId,
      ],
      queryFn: () =>
        reservasService.disponibilidade({
          check_in: checkIn,
          check_out: checkOut,
          regime_alimentacao_id: regimeId,
          pessoas: totalPessoas,
          parceiro_id: parceiroId || null,
        }),
      enabled: podeConsultar,
    })

  // Inclui o quarto atual da reserva na lista caso não esteja entre os retornados
  const disponiveisComAtual = useMemo(() => {
    if (!reserva?.quarto) return disponiveis
    const jaContem = disponiveis.some(d => d.quarto_id === reserva.quarto_id)
    if (!jaContem && reserva.quarto_id) {
      return [
        {
          quarto_id: reserva.quarto_id,
          identificacao: reserva.quarto.identificacao,
          categoria_nome: reserva.quarto.categoria_nome,
          limite_hospedes: reserva.total_hospedes,
          valor_total: reserva.valor_total,
        },
        ...disponiveis,
      ]
    }
    return disponiveis
  }, [disponiveis, reserva])

  // Agrupamento por categoria
  const categoriasComSuites = useMemo(() => {
    const mapa = new Map<
      string,
      {
        categoria_nome: string
        suites: QuartoDisponivel[]
        valor_total: string
        limite_hospedes: number
      }
    >()

    for (const suite of disponiveisComAtual) {
      const key = suite.categoria_nome
      if (!mapa.has(key)) {
        mapa.set(key, {
          categoria_nome: suite.categoria_nome,
          suites: [],
          valor_total: suite.valor_total,
          limite_hospedes: suite.limite_hospedes,
        })
      }
      mapa.get(key)?.suites.push(suite)
    }

    return Array.from(mapa.values())
  }, [disponiveisComAtual])

  const quartoSelecionado = disponiveisComAtual.find(
    q => q.quarto_id === quartoIdSelecionado
  )
  const regimeSelecionado = regimes.find(r => r.id === regimeId)

  const categoriaAtiva = useMemo(() => {
    if (quartoSelecionado) {
      return quartoSelecionado.categoria_nome
    }
    if (
      categoriaSelecionada &&
      categoriasComSuites.some(c => c.categoria_nome === categoriaSelecionada)
    ) {
      return categoriaSelecionada
    }
    return categoriasComSuites[0]?.categoria_nome || ''
  }, [quartoSelecionado, categoriaSelecionada, categoriasComSuites])

  const suitesDaCategoria = useMemo(() => {
    return (
      categoriasComSuites.find(c => c.categoria_nome === categoriaAtiva)
        ?.suites || []
    )
  }, [categoriasComSuites, categoriaAtiva])

  // Opções de status permitidas conforme o status original da reserva
  const statusPermitidos = useMemo(() => {
    if (!reserva) return []
    return TRANSIÇÕES_STATUS[reserva.status] || [reserva.status]
  }, [reserva])

  const updateMutation = useMutation({
    mutationFn: (data: EditarReservaFormData) =>
      reservasService.update(reservaId, {
        titular_nome: data.titular_nome,
        titular_telefone: data.titular_telefone
          ? unmask_phone(data.titular_telefone)
          : null,
        titular_email: data.titular_email || null,
        quarto_id: data.quarto_id,
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_comercial_id:
          data.parceiro_comercial_id && data.parceiro_comercial_id !== 'direta'
            ? data.parceiro_comercial_id
            : null,
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        quantidade_pets: data.quantidade_pets,
        cupom_desconto: data.cupom_desconto?.trim() || null,
        status: data.status,
        observacoes: data.observacoes || null,
      }),
    onSuccess: atualizada => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success(`Reserva ${atualizada.codigo} atualizada com sucesso!`)
      navigate(`/reservas/${atualizada.id}`)
    },
    // biome-ignore lint/suspicious/noExplicitAny: Axios error handling
    onError: (err: any) => {
      if (err.response?.status === 409) {
        const conflitoData = err.response.data as ReservaConflitoErro
        setConflitoModal({
          open: true,
          mensagem:
            conflitoData.message ||
            'A suíte selecionada já possui reserva no período.',
          alternativas: conflitoData.alternativas || [],
        })
        return
      }
      const msg = err.response?.data?.message || 'Erro ao atualizar a reserva.'
      toast.error(msg)
    },
  })

  const onSubmit = (data: EditarReservaFormData) => {
    updateMutation.mutate(data)
  }

  if (carregandoReserva) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
        Carregando dados da reserva...
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">Reserva não encontrada.</p>
        <button
          type="button"
          onClick={() => navigate('/reservas')}
          className="text-primary hover:underline text-sm"
        >
          Voltar para listagem de reservas
        </button>
      </div>
    )
  }

  return (
    <CrudFormLayout
      title={`Editar Reserva ${reserva.codigo}`}
      backTo={`/reservas/${reserva.id}`}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={updateMutation.isPending}
      submitLabel="Salvar Alterações"
    >
      <input type="hidden" {...register('regime_alimentacao_id')} />
      <input type="hidden" {...register('quarto_id')} />

      <div className="space-y-8">
        {/* STATUS DA RESERVA */}
        <section className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Situação / Status da Reserva
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Código: {reserva.codigo}
            </span>
          </div>

          <div className="max-w-md space-y-1.5">
            <Label htmlFor="status">Alterar Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value || reserva.status}
                  onValueChange={val => field.onChange(val as ReservaStatus)}
                >
                  <SelectTrigger id="status" className="h-9 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusPermitidos.map(st => (
                      <SelectItem key={st} value={st}>
                        {STATUS_LABELS[st]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Apenas transições de status válidas para o estágio atual são
              disponibilizadas.
            </p>
          </div>
        </section>

        {/* PASSO 1: PERÍODO E OCUPAÇÃO (ESPELHO DE ORÇAMENTOS) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 1: Período e Hóspedes
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="check_in">Data de Check-in *</Label>
              <Controller
                control={control}
                name="check_in"
                render={({ field }) => (
                  <DatePicker
                    id="check_in"
                    value={field.value}
                    onChange={val => {
                      field.onChange(val)
                      setValue('quarto_id', '')
                    }}
                    placeholder="dd/mm/aaaa"
                  />
                )}
              />
              {errors.check_in && (
                <span className="block text-xs text-destructive">
                  {errors.check_in.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="check_out">Data de Check-out *</Label>
              <Controller
                control={control}
                name="check_out"
                render={({ field }) => (
                  <DatePicker
                    id="check_out"
                    value={field.value}
                    onChange={val => {
                      field.onChange(val)
                      setValue('quarto_id', '')
                    }}
                    placeholder="dd/mm/aaaa"
                  />
                )}
              />
              {errors.check_out && (
                <span className="block text-xs text-destructive">
                  {errors.check_out.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_adultos">Adultos *</Label>
              <div className="relative">
                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_adultos"
                  type="number"
                  min={1}
                  className="pl-9 h-9"
                  {...register('quantidade_adultos', { valueAsNumber: true })}
                />
              </div>
              {errors.quantidade_adultos && (
                <span className="block text-xs text-destructive">
                  {errors.quantidade_adultos.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_criancas">Crianças</Label>
              <Input
                id="quantidade_criancas"
                type="number"
                min={0}
                className="h-9"
                {...register('quantidade_criancas', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_pets">Pets (opcional)</Label>
              <div className="relative">
                <PawPrint className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_pets"
                  type="number"
                  min={0}
                  className="pl-9 h-9"
                  {...register('quantidade_pets', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {nights.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Período selecionado: {nights.length}{' '}
                {nights.length === 1 ? 'diária' : 'diárias'} (
                {formatarDataBR(checkIn)} até {formatarDataBR(checkOut)})
              </span>
            </div>
          )}
        </section>

        {/* PASSO 2: PARCEIRO COMERCIAL */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 2: Parceiro Comercial
            </h2>
          </div>
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="parceiro_comercial_id">
              Canal / Parceiro Comercial (Opcional)
            </Label>
            <Controller
              control={control}
              name="parceiro_comercial_id"
              render={({ field }) => (
                <Select
                  value={field.value || 'direta'}
                  onValueChange={val => {
                    field.onChange(val === 'direta' ? '' : val)
                    setValue('quarto_id', '')
                  }}
                >
                  <SelectTrigger id="parceiro_comercial_id" className="h-9">
                    <SelectValue placeholder="Selecione o canal ou parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direta">Reserva Direta</SelectItem>
                    {parceiros.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.razao_social}{' '}
                        {p.nome_fantasia ? `(${p.nome_fantasia})` : ''} -{' '}
                        {p.tipo_parceiro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Selecione caso a reserva seja intermediada por agência de viagens,
              operadora ou clube de turismo.
            </p>
          </div>
        </section>

        {/* PASSO 3: REGIME DE ALIMENTAÇÃO (ESPELHO DE ORÇAMENTOS) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Utensils className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 3: Regime de Alimentação
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {regimes.map(regime => {
              const isSelected = regimeId === regime.id
              return (
                <button
                  key={regime.id}
                  type="button"
                  onClick={() => {
                    setValue('regime_alimentacao_id', regime.id, {
                      shouldValidate: true,
                    })
                    setValue('quarto_id', '', { shouldValidate: true })
                  }}
                  className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-muted-foreground/40 bg-card'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {regime.titulo}
                    </span>
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: regime.cor_pulseira }}
                      title={`Cor pulseira: ${regime.cor_pulseira}`}
                    />
                  </div>

                  {regime.descricao && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {regime.descricao}
                    </p>
                  )}

                  <div className="mt-3 flex w-full items-center justify-between">
                    {isSelected && (
                      <span className="text-xs font-semibold text-primary">
                        Selecionado ✓
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {errors.regime_alimentacao_id && (
            <span className="mt-2 block text-xs text-destructive">
              {errors.regime_alimentacao_id.message}
            </span>
          )}
        </section>

        {/* CUPOM DE DESCONTO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Cupom de Desconto
            </h2>
          </div>
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="cupom_desconto">Código do cupom (opcional)</Label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="cupom_desconto"
                placeholder="Ex.: PROMO10"
                className="h-9 pl-9 uppercase"
                {...register('cupom_desconto')}
              />
            </div>
          </div>
        </section>

        {/* PASSO 4: ACOMODAÇÃO HIERÁRQUICA (CATEGORIAS E NÚMERO DA SUÍTE) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Passo 4: Acomodação (Suítes Disponíveis pelo Tarifário)
              </h2>
            </div>
            {carregandoDisponibilidade && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Consultando disponibilidade e tarifas...
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* 1. SELEÇÃO DA CATEGORIA */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                1º Escolha a categoria de acomodação:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {categoriasComSuites.map(cat => {
                  const isSelected = categoriaAtiva === cat.categoria_nome

                  return (
                    <button
                      key={cat.categoria_nome}
                      type="button"
                      onClick={() => {
                        setCategoriaSelecionada(cat.categoria_nome)
                        if (
                          quartoSelecionado &&
                          quartoSelecionado.categoria_nome !==
                            cat.categoria_nome
                        ) {
                          setValue('quarto_id', '', { shouldValidate: true })
                        }
                      }}
                      className={`flex flex-col rounded-lg border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {cat.categoria_nome}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300"
                        >
                          {cat.suites.length}{' '}
                          {cat.suites.length === 1
                            ? 'suíte livre'
                            : 'suítes livres'}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-baseline gap-1 text-primary">
                          <span className="text-lg font-bold">
                            {formatarMoeda(cat.valor_total)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / total ({nights.length}{' '}
                            {nights.length === 1 ? 'diária' : 'diárias'})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Capacidade: até {cat.limite_hospedes} hóspede(s)
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Categoria selecionada
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. SELEÇÃO DO NÚMERO DA SUÍTE DA CATEGORIA */}
            {categoriaAtiva && suitesDaCategoria.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  2º Selecione o número da suíte em{' '}
                  <strong className="text-foreground">{categoriaAtiva}</strong>:
                </p>
                <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {suitesDaCategoria.map(suite => {
                    const isSelected = quartoIdSelecionado === suite.quarto_id

                    return (
                      <button
                        key={suite.quarto_id}
                        type="button"
                        onClick={() => {
                          setValue('quarto_id', suite.quarto_id, {
                            shouldValidate: true,
                          })
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/10'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-sm text-foreground block">
                            Suíte {suite.identificacao}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Até {suite.limite_hospedes} hóspedes
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {errors.quarto_id && (
            <span className="mt-2 block text-xs text-destructive">
              {errors.quarto_id.message}
            </span>
          )}
        </section>

        {/* RESUMO PROVISÓRIO SE SELECIONADO */}
        {quartoSelecionado && regimeSelecionado && nights.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-foreground">
                  Proposta selecionada: Suíte {quartoSelecionado.identificacao}{' '}
                  ({quartoSelecionado.categoria_nome}) •{' '}
                  {regimeSelecionado.titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nights.length} {nights.length === 1 ? 'noite' : 'noites'} (
                  {formatarDataBR(checkIn)} a {formatarDataBR(checkOut)}) •{' '}
                  {totalPessoas} hóspede(s)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block uppercase font-medium">
                Total Estimado
              </span>
              <span className="text-xl font-extrabold text-primary">
                {formatarMoeda(quartoSelecionado.valor_total)}
              </span>
            </div>
          </div>
        )}

        {/* PASSO 5: DADOS DO TITULAR (ESPELHO DE ORÇAMENTOS) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 5: Dados do Titular da Reserva
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="titular_nome">Nome Completo *</Label>
              <div className="relative mt-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="titular_nome"
                  className="pl-9 h-9"
                  placeholder="Nome completo do responsável"
                  {...register('titular_nome')}
                />
              </div>
              {errors.titular_nome && (
                <span className="text-xs text-destructive">
                  {errors.titular_nome.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="titular_telefone">Celular / WhatsApp *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="titular_telefone"
                  className="pl-9 h-9"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  {...register('titular_telefone', {
                    onChange: e => {
                      setValue(
                        'titular_telefone',
                        phoneMask.mask(e.target.value),
                        {
                          shouldValidate: true,
                        }
                      )
                    },
                  })}
                />
              </div>
              {errors.titular_telefone && (
                <span className="text-xs text-destructive">
                  {errors.titular_telefone.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="titular_email">E-mail</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="titular_email"
                  type="email"
                  className="pl-9 h-9"
                  placeholder="cliente@exemplo.com"
                  {...register('titular_email')}
                />
              </div>
              {errors.titular_email && (
                <span className="text-xs text-destructive">
                  {errors.titular_email.message}
                </span>
              )}
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="observacoes">
                Informações Adicionais / Observações Internas
              </Label>
              <Textarea
                id="observacoes"
                rows={3}
                placeholder="Ex.: Solicitação de berço, restrições alimentares, horário estimado de chegada..."
                className="w-full resize-none"
                {...register('observacoes')}
              />
            </div>
          </div>
        </section>
      </div>

      <ModalConflitoReserva
        open={conflitoModal.open}
        onOpenChange={open => setConflitoModal(prev => ({ ...prev, open }))}
        mensagem={conflitoModal.mensagem}
        alternativas={conflitoModal.alternativas}
        onSelectAlternativa={alt => {
          setValue('quarto_id', alt.quarto_id)
          setConflitoModal(prev => ({ ...prev, open: false }))
          toast.info(`Suíte ${alt.identificacao} selecionada como alternativa.`)
        }}
      />
    </CrudFormLayout>
  )
}

export default EditarReservaPage

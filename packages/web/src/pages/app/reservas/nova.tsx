import { zodResolver } from '@hookform/resolvers/zod'
import type {
  QuartoDisponivel,
  ReservaConflitoErro,
} from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  BedDouble,
  Calendar,
  CheckCircle2,
  Handshake,
  Info,
  User,
  Utensils,
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { reservasService } from '@/api/reservas.service'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date_picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { unmask_phone, usePhoneMask } from '@/hooks/use_phone_mask'
import {
  type NovaReservaFormData,
  novaReservaFormSchema,
} from '@/schemas/reservas/reserva.schema'

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

export function NovaReservaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [conflitoModal, setConflitoModal] = useState<{
    open: boolean
    mensagem: string
    alternativas: QuartoDisponivel[]
  }>({
    open: false,
    mensagem: '',
    alternativas: [],
  })

  const form = useForm<NovaReservaFormData>({
    resolver: zodResolver(novaReservaFormSchema),
    defaultValues: {
      check_in: '',
      check_out: '',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      regime_alimentacao_id: '',
      quarto_id: '',
      titular_nome: '',
      titular_telefone: '',
      titular_email: '',
      parceiro_comercial_id: '',
      observacoes: '',
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  const phoneMask = usePhoneMask(watch('titular_telefone') || '')

  const checkIn = watch('check_in')
  const checkOut = watch('check_out')
  const adultos = watch('quantidade_adultos') || 1
  const criancas = watch('quantidade_criancas') || 0
  const totalPessoas = adultos + criancas
  const regimeId = watch('regime_alimentacao_id')
  const quartoIdSelecionado = watch('quarto_id')

  // Regimes ativos
  const { data: regimesData } = useQuery({
    queryKey: ['regimes_alimentacao_ativos'],
    queryFn: () => regimesAlimentacaoService.list({ ativo: true }),
  })
  const regimes = regimesData?.data || []

  // Parceiros ativos
  const { data: parceirosData } = useQuery({
    queryKey: ['parceiros_comerciais_ativos'],
    queryFn: () => parceirosComerciaisService.list({ status: 'ativo' }),
  })
  const parceiros = parceirosData?.data || []

  // Consulta de disponibilidade
  const podeConsultar = Boolean(
    checkIn && checkOut && checkIn < checkOut && regimeId && totalPessoas >= 1
  )

  const { data: disponiveis = [], isFetching: carregandoDisponibilidade } =
    useQuery({
      queryKey: [
        'reservas_disponibilidade',
        checkIn,
        checkOut,
        regimeId,
        totalPessoas,
      ],
      queryFn: () =>
        reservasService.disponibilidade({
          check_in: checkIn,
          check_out: checkOut,
          regime_alimentacao_id: regimeId,
          pessoas: totalPessoas,
        }),
      enabled: podeConsultar,
    })

  const quartoSelecionado = disponiveis.find(
    q => q.quarto_id === quartoIdSelecionado
  )

  const createMutation = useMutation({
    mutationFn: (data: NovaReservaFormData) =>
      reservasService.create({
        titular_nome: data.titular_nome,
        titular_telefone: data.titular_telefone
          ? unmask_phone(data.titular_telefone)
          : null,
        titular_email: data.titular_email || null,
        quarto_id: data.quarto_id,
        regime_alimentacao_id: data.regime_alimentacao_id,
        parceiro_comercial_id: data.parceiro_comercial_id || null,
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        observacoes: data.observacoes || null,
      }),
    onSuccess: reserva => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success(`Reserva ${reserva.codigo} cadastrada com sucesso!`)
      navigate(`/reservas/${reserva.id}`)
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
      const msg = err.response?.data?.message || 'Erro ao cadastrar reserva.'
      toast.error(msg)
    },
  })

  const onSubmit = (data: NovaReservaFormData) => {
    createMutation.mutate(data)
  }

  return (
    <CrudFormLayout
      title="Nova Reserva"
      breadcrumbLinks={[
        { label: 'Reservas', href: '/reservas' },
        { label: 'Nova Reserva' },
      ]}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={createMutation.isPending}
      saveButtonText="Cadastrar Reserva"
    >
      <div className="space-y-6">
        {/* Passo 1: Período e Ocupantes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">
                1. Período de Hospedagem e Ocupantes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in">
                  Check-in <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="check_in"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={val => {
                        field.onChange(val)
                        setValue('quarto_id', '')
                      }}
                      placeholder="Data de chegada"
                    />
                  )}
                />
                {errors.check_in && (
                  <p className="text-xs text-red-500">
                    {errors.check_in.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="check_out">
                  Check-out <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="check_out"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={val => {
                        field.onChange(val)
                        setValue('quarto_id', '')
                      }}
                      placeholder="Data de saída"
                    />
                  )}
                />
                {errors.check_out && (
                  <p className="text-xs text-red-500">
                    {errors.check_out.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_adultos">
                  Adultos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantidade_adultos"
                  type="number"
                  min={1}
                  {...register('quantidade_adultos', { valueAsNumber: true })}
                />
                {errors.quantidade_adultos && (
                  <p className="text-xs text-red-500">
                    {errors.quantidade_adultos.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_criancas">Crianças</Label>
                <Input
                  id="quantidade_criancas"
                  type="number"
                  min={0}
                  {...register('quantidade_criancas', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passo 2: Regime de Alimentação */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="size-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">
                2. Regime de Alimentação
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regimes.map(regime => {
                const isSelected = regimeId === regime.id
                return (
                  <button
                    type="button"
                    key={regime.id}
                    onClick={() => {
                      setValue('regime_alimentacao_id', regime.id)
                      setValue('quarto_id', '')
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: regime.cor_pulseira }}
                      />
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {regime.titulo}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="size-4 text-indigo-600" />
                    )}
                  </button>
                )
              })}
            </div>
            {errors.regime_alimentacao_id && (
              <p className="text-xs text-red-500 mt-2">
                {errors.regime_alimentacao_id.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Passo 3: Suíte Disponível */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="size-5 text-indigo-600" />
                <CardTitle className="text-base font-semibold">
                  3. Seleção da Suíte (Disponíveis com Tarifa Vigente)
                </CardTitle>
              </div>
              {carregandoDisponibilidade && (
                <span className="text-xs text-zinc-500 animate-pulse">
                  Verificando disponibilidade e tarifas...
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!podeConsultar ? (
              <div className="flex items-center gap-2 p-4 text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <Info className="size-4 text-zinc-400" />
                Defina o período, quantidade de hóspedes e o regime de
                alimentação para carregar as suítes disponíveis.
              </div>
            ) : disponiveis.length === 0 ? (
              <div className="p-4 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                Nenhuma suíte disponível com capacidade para {totalPessoas}{' '}
                pessoa(s) e tarifa vigente no regime selecionado para o período
                informado.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {disponiveis.map(quarto => {
                  const isSelected = quartoIdSelecionado === quarto.quarto_id
                  return (
                    <button
                      type="button"
                      key={quarto.quarto_id}
                      onClick={() => setValue('quarto_id', quarto.quarto_id)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                          Suíte {quarto.identificacao}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Até {quarto.limite_hospedes} pessoas
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {quarto.categoria_nome}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs text-zinc-500">
                          Total da hospedagem:
                        </span>
                        <span className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
                          {formatarMoeda(quarto.valor_total)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {errors.quarto_id && (
              <p className="text-xs text-red-500 mt-2">
                {errors.quarto_id.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resumo do Valor Total em Destaque */}
        {quartoSelecionado && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium uppercase tracking-wider">
                Valor Total Calculado (Congelado na Criação)
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                Suíte {quartoSelecionado.identificacao} • {totalPessoas}{' '}
                hóspede(s)
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatarMoeda(quartoSelecionado.valor_total)}
            </span>
          </div>
        )}

        {/* Passo 4: Titular e Parceiro Comercial */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">
                4. Dados do Titular e Parceiro Comercial
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titular_nome">
                  Nome do Titular da Reserva{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titular_nome"
                  placeholder="Nome completo do responsável"
                  {...register('titular_nome')}
                />
                {errors.titular_nome && (
                  <p className="text-xs text-red-500">
                    {errors.titular_nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titular_telefone">
                  Telefone / WhatsApp (Opcional)
                </Label>
                <Input
                  id="titular_telefone"
                  placeholder="(00) 00000-0000"
                  value={phoneMask.displayValue}
                  onChange={e => {
                    phoneMask.handleChange(e)
                    setValue('titular_telefone', e.target.value)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titular_email">E-mail (Opcional)</Label>
                <Input
                  id="titular_email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  {...register('titular_email')}
                />
                {errors.titular_email && (
                  <p className="text-xs text-red-500">
                    {errors.titular_email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Handshake className="size-4 text-zinc-500" />
                  <Label htmlFor="parceiro_comercial_id">
                    Parceiro Comercial (Opcional)
                  </Label>
                </div>
                <select
                  id="parceiro_comercial_id"
                  {...register('parceiro_comercial_id')}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                >
                  <option value="">Reserva Direta (Sem Parceiro)</option>
                  {parceiros.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.razao_social}{' '}
                      {p.nome_fantasia ? `(${p.nome_fantasia})` : ''} -{' '}
                      {p.tipo_parceiro}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500">
                  Agências de viagem, operadoras, clubes de turismo e
                  faturamento corporativo.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Internas</Label>
                <Textarea
                  id="observacoes"
                  rows={2}
                  placeholder="Informações adicionais para a recepção..."
                  {...register('observacoes')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Conflito com Alternativas */}
      <AlertDialog
        open={conflitoModal.open}
        onOpenChange={open => setConflitoModal(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Suíte com Conflito no Período</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm pt-2">
              {conflitoModal.mensagem}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {conflitoModal.alternativas.length > 0 && (
            <div className="space-y-2 my-2">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Suítes alternativas disponíveis para o período e regime:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {conflitoModal.alternativas.map(alt => (
                  <button
                    type="button"
                    key={alt.quarto_id}
                    onClick={() => {
                      setValue('quarto_id', alt.quarto_id)
                      setConflitoModal(prev => ({ ...prev, open: false }))
                      toast.info(
                        `Suíte ${alt.identificacao} selecionada como alternativa.`
                      )
                    }}
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
    </CrudFormLayout>
  )
}

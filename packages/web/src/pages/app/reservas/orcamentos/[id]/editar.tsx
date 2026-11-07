import { zodResolver } from '@hookform/resolvers/zod'
import type { Tarifario } from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  DollarSign,
  Handshake,
  Info,
  Loader2,
  Mail,
  PawPrint,
  Phone,
  Tag,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { orcamentosService } from '@/api/orcamentos.service'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { tarifariosService } from '@/api/tarifarios.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { OrcamentoAcoesCompartilhamento } from '@/components/orcamentos/orcamento_acoes_compartilhamento'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date_picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePageTitle } from '@/hooks/use_document_title'
import { mask_phone, unmask_phone, usePhoneMask } from '@/hooks/use_phone_mask'

const editOrcamentoSchema = z.object({
  check_in: z.string().min(10, 'A data de check-in é obrigatória.'),
  check_out: z.string().min(10, 'A data de check-out é obrigatória.'),
  quantidade_adultos: z.coerce.number().int().min(1, 'Mínimo de 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  quantidade_pets: z.coerce.number().int().min(0).default(0),
  parceiro_id: z.string().nullable().optional(),
  cupom_desconto: z.string().trim().max(50).optional(),
  regime_alimentacao_id: z
    .string()
    .min(1, 'Selecione o regime de alimentação.'),
  categoria_quarto_id: z
    .string()
    .min(1, 'Selecione a categoria de acomodação.'),
  status: z.enum(['pendente', 'aprovado', 'cancelado', 'expirado']),
  lead_nome: z.string().trim().min(1, 'O nome do lead é obrigatório.'),
  lead_telefone: z.string().trim().min(8, 'Telefone/WhatsApp inválido.'),
  lead_email: z.string().trim().email('E-mail inválido.'),
  observacoes: z.string().optional(),
})

type EditOrcamentoFormData = z.infer<typeof editOrcamentoSchema>

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

function calculateCategoryTariff(
  categoriaId: string,
  regimeId: string,
  nights: string[],
  tarifarios: Tarifario[]
): {
  coberto: boolean
  valorTotal: number
  menorDiaria: number
  motivoIncoberto?: string
} {
  if (nights.length === 0 || !regimeId || !categoriaId) {
    return { coberto: false, valorTotal: 0, menorDiaria: 0 }
  }

  let total = 0
  let menorDiaria = Infinity
  let minStayRequired = 0

  for (const night of nights) {
    const matchingTarifarios = tarifarios.filter(t => {
      if (!t.ativo) return false
      const matchesCategory =
        t.categoria_quarto_ids?.length > 0
          ? t.categoria_quarto_ids.includes(categoriaId)
          : t.categoria_quarto_id === categoriaId
      if (!matchesCategory) return false
      if (t.regime_alimentacao_id !== regimeId) return false
      return t.datas?.includes(night)
    })

    for (const t of matchingTarifarios) {
      const minNights = t.minimo_diarias ?? 1
      if (minNights > minStayRequired) {
        minStayRequired = minNights
      }
    }

    const elegiveis = matchingTarifarios.filter(
      t => nights.length >= (t.minimo_diarias ?? 1)
    )

    if (elegiveis.length === 0) {
      const motivo =
        matchingTarifarios.length > 0 && minStayRequired > nights.length
          ? `Mínimo ${minStayRequired} ${minStayRequired === 1 ? 'diária' : 'diárias'}`
          : undefined
      return {
        coberto: false,
        valorTotal: 0,
        menorDiaria: 0,
        motivoIncoberto: motivo,
      }
    }

    const menor = elegiveis.reduce((min, t) => {
      const val = Number(t.valor_diaria)
      return val < min ? val : min
    }, Number(elegiveis[0].valor_diaria))

    total += menor
    if (menor < menorDiaria) menorDiaria = menor
  }

  return {
    coberto: true,
    valorTotal: total,
    menorDiaria: menorDiaria === Infinity ? 0 : menorDiaria,
  }
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function EditarOrcamentoPage() {
  const { id } = useParams<{ id: string }>()
  const orcamentoId = id ?? ''
  const phone_mask = usePhoneMask()
  const queryClient = useQueryClient()

  const { data: orcamento, isLoading: isLoadingOrcamento } = useQuery({
    queryKey: ['orcamento', orcamentoId],
    queryFn: () => orcamentosService.get(orcamentoId),
    enabled: Boolean(orcamentoId),
  })

  usePageTitle(
    orcamento?.lead?.nome
      ? `Editar Orçamento - ${orcamento.lead.nome}`
      : 'Editar Orçamento'
  )

  const { data: regimes_res, isLoading: isLoadingRegimes } = useQuery({
    queryKey: ['regimes_alimentacao'],
    queryFn: () => regimesAlimentacaoService.list({ limite: 250 }),
  })
  const regimes = regimes_res?.data ?? []

  const { data: categorias_res, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias_quartos'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })
  const categorias = categorias_res?.data ?? []

  const { data: parceiros_res } = useQuery({
    queryKey: ['parceiros_comerciais'],
    queryFn: () => parceirosComerciaisService.list({ limite: 250 }),
  })
  const parceiros = parceiros_res?.data ?? []

  const { data: tarifarios_res } = useQuery({
    queryKey: ['tarifarios', 'todos_ativos'],
    queryFn: () => tarifariosService.list({ ativo: true, limite: 250 }),
  })
  const tarifarios = tarifarios_res?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditOrcamentoFormData>({
    resolver: zodResolver(editOrcamentoSchema as never),
    values: orcamento
      ? {
          check_in: orcamento.check_in,
          check_out: orcamento.check_out,
          quantidade_adultos: orcamento.quantidade_adultos,
          quantidade_criancas: orcamento.quantidade_criancas,
          quantidade_pets: orcamento.quantidade_pets,
          parceiro_id: orcamento.parceiro_id ?? '',
          regime_alimentacao_id: orcamento.regime_alimentacao_id,
          categoria_quarto_id: orcamento.categoria_quarto_id,
          cupom_desconto: orcamento.cupom_desconto || '',
          status: orcamento.status,
          lead_nome: orcamento.lead?.nome || '',
          lead_telefone: mask_phone(orcamento.lead?.telefone || ''),
          lead_email: orcamento.lead?.email || '',
          observacoes: orcamento.observacoes || '',
        }
      : undefined,
  })

  const watch_check_in = watch('check_in')
  const watch_check_out = watch('check_out')
  const watch_regime_id = watch('regime_alimentacao_id')
  const watch_categoria_id = watch('categoria_quarto_id')
  const watch_parceiro_id = watch('parceiro_id')

  const nights = useMemo(
    () => enumerateNights(watch_check_in, watch_check_out),
    [watch_check_in, watch_check_out]
  )

  const tarifariosFiltrados = useMemo(() => {
    const targetParceiro = watch_parceiro_id || null
    return tarifarios.filter(t => (t.parceiro_id ?? null) === targetParceiro)
  }, [tarifarios, watch_parceiro_id])

  const regimesWithStatus = useMemo(() => {
    return regimes.map(regime => {
      if (nights.length === 0) {
        return { ...regime, temCobertura: false, suitesDisponiveis: 0 }
      }
      const suites = categorias.filter(cat => {
        const calc = calculateCategoryTariff(
          cat.id,
          regime.id,
          nights,
          tarifariosFiltrados
        )
        return calc.coberto
      })
      return {
        ...regime,
        temCobertura: suites.length > 0,
        suitesDisponiveis: suites.length,
      }
    })
  }, [regimes, categorias, nights, tarifariosFiltrados])

  const suitesCalculadas = useMemo(() => {
    if (nights.length === 0 || !watch_regime_id) return []

    const list = categorias.map(cat => {
      const calc = calculateCategoryTariff(
        cat.id,
        watch_regime_id,
        nights,
        tarifariosFiltrados
      )
      return {
        ...cat,
        ...calc,
      }
    })

    if (watch_parceiro_id) {
      return list.filter(s => s.coberto)
    }

    return list
  }, [
    categorias,
    nights,
    watch_regime_id,
    tarifariosFiltrados,
    watch_parceiro_id,
  ])

  const selectedSuite = suitesCalculadas.find(
    s => s.id === watch_categoria_id && s.coberto
  )
  const selectedRegime = regimes.find(r => r.id === watch_regime_id)

  const mutation = useMutation({
    mutationFn: (data: EditOrcamentoFormData) =>
      orcamentosService.update(orcamentoId, {
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        quantidade_pets: data.quantidade_pets,
        parceiro_id: data.parceiro_id || null,
        cupom_desconto: data.cupom_desconto?.trim() || null,
        regime_alimentacao_id: data.regime_alimentacao_id,
        categoria_quarto_id: data.categoria_quarto_id,
        status: data.status,
        observacoes: data.observacoes,
        lead: {
          nome: data.lead_nome,
          telefone: unmask_phone(data.lead_telefone),
          email: data.lead_email,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['orcamento', orcamentoId] })
      toast.success('Orçamento atualizado com sucesso!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message || 'Erro ao atualizar o orçamento.'
      toast.error(msg)
    },
  })

  const onSubmit = handleSubmit(data => {
    mutation.mutate(data)
  })

  if (
    isLoadingOrcamento ||
    isLoadingRegimes ||
    isLoadingCategorias ||
    !orcamento
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <CrudFormLayout
      title={`Editar Orçamento - ${orcamento.lead?.nome ?? 'Cliente'}`}
      backTo="/reservas/orcamentos"
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending}
      submitLabel="Salvar"
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <OrcamentoAcoesCompartilhamento
            token_publico={orcamento.token_publico}
            lead_nome={orcamento.lead?.nome}
            lead_email={orcamento.lead?.email}
            lead_telefone={orcamento.lead?.telefone}
            valor_total={orcamento.valor_total}
            size="sm"
          />
          <SaveButton isPending={mutation.isPending} label="Salvar" />
        </div>
      }
    >
      <input type="hidden" {...register('regime_alimentacao_id')} />
      <input type="hidden" {...register('categoria_quarto_id')} />

      <div className="space-y-8">
        {/* SITUAÇÃO DO ORÇAMENTO E RESUMO */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 grid gap-4 sm:grid-cols-3 items-center">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Lead / Primeiro Contato
            </span>
            <p className="mt-1 font-bold text-foreground">
              {orcamento.lead?.nome}
            </p>
            <p className="text-xs text-muted-foreground">
              {mask_phone(orcamento.lead?.telefone ?? '')} •{' '}
              {orcamento.lead?.email}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Investimento Total
            </span>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {selectedSuite
                ? formatarMoeda(selectedSuite.valorTotal)
                : formatarMoeda(orcamento.valor_total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {nights.length} {nights.length === 1 ? 'diária' : 'diárias'}
            </p>
          </div>

          <div>
            <Label htmlFor="status">Situação do Orçamento *</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value || 'pendente'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* PASSO 1: PERÍODO E OCUPAÇÃO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
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
                      setValue('categoria_quarto_id', '')
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
                      setValue('categoria_quarto_id', '')
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
                  {...register('quantidade_adultos')}
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
                {...register('quantidade_criancas')}
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
                  {...register('quantidade_pets')}
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
                {formatarDataBR(watch_check_in)} até{' '}
                {formatarDataBR(watch_check_out)})
              </span>
            </div>
          )}
        </section>

        {/* PASSO 2: PARCEIRO COMERCIAL */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 2: Parceiro Comercial
            </h2>
          </div>
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="parceiro_id">
              Canal / Parceiro Comercial (Opcional)
            </Label>
            <Controller
              control={control}
              name="parceiro_id"
              render={({ field }) => (
                <Select
                  value={field.value || 'direta'}
                  onValueChange={val => {
                    field.onChange(val === 'direta' ? '' : val)
                    setValue('categoria_quarto_id', '')
                  }}
                >
                  <SelectTrigger
                    id="parceiro_id"
                    className="h-9"
                    aria-label="Parceiro Comercial"
                  >
                    <SelectValue placeholder="Selecione o canal ou parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direta">Reserva Direta</SelectItem>
                    {parceiros.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome_fantasia || p.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        {/* PASSO 3: REGIME DE ALIMENTAÇÃO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Utensils className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 3: Regime de Alimentação
            </h2>
          </div>
          {nights.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
              <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p>
                Preencha as datas de check-in e check-out no{' '}
                <strong>Passo 1</strong> para visualizar e selecionar os regimes
                de alimentação com tarifas ativas.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Selecione o plano de refeições desejado para carregar as
                acomodações com tarifários vigentes para este período:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {regimesWithStatus.map(regime => {
                  const isSelected = watch_regime_id === regime.id
                  return (
                    <button
                      key={regime.id}
                      type="button"
                      onClick={() => {
                        setValue('regime_alimentacao_id', regime.id, {
                          shouldValidate: true,
                        })
                        setValue('categoria_quarto_id', '', {
                          shouldValidate: true,
                        })
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
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
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
                        {regime.temCobertura ? (
                          <Badge
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-xs text-primary"
                          >
                            {regime.suitesDisponiveis}{' '}
                            {regime.suitesDisponiveis === 1
                              ? 'suíte disponível'
                              : 'suítes disponíveis'}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs text-muted-foreground"
                          >
                            Sem tarifas no período
                          </Badge>
                        )}

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
            </div>
          )}

          {errors.regime_alimentacao_id && (
            <span className="mt-2 block text-xs text-destructive">
              {errors.regime_alimentacao_id.message}
            </span>
          )}
        </section>

        {/* CUPOM DE DESCONTO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
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

        {/* PASSO 4: CARREGAMENTO DE SUÍTES DE ACORDO COM O TARIFÁRIO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <BedDouble className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 4: Acomodação (Suítes Disponíveis pelo Tarifário)
            </h2>
          </div>
          {nights.length === 0 || !watch_regime_id ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
              <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p>
                Preencha o período (<strong>Passo 1</strong>) e selecione o
                regime de alimentação (<strong>Passo 3</strong>) para carregar
                as suítes disponíveis com base nos tarifários cadastrados.
              </p>
            </div>
          ) : suitesCalculadas.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              Nenhuma categoria de quarto cadastrada no hotel.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Suítes carregadas de acordo com as tarifas vigentes para o
                regime <strong>{selectedRegime?.titulo}</strong>:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {suitesCalculadas.map(suite => {
                  const isSelected = watch_categoria_id === suite.id
                  const isClickable = suite.coberto

                  return (
                    <button
                      key={suite.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => {
                        if (isClickable) {
                          setValue('categoria_quarto_id', suite.id, {
                            shouldValidate: true,
                          })
                        }
                      }}
                      className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                        !isClickable
                          ? 'cursor-not-allowed border-border/50 bg-muted/40 opacity-60'
                          : isSelected
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5 cursor-pointer'
                            : 'border-border hover:border-primary/50 bg-card cursor-pointer'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {suite.nome}
                        </span>
                        {suite.coberto ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-50 text-xs text-emerald-700"
                          >
                            Tarifário Ativo
                          </Badge>
                        ) : suite.motivoIncoberto ? (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-50 text-xs text-amber-700"
                          >
                            {suite.motivoIncoberto}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs text-muted-foreground"
                          >
                            Sem Tarifa
                          </Badge>
                        )}
                      </div>

                      {suite.coberto ? (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-baseline gap-1 text-primary">
                            <span className="text-lg font-bold">
                              {formatarMoeda(suite.valorTotal)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / total ({nights.length}{' '}
                              {nights.length === 1 ? 'diária' : 'diárias'})
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Média de{' '}
                            {formatarMoeda(suite.valorTotal / nights.length)} /
                            noite
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {suite.motivoIncoberto
                            ? 'Estadia mínima exigida não atingida para o período selecionado.'
                            : 'Sem cobertura de tarifário para as datas selecionadas neste regime.'}
                        </p>
                      )}

                      {isSelected && isClickable && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Acomodação selecionada
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {errors.categoria_quarto_id && (
            <span className="mt-2 block text-xs text-destructive">
              {errors.categoria_quarto_id.message}
            </span>
          )}
        </section>

        {/* RESUMO PROVISÓRIO SE SELECIONADO */}
        {selectedSuite && selectedRegime && nights.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-foreground">
                  Proposta selecionada: {selectedSuite.nome} •{' '}
                  {selectedRegime.titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nights.length} {nights.length === 1 ? 'noite' : 'noites'} (
                  {formatarDataBR(watch_check_in)} a{' '}
                  {formatarDataBR(watch_check_out)})
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block uppercase font-medium">
                Total Estimado
              </span>
              <span className="text-xl font-extrabold text-primary">
                {formatarMoeda(selectedSuite.valorTotal)}
              </span>
            </div>
          </div>
        )}

        {/* PASSO 5: PRIMEIRO CONTATO (LEAD) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 5: Dados do Primeiro Contato (Lead)
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="lead_nome">Nome Completo *</Label>
              <div className="relative mt-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_nome"
                  className="pl-9"
                  placeholder="Nome do contato"
                  {...register('lead_nome')}
                />
              </div>
              {errors.lead_nome && (
                <span className="text-xs text-destructive">
                  {errors.lead_nome.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="lead_telefone">Celular / WhatsApp *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_telefone"
                  inputMode="tel"
                  className="pl-9"
                  placeholder="(00) 00000-0000"
                  {...register('lead_telefone', {
                    onChange: e => {
                      setValue(
                        'lead_telefone',
                        phone_mask.mask(e.target.value),
                        {
                          shouldValidate: true,
                        }
                      )
                    },
                  })}
                />
              </div>
              {errors.lead_telefone && (
                <span className="text-xs text-destructive">
                  {errors.lead_telefone.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="lead_email">E-mail *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_email"
                  type="email"
                  className="pl-9"
                  placeholder="contato@exemplo.com"
                  {...register('lead_email')}
                />
              </div>
              {errors.lead_email && (
                <span className="text-xs text-destructive">
                  {errors.lead_email.message}
                </span>
              )}
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="observacoes">Observações da Proposta</Label>
              <Textarea
                id="observacoes"
                className="mt-1"
                placeholder="Ex.: Solicita cama extra, comemoração de aniversário, etc."
                {...register('observacoes')}
              />
            </div>
          </div>
        </section>

        {/* DETALHAMENTO DAS DIÁRIAS ATUAIS */}
        {orcamento.detalhamento_noites &&
          orcamento.detalhamento_noites.length > 0 && (
            <section className="space-y-4">
              <div className="pb-2 border-b">
                <h2 className="text-base font-semibold">
                  Detalhamento das Diárias
                </h2>
              </div>
              <div className="space-y-2">
                {orcamento.detalhamento_noites.map(noite => (
                  <div
                    key={noite.data}
                    className="flex items-center justify-between rounded-md border p-2 text-xs"
                  >
                    <span className="font-medium">
                      {formatarDataBR(noite.data)} - {noite.tarifario_nome}
                    </span>
                    <span className="font-bold text-foreground tabular-nums">
                      {formatarMoeda(noite.valor_diaria)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </CrudFormLayout>
  )
}

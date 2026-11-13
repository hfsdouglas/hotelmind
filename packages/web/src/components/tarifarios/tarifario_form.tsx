import type {
  CategoriaQuartoResumo,
  PeriodoTarifarioCalendario,
  RegimeAlimentacao,
} from '@hotelmind/contracts'
import { Button } from '@hotelmind/ui'
import {
  BedDouble,
  CalendarCheck2,
  DollarSign,
  Handshake,
  Save,
  Tag,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { CrudFormLayout } from '@/components/forms/crud_form_layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrencyMask } from '@/hooks/use_currency_mask'
import {
  find_conflicting_periods,
  normalize_currency_string,
  type TarifarioFormValues,
  tarifario_form_schema,
  toggle_date_selection,
} from '@/schemas/tarifarios/tarifario_schema'
import { TarifarioCalendar } from './tarifario_calendar'
import { TarifarioCategoryCards } from './tarifario_category_cards'
import { TarifarioPeriodSummary } from './tarifario_period_summary'

export interface TarifarioSubmitPayload {
  categoria_quarto_id?: string
  categoria_quarto_ids: string[]
  regime_alimentacao_id: string
  parceiro_id?: string | null
  nome: string
  datas: string[]
  valor_diaria: string
  minimo_diarias: number
  ativo: boolean
}

export interface TarifarioFormProps {
  mode: 'create' | 'edit'
  title: string
  backTo?: string
  submitLabel?: string
  initialValues?: Partial<TarifarioFormValues> & {
    categoria_quarto_ids?: string[]
    minimo_diarias?: number
  }
  categories: CategoriaQuartoResumo[]
  regimes?: RegimeAlimentacao[]
  parceiros?: Array<{
    id: string
    razao_social: string
    nome_fantasia?: string | null
  }>
  occupiedPeriods: PeriodoTarifarioCalendario[]
  isLoadingPeriods?: boolean
  excludeTarifarioId?: string
  isSubmitting?: boolean
  initialCalendarMonth?: { year: number; month: number }
  onCategoryChange?: (categoria_quarto_id: string) => void
  onCategoriesChange?: (categoria_quarto_ids: string[]) => void
  onCancel: () => void
  onSubmitPayload: (payload: TarifarioSubmitPayload) => void
}

export function TarifarioForm({
  title,
  backTo = '/tarifarios',
  submitLabel = 'Salvar',
  initialValues,
  categories,
  regimes = [],
  parceiros = [],
  occupiedPeriods,
  isLoadingPeriods = false,
  excludeTarifarioId,
  isSubmitting = false,
  initialCalendarMonth,
  onCategoryChange,
  onCategoriesChange,
  onCancel,
  onSubmitPayload,
}: TarifarioFormProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? '')
  const [categoria_quarto_ids, setCategoriaQuartoIds] = useState<string[]>(
    () => {
      if (initialValues?.categoria_quarto_ids?.length) {
        return initialValues.categoria_quarto_ids
      }
      if (initialValues?.categoria_quarto_id) {
        return [initialValues.categoria_quarto_id]
      }
      return []
    }
  )
  const [regime_alimentacao_id, setRegimeAlimentacaoId] = useState<string>(
    initialValues?.regime_alimentacao_id ?? ''
  )
  const [parceiro_id, setParceiroId] = useState<string>(
    initialValues?.parceiro_id ?? ''
  )
  const [datas, setDatas] = useState<string[]>(initialValues?.datas ?? [])
  const [valor_diaria, setValorDiaria] = useState(
    initialValues?.valor_diaria ?? '0.00'
  )
  const [minimo_diarias, setMinimoDiarias] = useState<number>(
    initialValues?.minimo_diarias ?? 1
  )
  const [ativo, setAtivo] = useState<boolean>(initialValues?.ativo ?? true)
  const [errors, setErrors] = useState<string[]>([])

  const currencyMask = useCurrencyMask({
    initialValue: initialValues?.valor_diaria ?? '0.00',
    onChange: val => {
      setValorDiaria(val)
      if (errors.length > 0) setErrors([])
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only re-initialize form state when scalar values or serialized collections change
  useEffect(() => {
    if (!initialValues) return
    if (initialValues.nome !== undefined) setNome(initialValues.nome)
    if (initialValues.categoria_quarto_ids !== undefined) {
      setCategoriaQuartoIds(initialValues.categoria_quarto_ids)
    } else if (initialValues.categoria_quarto_id !== undefined) {
      setCategoriaQuartoIds([initialValues.categoria_quarto_id])
    }
    if (initialValues.regime_alimentacao_id !== undefined) {
      setRegimeAlimentacaoId(initialValues.regime_alimentacao_id ?? '')
    }
    if (initialValues.parceiro_id !== undefined) {
      setParceiroId(initialValues.parceiro_id ?? '')
    }
    if (initialValues.datas !== undefined) {
      setDatas(initialValues.datas)
    }
    if (initialValues.valor_diaria !== undefined) {
      setValorDiaria(initialValues.valor_diaria)
      currencyMask.setValue(initialValues.valor_diaria)
    }
    if (initialValues.minimo_diarias !== undefined) {
      setMinimoDiarias(initialValues.minimo_diarias)
    }
    if (initialValues.ativo !== undefined) {
      setAtivo(initialValues.ativo)
    }
  }, [
    initialValues?.nome,
    initialValues?.categoria_quarto_id,
    initialValues?.categoria_quarto_ids?.join(','),
    initialValues?.regime_alimentacao_id,
    initialValues?.parceiro_id,
    initialValues?.valor_diaria,
    initialValues?.minimo_diarias,
    initialValues?.ativo,
    initialValues?.datas?.join(','),
    currencyMask.setValue,
  ])

  const conflicting_periods =
    ativo && datas.length > 0
      ? find_conflicting_periods(
          datas,
          occupiedPeriods,
          excludeTarifarioId,
          parceiro_id,
          categoria_quarto_ids
        )
      : []

  function handle_categories_change(next_ids: string[]) {
    setCategoriaQuartoIds(next_ids)
    onCategoriesChange?.(next_ids)
    onCategoryChange?.(next_ids[0] ?? '')
    if (errors.length > 0) setErrors([])
  }

  function handle_toggle_date(iso_date: string) {
    setDatas(prev => toggle_date_selection(prev, iso_date))
    if (errors.length > 0) setErrors([])
  }

  function handle_replace_dates(next_dates: string[]) {
    setDatas(next_dates)
    if (errors.length > 0) setErrors([])
  }

  function handle_clear_dates() {
    setDatas([])
    if (errors.length > 0) setErrors([])
  }

  function handle_submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation_errors: string[] = []

    const parsed = tarifario_form_schema.safeParse({
      nome,
      categoria_quarto_ids,
      categoria_quarto_id: categoria_quarto_ids[0],
      regime_alimentacao_id,
      parceiro_id: parceiro_id || null,
      datas,
      valor_diaria,
      minimo_diarias,
      ativo,
    })

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (!validation_errors.includes(issue.message)) {
          validation_errors.push(issue.message)
        }
      }
    }

    if (ativo && conflicting_periods.length > 0) {
      validation_errors.push(
        'Uma ou mais datas selecionadas possuem conflito com outro tarifário ativo para as categorias selecionadas.'
      )
    }

    setErrors(validation_errors)
    if (validation_errors.length > 0 || !parsed.data) return

    onSubmitPayload({
      categoria_quarto_id: parsed.data.categoria_quarto_ids[0],
      categoria_quarto_ids: parsed.data.categoria_quarto_ids,
      regime_alimentacao_id: parsed.data.regime_alimentacao_id,
      parceiro_id: parsed.data.parceiro_id || null,
      nome: parsed.data.nome,
      datas: parsed.data.datas,
      valor_diaria: normalize_currency_string(parsed.data.valor_diaria),
      minimo_diarias: parsed.data.minimo_diarias,
      ativo: parsed.data.ativo,
    })
  }

  return (
    <CrudFormLayout
      title={title}
      backTo={backTo}
      cardTitle="Dados do tarifário e seleção de datas"
      className="md:max-w-[840px] lg:max-w-[1120px] xl:max-w-[1340px] 2xl:max-w-[1540px]"
      onSubmit={handle_submit}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {errors.length > 0 && (
          <div
            role="alert"
            data-testid="tarifario-form-errors"
            className="flex flex-col gap-1 rounded-md border border-destructive bg-destructive/10 p-3"
          >
            {errors.map(err => (
              <p key={err} className="text-sm text-destructive">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* PASSO 1: DADOS DO TARIFÁRIO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 1: Dados do Tarifário
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Ex.: Baixa temporada"
                value={nome}
                onChange={e => {
                  setNome(e.target.value)
                  if (errors.length > 0) setErrors([])
                }}
                maxLength={100}
              />
            </div>

            <div className="relative flex flex-col gap-1.5">
              <Label htmlFor="regime_alimentacao_id">
                Regime de Alimentação *
              </Label>
              <Select
                value={regime_alimentacao_id || undefined}
                onValueChange={val => {
                  setRegimeAlimentacaoId(val)
                  if (errors.length > 0) setErrors([])
                }}
              >
                <SelectTrigger
                  id="regime_alimentacao_id"
                  aria-label="Regime de Alimentação"
                >
                  <SelectValue placeholder="Selecione um regime" />
                </SelectTrigger>
                <SelectContent>
                  {regimes.map(regime => (
                    <SelectItem key={regime.id} value={regime.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: regime.cor_pulseira }}
                          aria-hidden="true"
                        />
                        <span>{regime.titulo}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* PASSO 2: CATEGORIAS DE QUARTO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <BedDouble className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 2: Categorias de Quarto
            </h2>
          </div>
          <TarifarioCategoryCards
            categorias={categories}
            selectedIds={categoria_quarto_ids}
            onChange={handle_categories_change}
          />
        </section>

        {/* PASSO 3: PARCEIRO COMERCIAL */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 3: Parceiro Comercial
            </h2>
          </div>
          <div className="max-w-md flex flex-col gap-1.5">
            <Label htmlFor="parceiro_id">
              Canal / Parceiro Comercial (Opcional)
            </Label>
            <Select
              value={parceiro_id || '__publico__'}
              onValueChange={val => {
                setParceiroId(val === '__publico__' ? '' : val)
                if (errors.length > 0) setErrors([])
              }}
            >
              <SelectTrigger id="parceiro_id" aria-label="Parceiro Comercial">
                <SelectValue placeholder="Reserva Direta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__publico__">Reserva Direta</SelectItem>
                {parceiros.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* PASSO 4: CALENDÁRIO DE DATAS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Passo 4: Calendário de Datas
              </h2>
            </div>
            {isLoadingPeriods && (
              <span className="text-xs text-muted-foreground">
                Carregando datas ocupadas...
              </span>
            )}
          </div>

          <TarifarioPeriodSummary
            selectedDates={datas}
            valorDiaria={valor_diaria}
            conflictingPeriods={conflicting_periods}
          />

          <TarifarioCalendar
            selectedDates={datas}
            occupiedPeriods={occupiedPeriods}
            excludeTarifarioId={excludeTarifarioId}
            initialMonth={initialCalendarMonth}
            onToggleDate={handle_toggle_date}
            onReplaceSelection={handle_replace_dates}
            onClearSelection={handle_clear_dates}
          />
        </section>

        {/* PASSO 5: VALOR DA DIÁRIA, ESTADIA MÍNIMA E SITUAÇÃO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Passo 5: Valor da Diária, Estadia Mínima e Situação
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor_diaria">Valor da diária (R$) *</Label>
              <Input
                id="valor_diaria"
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={currencyMask.formatted}
                onChange={e => currencyMask.handleInputChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minimo_diarias">
                Quantidade mínima de diárias *
              </Label>
              <Input
                id="minimo_diarias"
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={minimo_diarias}
                onChange={e => {
                  const val = parseInt(e.target.value, 10)
                  setMinimoDiarias(Number.isNaN(val) ? 1 : val)
                  if (errors.length > 0) setErrors([])
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label id="status-label">Status</Label>
              <div
                role="radiogroup"
                aria-labelledby="status-label"
                className="flex h-9 items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <input
                    id="status_ativado"
                    type="radio"
                    name="status"
                    value="ativado"
                    checked={ativo}
                    onChange={() => setAtivo(true)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  <Label htmlFor="status_ativado" className="cursor-pointer">
                    Ativado
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="status_desativado"
                    type="radio"
                    name="status"
                    value="desativado"
                    checked={!ativo}
                    onChange={() => setAtivo(false)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  <Label htmlFor="status_desativado" className="cursor-pointer">
                    Desativado
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CrudFormLayout>
  )
}

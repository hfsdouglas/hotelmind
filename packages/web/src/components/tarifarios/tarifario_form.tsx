import type {
  CategoriaQuartoResumo,
  PeriodoTarifarioCalendario,
} from '@hotelmind/contracts'
import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type TarifarioFormValues,
  find_conflicting_periods,
  normalize_currency_string,
  tarifario_form_schema,
  to_exclusive_end_date,
} from '@/schemas/tarifario.schema'
import { TarifarioCalendar } from './tarifario_calendar'
import { TarifarioPeriodSummary } from './tarifario_period_summary'

export interface TarifarioSubmitPayload {
  categoria_quarto_id: string
  nome: string
  data_inicio: string
  data_fim: string
  valor_diaria: string
  ativo: boolean
}

export interface TarifarioFormProps {
  mode: 'create' | 'edit'
  title: string
  backTo?: string
  submitLabel: string
  initialValues?: Partial<TarifarioFormValues>
  categories: CategoriaQuartoResumo[]
  occupiedPeriods: PeriodoTarifarioCalendario[]
  isLoadingPeriods?: boolean
  excludeTarifarioId?: string
  isSubmitting?: boolean
  initialCalendarMonth?: { year: number; month: number }
  onCategoryChange?: (categoria_quarto_id: string) => void
  onCancel: () => void
  onDeactivateClick?: () => void
  onSubmitPayload: (payload: TarifarioSubmitPayload) => void
}

export function TarifarioForm({
  mode,
  title,
  backTo = '/tarifarios',
  submitLabel,
  initialValues,
  categories,
  occupiedPeriods,
  isLoadingPeriods = false,
  excludeTarifarioId,
  isSubmitting = false,
  initialCalendarMonth,
  onCategoryChange,
  onCancel,
  onDeactivateClick,
  onSubmitPayload,
}: TarifarioFormProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? '')
  const [categoria_quarto_id, setCategoriaQuartoId] = useState(
    initialValues?.categoria_quarto_id ?? '',
  )
  const [data_inicio, setDataInicio] = useState(
    initialValues?.data_inicio ?? '',
  )
  const [data_fim_efetiva, setDataFimEfetiva] = useState(
    initialValues?.data_fim_efetiva ?? '',
  )
  const [valor_diaria, setValorDiaria] = useState(
    initialValues?.valor_diaria ?? '',
  )
  const [ativo, setAtivo] = useState<boolean>(initialValues?.ativo ?? true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!initialValues) return
    if (initialValues.nome !== undefined) setNome(initialValues.nome)
    if (initialValues.categoria_quarto_id !== undefined) {
      setCategoriaQuartoId(initialValues.categoria_quarto_id)
    }
    if (initialValues.data_inicio !== undefined) {
      setDataInicio(initialValues.data_inicio)
    }
    if (initialValues.data_fim_efetiva !== undefined) {
      setDataFimEfetiva(initialValues.data_fim_efetiva)
    }
    if (initialValues.valor_diaria !== undefined) {
      setValorDiaria(initialValues.valor_diaria)
    }
    if (initialValues.ativo !== undefined) {
      setAtivo(initialValues.ativo)
    }
  }, [initialValues])

  const conflicting_periods =
    ativo && data_inicio && data_fim_efetiva
      ? find_conflicting_periods(
          data_inicio,
          data_fim_efetiva,
          occupiedPeriods,
          excludeTarifarioId,
        )
      : []

  function handle_category_change(next_category_id: string) {
    setCategoriaQuartoId(next_category_id)
    onCategoryChange?.(next_category_id)
  }

  function handle_calendar_range(start_iso: string, end_iso: string) {
    setDataInicio(start_iso)
    setDataFimEfetiva(end_iso)
    if (errors.length > 0) setErrors([])
  }

  function handle_submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation_errors: string[] = []

    const parsed = tarifario_form_schema.safeParse({
      nome,
      categoria_quarto_id,
      data_inicio,
      data_fim_efetiva,
      valor_diaria,
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
        'O período selecionado possui conflito com outro tarifário ativo para esta categoria.',
      )
    }

    setErrors(validation_errors)
    if (validation_errors.length > 0 || !parsed.data) return

    onSubmitPayload({
      categoria_quarto_id: parsed.data.categoria_quarto_id,
      nome: parsed.data.nome,
      data_inicio: parsed.data.data_inicio,
      data_fim: to_exclusive_end_date(parsed.data.data_fim_efetiva),
      valor_diaria: normalize_currency_string(parsed.data.valor_diaria),
      ativo: parsed.data.ativo,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex w-full items-center gap-2 text-xs text-muted-foreground sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]"
      >
        <Link to="/tarifarios" className="hover:underline">
          Tarifários
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      <CrudFormLayout
        title={title}
        backTo={backTo}
        cardTitle="Dados do tarifário e período de vigência"
        onSubmit={handle_submit}
        actions={
          <>
            {mode === 'edit' && onDeactivateClick && ativo && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDeactivateClick}
                disabled={isSubmitting}
              >
                Desativar tarifário
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Ex.: Baixa temporada"
                value={nome}
                onChange={e => setNome(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria_quarto_id">Categoria de quarto *</Label>
              <Select
                value={categoria_quarto_id || undefined}
                onValueChange={handle_category_change}
              >
                <SelectTrigger
                  id="categoria_quarto_id"
                  aria-label="Categoria de quarto"
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data_inicio">Data de início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={data_inicio}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data_fim_efetiva">Data de término *</Label>
              <Input
                id="data_fim_efetiva"
                type="date"
                value={data_fim_efetiva}
                onChange={e => setDataFimEfetiva(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor_diaria">Valor da diária (R$) *</Label>
              <Input
                id="valor_diaria"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={valor_diaria}
                onChange={e => setValorDiaria(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="ativo"
                checked={ativo}
                onCheckedChange={checked => setAtivo(Boolean(checked))}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Tarifário ativo
              </Label>
            </div>
          </div>

          <TarifarioPeriodSummary
            startDate={data_inicio}
            endDate={data_fim_efetiva}
            valorDiaria={valor_diaria}
            conflictingPeriods={conflicting_periods}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Calendário de períodos
              </Label>
              {isLoadingPeriods && (
                <span className="text-xs text-muted-foreground">
                  Carregando períodos existentes...
                </span>
              )}
            </div>

            <TarifarioCalendar
              startDate={data_inicio}
              endDate={data_fim_efetiva}
              occupiedPeriods={occupiedPeriods}
              excludeTarifarioId={excludeTarifarioId}
              initialMonth={initialCalendarMonth}
              onSelectRange={handle_calendar_range}
            />
          </div>
        </div>
      </CrudFormLayout>
    </div>
  )
}

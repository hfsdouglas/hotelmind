import type {
  CategoriaQuartoResumo,
  PeriodoTarifarioCalendario,
  RegimeAlimentacao,
} from '@hotelmind/contracts'
import { Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { Button } from '@/components/ui/button'
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
  find_conflicting_periods,
  normalize_currency_string,
  type TarifarioFormValues,
  tarifario_form_schema,
  toggle_date_selection,
} from '@/schemas/tarifario.schema'
import { TarifarioCalendar } from './tarifario_calendar'
import { TarifarioPeriodSummary } from './tarifario_period_summary'

export interface TarifarioSubmitPayload {
  categoria_quarto_id: string
  regime_alimentacao_id: string
  nome: string
  datas: string[]
  valor_diaria: string
  ativo: boolean
}

export interface TarifarioFormProps {
  mode: 'create' | 'edit'
  title: string
  backTo?: string
  submitLabel?: string
  initialValues?: Partial<TarifarioFormValues>
  categories: CategoriaQuartoResumo[]
  regimes?: RegimeAlimentacao[]
  occupiedPeriods: PeriodoTarifarioCalendario[]
  isLoadingPeriods?: boolean
  excludeTarifarioId?: string
  isSubmitting?: boolean
  initialCalendarMonth?: { year: number; month: number }
  onCategoryChange?: (categoria_quarto_id: string) => void
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
  occupiedPeriods,
  isLoadingPeriods = false,
  excludeTarifarioId,
  isSubmitting = false,
  initialCalendarMonth,
  onCategoryChange,
  onCancel,
  onSubmitPayload,
}: TarifarioFormProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? '')
  const [categoria_quarto_id, setCategoriaQuartoId] = useState(
    initialValues?.categoria_quarto_id ?? ''
  )
  const [regime_alimentacao_id, setRegimeAlimentacaoId] = useState<string>(
    initialValues?.regime_alimentacao_id ?? ''
  )
  const [datas, setDatas] = useState<string[]>(initialValues?.datas ?? [])
  const [valor_diaria, setValorDiaria] = useState(
    initialValues?.valor_diaria ?? ''
  )
  const [ativo, setAtivo] = useState<boolean>(initialValues?.ativo ?? true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!initialValues) return
    if (initialValues.nome !== undefined) setNome(initialValues.nome)
    if (initialValues.categoria_quarto_id !== undefined) {
      setCategoriaQuartoId(initialValues.categoria_quarto_id)
    }
    if (initialValues.regime_alimentacao_id !== undefined) {
      setRegimeAlimentacaoId(initialValues.regime_alimentacao_id ?? '')
    }
    if (initialValues.datas !== undefined) {
      setDatas(initialValues.datas)
    }
    if (initialValues.valor_diaria !== undefined) {
      setValorDiaria(initialValues.valor_diaria)
    }
    if (initialValues.ativo !== undefined) {
      setAtivo(initialValues.ativo)
    }
  }, [initialValues])

  const conflicting_periods =
    ativo && datas.length > 0
      ? find_conflicting_periods(datas, occupiedPeriods, excludeTarifarioId)
      : []

  function handle_category_change(next_category_id: string) {
    setCategoriaQuartoId(next_category_id)
    onCategoryChange?.(next_category_id)
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
      categoria_quarto_id,
      regime_alimentacao_id,
      datas,
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
        'Uma ou mais datas selecionadas possuem conflito com outro tarifário ativo para esta categoria.'
      )
    }

    setErrors(validation_errors)
    if (validation_errors.length > 0 || !parsed.data) return

    onSubmitPayload({
      categoria_quarto_id: parsed.data.categoria_quarto_id,
      regime_alimentacao_id: parsed.data.regime_alimentacao_id,
      nome: parsed.data.nome,
      datas: parsed.data.datas,
      valor_diaria: normalize_currency_string(parsed.data.valor_diaria),
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

          <div className="relative flex flex-col gap-1.5">
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

        <TarifarioPeriodSummary
          selectedDates={datas}
          valorDiaria={valor_diaria}
          conflictingPeriods={conflicting_periods}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              Calendário de datas *
            </Label>
            {isLoadingPeriods && (
              <span className="text-xs text-muted-foreground">
                Carregando datas ocupadas...
              </span>
            )}
          </div>

          <TarifarioCalendar
            selectedDates={datas}
            occupiedPeriods={occupiedPeriods}
            excludeTarifarioId={excludeTarifarioId}
            initialMonth={initialCalendarMonth}
            onToggleDate={handle_toggle_date}
            onReplaceSelection={handle_replace_dates}
            onClearSelection={handle_clear_dates}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>
    </CrudFormLayout>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import {
  TarifarioForm,
  type TarifarioSubmitPayload,
} from '@/components/tarifarios/tarifario_form'
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
import { usePageTitle } from '@/hooks/use_document_title'
import {
  useTarifario,
  useTarifariosCalendario,
  useUpdateTarifarioMutation,
} from '@/hooks/use_tarifarios'

export function EditarTarifarioPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const {
    data: tarifario,
    isLoading: is_loading_tarifario,
    isError: is_error_tarifario,
  } = useTarifario(id)

  usePageTitle(
    tarifario?.nome
      ? `Editar Tarifário - ${tarifario.nome}`
      : 'Editar Tarifário'
  )

  const { data: categories, isLoading: is_loading_categories } = useQuery({
    queryKey: ['categorias_quartos', 'edit_tarifario'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })

  const { data: regimes } = useQuery({
    queryKey: ['regimes_alimentacao', 'todos'],
    queryFn: () => regimesAlimentacaoService.list({ limite: 250 }),
  })

  const { data: parceiros } = useQuery({
    queryKey: ['parceiros_comerciais', 'todos'],
    queryFn: () => parceirosComerciaisService.list({ limite: 250 }),
  })

  const [selected_category_ids, setSelectedCategoryIds] = useState<string[]>([])
  const [confirm_deactivate_open, setConfirmDeactivateOpen] = useState(false)
  const [pending_submit_payload, setPendingSubmitPayload] =
    useState<TarifarioSubmitPayload | null>(null)

  useEffect(() => {
    if (tarifario?.categoria_quarto_ids?.length) {
      setSelectedCategoryIds(tarifario.categoria_quarto_ids)
    } else if (tarifario?.categoria_quarto_id) {
      setSelectedCategoryIds([tarifario.categoria_quarto_id])
    }
  }, [tarifario?.categoria_quarto_ids, tarifario?.categoria_quarto_id])

  const effective_category_ids =
    selected_category_ids.length > 0
      ? selected_category_ids
      : tarifario?.categoria_quarto_ids?.length
        ? tarifario.categoria_quarto_ids
        : tarifario?.categoria_quarto_id
          ? [tarifario.categoria_quarto_id]
          : []

  const { data: calendario_data, isLoading: is_loading_periods } =
    useTarifariosCalendario({
      categoria_quarto_id: effective_category_ids[0] ?? '',
      categoria_quarto_ids: effective_category_ids,
    })

  const update_mutation = useUpdateTarifarioMutation(id)

  function execute_update(payload: TarifarioSubmitPayload) {
    update_mutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Tarifário atualizado com sucesso.')
        navigate('/tarifarios')
      },
      onError: (
        error: Error & {
          response?: { status?: number; data?: { message?: string } }
        }
      ) => {
        const status = error.response?.status
        const api_msg = error.response?.data?.message
        if (status === 409) {
          toast.error(
            api_msg ??
              'Conflito de data: uma ou mais datas já pertencem a outro tarifário ativo.'
          )
        } else if (status === 404) {
          toast.error(api_msg ?? 'Tarifário não encontrado.')
        } else {
          toast.error(api_msg ?? 'Erro ao atualizar tarifário.')
        }
      },
    })
  }

  function handle_submit(payload: TarifarioSubmitPayload) {
    if (tarifario?.ativo && !payload.ativo) {
      setPendingSubmitPayload(payload)
      setConfirmDeactivateOpen(true)
      return
    }
    execute_update(payload)
  }

  function handle_confirm_deactivate() {
    if (pending_submit_payload) {
      execute_update(pending_submit_payload)
      setPendingSubmitPayload(null)
    }
    setConfirmDeactivateOpen(false)
  }

  if (is_loading_tarifario || is_loading_categories) {
    return (
      <p className="text-sm text-muted-foreground">Carregando tarifário...</p>
    )
  }

  if (is_error_tarifario || !tarifario || !categories) {
    return <p className="text-sm text-destructive">Tarifário não encontrado.</p>
  }

  const current_cat_ids =
    tarifario.categoria_quarto_ids ??
    (tarifario.categoria_quarto_id ? [tarifario.categoria_quarto_id] : [])

  const selectable_categories = [
    ...categories.data.filter(c => c.status === 'S'),
  ]
  const tarifario_cats =
    tarifario.categorias ??
    (tarifario.categoria_quarto ? [tarifario.categoria_quarto] : [])
  for (const cat of tarifario_cats) {
    if (
      cat.status === 'N' &&
      !selectable_categories.some(c => c.id === cat.id)
    ) {
      selectable_categories.push(cat)
    }
  }

  return (
    <>
      <TarifarioForm
        mode="edit"
        title="Editar tarifário"
        submitLabel="Salvar"
        initialValues={{
          nome: tarifario.nome,
          categoria_quarto_ids: current_cat_ids,
          categoria_quarto_id: current_cat_ids[0],
          regime_alimentacao_id: tarifario.regime_alimentacao_id,
          parceiro_id: tarifario.parceiro_id,
          datas: tarifario.datas,
          valor_diaria: tarifario.valor_diaria,
          minimo_diarias: tarifario.minimo_diarias ?? 1,
          ativo: tarifario.ativo,
        }}
        categories={selectable_categories}
        regimes={regimes?.data ?? []}
        parceiros={parceiros?.data ?? []}
        occupiedPeriods={calendario_data?.data ?? []}
        isLoadingPeriods={is_loading_periods}
        excludeTarifarioId={tarifario.id}
        isSubmitting={update_mutation.isPending}
        onCategoriesChange={setSelectedCategoryIds}
        onCancel={() => navigate('/tarifarios')}
        onSubmitPayload={handle_submit}
      />

      <AlertDialog
        open={confirm_deactivate_open}
        onOpenChange={setConfirmDeactivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar tarifário?</AlertDialogTitle>
            <AlertDialogDescription>
              O tarifário será preservado para consulta histórica, mas deixará
              de ser utilizado no cálculo de novas reservas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handle_confirm_deactivate}>
              Confirmar desativação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

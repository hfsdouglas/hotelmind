import { Button } from '@hotelmind/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import {
  TarifarioForm,
  type TarifarioSubmitPayload,
} from '@/components/tarifarios/tarifario_form'
import { Card, CardContent } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  useCreateTarifarioMutation,
  useTarifariosCalendario,
} from '@/hooks/use_tarifarios'

export function NovoTarifarioPage() {
  usePageTitle('Novo Tarifário')
  const navigate = useNavigate()
  const [selected_category_ids, setSelectedCategoryIds] = useState<string[]>([])

  const {
    data: categories,
    isLoading: is_loading_categories,
    isError: is_error_categories,
  } = useQuery({
    queryKey: ['categorias_quartos', 'ativas'],
    queryFn: () => categoriasQuartosService.list({ status: 'S', limite: 250 }),
  })

  const { data: regimes } = useQuery({
    queryKey: ['regimes_alimentacao', 'ativos'],
    queryFn: () => regimesAlimentacaoService.list({ ativo: true, limite: 250 }),
  })

  const { data: parceiros } = useQuery({
    queryKey: ['parceiros_comerciais', 'ativos'],
    queryFn: () =>
      parceirosComerciaisService.list({ status: 'ativo', limite: 250 }),
  })

  const { data: calendario_data, isLoading: is_loading_periods } =
    useTarifariosCalendario({
      categoria_quarto_id: selected_category_ids[0] ?? '',
      categoria_quarto_ids: selected_category_ids,
    })

  const create_mutation = useCreateTarifarioMutation()

  function handle_submit(payload: TarifarioSubmitPayload) {
    create_mutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Tarifário cadastrado com sucesso.')
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
              'Conflito de período: já existe um tarifário ativo neste intervalo.'
          )
        } else if (status === 401 || status === 403) {
          toast.error('Você não tem permissão para realizar esta operação.')
        } else {
          toast.error(api_msg ?? 'Erro ao cadastrar tarifário.')
        }
      },
    })
  }

  if (is_loading_categories) {
    return (
      <p className="text-sm text-muted-foreground">Carregando categorias...</p>
    )
  }

  if (is_error_categories || !categories) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar as categorias de quarto.
      </p>
    )
  }

  if (categories.data.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">Novo tarifário</h1>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria ativa foi cadastrada para o hotel.
            </p>
            <Button asChild className="w-auto shrink-0">
              <Link to="/categorias_quartos/novo">Criar categoria</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (regimes && regimes.data.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">Novo tarifário</h1>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              Nenhum regime de alimentação ativo foi cadastrado para o hotel.
            </p>
            <Button asChild className="w-auto shrink-0">
              <Link to="/regimes_alimentacao/novo">
                Criar regime de alimentação
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TarifarioForm
      mode="create"
      title="Novo tarifário"
      submitLabel="Salvar"
      categories={categories.data}
      regimes={regimes?.data ?? []}
      parceiros={parceiros?.data ?? []}
      occupiedPeriods={calendario_data?.data ?? []}
      isLoadingPeriods={is_loading_periods}
      isSubmitting={create_mutation.isPending}
      onCategoriesChange={setSelectedCategoryIds}
      onCancel={() => navigate('/tarifarios')}
      onSubmitPayload={handle_submit}
    />
  )
}

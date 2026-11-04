import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { SaveButton } from '@/components/forms/save_button'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ParceiroForm,
  type ParceiroFormState,
} from '../components/parceiro_form'

export function EditarParceiroPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const partnerId = id ?? ''

  const {
    data: parceiro,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['parceiro_comercial', partnerId],
    queryFn: () => parceirosComerciaisService.get(partnerId),
    enabled: Boolean(partnerId),
  })

  const mutation = useMutation({
    mutationFn: (data: ParceiroFormState) =>
      parceirosComerciaisService.update(partnerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros_comerciais'] })
      queryClient.invalidateQueries({
        queryKey: ['parceiro_comercial', partnerId],
      })
      toast.success('Parceiro comercial atualizado com sucesso!')
      navigate('/comercial/parceiros')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message ||
        'Erro ao atualizar parceiro comercial. Verifique os dados informados.'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !parceiro) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
        <p className="text-lg font-medium text-destructive">
          Parceiro comercial não encontrado.
        </p>
        <Button variant="outline" asChild>
          <Link to="/comercial/parceiros">Voltar para a listagem</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/comercial/parceiros">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editar Parceiro Comercial
          </h1>
          <p className="text-sm text-muted-foreground">
            {parceiro.razao_social}
            {parceiro.nome_fantasia ? ` (${parceiro.nome_fantasia})` : ''}
          </p>
        </div>
      </div>

      <ParceiroForm
        initialData={{
          ...parceiro,
          comissao_padrao: Number(parceiro.comissao_padrao),
          limite_credito: Number(parceiro.limite_credito),
          contatos: parceiro.contatos || [],
        }}
        onSubmit={data => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        submitButtonNode={
          <SaveButton
            label="Salvar Alterações"
            isPending={mutation.isPending}
          />
        }
      />
    </div>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import { SaveButton } from '@/components/forms/save_button'
import {
  ParceiroForm,
  type ParceiroFormState,
} from '@/components/parceiros/parceiro_form'
import { Button } from '@/components/ui/button'

export function NovoParceiroPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: ParceiroFormState) =>
      parceirosComerciaisService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parceiros_comerciais'] })
      toast.success('Parceiro comercial cadastrado com sucesso!')
      navigate('/comercial/parceiros')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message ||
        'Erro ao cadastrar parceiro comercial. Verifique os dados informados.'
      toast.error(msg)
    },
  })

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
            Novo Parceiro Comercial
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre agências, operadoras, consultores, clubes ou empresas
            conveniadas.
          </p>
        </div>
      </div>

      <ParceiroForm
        onSubmit={data => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        submitButtonNode={
          <SaveButton label="Salvar Parceiro" isPending={mutation.isPending} />
        }
      />
    </div>
  )
}

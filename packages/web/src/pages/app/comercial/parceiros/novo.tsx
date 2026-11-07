import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { parceirosComerciaisService } from '@/api/parceiros_comerciais.service'
import {
  ParceiroForm,
  type ParceiroFormState,
} from '@/components/parceiros/parceiro_form'
import { usePageTitle } from '@/hooks/use_document_title'

export function NovoParceiroPage() {
  usePageTitle('Novo Parceiro Comercial')
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
    <ParceiroForm
      title="Novo Parceiro Comercial"
      backTo="/comercial/parceiros"
      cardTitle="Dados do Parceiro Comercial"
      onSubmit={data => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel="Salvar Parceiro"
    />
  )
}

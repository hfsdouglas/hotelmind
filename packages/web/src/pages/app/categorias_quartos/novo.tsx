import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'

const schema = z.object({ nome: z.string().trim().min(1, 'Nome obrigatório').max(100), status: z.enum(['S', 'N']) })
type FormData = z.infer<typeof schema>

export function NovaCategoriaQuartoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { status: 'S' } })
  const mutation = useMutation({
    mutationFn: categoriasQuartosService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categorias_quartos'] }); toast.success('Categoria criada com sucesso.'); navigate('/categorias_quartos') },
    onError: (error: { response?: { status?: number } }) => toast.error(error.response?.status === 409 ? 'Já existe uma categoria com este nome.' : 'Erro ao criar categoria.'),
  })

  return (
    <CrudFormLayout title="Nova categoria de quarto" backTo="/categorias_quartos" cardTitle="Dados da categoria" onSubmit={handleSubmit(data => mutation.mutate(data))} actions={<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Criar categoria'}</Button>}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="nome">Nome *</Label><Input id="nome" {...register('nome')} />{errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}</div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="status">Status</Label><Controller name="status" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="S">Ativa</SelectItem><SelectItem value="N">Inativa</SelectItem></SelectContent></Select>} /></div>
      </div>
    </CrudFormLayout>
  )
}

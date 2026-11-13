import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@hotelmind/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type CategoriaQuartoFormData,
  categoriaQuartoSchema,
} from '@/schemas/categorias_quartos/categoria_quarto_schema'

export function NovaCategoriaQuartoPage() {
  usePageTitle('Nova Categoria de Quarto')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoriaQuartoFormData>({
    resolver: zodResolver(categoriaQuartoSchema as never),
    defaultValues: { status: 'S' },
  })

  const mutation = useMutation({
    mutationFn: (data: CategoriaQuartoFormData) =>
      categoriasQuartosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias_quartos'] })
      toast.success('Categoria criada com sucesso.')
      navigate('/categorias_quartos')
    },
    onError: (error: { response?: { status?: number } }) =>
      toast.error(
        error.response?.status === 409
          ? 'Já existe uma categoria com este nome.'
          : 'Erro ao criar categoria.'
      ),
  })

  return (
    <CrudFormLayout
      title="Nova categoria de quarto"
      backTo="/categorias_quartos"
      cardTitle="Dados da categoria"
      onSubmit={handleSubmit(data => mutation.mutate(data))}
      actions={<SaveButton isPending={mutation.isPending} />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Ativa</SelectItem>
                  <SelectItem value="N">Inativa</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </CrudFormLayout>
  )
}

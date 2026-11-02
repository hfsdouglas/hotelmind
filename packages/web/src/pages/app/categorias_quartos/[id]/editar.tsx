import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'

const schema = z.object({ nome: z.string().trim().min(1, 'Nome obrigatório').max(100), status: z.enum(['S', 'N']) })
type FormData = z.infer<typeof schema>

export function EditarCategoriaQuartoPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['categoria_quarto', id], queryFn: () => categoriasQuartosService.get(id), enabled: !!id })
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), values: data ? { nome: data.nome, status: data.status } : undefined })
  const [confirm_open, setConfirmOpen] = useState(false)
  const [pending_form, setPendingForm] = useState<FormData | null>(null)
  const mutation = useMutation({
    mutationFn: (form: FormData) => categoriasQuartosService.update(id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categorias_quartos'] }); toast.success('Categoria atualizada com sucesso.'); navigate('/categorias_quartos') },
    onError: (error: { response?: { status?: number } }) => toast.error(error.response?.status === 409 ? 'Já existe uma categoria com este nome.' : 'Erro ao atualizar categoria.'),
  })
  if (isLoading || !data) return <p>Carregando categoria...</p>
  return <><CrudFormLayout title="Editar categoria de quarto" backTo="/categorias_quartos" cardTitle="Dados da categoria" onSubmit={handleSubmit(form => { if (data.status === 'S' && form.status === 'N') { setPendingForm(form); setConfirmOpen(true) } else mutation.mutate(form) })} actions={<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar alterações'}</Button>}>
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5"><Label htmlFor="nome">Nome *</Label><Input id="nome" {...register('nome')} />{errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}</div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="status">Status</Label><Controller name="status" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="S">Ativa</SelectItem><SelectItem value="N">Inativa</SelectItem></SelectContent></Select>} /></div>
    </div>
  </CrudFormLayout><AlertDialog open={confirm_open} onOpenChange={setConfirmOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Inativar categoria?</AlertDialogTitle><AlertDialogDescription>A categoria será preservada, mas não poderá ser escolhida em novos quartos.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (pending_form) mutation.mutate(pending_form); setConfirmOpen(false) }}>Inativar categoria</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
}

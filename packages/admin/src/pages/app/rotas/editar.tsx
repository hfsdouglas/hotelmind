import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Checkbox } from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { rotasService } from '@/api/rotas.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/crud_form_layout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/use_document_title'
import {
  type RotaUpdateFormData,
  rotaUpdateSchema,
} from '@/schemas/rotas/rota_schema'

type FormData = RotaUpdateFormData

const fieldLabels: Record<'modulo' | 'recurso' | 'rota' | 'icone', string> = {
  modulo: 'Módulo',
  recurso: 'Recurso',
  rota: 'Rota',
  icone: 'Ícone',
}

export function RotaEditarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: rota } = useQuery({
    queryKey: ['admin:rota', id],
    queryFn: () => rotasService.findById(id!),
    enabled: !!id,
  })

  usePageTitle(rota?.recurso ? `Editar Rota - ${rota.recurso}` : 'Editar Rota')

  const form = useForm<FormData>({
    resolver: zodResolver(rotaUpdateSchema),
    defaultValues: {
      modulo: '',
      recurso: '',
      rota: '',
      icone: '',
      ordem: 0,
      ativo: true,
    },
  })

  useEffect(() => {
    if (rota) form.reset({ ...rota, icone: rota.icone ?? '' })
  }, [rota, form])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => rotasService.update(id!, data),
    onSuccess: () => {
      toast.success('Rota atualizada.')
      qc.invalidateQueries({ queryKey: ['admin:rotas'] })
      navigate('/rotas')
    },
    onError: () => toast.error('Erro ao atualizar rota.'),
  })

  return (
    <CrudFormLayout
      title="Editar Rota"
      backTo="/rotas"
      onSubmit={form.handleSubmit(d => mutate(d))}
      actions={
        <>
          <SaveButton isPending={isPending} />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/rotas')}
          >
            Cancelar
          </Button>
        </>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          {(['modulo', 'recurso', 'rota', 'icone'] as const).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{fieldLabels[field]}</FormLabel>
                  <FormControl>
                    <Input {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="ordem"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                <FormControl>
                  <Input type="number" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ativo"
            render={({ field: f }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={f.value} onCheckedChange={f.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Ativo</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </CrudFormLayout>
  )
}

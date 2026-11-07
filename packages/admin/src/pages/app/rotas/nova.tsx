import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { rotasService } from '@/api/rotas.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  type RotaCreateFormData,
  rotaCreateSchema,
} from '@/schemas/rotas/rota_schema'

type FormData = RotaCreateFormData

const fieldLabels: Record<'modulo' | 'recurso' | 'rota' | 'icone', string> = {
  modulo: 'Módulo',
  recurso: 'Recurso',
  rota: 'Rota',
  icone: 'Ícone',
}

export function RotaNovaPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(rotaCreateSchema),
    defaultValues: {
      modulo: '',
      recurso: '',
      rota: '',
      icone: '',
      ordem: 0,
      ativo: true,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => rotasService.create(data),
    onSuccess: () => {
      toast.success('Rota criada.')
      qc.invalidateQueries({ queryKey: ['admin:rotas'] })
      navigate('/rotas')
    },
    onError: () => toast.error('Erro ao criar rota.'),
  })

  return (
    <CrudFormLayout
      title="Nova Rota"
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

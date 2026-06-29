import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { rotasService } from '@/api/rotas.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'

const schema = z.object({
  modulo: z.string().min(1),
  recurso: z.string().min(1),
  rota: z.string().min(1),
  icone: z.string().optional(),
  ordem: z.coerce.number().int().default(0),
  ativo: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

export function RotaNovaPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ordem: 0, ativo: true },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: rotasService.create,
    onSuccess: () => {
      toast.success('Rota criada.')
      qc.invalidateQueries({ queryKey: ['admin:rotas'] })
      navigate('/rotas')
    },
    onError: () => toast.error('Erro ao criar rota.'),
  })

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Nova Rota</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(d => mutate(d))} className="space-y-4">
          {(['modulo', 'recurso', 'rota', 'icone'] as const).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                  <FormControl><Input {...f} value={f.value ?? ''} /></FormControl>
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
                <FormControl><Input type="number" {...f} /></FormControl>
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
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Criar rota'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/rotas')}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

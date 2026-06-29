import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { hoteisService } from '@/api/hoteis.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  nome_hotel: z.string().min(2),
  razao_social: z.string().min(2),
  nome_fantasia: z.string().min(2),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  email_comercial: z.string().email(),
  telefone_comercial: z.string().min(10).max(11),
  website: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function HotelNovoPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: hoteisService.create,
    onSuccess: () => {
      toast.success('Hotel criado com sucesso.')
      qc.invalidateQueries({ queryKey: ['admin:hoteis'] })
      navigate('/hoteis')
    },
    onError: () => toast.error('Erro ao criar hotel. Verifique CNPJ e e-mail.'),
  })

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Novo Hotel</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(d => mutate(d))} className="space-y-4">
          {(['nome_hotel', 'razao_social', 'nome_fantasia', 'cnpj', 'email_comercial', 'telefone_comercial', 'website'] as const).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field.replace(/_/g, ' ')}</FormLabel>
                  <FormControl><Input {...f} value={f.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar hotel'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/hoteis')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

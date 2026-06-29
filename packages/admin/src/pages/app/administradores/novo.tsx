import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { administradoresService } from '@/api/administradores.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  nome_completo: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
})

type FormData = z.infer<typeof schema>

export function AdministradorNovoPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => administradoresService.create({ ...data, status: 'S' }),
    onSuccess: () => {
      toast.success('Administrador criado.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
      navigate('/administradores')
    },
    onError: () => toast.error('Erro ao criar administrador. E-mail pode já existir.'),
  })

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Novo Administrador</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(d => mutate(d))} className="space-y-4">
          {(['nome_completo', 'email', 'senha'] as const).map(field => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field === 'nome_completo' ? 'Nome completo' : field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                  <FormControl>
                    <Input type={field === 'senha' ? 'password' : field === 'email' ? 'email' : 'text'} {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Criar'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/administradores')}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

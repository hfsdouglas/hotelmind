import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { administradoresService } from '@/api/administradores.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  nome_completo: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8).optional().or(z.literal('')),
  status: z.enum(['S', 'N']),
})

type FormData = z.infer<typeof schema>

export function AdministradorEditarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: admin } = useQuery({
    queryKey: ['admin:administrador', id],
    queryFn: () => administradoresService.findById(id!),
    enabled: !!id,
  })

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (admin) form.reset({ ...admin, senha: '', status: admin.status as 'S' | 'N' })
  }, [admin, form])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const { senha, ...rest } = data
      return administradoresService.update(id!, { ...rest, ...(senha ? { senha } : {}) })
    },
    onSuccess: () => {
      toast.success('Administrador atualizado.')
      qc.invalidateQueries({ queryKey: ['admin:administradores'] })
      navigate('/administradores')
    },
    onError: () => toast.error('Erro ao atualizar administrador.'),
  })

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Editar Administrador</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(d => mutate(d))} className="space-y-4">
          <FormField control={form.control} name="nome_completo"
            render={({ field: f }) => (
              <FormItem><FormLabel>Nome completo</FormLabel><FormControl><Input {...f} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField control={form.control} name="email"
            render={({ field: f }) => (
              <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...f} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField control={form.control} name="senha"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Nova senha <span className="text-muted-foreground text-xs">(deixe em branco para manter)</span></FormLabel>
                <FormControl><Input type="password" {...f} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="status"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={f.onChange} value={f.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="S">Ativo</SelectItem>
                    <SelectItem value="N">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/administradores')}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { gruposService } from '@/api/grupos.service'

const schema = z.object({
  grupo: z.string().min(1, 'Nome obrigatório').max(100),
  descricao: z.string().optional(),
  status: z.enum(['S', 'N']).default('S'),
})

type FormData = z.infer<typeof schema>

export function NovoGrupoPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'S' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => gruposService.create(data),
    onSuccess: () => {
      toast.success('Grupo criado com sucesso.')
      navigate('/grupos')
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um grupo com este nome.')
      } else {
        toast.error('Erro ao criar grupo.')
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/grupos"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Novo grupo</h1>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grupo">Nome *</Label>
              <Input id="grupo" {...register('grupo')} />
              {errors.grupo && <p className="text-sm text-destructive">{errors.grupo.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" {...register('descricao')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select defaultValue="S" onValueChange={v => setValue('status', v as 'S' | 'N')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Ativo</SelectItem>
                  <SelectItem value="N">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar grupo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

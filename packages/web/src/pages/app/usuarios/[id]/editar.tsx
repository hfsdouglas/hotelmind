import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { usuariosService } from '@/api/usuarios.service'
import { gruposService } from '@/api/grupos.service'

const schema = z.object({
  nome_completo: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(8).optional().or(z.literal('')),
  nascimento: z.string().optional(),
  genero: z.string().optional(),
  celular: z.string().min(10).max(11).optional(),
  cpf: z.string().length(11).optional(),
  rg: z.string().optional(),
  grupos_ids: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosService.get(id!),
    enabled: !!id,
  })

  const { data: gruposData } = useQuery({
    queryKey: ['grupos', { pagina: 1, limite: 250 }],
    queryFn: () => gruposService.list({ pagina: 1, limite: 250, status: 'S' }),
  })

  const grupos = gruposData?.data ?? []

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (usuario) {
      reset({
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        nascimento: usuario.nascimento?.split('T')[0] ?? '',
        genero: usuario.genero,
        celular: usuario.celular,
        cpf: usuario.cpf,
        rg: usuario.rg ?? '',
        grupos_ids: usuario.grupos_ids ?? '',
      })
    }
  }, [usuario, reset])

  const currentGruposIds = watch('grupos_ids') ?? ''
  const selectedGrupos = new Set(currentGruposIds.split(',').filter(Boolean))

  function toggleGrupo(gid: string) {
    const next = new Set(selectedGrupos)
    if (next.has(gid)) next.delete(gid)
    else next.add(gid)
    setValue('grupos_ids', Array.from(next).join(','))
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      usuariosService.update(id!, {
        ...data,
        senha: data.senha || undefined,
        rg: data.rg || null,
        grupos_ids: data.grupos_ids || null,
      }),
    onSuccess: () => {
      toast.success('Usuário atualizado.')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      navigate('/usuarios')
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        toast.error('Já existe um usuário com este e-mail, CPF ou celular.')
      } else {
        toast.error('Erro ao atualizar usuário.')
      }
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (!usuario) return <p className="text-destructive">Usuário não encontrado.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/usuarios"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Editar usuário</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Dados do usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(d => mutation.mutate(d))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label>Nome completo</Label>
                <Input {...register('nome_completo')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>E-mail</Label>
                <Input type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Nova senha</Label>
                <Input type="password" {...register('senha')} placeholder="Deixe em branco para não alterar" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Data de nascimento</Label>
                <Input type="date" {...register('nascimento')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Gênero</Label>
                <Input {...register('genero')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Celular</Label>
                  <Input {...register('celular')} maxLength={11} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>CPF</Label>
                  <Input {...register('cpf')} maxLength={11} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>RG</Label>
                <Input {...register('rg')} />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {grupos.length > 0 && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Grupos de acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {grupos.map(g => (
                  <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedGrupos.has(g.id)}
                      onCheckedChange={() => toggleGrupo(g.id)}
                    />
                    <span className="text-sm">{g.grupo}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

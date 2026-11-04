import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BedDouble,
  Calendar,
  Mail,
  PawPrint,
  Phone,
  User,
  Users,
  Utensils,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { orcamentosService } from '@/api/orcamentos.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { tarifariosService } from '@/api/tarifarios.service'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  type OrcamentoFormData,
  orcamentoFormSchema,
} from '@/schemas/orcamentos/orcamento.schema'

export function NovoOrcamentoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoFormSchema as never),
    defaultValues: {
      check_in: '',
      check_out: '',
      quantidade_adultos: 2,
      quantidade_criancas: 0,
      quantidade_pets: 0,
      regime_alimentacao_id: '',
      categoria_quarto_id: '',
      lead_nome: '',
      lead_telefone: '',
      lead_email: '',
      observacoes: '',
    },
  })

  const watch_check_in = watch('check_in')
  const watch_check_out = watch('check_out')
  const watch_regime_id = watch('regime_alimentacao_id')
  const watch_categoria_id = watch('categoria_quarto_id')

  // 1. Carregar regimes de alimentação
  const { data: regimes_res } = useQuery({
    queryKey: ['regimes_alimentacao', { ativo: true }],
    queryFn: () => regimesAlimentacaoService.list({ ativo: true }),
  })
  const regimes = regimes_res?.data ?? []

  // 2. Carregar categorias de quartos
  const { data: categorias_res } = useQuery({
    queryKey: ['categorias_quartos'],
    queryFn: () => categoriasQuartosService.list({ status: 'S' }),
  })
  const categorias = categorias_res?.data ?? []

  // 3. Carregar tarifários vigentes para conferir disponibilidade de suítes pelo tarifário
  const { data: tarifarios_res } = useQuery({
    queryKey: ['tarifarios', { ativo: true, regime_id: watch_regime_id }],
    queryFn: () =>
      tarifariosService.list({
        ativo: true,
        regime_alimentacao_id: watch_regime_id || undefined,
        limite: 250,
      }),
    enabled: Boolean(watch_check_in && watch_check_out && watch_regime_id),
  })
  const tarifarios = tarifarios_res?.data ?? []

  // Categorias que têm tarifário cadastrado para o regime selecionado
  const categorias_com_tarifario = categorias.map(cat => {
    const tem_tarifa = tarifarios.some(
      t =>
        t.categoria_quarto_id === cat.id &&
        (!watch_regime_id || t.regime_alimentacao_id === watch_regime_id)
    )
    return { ...cat, tem_tarifa }
  })

  const mutation = useMutation({
    mutationFn: (data: OrcamentoFormData) =>
      orcamentosService.create({
        regime_alimentacao_id: data.regime_alimentacao_id,
        categoria_quarto_id: data.categoria_quarto_id,
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        quantidade_pets: data.quantidade_pets,
        observacoes: data.observacoes,
        lead: {
          nome: data.lead_nome,
          telefone: data.lead_telefone,
          email: data.lead_email,
        },
      }),
    onSuccess: novo => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Orçamento gerado com sucesso!')
      navigate(`/reservas/orcamentos/${novo.id}/editar`)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message || 'Erro ao gerar o orçamento de reserva.'
      toast.error(msg)
    },
  })

  const onSubmit = handleSubmit(data => {
    mutation.mutate(data)
  })

  return (
    <CrudFormLayout
      title="Novo Orçamento"
      backTo="/reservas/orcamentos"
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending}
      submitLabel="Salvar Orçamento"
    >
      <div className="grid gap-6">
        {/* PASSO 1: PERÍODO E OCUPAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Passo 1: Período e Ocupantes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <Label htmlFor="check_in">Data de Check-in *</Label>
              <Input
                id="check_in"
                type="date"
                {...register('check_in')}
                className="mt-1"
              />
              {errors.check_in && (
                <span className="text-xs text-destructive">
                  {errors.check_in.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="check_out">Data de Check-out *</Label>
              <Input
                id="check_out"
                type="date"
                {...register('check_out')}
                className="mt-1"
              />
              {errors.check_out && (
                <span className="text-xs text-destructive">
                  {errors.check_out.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="quantidade_adultos">Adultos *</Label>
              <div className="relative mt-1">
                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_adultos"
                  type="number"
                  min={1}
                  className="pl-9"
                  {...register('quantidade_adultos')}
                />
              </div>
              {errors.quantidade_adultos && (
                <span className="text-xs text-destructive">
                  {errors.quantidade_adultos.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="quantidade_criancas">Crianças</Label>
              <Input
                id="quantidade_criancas"
                type="number"
                min={0}
                className="mt-1"
                {...register('quantidade_criancas')}
              />
            </div>

            <div>
              <Label htmlFor="quantidade_pets">Pets (opcional)</Label>
              <div className="relative mt-1">
                <PawPrint className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_pets"
                  type="number"
                  min={0}
                  className="pl-9"
                  {...register('quantidade_pets')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PASSO 2: REGIME DE ALIMENTAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Utensils className="h-5 w-5 text-primary" />
              Passo 2: Regime de Alimentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Selecione o plano de refeições desejado para consultar os
              tarifários vigentes:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {regimes.map(regime => {
                const isSelected = watch_regime_id === regime.id
                return (
                  <button
                    key={regime.id}
                    type="button"
                    onClick={() => setValue('regime_alimentacao_id', regime.id)}
                    className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold">{regime.titulo}</span>
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: regime.cor_pulseira }}
                      />
                    </div>
                    {regime.descricao && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {regime.descricao}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
            {errors.regime_alimentacao_id && (
              <span className="mt-2 block text-xs text-destructive">
                {errors.regime_alimentacao_id.message}
              </span>
            )}
          </CardContent>
        </Card>

        {/* PASSO 3: CARREGAMENTO DE SUÍTES DE ACORDO COM O TARIFÁRIO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BedDouble className="h-5 w-5 text-primary" />
              Passo 3: Acomodação (Suítes Disponíveis pelo Tarifário)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!watch_check_in || !watch_check_out || !watch_regime_id ? (
              <p className="text-sm italic text-muted-foreground">
                Preencha o período (Passo 1) e selecione o regime de alimentação
                (Passo 2) para carregar as suítes disponíveis com tarifário
                ativo.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {categorias_com_tarifario.map(cat => {
                  const isSelected = watch_categoria_id === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('categoria_quarto_id', cat.id)}
                      className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{cat.nome}</span>
                        {cat.tem_tarifa ? (
                          <Badge variant="outline" className="text-xs">
                            Tarifa Ativa
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs text-muted-foreground"
                          >
                            Sem Tarifa
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {errors.categoria_quarto_id && (
              <span className="mt-2 block text-xs text-destructive">
                {errors.categoria_quarto_id.message}
              </span>
            )}
          </CardContent>
        </Card>

        {/* PASSO 4: PRIMEIRO CONTATO (LEAD) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Passo 4: Dados do Primeiro Contato (Lead)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="lead_nome">Nome Completo *</Label>
              <div className="relative mt-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_nome"
                  className="pl-9"
                  placeholder="Nome do contato"
                  {...register('lead_nome')}
                />
              </div>
              {errors.lead_nome && (
                <span className="text-xs text-destructive">
                  {errors.lead_nome.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="lead_telefone">Celular / WhatsApp *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_telefone"
                  className="pl-9"
                  placeholder="(00) 00000-0000"
                  {...register('lead_telefone')}
                />
              </div>
              {errors.lead_telefone && (
                <span className="text-xs text-destructive">
                  {errors.lead_telefone.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="lead_email">E-mail *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lead_email"
                  type="email"
                  className="pl-9"
                  placeholder="contato@exemplo.com"
                  {...register('lead_email')}
                />
              </div>
              {errors.lead_email && (
                <span className="text-xs text-destructive">
                  {errors.lead_email.message}
                </span>
              )}
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="observacoes">Observações da Proposta</Label>
              <Textarea
                id="observacoes"
                className="mt-1"
                placeholder="Ex.: Solicita cama extra, comemoração de aniversário, etc."
                {...register('observacoes')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </CrudFormLayout>
  )
}

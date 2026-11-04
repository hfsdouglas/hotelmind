import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Loader2, PawPrint, Tag, Users, Utensils } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { categoriasQuartosService } from '@/api/categorias_quartos.service'
import { orcamentosService } from '@/api/orcamentos.service'
import { regimesAlimentacaoService } from '@/api/regimes_alimentacao.service'
import { CrudFormLayout, SaveButton } from '@/components/forms/CrudFormLayout'
import { OrcamentoAcoesCompartilhamento } from '@/components/orcamentos/orcamento_acoes_compartilhamento'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date_picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mask_phone } from '@/hooks/use_phone_mask'

const editOrcamentoSchema = z.object({
  check_in: z.string().min(10, 'A data de check-in é obrigatória.'),
  check_out: z.string().min(10, 'A data de check-out é obrigatória.'),
  quantidade_adultos: z.coerce.number().int().min(1, 'Mínimo de 1 adulto.'),
  quantidade_criancas: z.coerce.number().int().min(0).default(0),
  quantidade_pets: z.coerce.number().int().min(0).default(0),
  cupom_desconto: z.string().trim().max(50).optional(),
  regime_alimentacao_id: z
    .string()
    .min(1, 'Selecione o regime de alimentação.'),
  categoria_quarto_id: z
    .string()
    .min(1, 'Selecione a categoria de acomodação.'),
  status: z.enum(['pendente', 'aprovado', 'cancelado', 'expirado']),
  observacoes: z.string().optional(),
})

type EditOrcamentoFormData = z.infer<typeof editOrcamentoSchema>

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function EditarOrcamentoPage() {
  const { id } = useParams<{ id: string }>()
  const orcamentoId = id ?? ''
  const queryClient = useQueryClient()

  const { data: orcamento, isLoading: isLoadingOrcamento } = useQuery({
    queryKey: ['orcamento', orcamentoId],
    queryFn: () => orcamentosService.get(orcamentoId),
    enabled: Boolean(orcamentoId),
  })

  const { data: regimes_res, isLoading: isLoadingRegimes } = useQuery({
    queryKey: ['regimes_alimentacao'],
    queryFn: () => regimesAlimentacaoService.list({ limite: 250 }),
  })
  const regimes = regimes_res?.data ?? []

  const { data: categorias_res, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias_quartos'],
    queryFn: () => categoriasQuartosService.list({ limite: 250 }),
  })
  const categorias = categorias_res?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditOrcamentoFormData>({
    resolver: zodResolver(editOrcamentoSchema as never),
    values: orcamento
      ? {
          check_in: orcamento.check_in,
          check_out: orcamento.check_out,
          quantidade_adultos: orcamento.quantidade_adultos,
          quantidade_criancas: orcamento.quantidade_criancas,
          quantidade_pets: orcamento.quantidade_pets,
          regime_alimentacao_id: orcamento.regime_alimentacao_id,
          categoria_quarto_id: orcamento.categoria_quarto_id,
          cupom_desconto: orcamento.cupom_desconto || '',
          status: orcamento.status,
          observacoes: orcamento.observacoes || '',
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: EditOrcamentoFormData) =>
      orcamentosService.update(orcamentoId, {
        check_in: data.check_in,
        check_out: data.check_out,
        quantidade_adultos: data.quantidade_adultos,
        quantidade_criancas: data.quantidade_criancas,
        quantidade_pets: data.quantidade_pets,
        cupom_desconto: data.cupom_desconto?.trim() || null,
        regime_alimentacao_id: data.regime_alimentacao_id,
        categoria_quarto_id: data.categoria_quarto_id,
        status: data.status,
        observacoes: data.observacoes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['orcamento', orcamentoId] })
      toast.success('Orçamento atualizado com sucesso!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message || 'Erro ao atualizar o orçamento.'
      toast.error(msg)
    },
  })

  const onSubmit = handleSubmit(data => {
    mutation.mutate(data)
  })

  if (
    isLoadingOrcamento ||
    isLoadingRegimes ||
    isLoadingCategorias ||
    !orcamento
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <CrudFormLayout
      title={`Editar Orçamento - ${orcamento.lead?.nome ?? 'Cliente'}`}
      backTo="/reservas/orcamentos"
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending}
      submitLabel="Salvar"
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <OrcamentoAcoesCompartilhamento
            token_publico={orcamento.token_publico}
            lead_nome={orcamento.lead?.nome}
            lead_email={orcamento.lead?.email}
            lead_telefone={orcamento.lead?.telefone}
            valor_total={orcamento.valor_total}
            size="sm"
          />
          <SaveButton isPending={mutation.isPending} label="Salvar" />
        </div>
      }
    >
      <div className="grid gap-6">
        {/* RESUMO DO LEAD & STATUS */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Lead / Primeiro Contato
              </span>
              <p className="mt-1 font-bold text-slate-800">
                {orcamento.lead?.nome}
              </p>
              <p className="text-xs text-muted-foreground">
                {mask_phone(orcamento.lead?.telefone ?? '')} •{' '}
                {orcamento.lead?.email}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Investimento Total
              </span>
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {formatarMoeda(orcamento.valor_total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {orcamento.detalhamento_noites.length} noites cotadas
              </p>
            </div>

            <div>
              <Label htmlFor="status">Situação do Orçamento</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value || 'pendente'}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* DADOS DE PERÍODO E OCUPANTES */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Período e Hóspedes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="check_in">Check-in</Label>
              <Controller
                control={control}
                name="check_in"
                render={({ field }) => (
                  <DatePicker
                    id="check_in"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="dd/mm/aaaa"
                  />
                )}
              />
              {errors.check_in && (
                <span className="block text-xs text-destructive">
                  {errors.check_in.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="check_out">Check-out</Label>
              <Controller
                control={control}
                name="check_out"
                render={({ field }) => (
                  <DatePicker
                    id="check_out"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="dd/mm/aaaa"
                  />
                )}
              />
              {errors.check_out && (
                <span className="block text-xs text-destructive">
                  {errors.check_out.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_adultos">Adultos</Label>
              <div className="relative">
                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_adultos"
                  type="number"
                  min={1}
                  className="pl-9 h-9"
                  {...register('quantidade_adultos')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_criancas">Crianças</Label>
              <Input
                id="quantidade_criancas"
                type="number"
                min={0}
                className="h-9"
                {...register('quantidade_criancas')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantidade_pets">Pets</Label>
              <div className="relative">
                <PawPrint className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quantidade_pets"
                  type="number"
                  min={0}
                  className="pl-9 h-9"
                  {...register('quantidade_pets')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REGIME E ACOMODAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-4 w-4 text-primary" />
              Regime de Alimentação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="regime_alimentacao_id">
                Regime de Alimentação
              </Label>
              <Controller
                control={control}
                name="regime_alimentacao_id"
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      {regimes.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: r.cor_pulseira }}
                            />
                            <span>{r.titulo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="categoria_quarto_id">Categoria / Suíte</Label>
              <Controller
                control={control}
                name="categoria_quarto_id"
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                className="mt-1"
                {...register('observacoes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* CUPOM DE DESCONTO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4 text-primary" />
              Cupom de Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor="cupom_desconto">Código do cupom (opcional)</Label>
              <div className="relative">
                <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cupom_desconto"
                  placeholder="Ex.: PROMO10"
                  className="h-9 pl-9 uppercase"
                  {...register('cupom_desconto')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DISCRIMINAÇÃO DAS DIÁRIAS ATUAIS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Detalhamento das Diárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orcamento.detalhamento_noites.map(noite => (
                <div
                  key={noite.data}
                  className="flex items-center justify-between rounded-md border p-2 text-xs"
                >
                  <span className="font-medium">
                    {formatarDataBR(noite.data)} - {noite.tarifario_nome}
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatarMoeda(noite.valor_diaria)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CrudFormLayout>
  )
}

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@hotelmind/ui'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  BedDouble,
  Calendar,
  CheckCircle2,
  Hotel,
  Loader2,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Tag,
  Users,
  Utensils,
} from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { orcamentosService } from '@/api/orcamentos.service'
import { ModalReservarInfo } from '@/components/orcamentos/modal_reservar_info'
import { usePageTitle } from '@/hooks/use_document_title'
import { mask_phone } from '@/hooks/use_phone_mask'

function formatarDataBR(dataIso: string) {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: string | number) {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

export function VisualizarOrcamentoPublicoPage() {
  const { token } = useParams<{ token: string }>()
  const publicToken = token ?? ''
  const [modalReservarOpen, setModalReservarOpen] = useState(false)

  const {
    data: orcamento,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orcamento_publico', publicToken],
    queryFn: () => orcamentosService.getPublico(publicToken),
    enabled: Boolean(publicToken),
  })

  usePageTitle(
    orcamento ? `Proposta - ${orcamento.lead_nome}` : 'Proposta de Hospedagem'
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Carregando sua proposta de hospedagem...
        </p>
      </div>
    )
  }

  if (isError || !orcamento) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Proposta não encontrada</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Este link de orçamento pode ter expirado ou o endereço digitado está
          incorreto.
        </p>
      </div>
    )
  }

  const end = orcamento.hotel_endereco
  const endereco = end
    ? [
        `${end.rua}, ${end.numero}${end.complemento ? ` - ${end.complemento}` : ''}`,
        end.bairro,
        `${end.cidade}/${end.estado}`,
        `CEP ${end.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}`,
      ].join(' • ')
    : ''

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 antialiased">
      {/* Top Banner do Hotel */}
      <header className="sticky top-0 z-10 border-b bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                {orcamento.hotel_nome}
              </h2>
              {orcamento.hotel_telefone && (
                <p className="text-xs text-muted-foreground">
                  {orcamento.hotel_telefone}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Orçamento
          </Badge>
        </div>
      </header>

      {/* Conteúdo Mobile-First Centralizado */}
      <main className="mx-auto max-w-md px-4 pt-5">
        {/* Saudação e Status */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Proposta Especial
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            Olá, {orcamento.lead_nome}!
          </h1>
          <p className="text-xs text-muted-foreground">
            Confira abaixo todos os detalhes da sua cotação de estada.
          </p>
        </div>

        {/* Card do Período */}
        <Card className="mb-4 overflow-hidden border-border/60 shadow-xs">
          <CardHeader className="bg-slate-100/60 pb-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Calendar className="h-4 w-4 text-primary" />
              Período da Hospedagem
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 p-4 text-center">
            <div className="rounded-xl border bg-white p-3">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Check-in
              </span>
              <p className="mt-0.5 text-base font-bold text-slate-800">
                {formatarDataBR(orcamento.check_in)}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-3">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Check-out
              </span>
              <p className="mt-0.5 text-base font-bold text-slate-800">
                {formatarDataBR(orcamento.check_out)}
              </p>
            </div>
            <div className="col-span-2 text-center">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Total de {orcamento.total_noites}{' '}
                {orcamento.total_noites === 1 ? 'diária' : 'diárias'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card da Acomodação e Ocupantes */}
        <Card className="mb-4 overflow-hidden border-border/60 shadow-xs">
          <CardHeader className="bg-slate-100/60 pb-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <BedDouble className="h-4 w-4 text-primary" />
              Acomodação & Hóspedes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div>
              <span className="text-xs text-muted-foreground">
                Suíte Cotada
              </span>
              <h3 className="text-lg font-bold text-slate-800">
                {orcamento.categoria_quarto.nome}
              </h3>
            </div>

            <Separator className="my-3" />

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {orcamento.quantidade_adultos}{' '}
                  {orcamento.quantidade_adultos === 1 ? 'Adulto' : 'Adultos'}
                </span>
              </div>

              {orcamento.quantidade_criancas > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {orcamento.quantidade_criancas}{' '}
                    {orcamento.quantidade_criancas === 1
                      ? 'Criança'
                      : 'Crianças'}
                  </span>
                </div>
              )}

              {orcamento.quantidade_pets > 0 && (
                <div className="flex items-center gap-1.5">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {orcamento.quantidade_pets}{' '}
                    {orcamento.quantidade_pets === 1 ? 'Pet' : 'Pets'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card do Regime de Alimentação */}
        <Card className="mb-4 overflow-hidden border-border/60 shadow-xs">
          <CardHeader className="bg-slate-100/60 pb-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Utensils className="h-4 w-4 text-primary" />
              Regime de Alimentação Incluso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{
                    backgroundColor: orcamento.regime_alimentacao.cor,
                  }}
                />
                <span className="text-base font-bold text-slate-800">
                  {orcamento.regime_alimentacao.nome}
                </span>
              </div>
              <Badge
                style={{
                  backgroundColor: `${orcamento.regime_alimentacao.cor}20`,
                  color: orcamento.regime_alimentacao.cor,
                  borderColor: orcamento.regime_alimentacao.cor,
                }}
                variant="outline"
                className="text-[11px] font-semibold"
              >
                Incluso
              </Badge>
            </div>
            {orcamento.regime_alimentacao.descricao && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {orcamento.regime_alimentacao.descricao}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card do Valor Total e Diárias */}
        <Card className="mb-6 overflow-hidden border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Investimento Total
              </span>
              {orcamento.cupom_desconto && (
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Tag className="h-3 w-3" />
                  Cupom: {orcamento.cupom_desconto}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary">
                {formatarMoeda(orcamento.valor_total)}
              </span>
              <span className="text-xs text-muted-foreground">
                p/ {orcamento.total_noites} noites
              </span>
            </div>

            <Separator className="my-4 bg-primary/20" />

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Discriminação por Diária:
              </span>
              {orcamento.detalhamento_noites.map(noite => (
                <div
                  key={noite.data}
                  className="flex items-center justify-between text-xs text-slate-700"
                >
                  <span>{formatarDataBR(noite.data)}</span>
                  <span className="font-semibold">
                    {formatarMoeda(noite.valor_diaria)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rodapé com Dados do Hotel */}
        <footer className="mt-8 mb-6 rounded-xl border border-border/60 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight text-slate-800">
                {orcamento.hotel_nome_fantasia || orcamento.hotel_nome}
              </h3>
            </div>
          </div>

          <Separator className="my-3.5" />

          <ul className="space-y-2 text-xs text-muted-foreground">
            {orcamento.hotel_email && (
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>
                  <strong className="font-medium text-slate-700">
                    E-mail comercial:
                  </strong>{' '}
                  <a
                    href={`mailto:${orcamento.hotel_email}`}
                    className="hover:underline text-primary"
                  >
                    {orcamento.hotel_email}
                  </a>
                </span>
              </li>
            )}
            {orcamento.hotel_telefone && (
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>
                  <strong className="font-medium text-slate-700">
                    Telefone comercial:
                  </strong>{' '}
                  <a
                    href={`tel:${orcamento.hotel_telefone}`}
                    className="hover:underline text-primary"
                  >
                    {mask_phone(orcamento.hotel_telefone)}
                  </a>
                </span>
              </li>
            )}
            {orcamento.hotel_celular && (
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>
                  <strong className="font-medium text-slate-700">
                    Celular:
                  </strong>{' '}
                  <a
                    href={`tel:${orcamento.hotel_celular}`}
                    className="hover:underline text-emerald-700"
                  >
                    {mask_phone(orcamento.hotel_celular)}
                  </a>
                </span>
              </li>
            )}
            {endereco && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>
                  <strong className="font-medium text-slate-700">
                    Endereço:
                  </strong>{' '}
                  {endereco}
                </span>
              </li>
            )}
          </ul>
        </footer>
      </main>

      {/* Barra Fixa no Rodapé com Ação Fictícia de Reservar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 p-3 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground">
              Total
            </span>
            <p className="text-lg font-bold leading-none text-primary">
              {formatarMoeda(orcamento.valor_total)}
            </p>
          </div>
          <Button
            size="lg"
            className="flex-1 font-bold text-white shadow-md"
            onClick={() => setModalReservarOpen(true)}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Reservar Agora
          </Button>
        </div>
      </div>

      {/* Modal Informativo de Reserva */}
      <ModalReservarInfo
        open={modalReservarOpen}
        onOpenChange={setModalReservarOpen}
        hotelNome={orcamento.hotel_nome}
        hotelTelefone={orcamento.hotel_telefone}
      />
    </div>
  )
}

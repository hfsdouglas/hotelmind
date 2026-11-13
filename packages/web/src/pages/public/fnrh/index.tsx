import type { FichaFnrh, FnrhPublicaView } from '@hotelmind/contracts'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileCheck2,
  Hotel,
  Info,
  Loader2,
  Lock,
  Save,
  Send,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { reservasService } from '@/api/reservas.service'
import { usePageTitle } from '@/hooks/use_document_title'

function formatarDataBR(dataIso: string | null | undefined) {
  if (!dataIso) return '-'
  const dateOnly = dataIso.split('T')[0]
  const [ano, mes, dia] = dateOnly.split('-')
  if (!ano || !mes || !dia) return dataIso
  return `${dia}/${mes}/${ano}`
}

function formatarDataHoraBR(dataIso: string | null | undefined) {
  if (!dataIso) return '-'
  const d = new Date(dataIso)
  if (Number.isNaN(d.getTime())) return dataIso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calcularIdade(
  dataNascimento: string | null | undefined
): number | null {
  if (!dataNascimento) return null
  const partes = dataNascimento.split('-')
  if (partes.length < 3) return null
  const ano = Number(partes[0])
  const mes = Number(partes[1]) - 1
  const dia = Number(partes[2])
  const hoje = new Date()
  let idade = hoje.getFullYear() - ano
  const mesDiff = hoje.getMonth() - mes
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < dia)) {
    idade--
  }
  return idade
}

export function FnrhPublicaPage() {
  usePageTitle('Pré-check-in Digital (FNRH)')
  const { token } = useParams<{ token: string }>()
  const publicToken = token ?? ''
  const queryClient = useQueryClient()

  const [expandedPosicao, setExpandedPosicao] = useState<number>(1)
  const [formDataMap, setFormDataMap] = useState<
    Record<number, Partial<FichaFnrh>>
  >({})
  const [envioSucesso, setEnvioSucesso] = useState(false)

  const {
    data: fnrhView,
    isLoading,
    isError,
  } = useQuery<FnrhPublicaView>({
    queryKey: ['fnrh_publica', publicToken],
    queryFn: () => reservasService.getFnrhPublica(publicToken),
    enabled: Boolean(publicToken),
    staleTime: 1000 * 60 * 2,
  })

  // Sincroniza formulários locais com dados dos hóspedes
  useEffect(() => {
    if (fnrhView?.hospedes) {
      const mapa: Record<number, Partial<FichaFnrh>> = {}
      for (const h of fnrhView.hospedes) {
        mapa[h.posicao] = {
          nome_completo: h.nome_completo || '',
          nacionalidade: h.nacionalidade || 'Brasileira',
          data_nascimento: h.data_nascimento || '',
          sexo: h.sexo || '',
          profissao: h.profissao || '',
          tipo_documento: h.tipo_documento || 'cpf',
          numero_documento: h.numero_documento || '',
          logradouro: h.logradouro || '',
          numero_endereco: h.numero_endereco || '',
          complemento: h.complemento || '',
          bairro: h.bairro || '',
          cidade: h.cidade || '',
          estado: h.estado || '',
          cep: h.cep || '',
          pais_residencia: h.pais_residencia || 'Brasil',
          telefone: h.telefone || '',
          email: h.email || '',
          motivo_viagem: h.motivo_viagem || 'Lazer / Férias',
          meio_transporte: h.meio_transporte || 'Automóvel',
          responsavel_posicao: h.responsavel_posicao ?? null,
        }
      }
      setFormDataMap(mapa)
    }
  }, [fnrhView])

  const copiarEnderecoDoTitular = (posicaoDestino: number) => {
    const titular = formDataMap[1]
    if (!titular) {
      toast.error('Dados do hóspede principal não disponíveis.')
      return
    }
    setFormDataMap(prev => ({
      ...prev,
      [posicaoDestino]: {
        ...prev[posicaoDestino],
        cep: titular.cep || prev[posicaoDestino]?.cep,
        logradouro: titular.logradouro || prev[posicaoDestino]?.logradouro,
        numero_endereco:
          titular.numero_endereco || prev[posicaoDestino]?.numero_endereco,
        complemento: titular.complemento || prev[posicaoDestino]?.complemento,
        bairro: titular.bairro || prev[posicaoDestino]?.bairro,
        cidade: titular.cidade || prev[posicaoDestino]?.cidade,
        estado: titular.estado || prev[posicaoDestino]?.estado,
        pais_residencia:
          titular.pais_residencia || prev[posicaoDestino]?.pais_residencia,
      },
    }))
    toast.success('Endereço do hóspede principal copiado com sucesso!')
  }

  const salvarFichaMutation = useMutation({
    mutationFn: async ({
      posicao,
      dados,
      concluir,
    }: {
      posicao: number
      dados: Partial<FichaFnrh>
      concluir: boolean
    }) => {
      return reservasService.salvarFichaPublica(publicToken, posicao, {
        ...dados,
        concluir,
      })
    },
    onSuccess: (hospedeAtualizado, variables) => {
      queryClient.setQueryData<FnrhPublicaView>(
        ['fnrh_publica', publicToken],
        velha => {
          if (!velha) return velha
          return {
            ...velha,
            hospedes: velha.hospedes.map(h =>
              h.posicao === hospedeAtualizado.posicao ? hospedeAtualizado : h
            ),
          }
        }
      )

      if (variables.concluir) {
        toast.success(
          `Ficha do hóspede ${variables.posicao} concluída com sucesso!`
        )
        // Auto expandir próxima ficha pendente se houver
        if (fnrhView) {
          const proxima = fnrhView.hospedes.find(
            h =>
              h.posicao > variables.posicao && h.ficha_status !== 'preenchida'
          )
          if (proxima) {
            setExpandedPosicao(proxima.posicao)
          }
        }
      } else {
        toast.info(
          `Rascunho do hóspede ${variables.posicao} salvo com sucesso.`
        )
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message || 'Erro ao salvar ficha.'
      toast.error(msg)
    },
  })

  const enviarAoHotelMutation = useMutation({
    mutationFn: async () => {
      return reservasService.enviarFnrhAoHotel(publicToken)
    },
    onSuccess: data => {
      setEnvioSucesso(true)
      queryClient.setQueryData<FnrhPublicaView>(
        ['fnrh_publica', publicToken],
        velha => {
          if (!velha) return velha
          return {
            ...velha,
            fnrh_enviada_em: data.fnrh_enviada_em,
          }
        }
      )
      toast.success(
        'Fichas enviadas ao hotel com sucesso! Seu pré-check-in está garantido.'
      )
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err.response?.data?.message || 'Erro ao enviar as fichas ao hotel.'
      toast.error(msg)
    },
  })

  // Quantidade de fichas já concluídas
  const totalPreenchidas = useMemo(() => {
    return (
      fnrhView?.hospedes.filter(h => h.ficha_status === 'preenchida').length ||
      0
    )
  }, [fnrhView?.hospedes])

  const todasConcluidas = Boolean(
    fnrhView &&
      fnrhView.total_hospedes > 0 &&
      totalPreenchidas === fnrhView.total_hospedes
  )

  const handleFieldChange = (
    posicao: number,
    campo: keyof FichaFnrh,
    valor: FichaFnrh[keyof FichaFnrh]
  ) => {
    setFormDataMap(prev => ({
      ...prev,
      [posicao]: {
        ...prev[posicao],
        [campo]: valor,
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="mt-4 text-base font-semibold text-foreground">
          Carregando Ficha Nacional de Registro de Hóspedes (FNRH)...
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Por favor, aguarde um momento.
        </p>
      </div>
    )
  }

  if (isError || !fnrhView) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">
          Ficha não disponível
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Este link de ficha pode ter expirado, ter sido desativado ou o
          endereço digitado está incorreto. Em caso de dúvidas, entre em contato
          diretamente com o hotel.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground antialiased">
      {/* Top Banner do Hotel */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">
                {fnrhView.hotel_nome}
              </h1>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] border-primary/20 bg-primary/10 text-primary font-semibold"
          >
            {totalPreenchidas}/{fnrhView.total_hospedes} preenchida(s)
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-4 space-y-4">
        {/* Banner de Envio Concluído */}
        {(fnrhView.fnrh_enviada_em || envioSucesso) && (
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-500/10 p-4 text-foreground shadow-xs flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                Dados enviados ao hotel com sucesso!
              </p>
              <p className="text-muted-foreground">
                {fnrhView.fnrh_enviada_em
                  ? `Envio registrado em ${formatarDataHoraBR(fnrhView.fnrh_enviada_em)}.`
                  : 'Seus dados foram recebidos pela recepção.'}{' '}
                Caso queira ajustar algum detalhe antes do check-in, você pode
                editar e reenviar a qualquer momento.
              </p>
            </div>
          </div>
        )}

        {/* Resumo da Reserva */}
        <Card className="border-border shadow-xs overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Dados da Hospedagem</span>
              <span className="text-xs font-normal text-muted-foreground">
                Titular:{' '}
                <strong className="text-foreground">
                  {fnrhView.titular_nome}
                </strong>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-3 text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Período
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatarDataBR(fnrhView.check_in)} a{' '}
                {formatarDataBR(fnrhView.check_out)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Acomodação
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Building className="h-3.5 w-3.5 text-primary" />
                {fnrhView.quarto_identificacao}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-border flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Capacidade da reserva:{' '}
                <strong className="text-foreground">
                  {fnrhView.total_hospedes} hóspede(s)
                </strong>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Lock className="h-3 w-3" /> Quantidade definida na reserva
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Informativo Pré-check-in Digital (Abaixo de Dados da Hospedagem) */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/90 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-foreground">
              FNRH • Pré-check-in Digital
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              De acordo com a regulamentação do Ministério do Turismo, cada
              pessoa que se hospedar deve ter sua Ficha Nacional (FNRH)
              individual. Preencha os dados dos hóspedes para agilizar seu
              atendimento na recepção e desfrutar da sua estadia com total
              comodidade.
            </p>
          </div>
        </div>

        {/* Formulários por Hóspede */}
        <div className="space-y-3">
          {fnrhView.hospedes.map(h => {
            const isExpanded = expandedPosicao === h.posicao
            const dados = formDataMap[h.posicao] || {}
            const idade = calcularIdade(dados.data_nascimento)
            const isMenor = idade !== null && idade < 18

            return (
              <Card
                key={h.posicao}
                className={`border transition-all duration-200 overflow-hidden ${
                  h.ficha_status === 'preenchida'
                    ? 'border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : h.ficha_status === 'rascunho'
                      ? 'border-sky-300 dark:border-sky-800 shadow-xs'
                      : 'border-border shadow-xs'
                }`}
              >
                {/* Header do Card (Clicável para expandir/recolher) */}
                <button
                  type="button"
                  onClick={() => setExpandedPosicao(isExpanded ? 0 : h.posicao)}
                  className="w-full text-left p-4 bg-card flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        h.ficha_status === 'preenchida'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : h.ficha_status === 'rascunho'
                            ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {h.posicao}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {dados.nome_completo ||
                            (h.posicao === 1
                              ? 'Titular da Reserva'
                              : `Hóspede ${h.posicao}`)}
                        </span>
                        {h.posicao === 1 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 h-4"
                          >
                            Responsável
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {dados.numero_documento
                          ? `${dados.tipo_documento?.toUpperCase()}: ${dados.numero_documento}`
                          : 'Documento não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        h.ficha_status === 'preenchida'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-800'
                          : h.ficha_status === 'rascunho'
                            ? 'bg-sky-500/10 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-800'
                            : 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-800'
                      }`}
                    >
                      {h.ficha_status === 'preenchida'
                        ? 'Preenchida'
                        : h.ficha_status === 'rascunho'
                          ? 'Rascunho'
                          : 'Pendente'}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Corpo do Formulário do Hóspede */}
                {isExpanded && (
                  <CardContent className="p-4 pt-2 border-t border-border bg-card space-y-4">
                    {/* Seção 1: Identificação */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        Identificação Pessoal
                      </h3>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Nome Completo{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="Nome igual ao documento oficial"
                          value={dados.nome_completo || ''}
                          onChange={e =>
                            handleFieldChange(
                              h.posicao,
                              'nome_completo',
                              e.target.value
                            )
                          }
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Data de Nascimento{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={dados.data_nascimento || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'data_nascimento',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Sexo</Label>
                          <Select
                            value={dados.sexo || ''}
                            onValueChange={v =>
                              handleFieldChange(h.posicao, 'sexo', v)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Nacionalidade</Label>
                          <Input
                            placeholder="Ex: Brasileira"
                            value={dados.nacionalidade || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'nacionalidade',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Profissão</Label>
                          <Input
                            placeholder="Ex: Engenheiro(a), Estudante"
                            value={dados.profissao || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'profissao',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Tipo de Documento{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={dados.tipo_documento || 'cpf'}
                            onValueChange={v =>
                              handleFieldChange(h.posicao, 'tipo_documento', v)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="rg">RG</SelectItem>
                              <SelectItem value="passaporte">
                                Passaporte
                              </SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">
                            Número do Documento{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Somente números ou código"
                            value={dados.numero_documento || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'numero_documento',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      {/* Regra de menor de idade */}
                      {isMenor && (
                        <div className="rounded-lg bg-amber-500/10 p-2.5 border border-amber-300 dark:border-amber-800 text-xs text-foreground space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                            <Info className="h-3.5 w-3.5" />
                            Hóspede menor de 18 anos
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Indique qual dos outros hóspedes da reserva é o
                            responsável legal:
                          </p>
                          <Select
                            value={
                              dados.responsavel_posicao
                                ? String(dados.responsavel_posicao)
                                : '1'
                            }
                            onValueChange={v =>
                              handleFieldChange(
                                h.posicao,
                                'responsavel_posicao',
                                Number(v)
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue placeholder="Selecione o responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              {fnrhView.hospedes
                                .filter(outro => outro.posicao !== h.posicao)
                                .map(outro => (
                                  <SelectItem
                                    key={outro.posicao}
                                    value={String(outro.posicao)}
                                  >
                                    Hóspede {outro.posicao} -{' '}
                                    {formDataMap[outro.posicao]
                                      ?.nome_completo ||
                                      (outro.posicao === 1
                                        ? 'Titular'
                                        : 'Outro Hóspede')}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Seção 2: Contato e Endereço */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                          Contato e Residência
                        </h3>
                        {h.posicao > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copiarEnderecoDoTitular(h.posicao)}
                            className="h-7 text-xs gap-1.5"
                          >
                            <Copy className="size-3" />
                            Copiar do titular
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Telefone / Celular</Label>
                          <Input
                            placeholder="(00) 00000-0000"
                            value={dados.telefone || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'telefone',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">E-mail</Label>
                          <Input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={dados.email || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'email',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">CEP</Label>
                          <Input
                            placeholder="00000-000"
                            value={dados.cep || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'cep',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Logradouro / Rua</Label>
                          <Input
                            placeholder="Rua, Avenida, etc."
                            value={dados.logradouro || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'logradouro',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">Número</Label>
                          <Input
                            placeholder="123"
                            value={dados.numero_endereco || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'numero_endereco',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Bairro</Label>
                          <Input
                            placeholder="Bairro"
                            value={dados.bairro || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'bairro',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Cidade</Label>
                          <Input
                            placeholder="Cidade"
                            value={dados.cidade || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'cidade',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">UF</Label>
                          <Input
                            maxLength={2}
                            placeholder="SP"
                            value={dados.estado || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'estado',
                                e.target.value.toUpperCase()
                              )
                            }
                            className="h-9 text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">País de Residência</Label>
                        <Input
                          placeholder="Brasil"
                          value={dados.pais_residencia || 'Brasil'}
                          onChange={e =>
                            handleFieldChange(
                              h.posicao,
                              'pais_residencia',
                              e.target.value
                            )
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Seção 3: Dados da Viagem */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Informações da Viagem
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Motivo da Viagem</Label>
                          <Select
                            value={dados.motivo_viagem || 'Lazer / Férias'}
                            onValueChange={v =>
                              handleFieldChange(h.posicao, 'motivo_viagem', v)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Lazer / Férias">
                                Lazer / Férias
                              </SelectItem>
                              <SelectItem value="Negócios / Trabalho">
                                Negócios / Trabalho
                              </SelectItem>
                              <SelectItem value="Congresso / Feira">
                                Congresso / Feira
                              </SelectItem>
                              <SelectItem value="Saúde">Saúde</SelectItem>
                              <SelectItem value="Visita a Parentes">
                                Visita a Parentes
                              </SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Meio de Transporte</Label>
                          <Select
                            value={dados.meio_transporte || 'Automóvel'}
                            onValueChange={v =>
                              handleFieldChange(h.posicao, 'meio_transporte', v)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Automóvel">
                                Automóvel
                              </SelectItem>
                              <SelectItem value="Avião">Avião</SelectItem>
                              <SelectItem value="Ônibus">Ônibus</SelectItem>
                              <SelectItem value="Embarcação">
                                Embarcação
                              </SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação do Hóspede */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          salvarFichaMutation.mutate({
                            posicao: h.posicao,
                            dados,
                            concluir: false,
                          })
                        }
                        disabled={salvarFichaMutation.isPending}
                        className="text-xs text-muted-foreground hover:text-foreground h-8"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Salvar Rascunho
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          salvarFichaMutation.mutate({
                            posicao: h.posicao,
                            dados,
                            concluir: true,
                          })
                        }
                        disabled={salvarFichaMutation.isPending}
                        className="text-xs h-8"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Concluir Ficha
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Botão Flutuante / Fixo para Enviar Fichas ao Hotel */}
        <div className="pt-2">
          <Card className="border-border bg-card shadow-md">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`h-5 w-5 shrink-0 ${
                    todasConcluidas
                      ? 'text-emerald-600'
                      : 'text-muted-foreground'
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {todasConcluidas
                      ? 'Todas as fichas foram preenchidas!'
                      : `${totalPreenchidas} de ${fnrhView.total_hospedes} fichas preenchidas`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Envie os dados concluídos para finalizar seu pré-check-in.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => enviarAoHotelMutation.mutate()}
                disabled={enviarAoHotelMutation.isPending || !todasConcluidas}
                className="w-full sm:w-auto h-9 text-xs"
              >
                {enviarAoHotelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Enviar ao Hotel
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default FnrhPublicaPage

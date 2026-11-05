import type { FichaFnrh, FnrhPublicaView } from '@hotelmind/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    refetch,
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
          procedencia: h.procedencia || '',
          proximo_destino: h.proximo_destino || '',
          responsavel_posicao: h.responsavel_posicao ?? null,
        }
      }
      setFormDataMap(mapa)
    }
  }, [fnrhView])

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
        old => {
          if (!old) return old
          const novosHospedes = old.hospedes.map(h =>
            h.posicao === hospedeAtualizado.posicao ? hospedeAtualizado : h
          )
          return {
            ...old,
            hospedes: novosHospedes,
          }
        }
      )
      toast.success(
        variables.concluir
          ? `Ficha do hóspede ${variables.posicao} validada e salva!`
          : `Rascunho do hóspede ${variables.posicao} salvo com sucesso!`
      )
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Não foi possível salvar os dados deste hóspede. Verifique os campos informados.'
      toast.error(msg)
    },
  })

  const enviarAoHotelMutation = useMutation({
    mutationFn: async () => {
      return reservasService.enviarFnrhAoHotel(publicToken)
    },
    onSuccess: () => {
      setEnvioSucesso(true)
      toast.success('Fichas enviadas ao hotel com sucesso!')
      refetch()
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Não foi possível enviar as fichas. Certifique-se de que todos os hóspedes tenham suas fichas devidamente preenchidas.'
      toast.error(msg)
    },
  })

  const totalPreenchidas = useMemo(() => {
    return (
      fnrhView?.hospedes?.filter(h => h.ficha_status === 'preenchida').length ||
      0
    )
  }, [fnrhView?.hospedes])

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <h2 className="mt-4 text-base font-semibold text-slate-800">
          Carregando Ficha Nacional de Registro de Hóspedes (FNRH)...
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Por favor, aguarde um momento.
        </p>
      </div>
    )
  }

  if (isError || !fnrhView) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Ficha não disponível
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Este link de ficha pode ter expirado, ter sido desativado ou o
          endereço digitado está incorreto. Em caso de dúvidas, entre em contato
          diretamente com o hotel.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 antialiased">
      {/* Top Banner do Hotel */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                {fnrhView.hotel_nome}
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                FNRH • Pré-check-in Digital
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold"
          >
            {totalPreenchidas}/{fnrhView.total_hospedes} preenchida(s)
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-4 space-y-4">
        {/* Banner de Envio Concluído */}
        {(fnrhView.fnrh_enviada_em || envioSucesso) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-emerald-800">
                Dados enviados ao hotel com sucesso!
              </p>
              <p className="text-emerald-700">
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
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Dados da Hospedagem</span>
              <span className="text-xs font-normal text-slate-500">
                Titular:{' '}
                <strong className="text-slate-800">
                  {fnrhView.titular_nome}
                </strong>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-3 text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Período</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                {formatarDataBR(fnrhView.check_in)} a{' '}
                {formatarDataBR(fnrhView.check_out)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">
                Acomodação
              </span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Building className="h-3.5 w-3.5 text-indigo-500" />
                {fnrhView.quarto_identificacao}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Capacidade da reserva:{' '}
                <strong>{fnrhView.total_hospedes} hóspede(s)</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="h-3 w-3" /> Quantidade definida na reserva
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <div className="rounded-lg bg-indigo-50/70 p-3 text-xs text-indigo-900 border border-indigo-100/80 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Preenchimento obrigatório para todos os hóspedes
            </p>
            <p className="text-[11px] text-indigo-800/90 leading-relaxed">
              De acordo com a regulamentação do Ministério do Turismo, cada
              pessoa que se hospedar deve ter sua Ficha Nacional (FNRH)
              individual. Você pode salvar rascunhos e, ao final, tocar em{' '}
              <strong>"Enviar ao hotel"</strong>.
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
                    ? 'border-emerald-200 shadow-xs'
                    : h.ficha_status === 'rascunho'
                      ? 'border-sky-200 shadow-xs'
                      : 'border-slate-200 shadow-xs'
                }`}
              >
                {/* Header do Card (Clicável para expandir/recolher) */}
                <button
                  type="button"
                  onClick={() => setExpandedPosicao(isExpanded ? 0 : h.posicao)}
                  className="w-full text-left p-4 bg-white flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        h.ficha_status === 'preenchida'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.ficha_status === 'rascunho'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {h.posicao}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
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
                      <p className="text-[11px] text-slate-500">
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
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : h.ficha_status === 'rascunho'
                            ? 'bg-sky-50 text-sky-700 border-sky-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {h.ficha_status === 'preenchida'
                        ? 'Preenchida'
                        : h.ficha_status === 'rascunho'
                          ? 'Rascunho'
                          : 'Pendente'}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Corpo do Formulário do Hóspede */}
                {isExpanded && (
                  <CardContent className="p-4 pt-2 border-t border-slate-100 bg-white space-y-4">
                    {/* Seção 1: Identificação */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-600" />
                        Identificação Pessoal
                      </h3>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Nome Completo <span className="text-rose-500">*</span>
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
                            <span className="text-rose-500">*</span>
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
                            <span className="text-rose-500">*</span>
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
                            <span className="text-rose-500">*</span>
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
                        <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            <Info className="h-3.5 w-3.5 text-amber-600" />
                            Hóspede menor de 18 anos
                          </p>
                          <p className="text-[11px] text-amber-800">
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
                            <SelectTrigger className="h-8 text-xs bg-white">
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
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5 text-indigo-600" />
                        Contato e Residência
                      </h3>

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
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
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

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Cidade de Procedência
                          </Label>
                          <Input
                            placeholder="De onde veio?"
                            value={dados.procedencia || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'procedencia',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Próximo Destino</Label>
                          <Input
                            placeholder="Para onde vai após a estadia?"
                            value={dados.proximo_destino || ''}
                            onChange={e =>
                              handleFieldChange(
                                h.posicao,
                                'proximo_destino',
                                e.target.value
                              )
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ações do Hóspede */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs gap-1.5 h-9"
                        disabled={salvarFichaMutation.isPending}
                        onClick={() =>
                          salvarFichaMutation.mutate({
                            posicao: h.posicao,
                            dados,
                            concluir: false,
                          })
                        }
                      >
                        <Save className="h-3.5 w-3.5" />
                        Salvar Rascunho
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto text-xs gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white ml-auto"
                        disabled={salvarFichaMutation.isPending}
                        onClick={() =>
                          salvarFichaMutation.mutate({
                            posicao: h.posicao,
                            dados,
                            concluir: true,
                          })
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                        Concluir Ficha deste Hóspede
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Aviso LGPD */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-[11px] text-slate-500 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Privacidade e Proteção de Dados (LGPD)
          </div>
          <p className="leading-relaxed">
            Seus dados são coletados exclusivamente para a emissão da Ficha
            Nacional de Registro de Hóspedes (FNRH), conforme determinação legal
            do Ministério do Turismo (Lei nº 11.771/2008), tratados com sigilo e
            segurança nos termos da LGPD (Lei nº 13.709/2018).
          </p>
        </div>
      </main>

      {/* Barra Fixa Inferior de Envio */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-slate-800">
              {totalPreenchidas} de {fnrhView.total_hospedes} preenchida(s)
            </p>
            <p className="text-[11px] text-slate-500">
              {totalPreenchidas === fnrhView.total_hospedes
                ? 'Todas as fichas prontas para envio!'
                : 'Conclua todas as fichas para enviar'}
            </p>
          </div>

          <Button
            type="button"
            className="h-10 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-5"
            disabled={
              totalPreenchidas < fnrhView.total_hospedes ||
              enviarAoHotelMutation.isPending
            }
            onClick={() => enviarAoHotelMutation.mutate()}
          >
            {enviarAoHotelMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar ao Hotel
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}

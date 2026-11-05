import type {
  CreateParceiroComercialPayload,
  ParceiroContatoItem,
  TipoParceiro,
  TipoPessoa,
} from '@hotelmind/contracts'
import { Building2, Globe, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CrudFormLayout } from '@/components/forms/CrudFormLayout'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ContatosFormSection } from './contatos_form_section'
import {
  type RegrasComerciaisData,
  RegrasComerciaisFormSection,
} from './regras_comerciais_form_section'

export interface ParceiroFormState extends CreateParceiroComercialPayload {
  contatos: ParceiroContatoItem[]
}

interface ParceiroFormProps {
  title: string
  backTo: string
  cardTitle?: string
  initialData?: Partial<ParceiroFormState>
  onSubmit: (data: ParceiroFormState) => void
  isSubmitting?: boolean
  submitLabel?: string
  submitButtonNode?: React.ReactNode
}

export function ParceiroForm({
  title,
  backTo,
  cardTitle,
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = 'Salvar Parceiro',
  submitButtonNode,
}: ParceiroFormProps) {
  const [tipoParceiro, setTipoParceiro] = useState<TipoParceiro>(
    initialData?.tipo_parceiro ?? 'agencia_viagens'
  )
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(
    initialData?.tipo_pessoa ?? 'PJ'
  )
  const [razaoSocial, setRazaoSocial] = useState(
    initialData?.razao_social ?? ''
  )
  const [nomeFantasia, setNomeFantasia] = useState(
    initialData?.nome_fantasia ?? ''
  )
  const [documento, setDocumento] = useState(initialData?.documento ?? '')
  const [inscricaoEstadual, setInscricaoEstadual] = useState(
    initialData?.inscricao_estadual ?? ''
  )
  const [estrangeiro, setEstrangeiro] = useState(
    initialData?.estrangeiro ?? false
  )
  const [cadastur, setCadastur] = useState(initialData?.cadastur ?? '')
  const [codigoIata, setCodigoIata] = useState(initialData?.codigo_iata ?? '')
  const [registroEmbratur, setRegistroEmbratur] = useState(
    initialData?.registro_embratur ?? ''
  )

  // Endereço
  const [cep, setCep] = useState(initialData?.cep ?? '')
  const [logradouro, setLogradouro] = useState(initialData?.logradouro ?? '')
  const [numero, setNumero] = useState(initialData?.numero ?? '')
  const [complemento, setComplemento] = useState(initialData?.complemento ?? '')
  const [bairro, setBairro] = useState(initialData?.bairro ?? '')
  const [cidade, setCidade] = useState(initialData?.cidade ?? '')
  const [estado, setEstado] = useState(initialData?.estado ?? '')
  const [pais, setPais] = useState(initialData?.pais ?? 'Brasil')

  // Regras Comerciais
  const [regras, setRegras] = useState<RegrasComerciaisData>({
    modelo_tarifario: initialData?.modelo_tarifario ?? 'comissionada',
    comissao_padrao: Number(initialData?.comissao_padrao ?? 0),
    politica_faturamento: initialData?.politica_faturamento ?? 'prepago',
    prazo_pagamento_dias: initialData?.prazo_pagamento_dias ?? 0,
    limite_credito: Number(initialData?.limite_credito ?? 0),
    allotment_quartos: initialData?.allotment_quartos ?? 0,
  })

  // Contatos & Observações
  const [contatos, setContatos] = useState<ParceiroContatoItem[]>(
    initialData?.contatos ?? []
  )
  const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? '')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Ajusta automaticamente o tipo de pessoa ao selecionar Agente Autônomo
  useEffect(() => {
    if (tipoParceiro === 'agente_autonomo') {
      setTipoPessoa('PF')
    } else if (
      tipoParceiro === 'agencia_viagens' ||
      tipoParceiro === 'operadora_turismo' ||
      tipoParceiro === 'empresa_corporativa'
    ) {
      setTipoPessoa('PJ')
    }
  }, [tipoParceiro])

  // Atualiza se initialData mudar (em edição)
  useEffect(() => {
    if (initialData) {
      if (initialData.tipo_parceiro) setTipoParceiro(initialData.tipo_parceiro)
      if (initialData.tipo_pessoa) setTipoPessoa(initialData.tipo_pessoa)
      if (initialData.razao_social !== undefined)
        setRazaoSocial(initialData.razao_social)
      if (initialData.nome_fantasia !== undefined)
        setNomeFantasia(initialData.nome_fantasia ?? '')
      if (initialData.documento !== undefined)
        setDocumento(initialData.documento ?? '')
      if (initialData.inscricao_estadual !== undefined)
        setInscricaoEstadual(initialData.inscricao_estadual ?? '')
      if (initialData.estrangeiro !== undefined)
        setEstrangeiro(initialData.estrangeiro)
      if (initialData.cadastur !== undefined)
        setCadastur(initialData.cadastur ?? '')
      if (initialData.codigo_iata !== undefined)
        setCodigoIata(initialData.codigo_iata ?? '')
      if (initialData.registro_embratur !== undefined)
        setRegistroEmbratur(initialData.registro_embratur ?? '')

      if (initialData.cep !== undefined) setCep(initialData.cep ?? '')
      if (initialData.logradouro !== undefined)
        setLogradouro(initialData.logradouro ?? '')
      if (initialData.numero !== undefined) setNumero(initialData.numero ?? '')
      if (initialData.complemento !== undefined)
        setComplemento(initialData.complemento ?? '')
      if (initialData.bairro !== undefined) setBairro(initialData.bairro ?? '')
      if (initialData.cidade !== undefined) setCidade(initialData.cidade ?? '')
      if (initialData.estado !== undefined) setEstado(initialData.estado ?? '')
      if (initialData.pais !== undefined) setPais(initialData.pais ?? 'Brasil')

      if (initialData.observacoes !== undefined)
        setObservacoes(initialData.observacoes ?? '')
      if (initialData.contatos !== undefined)
        setContatos(initialData.contatos ?? [])

      setRegras({
        modelo_tarifario: initialData.modelo_tarifario ?? 'comissionada',
        comissao_padrao: Number(initialData.comissao_padrao ?? 0),
        politica_faturamento: initialData.politica_faturamento ?? 'prepago',
        prazo_pagamento_dias: initialData.prazo_pagamento_dias ?? 0,
        limite_credito: Number(initialData.limite_credito ?? 0),
        allotment_quartos: initialData.allotment_quartos ?? 0,
      })
    }
  }, [initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (!razaoSocial.trim()) {
      setErrorMsg(
        tipoPessoa === 'PF'
          ? 'Nome completo é obrigatório.'
          : 'Razão social é obrigatória.'
      )
      return
    }

    if (!estrangeiro && !documento.trim()) {
      setErrorMsg(
        tipoPessoa === 'PF'
          ? 'Informe um CPF válido.'
          : 'Informe um CNPJ válido.'
      )
      return
    }

    onSubmit({
      tipo_parceiro: tipoParceiro,
      tipo_pessoa: tipoPessoa,
      razao_social: razaoSocial.trim(),
      nome_fantasia: nomeFantasia.trim() || null,
      documento: documento.trim() || null,
      inscricao_estadual: inscricaoEstadual.trim() || null,
      estrangeiro,
      cadastur: cadastur.trim() || null,
      codigo_iata: codigoIata.trim() || null,
      registro_embratur: registroEmbratur.trim() || null,

      logradouro: logradouro.trim() || null,
      numero: numero.trim() || null,
      complemento: complemento.trim() || null,
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      estado: estado.trim().toUpperCase() || null,
      cep: cep.trim() || null,
      pais: pais.trim() || 'Brasil',

      ...regras,
      contatos,
      observacoes: observacoes.trim() || null,
    })
  }

  return (
    <CrudFormLayout
      title={title}
      backTo={backTo}
      cardTitle={cardTitle}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      actions={submitButtonNode}
      submitLabel={submitLabel}
    >
      <div className="flex flex-col gap-6">
        {errorMsg && (
          <div className="bg-destructive/15 text-destructive p-3.5 rounded-md text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. Identificação e Classificação */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Identificação e Classificação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de Parceiro *</Label>
              <Select
                value={tipoParceiro}
                onValueChange={v => setTipoParceiro(v as TipoParceiro)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agente_autonomo">
                    Agente Autônomo / Consultor (Pessoa Física)
                  </SelectItem>
                  <SelectItem value="agencia_viagens">
                    Agência de Viagens (Lazer / Corporativa / TMC)
                  </SelectItem>
                  <SelectItem value="operadora_turismo">
                    Operadora de Turismo (Wholesaler / Receptivo)
                  </SelectItem>
                  <SelectItem value="clube_turismo">
                    Clube de Turismo / Férias (ex: Bancorbrás, RDC, Candeias)
                  </SelectItem>
                  <SelectItem value="empresa_corporativa">
                    Empresa Corporativa (Faturamento Direto)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Natureza Fiscal</Label>
              <Select
                value={tipoPessoa}
                onValueChange={v => setTipoPessoa(v as TipoPessoa)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                  <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="estrangeiro"
                checked={estrangeiro}
                onCheckedChange={v => setEstrangeiro(Boolean(v))}
              />
              <Label htmlFor="estrangeiro" className="cursor-pointer">
                Parceiro Estrangeiro / Internacional (sem CPF/CNPJ)
              </Label>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="razao_social">
                {tipoPessoa === 'PF' ? 'Nome Completo *' : 'Razão Social *'}
              </Label>
              <Input
                id="razao_social"
                value={razaoSocial}
                onChange={e => setRazaoSocial(e.target.value)}
                placeholder={
                  tipoPessoa === 'PF'
                    ? 'Nome completo do consultor de viagens'
                    : 'Razão social registrada da empresa'
                }
              />
            </div>

            {tipoPessoa === 'PJ' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={nomeFantasia}
                  onChange={e => setNomeFantasia(e.target.value)}
                  placeholder="Nome comercial da agência/operadora"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="documento">
                {estrangeiro
                  ? 'Tax ID / Identificador Fiscal Estrangeiro'
                  : tipoPessoa === 'PF'
                    ? 'CPF *'
                    : 'CNPJ *'}
              </Label>
              <Input
                id="documento"
                value={documento}
                onChange={e => setDocumento(e.target.value)}
                placeholder={
                  estrangeiro
                    ? 'Ex: US-TAX-98765'
                    : tipoPessoa === 'PF'
                      ? '000.000.000-00'
                      : '00.000.000/0000-00'
                }
              />
            </div>

            {tipoPessoa === 'PJ' && !estrangeiro && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                <Input
                  id="inscricao_estadual"
                  value={inscricaoEstadual}
                  onChange={e => setInscricaoEstadual(e.target.value)}
                  placeholder="Isento ou número da IE"
                />
              </div>
            )}
          </div>
        </section>

        {/* 2. Órgãos Reguladores e Credenciamento */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Registros em Órgãos Reguladores do Turismo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cadastur">Número CADASTUR</Label>
              <Input
                id="cadastur"
                value={cadastur}
                onChange={e => setCadastur(e.target.value)}
                placeholder="Ex: 19.012.345/0001-99"
              />
              <p className="text-xs text-muted-foreground">
                Registro no Ministério do Turismo do Brasil.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo_iata">Código IATA / IATAN</Label>
              <Input
                id="codigo_iata"
                value={codigoIata}
                onChange={e => setCodigoIata(e.target.value)}
                placeholder="Ex: 99-9 9999 0"
              />
              <p className="text-xs text-muted-foreground">
                Identificador internacional de agências e consolidadoras.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registro_embratur">
                Registro Embratur / Outros
              </Label>
              <Input
                id="registro_embratur"
                value={registroEmbratur}
                onChange={e => setRegistroEmbratur(e.target.value)}
                placeholder="Código institucional ou conveniado"
              />
            </div>
          </div>
        </section>

        {/* 3. Endereço */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Endereço Postal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cep">CEP / Código Postal</Label>
              <Input
                id="cep"
                value={cep}
                onChange={e => setCep(e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="logradouro">Logradouro / Rua</Label>
              <Input
                id="logradouro"
                value={logradouro}
                onChange={e => setLogradouro(e.target.value)}
                placeholder="Rua, Avenida, Praça..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={numero}
                onChange={e => setNumero(e.target.value)}
                placeholder="123 ou S/N"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
                placeholder="Sala, Andar, Bloco"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estado">Estado / UF</Label>
              <Input
                id="estado"
                maxLength={2}
                value={estado}
                onChange={e => setEstado(e.target.value)}
                placeholder="SP"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={pais}
                onChange={e => setPais(e.target.value)}
                placeholder="Brasil"
              />
            </div>
          </div>
        </section>

        {/* 4. Regras Comerciais */}
        <RegrasComerciaisFormSection value={regras} onChange={setRegras} />

        {/* 5. Contatos Segregados */}
        <ContatosFormSection contatos={contatos} onChange={setContatos} />

        {/* 6. Observações Operacionais */}
        <section className="space-y-4 border-t pt-6">
          <h3 className="text-base font-semibold">
            Observações Comerciais & Restrições
          </h3>
          <Textarea
            rows={3}
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Anotações internas sobre acordos, restrições sazonais ou particularidades deste canal..."
          />
        </section>
      </div>
    </CrudFormLayout>
  )
}

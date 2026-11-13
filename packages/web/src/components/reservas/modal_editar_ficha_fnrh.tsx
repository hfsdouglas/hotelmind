import type {
  FichaFnrh,
  ReservaHospede,
  SaveFichaPayload,
} from '@hotelmind/contracts'
import { Button } from '@hotelmind/ui'
import { Compass, Copy, MapPin, Phone, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mask_phone } from '@/hooks/use_phone_mask'

interface ModalEditarFichaFnrhProps {
  open: boolean
  hospede: ReservaHospede | null
  hospedePrincipal?: ReservaHospede | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { posicao: number; data: SaveFichaPayload }) => void
  isPending: boolean
}

export function ModalEditarFichaFnrh({
  open,
  hospede,
  hospedePrincipal,
  onOpenChange,
  onSubmit,
  isPending,
}: ModalEditarFichaFnrhProps) {
  const [formDataFicha, setFormDataFicha] = useState<Partial<FichaFnrh>>({})

  useEffect(() => {
    if (hospede) {
      setFormDataFicha({
        nome_completo: hospede.nome_completo || '',
        nacionalidade: hospede.nacionalidade || 'Brasileira',
        data_nascimento: hospede.data_nascimento || '',
        sexo: hospede.sexo || '',
        profissao: hospede.profissao || '',
        tipo_documento: hospede.tipo_documento || 'cpf',
        numero_documento: hospede.numero_documento || '',
        logradouro: hospede.logradouro || '',
        numero_endereco: hospede.numero_endereco || '',
        complemento: hospede.complemento || '',
        bairro: hospede.bairro || '',
        cidade: hospede.cidade || '',
        estado: hospede.estado || '',
        cep: hospede.cep || '',
        pais_residencia: hospede.pais_residencia || 'Brasil',
        telefone: hospede.telefone || '',
        email: hospede.email || '',
        motivo_viagem: hospede.motivo_viagem || 'Lazer',
        meio_transporte: hospede.meio_transporte || 'Automóvel',
        responsavel_posicao: hospede.responsavel_posicao || null,
      })
    } else {
      setFormDataFicha({})
    }
  }, [hospede])

  const copiarEnderecoPrincipal = () => {
    if (!hospedePrincipal) {
      toast.error('Dados do hóspede principal não disponíveis.')
      return
    }
    setFormDataFicha(prev => ({
      ...prev,
      cep: hospedePrincipal.cep || prev.cep,
      logradouro: hospedePrincipal.logradouro || prev.logradouro,
      numero_endereco: hospedePrincipal.numero_endereco || prev.numero_endereco,
      complemento: hospedePrincipal.complemento || prev.complemento,
      bairro: hospedePrincipal.bairro || prev.bairro,
      cidade: hospedePrincipal.cidade || prev.cidade,
      estado: hospedePrincipal.estado || prev.estado,
      pais_residencia: hospedePrincipal.pais_residencia || prev.pais_residencia,
    }))
    toast.success('Endereço do hóspede principal copiado com sucesso!')
  }

  const handleSalvar = (concluir = false) => {
    if (!hospede) return
    onSubmit({
      posicao: hospede.posicao,
      data: {
        ...formDataFicha,
        concluir,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ficha FNRH -{' '}
            {hospede?.posicao === 1
              ? 'Hóspede Titular'
              : `Hóspede ${hospede?.posicao}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Preencha ou atualize as informações cadastrais exigidas pela Ficha
            Nacional de Registro de Hóspedes (FNRH).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2 text-xs">
          {/* SESSÃO 1: DADOS DO HÓSPEDE */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Dados do Hóspede
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="fnrh_nome">Nome Completo *</Label>
                <Input
                  id="fnrh_nome"
                  value={formDataFicha.nome_completo || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      nome_completo: e.target.value,
                    }))
                  }
                  placeholder="Nome completo do hóspede"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_nacionalidade">Nacionalidade *</Label>
                <Input
                  id="fnrh_nacionalidade"
                  value={formDataFicha.nacionalidade || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      nacionalidade: e.target.value,
                    }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_nascimento">Data de Nascimento *</Label>
                <Input
                  id="fnrh_nascimento"
                  type="date"
                  value={formDataFicha.data_nascimento || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      data_nascimento: e.target.value,
                    }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_sexo">Gênero / Sexo *</Label>
                <Select
                  value={formDataFicha.sexo || ''}
                  onValueChange={val =>
                    setFormDataFicha(p => ({ ...p, sexo: val }))
                  }
                >
                  <SelectTrigger id="fnrh_sexo" className="h-9">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_profissao">Profissão *</Label>
                <Input
                  id="fnrh_profissao"
                  value={formDataFicha.profissao || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({ ...p, profissao: e.target.value }))
                  }
                  placeholder="Ocupação / Profissão"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_tipo_doc">Tipo de Documento *</Label>
                <Select
                  value={formDataFicha.tipo_documento || 'cpf'}
                  onValueChange={val =>
                    setFormDataFicha(p => ({
                      ...p,
                      tipo_documento: val as FichaFnrh['tipo_documento'],
                    }))
                  }
                >
                  <SelectTrigger id="fnrh_tipo_doc" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="rg">RG</SelectItem>
                    <SelectItem value="passaporte">Passaporte</SelectItem>
                    <SelectItem value="outro">Outro Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_numero_doc">Número do Documento *</Label>
                <Input
                  id="fnrh_numero_doc"
                  value={formDataFicha.numero_documento || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      numero_documento: e.target.value,
                    }))
                  }
                  placeholder="Número oficial"
                  className="h-9"
                />
              </div>
            </div>
          </section>

          {/* SESSÃO 2: CONTATO */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Informações de Contato
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fnrh_telefone">Celular / WhatsApp *</Label>
                <Input
                  id="fnrh_telefone"
                  value={formDataFicha.telefone || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      telefone: mask_phone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_email">E-mail *</Label>
                <div className="relative">
                  <Input
                    id="fnrh_email"
                    type="email"
                    value={formDataFicha.email || ''}
                    onChange={e =>
                      setFormDataFicha(p => ({ ...p, email: e.target.value }))
                    }
                    placeholder="hospede@exemplo.com"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SESSÃO 3: ENDEREÇO */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                  Endereço Residencial
                </h3>
              </div>
              {hospede && hospede.posicao > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copiarEnderecoPrincipal}
                  className="h-7 text-xs gap-1.5"
                >
                  <Copy className="size-3" />
                  Copiar do hóspede principal
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fnrh_cep">CEP</Label>
                <Input
                  id="fnrh_cep"
                  value={formDataFicha.cep || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({ ...p, cep: e.target.value }))
                  }
                  placeholder="00000-000"
                  className="h-9"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="fnrh_logradouro">Logradouro / Rua *</Label>
                <Input
                  id="fnrh_logradouro"
                  value={formDataFicha.logradouro || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      logradouro: e.target.value,
                    }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_numero">Número *</Label>
                <Input
                  id="fnrh_numero"
                  value={formDataFicha.numero_endereco || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      numero_endereco: e.target.value,
                    }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_complemento">Complemento</Label>
                <Input
                  id="fnrh_complemento"
                  value={formDataFicha.complemento || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      complemento: e.target.value,
                    }))
                  }
                  placeholder="Apto, Bloco..."
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_bairro">Bairro *</Label>
                <Input
                  id="fnrh_bairro"
                  value={formDataFicha.bairro || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({ ...p, bairro: e.target.value }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_cidade">Cidade *</Label>
                <Input
                  id="fnrh_cidade"
                  value={formDataFicha.cidade || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({ ...p, cidade: e.target.value }))
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_estado">Estado / UF *</Label>
                <Input
                  id="fnrh_estado"
                  value={formDataFicha.estado || ''}
                  onChange={e =>
                    setFormDataFicha(p => ({ ...p, estado: e.target.value }))
                  }
                  placeholder="MG, SP..."
                  maxLength={2}
                  className="h-9 uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_pais">País *</Label>
                <Input
                  id="fnrh_pais"
                  value={formDataFicha.pais_residencia || 'Brasil'}
                  onChange={e =>
                    setFormDataFicha(p => ({
                      ...p,
                      pais_residencia: e.target.value,
                    }))
                  }
                  className="h-9"
                />
              </div>
            </div>
          </section>

          {/* SESSÃO 4: OUTROS / VIAGEM */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border">
              <Compass className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Dados da Viagem e Procedência
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fnrh_motivo">Motivo da Viagem *</Label>
                <Select
                  value={formDataFicha.motivo_viagem || 'Lazer / Férias'}
                  onValueChange={val =>
                    setFormDataFicha(p => ({ ...p, motivo_viagem: val }))
                  }
                >
                  <SelectTrigger id="fnrh_motivo" className="h-9">
                    <SelectValue />
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
                    <SelectItem value="Parentes / Amigos">
                      Parentes / Amigos
                    </SelectItem>
                    <SelectItem value="Estudos / Cursos">
                      Estudos / Cursos
                    </SelectItem>
                    <SelectItem value="Saúde / Tratamento">
                      Saúde / Tratamento
                    </SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fnrh_transporte">Meio de Transporte *</Label>
                <Select
                  value={formDataFicha.meio_transporte || 'Automóvel'}
                  onValueChange={val =>
                    setFormDataFicha(p => ({ ...p, meio_transporte: val }))
                  }
                >
                  <SelectTrigger id="fnrh_transporte" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automóvel">Automóvel</SelectItem>
                    <SelectItem value="Avião">Avião</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                    <SelectItem value="Trem">Trem</SelectItem>
                    <SelectItem value="Embarcação">Embarcação</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSalvar(false)}
            disabled={isPending}
            className="text-xs h-9"
          >
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            onClick={() => handleSalvar(true)}
            disabled={isPending}
            className="text-xs h-9"
          >
            {isPending ? 'Salvando...' : 'Concluir Ficha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

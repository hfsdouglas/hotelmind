import type {
  FichaFnrh,
  ReservaHospede,
  SaveFichaPayload,
} from '@hotelmind/contracts'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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

interface ModalEditarFichaFnrhProps {
  open: boolean
  hospede: ReservaHospede | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { posicao: number; data: SaveFichaPayload }) => void
  isPending: boolean
}

export function ModalEditarFichaFnrh({
  open,
  hospede,
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
        procedencia: hospede.procedencia || '',
        proximo_destino: hospede.proximo_destino || '',
        responsavel_posicao: hospede.responsavel_posicao || null,
      })
    } else {
      setFormDataFicha({})
    }
  }, [hospede])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            FNRH -{' '}
            {hospede?.posicao === 1 ? 'Titular' : `Hóspede ${hospede?.posicao}`}
          </DialogTitle>
          <DialogDescription>
            Preencha ou atualize as informações cadastrais exigidas pela Ficha
            Nacional de Registro de Hóspedes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <Label>Nome Completo *</Label>
            <Input
              value={formDataFicha.nome_completo || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  nome_completo: e.target.value,
                }))
              }
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-1">
            <Label>Nacionalidade *</Label>
            <Input
              value={formDataFicha.nacionalidade || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  nacionalidade: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Data de Nascimento *</Label>
            <Input
              type="date"
              value={formDataFicha.data_nascimento || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  data_nascimento: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Gênero / Sexo *</Label>
            <Input
              value={formDataFicha.sexo || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, sexo: e.target.value }))
              }
              placeholder="Masculino / Feminino / Outro"
            />
          </div>

          <div className="space-y-1">
            <Label>Profissão *</Label>
            <Input
              value={formDataFicha.profissao || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, profissao: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Tipo de Documento *</Label>
            <select
              value={formDataFicha.tipo_documento || 'cpf'}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  tipo_documento: e.target.value as FichaFnrh['tipo_documento'],
                }))
              }
              className="w-full px-3 py-2 border rounded-md text-xs bg-white dark:bg-zinc-950 border-zinc-200"
            >
              <option value="cpf">CPF</option>
              <option value="rg">RG</option>
              <option value="passaporte">Passaporte</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Número do Documento *</Label>
            <Input
              value={formDataFicha.numero_documento || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  numero_documento: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input
              value={formDataFicha.telefone || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, telefone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={formDataFicha.email || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>País de Residência *</Label>
            <Input
              value={formDataFicha.pais_residencia || 'Brasil'}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  pais_residencia: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Cidade *</Label>
            <Input
              value={formDataFicha.cidade || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, cidade: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Estado (UF de 2 letras) *</Label>
            <Input
              maxLength={2}
              value={formDataFicha.estado || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  estado: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Logradouro *</Label>
            <Input
              value={formDataFicha.logradouro || ''}
              onChange={e =>
                setFormDataFicha(p => ({ ...p, logradouro: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Motivo da Viagem *</Label>
            <Input
              value={formDataFicha.motivo_viagem || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  motivo_viagem: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Meio de Transporte *</Label>
            <Input
              value={formDataFicha.meio_transporte || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  meio_transporte: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Procedência *</Label>
            <Input
              value={formDataFicha.procedencia || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  procedencia: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Próximo Destino *</Label>
            <Input
              value={formDataFicha.proximo_destino || ''}
              onChange={e =>
                setFormDataFicha(p => ({
                  ...p,
                  proximo_destino: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (hospede) {
                onSubmit({
                  posicao: hospede.posicao,
                  // biome-ignore lint/suspicious/noExplicitAny: form payload
                  data: { ...(formDataFicha as any), concluir: false },
                })
              }
            }}
            disabled={isPending}
          >
            Salvar como Rascunho
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (hospede) {
                onSubmit({
                  posicao: hospede.posicao,
                  // biome-ignore lint/suspicious/noExplicitAny: form payload
                  data: { ...(formDataFicha as any), concluir: true },
                })
              }
            }}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Concluir Ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

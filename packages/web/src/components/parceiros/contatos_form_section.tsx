import type {
  ParceiroContatoItem,
  TipoContatoParceiro,
} from '@hotelmind/contracts'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ContatosFormSectionProps {
  contatos: ParceiroContatoItem[]
  onChange: (contatos: ParceiroContatoItem[]) => void
}

export function ContatosFormSection({
  contatos,
  onChange,
}: ContatosFormSectionProps) {
  const [tipoContato, setTipoContato] =
    useState<TipoContatoParceiro>('comercial')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function handleAdd() {
    setErro(null)
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      setErro('Preencha ao menos Nome, E-mail e Telefone do contato.')
      return
    }

    const novo: ParceiroContatoItem = {
      tipo_contato: tipoContato,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      cargo: cargo.trim() || null,
    }

    onChange([...contatos, novo])
    setNome('')
    setEmail('')
    setTelefone('')
    setCargo('')
  }

  function handleRemove(index: number) {
    const list = [...contatos]
    list.splice(index, 1)
    onChange(list)
  }

  return (
    <section className="space-y-4 border-t pt-6">
      <h3 className="text-base font-semibold flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" />
        Contatos do Parceiro
      </h3>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-muted/40 p-4 rounded-lg border">
          <div className="flex flex-col gap-1.5">
            <Label>Área / Finalidade</Label>
            <Select
              value={tipoContato}
              onValueChange={v => setTipoContato(v as TipoContatoParceiro)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="financeiro">
                  Financeiro / Cobrança
                </SelectItem>
                <SelectItem value="operacional">
                  Operações / Reservas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contato-nome">Nome *</Label>
            <Input
              id="contato-nome"
              placeholder="Ex: Carlos Silva"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contato-email">E-mail *</Label>
            <Input
              id="contato-email"
              type="email"
              placeholder="carlos@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contato-tel">Telefone / WhatsApp *</Label>
            <Input
              id="contato-tel"
              placeholder="(11) 98888-7777"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="contato-cargo">Cargo</Label>
              <Input
                id="contato-cargo"
                placeholder="Ex: Gerente Comercial"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAdd}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        {contatos.length > 0 ? (
          <div className="flex flex-col divide-y border rounded-md">
            {contatos.map((c, idx) => (
              <div
                key={c.id || `${c.nome}-${idx}`}
                className="flex items-center justify-between p-3.5 hover:bg-muted/20"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={
                      c.tipo_contato === 'comercial'
                        ? 'default'
                        : c.tipo_contato === 'financeiro'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {c.tipo_contato === 'comercial'
                      ? 'Comercial'
                      : c.tipo_contato === 'financeiro'
                        ? 'Financeiro'
                        : 'Operacional'}
                  </Badge>
                  <span className="font-medium text-sm">{c.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    {c.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {c.telefone}
                  </span>
                  {c.cargo && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {c.cargo}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nenhum contato adicionado ainda. Adicione contatos comerciais ou
            financeiros acima.
          </p>
        )}
      </div>
    </section>
  )
}

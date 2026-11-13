import type { ParceiroComercial, StatusParceiro } from '@hotelmind/contracts'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hotelmind/ui'
import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface ModalStatusParceiroProps {
  parceiro: ParceiroComercial | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: StatusParceiro, motivo?: string | null) => Promise<void>
  isPending: boolean
}

export function ModalStatusParceiro({
  parceiro,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: ModalStatusParceiroProps) {
  const [status, setStatus] = useState<StatusParceiro>('ativo')
  const [motivo, setMotivo] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (parceiro) {
      setStatus(parceiro.status)
      setMotivo(parceiro.motivo_bloqueio || '')
      setErrorMsg(null)
    }
  }, [parceiro])

  async function handleSave() {
    setErrorMsg(null)
    if (status === 'bloqueado' && !motivo.trim()) {
      setErrorMsg('Informe o motivo do bloqueio do parceiro comercial.')
      return
    }

    try {
      await onConfirm(status, status === 'bloqueado' ? motivo.trim() : null)
      onOpenChange(false)
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      setErrorMsg(
        errorObj.response?.data?.message || 'Erro ao atualizar status.'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status do Parceiro</DialogTitle>
          <DialogDescription>
            Defina o status operacional de{' '}
            <strong className="text-foreground">
              {parceiro?.razao_social}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {errorMsg && (
            <p className="text-sm text-destructive bg-destructive/10 p-2.5 rounded">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Novo Status</Label>
            <Select
              value={status}
              onValueChange={v => setStatus(v as StatusParceiro)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo (Operação Normal)</SelectItem>
                <SelectItem value="inativo">
                  Inativo (Pausa Operacional)
                </SelectItem>
                <SelectItem value="bloqueado">
                  Bloqueado (Restrição Comercial/Financeira)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'bloqueado' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-bloqueio">Motivo do Bloqueio *</Label>
              <Textarea
                id="motivo-bloqueio"
                rows={3}
                placeholder="Ex: Inadimplência de faturas, pendência de documentação..."
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar Alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

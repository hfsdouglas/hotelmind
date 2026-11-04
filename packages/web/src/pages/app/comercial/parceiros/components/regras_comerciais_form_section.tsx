import type { ModeloTarifario, PoliticaFaturamento } from '@hotelmind/contracts'
import { BadgeDollarSign } from 'lucide-react'
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

export interface RegrasComerciaisData {
  modelo_tarifario: ModeloTarifario
  comissao_padrao: number
  politica_faturamento: PoliticaFaturamento
  prazo_pagamento_dias: number
  limite_credito: number
  allotment_quartos: number
}

interface RegrasComerciaisFormSectionProps {
  value: RegrasComerciaisData
  onChange: (value: RegrasComerciaisData) => void
}

export function RegrasComerciaisFormSection({
  value,
  onChange,
}: RegrasComerciaisFormSectionProps) {
  function update<K extends keyof RegrasComerciaisData>(
    field: K,
    val: RegrasComerciaisData[K]
  ) {
    onChange({ ...value, [field]: val })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-primary" />
          Regras Comerciais & Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <Label>Modelo Tarifário Padrão</Label>
          <Select
            value={value.modelo_tarifario}
            onValueChange={v =>
              update('modelo_tarifario', v as ModeloTarifario)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comissionada">Tarifa Comissionada</SelectItem>
              <SelectItem value="net">
                Tarifa Net (Líquida / Operadora)
              </SelectItem>
              <SelectItem value="acordo">Tarifa Acordo / Negociada</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Critério base para cálculo de valores nas reservas deste canal.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="comissao_padrao">Comissão Padrão (%)</Label>
          <Input
            id="comissao_padrao"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={value.comissao_padrao}
            onChange={e =>
              update('comissao_padrao', Number.parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-xs text-muted-foreground">
            Percentual padrão repassado ao parceiro em reservas comissionadas.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Política de Faturamento</Label>
          <Select
            value={value.politica_faturamento}
            onValueChange={v =>
              update('politica_faturamento', v as PoliticaFaturamento)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prepago">
                Pré-pago (Check-in após quitação)
              </SelectItem>
              <SelectItem value="faturado">
                Faturado a prazo (Boleto/Fatura)
              </SelectItem>
              <SelectItem value="voucher">
                Voucher (Operadora / Clube de Turismo)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prazo_pagamento_dias">
            Prazo de Pagamento (dias)
          </Label>
          <Input
            id="prazo_pagamento_dias"
            type="number"
            min="0"
            value={value.prazo_pagamento_dias}
            onChange={e =>
              update(
                'prazo_pagamento_dias',
                Number.parseInt(e.target.value, 10) || 0
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            Dias para liquidação após o check-out ou emissão da fatura.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="limite_credito">Limite de Crédito (R$)</Label>
          <Input
            id="limite_credito"
            type="number"
            step="0.01"
            min="0"
            value={value.limite_credito}
            onChange={e =>
              update('limite_credito', Number.parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-xs text-muted-foreground">
            Saldo máximo permitido em reservas abertas sem quitação.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="allotment_quartos">
            Allotment Contratual (quartos)
          </Label>
          <Input
            id="allotment_quartos"
            type="number"
            min="0"
            value={value.allotment_quartos}
            onChange={e =>
              update(
                'allotment_quartos',
                Number.parseInt(e.target.value, 10) || 0
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            Cota de quartos bloqueados em garantia contratual para este
            parceiro.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

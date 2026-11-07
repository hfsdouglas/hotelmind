import { FileText } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

interface SecaoApresentacaoProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoApresentacao({ form }: SecaoApresentacaoProps) {
  const descricaoCurta = form.watch('descricao_curta') || ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <FileText className="h-5 w-5" />
        <h3>2. Apresentação & Slogan</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Descrições exibidas em páginas públicas, vouchers e motores de busca.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="descricao_curta"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Descrição Resumida / Slogan</FormLabel>
                <span className="text-xs text-muted-foreground">
                  {descricaoCurta.length}/160 caracteres
                </span>
              </div>
              <FormControl>
                <Input
                  maxLength={160}
                  placeholder="Ex: O seu refúgio de paz e tranquilidade em meio à natureza."
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao_completa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Completa Institucional</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Apresente detalhadamente a história, proposta e diferenciais do hotel..."
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

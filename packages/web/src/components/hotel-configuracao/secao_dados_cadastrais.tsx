import { Building2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

interface SecaoDadosCadastraisProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
}

export function SecaoDadosCadastrais({ form }: SecaoDadosCadastraisProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-semibold text-base border-b pb-2">
        <Building2 className="h-5 w-5" />
        <h3>1. Dados Cadastrais & Contato</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Informações corporativas e comerciais oficiais do estabelecimento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="nome_hotel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Corporativo *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Hotel Paradiso SA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome_fantasia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Paradiso Resort & Spa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="razao_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Paradiso Hotelaria LTDA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ *</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_comercial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail Comercial *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="reservas@hotel.com.br"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone_comercial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Comercial *</FormLabel>
              <FormControl>
                <Input placeholder="(11) 3333-4444" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="celular"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celular / WhatsApp</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 98888-7777"
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
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Institucional</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://seuhotel.com.br"
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
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria do Estabelecimento *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger aria-label="Categoria do Estabelecimento">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HOTEL">Hotel</SelectItem>
                  <SelectItem value="POUSADA">Pousada</SelectItem>
                  <SelectItem value="RESORT">Resort</SelectItem>
                  <SelectItem value="HOSTEL">Hostel</SelectItem>
                  <SelectItem value="FLAT">Flat</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="classificacao_estrelas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classificação de Estrelas</FormLabel>
              <Select
                onValueChange={v => field.onChange(Number(v))}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger aria-label="Classificação de Estrelas">
                    <SelectValue placeholder="Selecione as estrelas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Sem classificação</SelectItem>
                  <SelectItem value="1">1 Estrela</SelectItem>
                  <SelectItem value="2">2 Estrelas</SelectItem>
                  <SelectItem value="3">3 Estrelas</SelectItem>
                  <SelectItem value="4">4 Estrelas</SelectItem>
                  <SelectItem value="5">5 Estrelas</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

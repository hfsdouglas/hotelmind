import { Controller, useFormContext, useWatch } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color_picker'
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
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'
import { PreviewTemaCard } from './preview_tema_card'

export function AbaIdentidadeVisual() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<HotelConfiguracaoFormData>()

  const watchedValues = useWatch({
    control,
  })

  const shortDescLength = watchedValues.short_description?.length || 0

  const handleFileUpload = (
    field: 'logo_primary' | 'logo_dark' | 'favicon',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setValue(field, reader.result as string, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Dados Institucionais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Dados Institucionais
            </CardTitle>
            <CardDescription className="text-sm">
              Informações corporativas e apresentação geral do estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hotel_name">Nome Fantasia *</Label>
              <Input
                id="hotel_name"
                {...register('hotel_name')}
                placeholder="Ex: Grand Hotel Resort"
              />
              {errors.hotel_name && (
                <span className="text-xs text-destructive">
                  {errors.hotel_name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="legal_name">Razão Social</Label>
              <Input
                id="legal_name"
                {...register('legal_name')}
                placeholder="Ex: Grand Hotel Empreendimentos LTDA"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tax_id">CNPJ / Identificador Fiscal</Label>
              <Input
                id="tax_id"
                {...register('tax_id')}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Tipo de Estabelecimento</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOTEL">Hotel</SelectItem>
                      <SelectItem value="POUSADA">Pousada</SelectItem>
                      <SelectItem value="RESORT">Resort</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="star_rating">Classificação (Estrelas)</Label>
              <Controller
                control={control}
                name="star_rating"
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? 0)}
                    onValueChange={v => field.onChange(Number(v))}
                  >
                    <SelectTrigger id="star_rating">
                      <SelectValue placeholder="Classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem classificação</SelectItem>
                      <SelectItem value="1">1 Estrela</SelectItem>
                      <SelectItem value="2">2 Estrelas</SelectItem>
                      <SelectItem value="3">3 Estrelas</SelectItem>
                      <SelectItem value="4">4 Estrelas</SelectItem>
                      <SelectItem value="5">5 Estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="short_description">
                  Descrição Resumida / Slogan
                </Label>
                <span className="text-xs text-muted-foreground">
                  {shortDescLength}/160
                </span>
              </div>
              <Textarea
                id="short_description"
                rows={2}
                maxLength={160}
                {...register('short_description')}
                placeholder="Breve frase de destaque ou slogan para vouchers e cabeçalhos"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="full_description">
                Descrição Completa Institucional
              </Label>
              <Textarea
                id="full_description"
                rows={4}
                {...register('full_description')}
                placeholder="Apresentação detalhada da propriedade, localização e história"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logotipos e Ícones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Logotipos e Ícones
            </CardTitle>
            <CardDescription className="text-sm">
              Envie as variações da sua marca para exibição em temas claros,
              escuros e na aba do navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
              <Label className="text-xs font-semibold">
                Logo Principal (Fundo Claro)
              </Label>
              {watchedValues.logo_primary && (
                <img
                  src={watchedValues.logo_primary}
                  alt="Logo Principal"
                  className="h-12 w-auto object-contain bg-slate-100 p-1 rounded"
                />
              )}
              <Input
                type="file"
                accept="image/png,image/svg+xml"
                onChange={e => handleFileUpload('logo_primary', e)}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
              <Label className="text-xs font-semibold">Logo Fundo Escuro</Label>
              {watchedValues.logo_dark && (
                <img
                  src={watchedValues.logo_dark}
                  alt="Logo Fundo Escuro"
                  className="h-12 w-auto object-contain bg-slate-900 p-1 rounded"
                />
              )}
              <Input
                type="file"
                accept="image/png,image/svg+xml"
                onChange={e => handleFileUpload('logo_dark', e)}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
              <Label className="text-xs font-semibold">
                Favicon (.ico, .png 32x32)
              </Label>
              {watchedValues.favicon && (
                <img
                  src={watchedValues.favicon}
                  alt="Favicon"
                  className="h-8 w-8 object-contain bg-slate-100 p-1 rounded"
                />
              )}
              <Input
                type="file"
                accept="image/x-icon,image/png,image/vnd.microsoft.icon"
                onChange={e => handleFileUpload('favicon', e)}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Paleta de Cores & Theme Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Paleta de Cores (Theme Tokens)
            </CardTitle>
            <CardDescription className="text-sm">
              Personalize os tons do sistema, vouchers e motor de reservas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={control}
              name="color_primary"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor Primária (Botões e Destaques)</Label>
                  <ColorPicker
                    value={field.value || '#1e40af'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_secondary"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor Secundária (Elementos de Apoio)</Label>
                  <ColorPicker
                    value={field.value || '#64748b'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_background"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor de Fundo da Aplicação</Label>
                  <ColorPicker
                    value={field.value || '#ffffff'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_surface"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor de Cartões / Superfícies</Label>
                  <ColorPicker
                    value={field.value || '#f8fafc'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_text_primary"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor do Texto Principal</Label>
                  <ColorPicker
                    value={field.value || '#0f172a'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_text_secondary"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Cor do Texto Secundário / Legendas</Label>
                  <ColorPicker
                    value={field.value || '#475569'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="color_accent"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label>Cor de Destaque (Badges e Alertas)</Label>
                  <ColorPicker
                    value={field.value || '#f59e0b'}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Coluna Lateral: Preview em Tempo Real */}
      <div className="lg:col-span-4">
        <PreviewTemaCard
          hotelName={watchedValues.hotel_name || ''}
          colorPrimary={watchedValues.color_primary || '#1e40af'}
          colorSecondary={watchedValues.color_secondary || '#64748b'}
          colorBackground={watchedValues.color_background || '#ffffff'}
          colorSurface={watchedValues.color_surface || '#f8fafc'}
          colorTextPrimary={watchedValues.color_text_primary || '#0f172a'}
          colorTextSecondary={watchedValues.color_text_secondary || '#475569'}
          colorAccent={watchedValues.color_accent || '#f59e0b'}
          logoUrl={watchedValues.logo_primary}
        />
      </div>
    </div>
  )
}

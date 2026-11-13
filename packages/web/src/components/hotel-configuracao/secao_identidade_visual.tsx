import { Button } from '@hotelmind/ui'
import { Eye, Palette, Upload } from 'lucide-react'
import type React from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { ColorPicker } from '@/components/ui/color_picker'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { HotelConfiguracaoFormData } from '@/schemas/hotel_configuracao'

interface SecaoIdentidadeVisualProps {
  form: UseFormReturn<HotelConfiguracaoFormData>
  onOpenPreview: () => void
}

export function SecaoIdentidadeVisual({
  form,
  onOpenPreview,
}: SecaoIdentidadeVisualProps) {
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        fieldChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
        <div className="flex items-center gap-2 text-primary font-semibold text-base">
          <Palette className="h-5 w-5" />
          <h3>3. Identidade Visual & Cores</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenPreview}
          className="flex items-center gap-2 w-fit"
        >
          <Eye className="h-4 w-4" />
          <span>Visualizar Prévia do Tema</span>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Personalize os logotipos institucionais e a paleta de cores (tokens de
        design) do sistema e do motor de reservas.
      </p>

      {/* Upload de Logos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="tema.logo_principal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Logotipo Principal (Fundo Claro)</FormLabel>
              <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center bg-muted/20">
                {field.value ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={field.value}
                      alt="Logo Principal"
                      className="h-14 max-w-full object-contain mb-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => field.onChange(null)}
                    >
                      Remover logotipo
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      PNG ou SVG (Fundo transparente)
                    </span>
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                      >
                        <span>Escolher Arquivo</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, field.onChange)}
                      />
                    </label>
                  </>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tema.logo_escuro"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Logotipo para Fundo Escuro</FormLabel>
              <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center bg-slate-900 text-white">
                {field.value ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={field.value}
                      alt="Logo Escuro"
                      className="h-14 max-w-full object-contain mb-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-400 hover:bg-red-950/50"
                      onClick={() => field.onChange(null)}
                    >
                      Remover logotipo
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      Versão contrastante (fundo escuro)
                    </span>
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                      >
                        <span>Escolher Arquivo</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, field.onChange)}
                      />
                    </label>
                  </>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tema.favicon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Favicon do Navegador</FormLabel>
              <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center bg-muted/20">
                {field.value ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={field.value}
                      alt="Favicon"
                      className="h-10 w-10 object-contain mb-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => field.onChange(null)}
                    >
                      Remover favicon
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      .ico ou PNG (32x32px / 64x64px)
                    </span>
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                      >
                        <span>Escolher Arquivo</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*,.ico"
                        className="hidden"
                        onChange={e => handleFileUpload(e, field.onChange)}
                      />
                    </label>
                  </>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Paleta de Cores (Theme Tokens em HEX) */}
      <div className="pt-2">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Tokens da Paleta de Cores (Código HEX)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <FormItem>
            <FormLabel>Cor Primária</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_primaria"
              render={({ field }) => (
                <ColorPicker
                  id="cor_primaria"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Cor Secundária</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_secundaria"
              render={({ field }) => (
                <ColorPicker
                  id="cor_secundaria"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Cor de Fundo (Background)</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_fundo"
              render={({ field }) => (
                <ColorPicker
                  id="cor_fundo"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Cor de Superfície (Cards/Cards)</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_superficie"
              render={({ field }) => (
                <ColorPicker
                  id="cor_superficie"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Texto Principal (Alto Contraste)</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_texto_principal"
              render={({ field }) => (
                <ColorPicker
                  id="cor_texto_principal"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Texto Secundário (Muted)</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_texto_secundario"
              render={({ field }) => (
                <ColorPicker
                  id="cor_texto_secundario"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Cor de Destaque (Accent/Badges)</FormLabel>
            <Controller
              control={form.control}
              name="tema.cor_destaque"
              render={({ field }) => (
                <ColorPicker
                  id="cor_destaque"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormItem>
        </div>
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface ColorPickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const PRESET_COLORS = [
  { label: 'Azul', hex: '#2563EB' },
  { label: 'Verde', hex: '#16A34A' },
  { label: 'Amarelo', hex: '#EAB308' },
  { label: 'Vermelho', hex: '#DC2626' },
  { label: 'Roxo', hex: '#7C3AED' },
  { label: 'Laranja', hex: '#EA580C' },
  { label: 'Rosa', hex: '#DB2777' },
  { label: 'Ciano', hex: '#0891B2' },
  { label: 'Dourado', hex: '#D97706' },
  { label: 'Cinza', hex: '#64748B' },
]

export function ColorPicker({
  id = 'cor_pulseira',
  value,
  onChange,
  disabled = false,
  className,
}: ColorPickerProps) {
  const inputColorRef = useRef<HTMLInputElement>(null)
  const currentHex = value || '#2563EB'

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value.trim()
    if (!text.startsWith('#') && text.length > 0) {
      text = `#${text}`
    }
    onChange(text.toUpperCase())
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Acionador nativo com preview da cor */}
        <div className="relative">
          <input
            ref={inputColorRef}
            id={id}
            type="color"
            value={currentHex.length === 7 ? currentHex : '#2563EB'}
            onChange={e => onChange(e.target.value.toUpperCase())}
            disabled={disabled}
            aria-label="Selecionar cor da pulseira"
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputColorRef.current?.click()}
            disabled={disabled}
            className="flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: currentHex }}
            title="Clique para escolher uma cor no seletor"
            aria-label={`Cor selecionada: ${currentHex}`}
          />
        </div>

        {/* Input HEX manual */}
        <div className="w-32">
          <Input
            value={value}
            onChange={handleTextChange}
            placeholder="#000000"
            maxLength={7}
            disabled={disabled}
            className="font-mono text-sm uppercase"
            aria-label="Código hexadecimal da cor da pulseira"
          />
        </div>

        {/* Representação visual da Pulseira de Identificação */}
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1 shadow-xs"
          style={{
            borderColor: currentHex,
            backgroundColor: `${currentHex}15`,
          }}
          data-testid="wristband-preview"
        >
          <div
            className="h-3.5 w-6 rounded-xs shadow-inner"
            style={{ backgroundColor: currentHex }}
          />
          <span className="text-xs font-semibold" style={{ color: currentHex }}>
            Pulseira de Identificação
          </span>
        </div>
      </div>

      {/* Cores predefinidas para seleção rápida */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          Cores sugeridas para pulseiras:
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(preset => {
            const isSelected = value.toUpperCase() === preset.hex.toUpperCase()
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChange(preset.hex)}
                disabled={disabled}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md border text-xs shadow-xs transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
                  isSelected &&
                    'ring-2 ring-primary ring-offset-2 font-bold scale-105'
                )}
                style={{ backgroundColor: preset.hex }}
                title={`${preset.label} (${preset.hex})`}
                aria-label={`Escolher cor ${preset.label}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

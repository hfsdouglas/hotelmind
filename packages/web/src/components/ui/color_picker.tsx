import type React from 'react'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface ColorPickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  showWristbandBadge?: boolean
}

export function ColorPicker({
  id = 'cor_picker',
  value,
  onChange,
  disabled = false,
  className,
  showWristbandBadge = false,
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
            aria-label={
              showWristbandBadge
                ? 'Selecionar cor da pulseira'
                : 'Selecionar cor'
            }
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
            aria-label={
              showWristbandBadge
                ? 'Código hexadecimal da cor da pulseira'
                : 'Código hexadecimal da cor'
            }
          />
        </div>

        {/* Representação visual da Pulseira de Identificação (apenas quando solicitado) */}
        {showWristbandBadge && (
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
            <span
              className="text-xs font-semibold"
              style={{ color: currentHex }}
            >
              Pulseira de Identificação
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

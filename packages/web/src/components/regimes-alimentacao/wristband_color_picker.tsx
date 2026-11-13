import { ColorPicker, type ColorPickerProps } from '@hotelmind/ui'

type WristbandColorPickerProps = Omit<
  ColorPickerProps,
  'colorLabel' | 'hexLabel' | 'renderPreview'
>

export function WristbandColorPicker(props: WristbandColorPickerProps) {
  return (
    <ColorPicker
      {...props}
      colorLabel="Selecionar cor da pulseira"
      hexLabel="Código hexadecimal da cor da pulseira"
      renderPreview={hex => (
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1 shadow-xs"
          style={{ borderColor: hex, backgroundColor: `${hex}15` }}
          data-testid="wristband-preview"
        >
          <div
            className="h-3.5 w-6 rounded-xs shadow-inner"
            style={{ backgroundColor: hex }}
          />
          <span className="text-xs font-semibold" style={{ color: hex }}>
            Pulseira de Identificação
          </span>
        </div>
      )}
    />
  )
}

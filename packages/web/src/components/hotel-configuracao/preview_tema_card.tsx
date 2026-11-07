import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PreviewTemaCardProps {
  hotelName: string
  colorPrimary: string
  colorSecondary: string
  colorBackground: string
  colorSurface: string
  colorTextPrimary: string
  colorTextSecondary: string
  colorAccent: string
  logoUrl?: string | null
}

export function PreviewTemaCard({
  hotelName,
  colorPrimary,
  colorSecondary,
  colorBackground,
  colorSurface,
  colorTextPrimary,
  colorTextSecondary,
  colorAccent,
  logoUrl,
}: PreviewTemaCardProps) {
  const dynamicStyles: React.CSSProperties = {
    // Custom CSS vars for testing and style containment
    ['--p-primary' as string]: colorPrimary,
    ['--p-secondary' as string]: colorSecondary,
    ['--p-bg' as string]: colorBackground,
    ['--p-surface' as string]: colorSurface,
    ['--p-text' as string]: colorTextPrimary,
    ['--p-text-muted' as string]: colorTextSecondary,
    ['--p-accent' as string]: colorAccent,
    backgroundColor: colorBackground,
    color: colorTextPrimary,
  }

  return (
    <Card className="sticky top-6 border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Demonstração Visual (Tempo Real)</span>
          <span
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colorAccent, color: '#ffffff' }}
          >
            Live Preview
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div
          data-testid="preview-container"
          style={dynamicStyles}
          className="rounded-lg p-5 border transition-colors duration-150 flex flex-col gap-4 shadow-sm"
        >
          {/* Header simulado do hotel */}
          <div
            className="flex items-center justify-between gap-3 border-b pb-3"
            style={{ borderColor: `${colorSecondary}33` }}
          >
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-8 max-w-[100px] object-contain rounded"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: colorPrimary, color: '#ffffff' }}
                >
                  {(hotelName || 'H')[0]?.toUpperCase()}
                </div>
              )}
              <span
                className="font-bold text-sm tracking-tight"
                style={{ color: colorTextPrimary }}
              >
                {hotelName || 'Nome do Hotel'}
              </span>
            </div>
            <div className="flex gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${colorSecondary}20`,
                  color: colorTextSecondary,
                }}
              >
                Início
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${colorSecondary}20`,
                  color: colorTextSecondary,
                }}
              >
                Quartos
              </span>
            </div>
          </div>

          {/* Card interno de demonstração (superfície) */}
          <div
            className="rounded-md p-4 border flex flex-col gap-2.5 transition-colors"
            style={{
              backgroundColor: colorSurface,
              borderColor: `${colorSecondary}25`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold"
                style={{ color: colorTextPrimary }}
              >
                Suíte Master Executiva
              </span>
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: colorAccent, color: '#ffffff' }}
              >
                15% OFF
              </span>
            </div>
            <p className="text-xs" style={{ color: colorTextSecondary }}>
              Diárias a partir de R$ 420 com café da manhã incluso.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span
                className="text-xs font-bold"
                style={{ color: colorPrimary }}
              >
                R$ 420,00 / noite
              </span>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-md font-semibold transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
                style={{ backgroundColor: colorPrimary, color: '#ffffff' }}
              >
                Reservar agora
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

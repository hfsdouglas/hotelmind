import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface PreviewTemaCardProps {
  nomeHotel: string
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corSuperficie: string
  corTextoPrincipal: string
  corTextoSecundario: string
  corDestaque: string
  logoUrl?: string | null
}

export function PreviewTemaCard({
  nomeHotel,
  corPrimaria,
  corSecundaria,
  corFundo,
  corSuperficie,
  corTextoPrincipal,
  corTextoSecundario,
  corDestaque,
  logoUrl,
}: PreviewTemaCardProps) {
  const dynamicStyles: React.CSSProperties = {
    ['--p-primary' as string]: corPrimaria,
    ['--p-secondary' as string]: corSecundaria,
    ['--p-bg' as string]: corFundo,
    ['--p-surface' as string]: corSuperficie,
    ['--p-text' as string]: corTextoPrincipal,
    ['--p-text-muted' as string]: corTextoSecundario,
    ['--p-accent' as string]: corDestaque,
    backgroundColor: corFundo,
    color: corTextoPrincipal,
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Demonstração Visual (Tempo Real)</span>
          <span
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: corDestaque, color: '#ffffff' }}
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
            style={{ borderColor: `${corSecundaria}33` }}
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
                  style={{ backgroundColor: corPrimaria, color: '#ffffff' }}
                >
                  {(nomeHotel || 'H')[0]?.toUpperCase()}
                </div>
              )}
              <span
                className="font-bold text-sm tracking-tight"
                style={{ color: corTextoPrincipal }}
              >
                {nomeHotel || 'Nome do Hotel'}
              </span>
            </div>
            <div className="flex gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${corSecundaria}20`,
                  color: corTextoSecundario,
                }}
              >
                Início
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${corSecundaria}20`,
                  color: corTextoSecundario,
                }}
              >
                Quartos
              </span>
            </div>
          </div>

          {/* Card interno simulando superfície */}
          <div
            className="p-4 rounded-md border flex flex-col gap-2.5 shadow-xs"
            style={{
              backgroundColor: corSuperficie,
              borderColor: `${corSecundaria}33`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: corDestaque }}
              >
                Oferta Especial
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${corPrimaria}15`,
                  color: corPrimaria,
                }}
              >
                Disponível
              </span>
            </div>

            <h4
              className="text-base font-bold leading-tight"
              style={{ color: corTextoPrincipal }}
            >
              Suíte Executiva com Vista
            </h4>
            <p
              className="text-xs line-clamp-2 leading-relaxed"
              style={{ color: corTextoSecundario }}
            >
              Ambiente com design moderno, Wi-Fi veloz e comodidades completas.
            </p>

            <div
              className="mt-2 flex items-center justify-between pt-2 border-t"
              style={{ borderColor: `${corSecundaria}20` }}
            >
              <div>
                <span
                  className="text-[10px] uppercase font-medium block"
                  style={{ color: corTextoSecundario }}
                >
                  A partir de
                </span>
                <span
                  className="text-sm font-extrabold"
                  style={{ color: corPrimaria }}
                >
                  R$ 380,00
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor: corPrimaria,
                  color: '#ffffff',
                }}
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

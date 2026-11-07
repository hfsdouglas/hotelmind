import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreviewTemaCard } from './preview_tema_card'

describe('PreviewTemaCard', () => {
  it('renders the preview card with default hotel name and theme elements', () => {
    render(
      <PreviewTemaCard
        hotelName="Hotel Teste"
        colorPrimary="#1e40af"
        colorSecondary="#64748b"
        colorBackground="#ffffff"
        colorSurface="#f8fafc"
        colorTextPrimary="#0f172a"
        colorTextSecondary="#475569"
        colorAccent="#f59e0b"
      />
    )

    expect(screen.getByText('Hotel Teste')).toBeInTheDocument()
    expect(screen.getByText(/demonstração visual/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /reservar agora/i })
    ).toBeInTheDocument()
  })

  it('renders with custom primary and accent colors applied to preview styles', () => {
    const { container } = render(
      <PreviewTemaCard
        hotelName="Pousada Vista"
        colorPrimary="#dc2626"
        colorSecondary="#475569"
        colorBackground="#fafafa"
        colorSurface="#ffffff"
        colorTextPrimary="#111827"
        colorTextSecondary="#6b7280"
        colorAccent="#10b981"
      />
    )

    const previewContainer = container.querySelector(
      '[data-testid="preview-container"]'
    )
    expect(previewContainer).toBeInTheDocument()
    expect(previewContainer).toHaveStyle({
      '--p-primary': '#dc2626',
      '--p-bg': '#fafafa',
      '--p-surface': '#ffffff',
    })
  })
})

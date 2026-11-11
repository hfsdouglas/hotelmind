import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoIdentidadeVisual } from './secao_identidade_visual'

const LOGO = 'data:image/png;base64,AAAA'

function render(
  tema: Record<string, string | null> = {},
  onOpenPreview = vi.fn()
) {
  const base = {
    logo_principal: null,
    logo_escuro: null,
    favicon: null,
    cor_primaria: '#1e40af',
    cor_secundaria: '#64748b',
    cor_fundo: '#ffffff',
    cor_superficie: '#f8fafc',
    cor_texto_principal: '#0f172a',
    cor_texto_secundario: '#475569',
    cor_destaque: '#f59e0b',
  }
  const utils = renderSecao(
    f => <SecaoIdentidadeVisual form={f} onOpenPreview={onOpenPreview} />,
    { tema: { ...base, ...tema } }
  )
  return { ...utils, onOpenPreview }
}

describe('SecaoIdentidadeVisual', () => {
  it('chama onOpenPreview ao clicar em visualizar prévia do tema', async () => {
    const { onOpenPreview } = render()

    await userEvent.click(
      screen.getByRole('button', { name: /visualizar prévia do tema/i })
    )

    expect(onOpenPreview).toHaveBeenCalledTimes(1)
  })

  it('mostra o seletor de arquivo quando não há logotipos', () => {
    render()

    expect(screen.getAllByText('Escolher Arquivo')).toHaveLength(3)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('exibe as imagens e permite remover o logotipo principal', async () => {
    const { getValues } = render({ logo_principal: LOGO })
    expect(screen.getByRole('img', { name: 'Logo Principal' })).toHaveAttribute(
      'src',
      LOGO
    )

    await userEvent.click(
      screen.getByRole('button', { name: /remover logotipo/i })
    )

    expect(getValues().tema.logo_principal).toBeNull()
    expect(
      screen.queryByRole('img', { name: 'Logo Principal' })
    ).not.toBeInTheDocument()
  })

  it('remove o favicon', async () => {
    const { getValues } = render({ favicon: LOGO })

    await userEvent.click(
      screen.getByRole('button', { name: /remover favicon/i })
    )

    expect(getValues().tema.favicon).toBeNull()
  })

  it('converte o arquivo enviado em data URL no formulário', async () => {
    const { getValues, container } = render()
    const file = new File(['abc'], 'logo.png', { type: 'image/png' })
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() =>
      expect(getValues().tema.logo_principal).toMatch(
        /^data:image\/png;base64,/
      )
    )
    expect(
      await screen.findByRole('img', { name: 'Logo Principal' })
    ).toBeInTheDocument()
  })

  it('mostra as cores atuais da paleta e permite alterar a cor primária', async () => {
    const { getValues } = render()
    const campos = screen.getAllByRole('textbox', {
      name: /código hexadecimal da cor/i,
    })
    expect(campos).toHaveLength(7)
    const hex = campos[0]
    expect(hex).toHaveValue('#1e40af')

    await userEvent.clear(hex)
    await userEvent.type(hex, '123456')

    expect(getValues().tema.cor_primaria).toBe('#123456')
  })
})

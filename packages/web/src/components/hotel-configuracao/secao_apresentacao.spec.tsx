import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderSecao } from '@/tests/utils/render_secao_hotel_configuracao'
import { SecaoApresentacao } from './secao_apresentacao'

const render = (o = {}) => renderSecao(f => <SecaoApresentacao form={f} />, o)

describe('SecaoApresentacao', () => {
  it('mostra os campos com os valores iniciais e o contador de caracteres', () => {
    render({ descricao_curta: 'Slogan', descricao_completa: 'Texto longo' })

    expect(screen.getByLabelText(/descrição resumida/i)).toHaveValue('Slogan')
    expect(screen.getByLabelText(/descrição completa/i)).toHaveValue(
      'Texto longo'
    )
    expect(screen.getByText('6/160 caracteres')).toBeInTheDocument()
  })

  it('atualiza o contador e o valor do formulário ao digitar o slogan', async () => {
    const { getValues } = render()

    await userEvent.type(screen.getByLabelText(/descrição resumida/i), 'Paz')

    expect(screen.getByText('3/160 caracteres')).toBeInTheDocument()
    expect(getValues().descricao_curta).toBe('Paz')
  })

  it('limita o slogan a 160 caracteres', () => {
    render()
    expect(screen.getByLabelText(/descrição resumida/i)).toHaveAttribute(
      'maxlength',
      '160'
    )
  })

  it('grava null quando a descrição completa é apagada', async () => {
    const { getValues } = render({ descricao_completa: 'x' })

    await userEvent.clear(screen.getByLabelText(/descrição completa/i))

    expect(getValues().descricao_completa).toBeNull()
  })
})

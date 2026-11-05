import { describe, expect, it } from 'vitest'
import { LeadValidationError } from '@/core/errors/lead_errors'
import { Lead } from './lead'

describe('Lead Entity', () => {
  const base_props = {
    id: 'lead-1',
    hotel_id: 'hotel-1',
    nome: 'Mariana Souza',
    telefone: '11988887777',
    email: 'mariana@email.com',
    created_at: new Date(),
    updated_at: new Date(),
  }

  it('deve instanciar um lead válido', () => {
    const lead = new Lead(base_props)

    expect(lead.id).toBe('lead-1')
    expect(lead.nome).toBe('Mariana Souza')
    expect(lead.telefone).toBe('11988887777')
    expect(lead.email).toBe('mariana@email.com')
  })

  it('deve lançar erro se nome for vazio ou exceder 150 caracteres', () => {
    expect(
      () =>
        new Lead({
          ...base_props,
          nome: '   ',
        })
    ).toThrow(LeadValidationError)

    expect(
      () =>
        new Lead({
          ...base_props,
          nome: 'a'.repeat(151),
        })
    ).toThrow(LeadValidationError)
  })

  it('deve lançar erro se telefone for vazio', () => {
    expect(
      () =>
        new Lead({
          ...base_props,
          telefone: ' ',
        })
    ).toThrow(LeadValidationError)
  })

  it('deve lançar erro se e-mail for inválido', () => {
    expect(
      () =>
        new Lead({
          ...base_props,
          email: 'email-invalido',
        })
    ).toThrow(LeadValidationError)
  })
})

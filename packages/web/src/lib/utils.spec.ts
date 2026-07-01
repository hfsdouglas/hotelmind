import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves tailwind conflicts by keeping the last class', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('supports conditional classes via object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe(
      'text-red-500',
    )
  })
})

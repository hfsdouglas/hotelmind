import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names and ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('supports conditional objects and arrays', () => {
    expect(cn(['a', { b: true, c: false }])).toBe('a b')
  })

  it('resolves conflicting tailwind classes keeping the last one', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})

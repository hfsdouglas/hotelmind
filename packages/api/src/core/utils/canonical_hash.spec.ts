import { describe, expect, it } from 'vitest'
import { canonicalJsonStringify, computeObjectSha256 } from './canonical_hash'

describe('canonical_hash utils', () => {
  it('serializes primitives correctly', () => {
    expect(canonicalJsonStringify(null)).toBe('null')
    expect(canonicalJsonStringify(123)).toBe('123')
    expect(canonicalJsonStringify('abc')).toBe('"abc"')
    expect(canonicalJsonStringify(true)).toBe('true')
  })

  it('orders object keys canonically regardless of insertion order', () => {
    const objA = { b: 2, a: 1, c: { z: 26, y: 25 } }
    const objB = { a: 1, c: { y: 25, z: 26 }, b: 2 }

    expect(canonicalJsonStringify(objA)).toBe(canonicalJsonStringify(objB))
    expect(canonicalJsonStringify(objA)).toBe(
      '{"a":1,"b":2,"c":{"y":25,"z":26}}'
    )
    expect(computeObjectSha256(objA)).toBe(computeObjectSha256(objB))
  })

  it('handles arrays preserving item order and canonicalizing items', () => {
    const listA = [
      { b: 2, a: 1 },
      { d: 4, c: 3 },
    ]
    const listB = [
      { a: 1, b: 2 },
      { c: 3, d: 4 },
    ]

    expect(canonicalJsonStringify(listA)).toBe(canonicalJsonStringify(listB))
    expect(computeObjectSha256(listA)).toBe(computeObjectSha256(listB))
  })

  it('computes sha256 64-character hex string', () => {
    const hash = computeObjectSha256({ status: 'confirmada' })
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

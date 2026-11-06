import { createHash } from 'node:crypto'

export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJsonStringify).join(',')}]`
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort()
  const entries = keys.map(
    k =>
      `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`
  )
  return `{${entries.join(',')}}`
}

export function computeObjectSha256(obj: unknown): string {
  const canonical = canonicalJsonStringify(obj)
  return createHash('sha256').update(canonical).digest('hex')
}

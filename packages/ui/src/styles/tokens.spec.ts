import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import preset, { withOpacity } from '../../tailwind.preset'

const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')

function block(selector: string) {
  const start = css.indexOf(`${selector} {`)
  return css.slice(start, css.indexOf('\n  }', start))
}

function used_variables(value: unknown): string[] {
  if (typeof value === 'string') {
    return [...value.matchAll(/var\((--[\w-]+)\)/g)].map(m => m[1])
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(used_variables)
  }
  return []
}

describe('withOpacity', () => {
  it('builds a color-mix expression supporting the alpha placeholder', () => {
    expect(withOpacity('--primary')).toBe(
      'color-mix(in oklch, var(--primary) calc(100% * <alpha-value>), transparent)'
    )
  })
})

describe('tailwind preset', () => {
  it('uses class based dark mode', () => {
    expect(preset.darkMode).toBe('class')
  })

  it('only references css variables defined in tokens.css (light and dark)', () => {
    const vars = [
      ...new Set([
        ...used_variables(preset.theme?.extend?.colors),
        ...used_variables(preset.theme?.extend?.borderRadius),
      ]),
    ]
    const light = block(':root')
    const dark = block('.dark')
    const colors = vars.filter(v => !v.startsWith('--radius'))

    expect(vars.length).toBeGreaterThan(0)
    for (const name of vars) expect(light).toContain(`${name}:`)
    for (const name of colors) expect(dark).toContain(`${name}:`)
  })
})

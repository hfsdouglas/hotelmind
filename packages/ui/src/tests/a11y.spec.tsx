import { composeStories } from '@storybook/react-vite'
import { render } from '@testing-library/react'
import axe from 'axe-core'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Every story must pass axe. color-contrast is skipped: jsdom has no layout
// or computed colors, so it cannot be evaluated here (check it in Storybook).
const modules = import.meta.glob('../components/**/*.stories.tsx', {
  eager: true,
})

describe('a11y (axe) over every story', () => {
  for (const [path, module] of Object.entries(modules)) {
    const stories = composeStories(
      module as Parameters<typeof composeStories>[0]
    )
    for (const [name, story] of Object.entries(stories)) {
      const Story = story as ComponentType
      it(`${path.split('/').slice(-2).join('/')} › ${name}`, async () => {
        const { container } = render(<Story />)
        const results = await axe.run(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
        expect(results.violations.map(v => `${v.id}: ${v.help}`)).toEqual([])
      })
    }
  }
})

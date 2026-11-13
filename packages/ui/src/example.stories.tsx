import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Setup/Smoke test',
  component: () => <p>Storybook OK</p>,
} satisfies Meta
export default meta
export const Default: StoryObj<typeof meta> = {}

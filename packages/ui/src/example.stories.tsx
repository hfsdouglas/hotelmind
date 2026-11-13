import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Setup/Tokens',
  component: () => (
    <div className="space-y-2 rounded-lg border bg-card p-4 text-card-foreground">
      <p className="text-sm text-muted-foreground">Storybook + tokens OK</p>
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        Primary
      </button>
    </div>
  ),
} satisfies Meta

export default meta
export const Default: StoryObj<typeof meta> = {}

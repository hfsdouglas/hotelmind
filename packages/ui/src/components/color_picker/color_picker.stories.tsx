import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ColorPicker } from './color_picker'

function ControlledColorPicker({ withPreview }: { withPreview?: boolean }) {
  const [value, setValue] = useState('#2563EB')
  return (
    <ColorPicker
      value={value}
      onChange={setValue}
      renderPreview={
        withPreview
          ? hex => <span style={{ color: hex }}>Pré-visualização {hex}</span>
          : undefined
      }
    />
  )
}

const meta = {
  title: 'Components/ColorPicker',
  component: ControlledColorPicker,
} satisfies Meta<typeof ControlledColorPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithPreview: Story = { args: { withPreview: true } }

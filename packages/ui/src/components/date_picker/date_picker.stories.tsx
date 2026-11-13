import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DatePicker } from './date_picker'

function ControlledDatePicker() {
  const [value, setValue] = useState('2026-03-15')
  return (
    <div className="w-56">
      <DatePicker id="data" value={value} onChange={setValue} />
    </div>
  )
}

const meta = {
  title: 'Components/DatePicker',
  component: ControlledDatePicker,
} satisfies Meta<typeof ControlledDatePicker>

export default meta
export const Default: StoryObj<typeof meta> = {}

import preset from '@hotelmind/ui/tailwind.preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../ui/src/**/*.{ts,tsx}',
    '!../ui/src/**/*.stories.tsx',
  ],
} satisfies Config

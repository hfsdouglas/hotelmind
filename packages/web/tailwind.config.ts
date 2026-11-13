import preset, { withOpacity } from '@hotelmind/ui/tailwind.preset'
import type { Config } from 'tailwindcss'

// Shared tokens come from the preset; only web's domain tokens live here.
export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../ui/src/**/*.{ts,tsx}',
    '!../ui/src/**/*.stories.tsx',
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          1: withOpacity('--chart-1'),
          2: withOpacity('--chart-2'),
          3: withOpacity('--chart-3'),
          4: withOpacity('--chart-4'),
          5: withOpacity('--chart-5'),
        },
        status: {
          available: withOpacity('--status-available'),
          blocked: withOpacity('--status-blocked'),
          maintenance: withOpacity('--status-maintenance'),
          cleaning: withOpacity('--status-cleaning'),
          occupied: withOpacity('--status-occupied'),
          checkin: withOpacity('--status-checkin'),
          'checkin-foreground': withOpacity('--status-checkin-foreground'),
        },
        'selection-ring': withOpacity('--selection-ring'),
        'range-selection': {
          DEFAULT: withOpacity('--range-selection'),
          border: withOpacity('--range-selection-border'),
          foreground: withOpacity('--range-selection-foreground'),
        },
      },
      backgroundImage: {
        'reservation-to-confirm':
          'repeating-linear-gradient(45deg, color-mix(in oklch, var(--primary) 50%, transparent) 0px, color-mix(in oklch, var(--primary) 50%, transparent) 3px, color-mix(in oklch, var(--primary) 12%, transparent) 3px, color-mix(in oklch, var(--primary) 12%, transparent) 5px)',
      },
    },
  },
} satisfies Config

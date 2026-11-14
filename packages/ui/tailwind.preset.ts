import type { Config } from 'tailwindcss'

export function withOpacity(variableName: string) {
  return `color-mix(in srgb, var(${variableName}) calc(100% * <alpha-value>), transparent)`
}

/**
 * Shared Tailwind preset. Apps extend it with their own domain tokens
 * (status, charts, range selection) in their own tailwind.config.ts.
 */
export default {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        border: withOpacity('--border'),
        input: withOpacity('--input'),
        ring: withOpacity('--ring'),
        background: withOpacity('--background'),
        foreground: withOpacity('--foreground'),
        primary: {
          DEFAULT: withOpacity('--primary'),
          foreground: withOpacity('--primary-foreground'),
          deep: withOpacity('--primary-deep'),
          deeper: withOpacity('--primary-deeper'),
          darkest: withOpacity('--primary-darkest'),
          shadow: withOpacity('--primary-shadow'),
          void: withOpacity('--primary-void'),
        },
        secondary: {
          DEFAULT: withOpacity('--secondary'),
          foreground: withOpacity('--secondary-foreground'),
        },
        tertiary: {
          DEFAULT: withOpacity('--tertiary'),
          foreground: withOpacity('--tertiary-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('--destructive'),
          foreground: withOpacity('--destructive-foreground'),
        },
        success: {
          DEFAULT: withOpacity('--success'),
          foreground: withOpacity('--success-foreground'),
        },
        warning: {
          DEFAULT: withOpacity('--warning'),
          foreground: withOpacity('--warning-foreground'),
        },
        info: {
          DEFAULT: withOpacity('--info'),
          foreground: withOpacity('--info-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('--muted'),
          foreground: withOpacity('--muted-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('--accent'),
          foreground: withOpacity('--accent-foreground'),
        },
        card: {
          DEFAULT: withOpacity('--card'),
          foreground: withOpacity('--card-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('--popover'),
          foreground: withOpacity('--popover-foreground'),
        },
        sidebar: {
          DEFAULT: withOpacity('--sidebar'),
          foreground: withOpacity('--sidebar-foreground'),
          'muted-foreground': withOpacity('--sidebar-muted-foreground'),
          border: withOpacity('--sidebar-border'),
          primary: {
            DEFAULT: withOpacity('--sidebar-primary'),
            foreground: withOpacity('--sidebar-primary-foreground'),
          },
          accent: {
            DEFAULT: withOpacity('--sidebar-accent'),
            foreground: withOpacity('--sidebar-accent-foreground'),
          },
        },
        overlay: {
          DEFAULT: withOpacity('--overlay'),
          strong: withOpacity('--overlay-strong'),
        },
        brand: {
          mark: withOpacity('--brand-mark'),
          stroke: withOpacity('--brand-stroke'),
          accent: withOpacity('--brand-accent'),
          'wordmark-accent': withOpacity('--brand-wordmark-accent'),
          'mark-on-primary': withOpacity('--brand-mark-on-primary'),
          'stroke-on-primary': withOpacity('--brand-stroke-on-primary'),
          'accent-on-primary': withOpacity('--brand-accent-on-primary'),
          'text-on-primary': withOpacity('--brand-text-on-primary'),
        },
      },
      boxShadow: {
        'sidebar-panel': '0 1px 2px #00051414, 0 6px 20px #0005140f',
        'sidebar-active': '0 1px 2px #00051429',
      },
      borderRadius: {
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
    },
  },
  plugins: [],
} satisfies Config

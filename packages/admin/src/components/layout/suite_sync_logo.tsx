import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

export interface SuiteSyncLogoProps extends SVGProps<SVGSVGElement> {
  surface?: 'auto' | 'on-primary'
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  badge?: string
}

const SIZE_MAP = {
  sm: { icon: 'size-6', text: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5' },
  md: { icon: 'size-8', text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
  lg: { icon: 'size-12', text: 'text-3xl', badge: 'text-xs px-2 py-0.5' },
} as const

export function SuiteSyncLogo({
  surface = 'auto',
  iconOnly = false,
  size = 'md',
  badge,
  className,
  ...props
}: SuiteSyncLogoProps) {
  const isOnPrimary = surface === 'on-primary'
  const dimensions = SIZE_MAP[size]

  return (
    <div
      className={cn('inline-flex items-center gap-2.5 select-none', className)}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn('shrink-0', dimensions.icon)}
        {...props}
      >
        <polygon
          points="32,5 33.5,8 36.5,9.5 33.5,11 32,14 30.5,11 27.5,9.5 30.5,8"
          className={isOnPrimary ? 'fill-[#6CCCBA]' : 'fill-tertiary'}
        />
        <polygon
          points="20,8.5 21.1,10.9 23.5,12 21.1,13.1 20,15.5 18.9,13.1 16.5,12 18.9,10.9"
          className={isOnPrimary ? 'fill-[#6CCCBA]' : 'fill-tertiary'}
        />
        <polygon
          points="44,8.5 45.1,10.9 47.5,12 45.1,13.1 44,15.5 42.9,13.1 40.5,12 42.9,10.9"
          className={isOnPrimary ? 'fill-[#6CCCBA]' : 'fill-tertiary'}
        />

        <rect
          x="7.5"
          y="27"
          width="12"
          height="2.5"
          rx="1.25"
          className={isOnPrimary ? 'fill-[#85B4F0]' : 'fill-primary-deep'}
        />
        <rect
          x="9"
          y="29"
          width="10.5"
          height="26"
          className={isOnPrimary ? 'fill-[#85B4F0]' : 'fill-primary-deep'}
        />
        <rect
          x="44.5"
          y="27"
          width="12"
          height="2.5"
          rx="1.25"
          className={isOnPrimary ? 'fill-[#85B4F0]' : 'fill-primary-deep'}
        />
        <rect
          x="44.5"
          y="29"
          width="10.5"
          height="26"
          className={isOnPrimary ? 'fill-[#85B4F0]' : 'fill-primary-deep'}
        />

        <rect
          x="12"
          y="32"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />
        <rect
          x="12"
          y="38.5"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />
        <rect
          x="12"
          y="45"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />
        <rect
          x="47.5"
          y="32"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />
        <rect
          x="47.5"
          y="38.5"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />
        <rect
          x="47.5"
          y="45"
          width="4.5"
          height="4"
          rx="0.8"
          className={isOnPrimary ? 'fill-primary-deep' : 'fill-[#B9D3F5]'}
        />

        <rect
          x="17.5"
          y="17"
          width="29"
          height="3.5"
          rx="1.75"
          className={isOnPrimary ? 'fill-primary-foreground' : 'fill-primary'}
        />
        <rect
          x="19.5"
          y="19.5"
          width="25"
          height="35.5"
          className={isOnPrimary ? 'fill-primary-foreground' : 'fill-primary'}
        />

        <rect
          x="23"
          y="23.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />
        <rect
          x="34"
          y="23.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />
        <rect
          x="23"
          y="30.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />
        <rect
          x="34"
          y="30.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />
        <rect
          x="23"
          y="37.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />
        <rect
          x="34"
          y="37.5"
          width="7"
          height="4.5"
          rx="1"
          className={isOnPrimary ? 'fill-primary' : 'fill-primary-foreground'}
        />

        <path
          d="M 27 55 V 48 A 5 5 0 0 1 37 48 V 55 Z"
          className={isOnPrimary ? 'fill-tertiary' : 'fill-[#6CCCBA]'}
        />

        <rect
          x="5.5"
          y="54.5"
          width="53"
          height="3.5"
          rx="1.75"
          className={isOnPrimary ? 'fill-[#6CCCBA]' : 'fill-primary-deep'}
        />
      </svg>

      {!iconOnly && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-bold tracking-tight leading-none',
              dimensions.text,
              isOnPrimary ? 'text-primary-foreground' : 'text-foreground'
            )}
          >
            Suite
            <span
              className={cn(
                isOnPrimary
                  ? 'text-[#A6DED2]'
                  : 'text-primary dark:text-[#6CCCBA]'
              )}
            >
              Sync
            </span>
          </span>

          {badge && (
            <span
              className={cn(
                'rounded-sm bg-tertiary font-mono font-semibold uppercase tracking-wider text-tertiary-foreground',
                dimensions.badge
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

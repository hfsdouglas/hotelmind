import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
  middle?: boolean
}

export function PageHeader({
  title,
  description,
  children,
  middle = false,
}: PageHeaderProps) {
  return (
    <header className="bg-background">
      <div
        className={cn(
          middle && 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full',
        )}
      >
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-4">{children}</div>
        </div>
        <hr className="mb-6" />
      </div>
    </header>
  )
}

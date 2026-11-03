import type { ReactNode } from 'react'

interface ListPageLayoutProps {
  title: string
  action?: ReactNode
  searchBar?: ReactNode
  filters?: ReactNode
  children: ReactNode
  className?: string
}

export function ListPageLayout({
  title,
  action,
  searchBar,
  filters,
  children,
  className = 'flex flex-1 flex-col gap-6 min-h-0',
}: ListPageLayoutProps) {
  const hasFilterSection = Boolean(searchBar || filters)

  return (
    <div className={className}>
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {action}
      </div>

      {hasFilterSection && (
        <div className="flex shrink-0 flex-col gap-3">
          {searchBar}
          {filters}
        </div>
      )}

      {children}
    </div>
  )
}

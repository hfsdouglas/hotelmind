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
  className = 'flex flex-col gap-6',
}: ListPageLayoutProps) {
  const hasFilterSection = Boolean(searchBar || filters)

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {action}
      </div>

      {hasFilterSection && (
        <div className="flex flex-col gap-3">
          {searchBar && filters ? (
            <div className="flex items-center gap-3">
              {searchBar}
              {filters}
            </div>
          ) : (
            <>
              {searchBar}
              {filters}
            </>
          )}
        </div>
      )}

      {children}
    </div>
  )
}

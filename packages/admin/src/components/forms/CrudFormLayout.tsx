import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CrudFormLayoutProps {
  title: string
  backTo: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  actions: ReactNode
  cardTitle?: string
  children: ReactNode
}

export function CrudFormLayout({
  title,
  backTo,
  onSubmit,
  actions,
  cardTitle,
  children,
}: CrudFormLayoutProps) {
  return (
    <div className="mx-auto flex w-full flex-col gap-6 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1320px]">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card data-testid="crud-form-card">
          {cardTitle && (
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
            </CardHeader>
          )}
          <CardContent className={cardTitle ? undefined : 'pt-6'}>
            {children}
          </CardContent>
        </Card>

        <div
          data-testid="crud-form-actions"
          className="flex justify-end gap-3 [&>button]:min-w-[140px]"
        >
          {actions}
        </div>
      </form>
    </div>
  )
}

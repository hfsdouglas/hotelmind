import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CrudFormLayoutProps {
  title: string
  backTo: string
  cardTitle?: string
  children: ReactNode
  sidebar?: ReactNode
}

export function CrudFormLayout({
  title,
  backTo,
  cardTitle,
  children,
  sidebar,
}: CrudFormLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-6',
        sidebar ? 'max-w-5xl' : 'max-w-3xl'
      )}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className={cn('w-full', sidebar && 'lg:max-w-lg')}>
          {cardTitle && (
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
            </CardHeader>
          )}
          <CardContent className={cardTitle ? undefined : 'pt-6'}>
            {children}
          </CardContent>
        </Card>

        {sidebar && <div className="flex-1">{sidebar}</div>}
      </div>
    </div>
  )
}

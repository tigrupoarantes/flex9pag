import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

/**
 * Header de página Apple-style: título grande tracking apertado,
 * subtítulo cinza, ação opcional à direita. Usado no topo de cada
 * página dentro de (app)/.
 */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

import { ServiceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<ServiceStatus, { label: string; className: string }> = {
  paid: {
    label: 'Pago',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
}

interface StatusBadgeProps {
  status: ServiceStatus
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const { label, className: variantClass } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold tracking-wide',
        size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1',
        variantClass,
        className
      )}
    >
      {label}
    </span>
  )
}

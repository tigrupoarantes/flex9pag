import { ServiceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const CONFIG: Record<ServiceStatus, { label: string; className: string }> = {
  paid: { label: 'Pago', className: 'text-success' },
  pending: { label: 'Pendente', className: 'text-warning' },
  cancelled: { label: 'Cancelado', className: 'text-muted-foreground' },
}

interface StatusBadgeProps {
  status: ServiceStatus
  className?: string
}

/**
 * Status apenas como texto colorido — sem fundo, sem pílula.
 * Apple Health usa esse padrão minimal.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: variantClass } = CONFIG[status]
  return (
    <span
      className={cn(
        'text-[11px] font-semibold tracking-wide uppercase',
        variantClass,
        className
      )}
    >
      {label}
    </span>
  )
}

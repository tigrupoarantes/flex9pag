import { Badge } from '@/components/ui/badge'
import { ServiceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const config: Record<ServiceStatus, { label: string; className: string }> = {
  paid:      { label: 'Recebido ✓',  className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  pending:   { label: 'Pendente',    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
  cancelled: { label: 'Cancelado',   className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const { label, className } = config[status]
  return (
    <Badge className={cn('text-xs font-semibold border-0', className)}>
      {label}
    </Badge>
  )
}

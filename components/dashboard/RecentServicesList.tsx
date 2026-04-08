import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { getServiceIcon } from '@/lib/service-icons'
import type { ServiceStatus } from '@/lib/types'

interface RecentService {
  id: string
  description: string
  amount: number
  status: ServiceStatus
  service_date: string
  client_name_snapshot: string
}

interface RecentServicesListProps {
  services: RecentService[]
}

const STATUS_STYLE: Record<ServiceStatus, { bg: string; text: string; label: string }> = {
  paid: {
    bg: 'bg-secondary-container',
    text: 'text-on-secondary-container',
    label: 'Pago',
  },
  pending: {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    label: 'Pendente',
  },
  cancelled: {
    bg: 'bg-surface-container',
    text: 'text-outline',
    label: 'Cancelado',
  },
}

export function RecentServicesList({ services }: RecentServicesListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <h2 className="font-headline font-extrabold text-xl lg:text-2xl tracking-tight">
          Serviços recentes
        </h2>
        <Link
          href="/servicos"
          className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
        >
          Ver todos <Icon name="chevron_right" className="text-sm" />
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-8 text-center">
          <Icon name="receipt_long" className="text-5xl text-outline mb-3" />
          <p className="font-bold text-on-surface mb-1">Nenhum serviço ainda</p>
          <p className="text-sm text-on-surface-variant mb-4">
            Comece registrando o primeiro.
          </p>
          <Link
            href="/servicos/novo"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            <Icon name="add" />
            Registrar serviço
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_32px_rgba(25,27,35,0.06)] overflow-hidden divide-y divide-outline-variant/30">
          {services.map((s) => {
            const style = STATUS_STYLE[s.status]
            const iconName = getServiceIcon(s.description)
            return (
              <Link
                key={s.id}
                href="/servicos"
                className="p-4 lg:p-5 flex items-center justify-between gap-3 hover:bg-surface-container-low transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                      style.bg,
                      style.text
                    )}
                  >
                    <Icon name={iconName} className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-on-surface text-sm leading-tight truncate">
                      {s.description}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {s.client_name_snapshot || 'Sem cliente'} · {formatDate(s.service_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-headline font-extrabold text-on-surface text-base">
                    {formatCurrency(s.amount)}
                  </p>
                  <span
                    className={cn(
                      'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5',
                      style.bg,
                      style.text
                    )}
                  >
                    {style.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

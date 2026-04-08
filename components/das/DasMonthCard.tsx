import { Icon } from '@/components/ui/icon'
import { formatCurrency, cn } from '@/lib/utils'
import type { DasPayment } from '@/lib/types'

const MONTH_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const MONTH_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface DasMonthCardProps {
  das: DasPayment
  /** Marca o card como mês atual (visual de "agora"). */
  isCurrent: boolean
  /** Marca o card como longe no futuro (renderiza opaco/sem CTA). */
  isFarFuture: boolean
  /** Callback ao clicar em "Marcar como pago" — abre modal no parent. */
  onMarkPaid: (das: DasPayment) => void
}

export function DasMonthCard({ das, isCurrent, isFarFuture, onMarkPaid }: DasMonthCardProps) {
  const monthIdx = new Date(das.competence_month).getMonth()
  const monthShort = MONTH_SHORT[monthIdx]
  const monthLong = MONTH_LONG[monthIdx]
  const dueDay = new Date(das.due_date).getDate()
  const dueMonth = MONTH_SHORT[new Date(das.due_date).getMonth()]
  const amount = das.amount ?? 75.6

  // ===== Variantes visuais =====
  if (das.status === 'paid') {
    return (
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline text-2xl font-bold text-on-surface">{monthShort}</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Venc: {dueDay}/{dueMonth}
            </p>
          </div>
          <Icon name="check_circle" filled className="text-3xl text-secondary" />
        </div>
        <div className="flex justify-between items-end">
          <span className="font-headline text-xl font-bold text-on-surface">
            {formatCurrency(amount)}
          </span>
          <span className="bg-secondary-container text-on-secondary-container text-[10px] px-3 py-1 rounded-full font-bold">
            PAGO
          </span>
        </div>
      </div>
    )
  }

  if (das.status === 'overdue') {
    return (
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_12px_32px_rgba(186,26,26,0.08)] flex flex-col gap-3 relative border border-error/15 overflow-hidden">
        <div className="absolute top-0 right-0">
          <span className="bg-error-container text-on-error-container text-[10px] px-2 py-1 rounded-bl-lg font-bold tracking-wide">
            VENCIDO
          </span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline text-2xl font-bold text-on-surface">{monthShort}</h3>
            <p className="text-xs text-error font-bold mt-0.5">
              Venceu {dueDay}/{dueMonth}
            </p>
          </div>
          <Icon name="warning" filled className="text-3xl text-error animate-pulse" />
        </div>
        <span className="font-headline text-xl font-bold text-on-surface">
          {formatCurrency(amount)}
        </span>
        <button
          type="button"
          onClick={() => onMarkPaid(das)}
          className="mt-1 w-full py-3 bg-error text-on-error font-bold rounded-xl text-sm active:scale-95 transition-transform hover:bg-error/90"
        >
          Marcar como pago
        </button>
      </div>
    )
  }

  // pending
  if (isFarFuture) {
    return (
      <div className="bg-surface-container-low/60 p-5 rounded-2xl flex flex-col gap-2 opacity-60 border border-outline-variant/10">
        <h3 className="font-headline text-2xl font-bold text-on-surface">{monthLong}</h3>
        <p className="text-xs text-on-surface-variant">Aguardando período</p>
        <span className="font-headline text-xl font-bold text-outline">
          {formatCurrency(amount)}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-5 rounded-2xl flex flex-col gap-3 border',
        isCurrent
          ? 'bg-tertiary-fixed border-tertiary-fixed-dim/60'
          : 'bg-surface-container-low border-outline-variant/20'
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{monthShort}</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Vence: {dueDay}/{dueMonth}
          </p>
        </div>
        <Icon name="schedule" className="text-3xl text-on-surface-variant/70" />
      </div>
      <span className="font-headline text-xl font-bold text-on-surface">
        {formatCurrency(amount)}
      </span>
      <button
        type="button"
        onClick={() => onMarkPaid(das)}
        className={cn(
          'mt-1 w-full py-3 font-bold rounded-xl text-sm active:scale-95 transition-transform',
          isCurrent
            ? 'bg-on-tertiary-fixed-variant text-tertiary-fixed'
            : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
        )}
      >
        Marcar como pago
      </button>
    </div>
  )
}

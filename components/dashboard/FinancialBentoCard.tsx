import { Icon, type IconName } from '@/components/ui/icon'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FinancialBentoCardProps {
  label: string
  value: number
  variant: 'received' | 'pending'
  badge?: {
    icon: IconName
    text: string
  }
}

export function FinancialBentoCard({ label, value, variant, badge }: FinancialBentoCardProps) {
  const isReceived = variant === 'received'

  return (
    <div
      className={cn(
        'bg-surface-container-lowest p-6 lg:p-8 rounded-3xl shadow-[0_12px_32px_rgba(25,27,35,0.06)]',
        'border-l-8 flex flex-col gap-2',
        isReceived ? 'border-secondary' : 'border-tertiary-fixed-dim'
      )}
    >
      <span className="text-on-surface-variant/70 font-bold text-[10px] uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter break-all',
            isReceived ? 'text-secondary' : 'text-tertiary-container'
          )}
        >
          {formatCurrency(value)}
        </span>
      </div>
      {badge && (
        <div
          className={cn(
            'flex items-center gap-1.5 mt-3 text-xs font-bold w-fit px-3 py-1 rounded-full',
            isReceived
              ? 'text-secondary bg-secondary-container/40'
              : 'text-tertiary-container bg-tertiary-fixed/50'
          )}
        >
          <Icon name={badge.icon} className="text-sm" />
          <span>{badge.text}</span>
        </div>
      )}
    </div>
  )
}

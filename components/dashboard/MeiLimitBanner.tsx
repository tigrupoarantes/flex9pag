import { Icon } from '@/components/ui/icon'
import { formatCurrency, getMeiLimitPercentage, MEI_ANNUAL_LIMIT } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MeiLimitBannerProps {
  annualRevenue: number
}

/**
 * Banner de alerta de limite MEI (PRD-Func 5.1).
 * - < 80%: não renderiza
 * - 80–99%: âmbar
 * - ≥ 100%: vermelho bloqueante
 */
export function MeiLimitBanner({ annualRevenue }: MeiLimitBannerProps) {
  const pct = getMeiLimitPercentage(annualRevenue)
  if (pct < 80) return null

  const isOver = annualRevenue >= MEI_ANNUAL_LIMIT

  return (
    <div
      className={cn(
        'rounded-2xl p-4 flex items-start gap-3 border',
        isOver
          ? 'bg-error-container border-error/20 text-on-error-container'
          : 'bg-tertiary-fixed border-tertiary-fixed-dim/40 text-on-tertiary-fixed-variant'
      )}
    >
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          isOver ? 'bg-error/15' : 'bg-tertiary-fixed-dim/40'
        )}
      >
        <Icon name="warning" filled className="text-2xl" />
      </div>
      <div className="flex-1 min-w-0">
        {isOver ? (
          <>
            <p className="font-bold text-sm">Você ultrapassou o limite MEI!</p>
            <p className="text-xs mt-1 opacity-90">
              Procure um contador urgente. Você faturou{' '}
              <strong>{formatCurrency(annualRevenue)}</strong> este ano (limite:{' '}
              {formatCurrency(MEI_ANNUAL_LIMIT)}).
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-sm">
              Você está em {pct.toFixed(0)}% do limite MEI
            </p>
            <p className="text-xs mt-1 opacity-90">
              Cuidado para não passar de {formatCurrency(MEI_ANNUAL_LIMIT)} no ano.
              Faturado: <strong>{formatCurrency(annualRevenue)}</strong>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

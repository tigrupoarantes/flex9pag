'use client'

import { Check, X } from 'lucide-react'
import type { Plan } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'

interface AdminPlanosListProps {
  plans: Plan[]
}

export function AdminPlanosList({ plans }: AdminPlanosListProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl border border-border p-6 bg-background',
              !plan.active && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums mt-1">
                  {plan.price_monthly === 0 ? 'Grátis' : formatCurrency(plan.price_monthly)}
                </p>
                {plan.price_monthly > 0 && (
                  <p className="text-xs text-muted-foreground">por mês</p>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  plan.active ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {plan.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 text-success shrink-0" strokeWidth={2.5} />
                {plan.max_nfse_per_month === null
                  ? 'NFS-e ilimitada'
                  : `${plan.max_nfse_per_month} NFS-e por mês`}
              </li>
              {plan.features &&
                Object.entries(plan.features).map(([feat, enabled]) => (
                  <li
                    key={feat}
                    className={cn(
                      'flex items-center gap-2',
                      enabled ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    )}
                  >
                    {enabled ? (
                      <Check className="size-4 text-success shrink-0" strokeWidth={2.5} />
                    ) : (
                      <X className="size-4 text-muted-foreground/40 shrink-0" strokeWidth={2} />
                    )}
                    <span className={!enabled ? 'line-through' : ''}>{feat}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        Para alterar planos, edite diretamente no Supabase Studio.
      </p>
    </>
  )
}

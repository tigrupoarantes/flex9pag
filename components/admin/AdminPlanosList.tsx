'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, X, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { EditPlanoSheet } from './EditPlanoSheet'

interface AdminPlanosListProps {
  initialPlans: Plan[]
}

const FEATURE_LABELS: Record<string, string> = {
  payment_links: 'Links de pagamento',
  nfse: 'Notas fiscais',
  das: 'Controle de DAS',
  reports: 'Relatórios',
}

export function AdminPlanosList({ initialPlans }: AdminPlanosListProps) {
  const supabase = createClient()
  const [selected, setSelected] = useState<Plan | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_monthly', { ascending: true })
      if (error) throw error
      return data as Plan[]
    },
    initialData: initialPlans,
    initialDataUpdatedAt: Date.now(),
    staleTime: 1000 * 60 * 2,
  })

  function handleEdit(plan: Plan) {
    setSelected(plan)
    setSheetOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl border border-border p-6 bg-background flex flex-col',
              !plan.active && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums mt-1">
                  {plan.price_monthly === 0
                    ? 'Grátis'
                    : formatCurrency(plan.price_monthly)}
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

            <ul className="space-y-2 text-sm flex-1">
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
                      <Check
                        className="size-4 text-success shrink-0"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <X
                        className="size-4 text-muted-foreground/40 shrink-0"
                        strokeWidth={2}
                      />
                    )}
                    <span className={!enabled ? 'line-through' : ''}>
                      {FEATURE_LABELS[feat] ?? feat}
                    </span>
                  </li>
                ))}
            </ul>

            <button
              type="button"
              onClick={() => handleEdit(plan)}
              className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline self-start"
            >
              <Pencil className="size-4" strokeWidth={2.25} />
              Editar
            </button>
          </div>
        ))}
      </div>

      <EditPlanoSheet
        plan={selected}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelected(null)
        }}
      />
    </>
  )
}

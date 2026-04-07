'use client'

import { CheckCircle, X } from 'lucide-react'
import type { Plan } from '@/lib/types'

interface AdminPlanosListProps {
  plans: Plan[]
}

export function AdminPlanosList({ plans }: AdminPlanosListProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl border p-5 space-y-3 ${
              plan.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg">{plan.name}</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {plan.price_monthly === 0
                    ? 'Grátis'
                    : `R$ ${plan.price_monthly.toFixed(2).replace('.', ',')}
                  `}
                  {plan.price_monthly > 0 && (
                    <span className="text-sm font-normal text-gray-500">/mês</span>
                  )}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {plan.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {plan.max_nfse_per_month === null ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 flex items-center justify-center flex-shrink-0 text-gray-500 text-xs font-bold">
                    {plan.max_nfse_per_month}
                  </span>
                )}
                NFS-e por mês{plan.max_nfse_per_month === null ? ' (ilimitado)' : ''}
              </div>

              {plan.features && Object.entries(plan.features).map(([feat, enabled]) => (
                <div key={feat} className="flex items-center gap-2 text-gray-600">
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={enabled ? '' : 'text-gray-400'}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Para alterar planos, edite diretamente no Supabase Studio.
      </p>
    </div>
  )
}

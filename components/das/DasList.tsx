'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { DasPayment } from '@/lib/types'

interface DasListProps {
  das: DasPayment[]
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function getMonthLabel(competenceMonth: string) {
  const [year, month] = competenceMonth.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
}

function StatusIcon({ status }: { status: DasPayment['status'] }) {
  if (status === 'paid') return <CheckCircle className="h-5 w-5 text-green-600" />
  if (status === 'overdue') return <AlertCircle className="h-5 w-5 text-red-500" />
  return <Clock className="h-5 w-5 text-amber-500" />
}

function StatusLabel({ status }: { status: DasPayment['status'] }) {
  if (status === 'paid') return <span className="text-green-700 font-medium text-sm">Pago</span>
  if (status === 'overdue') return <span className="text-red-600 font-medium text-sm">Vencido</span>
  return <span className="text-amber-600 font-medium text-sm">Pendente</span>
}

export function DasList({ das }: DasListProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('das_payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('DAS marcado como pago!')
      queryClient.invalidateQueries({ queryKey: ['das'] })
      window.location.reload()
    },
    onError: () => toast.error('Erro ao atualizar. Tente novamente.'),
  })

  const paid = das.filter(d => d.status === 'paid').length
  const total = das.length

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Resumo */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-700 font-medium">Guias pagas em 2026</p>
          <p className="text-2xl font-bold text-blue-900">{paid} de {total}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-600">Valor mensal</p>
          <p className="text-lg font-bold text-blue-800">R$ 75,60</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Vencimento todo dia 20 do mês seguinte à competência
      </p>

      {/* Lista */}
      <div className="space-y-2">
        {das.map((item) => {
          const [year, month] = item.competence_month.split('-').map(Number)
          const isCurrentOrFuture = year > currentYear || (year === currentYear && month >= currentMonth)
          const isExpanded = expandedId === item.id

          return (
            <div
              key={item.id}
              className={`rounded-xl border ${
                item.status === 'paid'
                  ? 'bg-white border-gray-200'
                  : item.status === 'overdue'
                  ? 'bg-red-50 border-red-200'
                  : isCurrentOrFuture && month === currentMonth
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <StatusIcon status={item.status} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{getMonthLabel(item.competence_month)}</p>
                  <p className="text-xs text-gray-500">
                    Vence {new Date(item.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-bold text-sm">{formatCurrency(item.amount ?? 75.6)}</p>
                  <StatusLabel status={item.status} />
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {isExpanded && item.status !== 'paid' && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                  {item.status === 'overdue' && (
                    <p className="text-xs text-red-600 bg-red-100 rounded-lg p-2">
                      Esta guia está vencida. Pague o mais rápido possível para evitar multas.
                    </p>
                  )}
                  <Button
                    className="w-full h-12 gap-2"
                    onClick={() => markPaid.mutate(item.id)}
                    disabled={markPaid.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como pago
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Pague no app do seu banco usando o código de barras da guia DAS
                  </p>
                </div>
              )}

              {isExpanded && item.status === 'paid' && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-green-700 text-center">
                    Pago em {item.paid_at
                      ? new Date(item.paid_at).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-700">O que é o DAS?</p>
        <p>DAS é o imposto mensal do MEI — R$ 75,60/mês para serviços.</p>
        <p>Pague até o dia 20 do mês seguinte para evitar multa.</p>
      </div>
    </div>
  )
}
